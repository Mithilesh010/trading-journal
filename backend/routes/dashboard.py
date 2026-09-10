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
    
    # Compute metrics using the centralized financial service
    metrics = compute_user_metrics(all_trades)
    
    # Recent 6 trades
    recent_trades = [t.to_dict() for t in all_trades[:6]]
    
    return jsonify({
        'metrics': {
            'total_trades': metrics['total_trades'],
            'open_trades': metrics['open_trades'],
            'closed_trades': metrics['closed_trades'],
            'winning_trades': metrics['winning_trades'],
            'losing_trades': metrics['losing_trades'],
            'breakeven_trades': metrics['breakeven_trades'],
            'win_rate': metrics['win_rate'],
            'loss_rate': metrics['loss_rate'],
            'total_pnl': metrics['total_pnl'],
            'avg_pnl': metrics['avg_pnl'],
            'profit_factor': metrics['profit_factor'],
            'avg_rr': metrics['avg_rr']
        },
        'equity_curve': metrics['equity_curve'],
        'recent_trades': recent_trades,
        'has_data': len(all_trades) > 0
    }), 200
