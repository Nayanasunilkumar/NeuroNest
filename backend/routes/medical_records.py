from flask import Blueprint, request, jsonify, send_from_directory, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
from datetime import datetime
from database.models import db, MedicalRecord

medical_records_bp = Blueprint('medical_records', __name__, url_prefix='/medical-records')

ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@medical_records_bp.route('/', methods=['GET'])
@jwt_required()
def get_records():
    current_user_id = int(get_jwt_identity())
    records = MedicalRecord.query.filter_by(patient_id=current_user_id).order_by(MedicalRecord.created_at.desc()).all()

    return jsonify([record.to_dict() for record in records]), 200

@medical_records_bp.route('/', methods=['POST'])
@jwt_required()
def upload_record():
    current_user_id = int(get_jwt_identity())
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if file and allowed_file(file.filename):
        original_filename = secure_filename(file.filename)
        timestamp = int(datetime.utcnow().timestamp() * 1000)
        filename = f"{current_user_id}_{timestamp}_{original_filename}"
        
        upload_folder = os.path.join(current_app.root_path, 'uploads/medical_records')
        os.makedirs(upload_folder, exist_ok=True)
        
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)
        
        # Save relative path for DB
        db_path = f"uploads/medical_records/{filename}"
        
        new_record = MedicalRecord(
            patient_id=current_user_id,
            title=request.form.get('title'),
            category=request.form.get('category'),
            doctor_name=request.form.get('doctor_name'),
            description=request.form.get('description'),
            file_path=db_path,
            record_date=datetime.strptime(request.form.get('record_date'), '%Y-%m-%d') if request.form.get('record_date') else None
        )
        
        db.session.add(new_record)
        db.session.commit()
        
        return jsonify(new_record.to_dict()), 201
        
    return jsonify({'error': 'File type not allowed'}), 400

@medical_records_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_record(id):
    current_user_id = int(get_jwt_identity())
    record = MedicalRecord.query.get_or_404(id)
    
    if record.patient_id != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        full_path = os.path.join(current_app.root_path, record.file_path)
        if os.path.exists(full_path):
            os.remove(full_path)
    except Exception:
        pass
        
    db.session.delete(record)
    db.session.commit()
    return jsonify({'message': 'Record deleted'}), 200

@medical_records_bp.route('/download/<path:filename>', methods=['GET'])
@jwt_required()
def download_file(filename):
    current_user_id = int(get_jwt_identity())
    db_path = f"uploads/medical_records/{filename}"
    
    # Security check: Ensure file belongs to user
    record = MedicalRecord.query.filter_by(file_path=db_path, patient_id=current_user_id).first()
    
    if not record:
        return jsonify({'error': 'File not found or unauthorized'}), 404
        
    return send_from_directory(os.path.join(current_app.root_path, 'uploads/medical_records'), filename)
