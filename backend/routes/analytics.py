from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Trade
from services.financial import compute_user_metrics

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')

@analytics_bp.route('', methods=['GET'])
@jwt_required()
def get_analytics():
    user_id = int(get_jwt_identity())
    trades = Trade.query.filter_by(user_id=user_id).all()
    metrics = compute_user_metrics(trades)

    return jsonify({
        'overview': {
            'total_trades': metrics['total_trades'],
            'closed_trades': metrics['closed_trades'],
            'open_trades': metrics['open_trades'],
            'win_rate': metrics['win_rate'],
            'loss_rate': metrics['loss_rate'],
            'total_pnl': metrics['total_pnl'],
            'avg_pnl': metrics['avg_pnl'],
            'gross_profit': metrics['gross_profit'],
            'gross_loss': metrics['gross_loss'],
            'avg_win': metrics['avg_win'],
            'avg_loss': metrics['avg_loss'],
            'largest_win': metrics['largest_win'],
            'largest_loss': metrics['largest_loss'],
            'profit_factor': metrics['profit_factor'],
            'avg_rr': metrics['avg_rr']
        },
        'win_loss_distribution': [
            {'name': 'Winning Trades', 'count': metrics['winning_trades'], 'amount': metrics['gross_profit']},
            {'name': 'Losing Trades', 'count': metrics['losing_trades'], 'amount': metrics['gross_loss']},
            {'name': 'Breakeven', 'count': metrics['breakeven_trades'], 'amount': 0.0}
        ],
        'equity_curve': metrics['equity_curve'],
        'daily_pnl': metrics['daily_pnl'],
        'strategy_performance': metrics['strategy_performance'],
        'instrument_performance': metrics['instrument_performance'],
        'has_data': metrics['closed_trades'] > 0
    }), 200
