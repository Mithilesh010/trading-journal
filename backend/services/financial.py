from collections import defaultdict

def calculate_pnl(side, entry_price, exit_price, quantity, status='Closed'):
    """Calculates realized P&L. Returns None if status is Open or exit_price is missing."""
    if status != 'Closed' or exit_price is None or entry_price is None or quantity is None:
        return None
    qty = float(quantity)
    entry = float(entry_price)
    exit_p = float(exit_price)
    if side.upper() == 'BUY':
        return round((exit_p - entry) * qty, 2)
    elif side.upper() == 'SELL':
        return round((entry - exit_p) * qty, 2)
    return None

def calculate_risk(side, entry_price, stop_loss):
    if stop_loss is None or entry_price is None:
        return None
    entry = float(entry_price)
    sl = float(stop_loss)
    if side.upper() == 'BUY':
        return round(max(0.0, entry - sl), 2)
    else:
        return round(max(0.0, sl - entry), 2)

def calculate_reward(side, entry_price, target):
    if target is None or entry_price is None:
        return None
    entry = float(entry_price)
    tgt = float(target)
    if side.upper() == 'BUY':
        return round(max(0.0, tgt - entry), 2)
    else:
        return round(max(0.0, entry - tgt), 2)

def calculate_rr(risk, reward):
    if risk is not None and risk > 0 and reward is not None:
        return round(reward / risk, 2)
    return None

