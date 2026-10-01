from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Trade
from models.trade import MARKET_TYPES, STATUS_TYPES, POSITION_TYPES

trades_bp = Blueprint('trades', __name__, url_prefix='/api/trades')

def parse_float(val):
    if val is None or val == '':
        return None
    try:
        return float(val)
    except (ValueError, TypeError):
        return None

def parse_date(val):
    if not val:
        return None
    if isinstance(val, str):
        try:
            return datetime.strptime(val, '%Y-%m-%d').date()
        except ValueError:
            return None
    return val

def normalize_status(val):
    if not val:
        return None
    s = str(val).strip().lower()
    if 'tp' in s:
        return 'TP Hit'
    if 'sl' in s:
        return 'SL Hit'
    if s in ('closed', 'win'):
        return 'TP Hit'
    if s in ('open', 'loss'):
        return 'SL Hit'
    return None

@trades_bp.route('', methods=['GET'])
@jwt_required()
def get_trades():
    user_id = int(get_jwt_identity())
    query = Trade.query.filter_by(user_id=user_id)

    # Search filter (instrument, strategy, notes)
    search = request.args.get('search', '').strip()
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Trade.instrument.ilike(search_pattern)) |
            (Trade.strategy.ilike(search_pattern)) |
            (Trade.notes.ilike(search_pattern))
        )

    # Specific filters
    market_type = request.args.get('market_type', '').strip()
    if market_type in MARKET_TYPES:
        query = query.filter_by(market_type=market_type)

    instrument = request.args.get('instrument', '').strip()
    if instrument:
        query = query.filter(Trade.instrument.ilike(f"%{instrument}%"))

    side = request.args.get('side', '').strip().upper() or request.args.get('position', '').strip().upper()
    if side in POSITION_TYPES:
        query = query.filter_by(side=side)

    status_arg = request.args.get('status', '').strip()
    norm_status = normalize_status(status_arg)
    if norm_status:
        query = query.filter_by(status=norm_status)

    strategy = request.args.get('strategy', '').strip()
    if strategy:
        query = query.filter(Trade.strategy.ilike(f"%{strategy}%"))

    date_from = request.args.get('date_from')
    if date_from:
        d_from = parse_date(date_from)
        if d_from:
            query = query.filter(Trade.trade_date >= d_from)

    date_to = request.args.get('date_to')
    if date_to:
        d_to = parse_date(date_to)
        if d_to:
            query = query.filter(Trade.trade_date <= d_to)

    # Sorting
    sort_by = request.args.get('sort_by', 'trade_date')
    order = request.args.get('order', 'desc')

    if sort_by == 'instrument':
        sort_col = Trade.instrument
    elif sort_by == 'status':
        sort_col = Trade.status
    else:
        sort_col = Trade.trade_date

    if order == 'asc':
        query = query.order_by(sort_col.asc(), Trade.entry_time.asc())
    else:
        query = query.order_by(sort_col.desc(), Trade.entry_time.desc())

    trades = query.all()
    return jsonify({
        'trades': [t.to_dict() for t in trades],
        'total': len(trades)
    }), 200

@trades_bp.route('/<int:trade_id>', methods=['GET'])
@jwt_required()
def get_trade(trade_id):
    user_id = int(get_jwt_identity())
    trade = db.session.get(Trade, trade_id)
    if not trade or trade.user_id != user_id:
        return jsonify({'error': 'Trade not found.'}), 404
    return jsonify({'trade': trade.to_dict()}), 200

@trades_bp.route('', methods=['POST'])
@jwt_required()
def create_trade():
    user_id = int(get_jwt_identity())

    if request.content_type and 'multipart/form-data' in request.content_type:
        form_data = request.form
    else:
        form_data = request.get_json() or {}

    trade_date_raw = form_data.get('trade_date')
    trade_date = parse_date(trade_date_raw)
    if not trade_date:
        return jsonify({'error': 'A valid trade date (YYYY-MM-DD) is required.'}), 400

    entry_time = str(form_data.get('entry_time', '')).strip()
    if not entry_time:
        return jsonify({'error': 'Entry time is required.'}), 400

    exit_time = str(form_data.get('exit_time', '')).strip() or None

    market_type = str(form_data.get('market_type', 'Indian Market')).strip()
    if market_type not in MARKET_TYPES:
        return jsonify({'error': f'Market type must be one of: {", ".join(MARKET_TYPES)}'}), 400

    instrument = str(form_data.get('instrument', '')).strip().upper()
    if not instrument:
        return jsonify({'error': 'Instrument is required.'}), 400

    side = (str(form_data.get('side', '')).strip() or str(form_data.get('position', '')).strip()).upper()
    if side not in POSITION_TYPES:
        return jsonify({'error': 'Position must be BUY or SELL.'}), 400

    # Position size dynamically by market
    quantity = None
    lot_size = None
    lots = None

    if market_type == 'Indian Market':
        quantity = parse_float(form_data.get('quantity'))
        if quantity is None or quantity <= 0:
            return jsonify({'error': 'Quantity must be greater than 0 for Indian Market.'}), 400
    else:
        lot_size = parse_float(form_data.get('lot_size'))
        lots = parse_float(form_data.get('lots'))
        if lot_size is None or lot_size <= 0:
            return jsonify({'error': f'Lot Size must be greater than 0 for {market_type}.'}), 400
        if lots is None or lots <= 0:
            return jsonify({'error': f'Lots must be greater than 0 for {market_type}.'}), 400

    strategy = str(form_data.get('strategy', '')).strip() or None
    notes = str(form_data.get('notes', '')).strip() or None

    rr = str(form_data.get('rr', '')).strip()
    if not rr:
        return jsonify({'error': 'R:R is required (e.g. 1:1, 1:1.5, 1:2, 1:3).'}), 400

    status = normalize_status(form_data.get('status'))
    if not status:
        return jsonify({'error': 'Result / Status must be either "TP Hit" or "SL Hit".'}), 400

    trade = Trade(
        user_id=user_id,
        trade_date=trade_date,
        entry_time=entry_time,
        exit_time=exit_time,
        market_type=market_type,
        instrument=instrument,
        side=side,
        quantity=quantity,
        lot_size=lot_size,
        lots=lots,
        strategy=strategy,
        notes=notes,
        rr=rr,
        status=status
    )

    db.session.add(trade)
    db.session.commit()

    return jsonify({
        'message': 'Trade recorded successfully.',
        'trade': trade.to_dict()
    }), 201

