from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Journal

journal_bp = Blueprint('journal', __name__, url_prefix='/api/journal')

def parse_date(val):
    if not val:
        return None
    if isinstance(val, str):
        try:
            return datetime.strptime(val, '%Y-%m-%d').date()
        except ValueError:
            return None
    return val

@journal_bp.route('', methods=['GET'])
@jwt_required()
def get_journals():
    user_id = int(get_jwt_identity())
    query = Journal.query.filter_by(user_id=user_id)

    search = request.args.get('search', '').strip()
    if search:
        search_pat = f"%{search}%"
        query = query.filter(
            (Journal.title.ilike(search_pat)) |
            (Journal.notes.ilike(search_pat)) |
            (Journal.lesson.ilike(search_pat)) |
            (Journal.market.ilike(search_pat))
        )

    mood = request.args.get('mood', '').strip()
    if mood:
        query = query.filter(Journal.mood.ilike(f"%{mood}%"))

    market = request.args.get('market', '').strip()
    if market:
        query = query.filter(Journal.market.ilike(f"%{market}%"))

    journals = query.order_by(Journal.journal_date.desc(), Journal.created_at.desc()).all()
    return jsonify({
        'journals': [j.to_dict() for j in journals],
        'total': len(journals)
    }), 200

@journal_bp.route('/<int:journal_id>', methods=['GET'])
@jwt_required()
def get_journal(journal_id):
    user_id = int(get_jwt_identity())
    journal = db.session.get(Journal, journal_id)
    if not journal or journal.user_id != user_id:
        return jsonify({'error': 'Journal entry not found.'}), 404
    return jsonify({'journal': journal.to_dict()}), 200

@journal_bp.route('', methods=['POST'])
@jwt_required()
def create_journal():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    title = str(data.get('title', '')).strip()
    if not title:
        return jsonify({'error': 'Title is required.'}), 400

    journal_date = parse_date(data.get('journal_date'))
    if not journal_date:
        return jsonify({'error': 'A valid date is required (YYYY-MM-DD).'}), 400

    journal = Journal(
        user_id=user_id,
        title=title,
        journal_date=journal_date,
        market=str(data.get('market', '')).strip() or None,
        mood=str(data.get('mood', '')).strip() or None,
        notes=str(data.get('notes', '')).strip() or None,
        lesson=str(data.get('lesson', '')).strip() or None
    )

    db.session.add(journal)
    db.session.commit()

    return jsonify({
        'message': 'Journal entry created successfully.',
        'journal': journal.to_dict()
    }), 201

@journal_bp.route('/<int:journal_id>', methods=['PUT'])
@jwt_required()
def update_journal(journal_id):
    user_id = int(get_jwt_identity())
    journal = db.session.get(Journal, journal_id)
    if not journal or journal.user_id != user_id:
        return jsonify({'error': 'Journal entry not found.'}), 404

    data = request.get_json() or {}

    if 'title' in data:
        t = str(data.get('title', '')).strip()
        if not t:
            return jsonify({'error': 'Title cannot be empty.'}), 400
        journal.title = t

    if 'journal_date' in data:
        d = parse_date(data.get('journal_date'))
        if not d:
            return jsonify({'error': 'A valid date is required.'}), 400
        journal.journal_date = d

    if 'market' in data:
        journal.market = str(data.get('market', '')).strip() or None

    if 'mood' in data:
        journal.mood = str(data.get('mood', '')).strip() or None

    if 'notes' in data:
        journal.notes = str(data.get('notes', '')).strip() or None

    if 'lesson' in data:
        journal.lesson = str(data.get('lesson', '')).strip() or None

    db.session.commit()

    return jsonify({
        'message': 'Journal entry updated successfully.',
        'journal': journal.to_dict()
    }), 200

@journal_bp.route('/<int:journal_id>', methods=['DELETE'])
@jwt_required()
def delete_journal(journal_id):
    user_id = int(get_jwt_identity())
    journal = db.session.get(Journal, journal_id)
    if not journal or journal.user_id != user_id:
        return jsonify({'error': 'Journal entry not found.'}), 404

    db.session.delete(journal)
    db.session.commit()

    return jsonify({'message': 'Journal entry deleted successfully.'}), 200
