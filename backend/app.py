import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db
from routes import (
    auth_bp,
    trades_bp,
    dashboard_bp,
    analytics_bp,
    journal_bp,
    profile_bp,
    export_bp
)

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Initialize extensions
    db.init_app(app)
    
    # Configure CORS for all /api/* routes
    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )

    jwt = JWTManager(app)

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'error': 'Token has expired. Please log in again.'}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({'error': 'Invalid authentication token.'}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({'error': 'Authentication token is required.'}), 401

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(trades_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(journal_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(export_bp)

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'application': 'Trading Terminal API',
            'version': '1.0.0'
        }), 200

    @app.errorhandler(413)
    def request_entity_too_large(error):
        return jsonify({'error': 'File size exceeds maximum limit (16MB).'}), 413

    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({'error': 'Requested resource not found.'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({'error': 'An internal server error occurred.'}), 500

    # Auto-create tables for development and safely extend existing databases.
    with app.app_context():
        db.create_all()
        ensure_trade_schema()

    return app


def ensure_trade_schema():
    """Ensure trade schema supports new fields (rr) and nullable legacy fields without deleting old trades."""
    from sqlalchemy import inspect, text
    inspector = inspect(db.engine)
    if 'trades' not in inspector.get_table_names():
        return
    existing_cols = {c['name']: c for c in inspector.get_columns('trades')}
    
    # Check if entry_price is NOT NULL in SQLite
    entry_price_info = existing_cols.get('entry_price', {})
    is_sqlite = db.engine.dialect.name == 'sqlite'
    needs_table_rebuild = is_sqlite and not entry_price_info.get('nullable', True)

    if needs_table_rebuild:
        db.session.execute(text("""
            CREATE TABLE IF NOT EXISTS trades_temp (
                id INTEGER NOT NULL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                trade_date DATE NOT NULL,
                entry_time VARCHAR(10) NOT NULL,
                exit_time VARCHAR(10),
                market_type VARCHAR(30) NOT NULL DEFAULT 'Indian Market',
                instrument VARCHAR(100) NOT NULL,
                side VARCHAR(10) NOT NULL,
                quantity FLOAT,
                lot_size FLOAT,
                lots FLOAT,
                strategy VARCHAR(100),
                notes TEXT,
                rr VARCHAR(20),
                status VARCHAR(20) NOT NULL,
                entry_price FLOAT,
                exit_price FLOAT,
                stop_loss FLOAT,
                target FLOAT,
                setup VARCHAR(100),
                entry_reason TEXT,
                exit_reason TEXT,
                screenshot_path VARCHAR(255),
                created_at DATETIME NOT NULL,
                updated_at DATETIME NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        """))
        cols_to_copy = [c for c in existing_cols if c not in ('rr',)]
        cols_str = ', '.join(cols_to_copy)
        db.session.execute(text(f"INSERT INTO trades_temp ({cols_str}) SELECT {cols_str} FROM trades"))
        db.session.execute(text("DROP TABLE trades"))
        db.session.execute(text("ALTER TABLE trades_temp RENAME TO trades"))
        db.session.execute(text("CREATE INDEX IF NOT EXISTS ix_trades_trade_date ON trades (trade_date)"))
        db.session.execute(text("CREATE INDEX IF NOT EXISTS ix_trades_user_id ON trades (user_id)"))
        db.session.execute(text("CREATE INDEX IF NOT EXISTS ix_trades_market_type ON trades (market_type)"))
        db.session.execute(text("CREATE INDEX IF NOT EXISTS ix_trades_instrument ON trades (instrument)"))
        db.session.commit()
    else:
        additions = {
            'market_type': "VARCHAR(30) DEFAULT 'Indian Market'",
            'lot_size': 'FLOAT',
            'lots': 'FLOAT',
            'rr': 'VARCHAR(20)'
        }
        for name, definition in additions.items():
            if name not in existing_cols:
                db.session.execute(text(f'ALTER TABLE trades ADD COLUMN {name} {definition}'))
        db.session.commit()

    # Backfill legacy rows
    db.session.execute(text("UPDATE trades SET market_type = 'Indian Market' WHERE market_type IS NULL OR market_type = ''"))
    db.session.commit()

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
