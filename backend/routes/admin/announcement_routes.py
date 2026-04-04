from datetime import datetime, timedelta

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import and_, or_

from database.models import User, db
from models.announcement import Announcement
from models.announcement_read import AnnouncementRead
from models.announcement_target import AnnouncementTarget
from services.notification_service import NotificationService

admin_announcements_bp = Blueprint("admin_announcements", __name__)

VALID_STATUSES = {"Draft", "Scheduled", "Published", "Expired", "Archived"}
VALID_PRIORITIES = {"Low", "Medium", "High", "Critical"}
VALID_CATEGORIES = ("System", "Policy", "Emergency", "General")
ANNOUNCEMENT_AUDIENCE_MATRIX = (
    ("all_users", [{"type": "All", "value": None}]),
    ("all_doctors", [{"type": "Role", "value": "doctor"}]),
    ("all_patients", [{"type": "Role", "value": "patient"}]),
    ("admin_only", [{"type": "Audience", "value": "admin_only"}]),
    ("monitoring_doctors", [{"type": "Audience", "value": "monitoring_doctors"}]),
    ("suspended_doctors", [{"type": "Audience", "value": "suspended_doctors"}]),
)


def _to_int_identity(identity):
    try:
        return int(identity)
    except (TypeError, ValueError):
        return None


def _require_admin_user():
    current_user_id = _to_int_identity(get_jwt_identity())
    if not current_user_id:
        return None, (jsonify({"msg": "Invalid auth identity"}), 401)

    user = User.query.get(current_user_id)
    role = (user.role or "").strip().lower() if user else ""
    if not user or role not in ("admin", "super_admin"):
        return None, (jsonify({"msg": "Admin access required"}), 403)
    return user, None


