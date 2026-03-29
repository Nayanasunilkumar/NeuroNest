from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
from database.models import db, User, Appointment, PatientProfile
from models.chat_models import Conversation, Participant, Message, to_utc_iso
from sqlalchemy import and_, or_, desc
from flask_jwt_extended import get_jwt
from services.notification_service import NotificationService

# ... (rest of imports)

chat_bp = Blueprint("chat", __name__)

# =======================================================
# 0. UPLOAD FILE
# =======================================================
@chat_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if file:
        filename = secure_filename(file.filename)
        # Create unique filename
        import time
        filename = f"{int(time.time())}_{filename}"
        
        upload_folder = os.path.join(current_app.root_path, 'uploads/chat')
        os.makedirs(upload_folder, exist_ok=True)
        
        file.save(os.path.join(upload_folder, filename))
        
        # Return URL
        return jsonify({"url": f"/api/chat/uploads/{filename}"}), 201

@chat_bp.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(os.path.join(current_app.root_path, 'uploads/chat'), filename)

# =======================================================
# 1. GET ALL CONVERSATIONS FOR USER
# =======================================================
@chat_bp.route("/", methods=["GET"])
@jwt_required()
def get_conversations():
    current_user_id = int(get_jwt_identity())
    
    # query participants where user_id matches
    # This is a bit complex in SQL.
    # Join Participant -> Conversation
    # And also fetch the OTHER participant
    
    user_participations = Participant.query.filter_by(user_id=current_user_id).all()
    
    results = []
    for p in user_participations:
        conv = Conversation.query.get(p.conversation_id)
        if not conv: continue
        
        # Find other participant
        other_participant = Participant.query.filter(
            Participant.conversation_id == conv.id,
            Participant.user_id != current_user_id
        ).first()
        
        last_message = conv.messages.order_by(Message.created_at.desc()).first()
        
        # Calculate unread count (messages where current user is NOT the sender and is_read is false)
        unread_count = Message.query.filter_by(
            conversation_id=conv.id, 
            is_read=False
        ).filter(Message.sender_id != current_user_id).count()
        
        last_payload = last_message.to_dict() if last_message else None

        results.append({
            "id": conv.id,
            "other_user": {
                "id": other_participant.user.id if other_participant else None,
                "name": other_participant.user.full_name if other_participant and other_participant.user else "Unknown",
                "email": other_participant.user.email if other_participant and other_participant.user else "",
                "role": other_participant.user.role if other_participant and other_participant.user else "patient",
                "profile_image": other_participant.user.patient_profile.profile_image if other_participant and other_participant.user and other_participant.user.patient_profile else None
            },
            "last_message": {
                "content": last_payload["content"],
                "created_at": last_payload["created_at"],
                "is_read": last_payload["is_read"],
                "sender_id": last_payload["sender_id"],
                "type": last_payload["type"],
                "is_deleted": last_payload["is_deleted"],
            } if last_payload else None,
            "unread_count": unread_count
        })
        
    # Sort by last message date
    results.sort(key=lambda x: (x['last_message']['created_at'] if x['last_message'] else ""), reverse=True)
    
    return jsonify(results), 200

