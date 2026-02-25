import React from 'react';
import '../../styles/doctor-profile-premium.css';
import { 
    Calendar, Edit2
} from 'lucide-react';

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
        <div className="availability-mini-card">
            <div className="card-heading">
                <span>Weekly Schedule</span>
                <button 
                    onClick={onManage}
                    className="btn-ghost flex items-center gap-1 text-sm font-medium"
                >
                    <Edit2 size={14} /> Manage
                </button>
            </div>

            {sortedDays.length > 0 ? (
                <div className="schedule-list">
                    {sortedDays.map(day => (
                        <div key={day} className="overview-day-row">
                            <span className="overview-day-name">{day}</span>
                            <div className="overview-slots-col">
                                {slotsByDay[day]
                                    .sort((a, b) => (toMinutes(a.start_time) ?? 0) - (toMinutes(b.start_time) ?? 0))
                                    .map((slot, idx) => (
                                    <span key={idx} className="overview-slot-text">
                                        {formatTimeLabel(slot.start_time)} - {formatTimeLabel(slot.end_time)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                    <Calendar size={32} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No schedule set yet.</p>
                </div>
            )}
        </div>
    );
};

export default AvailabilityOverview;
