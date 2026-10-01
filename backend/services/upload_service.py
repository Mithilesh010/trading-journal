import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_screenshot(file_storage, user_id):
    """
    Saves an uploaded screenshot securely.
    Returns the relative filename (e.g. user_1_uuid.png).
    """
    if not file_storage or not file_storage.filename:
        return None

    if not allowed_file(file_storage.filename):
        raise ValueError("Invalid file format. Allowed formats: PNG, JPG, JPEG, WEBP")

    ext = file_storage.filename.rsplit('.', 1)[1].lower()
    unique_name = f"u{user_id}_{uuid.uuid4().hex}.{ext}"
    
    upload_dir = current_app.config['UPLOAD_FOLDER']
    os.makedirs(upload_dir, exist_ok=True)
    
    full_path = os.path.join(upload_dir, unique_name)
    file_storage.save(full_path)
    return unique_name

def delete_screenshot(filename):
    """Safely removes a screenshot file."""
    if not filename:
        return
    try:
        clean_name = os.path.basename(filename)
        full_path = os.path.join(current_app.config['UPLOAD_FOLDER'], clean_name)
        if os.path.exists(full_path):
            os.remove(full_path)
    except Exception:
        pass
