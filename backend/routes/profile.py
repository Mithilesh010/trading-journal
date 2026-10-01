from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Trade
from services.financial import compute_user_metrics

profile_bp = Blueprint('profile', __name__, url_prefix='/api/profile')

MARKETS = ('Indian Market', 'Crypto Market', 'Commodity Market', 'Forex Market')

@profile_bp.route('', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404

    trades = Trade.query.filter_by(user_id=user_id).all()
    metrics = compute_user_metrics(trades)

    market_summaries = {}
    for market in MARKETS:
        market_trades = [t for t in trades if (getattr(t, 'market_type', None) or 'Indian Market') == market]
        m_metrics = compute_user_metrics(market_trades)
        market_summaries[market] = {
            'total_trades': m_metrics['total_trades'],
            'tp_hits': m_metrics['tp_hits'],
            'sl_hits': m_metrics['sl_hits'],
            'win_rate': m_metrics['win_rate'],
            'avg_rr': m_metrics['avg_rr']
        }

    return jsonify({
        'user': user.to_dict(),
        'stats': {
            'total_trades': metrics['total_trades'],
            'tp_hits': metrics['tp_hits'],
            'sl_hits': metrics['sl_hits'],
            'win_rate': metrics['win_rate'],
            'avg_rr': metrics['avg_rr']
        },
        'market_summaries': market_summaries
    }), 200

@profile_bp.route('', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404

    data = request.get_json() or {}

    name = data.get('name', '').strip()
    if name:
        user.name = name

    if 'phone' in data:
        user.phone = str(data.get('phone', '')).strip()

    current_password = data.get('current_password')
    new_password = data.get('new_password')
    confirm_new_password = data.get('confirm_new_password')

    if new_password:
        if not current_password:
            return jsonify({'error': 'Current password is required to change password.'}), 400
        if not user.check_password(current_password):
            return jsonify({'error': 'Current password is incorrect.'}), 400
        if len(new_password) < 6:
            return jsonify({'error': 'New password must be at least 6 characters long.'}), 400
        if new_password != confirm_new_password:
            return jsonify({'error': 'New passwords do not match.'}), 400
        user.set_password(new_password)

    db.session.commit()

    return jsonify({
        'message': 'Profile updated successfully.',
        'user': user.to_dict()
    }), 200
