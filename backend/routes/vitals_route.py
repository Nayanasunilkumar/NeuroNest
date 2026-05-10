import hmac
import json
import threading
from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone

from flask import Blueprint, current_app, jsonify, request, send_file
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required
from werkzeug.security import check_password_hash

from database.models import Alert, Appointment, MedicalDevice, User, db
from extensions.socket import socketio
from modules.doctor.services.doctor_patient_service import get_doctor_scope_ids
from modules.shared.services.notification_service import NotificationService
from utils.pdf_generator import generate_assessment_report

vitals_bp = Blueprint("vitals", __name__)

_vitals_lock = threading.Lock()
_latest_by_patient = {}
_history_by_patient = defaultdict(lambda: deque(maxlen=60))
_last_alert_time = {}
_last_good_vitals_by_patient = {}
ALERT_COOLDOWN_MINUTES = 5
STALE_READING_SECONDS = 10
MONITORED_PATIENT_EMAILS = (
    "nezrin@gmail.com",
    "nezrinnoushad20@gmail.com",
)


def _utc_now():
    return datetime.now(timezone.utc)


def _serialize_timestamp(ts: datetime) -> str:
    return ts.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def _parse_timestamp(ts):
    if not ts:
        return None
    try:
        return datetime.fromisoformat(str(ts).replace("Z", "+00:00"))
    except ValueError:
        return None


def _coerce_patient_id(raw_value):
    if raw_value in (None, ""):
        return None
    try:
        return int(raw_value)
    except (TypeError, ValueError):
        return None


def _fallback_device_patient_id():
    patient = User.query.filter(
        User.role == "patient",
        User.email.in_(MONITORED_PATIENT_EMAILS),
    ).first()
    if patient:
        return int(patient.id)

    patient = User.query.filter(
        User.role == "patient",
        db.func.lower(User.full_name) == "nezrin",
    ).first()
    if patient:
        return int(patient.id)

    return None


def _configured_device_patient_id():
    configured_patient_id = current_app.config.get("VITALS_DEVICE_PATIENT_ID")
    if configured_patient_id:
        return int(configured_patient_id)

    configured_email = current_app.config.get("VITALS_DEVICE_PATIENT_EMAIL")
    if configured_email:
        patient = User.query.filter_by(email=configured_email).first()
        if patient and patient.role == "patient":
            return int(patient.id)

    return _fallback_device_patient_id()


def _resolve_presented_device_id(data):
    return (
        request.headers.get("X-Device-ID")
        or request.headers.get("X-Device-Id")
        or request.args.get("device_id")
        or (data or {}).get("device_id")
        or current_app.config.get("VITALS_DEVICE_ID")
    )


def _resolve_presented_device_token(data):
    auth_header = (request.headers.get("Authorization") or "").strip()
    bearer_token = ""
    if auth_header.lower().startswith("bearer "):
        bearer_token = auth_header[7:].strip()

    return (
        request.headers.get("X-Device-Token")
        or request.headers.get("X-Device-Token".lower())
        or bearer_token
        or request.args.get("device_token")
        or (data or {}).get("device_token")
    )


def _find_registered_device(device_id):
    if not device_id:
        return None
    return MedicalDevice.query.filter_by(device_id=str(device_id)).first()


def _device_token_matches(device, presented_token):
    if not device or not presented_token or not getattr(device, "device_token_hash", None):
        return False

    token_hash = str(device.device_token_hash)
    token = str(presented_token)
    try:
        if check_password_hash(token_hash, token):
            return True
    except Exception:
        pass

    return hmac.compare_digest(token_hash, token)


def _log_device_auth(status, **details):
    serialized = " ".join(f"{key}={value}" for key, value in details.items())
    current_app.logger.warning("[DEVICE AUTH] %s %s", status, serialized)