def _parse_iso_datetime(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(str(value).replace("Z", ""))
    except Exception:
        return None


def _normalize_status(value, publish_at):
    status = (value or "Draft").title()
    if status not in VALID_STATUSES:
        status = "Draft"
    if status == "Scheduled" and (not publish_at or publish_at <= datetime.utcnow()):
        status = "Draft"
    return status


def _normalize_priority(value):
    priority = (value or "Low").title()
    return priority if priority in VALID_PRIORITIES else "Low"


def _get_seed_target_users():
    doctor_user = (
        User.query.filter(
            User.is_deleted == False,
            User.role.ilike("doctor"),
        )
        .order_by(User.id.asc())
        .first()
    )
    patient_user = (
        User.query.filter(
            User.is_deleted == False,
            User.role.ilike("patient"),
        )
        .order_by(User.id.asc())
        .first()
    )
    return doctor_user, patient_user


def _build_seed_targets(audience_key, doctor_user, patient_user):
    if audience_key == "specific_doctor" and doctor_user:
        return [
            {"type": "Audience", "value": "specific_doctor"},
            {"type": "User", "value": str(doctor_user.id)},
        ]
    if audience_key == "specific_patient" and patient_user:
        return [
            {"type": "Audience", "value": "specific_patient"},
            {"type": "User", "value": str(patient_user.id)},
        ]
    for key, targets in ANNOUNCEMENT_AUDIENCE_MATRIX:
        if key == audience_key:
            return targets
    return [{"type": "All", "value": None}]


def _audience_key_from_targets(targets):
    if not targets:
        return "all_users"

    target_pairs = {(t.target_type, t.target_value or "") for t in targets}
    if ("Audience", "specific_doctor") in target_pairs:
        return "specific_doctor"
    if ("Audience", "specific_patient") in target_pairs:
        return "specific_patient"
    if ("Audience", "monitoring_doctors") in target_pairs:
        return "monitoring_doctors"
    if ("Audience", "suspended_doctors") in target_pairs:
        return "suspended_doctors"
    if ("Audience", "admin_only") in target_pairs:
        return "admin_only"
    if ("All", "") in target_pairs or ("All", None) in target_pairs:
        return "all_users"
    if ("Role", "doctor") in target_pairs:
        return "all_doctors"
    if ("Role", "patient") in target_pairs:
        return "all_patients"
    return "all_users"


def _seed_announcement_matrix(admin_user, only_if_empty=False):
    if only_if_empty and Announcement.query.count() > 0:
        return 0

    doctor_user, patient_user = _get_seed_target_users()
    audience_keys = [
        "all_users",
        "all_doctors",
        "all_patients",
        "admin_only",
        "monitoring_doctors",
        "suspended_doctors",
    ]
    if doctor_user:
        audience_keys.append("specific_doctor")
    if patient_user:
        audience_keys.append("specific_patient")

    existing_signatures = set()
    for row in Announcement.query.all():
        existing_signatures.add(
            (
                row.status or "",
                row.priority or "",
                row.category or "",
                bool(row.is_pinned),
                bool(row.require_acknowledgement),
                _audience_key_from_targets(row.targets),
            )
        )

    now = datetime.utcnow().replace(microsecond=0)
    created = 0

    for status in ("Draft", "Scheduled", "Published", "Expired", "Archived"):
        for priority in ("Low", "Medium", "High", "Critical"):
            for category in VALID_CATEGORIES:
                for audience_key in audience_keys:
                    is_pinned = priority == "Critical"
                    require_ack = priority in ("High", "Critical") or category == "Policy"
                    signature = (
                        status,
                        priority,
                        category,
                        bool(is_pinned),
                        bool(require_ack),
                        audience_key,
                    )
                    if signature in existing_signatures:
                        continue

                    publish_at = None
                    expiry_at = None
                    if status == "Scheduled":
                        publish_at = now + timedelta(hours=2)
                    elif status == "Published":
                        publish_at = now
                    elif status == "Expired":
                        publish_at = now.replace(day=now.day)
                        expiry_at = now
                    elif status == "Archived":
                        publish_at = now
                        expiry_at = now

                    title = f"{category} {priority} {status} | {audience_key.replace('_', ' ').title()}"
                    content = (
                        f"Demo announcement for {category.lower()} communication, "
                        f"{priority.lower()} priority, {status.lower()} lifecycle, "
                        f"targeted to {audience_key.replace('_', ' ')}."
                    )
                    announcement = Announcement(
                        title=title,
                        content=content,
                        category=category,
                        priority=priority,
                        status=status,
                        publish_at=publish_at,
                        expiry_at=expiry_at,
                        created_by=admin_user.id,
                        updated_by=admin_user.id,
                        is_pinned=is_pinned,
                        require_acknowledgement=require_ack,
                    )
                    db.session.add(announcement)
                    db.session.flush()

                    for target in _build_seed_targets(audience_key, doctor_user, patient_user):
                        db.session.add(
                            AnnouncementTarget(
                                announcement_id=announcement.id,
                                target_type=target["type"],
                                target_value=target["value"],
                            )
                        )

                    existing_signatures.add(signature)
                    created += 1

    if created:
        db.session.commit()
    return created


def _normalize_targets(data):
    targets = data.get("targets") or []
    if isinstance(targets, dict):
        targets = [targets]

    # New audience field from admin UI.
    audience = (data.get("audience") or "").strip()
    audience_user_id = data.get("audience_user_id")
    if audience:
        targets = []
        aud = audience.lower()
        if aud == "all_users":
            targets.append({"type": "All", "value": None})
        elif aud == "all_doctors":
            targets.append({"type": "Role", "value": "doctor"})
        elif aud == "all_patients":
            targets.append({"type": "Role", "value": "patient"})
        elif aud == "admin_only":
            targets.append({"type": "Role", "value": "admin"})
            targets.append({"type": "Role", "value": "super_admin"})
        elif aud == "suspended_doctors":
            targets.append({"type": "Audience", "value": "suspended_doctors"})
        elif aud == "monitoring_doctors":
            targets.append({"type": "Audience", "value": "monitoring_doctors"})
        elif aud == "specific_doctor" and audience_user_id:
            targets.append({"type": "Audience", "value": "specific_doctor"})
            targets.append({"type": "User", "value": str(audience_user_id)})
        elif aud == "specific_patient" and audience_user_id:
            targets.append({"type": "Audience", "value": "specific_patient"})
            targets.append({"type": "User", "value": str(audience_user_id)})
        else:
            targets.append({"type": "All", "value": None})

    cleaned = []
    for t in targets:
        t_type = (t.get("type") or "All").strip()
        t_value = t.get("value")
        if t_value is not None:
            t_value = str(t_value).strip()
        cleaned.append({"type": t_type, "value": t_value or None})

    return cleaned or [{"type": "All", "value": None}]


def _resolve_target_user_ids(targets):
    target_ids = set()
    if not targets:
        targets = [{"type": "All", "value": None}]

    for t in targets:
        t_type = (t.get("type") or "").strip()
        t_val = (t.get("value") or "").strip()
        t_val_lower = t_val.lower()

        if t_type == "All":
            users = User.query.filter_by(is_deleted=False).all()
            target_ids.update(u.id for u in users)
        elif t_type == "Role":
            users = User.query.filter(
                User.is_deleted == False, User.role.ilike(t_val or "patient")
            ).all()
            target_ids.update(u.id for u in users)
        elif t_type == "User":
            uid = _to_int_identity(t_val)
            if uid:
                user = User.query.get(uid)
                if user and not user.is_deleted:
                    target_ids.add(user.id)
        elif t_type == "Audience":
            if t_val_lower == "suspended_doctors":
                users = User.query.filter(
                    User.is_deleted == False,
                    User.role.ilike("doctor"),
                    User.account_status == "suspended",
                ).all()
                target_ids.update(u.id for u in users)
            elif t_val_lower == "monitoring_doctors":
                # Monitoring may be represented by profile-level status in some envs.
                # For compatibility, we include active doctors for now.
                users = User.query.filter(
                    User.is_deleted == False,
                    User.role.ilike("doctor"),
                    User.account_status == "active",
                ).all()
                target_ids.update(u.id for u in users)
            elif t_val_lower == "specific_doctor":
                # User target is expected in companion "User" target.
                continue
            elif t_val_lower == "specific_patient":
                continue
            elif t_val_lower == "all_users":
                users = User.query.filter_by(is_deleted=False).all()
                target_ids.update(u.id for u in users)
            elif t_val_lower == "all_doctors":
                users = User.query.filter(
                    User.is_deleted == False, User.role.ilike("doctor")
                ).all()
                target_ids.update(u.id for u in users)
            elif t_val_lower == "all_patients":
                users = User.query.filter(
                    User.is_deleted == False, User.role.ilike("patient")
                ).all()
                target_ids.update(u.id for u in users)
            elif t_val_lower == "admin_only":
                users = User.query.filter(
                    User.is_deleted == False,
                    or_(User.role.ilike("admin"), User.role.ilike("super_admin")),
                ).all()
                target_ids.update(u.id for u in users)

    return list(target_ids)


def _compute_announcement_metrics(announcement):
    reads_q = AnnouncementRead.query.filter_by(announcement_id=announcement.id)
    views_count = reads_q.filter_by(is_read=True).count()
    ack_count = reads_q.filter_by(acknowledged=True).count()
    target_users = _resolve_target_user_ids(
        [{"type": t.target_type, "value": t.target_value} for t in announcement.targets]
    )
    target_users_count = len(target_users)
    unread_count = max(target_users_count - views_count, 0)

    d = announcement.to_dict()
    d["acknowledged_count"] = ack_count
    d["target_users_count"] = target_users_count
    d["unread_count"] = unread_count
    return d


def _send_announcement_notifications(announcement, targets, send_notification, send_email):
    if announcement.status != "Published":
        return
    if not send_notification and not send_email:
        return

    target_ids = _resolve_target_user_ids(targets)
    for tid in target_ids:
        try:
            NotificationService.send_in_app(
                user_id=tid,
                title=f"System Update: {announcement.title}",
                message=announcement.title,
                notif_type="announcement",
                email_subject=f"NeuroNest: {announcement.title}" if send_email else None,
            )
        except Exception as e:
            print(f"[ANNOUNCEMENT] notification failure user={tid}: {e}")


def _auto_transition_announcement_statuses():
    now = datetime.utcnow()
    changed = False
    scheduled_to_publish = Announcement.query.filter(
        Announcement.status == "Scheduled",
        Announcement.publish_at.isnot(None),
        Announcement.publish_at <= now,
    ).all()
    for a in scheduled_to_publish:
        a.status = "Published"
        changed = True

    publish_to_expired = Announcement.query.filter(
        Announcement.status == "Published",
        Announcement.expiry_at.isnot(None),
        Announcement.expiry_at < now,
    ).all()
    for a in publish_to_expired:
        a.status = "Expired"
        changed = True

    if changed:
        db.session.commit()


@admin_announcements_bp.route("/", methods=["GET"])
@jwt_required()
def get_all_announcements():
    user, err = _require_admin_user()
    if err:
        return err
    if Announcement.query.count() == 0:
        try:
            _seed_announcement_matrix(user, only_if_empty=True)
        except Exception:
            db.session.rollback()

    _auto_transition_announcement_statuses()

    search = (request.args.get("search") or "").strip().lower()
    status = (request.args.get("status") or "").strip().title()
    priority = (request.args.get("priority") or "").strip().title()
    category = (request.args.get("category") or "").strip()
    audience = (request.args.get("audience") or "").strip().lower()

    query = Announcement.query.order_by(Announcement.created_at.desc())
    if status:
        query = query.filter(Announcement.status == status)
    if priority:
        query = query.filter(Announcement.priority == priority)
    if category:
        query = query.filter(Announcement.category.ilike(category))

    rows = query.all()

    filtered = []
    for a in rows:
        item = _compute_announcement_metrics(a)

        if search:
            hay = f"{item.get('title', '')} {item.get('content', '')} {item.get('category', '')}".lower()
            if search not in hay:
                continue

        if audience:
            targets = item.get("targets", [])
            target_flat = " ".join(
                f"{(t.get('target_type') or '').lower()}:{(t.get('target_value') or '').lower()}" for t in targets
            )
            if audience not in target_flat:
                continue

        filtered.append(item)

    stats = {
        "total_posts": len(filtered),
        "published": len([a for a in filtered if a.get("status") == "Published"]),
        "scheduled": len([a for a in filtered if a.get("status") == "Scheduled"]),
        "archived": len([a for a in filtered if a.get("status") == "Archived"]),
        "total_views": sum(int(a.get("views_count", 0) or 0) for a in filtered),
        "unread": sum(int(a.get("unread_count", 0) or 0) for a in filtered),
    }

    return jsonify({"items": filtered, "stats": stats}), 200


@admin_announcements_bp.route("/seed-combinations", methods=["POST"])
@jwt_required()
def seed_announcement_combinations():
    user, err = _require_admin_user()
    if err:
        return err

    try:
        created = _seed_announcement_matrix(user, only_if_empty=False)
        return jsonify({"message": "Announcement combinations seeded", "created": created}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@admin_announcements_bp.route("/", methods=["POST"])
@jwt_required()
def create_announcement():
    user, err = _require_admin_user()
    if err:
        return err

    data = request.json or {}
    title = (data.get("title") or "").strip()
    content = (data.get("content") or "").strip()
    if not title or not content:
        return jsonify({"error": "title and content are required"}), 400

    publish_at = _parse_iso_datetime(data.get("publish_at"))
    expiry_at = _parse_iso_datetime(data.get("expiry_at"))
    status = _normalize_status(data.get("status"), publish_at)
    if publish_at and publish_at > datetime.utcnow() and status == "Published":
        status = "Scheduled"

    targets = _normalize_targets(data)
    send_notification = bool(data.get("send_notification", True))
    send_email = bool(data.get("send_email", False))

    try:
        announcement = Announcement(
            title=title,
            content=content,
            category=(data.get("category") or "General").strip() or "General",
            priority=_normalize_priority(data.get("priority")),
            status=status,
            publish_at=publish_at,
            expiry_at=expiry_at,
            created_by=user.id,
            updated_by=user.id,
            is_pinned=bool(data.get("is_pinned", False)),
            require_acknowledgement=bool(data.get("require_acknowledgement", False)),
        )
        db.session.add(announcement)
        db.session.flush()

        for t in targets:
            db.session.add(
                AnnouncementTarget(
                    announcement_id=announcement.id,
                    target_type=t["type"],
                    target_value=t["value"],
                )
            )
        db.session.commit()

        _send_announcement_notifications(
            announcement=announcement,
            targets=targets,
            send_notification=send_notification,
            send_email=send_email,
        )

        return jsonify(_compute_announcement_metrics(announcement)), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@admin_announcements_bp.route("/<int:announcement_id>", methods=["PUT"])
@jwt_required()
def update_announcement(announcement_id):
    user, err = _require_admin_user()
    if err:
        return err

    announcement = Announcement.query.get_or_404(announcement_id)
    data = request.json or {}

    try:
        if data.get("title") is not None:
            announcement.title = (data.get("title") or "").strip() or announcement.title
        if data.get("content") is not None:
            announcement.content = (data.get("content") or "").strip() or announcement.content
        if data.get("category") is not None:
            announcement.category = (data.get("category") or "General").strip() or "General"
        if data.get("priority") is not None:
            announcement.priority = _normalize_priority(data.get("priority"))

        if "publish_at" in data:
            announcement.publish_at = _parse_iso_datetime(data.get("publish_at"))
        if "expiry_at" in data:
            announcement.expiry_at = _parse_iso_datetime(data.get("expiry_at"))

        if "status" in data:
            announcement.status = _normalize_status(data.get("status"), announcement.publish_at)
            if (
                announcement.status == "Published"
                and announcement.publish_at
                and announcement.publish_at > datetime.utcnow()
            ):
                announcement.status = "Scheduled"

        if "is_pinned" in data:
            announcement.is_pinned = bool(data.get("is_pinned"))
        if "require_acknowledgement" in data:
            announcement.require_acknowledgement = bool(data.get("require_acknowledgement"))
        announcement.updated_by = user.id

        targets = None
        if "targets" in data or "audience" in data:
            targets = _normalize_targets(data)
            AnnouncementTarget.query.filter_by(announcement_id=announcement.id).delete()
            for t in targets:
                db.session.add(
                    AnnouncementTarget(
                        announcement_id=announcement.id,
                        target_type=t["type"],
                        target_value=t["value"],
                    )
                )

        db.session.commit()

        _send_announcement_notifications(
            announcement=announcement,
            targets=targets
            or [{"type": t.target_type, "value": t.target_value} for t in announcement.targets],
            send_notification=bool(data.get("send_notification", False)),
            send_email=bool(data.get("send_email", False)),
        )
        return jsonify(_compute_announcement_metrics(announcement)), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@admin_announcements_bp.route("/<int:announcement_id>", methods=["DELETE"])
@jwt_required()
def delete_announcement(announcement_id):
    _, err = _require_admin_user()
    if err:
        return err

    announcement = Announcement.query.get_or_404(announcement_id)
    db.session.delete(announcement)
    db.session.commit()
    return jsonify({"msg": "Announcement deleted"}), 200


@admin_announcements_bp.route("/<int:announcement_id>/status", methods=["PATCH"])
@jwt_required()
def patch_announcement_status(announcement_id):
    user, err = _require_admin_user()
    if err:
        return err

    announcement = Announcement.query.get_or_404(announcement_id)
    data = request.json or {}
    if "status" not in data:
        return jsonify({"msg": "Status required"}), 400

    status = _normalize_status(data.get("status"), announcement.publish_at)
    if status == "Published" and announcement.publish_at and announcement.publish_at > datetime.utcnow():
        status = "Scheduled"

    announcement.status = status
    announcement.updated_by = user.id
    db.session.commit()

    return jsonify(_compute_announcement_metrics(announcement)), 200
