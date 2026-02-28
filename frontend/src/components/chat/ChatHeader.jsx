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
    const statusText = otherUser?.is_online ? 'Online' : 'Last seen recently';

    return (
        <div className="nexus-chat-header">
            <div className="nexus-header-doctor-info">
                <Avatar 
                    src={otherUser?.profile_image}
                    alt={otherUser?.name || 'Patient'}
                    fallback={<span className="nexus-initials">{otherUser?.name?.charAt(0)}</span>}
                    className="nexus-header-avatar"
                />
                
                <div className="nexus-doctor-details">
                    <h3>{otherUser?.name || 'Loading Chat...'}</h3>
                    <div className="nexus-status-badge">
                        <div className="nexus-status-dot"></div>
                        <span className="nexus-status-text">{statusText}</span>
                    </div>
                </div>
            </div>

            {isDoctor && context && (
                <div className="nexus-header-context">
                    <div className="nexus-context-item">
                        <div className="nexus-avatar" style={{ width: '32px', height: '32px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                            <Calendar size={14} />
                        </div>
                        <div>
                            <p className="nexus-context-label">Next Appointment</p>
                            <p className="nexus-context-value">
                                {formatAppointmentIST(context.next_appointment)}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="nexus-header-actions">
                <button className="nexus-input-action-btn">
                    <Phone size={18} />
                </button>
                <button 
                    className="nexus-input-action-btn" 
                    title="Start Video Consultation"
                    onClick={onVideoCall}
                >
                    <Video size={18} />
                </button>
                <div className="nexus-header-divider"></div>
                <button 
                    onClick={() => {
                        if (onToggleSidebar) {
                            onToggleSidebar();
                        }
                    }}
                    className={`nexus-input-action-btn ${showSidebar ? 'active' : ''}`}
                    title={showSidebar ? "Hide Details" : "Show Details"}
                >
                    <Info size={18} />
                </button>
            </div>
        </div>
    );
};

export default ChatHeader;
