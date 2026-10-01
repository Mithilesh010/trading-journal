from datetime import datetime
from . import db

MARKET_TYPES = ('Indian Market', 'Crypto Market', 'Commodity Market', 'Forex Market')
STATUS_TYPES = ('TP Hit', 'SL Hit')
POSITION_TYPES = ('BUY', 'SELL')

class Trade(db.Model):
    __tablename__ = 'trades'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    trade_date = db.Column(db.Date, nullable=False, index=True)
    entry_time = db.Column(db.String(10), nullable=False)
    exit_time = db.Column(db.String(10), nullable=True)
    market_type = db.Column(db.String(30), nullable=False, default='Indian Market', index=True)
    instrument = db.Column(db.String(100), nullable=False, index=True)
    side = db.Column(db.String(10), nullable=False)       # BUY or SELL
    quantity = db.Column(db.Float, nullable=True)         # Indian Market quantity
    lot_size = db.Column(db.Float, nullable=True)         # Crypto, Commodity, Forex
    lots = db.Column(db.Float, nullable=True)             # Crypto, Commodity, Forex
    strategy = db.Column(db.String(100), nullable=True)
    notes = db.Column(db.Text, nullable=True)             # Free-text trading notes
    rr = db.Column(db.String(20), nullable=True)          # Manually entered R:R, e.g. "1:2", "1:1.5"
    status = db.Column(db.String(20), nullable=False)     # "TP Hit" or "SL Hit"
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Legacy fields retained as nullable for backward-compatibility with existing tables
    entry_price = db.Column(db.Float, nullable=True)
    exit_price = db.Column(db.Float, nullable=True)
    stop_loss = db.Column(db.Float, nullable=True)
    target = db.Column(db.Float, nullable=True)
    setup = db.Column(db.String(100), nullable=True)
    entry_reason = db.Column(db.Text, nullable=True)
    exit_reason = db.Column(db.Text, nullable=True)
    screenshot_path = db.Column(db.String(255), nullable=True)

    @property
    def position(self):
        return self.side.upper() if self.side else 'BUY'

    @property
    def rr_numeric(self):
        """Helper to extract a numeric ratio for average R:R calculation."""
        if not self.rr:
            return None
        val_str = str(self.rr).strip()
        try:
            if ':' in val_str:
                parts = val_str.split(':')
                denom = float(parts[0]) if float(parts[0]) != 0 else 1.0
                num = float(parts[1])
                return round(num / denom, 2)
            return round(float(val_str), 2)
        except (ValueError, ZeroDivisionError):
            return None

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'trade_date': self.trade_date.isoformat() if self.trade_date else None,
            'entry_time': self.entry_time,
            'exit_time': self.exit_time or '',
            'market_type': self.market_type or 'Indian Market',
            'instrument': self.instrument,
            'position': self.side.upper(),
            'side': self.side.upper(),
            'quantity': self.quantity,
            'lot_size': self.lot_size,
            'lots': self.lots,
            'strategy': self.strategy or '',
            'notes': self.notes or '',
            'rr': self.rr or '',
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
