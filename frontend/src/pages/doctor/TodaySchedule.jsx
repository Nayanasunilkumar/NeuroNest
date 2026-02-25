import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getSchedule, completeAppointment, cancelAppointment, markNoShow } from "../../api/doctor";
import { 
    Clock, Calendar, ChevronRight, FileText,
    ChevronLeft, Check, X, Filter, Bookmark
} from "lucide-react";
import { toAssetUrl } from "../../utils/media";
import "../../styles/doctor-schedule.css";

const TodaySchedule = () => {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [imageErrors, setImageErrors] = useState({});
    const navigate = useNavigate();

    const fetchSchedule = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getSchedule(selectedDate, statusFilter);
            setSchedule(data);
        } catch (err) {
            console.error("Error fetching schedule:", err);
        } finally {
            setLoading(false);
        }
    }, [selectedDate, statusFilter]);

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);

    const handleDateStep = (days) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + days);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    const handleAction = async (id, type) => {
        try {
            if (type === 'complete') await completeAppointment(id);
            if (type === 'cancel') await cancelAppointment(id);
            if (type === 'no-show') await markNoShow(id);
            await fetchSchedule();
        } catch (err) {
            console.error(`Error performing ${type}:`, err);
        }
    };

    const isToday = selectedDate === new Date().toISOString().split('T')[0];
    const currentHour = new Date().getHours();

    const formatDisplayTime = (time) => {
        if (!time) return { value: "--:--", period: "" };
        const [hourStr, minute = "00"] = time.split(":");
        const hourNum = Number(hourStr);
        if (Number.isNaN(hourNum)) return { value: time.substring(0, 5), period: "" };
        const period = hourNum >= 12 ? "PM" : "AM";
        const hour12 = hourNum % 12 || 12;
        return { value: `${hour12}:${minute}`, period };
    };

    const getStatusClass = (status) => (status || "").toLowerCase().replace(/[-_]/g, "");
    const getStatusLabel = (status) => {
        if (!status) return "Unknown";
        const s = status.toLowerCase();
        if (s === "no_show" || s === "no-show") return "No Show";
        return status;
    };

    return (
        <div className="opd-dashboard-root">
            {/* SECTION 1: Summary Metric Grid */}
            <div className="summary-metric-grid">
                <div className="metric-card-pro total">
                    <div className="metric-icon-circle">
                        <FileText size={20} />
                    </div>
                    <div className="metric-info">
                        <span className="count">{schedule.length}</span>
                        <span className="label">Total Cases</span>
                    </div>
                </div>
                <div className="metric-card-pro approved">
                    <div className="metric-icon-circle">
                        <Check size={20} />
                    </div>
                    <div className="metric-info">
                        <span className="count">{schedule.filter(a => a.status.toLowerCase() === 'approved').length}</span>
                        <span className="label">Approved</span>
                    </div>
                </div>
                <div className="metric-card-pro pending">
                    <div className="metric-icon-circle">
                        <Clock size={20} />
                    </div>
                    <div className="metric-info">
                        <span className="count">{schedule.filter(a => a.status.toLowerCase() === 'pending').length}</span>
                        <span className="label">Pending</span>
                    </div>
                </div>
                <div className="metric-card-pro noshow">
                    <div className="metric-icon-circle">
                        <X size={20} />
                    </div>
                    <div className="metric-info">
                        <span className="count">{schedule.filter(a => a.status.toLowerCase() === 'no_show').length}</span>
                        <span className="label">No Show</span>
                    </div>
                </div>
            </div>

            {/* SECTION 2: Instrumental Control Bar */}
            <div className="control-instrument-bar">
                <div className="instrument-group-left">
                    <div className="date-nav-stepper">
                        <button onClick={() => handleDateStep(-1)} className="btn-nav-step">
                            <ChevronLeft size={18} />
                        </button>
                        <span className="selected-date-label">
                            {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <button onClick={() => handleDateStep(1)} className="btn-nav-step">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                    
                    <div className="date-input-shell">
                        <Calendar className="date-input-icon" size={14} />
                        <input 
                            type="date" 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="date-picker-input"
                        />
                    </div>
                </div>

                <div className="instrument-group-right">
                    <div className="filter-select-wrap">
                        <Filter size={14} className="filter-icon" />
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="schedule-filter-select"
                        >
                            <option value="all">Every Patient</option>
                            <option value="Approved">Approved Only</option>
                            <option value="Completed">Completed Only</option>
                            <option value="No-Show">No Show Only</option>
                        </select>
                    </div>
                    
                    {isToday && (
                        <div className="live-triage-pill">
                            <span></span> Live Session
                        </div>
                    )}
                </div>
            </div>

            {/* SECTION 3: Timeline Area */}
            <div className="opd-timeline-canvas">
                {loading ? (
                    <div className="schedule-loading-state">
                        <div className="doc-spinner schedule-spinner"></div>
                        <p>Syncing Diagnostic Flow...</p>
                    </div>
                ) : schedule.length === 0 ? (
                    <div className="schedule-empty-state">
                        <Bookmark size={40} className="empty-state-icon" />
                        <h3>Agenda Clear</h3>
                        <p>No OPD consultations linked to this station.</p>
                        <button onClick={() => navigate('/doctor/requests')} className="btn-empty-cta">
                            Review Requests
                        </button>
                    </div>
                ) : (
                    <div className="timeline-execution-list">
                        {schedule.map((appointment) => (
                            <div key={appointment.id} className="timeline-slot-row">
                                {/* Time Column */}
                                <div className="slot-time-anchor">
                                    <span className="time">{formatDisplayTime(appointment.appointment_time).value}</span>
                                    <span className="ampm">{formatDisplayTime(appointment.appointment_time).period}</span>
                                </div>

                                {/* Patient Dossier Card */}
                                <div
                                    className={`dossier-card-pro ${
                                        isToday && Number(appointment.appointment_time?.substring(0, 2)) === currentHour ? "active-glow" : ""
                                    }`}
                                >
                                    <div className="dossier-identity-block">
                                        <div className="patient-avatar-pro">
                                            {appointment.patient_image && appointment.patient_image.trim() !== "" && !imageErrors[appointment.id] ? (
                                                <img 
                                                    src={toAssetUrl(appointment.patient_image)} 
                                                    alt={appointment.patient_name} 
                                                    crossOrigin="anonymous"
                                                    onError={() => setImageErrors(prev => ({ ...prev, [appointment.id]: true }))}
                                                />
                                            ) : (
                                                <span className="patient-initial">
                                                    {appointment.patient_name ? appointment.patient_name.charAt(0).toUpperCase() : 'P'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="identity-meta">
                                            <h4>{appointment.patient_name}</h4>
                                            <span className={`status-pill-minimal ${getStatusClass(appointment.status)}`}>
                                                {getStatusLabel(appointment.status)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="dossier-reason-block">
                                        <p>{appointment.reason || "Routine Clinical Assessment"}</p>
                                    </div>

                                    <div className="dossier-action-cluster">
                                        <button 
                                            onClick={() => navigate(`/doctor/patient-records?patientId=${appointment.patient_id}`)}
                                            className="btn-dossier-primary"
                                        >
                                            Open Record
                                        </button>
                                        
                                        {appointment.status.toLowerCase() === 'approved' && (
                                            <div className="dossier-secondary-actions">
                                                <button 
                                                    onClick={() => handleAction(appointment.id, 'complete')}
                                                    className="btn-icon-action btn-icon-complete"
                                                    title="Complete OPD"
                                                >
                                                    <Check size={18} strokeWidth={3} />
                                                </button>
                                                <button 
                                                    onClick={() => handleAction(appointment.id, 'cancel')}
                                                    className="btn-icon-action btn-icon-cancel"
                                                    title="Cancel Session"
                                                >
                                                    <X size={18} strokeWidth={3} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TodaySchedule;
