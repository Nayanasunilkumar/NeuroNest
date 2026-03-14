import json

from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from database.models import db, User, Alert, Appointment
from datetime import datetime, timedelta
from collections import deque
from extensions.socket import socketio
from services.notification_service import NotificationService
from utils.pdf_generator import generate_assessment_report

vitals_bp = Blueprint("vitals", __name__)

# ─── In-memory latest reading (for real-time display) ───────────
_latest = {
    "hr": None, "spo2": None, "temp": None,
    "signal": "na",
    "hr_alert": 0, "spo2_alert": 0, "temp_alert": 0,
    "ts": None
}
_history = deque(maxlen=60)  # last 60 valid readings


# ─── Alert State Tracking ───────────
_last_alert_time = {}
ALERT_COOLDOWN_MINUTES = 5

def check_and_trigger_alerts(patient_id, data):
    # Thresholds
    thresholds = [
        {"type": "SPO2", "val": data.get("spo2"), "is_crit": lambda v: v < 90, "msg": "Oxygen level below safe threshold ({}%)"},
        {"type": "Heart Rate", "val": data.get("hr"), "is_crit": lambda v: v > 120 or v < 40, "msg": "Heart rate critical ({} BPM)"},
        {"type": "Temperature", "val": data.get("temp"), "is_crit": lambda v: v > 39.0 or v < 35.0, "msg": "Temperature critical ({}°C)"}
    ]

    now = datetime.utcnow()

    for t in thresholds:
        val = t["val"]
        if val is None:
            continue
        try:
            val = float(val)
        except ValueError:
            continue
            
        if t["is_crit"](val):
            vital_type = t["type"]
            key = (patient_id, vital_type)
            
            # Check cooldown
            if key in _last_alert_time:
                last_time = _last_alert_time[key]
                if now - last_time < timedelta(minutes=ALERT_COOLDOWN_MINUTES):
                    continue # Skip, in cooldown
            
            # Trigger alert
            _last_alert_time[key] = now
            msg = t["msg"].format(val)
            
            try:
                alert = Alert(
                    patient_id=patient_id,
                    vital_type=vital_type,
                    value=val,
                    severity="CRITICAL",
                    message=msg,
                    created_at=now
                )
                db.session.add(alert)
                db.session.commit()
                
                # Emit WebSocket
                socketio.emit("critical_alert", alert.to_dict())
                
                # Send Email
                send_critical_alert_email(patient_id, alert)
                
            except Exception as e:
                db.session.rollback()
                print(f"[VITALS ALERT ERROR] {e}")

def send_critical_alert_email(patient_id, alert):
    patient = User.query.get(patient_id)
    if not patient:
        return
        
    appointment = Appointment.query.filter_by(patient_id=patient_id).order_by(Appointment.created_at.desc()).first()
    doctor_email = appointment.doctor.email if appointment and appointment.doctor else None
        
    subject = f"🚨 NeuroNest Critical Alert – Patient {alert.vital_type} Critical"
    body = (
        f"Critical Health Alert Detected\n\n"
        f"Patient: {patient.full_name or 'Unknown'}\n"
        f"Vital: {alert.vital_type}\n"
        f"Alert Message: {alert.message}\n"
        f"Current Value: {alert.value}\n\n"
        f"Time: {alert.created_at.strftime('%b %d, %I:%M %p')} UTC\n\n"
        f"Immediate medical attention may be required.\n\n"
        f"View patient dashboard:\n"
        f"https://neuronest.app/alerts"
    )
    
    if doctor_email:
        NotificationService.send_email(doctor_email, subject, body, event_type="critical")
        
    if patient.email:
        NotificationService.send_email(patient.email, subject, body, event_type="critical")


