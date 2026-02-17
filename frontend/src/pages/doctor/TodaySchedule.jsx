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
                        <span className="count">{schedule.filter(a => a.status === 'Approved').length}</span>
                        <span className="label">Approved</span>
                    </div>
                </div>
                <div className="metric-card-pro pending">
                    <div className="metric-icon-circle">
                        <Clock size={20} />
                    </div>
                    <div className="metric-info">
                        <span className="count">{schedule.filter(a => a.status === 'Pending').length}</span>
                        <span className="label">Pending</span>
                    </div>
                </div>
                <div className="metric-card-pro noshow">
                    <div className="metric-icon-circle">
                        <X size={20} />
                    </div>
                    <div className="metric-info">
                        <span className="count">{schedule.filter(a => a.status === 'No-Show').length}</span>
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
                    
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none" size={14} />
                        <input 
                            type="date" 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="pl-9 pr-3 h-9 bg-slate-50 border-none rounded-xl font-bold text-[11px] text-slate-700 cursor-pointer outline-none"
                        />
                    </div>
                </div>

                <div className="instrument-group-right">
                    <div className="flex items-center gap-2">
                        <Filter size={14} className="text-slate-400" />
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-transparent border-none font-bold text-[11px] text-slate-600 cursor-pointer outline-none appearance-none pr-4"
                        >
                            <option value="all">Every Patient</option>
                            <option value="Approved">Approved Only</option>
                            <option value="Completed">Completed Only</option>
                            <option value="No-Show">No Show Only</option>
                        </select>
                    </div>
                    
                    {isToday && (
                        <div className="live-triage-pill ml-4">
                            <span></span> Live Session
                        </div>
                    )}
                </div>
            </div>

            {/* SECTION 3: Timeline Area */}
            <div className="opd-timeline-canvas">
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="doc-spinner mx-auto mb-4 w-10 h-10 border-[3px]"></div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Syncing Diagnostic Flow...</p>
                    </div>
                ) : schedule.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                        <Bookmark size={40} className="text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-black text-slate-800 mb-2">Agenda Clear</h3>
                        <p className="text-slate-400 text-xs mb-8">No OPD consultations linked to this station.</p>
                        <button onClick={() => navigate('/doctor/requests')} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                            Review Requests
                        </button>
                    </div>
                ) : (
                    <div className="timeline-execution-list">
                        {schedule.map((appointment) => (
                            <div key={appointment.id} className="timeline-slot-row">
                                {/* Time Column */}
                                <div className="slot-time-anchor">
                                    <span className="time">{appointment.appointment_time.substring(0, 5)}</span>
                                    <span className="ampm">{parseInt(appointment.appointment_time.substring(0,2)) >= 12 ? 'PM' : 'AM'}</span>
                                </div>

                                {/* Patient Dossier Card */}
                                <div className={`dossier-card-pro ${isToday && appointment.appointment_time.startsWith(new Date().getHours().toString().padStart(2, '0')) ? 'active-glow' : ''}`}>
                                    <div className="dossier-identity-block">
                                        <div className="patient-avatar-pro overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                                            {appointment.patient_image && appointment.patient_image.trim() !== "" && !imageErrors[appointment.id] ? (
                                                <img 
                                                    src={toAssetUrl(appointment.patient_image)} 
                                                    alt={appointment.patient_name} 
                                                    crossOrigin="anonymous"
                                                    onError={() => setImageErrors(prev => ({ ...prev, [appointment.id]: true }))}
                                                />
                                            ) : (
                                                <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                                                    {appointment.patient_name ? appointment.patient_name.charAt(0).toUpperCase() : 'P'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="identity-meta">
                                            <h4>{appointment.patient_name}</h4>
                                            <span className={`status-pill-minimal ${appointment.status.toLowerCase().replace('-', '')}`}>
                                                {appointment.status === 'Approved' ? '🟢 Approved' : 
                                                 appointment.status === 'Pending' ? '⏳ Pending' :
                                                 appointment.status === 'No-Show' ? '❌ No Show' :
                                                 appointment.status === 'Completed' ? '🔵 Completed' :
                                                 '⚪️ ' + appointment.status}
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
                                        
                                        {appointment.status === 'Approved' && (
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleAction(appointment.id, 'complete')}
                                                    className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                    title="Complete OPD"
                                                >
                                                    <Check size={18} strokeWidth={3} />
                                                </button>
                                                <button 
                                                    onClick={() => handleAction(appointment.id, 'cancel')}
                                                    className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
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
