from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.models import db, User
from models.announcement import Announcement
from models.announcement_target import AnnouncementTarget
from datetime import datetime
from services.notification_service import NotificationService

admin_announcements_bp = Blueprint('admin_announcements', __name__)

def admin_required(fn):
    # This is a placeholder for actual admin role check if needed
    # In this project, role is checked via JWT or user object
    return fn

@admin_announcements_bp.route('/', methods=['GET'])
@jwt_required()
def get_all_announcements():
    # Verify admin role
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or user.role != 'admin':
        return jsonify({"msg": "Admin access required"}), 403

    announcements = Announcement.query.order_by(Announcement.created_at.desc()).all()
    return jsonify([a.to_dict() for a in announcements]), 200

@admin_announcements_bp.route('/', methods=['POST'])
@jwt_required()
def create_announcement():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or user.role != 'admin':
        return jsonify({"msg": "Admin access required"}), 403

    data = request.json
    try:
        new_announcement = Announcement(
            title=data.get('title'),
            content=data.get('content'),
            category=data.get('category', 'General'),
            priority=data.get('priority', 'Low'),
            status=data.get('status', 'Draft'),
            publish_at=datetime.fromisoformat(data['publish_at'].replace('Z', '')) if data.get('publish_at') else datetime.utcnow(),
            expiry_at=datetime.fromisoformat(data['expiry_at'].replace('Z', '')) if data.get('expiry_at') else None,
            created_by=user.id,
            is_pinned=data.get('is_pinned', False),
            require_acknowledgement=data.get('require_acknowledgement', False)
        )
        db.session.add(new_announcement)
        db.session.flush() # Get ID for targets

        # Add targets
        targets = data.get('targets', [])
        if not targets:
            # Default target to All if none provided
            new_target = AnnouncementTarget(
                announcement_id=new_announcement.id,
                target_type='All'
            )
            db.session.add(new_target)
        else:
            for t in targets:
                new_target = AnnouncementTarget(
                    announcement_id=new_announcement.id,
                    target_type=t.get('type'),
                    target_value=t.get('value')
                )
                db.session.add(new_target)

        db.session.commit()

        # ── PUSH NOTIFICATIONS ──
        if new_announcement.status == 'Published':
            # Identify targeted users
            target_ids = []
            if not targets or any(t.get('type') == 'All' for t in targets):
                # Notify all active patients
                all_patients = User.query.filter_by(role='patient', is_deleted=False).all()
                target_ids = [u.id for u in all_patients]
            else:
                for t in targets:
                    if t.get('type') == 'Role':
                        users_with_role = User.query.filter_by(role=t.get('value'), is_deleted=False).all()
                        target_ids.extend([u.id for u in users_with_role])
                    elif t.get('type') == 'User':
                        target_ids.append(int(t.get('value')))
            
            # Remove duplicates
            target_ids = list(set(target_ids))
            
            # Send (NotificationService handles individual preferences)
            print(f"[ANN_P_NOTIF] Target Users: {target_ids}")
            for tid in target_ids:
                try:
                    NotificationService.send_in_app(
                        user_id=tid,
                        title=f"System Update: {new_announcement.title}",
                        message=new_announcement.title, # Use title for brief message
                        notif_type="announcement",
                        email_subject=f"NeuroNest: {new_announcement.title}"
                    )
                except Exception as ne:
                    print(f"[ANN_P_NOTIF] Errror during announcement notification to user {tid}: {ne}")

        return jsonify(new_announcement.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@admin_announcements_bp.route('/<int:announcement_id>', methods=['PUT'])
@jwt_required()
def update_announcement(announcement_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or user.role != 'admin':
        return jsonify({"msg": "Admin access required"}), 403

    announcement = Announcement.query.get_or_404(announcement_id)
    data = request.json

    try:
        announcement.title = data.get('title', announcement.title)
        announcement.content = data.get('content', announcement.content)
        announcement.category = data.get('category', announcement.category)
        announcement.priority = data.get('priority', announcement.priority)
        announcement.status = data.get('status', announcement.status)
        
        if data.get('publish_at'):
            announcement.publish_at = datetime.fromisoformat(data['publish_at'].replace('Z', ''))
        if data.get('expiry_at'):
            announcement.expiry_at = datetime.fromisoformat(data['expiry_at'].replace('Z', ''))
            
        announcement.is_pinned = data.get('is_pinned', announcement.is_pinned)
        announcement.require_acknowledgement = data.get('require_acknowledgement', announcement.require_acknowledgement)
        announcement.updated_by = user.id

        # Update targets if provided
        if 'targets' in data:
            # Remove old targets
            AnnouncementTarget.query.filter_by(announcement_id=announcement.id).delete()
            # Add new targets
            for t in data['targets']:
                new_target = AnnouncementTarget(
                    announcement_id=announcement.id,
                    target_type=t.get('type'),
                    target_value=t.get('value')
                )
                db.session.add(new_target)

        db.session.commit()
        return jsonify(announcement.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@admin_announcements_bp.route('/<int:announcement_id>', methods=['DELETE'])
@jwt_required()
def delete_announcement(announcement_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or user.role != 'admin':
        return jsonify({"msg": "Admin access required"}), 403

    announcement = Announcement.query.get_or_404(announcement_id)
    db.session.delete(announcement)
    db.session.commit()
    return jsonify({"msg": "Announcement deleted"}), 200

@admin_announcements_bp.route('/<int:announcement_id>/status', methods=['PATCH'])
@jwt_required()
def patch_announcement_status(announcement_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or user.role != 'admin':
        return jsonify({"msg": "Admin access required"}), 403

    announcement = Announcement.query.get_or_404(announcement_id)
    data = request.json
    
    if 'status' not in data:
        return jsonify({"msg": "Status required"}), 400
        
    announcement.status = data['status']
    announcement.updated_by = user.id
    db.session.commit()
    
    return jsonify(announcement.to_dict()), 200