# =======================================================
# 2. START OR GET CONVERSATION WITH USER
# =======================================================
@chat_bp.route("/", methods=["POST"])
@jwt_required()
def start_conversation():
    current_user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    target_user_id = data.get("target_user_id") # ID of doctor/patient
    
    if not target_user_id:
        return jsonify({"error": "Target user ID required"}), 400
        
    if str(target_user_id) == str(current_user_id):
        return jsonify({"error": "Cannot chat with self"}), 400
    target_user_id = int(target_user_id)

    # Check if conversation already exists
    # Find conversation where BOTH are participants
    my_convs = [p.conversation_id for p in Participant.query.filter_by(user_id=current_user_id).all()]
    their_convs = [p.conversation_id for p in Participant.query.filter_by(user_id=target_user_id).all()]
    
    common = set(my_convs).intersection(set(their_convs))
    
    if common:
        conv_id = list(common)[0] # direct chat should be unique ?
        # Verify type is direct
        conv = Conversation.query.get(conv_id)
        if conv:
             return jsonify({"message": "Conversation exists", "conversation_id": conv.id}), 200

    # Before creating a new conversation, check Doctor Privacy settings (if current is patient and target is doctor)
    current_user = User.query.get(current_user_id)
    target_user = User.query.get(target_user_id)
    if current_user and target_user and current_user.role == "patient" and target_user.role == "doctor":
        from database.models import Appointment, DoctorPrivacySetting
        # Check if patient has any appointment history with this doctor
        has_appointment = Appointment.query.filter_by(patient_id=current_user_id, doctor_id=target_user_id).first()
        if not has_appointment:
            privacy = DoctorPrivacySetting.query.filter_by(doctor_user_id=target_user_id).first()
            if privacy and not privacy.allow_chat_before_booking:
                return jsonify({"error": "This doctor does not allow pre-booking chats. Please book an appointment first."}), 403

    # Create new
    new_conv = Conversation(type="direct")
    db.session.add(new_conv)
    db.session.flush()
    
    p1 = Participant(conversation_id=new_conv.id, user_id=current_user_id)
    p2 = Participant(conversation_id=new_conv.id, user_id=target_user_id)
    
    db.session.add(p1)
    db.session.add(p2)
    db.session.commit()
    
    return jsonify({"message": "Conversation created", "conversation_id": new_conv.id}), 201

# =======================================================
# 3. GET MESSAGES
# =======================================================
@chat_bp.route("/<int:conversation_id>/messages", methods=["GET"])
@jwt_required()
def get_messages(conversation_id):
    current_user_id = int(get_jwt_identity())
    
    # Verify participation
    part = Participant.query.filter_by(conversation_id=conversation_id, user_id=current_user_id).first()
    if not part:
        return jsonify({"error": "Access denied"}), 403
        
    messages = Message.query.filter_by(conversation_id=conversation_id).order_by(Message.created_at.asc()).all()
    
    return jsonify([m.to_dict() for m in messages]), 200

# =======================================================
# 4. SEND MESSAGE (HTTP Fallback)
# =======================================================
@chat_bp.route("/<int:conversation_id>/messages", methods=["POST"])
@jwt_required()
def send_message_http(conversation_id):
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    content = data.get("content")
    msg_type = data.get("type", "text")
    
    # Verify participation
    part = Participant.query.filter_by(conversation_id=conversation_id, user_id=current_user_id).first()
    if not part:
        return jsonify({"error": "Access denied"}), 403
        
    msg = Message(
        conversation_id=conversation_id,
        sender_id=current_user_id,
        content=content,
        type=msg_type
    )
    db.session.add(msg)
    db.session.commit()
    
    # Broadcast to socket room for real-time
    from extensions.socket import socketio
    payload = msg.to_dict()
    socketio.emit('new_message', payload, room=f"conversation_{conversation_id}")
    socketio.emit('receive_message', payload, room=f"conversation_{conversation_id}")
    
    # Notify other participants (respecting settings)
    others = Participant.query.filter(
        Participant.conversation_id == conversation_id,
        Participant.user_id != current_user_id
    ).all()

    # Hard fallback delivery path: user-targeted rooms receive events even when
    # conversation room join is stale/missed on the frontend.
    socketio.emit('new_message', payload, room=f"user_{current_user_id}")
    socketio.emit('receive_message', payload, room=f"user_{current_user_id}")
    for p in others:
        socketio.emit('new_message', payload, room=f"user_{p.user_id}")
        socketio.emit('receive_message', payload, room=f"user_{p.user_id}")
    
    sender_name = User.query.get(current_user_id).full_name if User.query.get(current_user_id) else "Someone"

    for p in others:
        NotificationService.send_in_app(
            user_id=p.user_id,
            title=f"New Message from {sender_name}",
            message=content if msg_type == "text" else f"Sent a {msg_type}",
            notif_type="message",
            email_subject=f"NeuroNest: New Message from {sender_name}",
            payload={"conversation_id": conversation_id, "sender_id": current_user_id}
        )
    
    return jsonify(msg.to_dict()), 201