# =========================================
# ESP32 → POST /api/vitals/update
# No auth needed (device posts directly)
# =========================================
@vitals_bp.route("/api/vitals/update", methods=["POST"])
def receive_vitals():
    data = request.get_json(silent=True)
    if not data:
        raw = request.get_data(as_text=True) or ""
        try:
            data = json.loads(raw)
        except Exception:
            print("[VITALS] Invalid payload:", raw)
            return jsonify({"error": "No data"}), 400

    # Attach optional patient_id if provided (useful for multi-patient routing)
    patient_id = int(data.get("patient_id", 0) or 0)

    _latest.update({
        "patient_id": patient_id,
        "hr":         data.get("hr"),
        "spo2":       data.get("spo2"),
        "temp":       data.get("temp"),
        "signal":     data.get("signal", "na"),
        "hr_alert":   int(data.get("hr_alert", 0)),
        "spo2_alert": int(data.get("spo2_alert", 0)),
        "temp_alert": int(data.get("temp_alert", 0)),
        # Include Z so JS treats this as UTC (avoids local timezone skew)
        "ts":         datetime.utcnow().isoformat() + "Z"
    })

    # Debug log: show incoming vitals
    print("[VITALS] Received", _latest)

    # Emit to all connected clients (fallback for missing room joins)
    socketio.emit("vitals_update", _latest)

    # Save to history only when signal is valid
    if data.get("signal") in ("ok", "weak"):
        _history.append({**_latest})

    # Trigger Critical Alerts based on thresholds
    if patient_id > 0 and data.get("signal") in ("ok", "weak"):
        check_and_trigger_alerts(patient_id, data)

    # Optionally persist to DB (uncomment if you want DB storage)
    # try:
    #     reading = VitalReading(
    #         hr=data.get("hr"),
    #         spo2=data.get("spo2"),
    #         temp=data.get("temp"),
    #         signal=data.get("signal", "na"),
    #         hr_alert=bool(data.get("hr_alert")),
    #         spo2_alert=bool(data.get("spo2_alert")),
    #         temp_alert=bool(data.get("temp_alert")),
    #     )
    #     db.session.add(reading)
    #     db.session.commit()
    # except Exception as e:
    #     print(f"[VITALS DB] Warning: {e}")

    return jsonify({"status": "ok"}), 200


# =========================================
# Frontend → GET /api/vitals/latest
# Requires JWT (patient only)
# =========================================
@vitals_bp.route("/api/vitals/latest", methods=["GET"])
@jwt_required()
def get_latest():
    claims = get_jwt()
    if claims.get("role") not in ("patient", "doctor", "admin"):
        return jsonify({"message": "Access denied"}), 403
    return jsonify(_latest), 200


# =========================================
# Frontend → GET /api/vitals/history
# Requires JWT (patient only)
# =========================================
@vitals_bp.route("/api/vitals/history", methods=["GET"])
@jwt_required()
def get_history():
    claims = get_jwt()
    if claims.get("role") not in ("patient", "doctor", "admin"):
        return jsonify({"message": "Access denied"}), 403
    return jsonify(list(_history)), 200


# =========================================
# Doctor → GET /api/vitals/patients
# Returns list of monitored patients
# =========================================
@vitals_bp.route("/api/vitals/patients", methods=["GET"])
@jwt_required()
def get_monitored_patients():
    claims = get_jwt()
    if claims.get("role") not in ("doctor", "admin"):
        return jsonify({"message": "Access denied"}), 403
    # Return current patient if vitals are active
    if _latest.get("ts"):
        return jsonify([{"patient_id": 1, "patient_name": "Jane (ESP32)"}]), 200
    return jsonify([]), 200


# =========================================
# Patient → GET /api/vitals/assessment-report
# Generates and downloads PDF assessment report
# =========================================
@vitals_bp.route("/api/vitals/assessment-report", methods=["GET"])
@jwt_required()
def get_assessment_report():
    claims = get_jwt()
    if claims.get("role") not in ("patient", "doctor", "admin"):
        return jsonify({"message": "Access denied"}), 403
    
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    # Prepare data for PDF
    patient_data = {
        "full_name": user.full_name or "N/A",
        "email": user.email
    }
    
    # Calculate summary
    history_list = list(_history)
    alerts = []
    if history_list:
        hrs = [h['hr'] for h in history_list if h.get('hr')]
        spo2s = [h['spo2'] for h in history_list if h.get('spo2')]
        temps = [h['temp'] for h in history_list if h.get('temp')]
        
        hr_avg = round(sum(hrs) / len(hrs), 1) if hrs else None
        spo2_avg = round(sum(spo2s) / len(spo2s), 1) if spo2s else None
        temp_avg = round(sum(temps) / len(temps), 1) if temps else None
        
        # Simple alert logic
        if hr_avg and (hr_avg < 60 or hr_avg > 100):
            alerts.append(f"Average heart rate ({hr_avg} BPM) is outside normal range (60-100 BPM)")
        if spo2_avg and spo2_avg < 95:
            alerts.append(f"Average SpO2 ({spo2_avg}%) is below normal (≥95%)")
        if temp_avg and (temp_avg < 36.1 or temp_avg > 37.5):
            alerts.append(f"Average temperature ({temp_avg}°C) is outside normal range (36.1-37.5°C)")
    else:
        hr_avg = spo2_avg = temp_avg = None
    
    summary_data = {
        "hr_avg": hr_avg,
        "spo2_avg": spo2_avg,
        "temp_avg": temp_avg,
        "alerts": alerts
    }
    
    data = {
        "patient": patient_data,
        "latest": _latest,
        "history": history_list,
        "summary": summary_data
    }
    
    # Generate PDF
    pdf_buffer = generate_assessment_report(data)
    
    # Return PDF
    filename = f"NeuroNest_Assessment_{user.full_name.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.pdf"
    return send_file(
        pdf_buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=filename
    )