@trades_bp.route('/<int:trade_id>', methods=['PUT'])
@jwt_required()
def update_trade(trade_id):
    user_id = int(get_jwt_identity())
    trade = db.session.get(Trade, trade_id)
    if not trade or trade.user_id != user_id:
        return jsonify({'error': 'Trade not found.'}), 404

    if request.content_type and 'multipart/form-data' in request.content_type:
        form_data = request.form
    else:
        form_data = request.get_json() or {}

    if 'trade_date' in form_data:
        d = parse_date(form_data.get('trade_date'))
        if not d:
            return jsonify({'error': 'Invalid trade date.'}), 400
        trade.trade_date = d

    if 'entry_time' in form_data:
        t = str(form_data.get('entry_time', '')).strip()
        if not t:
            return jsonify({'error': 'Entry time cannot be empty.'}), 400
        trade.entry_time = t

    if 'exit_time' in form_data:
        trade.exit_time = str(form_data.get('exit_time', '')).strip() or None

    if 'market_type' in form_data:
        mt = str(form_data.get('market_type', '')).strip()
        if mt not in MARKET_TYPES:
            return jsonify({'error': 'Invalid market type.'}), 400
        trade.market_type = mt

    if 'instrument' in form_data:
        inst = str(form_data.get('instrument', '')).strip().upper()
        if not inst:
            return jsonify({'error': 'Instrument cannot be empty.'}), 400
        trade.instrument = inst

    if 'side' in form_data or 'position' in form_data:
        s = (str(form_data.get('side', '')).strip() or str(form_data.get('position', '')).strip()).upper()
        if s not in POSITION_TYPES:
            return jsonify({'error': 'Position must be BUY or SELL.'}), 400
        trade.side = s

    # Position Size
    target_market = trade.market_type or 'Indian Market'
    if target_market == 'Indian Market':
        if 'quantity' in form_data:
            q = parse_float(form_data.get('quantity'))
            if q is None or q <= 0:
                return jsonify({'error': 'Quantity must be greater than 0.'}), 400
            trade.quantity = q
        trade.lot_size = None
        trade.lots = None
    else:
        if 'lot_size' in form_data:
            ls = parse_float(form_data.get('lot_size'))
            if ls is None or ls <= 0:
                return jsonify({'error': 'Lot size must be greater than 0.'}), 400
            trade.lot_size = ls
        if 'lots' in form_data:
            l = parse_float(form_data.get('lots'))
            if l is None or l <= 0:
                return jsonify({'error': 'Lots must be greater than 0.'}), 400
            trade.lots = l
        trade.quantity = None

    if 'strategy' in form_data:
        trade.strategy = str(form_data.get('strategy', '')).strip() or None

    if 'notes' in form_data:
        trade.notes = str(form_data.get('notes', '')).strip() or None

    if 'rr' in form_data:
        rr = str(form_data.get('rr', '')).strip()
        if not rr:
            return jsonify({'error': 'R:R cannot be empty.'}), 400
        trade.rr = rr

    if 'status' in form_data:
        st = normalize_status(form_data.get('status'))
        if not st:
            return jsonify({'error': 'Status must be "TP Hit" or "SL Hit".'}), 400
        trade.status = st

    db.session.commit()

    return jsonify({
        'message': 'Trade updated successfully.',
        'trade': trade.to_dict()
    }), 200

@trades_bp.route('/<int:trade_id>', methods=['DELETE'])
@jwt_required()
def delete_trade(trade_id):
    user_id = int(get_jwt_identity())
    trade = db.session.get(Trade, trade_id)
    if not trade or trade.user_id != user_id:
        return jsonify({'error': 'Trade not found.'}), 404

    db.session.delete(trade)
    db.session.commit()

    return jsonify({'message': 'Trade deleted successfully.'}), 200
