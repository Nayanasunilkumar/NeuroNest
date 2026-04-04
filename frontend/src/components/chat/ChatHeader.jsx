import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Phone, Video, Info, Clock, AlertCircle } from 'lucide-react';
import { formatDateIST, formatClockTimeIST, parseISTDateTime } from '../../utils/time';
import { useNavigate } from 'react-router-dom';
import { joinAppointmentCall } from '../../api/appointments'; // Fallback to doctor API if role = doctor?
import api from '../../api/axios'; // Generic axios for joining

const ChatHeader = ({ otherUser, context, isDoctor, onToggleSidebar, showSidebar, onVideoCall }) => {
    const navigate = useNavigate();
    const [now, setNow] = useState(Date.now());
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const nextAppt = context?.next_appointment;

    const apptMeta = useMemo(() => {
        if (!nextAppt) return null;
        const apptDate = parseISTDateTime(nextAppt.appointment_date, nextAppt.appointment_time);
        const apptTs = apptDate.getTime();
        const callState = nextAppt.call_state || {};
        const isOnline = String(nextAppt.consultation_type).toLowerCase() === 'online';
        
        // Join Windows (Backend handles the exact logic, we just use the flags sent)
        const canJoinNow = isDoctor ? callState.doctor_can_join_now : callState.patient_can_join_now;
        const isMissed = callState.missed;
        const isOngoing = callState.appointment_started;
        const alreadyJoined = isDoctor ? callState.doctor_joined : callState.patient_joined;

        // Countdown for UI
        const delta = apptTs - now;
        const mins = Math.floor(Math.abs(delta) / 60000);
        const secs = Math.floor((Math.abs(delta) % 60000) / 1000);
        const countdownStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        return {
            apptTs,
            isOnline,
            canJoinNow,
            isMissed,
            isOngoing,
            alreadyJoined,
            countdownStr,
            delta,
            displayDate: formatDateIST(nextAppt.appointment_date),
            displayTime: formatClockTimeIST(nextAppt.appointment_time)
        };
    }, [nextAppt, now, isDoctor]);

    const handleJoin = async () => {
        if (!nextAppt || joining) return;
        setJoining(true);
        try {
            // Use specialized join endpoint based on role
            const endpoint = isDoctor 
                ? `/api/doctor/appointments/${nextAppt.id}/join-call` 
                : `/api/appointments/${nextAppt.id}/join-call`;
            
            const response = await api.post(endpoint);
            const { room_id } = response.data;
            navigate(`/consultation/${room_id || nextAppt.video_room_id || `appointment-${nextAppt.id}`}`, {
                state: { appointmentId: nextAppt.id },
            });
        } catch (error) {
            console.error("Clinical join failed:", error);
            alert(error.response?.data?.error || "Consultation room is not yet accessible.");
        } finally {
            setJoining(false);
        }
    };

    return (
        <div className="doctor-chat-header d-flex align-items-center justify-content-between px-4 py-3 border-bottom bg-white bg-opacity-75" style={{ backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10 }}>
            {/* Identity Area */}
            <div className="d-flex align-items-center gap-3">
                <div 
                    className="rounded-circle overflow-hidden shadow-sm d-flex align-items-center justify-content-center bg-light" 
                    style={{ width: '42px', height: '42px', border: '2px solid white' }}
                >
                    {otherUser?.profile_image ? (
                        <img src={otherUser.profile_image} alt="" className="w-100 h-100 object-fit-cover" />
                    ) : (
                        <span className="fw-bold text-primary">{otherUser?.name?.[0] || '?'}</span>
                    )}
                </div>
                <div>
                    <h3 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.05rem', lineHeight: 1.2 }}>{otherUser?.name || 'Care Session'}</h3>
                    <div className="d-flex align-items-center gap-2 mt-1">
                        <div className={`rounded-circle ${otherUser?.is_online ? 'bg-success' : 'bg-secondary opacity-50'}`} style={{ width: '6px', height: '6px' }}></div>
                        <span className="text-secondary fw-semibold" style={{ fontSize: '0.72rem' }}>{otherUser?.is_online ? 'Active now' : 'Last seen recently'}</span>
                    </div>
                </div>
            </div>

            {/* Interactive Appointment Bar */}
            <div className="d-none d-lg-flex align-items-center flex-grow-1 justify-content-center">
                {apptMeta ? (
                    <div className="d-flex align-items-center bg-light border rounded-pill px-4 py-2 gap-3 shadow-sm transition-all" style={{ maxWidth: '420px' }}>
                        <div className="d-flex flex-column" style={{ minWidth: '130px' }}>
                            <span className="text-secondary text-uppercase fw-bold" style={{ fontSize: '0.55rem', letterSpacing: '0.08em' }}>Next Appointment</span>
                            <span className="text-dark fw-bold" style={{ fontSize: '0.8rem' }}>{apptMeta.displayDate} @ {apptMeta.displayTime}</span>
                        </div>
                        
                        <div className="vr opacity-25" style={{ height: '24px' }}></div>

                        {apptMeta.isOnline ? (
                            <div className="d-flex align-items-center gap-3">
                                {apptMeta.isMissed ? (
                                    <div className="d-flex align-items-center text-danger gap-1 fw-bold" style={{ fontSize: '0.8rem' }}>
                                        <AlertCircle size={14} /> Missed
                                    </div>
                                ) : apptMeta.canJoinNow ? (
                                    <button 
                                        onClick={handleJoin}
                                        disabled={joining}
                                        className="btn btn-primary btn-sm rounded-pill fw-bold px-3 d-flex align-items-center gap-2"
                                        style={{ height: '32px', fontSize: '0.75rem' }}
                                    >
                                        <Video size={14} /> {joining ? 'Joining...' : 'Join Video Call'}
                                    </button>
                                ) : (
                                    <div className="d-flex align-items-center text-primary gap-1 fw-bold" style={{ fontSize: '0.8rem' }}>
                                        <Clock size={14} /> Join Cloud in {apptMeta.countdownStr}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-secondary fw-bold" style={{ fontSize: '0.8rem' }}>In-person Clinic Visit</div>
                        )}
                    </div>
                ) : (
                    <div className="text-secondary fw-bold opacity-50" style={{ fontSize: '0.75rem' }}>No Upcoming Scheduled Visits</div>
                )}
            </div>

            {/* Actions */}
            <div className="d-flex align-items-center gap-2">
                <button 
                    className="btn rounded-circle d-flex align-items-center justify-content-center border-0 transition-all text-secondary" 
                    title="Start Direct Call"
                    onClick={onVideoCall}
                    style={{ width: '38px', height: '38px', backgroundColor: '#f8fafc' }}
                >
                    <Video size={16} />
                </button>
                <div className="mx-1 bg-light border-end" style={{ height: '24px', width: '1px' }}></div>
                <button 
                    onClick={onToggleSidebar}
                    className={`btn rounded-circle d-flex align-items-center justify-content-center transition-all shadow-none ${showSidebar ? 'btn-primary text-white' : 'btn-light text-secondary border-0'}`}
                    title={showSidebar ? "Hide Session Details" : "Show Session Details"}
                    style={{ width: '38px', height: '38px' }}
                >
                    <Info size={16} />
                </button>
            </div>
            
            <style>{`
                .btn-primary { background: var(--nn-primary); border: none; }
                .btn-primary:hover { background: var(--nn-primary-dark); transform: translateY(-1px); }
                .bg-light { background-color: #f8fafc !important; }
                body.dark .doctor-chat-header {
                    background: color-mix(in srgb, var(--nn-surface) 94%, #020617) !important;
                    border-color: var(--nn-border) !important;
                }
                body.dark .doctor-chat-header .bg-light {
                    background-color: var(--nn-surface-secondary) !important;
                }
                body.dark .doctor-chat-header .text-dark,
                body.dark .doctor-chat-header h3 {
                    color: var(--nn-text-main) !important;
                }
                body.dark .doctor-chat-header .text-secondary,
                body.dark .doctor-chat-header span,
                body.dark .doctor-chat-header .opacity-50 {
                    color: var(--nn-text-muted) !important;
                }
                body.dark .doctor-chat-header .border,
                body.dark .doctor-chat-header .vr,
                body.dark .doctor-chat-header .border-end {
                    border-color: var(--nn-border) !important;
                    background-color: var(--nn-border) !important;
                }
                body.dark .doctor-chat-header .btn-light {
                    background-color: color-mix(in srgb, var(--nn-surface-secondary) 88%, transparent) !important;
                    color: var(--nn-text-secondary) !important;
                    border-color: var(--nn-border) !important;
                }
            `}</style>
        </div>
    );
};

export default ChatHeader;
