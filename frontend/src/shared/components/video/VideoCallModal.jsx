import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CallControls from "./CallControls";

const VideoCallModal = ({ isOpen, call, callStatus, onClose, onEndCall }) => {
  const navigate = useNavigate();
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const [micMuted, setMicMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [mediaError, setMediaError] = useState("");

  useEffect(() => {
    if (!isOpen) return undefined;
    let cancelled = false;

    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      } catch (error) {
        setMediaError("Camera/microphone access is unavailable.");
        console.error("VideoCallModal media init failed:", error);
      }
    };

    initMedia();

    return () => {
      cancelled = true;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
    };
  }, [isOpen]);

  const toggleMic = () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setMicMuted(!track.enabled);
    });
  };

  const toggleVideo = () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setVideoMuted(!track.enabled);
    });
  };

  const joinCall = () => {
    if (!call?.room_id) return;
    navigate(`/consultation/${call.room_id}`);
    onClose?.();
  };

  if (!isOpen || !call) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{ background: "rgba(2, 6, 23, 0.66)", zIndex: 1090 }}
    >
      <div className="bg-white rounded-4 shadow-lg w-100 p-3 p-md-4" style={{ maxWidth: 780 }}>
        <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
          <div>
            <h5 className="fw-bold mb-1">Video Consultation</h5>
            <div className="small text-muted">
              {callStatus === "ringing" ? "Calling participant..." : "Call connected. Join secure room."}
            </div>
          </div>
          <button type="button" className="btn btn-sm btn-light border" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-8">
            <div className="border rounded-4 d-flex align-items-center justify-content-center text-muted" style={{ height: 260, background: "#f8fafc" }}>
              Remote stream will appear after joining
            </div>
          </div>
          <div className="col-md-4">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-100 border rounded-4"
              style={{ height: 260, background: "#0f172a", objectFit: "cover" }}
            />
          </div>
        </div>

        {mediaError ? <div className="alert alert-warning py-2">{mediaError}</div> : null}

        <div className="d-flex flex-wrap justify-content-between gap-2 align-items-center">
          <CallControls
            micMuted={micMuted}
            videoMuted={videoMuted}
            onToggleMic={toggleMic}
            onToggleVideo={toggleVideo}
            onEndCall={onEndCall}
          />
          <button type="button" className="btn btn-primary rounded-pill px-4 fw-semibold" onClick={joinCall}>
            Join Secure Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;