@chat_bp.route("/messages/<int:message_id>", methods=["DELETE"])
@jwt_required()
def delete_message(message_id):
    current_user_id = int(get_jwt_identity())

    msg = Message.query.get_or_404(message_id)
    part = Participant.query.filter_by(conversation_id=msg.conversation_id, user_id=current_user_id).first()
    if not part:
        return jsonify({"error": "Access denied"}), 403

    if msg.sender_id != current_user_id:
        return jsonify({"error": "Only the sender can delete this message"}), 403

    if msg.is_deleted:
        return jsonify(msg.to_dict()), 200

    msg.is_deleted = True
    db.session.commit()

    from extensions.socket import socketio
    payload = msg.to_dict()
    socketio.emit("message_deleted", payload, room=f"conversation_{msg.conversation_id}")
    socketio.emit("message_deleted", payload, room=f"user_{current_user_id}")

    others = Participant.query.filter(
        Participant.conversation_id == msg.conversation_id,
        Participant.user_id != current_user_id
    ).all()
    for p in others:
        socketio.emit("message_deleted", payload, room=f"user_{p.user_id}")

    return jsonify(payload), 200

# =======================================================
# 5. MARK AS READ
# =======================================================
@chat_bp.route("/<int:conversation_id>/read", methods=["PATCH"])
@jwt_required()
def mark_as_read(conversation_id):
    current_user_id = int(get_jwt_identity())

    part = Participant.query.filter_by(conversation_id=conversation_id, user_id=current_user_id).first()
    if not part:
        return jsonify({"error": "Access denied"}), 403
    
    # Mark messages as read where current user is NOT the sender
    Message.query.filter_by(conversation_id=conversation_id, is_read=False).filter(
        Message.sender_id != current_user_id
    ).update({"is_read": True}, synchronize_session=False)
    
    db.session.commit()
    return jsonify({"message": "Conversation marked as read"}), 200

# =======================================================
# 6. GET CHAT CONTEXT (Identity + Next Appointment)
# =======================================================
@chat_bp.route("/chat-context/<int:other_user_id>", methods=["GET"])
@jwt_required()
def get_chat_context(other_user_id):
    current_user_id = int(get_jwt_identity())
    
    # Get other user identity
    other_user = User.query.get(other_user_id)
    if not other_user:
        return jsonify({"error": "User not found"}), 404
        
    other_profile = other_user.patient_profile
    
    # Find next appointment between these two
    from datetime import datetime
    now = datetime.now()
    
    # Query logic: either current is doctor & other is patient, or vice versa
    next_apt = Appointment.query.filter(
        or_(
            and_(Appointment.doctor_id == current_user_id, Appointment.patient_id == other_user_id),
            and_(Appointment.doctor_id == other_user_id, Appointment.patient_id == current_user_id)
        ),
        Appointment.appointment_date >= now.date(),
        Appointment.status.in_(["approved", "rescheduled"])
    ).order_by(Appointment.appointment_date.asc(), Appointment.appointment_time.asc()).first()
    
    last_apt = Appointment.query.filter(
        or_(
            and_(Appointment.doctor_id == current_user_id, Appointment.patient_id == other_user_id),
            and_(Appointment.doctor_id == other_user_id, Appointment.patient_id == current_user_id)
        ),
        Appointment.appointment_date <= now.date(),
        Appointment.status == "completed"
    ).order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc()).first()
    
    return jsonify({
        "identity": {
            "full_name": other_user.full_name,
            "email": other_user.email,
            "profile_image": other_profile.profile_image if other_profile else (other_user.doctor_profile.profile_image if other_user.role == 'doctor' and other_user.doctor_profile else None),
            "role": other_user.role,
            "specialization": other_user.doctor_profile.specialization if other_user.role == 'doctor' and other_user.doctor_profile else None,
            "gender": other_profile.gender if other_profile else "N/A",
            "blood_group": other_profile.blood_group if other_profile else "N/A",
            "dob": str(other_profile.date_of_birth) if other_profile and other_profile.date_of_birth else "N/A",
        },
        "next_appointment": next_apt.to_dict() if next_apt else None,
        "last_appointment": {
            "date": str(last_apt.appointment_date),
            "time": str(last_apt.appointment_time),
            "status": last_apt.status
        } if last_apt else None
    }), 200
