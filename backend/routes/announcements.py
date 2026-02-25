from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.models import db, User
from models.announcement import Announcement
from models.announcement_target import AnnouncementTarget
from models.announcement_read import AnnouncementRead
from datetime import datetime
from sqlalchemy import or_, and_

announcements_bp = Blueprint('announcements', __name__)

@announcements_bp.route('/', methods=['GET'])
@jwt_required()
def get_user_announcements():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    # Fetch published announcements targeted at this user or all
    # Also filter by expiry_at
    now = datetime.utcnow()
    
    announcements = Announcement.query.join(AnnouncementTarget).filter(
        Announcement.status == 'Published',
        or_(Announcement.publish_at <= now, Announcement.publish_at == None),
        or_(Announcement.expiry_at >= now, Announcement.expiry_at == None),
        or_(
            AnnouncementTarget.target_type == 'All',
            and_(AnnouncementTarget.target_type == 'Role', AnnouncementTarget.target_value == user.role),
            and_(AnnouncementTarget.target_type == 'User', AnnouncementTarget.target_value == str(user.id))
        )
    ).order_by(Announcement.is_pinned.desc(), Announcement.publish_at.desc()).all()

    # Get read status for this user
    read_entries = AnnouncementRead.query.filter_by(user_id=user.id).all()
    read_map = {r.announcement_id: r for r in read_entries}

    result = []
    for a in announcements:
        a_dict = a.to_dict()
        read_entry = read_map.get(a.id)
        a_dict['is_read'] = read_entry.is_read if read_entry else False
        a_dict['acknowledged'] = read_entry.acknowledged if read_entry else False
        result.append(a_dict)

    return jsonify(result), 200

@announcements_bp.route('/<int:announcement_id>/read', methods=['POST'])
@jwt_required()
def mark_as_read(announcement_id):
    current_user_id = get_jwt_identity()
    
    read_entry = AnnouncementRead.query.filter_by(
        announcement_id=announcement_id,
        user_id=current_user_id
    ).first()

    if not read_entry:
        read_entry = AnnouncementRead(
            announcement_id=announcement_id,
            user_id=current_user_id,
            is_read=True,
            read_at=datetime.utcnow()
        )
        db.session.add(read_entry)
    else:
        read_entry.is_read = True
        read_entry.read_at = datetime.utcnow()

    db.session.commit()
    return jsonify({"msg": "Marked as read"}), 200

@announcements_bp.route('/<int:announcement_id>/acknowledge', methods=['POST'])
@jwt_required()
def acknowledge_announcement(announcement_id):
    current_user_id = get_jwt_identity()
    
    read_entry = AnnouncementRead.query.filter_by(
        announcement_id=announcement_id,
        user_id=current_user_id
    ).first()

    if not read_entry:
        read_entry = AnnouncementRead(
            announcement_id=announcement_id,
            user_id=current_user_id,
            is_read=True,
            acknowledged=True,
            read_at=datetime.utcnow()
        )
        db.session.add(read_entry)
    else:
        read_entry.is_read = True
        read_entry.acknowledged = True
        if not read_entry.read_at:
            read_entry.read_at = datetime.utcnow()

    db.session.commit()
    return jsonify({"msg": "Acknowledged"}), 200

