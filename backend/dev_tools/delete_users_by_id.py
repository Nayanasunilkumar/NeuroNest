#!/usr/bin/env python3
"""Safely delete users and dependent rows from the configured database.

Dry run by default:
    python dev_tools/delete_users_by_id.py --ids 20 22

Permanent delete:
    python dev_tools/delete_users_by_id.py --ids 20 22 --execute
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

from sqlalchemy import MetaData, create_engine, func, select, tuple_
from sqlalchemy.exc import SQLAlchemyError


BACKEND_DIR = Path(__file__).resolve().parents[1]


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
    credentials, host = rest.rsplit("@", 1)
    user = credentials.split(":", 1)[0]
    return f"{scheme}://{user}:***@{host}"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Delete users and rows that depend on them, with patient verification."
    )
    parser.add_argument("--ids", nargs="+", type=int, required=True, help="User IDs to delete.")
    parser.add_argument("--database-url", help="Database URL. Defaults to DATABASE_URL.")
    parser.add_argument(
        "--execute",
        action="store_true",
        help="Actually commit the delete. Without this flag, the transaction is rolled back.",
    )
    parser.add_argument(
        "--allow-non-patient",
        action="store_true",
        help="Allow deleting users whose role is not patient.",
    )
    return parser.parse_args()


def get_database_url(args: argparse.Namespace) -> str:
    load_dotenv_if_available()
    database_url = args.database_url or os.getenv("DATABASE_URL")
    if not database_url:
        raise SystemExit("DATABASE_URL is not set. Pass --database-url or export DATABASE_URL.")
    return database_url


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


def delete_dependents(
    conn,
    metadata: MetaData,
    parent_table,
    parent_condition,
    dry_run: bool,
    totals: dict[str, int],
    visited_edges: set[tuple[str, str, str]],
) -> None:
    for child_table in metadata.sorted_tables:
        for fk in child_table.foreign_key_constraints:
            if not same_table(fk.referred_table, parent_table):
                continue

            local_key = ",".join(element.parent.name for element in fk.elements)
            remote_key = ",".join(element.column.name for element in fk.elements)
            edge_key = (parent_table.name, child_table.name, fk.name or f"{local_key}->{remote_key}")
            if edge_key in visited_edges:
                continue
            path_edges = visited_edges | {edge_key}

            condition = fk_condition(child_table, fk, parent_condition)
            local_cols = [element.parent for element in fk.elements]

            if child_table is parent_table or all(col.nullable for col in local_cols):
                row_count = count_rows(conn, child_table, condition)
                if row_count:
                    totals[f"{child_table.name} (set nullable FK to NULL)"] = (
                        totals.get(f"{child_table.name} (set nullable FK to NULL)", 0) + row_count
                    )
                    if not dry_run:
                        conn.execute(
                            child_table.update()
                            .where(condition)
                            .values({col.key: None for col in local_cols})
                        )
                continue

            delete_dependents(
                conn,
                metadata,
                child_table,
                condition,
                dry_run,
                totals,
                path_edges,
            )

            row_count = count_rows(conn, child_table, condition)
            if row_count:
                totals[child_table.name] = totals.get(child_table.name, 0) + row_count
                if not dry_run:
                    conn.execute(child_table.delete().where(condition))


def main() -> int:
    args = parse_args()
    user_ids = sorted(set(args.ids))
    database_url = get_database_url(args)
    engine = create_engine(database_url, future=True, pool_pre_ping=True)
    metadata = MetaData()

    try:
        with engine.begin() as conn:
            metadata.reflect(bind=conn)
            if "users" not in metadata.tables:
                raise SystemExit("The connected database has no users table.")

            users = metadata.tables["users"]
            selected = conn.execute(
                select(users.c.id, users.c.email, users.c.role, users.c.full_name)
                .where(users.c.id.in_(user_ids))
                .order_by(users.c.id)
            ).mappings().all()

            found_ids = {row["id"] for row in selected}
            missing_ids = [user_id for user_id in user_ids if user_id not in found_ids]
            if missing_ids:
                raise SystemExit(f"Missing user IDs: {missing_ids}")

            non_patients = [dict(row) for row in selected if (row["role"] or "").lower() != "patient"]
            if non_patients and not args.allow_non_patient:
                raise SystemExit(f"Refusing to delete non-patient users: {non_patients}")

            print(f"Database: {redact_url(database_url)}")
            print("Matched users:")
            for row in selected:
                print(f"  id={row['id']} role={row['role']} email={row['email']} name={row['full_name']}")

            dry_run = not args.execute
            totals: dict[str, int] = {}

            user_condition = users.c.id.in_(user_ids)
            delete_dependents(conn, metadata, users, user_condition, dry_run, totals, set())
            row_count = count_rows(conn, users, user_condition)
            totals["users"] = totals.get("users", 0) + row_count
            if not dry_run:
                conn.execute(users.delete().where(user_condition))

            print("\nPlanned changes:" if dry_run else "\nCommitted changes:")
            for key in sorted(totals):
                print(f"  {key}: {totals[key]}")

            remaining = count_rows(conn, users, user_condition)
            if dry_run:
                print("\nDry run only. Re-run with --execute to commit these changes.")
                raise RuntimeError("__DRY_RUN_ROLLBACK__")
            print(f"\nRemaining matching users after delete: {remaining}")
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
