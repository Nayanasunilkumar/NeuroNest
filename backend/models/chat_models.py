from datetime import datetime, timezone
from database.models import db


def to_utc_iso(value):
    if not value:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc).isoformat().replace("+00:00", "Z")
    return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")

# =========================================
# CONVERSATION MODEL
# =========================================
class Conversation(db.Model):
    __tablename__ = "conversations"

    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(20), default="direct") # direct, group
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    participants = db.relationship(
        "Participant",
        backref="conversation",
        lazy=True,
        cascade="all, delete-orphan"
    )
    
    messages = db.relationship(
        "Message",
        backref="conversation",
        lazy="dynamic",
        cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "type": self.type,
            "created_at": to_utc_iso(self.created_at),
            "updated_at": to_utc_iso(self.updated_at),
            "participants": [p.to_dict() for p in self.participants]
        }

# =========================================
# PARTICIPANT MODEL
# =========================================
class Participant(db.Model):
    __tablename__ = "participants"
    
    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey("conversations.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship to User
    user = db.relationship("User", backref="conversations_participated")

    def to_dict(self):
        return {
            "id": self.id,
            "conversation_id": self.conversation_id,
            "user_id": self.user_id,
            "user_name": self.user.full_name if self.user else "Unknown",
            "joined_at": to_utc_iso(self.joined_at)
        }

# =========================================
# MESSAGE MODEL
# =========================================
class Message(db.Model):
    __tablename__ = "messages"

    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey("conversations.id"), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    
    content = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(20), default="text") # text, image, file, system
    
    is_read = db.Column(db.Boolean, default=False) # Simple read status (for direct messages)
    # For group chats, we might need a separate ReadReceipt table
    
    is_deleted = db.Column(db.Boolean, default=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    sender = db.relationship("User", backref="messages_sent")

    def to_dict(self):
        return {
            "id": self.id,
            "conversation_id": self.conversation_id,
            "sender_id": self.sender_id,
            "sender_name": self.sender.full_name if self.sender else "Unknown",
            "content": self.content if not self.is_deleted else "This message was deleted",
            "type": self.type,
            "is_read": self.is_read,
            "is_deleted": self.is_deleted,
            "created_at": to_utc_iso(self.created_at),
            "updated_at": to_utc_iso(self.updated_at)
        }
