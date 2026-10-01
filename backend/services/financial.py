from collections import defaultdict

def parse_rr_to_ratio(rr_val):
    """
    Parses user-entered R:R string or value into a numeric ratio.
    Examples:
      "1:2"   -> 2.0
      "1:1.5" -> 1.5
      "1:3"   -> 3.0
      "2"     -> 2.0
    """
    if not rr_val:
        return None
    val_str = str(rr_val).strip()
    try:
        if ':' in val_str:
            parts = val_str.split(':')
            denom = float(parts[0]) if float(parts[0]) != 0 else 1.0
            num = float(parts[1])
            return round(num / denom, 2)
        return round(float(val_str), 2)
    except (ValueError, ZeroDivisionError):
        return None

def compute_user_metrics(trades):
    """
    Computes professional trade execution metrics from genuine database trades.
    Uses strictly the available fields: TP Hit, SL Hit, R:R, Side, Strategy, Instrument, Market.
    Does NOT calculate or fabricate financial P&L.
    """
    total_trades = len(trades)
    tp_hits = len([t for t in trades if getattr(t, 'status', '') == 'TP Hit'])
    sl_hits = len([t for t in trades if getattr(t, 'status', '') == 'SL Hit'])

    win_rate = round((tp_hits / total_trades * 100), 2) if total_trades > 0 else 0.0
    loss_rate = round((sl_hits / total_trades * 100), 2) if total_trades > 0 else 0.0

    buy_trades = len([t for t in trades if (getattr(t, 'side', '') or '').upper() == 'BUY'])
    sell_trades = len([t for t in trades if (getattr(t, 'side', '') or '').upper() == 'SELL'])

    # Average R:R calculation
    valid_rrs = []
    for t in trades:
        num = getattr(t, 'rr_numeric', None)
        if num is None:
            num = parse_rr_to_ratio(getattr(t, 'rr', None))
        if num is not None and num > 0:
            valid_rrs.append(num)

    avg_rr = round(sum(valid_rrs) / len(valid_rrs), 2) if valid_rrs else 0.0

    # Chronological Trend / Outcome Progression
    sorted_trades = sorted(trades, key=lambda x: (
        x.trade_date.isoformat() if hasattr(x.trade_date, 'isoformat') else str(x.trade_date),
        getattr(x, 'entry_time', '') or '00:00'
    ))

    trend_chart = []
    cum_tp = 0
    cum_sl = 0

    if sorted_trades:
        first_date = sorted_trades[0].trade_date
        first_date_str = first_date.isoformat() if hasattr(first_date, 'isoformat') else str(first_date)
        trend_chart.append({
            'trade_index': 0,
            'date': first_date_str,
            'instrument': 'START',
            'status': '',
            'cumulative_tp': 0,
            'cumulative_sl': 0,
            'net_score': 0,
            'win_rate': 0.0
        })

    for idx, t in enumerate(sorted_trades, 1):
        if getattr(t, 'status', '') == 'TP Hit':
            cum_tp += 1
        elif getattr(t, 'status', '') == 'SL Hit':
            cum_sl += 1

        t_date = t.trade_date
        t_date_str = t_date.isoformat() if hasattr(t_date, 'isoformat') else str(t_date)
        current_wr = round((cum_tp / idx * 100), 1)

        trend_chart.append({
            'trade_index': idx,
            'date': t_date_str,
            'instrument': getattr(t, 'instrument', ''),
            'position': (getattr(t, 'side', '') or 'BUY').upper(),
            'status': getattr(t, 'status', ''),
            'rr': getattr(t, 'rr', '') or '-',
            'cumulative_tp': cum_tp,
            'cumulative_sl': cum_sl,
            'net_score': cum_tp - cum_sl,
            'win_rate': current_wr
        })

    # Daily Breakdown
    daily_map = defaultdict(lambda: {'total': 0, 'tp_hits': 0, 'sl_hits': 0})
    for t in sorted_trades:
        t_date = t.trade_date
        d_str = t_date.isoformat() if hasattr(t_date, 'isoformat') else str(t_date)
        daily_map[d_str]['total'] += 1
        if getattr(t, 'status', '') == 'TP Hit':
            daily_map[d_str]['tp_hits'] += 1
        elif getattr(t, 'status', '') == 'SL Hit':
            daily_map[d_str]['sl_hits'] += 1

    daily_breakdown = []
    for d, vals in sorted(daily_map.items()):
        wr = round((vals['tp_hits'] / vals['total'] * 100), 1) if vals['total'] > 0 else 0.0
        daily_breakdown.append({
            'date': d,
            'total': vals['total'],
            'tp_hits': vals['tp_hits'],
            'sl_hits': vals['sl_hits'],
            'win_rate': wr
        })

    # Strategy Performance
    strategy_map = defaultdict(lambda: {'total': 0, 'tp_hits': 0, 'sl_hits': 0, 'rr_list': []})
    for t in trades:
        strat = (getattr(t, 'strategy', None) or 'Unspecified').strip()
        if not strat:
            strat = 'Unspecified'
        strategy_map[strat]['total'] += 1
        if getattr(t, 'status', '') == 'TP Hit':
            strategy_map[strat]['tp_hits'] += 1
        elif getattr(t, 'status', '') == 'SL Hit':
            strategy_map[strat]['sl_hits'] += 1

        rr_n = getattr(t, 'rr_numeric', None)
        if rr_n is None:
            rr_n = parse_rr_to_ratio(getattr(t, 'rr', None))
        if rr_n:
            strategy_map[strat]['rr_list'].append(rr_n)

    strategy_performance = []
    for strat, data in strategy_map.items():
        tot = data['total']
        tps = data['tp_hits']
        sls = data['sl_hits']
        rrs = data['rr_list']
        strategy_performance.append({
            'strategy': strat,
            'total_trades': tot,
            'tp_hits': tps,
            'sl_hits': sls,
            'win_rate': round((tps / tot * 100), 2) if tot > 0 else 0.0,
            'avg_rr': round(sum(rrs) / len(rrs), 2) if rrs else 0.0
        })
    strategy_performance.sort(key=lambda x: (x['win_rate'], x['total_trades']), reverse=True)

    # Instrument Performance
    instrument_map = defaultdict(lambda: {'total': 0, 'tp_hits': 0, 'sl_hits': 0})
    for t in trades:
        inst = (getattr(t, 'instrument', '') or 'Unknown').strip().upper()
        instrument_map[inst]['total'] += 1
        if getattr(t, 'status', '') == 'TP Hit':
            instrument_map[inst]['tp_hits'] += 1
        elif getattr(t, 'status', '') == 'SL Hit':
            instrument_map[inst]['sl_hits'] += 1

    instrument_performance = []
    for inst, data in instrument_map.items():
        tot = data['total']
        tps = data['tp_hits']
        instrument_performance.append({
            'instrument': inst,
            'total_trades': tot,
            'tp_hits': tps,
            'sl_hits': data['sl_hits'],
            'win_rate': round((tps / tot * 100), 2) if tot > 0 else 0.0
        })
    instrument_performance.sort(key=lambda x: (x['win_rate'], x['total_trades']), reverse=True)

    # Market Performance
    market_map = defaultdict(lambda: {'total': 0, 'tp_hits': 0, 'sl_hits': 0, 'rr_list': []})
    for t in trades:
        market = (getattr(t, 'market_type', None) or 'Indian Market').strip()
        market_map[market]['total'] += 1
        if getattr(t, 'status', '') == 'TP Hit':
            market_map[market]['tp_hits'] += 1
        elif getattr(t, 'status', '') == 'SL Hit':
            market_map[market]['sl_hits'] += 1

        rr_n = getattr(t, 'rr_numeric', None)
        if rr_n is None:
            rr_n = parse_rr_to_ratio(getattr(t, 'rr', None))
        if rr_n:
            market_map[market]['rr_list'].append(rr_n)

    market_performance = []
    for market, data in market_map.items():
        tot = data['total']
        tps = data['tp_hits']
        rrs = data['rr_list']
        market_performance.append({
            'market_type': market,
            'total_trades': tot,
            'tp_hits': tps,
            'sl_hits': data['sl_hits'],
            'win_rate': round((tps / tot * 100), 2) if tot > 0 else 0.0,
            'avg_rr': round(sum(rrs) / len(rrs), 2) if rrs else 0.0
        })
    market_performance.sort(key=lambda x: x['total_trades'], reverse=True)

    return {
        'total_trades': total_trades,
        'tp_hits': tp_hits,
        'sl_hits': sl_hits,
        'win_rate': win_rate,
        'loss_rate': loss_rate,
        'buy_trades': buy_trades,
        'sell_trades': sell_trades,
        'avg_rr': avg_rr,
        'trend_chart': trend_chart,
        'daily_breakdown': daily_breakdown,
        'strategy_performance': strategy_performance,
        'instrument_performance': instrument_performance,
        'market_performance': market_performance
    }
