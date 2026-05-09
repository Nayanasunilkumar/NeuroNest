#!/usr/bin/env python3
"""
Purge all known seed/test patient accounts from the database.

Dry run (safe, no changes):
    python dev_tools/purge_seed_patients.py

Execute (permanent delete — cannot be undone):
    python dev_tools/purge_seed_patients.py --execute
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

from sqlalchemy import MetaData, create_engine, func, select, tuple_
from sqlalchemy.exc import SQLAlchemyError

BACKEND_DIR = Path(__file__).resolve().parents[1]

# ──────────────────────────────────────────────────────────────────────────────
# ALL known seed / test patient emails.
# Add any new ones here before running.
# ──────────────────────────────────────────────────────────────────────────────
SEED_EMAILS: list[str] = [
    # From seed_data.py
    "patient.one@example.com",
    "patient.two@example.com",
    # From screenshot / manual test accounts
    "pete.parker@test.com",
    "bruce.wayne@test.com",
    "mary.jane@test.com",
    "naveen@gmail.com",
    "rohan.das.demo@neuronest.test",  # Anjali
]

# Emails that must NEVER be deleted regardless of what is above
PROTECTED_EMAILS: set[str] = {
    "nayanasunilkumar8@gmail.com",   # Dr. Naina
    "nayanasurukumar8@gmail.com",    # Dr. Nehiyan
    "nezrinnoushad20@gmail.com",     # Real patient – Nezrin
    "suhanashamsak@gmail.com",       # Real patient – Suhana
}


def load_dotenv_if_available() -> None:
    try:
        from dotenv import load_dotenv
    except ImportError:
        return
    load_dotenv(BACKEND_DIR / ".env")


def redact_url(url: str) -> str:
    if "@" not in url or "://" not in url:
        return url
    scheme, rest = url.split("://", 1)
    _, host = rest.rsplit("@", 1)
    user = rest.split(":")[0]
    return f"{scheme}://{user}:***@{host}"


def fk_condition(child_table, fk, parent_condition):
    child_cols = [element.parent for element in fk.elements]
    parent_cols = [element.column for element in fk.elements]
    parent_select = select(*parent_cols).where(parent_condition)
    if len(child_cols) == 1:
        return child_cols[0].in_(parent_select)
    return tuple_(*child_cols).in_(parent_select)


def count_rows(conn, table, condition) -> int:
    return conn.execute(select(func.count()).select_from(table).where(condition)).scalar_one()


def same_table(left, right) -> bool:
    return left.name == right.name and (left.schema or "") == (right.schema or "")


def delete_dependents(conn, metadata, parent_table, parent_condition, dry_run, totals, visited_edges):
    for child_table in metadata.sorted_tables:
        for fk in child_table.foreign_key_constraints:
            if not same_table(fk.referred_table, parent_table):
                continue
            local_key = ",".join(e.parent.name for e in fk.elements)
            remote_key = ",".join(e.column.name for e in fk.elements)
            edge_key = (parent_table.name, child_table.name, fk.name or f"{local_key}->{remote_key}")
            if edge_key in visited_edges:
                continue
            path_edges = visited_edges | {edge_key}
            condition = fk_condition(child_table, fk, parent_condition)
            local_cols = [e.parent for e in fk.elements]

            if child_table is parent_table or all(col.nullable for col in local_cols):
                row_count = count_rows(conn, child_table, condition)
                if row_count:
                    label = f"{child_table.name} (nullify FK)"
                    totals[label] = totals.get(label, 0) + row_count
                    if not dry_run:
                        conn.execute(
                            child_table.update()
                            .where(condition)
                            .values({col.key: None for col in local_cols})
                        )
                continue

            delete_dependents(conn, metadata, child_table, condition, dry_run, totals, path_edges)
            row_count = count_rows(conn, child_table, condition)
            if row_count:
                totals[child_table.name] = totals.get(child_table.name, 0) + row_count
                if not dry_run:
                    conn.execute(child_table.delete().where(condition))


def main() -> int:
    parser = argparse.ArgumentParser(description="Purge seed/test patient accounts.")
    parser.add_argument("--database-url", help="Override DATABASE_URL env var.")
    parser.add_argument("--execute", action="store_true", help="Commit changes. Default is dry-run.")
    args = parser.parse_args()

    load_dotenv_if_available()
    database_url = args.database_url or os.getenv("DATABASE_URL")
    if not database_url:
        raise SystemExit("DATABASE_URL is not set.")

    # Safety: remove any protected emails from the target list
    target_emails = [e for e in SEED_EMAILS if e.lower() not in PROTECTED_EMAILS]

    engine = create_engine(database_url, future=True, pool_pre_ping=True)
    metadata = MetaData()

    try:
        with engine.begin() as conn:
            metadata.reflect(bind=conn)
            users = metadata.tables.get("users")
            if users is None:
                raise SystemExit("No 'users' table found in database.")

            # Find matching rows
            rows = conn.execute(
                select(users.c.id, users.c.email, users.c.role, users.c.full_name)
                .where(users.c.email.in_(target_emails))
                .order_by(users.c.id)
            ).mappings().all()

            if not rows:
                print("✅ No seed/test accounts found. Database is already clean.")
                return 0

            print(f"\nDatabase: {redact_url(database_url)}")
            print(f"\n{'[DRY RUN] ' if not args.execute else ''}Found {len(rows)} seed account(s) to delete:\n")
            for r in rows:
                protected = r["email"].lower() in PROTECTED_EMAILS
                flag = " ⛔ PROTECTED – SKIPPING" if protected else ""
                print(f"  id={r['id']:>4}  role={r['role']:<10} email={r['email']}{flag}")

            user_ids = [r["id"] for r in rows if r["email"].lower() not in PROTECTED_EMAILS]
            if not user_ids:
                print("\n⚠️  All matched accounts are protected. Nothing to delete.")
                return 0

            user_condition = users.c.id.in_(user_ids)
            dry_run = not args.execute
            totals: dict[str, int] = {}

            delete_dependents(conn, metadata, users, user_condition, dry_run, totals, set())
            row_count = count_rows(conn, users, user_condition)
            totals["users"] = totals.get("users", 0) + row_count
            if not dry_run:
                conn.execute(users.delete().where(user_condition))

            print("\n" + ("Planned changes (dry run):" if dry_run else "✅ Committed changes:"))
            for key in sorted(totals):
                print(f"  {key}: {totals[key]} row(s)")

            if dry_run:
                print("\n⚠️  DRY RUN — no changes made. Re-run with --execute to permanently delete.")
                raise RuntimeError("__DRY_RUN_ROLLBACK__")

            remaining = count_rows(conn, users, user_condition)
            print(f"\nRemaining matching users: {remaining}")

    except RuntimeError as exc:
        if str(exc) == "__DRY_RUN_ROLLBACK__":
            return 0
        raise
    except SQLAlchemyError as exc:
        print(f"Database error: {exc}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
