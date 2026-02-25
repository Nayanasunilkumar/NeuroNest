from datetime import datetime
from database.models import db

class Announcement(db.Model):
    __tablename__ = "announcements"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100), default='General')
    priority = db.Column(db.String(20), default='Low') # Low, Medium, High, Critical
    status = db.Column(db.String(20), default='Draft') # Draft, Scheduled, Published, Expired, Archived
    publish_at = db.Column(db.DateTime, nullable=True)
    expiry_at = db.Column(db.DateTime, nullable=True)

    created_by = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    updated_by = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    is_pinned = db.Column(db.Boolean, default=False)
    require_acknowledgement = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    author = db.relationship("User", foreign_keys=[created_by], backref="announcements_created")
    targets = db.relationship("AnnouncementTarget", backref="announcement", cascade="all, delete-orphan")
    reads = db.relationship("AnnouncementRead", backref="announcement", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "category": self.category,
            "priority": self.priority,
            "status": self.status,
            "publish_at": self.publish_at.isoformat() if self.publish_at else None,
            "expiry_at": self.expiry_at.isoformat() if self.expiry_at else None,
            "created_by": self.created_by,
            "author_name": self.author.full_name if self.author else "Admin",
            "is_pinned": self.is_pinned,
            "require_acknowledgement": self.require_acknowledgement,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "targets": [t.to_dict() for t in self.targets],
            "views_count": len([r for r in self.reads if r.is_read])
        }
