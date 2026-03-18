import React from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";

const CallControls = ({
  micMuted = false,
  videoMuted = false,
  onToggleMic,
  onToggleVideo,
  onEndCall,
}) => {
  return (
    <div className="d-flex justify-content-center gap-2 flex-wrap">
      <button type="button" className="btn btn-light border rounded-circle p-2" onClick={onToggleMic} title="Toggle microphone">
        {micMuted ? <MicOff size={18} className="text-danger" /> : <Mic size={18} className="text-success" />}
      </button>
      <button type="button" className="btn btn-light border rounded-circle p-2" onClick={onToggleVideo} title="Toggle camera">
        {videoMuted ? <VideoOff size={18} className="text-danger" /> : <Video size={18} className="text-success" />}
      </button>
      <button type="button" className="btn btn-danger rounded-pill px-3 fw-semibold" onClick={onEndCall}>
        <PhoneOff size={16} className="me-1" />
        End call
      </button>
    </div>
  );
};

export default CallControls;

