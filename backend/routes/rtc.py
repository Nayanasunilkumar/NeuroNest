import os
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

rtc_bp = Blueprint("rtc", __name__)


@rtc_bp.route("/ice-config", methods=["GET"])
@jwt_required()
def get_ice_config():
    # Always return STUN defaults. TURN is optional but strongly recommended
    # for laptop/laptop and mixed-network reliability.
    ice_servers = [
        {"urls": "stun:stun.l.google.com:19302"},
        {"urls": "stun:stun1.l.google.com:19302"},
        {"urls": "stun:global.stun.twilio.com:3478"},
    ]

    turn_urls = os.getenv("TURN_URLS", "").strip()
    turn_username = os.getenv("TURN_USERNAME", "").strip()
    turn_credential = os.getenv("TURN_CREDENTIAL", "").strip()

    if turn_urls and turn_username and turn_credential:
        urls = [u.strip() for u in turn_urls.split(",") if u.strip()]
        if urls:
            ice_servers.append(
                {
                    "urls": urls if len(urls) > 1 else urls[0],
                    "username": turn_username,
                    "credential": turn_credential,
                }
            )

    return jsonify({"iceServers": ice_servers}), 200

