from .auth import auth_bp
from .trades import trades_bp
from .dashboard import dashboard_bp
from .analytics import analytics_bp
from .journal import journal_bp
from .profile import profile_bp
from .export import export_bp

__all__ = [
    'auth_bp',
    'trades_bp',
    'dashboard_bp',
    'analytics_bp',
    'journal_bp',
    'profile_bp',
    'export_bp'
]