def _require_device_auth(data):
    auth_enabled = bool(current_app.config.get("VITALS_REQUIRE_DEVICE_AUTH", False))
    presented_device_id = _resolve_presented_device_id(data)
    presented_token = _resolve_presented_device_token(data)
    configured_device_id = current_app.config.get("VITALS_DEVICE_ID")
    configured_token = current_app.config.get("VITALS_DEVICE_TOKEN")
    registered_device = _find_registered_device(presented_device_id)

    if not auth_enabled:
        _log_device_auth(
            "bypass",
            auth_enabled=auth_enabled,
            device_id=presented_device_id or "none",
            configured_device_id=configured_device_id or "none",
        )
        return None

    if registered_device and _device_token_matches(registered_device, presented_token):
        _log_device_auth(
            "registry_accept",
            auth_enabled=auth_enabled,
            device_id=presented_device_id or "none",
            registered=True,
            patient_id=registered_device.patient_id,
        )
        return None

    if configured_token:
        if presented_token and hmac.compare_digest(str(presented_token), str(configured_token)):
            configured_id_ok = not configured_device_id or not presented_device_id or str(configured_device_id) == str(presented_device_id)
            if configured_id_ok:
                _log_device_auth(
                    "env_accept",
                    auth_enabled=auth_enabled,
                    device_id=presented_device_id or "none",
                    configured_device_id=configured_device_id or "none",
                )
                return None

    header_snapshot = {
        "x_device_id": request.headers.get("X-Device-ID") or request.headers.get("X-Device-Id"),
        "x_device_token_present": bool(request.headers.get("X-Device-Token")),
        "authorization_present": bool(request.headers.get("Authorization")),
        "content_type": request.headers.get("Content-Type"),
    }

    if not configured_token and not registered_device:
        _log_device_auth(
            "misconfigured",
            auth_enabled=auth_enabled,
            device_id=presented_device_id or "none",
            configured_device_id=configured_device_id or "none",
            configured=False,
            device_found=False,
            token_present=bool(presented_token),
            headers=header_snapshot,
        )
        return jsonify({"error": "Vitals device is not configured"}), 503

    _log_device_auth(
        "reject",
        auth_enabled=auth_enabled,
        device_id=presented_device_id or "none",
        configured_device_id=configured_device_id or "none",
        configured=bool(configured_token),
        device_found=bool(registered_device),
        token_present=bool(presented_token),
        headers=header_snapshot,
    )

    return jsonify({"error": "Unauthorized device"}), 401


def _resolve_ingest_patient_id(data):
    explicit_patient_id = _coerce_patient_id((data or {}).get("patient_id"))
    if explicit_patient_id:
        return explicit_patient_id
    presented_device_id = _resolve_presented_device_id(data)
    registered_device = _find_registered_device(presented_device_id)
    if registered_device and registered_device.patient_id:
        return int(registered_device.patient_id)
    return _configured_device_patient_id()


def _user_can_access_patient(user: User, patient_id: int) -> bool:
    if not user or not patient_id:
        return False

    if user.role == "patient":
        return int(user.id) == int(patient_id)

    if user.role in ("admin", "super_admin"):
        return True

    if user.role == "doctor":
        relationship = Appointment.query.filter_by(
            doctor_id=int(user.id),
            patient_id=int(patient_id),
        ).first()
        return relationship is not None

    return False


def _known_device_patient_ids():
    patient_ids = set()
    configured_patient_id = _configured_device_patient_id()
    if configured_patient_id:
        patient_ids.add(int(configured_patient_id))

    with _vitals_lock:
        patient_ids.update(int(patient_id) for patient_id in _latest_by_patient.keys())
        patient_ids.update(int(patient_id) for patient_id in _history_by_patient.keys())

    return patient_ids


def _history_snapshot(patient_id: int):
    with _vitals_lock:
        history = list(_history_by_patient.get(int(patient_id), []))
    return history


