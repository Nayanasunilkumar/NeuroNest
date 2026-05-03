from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from database.models import db, MedicalRecord
from utils.cloudinary_upload import upload_file, delete_file

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

    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400

    timestamp = int(datetime.utcnow().timestamp() * 1000)
    public_id = f"medical_records/{current_user_id}_{timestamp}"

    try:
        result = upload_file(file.stream, public_id=public_id, folder="neuronest/medical_records")
    except Exception as e:
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

    new_record = MedicalRecord(
        patient_id=current_user_id,
        title=request.form.get('title'),
        category=request.form.get('category'),
        doctor_name=request.form.get('doctor_name'),
        description=request.form.get('description'),
        file_path=result['secure_url'],          # Cloudinary HTTPS URL
        record_date=datetime.strptime(request.form.get('record_date'), '%Y-%m-%d')
            if request.form.get('record_date') else None,
    )
    new_record._cloudinary_public_id = result.get('public_id')  # store for deletion
    db.session.add(new_record)
    db.session.commit()

    return jsonify(new_record.to_dict()), 201


@medical_records_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_record(id):
    current_user_id = int(get_jwt_identity())
    record = MedicalRecord.query.get_or_404(id)

    if record.patient_id != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    # Delete from Cloudinary if it looks like a Cloudinary URL
    if record.file_path and 'cloudinary.com' in (record.file_path or ''):
        # public_id is embedded in the URL path after /upload/vXXX/
        try:
            parts = record.file_path.split('/upload/')
            if len(parts) == 2:
                public_id_with_ext = parts[1].split('/', 1)[-1]  # strip version
                public_id = public_id_with_ext.rsplit('.', 1)[0]  # strip extension
                delete_file(public_id)
        except Exception:
            pass

    db.session.delete(record)
    db.session.commit()
    return jsonify({'message': 'Record deleted'}), 200


@medical_records_bp.route('/download/<path:filename>', methods=['GET'])
@jwt_required()
def download_file(filename):
    """Legacy redirect — Cloudinary URLs are direct now, keeping for backward compat."""
    current_user_id = int(get_jwt_identity())
    record = MedicalRecord.query.filter_by(file_path=filename, patient_id=current_user_id).first()
    if not record:
        return jsonify({'error': 'File not found or unauthorized'}), 404
    # file_path is now a full Cloudinary URL — redirect client to it
    from flask import redirect
    return redirect(record.file_path)
