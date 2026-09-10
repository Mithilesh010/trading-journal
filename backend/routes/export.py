from datetime import datetime
from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity, decode_token
from models import db, User, Trade
from services.export_service import generate_excel_export, generate_pdf_export

export_bp = Blueprint('export', __name__, url_prefix='/api/export')

def get_current_user_from_req():
    """Extracts authenticated user from Authorization header or ?token query param."""
    auth_header = request.headers.get('Authorization')
    token = None
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
    elif request.args.get('token'):
        token = request.args.get('token')

    if not token:
        return None

    try:
        decoded = decode_token(token)
        user_id = int(decoded['sub'])
        return db.session.get(User, user_id)
    except Exception:
        return None

@export_bp.route('/excel', methods=['GET'])
def export_excel():
    user = get_current_user_from_req()
    if not user:
        return jsonify({'error': 'Unauthorized access.'}), 401

    range_param = request.args.get('range', 'all').lower()
    if range_param not in ('15days', '1month', 'all'):
        range_param = 'all'

    # STRICT: query ONLY this user's trades
    user_trades = Trade.query.filter_by(user_id=user.id).all()
    excel_stream = generate_excel_export(user_trades, user, range_param)

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"trading_terminal_{range_param}_{timestamp}.xlsx"

    return send_file(
        excel_stream,
        as_attachment=True,
        download_name=filename,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )

@export_bp.route('/pdf', methods=['GET'])
def export_pdf():
    user = get_current_user_from_req()
    if not user:
        return jsonify({'error': 'Unauthorized access.'}), 401

    range_param = request.args.get('range', 'all').lower()
    if range_param not in ('15days', '1month', 'all'):
        range_param = 'all'

    # STRICT: query ONLY this user's trades
    user_trades = Trade.query.filter_by(user_id=user.id).all()
    pdf_stream = generate_pdf_export(user_trades, user, range_param)

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"trading_terminal_{range_param}_{timestamp}.pdf"

    return send_file(
        pdf_stream,
        as_attachment=True,
        download_name=filename,
        mimetype='application/pdf'
    )