def _latest_snapshot(patient_id: int):
    with _vitals_lock:
        latest = dict(_latest_by_patient.get(int(patient_id), {}))

    if not latest:
        return None

    parsed_ts = _parse_timestamp(latest.get("ts"))
    latest["last_seen_at"] = latest.get("last_seen_at") or latest.get("ts")
    if not parsed_ts or (_utc_now() - parsed_ts) > timedelta(seconds=STALE_READING_SECONDS):
        latest.update({
            "connected": False,
            "signal": "disconnected",
            "hr": None,
            "spo2": None,
            "temp": None,
            "hr_alert": 0,
            "spo2_alert": 0,
            "temp_alert": 0,
        })
    else:
        latest["connected"] = True

    return latest


def _device_assigned_for_patient(patient_id: int) -> bool:
    if not patient_id:
        return False
    if int(patient_id) in _known_device_patient_ids():
        return True
    return MedicalDevice.query.filter_by(patient_id=int(patient_id)).first() is not None


def _clean_payload_for_signal(payload):
    signal = str(payload.get("signal") or "na")
    
    # If no finger or invalid signal, only discard HR and SpO2. Keep Temp.
    if signal == "no_finger" or signal not in ("ok", "weak"):
        payload.update({
            "hr": None,
            "spo2": None,
            "hr_alert": 0,
            "spo2_alert": 0,
        })

    validators = {
        "hr": lambda value: value > 0,
        "spo2": lambda value: value > 0,
        "temp": lambda value: value >= 32,
    }
    alert_keys = {"hr": "hr_alert", "spo2": "spo2_alert", "temp": "temp_alert"}

    for key, is_valid in validators.items():
        if payload.get(key) is None:
            payload[key] = None
            payload[alert_keys[key]] = 0
            continue
            
        try:
            value = float(payload[key])
        except (TypeError, ValueError):
            payload[key] = None
            payload[alert_keys[key]] = 0
            continue
            
        if not is_valid(value):
            payload[key] = None
            payload[alert_keys[key]] = 0
        else:
            payload[key] = value

    return payload


def _most_recent_accessible_patient_id(user: User):
    candidates = []
    with _vitals_lock:
        latest_items = [(int(patient_id), dict(payload)) for patient_id, payload in _latest_by_patient.items()]

    for patient_id, payload in latest_items:
        if not _user_can_access_patient(user, patient_id):
            continue
        parsed_ts = _parse_timestamp(payload.get("ts"))
        if parsed_ts is None:
            continue
        candidates.append((parsed_ts, patient_id))

    if candidates:
        candidates.sort(reverse=True)
        return candidates[0][1]

    configured_patient_id = _configured_device_patient_id()
    if configured_patient_id and _user_can_access_patient(user, configured_patient_id):
        return configured_patient_id

    history_candidates = []
    known_ids = _known_device_patient_ids()
    for patient_id in known_ids:
        if not _user_can_access_patient(user, patient_id):
            continue
        history = _history_snapshot(patient_id)
        parsed_ts = _parse_timestamp(history[-1].get("ts")) if history else None
        if parsed_ts is not None:
            history_candidates.append((parsed_ts, patient_id))

    if history_candidates:
        history_candidates.sort(reverse=True)
        return history_candidates[0][1]

    return None


def _resolve_target_patient_id(user: User, requested_patient_id):
    if user.role == "patient":
        if requested_patient_id and int(requested_patient_id) != int(user.id):
            return None, (jsonify({"message": "Access denied"}), 403)
        return int(user.id), None

    if user.role not in ("doctor", "admin", "super_admin"):
        return None, (jsonify({"message": "Access denied"}), 403)

    if requested_patient_id:
        if not _user_can_access_patient(user, requested_patient_id):
            return None, (jsonify({"message": "Access denied"}), 403)
        return int(requested_patient_id), None

    return _most_recent_accessible_patient_id(user), None


