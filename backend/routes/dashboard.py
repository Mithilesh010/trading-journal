from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Trade
from services.financial import compute_user_metrics

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@dashboard_bp.route('', methods=['GET'])
@jwt_required()
def get_dashboard():
    user_id = int(get_jwt_identity())
    
    # Query all trades of current user
    all_trades = Trade.query.filter_by(user_id=user_id).order_by(Trade.trade_date.desc(), Trade.entry_time.desc()).all()
    
    metrics = compute_user_metrics(all_trades)
    recent_trades = [t.to_dict() for t in all_trades[:6]]
    
    return jsonify({
        'metrics': {
            'total_trades': metrics['total_trades'],
            'tp_hits': metrics['tp_hits'],
            'sl_hits': metrics['sl_hits'],
            'win_rate': metrics['win_rate'],
            'loss_rate': metrics['loss_rate'],
            'avg_rr': metrics['avg_rr'],
            'buy_trades': metrics['buy_trades'],
            'sell_trades': metrics['sell_trades']
        },
        'trend_chart': metrics['trend_chart'],
        'recent_trades': recent_trades,
        'has_data': len(all_trades) > 0
    }), 200
