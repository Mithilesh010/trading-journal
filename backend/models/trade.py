from datetime import datetime
from . import db

class Trade(db.Model):
    __tablename__ = 'trades'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    trade_date = db.Column(db.Date, nullable=False, index=True)
    entry_time = db.Column(db.String(10), nullable=False)
    exit_time = db.Column(db.String(10), nullable=True)
    instrument = db.Column(db.String(100), nullable=False, index=True)
    side = db.Column(db.String(10), nullable=False)  # BUY or SELL
    quantity = db.Column(db.Float, nullable=False)
    entry_price = db.Column(db.Float, nullable=False)
    exit_price = db.Column(db.Float, nullable=True)
    stop_loss = db.Column(db.Float, nullable=True)
    target = db.Column(db.Float, nullable=True)
    strategy = db.Column(db.String(100), nullable=True)
    setup = db.Column(db.String(100), nullable=True)
    entry_reason = db.Column(db.Text, nullable=True)
    exit_reason = db.Column(db.Text, nullable=True)
    screenshot_path = db.Column(db.String(255), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), nullable=False, default='Open')  # 'Open' or 'Closed'
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    @property
    def pnl(self):
        """Calculates realized P&L for closed trades."""
        if self.status != 'Closed' or self.exit_price is None:
            return None
        
        qty = float(self.quantity or 0)
        entry = float(self.entry_price or 0)
        exit_p = float(self.exit_price or 0)
        
        if self.side.upper() == 'BUY':
            return round((exit_p - entry) * qty, 2)
        elif self.side.upper() == 'SELL':
            return round((entry - exit_p) * qty, 2)
        return None

    @property
    def risk(self):
        """Calculates risk per unit based on stop loss."""
        if self.stop_loss is None:
            return None
        entry = float(self.entry_price or 0)
        sl = float(self.stop_loss)
        
        if self.side.upper() == 'BUY':
            r = entry - sl
        else:
            r = sl - entry
        return round(max(0.0, r), 2)

    @property
    def reward(self):
        """Calculates reward per unit based on target."""
        if self.target is None:
            return None
        entry = float(self.entry_price or 0)
        tgt = float(self.target)
        
        if self.side.upper() == 'BUY':
            rw = tgt - entry
        else:
            rw = entry - tgt
        return round(max(0.0, rw), 2)

    @property
    def rr_ratio(self):
        """Calculates Risk to Reward ratio safely."""
        r = self.risk
        rw = self.reward
        if r is not None and r > 0 and rw is not None:
            return round(rw / r, 2)
        return None

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'trade_date': self.trade_date.isoformat() if self.trade_date else None,
            'entry_time': self.entry_time,
            'exit_time': self.exit_time,
            'instrument': self.instrument,
            'side': self.side.upper(),
            'quantity': self.quantity,
            'entry_price': self.entry_price,
            'exit_price': self.exit_price,
            'stop_loss': self.stop_loss,
            'target': self.target,
            'strategy': self.strategy or '',
            'setup': self.setup or '',
            'entry_reason': self.entry_reason or '',
            'exit_reason': self.exit_reason or '',
            'screenshot_path': self.screenshot_path,
            'has_screenshot': bool(self.screenshot_path),
            'notes': self.notes or '',
            'status': self.status,
            'pnl': self.pnl,
            'risk': self.risk,
            'reward': self.reward,
            'rr_ratio': self.rr_ratio,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
