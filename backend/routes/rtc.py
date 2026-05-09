import os
import re
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

rtc_bp = Blueprint("rtc", __name__)

DEFAULT_STUN_SERVERS = [
    {"urls": "stun:stun.l.google.com:19302"},
    {"urls": "stun:stun1.l.google.com:19302"},
    {"urls": "stun:global.stun.twilio.com:3478"},
]


def _split_turn_urls(raw_urls):
    """Accept comma or whitespace separated TURN URLs from Render env."""
    return [
        url.strip()
        for url in re.split(r"[\s,]+", raw_urls or "")
        if url.strip()
    ]


@rtc_bp.route("/ice-config", methods=["GET"])
@jwt_required()
def get_ice_config():
    # Always return STUN defaults. TURN is required for reliable real-world
    # NAT traversal and is injected through Render environment variables.
    ice_servers = list(DEFAULT_STUN_SERVERS)

    turn_urls = os.getenv("TURN_URLS", "").strip()
    turn_username = os.getenv("TURN_USERNAME", "").strip()
    turn_credential = os.getenv("TURN_CREDENTIAL", "").strip()
    parsed_turn_urls = _split_turn_urls(turn_urls)

    turn_configured = bool(parsed_turn_urls and turn_username and turn_credential)
    if turn_configured:
        ice_servers.append(
            {
                "urls": parsed_turn_urls if len(parsed_turn_urls) > 1 else parsed_turn_urls[0],
                "username": turn_username,
                "credential": turn_credential,
            }
        )
    elif turn_urls or turn_username or turn_credential:
        print(
            "[RTC] Incomplete TURN configuration. Set TURN_URLS, "
            "TURN_USERNAME, and TURN_CREDENTIAL together."
        )

    return jsonify(
        {
            "iceServers": ice_servers,
            "diagnostics": {
                "stunServerCount": len(DEFAULT_STUN_SERVERS),
                "turnServerCount": len(parsed_turn_urls) if turn_configured else 0,
                "turnConfigured": turn_configured,
                "turnCredentialPresent": bool(turn_username and turn_credential),
            },
        }
    ), 200
