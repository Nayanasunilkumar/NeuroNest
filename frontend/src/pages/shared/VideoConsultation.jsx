import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Video, Mic, MicOff, VideoOff, PhoneOff } from 'lucide-react';
import { getUser } from '../../utils/auth';
import { io } from 'socket.io-client';

export default function VideoConsultation() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const user = getUser();
    
    const localVideo = useRef(null);
    const remoteVideo = useRef(null);
    const peerConnection = useRef(null);
    const socket = useRef(null);
    
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isRemoteConnected, setIsRemoteConnected] = useState(false);

    useEffect(() => {
        // Initialize Socket.IO connection
        const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
        socket.current = io(API_URL, {
            transports: ['websocket', 'polling']
        });

        const room = `consult_${roomId}`;
        socket.current.emit("join_video_room", { room });

        // Request local media
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then(stream => {
            if (localVideo.current) {
                localVideo.current.srcObject = stream;
            }

            peerConnection.current = new RTCPeerConnection({
                iceServers: [
                    { urls: "stun:stun.l.google.com:19302" },
                    { urls: "stun:stun1.l.google.com:19302" }
                ]
            });

            // Add local tracks to the peer connection
            stream.getTracks().forEach(track => {
                if (peerConnection.current) {
                    peerConnection.current.addTrack(track, stream);
                }
            });

            // Handle incoming remote tracks
            peerConnection.current.ontrack = event => {
                if (remoteVideo.current) {
                    remoteVideo.current.srcObject = event.streams[0];
                    setIsRemoteConnected(true);
                }
            };

            // Handle ICE candidates
            peerConnection.current.onicecandidate = event => {
                if (event.candidate && socket.current) {
                    socket.current.emit("ice_candidate", {
                        room,
                        candidate: event.candidate
                    });
                }
            };
            
            // Create offer if a NEW user joins after us
            socket.current.on("user_joined", async () => {
                console.log("Another user joined. creating offer...");
                if (!peerConnection.current) return;
                
                try {
                    const offer = await peerConnection.current.createOffer();
                    await peerConnection.current.setLocalDescription(offer);
                    socket.current.emit("webrtc_offer", { room, offer });
                } catch (error) {
                    console.error("Error creating offer:", error);
                }
            });
            
            socket.current.on("user_left", () => {
                console.log("Remote user left the call");
                setIsRemoteConnected(false);
                if (remoteVideo.current) {
                    remoteVideo.current.srcObject = null;
                }
            });
            
        }).catch(err => {
            console.error("Error accessing media devices.", err);
            alert("Could not access camera or microphone. Please check your permissions.");
        });

        // Listen for WebRTC Signaling calls
        socket.current.on("webrtc_offer", async data => {
            if (!peerConnection.current) return;
            try {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));
                const answer = await peerConnection.current.createAnswer();
                await peerConnection.current.setLocalDescription(answer);
                socket.current.emit("webrtc_answer", { room, answer });
            } catch (error) {
                console.error("Error handling offer:", error);
            }
        });

        socket.current.on("webrtc_answer", async data => {
            if (!peerConnection.current) return;
            try {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
            } catch (error) {
                console.error("Error handling answer:", error);
            }
        });

        socket.current.on("ice_candidate", async data => {
            if (!peerConnection.current) return;
            try {
                if (data.candidate) {
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                }
            } catch (error) {
                console.error("Error adding ice candidate:", error);
            }
        });

        return () => {
            // Cleanup on unmount
            if (socket.current) {
                socket.current.emit("leave_video_room", { room });
                socket.current.disconnect();
            }
            if (peerConnection.current) {
                peerConnection.current.close();
            }
            if (localVideo.current && localVideo.current.srcObject) {
                localVideo.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, [roomId]);

    const handleHangup = () => {
        navigate(-1);
    };

    const toggleAudio = () => {
        if (localVideo.current && localVideo.current.srcObject) {
            const audioTrack = localVideo.current.srcObject.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (localVideo.current && localVideo.current.srcObject) {
            const videoTrack = localVideo.current.srcObject.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    };

    return (
        <div style={{ height: '100vh', width: '100vw', background: '#0f172a', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ 
                padding: '20px 32px', 
                background: 'rgba(15, 23, 42, 0.8)', 
                backdropFilter: 'blur(10px)',
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        <Video size={20} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'white', fontWeight: '700' }}>Secure P2P Consultation</h2>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Room: {roomId} • End-to-end Encrypted WebRTC</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={handleHangup}
                        style={{
                            padding: '10px 20px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '10px',
                            color: '#ef4444',
                            fontWeight: '700',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    >
                        <PhoneOff size={18} />
                        Leave Call
                    </button>
                </div>
            </div>

            {/* Main Video Area */}
            <div style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                
                {/* Remote Video (Full Screen) */}
                <video 
                    ref={remoteVideo} 
                    autoPlay 
                    playsInline
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '16px',
                        background: '#1e293b',
                        display: isRemoteConnected ? 'block' : 'none',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }} 
                />

                {/* loader when no remote */}
                {!isRemoteConnected && (
                    <div style={{ 
                        position: 'absolute', 
                        inset: 0, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        background: '#0f172a',
                        color: '#64748b',
                        zIndex: 1
                    }}>
                        <div className="telehealth-pulse" style={{ marginBottom: '24px' }}>
                            <div style={{ 
                                width: '80px', 
                                height: '80px', 
                                borderRadius: '50%', 
                                border: '2px solid #3b82f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(59, 130, 246, 0.1)'
                            }}>
                                 <Video size={32} color="#3b82f6" />
                            </div>
                        </div>
                        <p style={{ fontSize: '1.2rem', fontWeight: '500', color: '#cbd5e1' }}>Waiting for the other participant to join...</p>
                        <p style={{ marginTop: '8px' }}>Room ID: {roomId}</p>
                    </div>
                )}

                {/* Local Video (Picture in Picture style) */}
                <div style={{
                    position: 'absolute',
                    bottom: '40px',
                    right: '40px',
                    width: '320px',
                    height: '240px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '3px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    background: '#000',
                    zIndex: 10,
                    transition: 'all 0.3s ease',
                    transform: isRemoteConnected ? 'scale(1)' : 'scale(1.5) translate(-40%, -40%)'
                }}>
                    <video 
                        ref={localVideo} 
                        autoPlay 
                        muted 
                        playsInline
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transform: 'scaleX(-1)' // mirror effect
                        }} 
                    />

                    {/* Local Controls overlay on the small video */}
                    {isRemoteConnected && (
                        <div style={{
                            position: 'absolute',
                            bottom: '10px',
                            left: '0',
                            right: '0',
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '10px'
                        }}>
                             <button onClick={toggleAudio} style={{
                                width: '36px', height: '36px', borderRadius: '50%', 
                                border: 'none', background: isMuted ? '#ef4444' : 'rgba(0,0,0,0.6)',
                                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', backdropFilter: 'blur(4px)'
                            }}>
                                {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                            </button>
                            <button onClick={toggleVideo} style={{
                                width: '36px', height: '36px', borderRadius: '50%', 
                                border: 'none', background: isVideoOff ? '#ef4444' : 'rgba(0,0,0,0.6)',
                                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', backdropFilter: 'blur(4px)'
                            }}>
                                {isVideoOff ? <VideoOff size={16} /> : <Video size={16} />}
                            </button>
                        </div>
                    )}
                </div>

                {/* Larger Controls when waiting */}
                {!isRemoteConnected && (
                    <div style={{
                        position: 'absolute',
                        bottom: '40px',
                        display: 'flex',
                        gap: '20px',
                        zIndex: 20
                    }}>
                        <button onClick={toggleAudio} style={{
                            width: '56px', height: '56px', borderRadius: '50%', 
                            border: '1px solid rgba(255,255,255,0.2)', 
                            background: isMuted ? '#ef4444' : 'rgba(30, 41, 59, 0.8)',
                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'all 0.2s'
                        }}>
                            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                        </button>
                        <button onClick={toggleVideo} style={{
                            width: '56px', height: '56px', borderRadius: '50%', 
                            border: '1px solid rgba(255,255,255,0.2)', 
                            background: isVideoOff ? '#ef4444' : 'rgba(30, 41, 59, 0.8)',
                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'all 0.2s'
                        }}>
                            {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                .telehealth-pulse {
                    animation: pulse-blue 2s infinite;
                    border-radius: 50%;
                }
                @keyframes pulse-blue {
                    0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
                    70% { box-shadow: 0 0 0 30px rgba(59, 130, 246, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
                }
            `}</style>
        </div>
    );
}
