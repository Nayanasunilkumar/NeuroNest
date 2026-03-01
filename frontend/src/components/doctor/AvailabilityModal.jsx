import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Plus, Trash2, Calendar, Clock, AlertCircle } from 'lucide-react';
import { addAvailabilitySlot, deleteAvailabilitySlot } from '../../services/doctorProfileService';
import { useTheme } from '../../context/ThemeContext';

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
    const { isDark } = useTheme();
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
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }} tabIndex="-1" onClick={onClose}>
            <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable" onClick={e => e.stopPropagation()}>
                <div className={`modal-content border-0 shadow-lg rounded-4 overflow-hidden ${isDark ? 'bg-dark text-light' : 'bg-white text-dark'}`}>
                    
                    {/* Header */}
                    <div className={`modal-header px-4 py-3 ${isDark ? 'border-secondary' : 'bg-light border-bottom'}`} style={{ backgroundColor: isDark ? '#1a1a1a' : '' }}>
                        <div className="modal-title d-flex align-items-center gap-2 fw-bold h5 mb-0">
                            <Calendar size={20} className="text-primary" /> 
                            <span className={isDark ? 'text-white' : 'text-dark'}>Manage Weekly Schedule</span>
                        </div>
                        <button onClick={onClose} className={`btn-close shadow-none ${isDark ? 'btn-close-white' : ''}`}></button>
                    </div>

                    <div className="modal-body p-0" style={{ minHeight: '500px' }}>
                        <div className="row m-0 h-100">
                            {/* Left: Add Availability Form */}
                            <div className={`col-12 col-md-5 p-4 border-end ${isDark ? 'border-secondary' : 'bg-white'}`} style={{ backgroundColor: isDark ? '#1a1a1a' : '' }}>
                                <h3 className={`h6 fw-bold mb-4 text-uppercase ${isDark ? 'text-light' : 'text-dark'}`} style={{ letterSpacing: '0.5px' }}>Add Availability</h3>
                                
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-secondary text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>Day</label>
                                    <select 
                                        className={`form-select border-2 shadow-none rounded-3 py-2 fw-medium ${isDark ? 'bg-dark text-light border-secondary' : ''}`}
                                        value={day}
                                        onChange={(e) => setDay(e.target.value)}
                                    >
                                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                
                                <div className="row g-2 mb-4">
                                    <div className="col-6">
                                        <label className="form-label small fw-bold text-secondary text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>Start</label>
                                        <input 
                                            type="time" 
                                            className={`form-control border-2 shadow-none rounded-3 py-2 fw-medium ${isDark ? 'bg-dark text-light border-secondary' : ''}`}
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-bold text-secondary text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>End</label>
                                        <input 
                                            type="time" 
                                            className={`form-control border-2 shadow-none rounded-3 py-2 fw-medium ${isDark ? 'bg-dark text-light border-secondary' : ''}`}
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {validationMessage && (
                                    <div className="alert py-2 px-3 small d-flex align-items-center gap-2 rounded-3 border-0 bg-danger bg-opacity-10 text-danger fw-medium mb-3" role="alert">
                                        <AlertCircle size={14} className="flex-shrink-0" />
                                        <span>{validationMessage}</span>
                                    </div>
                                )}

                                <div className={`card border shadow-none rounded-4 mb-4 ${isDark ? 'bg-dark border-secondary' : 'bg-light'}`}>
                                    <div className="card-body p-3">
                                        <p className="text-secondary small fw-bold text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>Preview</p>
                                        <p className={`fw-bold mb-1 fs-6 ${isDark ? 'text-white' : 'text-dark'}`}>
                                            {estimatedSlots > 0 ? `~${estimatedSlots} appointments` : 'No appointments'}
                                        </p>
                                        <p className="text-muted small mb-0 fw-medium">
                                            {hasInvalidRange ? 'Set a valid time range.' : `${totalHours} hrs at 30+10 cadence`}
                                        </p>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleAdd}
                                    disabled={loading || Boolean(validationMessage)}
                                    className="btn btn-primary w-100 d-flex justify-content-center align-items-center gap-2 py-2 fw-bold rounded-pill text-white shadow-sm"
                                >
                                    {loading ? <span className="spinner-border spinner-border-sm"></span> : <Plus size={18} />}
                                    <span>Add Availability</span>
                                </button>
                            </div>

                            {/* Right: Schedule List */}
                            <div className={`col-12 col-md-7 p-4 overflow-auto ${isDark ? 'bg-dark' : 'bg-light'}`} style={{ backgroundColor: isDark ? '#111' : '' }}>
                                {days.map(d => (
                                    <div key={d} className="mb-4">
                                        <h4 className={`h6 fw-bold mb-3 d-flex align-items-center gap-2 text-uppercase ${!slotsByDay[d].length ? 'opacity-50 text-secondary' : (isDark ? 'text-light' : 'text-dark')}`} style={{ letterSpacing: '0.5px' }}>
                                            <span style={{ width: '80px' }}>{d}</span>
                                            <div className={`flex-grow-1 border-bottom ${isDark ? 'border-secondary' : ''}`} style={{ height: '1px' }}></div>
                                            {!slotsByDay[d].length && <span className="badge bg-secondary bg-opacity-10 text-secondary border px-2 border-secondary border-opacity-25 rounded-pill" style={{ fontSize: '10px' }}>Off</span>}
                                        </h4>
                                        
                                        {slotsByDay[d].length > 0 && (
                                            <div className="row g-2">
                                                {slotsByDay[d]
                                                    .sort((a, b) => (toMinutes(a.start_time) ?? 0) - (toMinutes(b.start_time) ?? 0))
                                                    .map(slot => (
                                                    <div key={slot.id} className="col-12 col-sm-6">
                                                        <div className={`card border shadow-sm rounded-3 hover-shadow-sm transition-all ${isDark ? 'bg-dark border-secondary' : 'bg-white'}`} style={{ backgroundColor: isDark ? '#222' : '' }}>
                                                            <div className="card-body p-2 px-3 d-flex justify-content-between align-items-center">
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <Clock size={14} className="text-primary opacity-75" />
                                                                    <span className={`fw-bold ${isDark ? 'text-light' : 'text-dark'}`} style={{ fontSize: '0.85rem' }}>
                                                                        {formatTimeCompact(slot.start_time)} - {formatTimeCompact(slot.end_time)}
                                                                    </span>
                                                                </div>
                                                                <button 
                                                                    onClick={() => handleDelete(slot.id)}
                                                                    className={`btn btn-sm border-0 text-danger p-1 rounded hover-bg-danger hover-text-white transition-all ${isDark ? 'btn-dark bg-secondary bg-opacity-25' : 'btn-light'}`}
                                                                    title="Remove availability"
                                                                    aria-label="Remove availability"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
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
            </div>
        </div>,
        document.body
    );
};

export default AvailabilityModal;
