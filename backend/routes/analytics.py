from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Trade
from services.financial import compute_user_metrics

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')

@analytics_bp.route('', methods=['GET'])
@jwt_required()
def get_analytics():
    user_id = int(get_jwt_identity())
    market_type = request.args.get('market_type', '').strip()
    
    query = Trade.query.filter_by(user_id=user_id)
    if market_type and market_type != 'All Markets':
        query = query.filter_by(market_type=market_type)
        
    trades = query.order_by(Trade.trade_date.asc(), Trade.entry_time.asc()).all()
    metrics = compute_user_metrics(trades)

    return jsonify({
        'overview': {
            'total_trades': metrics['total_trades'],
            'tp_hits': metrics['tp_hits'],
            'sl_hits': metrics['sl_hits'],
            'win_rate': metrics['win_rate'],
            'loss_rate': metrics['loss_rate'],
            'avg_rr': metrics['avg_rr'],
            'buy_trades': metrics['buy_trades'],
            'sell_trades': metrics['sell_trades']
        },
        'win_loss_distribution': [
            {'name': 'TP Hit', 'count': metrics['tp_hits']},
            {'name': 'SL Hit', 'count': metrics['sl_hits']}
        ],
        'trend_chart': metrics['trend_chart'],
        'daily_breakdown': metrics['daily_breakdown'],
        'strategy_performance': metrics['strategy_performance'],
        'instrument_performance': metrics['instrument_performance'],
        'market_performance': metrics['market_performance'],
        'selected_market': market_type or 'All Markets',
        'has_data': len(trades) > 0
    }), 200
