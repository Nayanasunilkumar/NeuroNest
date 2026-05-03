import React from 'react';
import { Calendar, Edit2, Clock } from 'lucide-react';

const toMinutes = (value = '') => {
    if (!value) return null;
    const parts = String(value).trim().split(':');
    if (parts.length < 2) return null;
    const hour = Number(parts[0]);
    const minute = Number(parts[1]);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
    return (hour * 60) + minute;
};

const formatTimeLabel = (value = '') => {
    const mins = toMinutes(value);
    if (mins === null) return String(value || '--');
    const hour24 = Math.floor(mins / 60) % 24;
    const minute = mins % 60;
    const period = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 || 12;
    return `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
};

const AvailabilityOverview = ({ availability, onManage }) => {
    // Sort logic
    const dayOrder = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7 };
    
    // Group slots by day
    const slotsByDay = {};
    if (availability) {
        availability.forEach(slot => {
            if (!slotsByDay[slot.day_of_week]) slotsByDay[slot.day_of_week] = [];
            slotsByDay[slot.day_of_week].push(slot);
        });
    }

    const sortedDays = Object.keys(slotsByDay).sort((a,b) => dayOrder[a] - dayOrder[b]);

    return (
        <div className="card border-0 shadow-sm rounded-4 bg-white">
            <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="h5 fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                        Weekly Schedule
                    </h3>
                    <button 
                        onClick={onManage}
                        className="btn btn-link text-decoration-none p-0 d-flex align-items-center gap-1 text-primary fw-bold"
                        style={{ fontSize: '0.875rem' }}
                    >
                        <Edit2 size={14} /> Manage
                    </button>
                </div>

                {sortedDays.length > 0 ? (
                    <div className="d-flex flex-column gap-3">
                        {sortedDays.map(day => (
                            <div key={day} className="d-flex flex-column flex-sm-row align-items-sm-start gap-2 gap-sm-4 pb-3 border-bottom border-light last-border-0">
                                <span className="fw-bolder text-dark" style={{ width: '100px', flexShrink: 0 }}>{day}</span>
                                <div className="d-flex flex-wrap gap-2">
                                    {slotsByDay[day]
                                        .sort((a, b) => (toMinutes(a.start_time) ?? 0) - (toMinutes(b.start_time) ?? 0))
                                        .map((slot, idx) => (
                                        <span key={idx} className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1 rounded d-flex align-items-center gap-1 fw-medium" style={{ fontSize: '0.8rem' }}>
                                            <Clock size={12} />
                                            {formatTimeLabel(slot.start_time)} - {formatTimeLabel(slot.end_time)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-5 bg-light rounded-4 border border-dashed text-muted">
                        <Calendar size={32} className="opacity-50 mx-auto mb-2" />
                        <p className="small mb-0 fw-medium">No schedule set yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AvailabilityOverview;