def check_and_trigger_alerts(patient_id, data):
    if str(data.get("signal") or "na") not in ("ok", "weak"):
        return

    thresholds = [
        {"type": "SPO2", "val": data.get("spo2"), "is_crit": lambda v: v < 90, "msg": "Oxygen level below safe threshold ({}%)"},
        {"type": "Heart Rate", "val": data.get("hr"), "is_crit": lambda v: v > 120 or v < 40, "msg": "Heart rate critical ({} BPM)"},
        {"type": "Temperature", "val": data.get("temp"), "is_crit": lambda v: v > 39.0 or v < 35.0, "msg": "Temperature critical ({}°C)"},
    ]

    now = _utc_now()

    for threshold in thresholds:
        value = threshold["val"]
        if value is None:
            continue

        try:
            value = float(value)
        except (TypeError, ValueError):
            continue

        if not threshold["is_crit"](value):
            continue

        vital_type = threshold["type"]
        alert_key = (patient_id, vital_type)
        last_time = _last_alert_time.get(alert_key)
        if last_time and now - last_time < timedelta(minutes=ALERT_COOLDOWN_MINUTES):
            continue

        _last_alert_time[alert_key] = now
        message = threshold["msg"].format(value)

        try:
            alert = Alert(
                patient_id=patient_id,
                vital_type=vital_type,
                value=value,
                severity="CRITICAL",
                message=message,
                created_at=now,
            )
            db.session.add(alert)
            db.session.commit()

            room = f"patient_vitals_{patient_id}"
            socketio.emit("critical_alert", alert.to_dict(), room=room)
            socketio.emit("new_in_app_notification", alert.to_dict(), room=f"user_{patient_id}")
            NotificationService.notify_critical_vitals(patient_id, alert)
        except Exception:
            db.session.rollback()
            current_app.logger.exception("Failed to persist or emit vitals alert for patient %s", patient_id)


@vitals_bp.route("/api/vitals/update", methods=["POST"])
def receive_vitals():
    data = request.get_json(silent=True)
    if not data:
        raw_body = request.get_data(as_text=True) or ""
        try:
            data = json.loads(raw_body)
        except Exception:
            current_app.logger.warning("Invalid vitals payload received")
            return jsonify({"error": "No data"}), 400

    auth_error = _require_device_auth(data)
    if auth_error:
        return auth_error

    patient_id = _resolve_ingest_patient_id(data)
    if not patient_id:
        return jsonify({"error": "patient_id is required"}), 400

    patient = User.query.get(patient_id)
    if not patient or patient.role != "patient":
        return jsonify({"error": "Target patient not found"}), 404

    now = _utc_now()
    presented_device_id = _resolve_presented_device_id(data)
    payload = {
        "patient_id": patient_id,
        "hr": data.get("hr", data.get("heart_rate")),
        "spo2": data.get("spo2"),
        "temp": data.get("temp", data.get("temperature")),
        "signal": (data.get("signal") or "na"),
        "hr_alert": int(data.get("hr_alert", 0)),
        "spo2_alert": int(data.get("spo2_alert", 0)),
        "temp_alert": int(data.get("temp_alert", 0)),
        "ts": _serialize_timestamp(now),
        "last_seen_at": _serialize_timestamp(now),
        "connected": True,
    }
    
    signal_str = str(payload.get("signal") or "na")
    with _vitals_lock:
        if signal_str == "ok":
            if payload.get("hr") and payload.get("spo2"):
                _last_good_vitals_by_patient[patient_id] = {
                    "hr": payload.get("hr"),
                    "spo2": payload.get("spo2"),
                    "ts": now
                }
        elif signal_str in ("no_finger", "weak") or not payload.get("hr"):
            last_good = _last_good_vitals_by_patient.get(patient_id)
            if last_good and (now - last_good["ts"]) < timedelta(seconds=15):
                payload["hr"] = last_good["hr"]
                payload["spo2"] = last_good["spo2"]
                payload["signal"] = "weak"
            else:
                payload["signal"] = "no_finger"

    payload = _clean_payload_for_signal(payload)

    with _vitals_lock:
        _latest_by_patient[patient_id] = payload
        if payload["signal"] in ("ok", "weak", "no_finger"):
            _history_by_patient[patient_id].append(dict(payload))

    if presented_device_id:
        device = _find_registered_device(presented_device_id)
        if device:
            try:
                device.last_seen_timestamp = now
                device.device_status = "online"
                db.session.commit()
            except Exception:
                db.session.rollback()
                current_app.logger.exception("Failed to update vitals device last_seen_timestamp for %s", presented_device_id)

    socketio.emit("vitals_update", payload, room=f"patient_vitals_{patient_id}")

    if patient_id > 0:
        check_and_trigger_alerts(patient_id, payload)

    return jsonify({"status": "ok"}), 200


