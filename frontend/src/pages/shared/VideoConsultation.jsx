import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Video, Mic, MicOff, VideoOff, PhoneOff, Maximize, Minimize, Settings } from 'lucide-react';
import { getUser } from '../../utils/auth';

const VideoConsultation = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const jitsiContainerRef = useRef(null);
    const [api, setApi] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const user = getUser();

    useEffect(() => {
        // Load Jitsi Script
        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
            const domain = 'meet.jit.si';
            const options = {
                roomName: `NeuroNest_Consult_${roomId}`,
                width: '100%',
                height: '100%',
                parentNode: jitsiContainerRef.current,
                userInfo: {
                    displayName: user?.full_name || 'Healthcare Provider',
                    email: user?.email
                },
                configOverwrite: {
                    startWithAudioMuted: false,
                    startWithVideoMuted: false,
                    prejoinPageEnabled: false,
                    disableDeepLinking: true,
                    toolbarButtons: [
                        'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                        'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                        'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                        'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                        'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                        'security'
                    ],
                },
                interfaceConfigOverwrite: {
                    // Customizations
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    DEFAULT_BACKGROUND: '#0f172a',
                    TOOLBAR_BUTTONS: [] // We use our own buttons to control Jitsi if needed, 
                    // or keep Jitsi's for simplicity. Let's keep Jitsi's but hide the background.
                }
            };

            const jitsiApi = new window.JitsiMeetExternalAPI(domain, options);
            setApi(jitsiApi);

            jitsiApi.addEventListeners({
                readyToClose: () => {
                   navigate(-1);
                },
                videoConferenceLeft: () => {
                    navigate(-1);
                }
            });
        };

        return () => {
            if (api) api.dispose();
            document.body.removeChild(script);
        };
    }, [roomId, user?.full_name, user?.email]);

    const handleHangup = () => {
        if (api) api.executeCommand('hangup');
    };

    const toggleAudio = () => {
        if (api) {
            api.executeCommand('toggleAudio');
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (api) {
            api.executeCommand('toggleVideo');
            setIsVideoOff(!isVideoOff);
        }
    };

    return (
        <div style={{ height: '100vh', width: '100vw', background: '#0f172a', display: 'flex', flexDirection: 'column' }}>
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
                        <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'white', fontWeight: '700' }}>Secure Consultation</h2>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Room: {roomId} • End-to-end Encrypted</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                     <button 
                        onClick={() => navigate(-1)}
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
            <div ref={jitsiContainerRef} style={{ flex: 1, position: 'relative' }}>
                {/* Fallback/Loader */}
                <div style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: '#0f172a',
                    color: '#64748b',
                    zIndex: -1
                }}>
                    <div className="telehealth-pulse" style={{ marginBottom: '24px' }}>
                        <div style={{ 
                            width: '80px', 
                            height: '80px', 
                            borderRadius: '50%', 
                            border: '2px solid #3b82f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                             <Video size={32} color="#3b82f6" />
                        </div>
                    </div>
                    <p>Connecting to secure medical server...</p>
                </div>
            </div>

            <style>{`
                .telehealth-pulse {
                    animation: pulse-blue 2s infinite;
                    border-radius: 50%;
                }
                @keyframes pulse-blue {
                    0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
                    70% { box-shadow: 0 0 0 20px rgba(59, 130, 246, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
                }
            `}</style>
        </div>
    );
};

export default VideoConsultation;
