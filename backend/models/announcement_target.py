from datetime import datetime
from database.models import db

class AnnouncementTarget(db.Model):
    __tablename__ = "announcement_targets"

    id = db.Column(db.Integer, primary_key=True)
    announcement_id = db.Column(db.Integer, db.ForeignKey("announcements.id", ondelete="CASCADE"), nullable=False)

    target_type = db.Column(db.String(50), nullable=False) # All, Role, User, Department
    target_value = db.Column(db.String(100), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "announcement_id": self.announcement_id,
            "target_type": self.target_type,
            "target_value": self.target_value,
            "created_at": self.created_at.isoformat()
        }
