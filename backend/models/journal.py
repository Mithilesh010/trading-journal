from datetime import datetime
from . import db

class Journal(db.Model):
    __tablename__ = 'journals'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    journal_date = db.Column(db.Date, nullable=False, index=True)
    market = db.Column(db.String(100), nullable=True)
    mood = db.Column(db.String(50), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    lesson = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'journal_date': self.journal_date.isoformat() if self.journal_date else None,
            'market': self.market or '',
            'mood': self.mood or '',
            'notes': self.notes or '',
            'lesson': self.lesson or '',
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
