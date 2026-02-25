from datetime import datetime
from database.models import db

class AnnouncementRead(db.Model):
    __tablename__ = "announcement_reads"
    __table_args__ = (
        db.UniqueConstraint('announcement_id', 'user_id', name='uq_announcement_user_read'),
    )

    id = db.Column(db.Integer, primary_key=True)
    announcement_id = db.Column(db.Integer, db.ForeignKey("announcements.id", ondelete="CASCADE"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    is_read = db.Column(db.Boolean, default=False)
    acknowledged = db.Column(db.Boolean, default=False)

    read_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "announcement_id": self.announcement_id,
            "user_id": self.user_id,
            "is_read": self.is_read,
            "acknowledged": self.acknowledged,
            "read_at": self.read_at.isoformat() if self.read_at else None
        }
