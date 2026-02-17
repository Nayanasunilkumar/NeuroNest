import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Plus, Trash2, Calendar, Clock } from 'lucide-react';
import { addAvailabilitySlot, deleteAvailabilitySlot } from '../../services/doctorProfileService';
import '../../styles/doctor-profile-premium.css';

const AvailabilityModal = ({ isOpen, onClose, availability, onUpdate }) => {
    const [day, setDay] = useState('Monday');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleAdd = async () => {
        // Basic validation
        if (startTime >= endTime) {
            alert("Start time must be before end time");
            return;
        }

        // Check for overlaps
        // (StartA < EndB) and (EndA > StartB)
        const isOverlapping = availability && availability.some(slot => {
            if (slot.day_of_week !== day) return false;
            
            const existingStart = slot.start_time.slice(0, 5);
            const existingEnd = slot.end_time.slice(0, 5);
            
            return startTime < existingEnd && endTime > existingStart;
        });
        
        if (isOverlapping) {
            alert(`This slot overlaps with an existing slot on ${day}`);
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
            const msg = error.response?.data?.message || "Failed to add slot";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Delete this slot?")) return;
        setLoading(true);
        try {
            const updatedProfile = await deleteAvailabilitySlot(id);
            onUpdate(updatedProfile);
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || "Failed to delete slot";
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
        <div className="modal-overlay" onClick={onClose}>
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
                    {/* Left: Add Slot Form */}
                    <div className="modal-sidebar">
                        <h3 className="modal-sidebar-title">Add New Slot</h3>
                        
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

                        <button 
                            onClick={handleAdd}
                            disabled={loading}
                            className="btn-add-slot"
                        >
                            {loading ? <span className="loading-spinner"></span> : <Plus size={18} />}
                            <span>Add Slot</span>
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
                                                .sort((a,b) => a.start_time.localeCompare(b.start_time))
                                                .map(slot => (
                                                <div key={slot.id} className="time-slot-card">
                                                    <div className="flex items-center gap-3">
                                                        <Clock size={14} className="text-slate-400" />
                                                        <span className="slot-time-text">
                                                            {slot.start_time.slice(0,5)} - {slot.end_time.slice(0,5)}
                                                        </span>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleDelete(slot.id)}
                                                        className="btn-delete-slot"
                                                        title="Remove Slot"
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
