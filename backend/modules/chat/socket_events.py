from flask import request, session
from flask_socketio import emit, join_room, disconnect
from extensions.socket import socketio
from flask_jwt_extended import decode_token
from models.chat_models import db, Message, Participant
from services.notification_service import NotificationService
from database.models import User
import functools
# ...
def get_user_id():
    """Robust helper to get user_id from session or decoded JWT token."""
    user_id = session.get('user_id')
    if user_id:
        return user_id
    
    # Fallback: manually decode token from request if session is lost
    token = request.args.get('token')
    if token:
        try:
            from flask_jwt_extended import decode_token
            decoded = decode_token(token)
            return str(decoded['sub'])
        except:
            pass
    return None

def authenticated_only(f):
    @functools.wraps(f)
    def wrapped(*args, **kwargs):
        if not get_user_id():
            print("[SOCKET] Unauthorized: Force Disconnect.")
            disconnect()
            return
        return f(*args, **kwargs)
    return wrapped

@socketio.on('connect')
def handle_connect():
    token = request.args.get('token')
    # ...
    try:
        decoded = decode_token(token)
        user_id = decoded['sub']
        session['user_id'] = str(user_id)
        # ...
        
        # Room for specific user (notifications)
        join_room(f"user_{user_id}")
        print(f"SocketIO: User {user_id} connected.")
        
    except Exception as e:
        print(f"SocketIO: Invalid token: {e}")
        disconnect()

@socketio.on('disconnect')
def handle_disconnect():
    print(f"SocketIO: User disconnected.")

@socketio.on('join_conversation')
@authenticated_only
def on_join(data):
    try:
        conv_id = int(data.get('conversation_id'))
        user_id_raw = get_user_id()
        if not user_id_raw:
            print("[SOCKET] Join failed: Session/Token lost")
            return
        user_id = int(user_id_raw)
        
        # Verify participation
        part = Participant.query.filter_by(conversation_id=conv_id, user_id=user_id).first()
        if part:
            join_room(f"conversation_{conv_id}")
            print(f"[SOCKET] User {user_id} joined room conversation_{conv_id}")
            emit('status', {'msg': f'Joined conversation {conv_id}'})
        else:
            print(f"[SOCKET] User {user_id} tried to join non-participating conversation {conv_id}")
            emit('error', {'msg': 'Access denied to this conversation'})
    except Exception as e:
        print(f"[SOCKET] Join exception: {e}")

@socketio.on('send_message')
@authenticated_only
def on_send_message(data):
    try:
        conv_id = int(data.get('conversation_id'))
        content = data.get('content')
        msg_type = data.get('type', 'text') # Default to text
        user_id_raw = get_user_id()
        if not user_id_raw:
            print("[SOCKET] Send failed: Session/Token lost")
            return
        user_id = int(user_id_raw)
        
        print(f"[SOCKET] Message attempt from {user_id} -> room conversation_{conv_id}")

        # Verify participation
        part = Participant.query.filter_by(conversation_id=conv_id, user_id=user_id).first()
        if not part:
            print(f"[SOCKET] DENIED: User {user_id} is not in conversation {conv_id}")
            return
        
        # Save to DB - Atomic with explicit commit
        msg = Message(
            conversation_id=conv_id,
            sender_id=user_id,
            content=content,
            type=msg_type
        )
        db.session.add(msg)
        db.session.commit()
        
        # Emit to room (broadcast)
        # Note: emit to room includes the sender by default in Flask-SocketIO 
        # provided they've joined the room via join_conversation.
        print(f"[SOCKET] Message {msg.id} persisted. Broadcasting...")
        emit('new_message', msg.to_dict(), room=f"conversation_{conv_id}")

        # Notify other participants (respecting settings)
        others = Participant.query.filter(
            Participant.conversation_id == conv_id,
            Participant.user_id != user_id
        ).all()
        
        sender = User.query.get(user_id)
        sender_name = sender.full_name if sender else "Someone"

        for p in others:
            NotificationService.send_in_app(
                user_id=p.user_id,
                title=f"New Message from {sender_name}",
                message=content if msg_type == "text" else f"Sent a {msg_type}",
                notif_type="message",
                email_subject=f"NeuroNest: New Message from {sender_name}",
                payload={"conversation_id": conv_id, "sender_id": user_id}
            )
    except Exception as e:
        print(f"[SOCKET] Message failure: {e}")
        db.session.rollback()