@vitals_bp.route("/api/vitals/latest", methods=["GET"])
@jwt_required()
def get_latest():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({"message": "User not found"}), 404

    requested_patient_id = request.args.get("patient_id", type=int)
    target_patient_id, error_response = _resolve_target_patient_id(user, requested_patient_id)
    if error_response:
        return error_response

    if target_patient_id is None:
        return jsonify({"connected": False, "signal": "no_device", "deviceAssigned": False}), 200

    latest = _latest_snapshot(target_patient_id)
    
    if latest:
        latest["deviceAssigned"] = True
        return jsonify(latest), 200

    if _device_assigned_for_patient(target_patient_id):
        return jsonify({
            "patient_id": target_patient_id,
            "connected": False,
            "deviceAssigned": True,
            "signal": "disconnected",
            "hr": None,
            "spo2": None,
            "temp": None,
            "hr_alert": 0,
            "spo2_alert": 0,
            "temp_alert": 0,
        }), 200

    return jsonify({"patient_id": target_patient_id, "connected": False, "deviceAssigned": False, "signal": "no_device"}), 200


@vitals_bp.route("/api/vitals/history", methods=["GET"])
@jwt_required()
def get_history():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({"message": "User not found"}), 404

    requested_patient_id = request.args.get("patient_id", type=int)
    target_patient_id, error_response = _resolve_target_patient_id(user, requested_patient_id)
    if error_response:
        return error_response

    if target_patient_id is None:
        return jsonify([]), 200

    latest = _latest_snapshot(target_patient_id)
    if _device_assigned_for_patient(target_patient_id) and not (latest and latest.get("connected")):
        return jsonify([]), 200

    history = _history_snapshot(target_patient_id)
    return jsonify(history), 200


@vitals_bp.route("/api/vitals/patients", methods=["GET"])
@jwt_required()
def get_monitored_patients():
    claims = get_jwt()
    role = claims.get("role")
    current_user_id = int(get_jwt_identity())
    if role not in ("doctor", "admin", "super_admin"):
        return jsonify({"message": "Access denied"}), 403

    if role == "doctor":
        doctor_scope_ids = get_doctor_scope_ids(current_user_id)
        patients = (
            User.query.join(Appointment, Appointment.patient_id == User.id)
            .filter(Appointment.doctor_id.in_(doctor_scope_ids), User.role == "patient")
            .distinct()
            .all()
        )
    else:
        patients = User.query.filter_by(role="patient").all()

    active_patient_ids = _known_device_patient_ids()
    patients_list = []
    for patient in patients:
        patient_name = patient.full_name or f"Patient {patient.id}"
        if patient.id in active_patient_ids:
            patient_name += " (device)"
        patients_list.append({
            "patient_id": patient.id,
            "patient_name": patient_name,
        })

    return jsonify(patients_list), 200