def compute_user_metrics(trades):
    """
    Computes comprehensive trading metrics from a list of Trade models or dicts.
    Only closed trades with non-null P&L contribute to realized performance metrics.
    """
    total_trades = len(trades)
    closed_trades = [t for t in trades if t.status == 'Closed' and t.pnl is not None]
    open_trades = [t for t in trades if t.status == 'Open']

    winning_trades = [t for t in closed_trades if t.pnl > 0]
    losing_trades = [t for t in closed_trades if t.pnl < 0]
    breakeven_trades = [t for t in closed_trades if t.pnl == 0]

    num_closed = len(closed_trades)
    num_wins = len(winning_trades)
    num_losses = len(losing_trades)

    win_rate = round((num_wins / num_closed * 100), 2) if num_closed > 0 else 0.0
    loss_rate = round((num_losses / num_closed * 100), 2) if num_closed > 0 else 0.0

    total_pnl = round(sum(t.pnl for t in closed_trades), 2) if closed_trades else 0.0
    avg_pnl = round(total_pnl / num_closed, 2) if num_closed > 0 else 0.0

    gross_profit = round(sum(t.pnl for t in winning_trades), 2) if winning_trades else 0.0
    gross_loss = round(abs(sum(t.pnl for t in losing_trades)), 2) if losing_trades else 0.0

    avg_win = round(gross_profit / num_wins, 2) if num_wins > 0 else 0.0
    avg_loss = round(gross_loss / num_losses, 2) if num_losses > 0 else 0.0

    largest_win = round(max((t.pnl for t in winning_trades), default=0.0), 2)
    largest_loss = round(min((t.pnl for t in losing_trades), default=0.0), 2)

    # Safe Profit Factor
    if gross_loss > 0:
        profit_factor = round(gross_profit / gross_loss, 2)
    elif gross_profit > 0 and gross_loss == 0:
        profit_factor = round(gross_profit, 2)  # Cap or display as gross profit
    else:
        profit_factor = 0.0

    # Average R:R
    valid_rrs = [t.rr_ratio for t in trades if t.rr_ratio is not None and t.rr_ratio > 0]
    avg_rr = round(sum(valid_rrs) / len(valid_rrs), 2) if valid_rrs else 0.0

    # Equity Curve: sort closed trades by trade_date, then entry_time
    sorted_closed = sorted(closed_trades, key=lambda x: (x.trade_date, x.entry_time or '00:00'))
    equity_curve = []
    cumulative = 0.0
    
    # Initial point if there are closed trades
    if sorted_closed:
        equity_curve.append({
            'trade_index': 0,
            'date': sorted_closed[0].trade_date.isoformat(),
            'instrument': 'START',
            'pnl': 0.0,
            'cumulative_pnl': 0.0
        })

    for idx, t in enumerate(sorted_closed, 1):
        cumulative = round(cumulative + t.pnl, 2)
        equity_curve.append({
            'trade_index': idx,
            'date': t.trade_date.isoformat(),
            'instrument': t.instrument,
            'side': t.side,
            'pnl': t.pnl,
            'cumulative_pnl': cumulative
        })

    # Daily P&L
    daily_map = defaultdict(lambda: {'pnl': 0.0, 'trades': 0, 'wins': 0, 'losses': 0})
    for t in sorted_closed:
        d_str = t.trade_date.isoformat()
        daily_map[d_str]['pnl'] = round(daily_map[d_str]['pnl'] + t.pnl, 2)
        daily_map[d_str]['trades'] += 1
        if t.pnl > 0:
            daily_map[d_str]['wins'] += 1
        elif t.pnl < 0:
            daily_map[d_str]['losses'] += 1
            
    daily_pnl = [{'date': d, **vals} for d, vals in sorted(daily_map.items())]

    # Performance by Strategy
    strategy_map = defaultdict(lambda: {'total_trades': 0, 'closed': 0, 'wins': 0, 'pnl': 0.0, 'rr_sum': 0.0, 'rr_count': 0})
    for t in trades:
        strat = (t.strategy or 'Unspecified').strip()
        if not strat:
            strat = 'Unspecified'
        strategy_map[strat]['total_trades'] += 1
        if t.rr_ratio:
            strategy_map[strat]['rr_sum'] += t.rr_ratio
            strategy_map[strat]['rr_count'] += 1
        if t.status == 'Closed' and t.pnl is not None:
            strategy_map[strat]['closed'] += 1
            strategy_map[strat]['pnl'] = round(strategy_map[strat]['pnl'] + t.pnl, 2)
            if t.pnl > 0:
                strategy_map[strat]['wins'] += 1

    strategy_performance = []
    for strat, data in strategy_map.items():
        closed = data['closed']
        strategy_performance.append({
            'strategy': strat,
            'total_trades': data['total_trades'],
            'closed_trades': closed,
            'winning_trades': data['wins'],
            'win_rate': round((data['wins'] / closed * 100), 2) if closed > 0 else 0.0,
            'total_pnl': round(data['pnl'], 2),
            'avg_rr': round(data['rr_sum'] / data['rr_count'], 2) if data['rr_count'] > 0 else 0.0
        })
    strategy_performance.sort(key=lambda x: x['total_pnl'], reverse=True)

    # Performance by Instrument
    instrument_map = defaultdict(lambda: {'total_trades': 0, 'closed': 0, 'wins': 0, 'pnl': 0.0})
    for t in trades:
        inst = (t.instrument or 'Unknown').strip().upper()
        instrument_map[inst]['total_trades'] += 1
        if t.status == 'Closed' and t.pnl is not None:
            instrument_map[inst]['closed'] += 1
            instrument_map[inst]['pnl'] = round(instrument_map[inst]['pnl'] + t.pnl, 2)
            if t.pnl > 0:
                instrument_map[inst]['wins'] += 1

    instrument_performance = []
    for inst, data in instrument_map.items():
        closed = data['closed']
        instrument_performance.append({
            'instrument': inst,
            'total_trades': data['total_trades'],
            'closed_trades': closed,
            'win_rate': round((data['wins'] / closed * 100), 2) if closed > 0 else 0.0,
            'total_pnl': round(data['pnl'], 2)
        })
    instrument_performance.sort(key=lambda x: x['total_pnl'], reverse=True)

    return {
        'total_trades': total_trades,
        'open_trades': len(open_trades),
        'closed_trades': num_closed,
        'winning_trades': num_wins,
        'losing_trades': num_losses,
        'breakeven_trades': len(breakeven_trades),
        'win_rate': win_rate,
        'loss_rate': loss_rate,
        'total_pnl': total_pnl,
        'avg_pnl': avg_pnl,
        'gross_profit': gross_profit,
        'gross_loss': gross_loss,
        'avg_win': avg_win,
        'avg_loss': avg_loss,
        'largest_win': largest_win,
        'largest_loss': largest_loss,
        'profit_factor': profit_factor,
        'avg_rr': avg_rr,
        'equity_curve': equity_curve,
        'daily_pnl': daily_pnl,
        'strategy_performance': strategy_performance,
        'instrument_performance': instrument_performance
    }
