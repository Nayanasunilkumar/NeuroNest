from flask import request, session
from flask_socketio import emit, join_room, disconnect
from extensions.socket import socketio
from flask_jwt_extended import decode_token
from models.chat_models import db, Message, Participant
import functools
# ...
def authenticated_only(f):
    @functools.wraps(f)
    def wrapped(*args, **kwargs):
        if not session.get('user_id'):
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
    # data = { conversation_id: 1 }
    conv_id = data.get('conversation_id')
    user_id = int(session.get('user_id'))
    
    # Verify participation
    part = Participant.query.filter_by(conversation_id=conv_id, user_id=user_id).first()
    if part:
        join_room(f"conversation_{conv_id}")
        print(f"User {user_id} joined room conversation_{conv_id}")
        emit('status', {'msg': f'Joined conversation {conv_id}'})
    else:
        print(f"User {user_id} tried to join non-participating conversation {conv_id}")

@socketio.on('send_message')
@authenticated_only
def on_send_message(data):
    # data = { conversation_id: 1, content: "Hello", type: "text" }
    conv_id = data.get('conversation_id')
    content = data.get('content')
    msg_type = data.get('type', 'text') # Default to text
    user_id = int(session.get('user_id'))
    
    # Verify participation
    part = Participant.query.filter_by(conversation_id=conv_id, user_id=user_id).first()
    if not part:
        return # Ignore 
    
    # Save to DB
    msg = Message(
        conversation_id=conv_id,
        sender_id=user_id,
        content=content,
        type=msg_type
    )
    db.session.add(msg)
    db.session.commit()
    
    # Emit to room
    emit('new_message', msg.to_dict(), room=f"conversation_{conv_id}")