@vitals_bp.route("/api/vitals/assessment-report", methods=["GET"])
@jwt_required()
def get_assessment_report():
    claims = get_jwt()
    role = claims.get("role")
    if role not in ("patient", "doctor", "admin", "super_admin"):
        return jsonify({"message": "Access denied"}), 403

    current_user = User.query.get(int(get_jwt_identity()))
    if not current_user:
        return jsonify({"message": "User not found"}), 404

    requested_patient_id = request.args.get("patient_id", type=int)
    if requested_patient_id:
        if role == "patient" and requested_patient_id != current_user.id:
            return jsonify({"message": "Access denied"}), 403
        if role in ("doctor", "admin", "super_admin") and not _user_can_access_patient(current_user, requested_patient_id):
            return jsonify({"message": "Access denied"}), 403
        target_user = User.query.get(requested_patient_id)
    else:
        target_user = current_user

    if not target_user or target_user.role != "patient":
        return jsonify({"message": "Patient not found"}), 404

    patient_data = {
        "full_name": target_user.full_name or "N/A",
        "email": target_user.email,
    }

    target_history = _history_snapshot(target_user.id)
    target_latest = _latest_snapshot(target_user.id) or {}

    alerts = []
    if target_history:
        heart_rates = [item["hr"] for item in target_history if item.get("hr")]
        spo2_values = [item["spo2"] for item in target_history if item.get("spo2")]
        temperatures = [item["temp"] for item in target_history if item.get("temp")]

        hr_avg = round(sum(heart_rates) / len(heart_rates), 1) if heart_rates else None
        spo2_avg = round(sum(spo2_values) / len(spo2_values), 1) if spo2_values else None
        temp_avg = round(sum(temperatures) / len(temperatures), 1) if temperatures else None

        if hr_avg and (hr_avg < 60 or hr_avg > 100):
            alerts.append(f"Average heart rate ({hr_avg} BPM) is outside normal range (60-100 BPM)")
        if spo2_avg and spo2_avg < 95:
            alerts.append(f"Average SpO2 ({spo2_avg}%) is below normal (>=95%)")
        if temp_avg and (temp_avg < 36.1 or temp_avg > 37.5):
            alerts.append(f"Average temperature ({temp_avg}C) is outside normal range (36.1-37.5C)")
    else:
        hr_avg = spo2_avg = temp_avg = None

    summary_data = {
        "hr_avg": hr_avg,
        "spo2_avg": spo2_avg,
        "temp_avg": temp_avg,
        "alerts": alerts,
    }

    report_data = {
        "patient": patient_data,
        "latest": target_latest,
        "history": target_history,
        "summary": summary_data,
    }

    tz_name = request.args.get("tz", "UTC")
    try:
        pdf_buffer = generate_assessment_report(report_data, tz_name=tz_name)
    except Exception:
        current_app.logger.exception("Failed to generate assessment report for patient %s", target_user.id)
        return jsonify({"message": "Failed to generate assessment report"}), 500

    safe_name = (target_user.full_name or f"patient_{target_user.id}").replace(" ", "_")
    filename = f"NeuroNest_Assessment_{safe_name}_{datetime.now().strftime('%Y%m%d')}.pdf"
    return send_file(
        pdf_buffer,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=filename,
    )


def get_vitals_for_report(patient_id):
    latest = _latest_snapshot(patient_id)
    history = _history_snapshot(patient_id)
    if latest or history:
        return {
            "latest": latest or {},
            "history": history,
            "is_active": bool(latest),
        }
    return {"is_active": False}


def get_vitals_snapshot_for_patient(patient_id):
    latest = _latest_snapshot(patient_id)
    device_assigned = _device_assigned_for_patient(patient_id)
    connected = bool(latest and latest.get("connected"))
    return {
        "latest": latest or ({
            "patient_id": patient_id,
            "connected": False,
            "signal": "disconnected",
            "hr": None,
            "spo2": None,
            "temp": None,
            "hr_alert": 0,
            "spo2_alert": 0,
            "temp_alert": 0,
        } if device_assigned else None),
        "history": _history_snapshot(patient_id) if connected else [],
        "deviceAssigned": device_assigned,
        "connected": connected,
    }
