import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Plus, Trash2, Calendar, Clock } from 'lucide-react';
import { addAvailabilitySlot, deleteAvailabilitySlot } from '../../services/doctorProfileService';
import '../../styles/doctor-profile-premium.css';

const toMinutes = (value = '') => {
    if (!value) return null;
    const normalized = String(value).trim();
    const parts = normalized.split(':');
    if (parts.length < 2) return null;
    const hour = Number(parts[0]);
    const minute = Number(parts[1]);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
    return (hour * 60) + minute;
};

const formatTimeCompact = (value = '') => {
    const mins = toMinutes(value);
    if (mins === null) return String(value || '--');
    const hour24 = Math.floor(mins / 60) % 24;
    const minute = mins % 60;
    return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

const AvailabilityModal = ({ isOpen, onClose, availability, onUpdate }) => {
    const [day, setDay] = useState('Monday');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const startMins = toMinutes(startTime);
    const endMins = toMinutes(endTime);
    const hasInvalidRange = startMins === null || endMins === null || startMins >= endMins;
    const overlapsExisting = !hasInvalidRange && Boolean(
        availability && availability.some((slot) => {
            if (slot.day_of_week !== day) return false;
            const existingStart = toMinutes(slot.start_time);
            const existingEnd = toMinutes(slot.end_time);
            if (existingStart === null || existingEnd === null) return false;
            return startMins < existingEnd && endMins > existingStart;
        }),
    );
    const validationMessage = startMins !== null && endMins !== null && startMins >= endMins
        ? 'End time must be after start time.'
        : overlapsExisting
            ? 'Time range overlaps with existing availability.'
            : '';
    const totalMinutes = hasInvalidRange ? 0 : (endMins - startMins);
    const estimatedSlots = Math.floor(totalMinutes / 40);
    const totalHours = (totalMinutes / 60).toFixed(totalMinutes % 60 === 0 ? 0 : 1);

    const handleAdd = async () => {
        // Basic validation
        if (startMins === null || endMins === null) {
            alert("Invalid time format");
            return;
        }
        if (startMins >= endMins) {
            alert("End time must be after start time");
            return;
        }

        // Check for overlaps
        // (StartA < EndB) and (EndA > StartB)
        const isOverlapping = availability && availability.some((availabilityRange) => {
            if (availabilityRange.day_of_week !== day) return false;

            const existingStart = toMinutes(availabilityRange.start_time);
            const existingEnd = toMinutes(availabilityRange.end_time);
            if (existingStart === null || existingEnd === null) return false;

            return startMins < existingEnd && endMins > existingStart;
        });

        if (isOverlapping) {
            alert(`This availability range overlaps with existing availability on ${day}`);
            return;
        }

        setLoading(true);
        try {
            const updatedProfile = await addAvailabilitySlot({
                day_of_week: day,
                start_time: startTime,
                end_time: endTime
            });
            onUpdate(updatedProfile);
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || "Failed to add availability";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this availability range?")) return;
        setLoading(true);
        try {
            const updatedProfile = await deleteAvailabilitySlot(id);
            onUpdate(updatedProfile);
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || "Failed to delete availability";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Group slots by day
    const slotsByDay = {};
    days.forEach(d => slotsByDay[d] = []);
    if (availability) {
        availability.forEach(slot => {
            if (slotsByDay[slot.day_of_week]) {
                slotsByDay[slot.day_of_week].push(slot);
            }
        });
    }

    // Portal to body to avoid clipping or stacking context issues
    return ReactDOM.createPortal(
        <div className="modal-overlay availability-modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="modal-header">
                    <div className="modal-title">
                        <Calendar size={20} className="text-blue-600" /> 
                        <span>Manage Weekly Schedule</span>
                    </div>
                    <button onClick={onClose} className="btn-icon-ghost">
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                        {/* Left: Add Availability Form */}
                    <div className="modal-sidebar">
                        <h3 className="modal-sidebar-title">Add Availability Range</h3>
                        
                        <div className="modal-form-group">
                            <label className="modal-label">Day</label>
                            <select 
                                className="modal-select"
                                value={day}
                                onChange={(e) => setDay(e.target.value)}
                            >
                                {days.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        
                        <div className="modal-form-group time-row">
                            <div>
                                <label className="modal-label">Start</label>
                                <input 
                                    type="time" 
                                    className="modal-time-input"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="modal-label">End</label>
                                <input 
                                    type="time" 
                                    className="modal-time-input"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                />
                            </div>
                        </div>

                        {validationMessage && (
                            <p className="modal-validation-text" role="alert">
                                {validationMessage}
                            </p>
                        )}

                        <div className="availability-preview-card">
                            <p className="availability-preview-title">Preview</p>
                            <p className="availability-preview-value">
                                {estimatedSlots > 0 ? `~${estimatedSlots} appointments` : 'No appointments'} for this range
                            </p>
                            <p className="availability-preview-meta">
                                {hasInvalidRange ? 'Set a valid time range to preview impact.' : `${totalHours} hours total at 30+10 cadence`}
                            </p>
                        </div>

                        <button 
                            onClick={handleAdd}
                            disabled={loading || Boolean(validationMessage)}
                            className="btn-add-slot"
                        >
                            {loading ? <span className="loading-spinner"></span> : <Plus size={18} />}
                            <span>Add Availability</span>
                        </button>
                    </div>

                    {/* Right: Schedule List */}
                    <div className="modal-main">
                        <div className="modal-main-scroll">
                            {days.map(d => (
                                <div key={d} className="slot-day-group">
                                    <h4 className={`slot-day-header ${!slotsByDay[d].length ? 'opacity-50' : ''}`}>
                                        {d}
                                        {!slotsByDay[d].length && <span className="empty-day-badge">Off</span>}
                                    </h4>
                                    
                                    {slotsByDay[d].length > 0 && (
                                        <div className="slot-grid">
                                            {slotsByDay[d]
                                                .sort((a, b) => (toMinutes(a.start_time) ?? 0) - (toMinutes(b.start_time) ?? 0))
                                                .map(slot => (
                                                <div key={slot.id} className="time-slot-card">
                                                    <div className="flex items-center gap-3">
                                                        <Clock size={14} className="text-slate-400" />
                                                        <span className="slot-time-text">
                                                            {formatTimeCompact(slot.start_time)} - {formatTimeCompact(slot.end_time)}
                                                        </span>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleDelete(slot.id)}
                                                        className="btn-delete-slot"
                                                        title="Remove availability"
                                                        aria-label="Remove availability"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AvailabilityModal;
