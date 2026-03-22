import React from 'react';
import { Calendar, Phone, Video, Info } from 'lucide-react';
import Avatar from '../shared/Avatar';
import { formatDateIST } from '../../utils/time';

const formatAppointmentIST = (appointment) => {
    if (!appointment?.date) return 'No upcoming visit';
    const dateLabel = formatDateIST(appointment.date) || appointment.date;
    const timeLabel = appointment.time
        ? String(appointment.time).slice(0, 5)
        : '';
    return timeLabel ? `${dateLabel} @ ${timeLabel}` : dateLabel;
};

const ChatHeader = ({ otherUser, context, isDoctor, onToggleSidebar, showSidebar, onVideoCall }) => {
    return (
        <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom bg-white bg-opacity-75" style={{ backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10 }}>
            <div className="d-flex align-items-center gap-3">
                <div>
                    <h3 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.15rem' }}>{otherUser?.name || 'Loading Chat...'}</h3>
                    <div className="d-flex align-items-center gap-2 mt-1">
                        <div className={`rounded-circle ${otherUser?.is_online ? 'bg-success' : 'bg-secondary opacity-50'}`} style={{ width: '6px', height: '6px' }}></div>
                        <span className="text-secondary fw-medium" style={{ fontSize: '0.75rem' }}>{otherUser?.is_online ? 'Active now' : 'Last seen recently'}</span>
                    </div>
                </div>
            </div>

            {isDoctor && context && (
                <div className="d-none d-lg-flex align-items-center gap-2 bg-primary bg-opacity-10 rounded-pill px-3 py-2 border border-primary border-opacity-10">
                    <div className="d-flex align-items-center justify-content-center bg-white rounded-circle text-primary shadow-sm" style={{ width: '28px', height: '28px' }}>
                        <Calendar size={14} />
                    </div>
                    <div>
                        <p className="mb-0 text-secondary text-uppercase fw-bold" style={{ fontSize: '0.55rem', letterSpacing: '0.05em' }}>Next Appointment</p>
                        <p className="mb-0 text-dark fw-bold" style={{ fontSize: '0.75rem' }}>
                            {formatAppointmentIST(context.next_appointment)}
                        </p>
                    </div>
                </div>
            )}

            <div className="d-flex align-items-center gap-3">
                <button 
                    className="btn rounded-circle d-flex align-items-center justify-content-center border-0 transition-all text-secondary" 
                    title="Start Video Consultation"
                    onClick={onVideoCall}
                    style={{ width: '38px', height: '38px', backgroundColor: '#f4f7fb' }}
                >
                    <Video size={16} />
                </button>
                <button className="btn rounded-circle d-flex align-items-center justify-content-center border-0 transition-all text-secondary" style={{ width: '38px', height: '38px', backgroundColor: '#f4f7fb' }}>
                    <Phone size={16} />
                </button>
                <div className="mx-1 bg-light border-end" style={{ height: '24px', width: '1px' }}></div>
                <button 
                    onClick={() => {
                        if (onToggleSidebar) {
                            onToggleSidebar();
                        }
                    }}
                    className={`btn rounded-circle d-flex align-items-center justify-content-center transition-all shadow-none ${showSidebar ? 'btn-danger text-white border-0' : 'btn-light text-secondary border-0 hover-bg-light'}`}
                    title={showSidebar ? "Hide Details" : "Show Details"}
                    style={{ width: '38px', height: '38px', backgroundColor: showSidebar ? '' : '#f4f7fb' }}
                >
                    <Info size={16} />
                </button>
            </div>
            
            <style>{`
                .hover-bg-light:hover { background-color: rgba(0,0,0,0.05) !important; }
            `}</style>
        </div>
    );
};

export default ChatHeader;
