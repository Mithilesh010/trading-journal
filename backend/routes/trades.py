import os
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Trade
from services.upload_service import save_screenshot, delete_screenshot

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

@trades_bp.route('', methods=['GET'])
@jwt_required()
def get_trades():
    user_id = int(get_jwt_identity())
    
    # Query only this user's trades
    query = Trade.query.filter_by(user_id=user_id)

    # Search filter (instrument, strategy, setup, notes)
    search = request.args.get('search', '').strip()
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Trade.instrument.ilike(search_pattern)) |
            (Trade.strategy.ilike(search_pattern)) |
            (Trade.setup.ilike(search_pattern)) |
            (Trade.notes.ilike(search_pattern))
        )

    # Specific filters
    instrument = request.args.get('instrument', '').strip()
    if instrument:
        query = query.filter(Trade.instrument.ilike(f"%{instrument}%"))

    side = request.args.get('side', '').strip().upper()
    if side in ('BUY', 'SELL'):
        query = query.filter_by(side=side)

    status = request.args.get('status', '').strip().capitalize()
    if status in ('Open', 'Closed'):
        query = query.filter_by(status=status)

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

    if sort_by == 'trade_date':
        sort_col = Trade.trade_date
    elif sort_by == 'instrument':
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

    # Check if multipart or json
    if request.content_type and 'multipart/form-data' in request.content_type:
        form_data = request.form
        screenshot_file = request.files.get('screenshot')
    else:
        form_data = request.get_json() or {}
        screenshot_file = None

    trade_date_raw = form_data.get('trade_date')
    trade_date = parse_date(trade_date_raw)
    if not trade_date:
        return jsonify({'error': 'A valid trade date (YYYY-MM-DD) is required.'}), 400

    entry_time = str(form_data.get('entry_time', '')).strip()
    if not entry_time:
        return jsonify({'error': 'Entry time is required.'}), 400

    instrument = str(form_data.get('instrument', '')).strip().upper()
    if not instrument:
        return jsonify({'error': 'Instrument is required.'}), 400

    side = str(form_data.get('side', '')).strip().upper()
    if side not in ('BUY', 'SELL'):
        return jsonify({'error': 'Side must be BUY or SELL.'}), 400

    quantity = parse_float(form_data.get('quantity'))
    if quantity is None or quantity <= 0:
        return jsonify({'error': 'Quantity must be greater than 0.'}), 400

    entry_price = parse_float(form_data.get('entry_price'))
    if entry_price is None or entry_price <= 0:
        return jsonify({'error': 'Entry price must be greater than 0.'}), 400

    exit_time = str(form_data.get('exit_time', '')).strip() or None
    exit_price = parse_float(form_data.get('exit_price'))
    stop_loss = parse_float(form_data.get('stop_loss'))
    target = parse_float(form_data.get('target'))

    # Auto-determine status: If exit price and exit time provided, status is Closed
    status_input = str(form_data.get('status', '')).strip().capitalize()
    if exit_price is not None and exit_time is not None:
        status = 'Closed'
    elif status_input in ('Open', 'Closed'):
        status = status_input
    else:
        status = 'Open' if exit_price is None else 'Closed'

    if status == 'Closed' and (exit_price is None or exit_price <= 0):
        return jsonify({'error': 'Exit price must be greater than 0 for a closed trade.'}), 400

    # Save screenshot if provided
    screenshot_path = None
    if screenshot_file:
        try:
            screenshot_path = save_screenshot(screenshot_file, user_id)
        except ValueError as e:
            return jsonify({'error': str(e)}), 400

    trade = Trade(
        user_id=user_id,
        trade_date=trade_date,
        entry_time=entry_time,
        exit_time=exit_time,
        instrument=instrument,
        side=side,
        quantity=quantity,
        entry_price=entry_price,
        exit_price=exit_price,
        stop_loss=stop_loss,
        target=target,
        strategy=str(form_data.get('strategy', '')).strip() or None,
        setup=str(form_data.get('setup', '')).strip() or None,
        entry_reason=str(form_data.get('entry_reason', '')).strip() or None,
        exit_reason=str(form_data.get('exit_reason', '')).strip() or None,
        screenshot_path=screenshot_path,
        notes=str(form_data.get('notes', '')).strip() or None,
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
        screenshot_file = request.files.get('screenshot')
    else:
        form_data = request.get_json() or {}
        screenshot_file = None

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

    if 'instrument' in form_data:
        inst = str(form_data.get('instrument', '')).strip().upper()
        if not inst:
            return jsonify({'error': 'Instrument cannot be empty.'}), 400
        trade.instrument = inst

    if 'side' in form_data:
        s = str(form_data.get('side', '')).strip().upper()
        if s not in ('BUY', 'SELL'):
            return jsonify({'error': 'Side must be BUY or SELL.'}), 400
        trade.side = s

    if 'quantity' in form_data:
        q = parse_float(form_data.get('quantity'))
        if q is None or q <= 0:
            return jsonify({'error': 'Quantity must be greater than 0.'}), 400
        trade.quantity = q

    if 'entry_price' in form_data:
        ep = parse_float(form_data.get('entry_price'))
        if ep is None or ep <= 0:
            return jsonify({'error': 'Entry price must be greater than 0.'}), 400
        trade.entry_price = ep

    if 'exit_time' in form_data:
        trade.exit_time = str(form_data.get('exit_time', '')).strip() or None

    if 'exit_price' in form_data:
        trade.exit_price = parse_float(form_data.get('exit_price'))

    if 'stop_loss' in form_data:
        trade.stop_loss = parse_float(form_data.get('stop_loss'))

    if 'target' in form_data:
        trade.target = parse_float(form_data.get('target'))

    if 'strategy' in form_data:
        trade.strategy = str(form_data.get('strategy', '')).strip() or None

    if 'setup' in form_data:
        trade.setup = str(form_data.get('setup', '')).strip() or None

    if 'entry_reason' in form_data:
        trade.entry_reason = str(form_data.get('entry_reason', '')).strip() or None

    if 'exit_reason' in form_data:
        trade.exit_reason = str(form_data.get('exit_reason', '')).strip() or None

    if 'notes' in form_data:
        trade.notes = str(form_data.get('notes', '')).strip() or None

    # Handle status
    if 'status' in form_data:
        trade.status = str(form_data.get('status', '')).strip().capitalize()
    # Auto-close if exit price and exit time are present
    if trade.exit_price is not None and trade.exit_time is not None:
        trade.status = 'Closed'

    if trade.status == 'Closed' and (trade.exit_price is None or trade.exit_price <= 0):
        return jsonify({'error': 'Exit price must be greater than 0 for a closed trade.'}), 400

    # Handle screenshot removal or replacement
    remove_screenshot = form_data.get('remove_screenshot') in ('true', '1', True)
    if remove_screenshot and trade.screenshot_path:
        delete_screenshot(trade.screenshot_path)
        trade.screenshot_path = None

    if screenshot_file:
        try:
            if trade.screenshot_path:
                delete_screenshot(trade.screenshot_path)
            trade.screenshot_path = save_screenshot(screenshot_file, user_id)
        except ValueError as e:
            return jsonify({'error': str(e)}), 400

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

    if trade.screenshot_path:
        delete_screenshot(trade.screenshot_path)

    db.session.delete(trade)
    db.session.commit()

    return jsonify({'message': 'Trade deleted successfully.'}), 200

@trades_bp.route('/<int:trade_id>/screenshot', methods=['GET'])
@jwt_required()
def get_trade_screenshot(trade_id):
    """Securely serves trade screenshot ONLY to the owner."""
    user_id = int(get_jwt_identity())
    trade = db.session.get(Trade, trade_id)
    if not trade or trade.user_id != user_id or not trade.screenshot_path:
        return jsonify({'error': 'Screenshot not found or access denied.'}), 404

    upload_dir = current_app.config['UPLOAD_FOLDER']
    return send_from_directory(upload_dir, trade.screenshot_path)
