import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getSchedule, completeAppointment, cancelAppointment, markNoShow } from "../../api/doctor";
import { 
    Clock, Calendar, ChevronRight, FileText,
    ChevronLeft, Check, X, Filter, Bookmark
} from "lucide-react";
import { toAssetUrl } from "../../utils/media";

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

    const getStatusStyle = (status) => {
        if (!status) return { bg: 'secondary', text: 'secondary' };
        const s = status.toLowerCase();
        if (s === 'approved') return { bg: 'success', text: 'success' };
        if (s === 'pending') return { bg: 'warning', text: 'warning' };
        if (s === 'cancelled') return { bg: 'danger', text: 'danger' };
        if (s === 'completed') return { bg: 'primary', text: 'primary' };
        if (s === 'no_show' || s === 'no-show') return { bg: 'dark', text: 'dark' };
        return { bg: 'secondary', text: 'secondary' };
    };

    const getStatusLabel = (status) => {
        if (!status) return "Unknown";
        const s = status.toLowerCase();
        if (s === "no_show" || s === "no-show") return "No Show";
        return status;
    };

    return (
        <div className="container-fluid py-4 min-vh-100 bg-light" style={{ maxWidth: '1400px' }}>
            <div className="mb-4">
                 <h2 className="fw-bolder text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>Clinical Agenda</h2>
                 <p className="text-secondary small fw-medium">Manage your daily consultation schedule and patient flows</p>
            </div>

            {/* SECTION 1: Summary Metric Grid */}
            <div className="row g-3 g-md-4 mb-4">
                <div className="col-6 col-xl-3">
                    <div className="card h-100 border-0 shadow-sm rounded-4 hover-lift">
                        <div className="card-body p-4 d-flex align-items-center gap-3">
                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '48px', height: '48px' }}>
                                <FileText size={22} />
                            </div>
                            <div>
                                <h3 className="h4 fw-bolder mb-0 text-dark">{schedule.length}</h3>
                                <p className="text-secondary small fw-bold text-uppercase mb-0" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>Total Cases</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-xl-3">
                    <div className="card h-100 border-0 shadow-sm rounded-4 hover-lift">
                        <div className="card-body p-4 d-flex align-items-center gap-3">
                            <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '48px', height: '48px' }}>
                                <Check size={22} />
                            </div>
                            <div>
                                <h3 className="h4 fw-bolder mb-0 text-dark">{schedule.filter(a => a.status.toLowerCase() === 'approved').length}</h3>
                                <p className="text-secondary small fw-bold text-uppercase mb-0" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>Approved</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-xl-3">
                    <div className="card h-100 border-0 shadow-sm rounded-4 hover-lift">
                        <div className="card-body p-4 d-flex align-items-center gap-3">
                            <div className="bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '48px', height: '48px' }}>
                                <Clock size={22} />
                            </div>
                            <div>
                                <h3 className="h4 fw-bolder mb-0 text-dark">{schedule.filter(a => a.status.toLowerCase() === 'pending').length}</h3>
                                <p className="text-secondary small fw-bold text-uppercase mb-0" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>Pending</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-xl-3">
                    <div className="card h-100 border-0 shadow-sm rounded-4 hover-lift">
                        <div className="card-body p-4 d-flex align-items-center gap-3">
                            <div className="bg-dark bg-opacity-10 text-dark rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '48px', height: '48px' }}>
                                <X size={22} />
                            </div>
                            <div>
                                <h3 className="h4 fw-bolder mb-0 text-dark">{schedule.filter(a => a.status.toLowerCase() === 'no_show').length}</h3>
                                <p className="text-secondary small fw-bold text-uppercase mb-0" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>No Show</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 2: Instrumental Control Bar */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 bg-white p-3 rounded-4 shadow-sm border border-light">
                <div className="d-flex flex-wrap align-items-center gap-3">
                    <div className="d-flex align-items-center bg-light p-1 rounded-pill">
                        <button onClick={() => handleDateStep(-1)} className="btn btn-sm btn-white bg-white shadow-sm rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                            <ChevronLeft size={16} className="text-dark" />
                        </button>
                        <span className="fw-bolder text-dark px-3 mt-1" style={{ fontSize: '0.85rem' }}>
                            {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <button onClick={() => handleDateStep(1)} className="btn btn-sm btn-white bg-white shadow-sm rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                            <ChevronRight size={16} className="text-dark" />
                        </button>
                    </div>
                    
                    <div className="position-relative">
                        <Calendar className="position-absolute text-secondary" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} size={16} />
                        <input 
                            type="date" 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="form-control form-control-sm rounded-pill border border-light shadow-none bg-light fw-bold text-secondary"
                            style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
                        />
                    </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                    <div className="input-group shadow-sm border border-light rounded-pill overflow-hidden bg-light" style={{ minWidth: '180px' }}>
                        <span className="input-group-text bg-light border-0 text-secondary pe-1 ps-3">
                            <Filter size={14} />
                        </span>
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="form-select form-select-sm border-0 bg-light shadow-none fw-bold text-dark"
                            style={{ fontSize: '0.85rem', cursor: 'pointer', height: '38px' }}
                        >
                            <option value="all">Every Patient</option>
                            <option value="Approved">Approved Only</option>
                            <option value="Completed">Completed Only</option>
                            <option value="No-Show">No Show Only</option>
                        </select>
                    </div>
                    
                    {isToday && (
                        <div className="bg-danger bg-opacity-10 text-danger px-3 py-1 rounded-pill d-flex align-items-center gap-2 border border-danger border-opacity-25" style={{ height: '38px' }}>
                            <span className="spinner-grow spinner-grow-sm text-danger" role="status" style={{ width: '0.5rem', height: '0.5rem' }}></span>
                            <span className="fw-bold small text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Live Session</span>
                        </div>
                    )}
                </div>
            </div>

            {/* SECTION 3: Timeline Area */}
            <div>
                {loading ? (
                    <div className="d-flex flex-column align-items-center justify-content-center py-5 my-5 bg-white rounded-4 shadow-sm">
                        <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-secondary small fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Syncing Diagnostic Flow...</p>
                    </div>
                ) : schedule.length === 0 ? (
                    <div className="d-flex flex-column align-items-center justify-content-center py-5 my-5 bg-white rounded-4 shadow-sm border border-dashed text-center p-4">
                        <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '72px', height: '72px' }}>
                            <Bookmark size={32} className="text-secondary opacity-50" />
                        </div>
                        <h4 className="fw-bolder text-dark mb-2">Agenda Clear</h4>
                        <p className="text-secondary small mb-4">No OPD consultations linked to this station.</p>
                        <button onClick={() => navigate('/doctor/requests')} className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">
                            Review Requests
                        </button>
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-3">
                        {schedule.map((appointment) => {
                            const timeObj = formatDisplayTime(appointment.appointment_time);
                            const style = getStatusStyle(appointment.status);
                            const isActive = isToday && Number(appointment.appointment_time?.substring(0, 2)) === currentHour;
                            
                            return (
                            <div key={appointment.id} className="d-flex align-items-stretch gap-3 gap-md-4">
                                {/* Time Column */}
                                <div className="text-end border-end border-2 border-primary border-opacity-25 pe-3 pe-md-4 py-3 d-flex flex-column justify-content-center flex-shrink-0 position-relative" style={{ width: '100px' }}>
                                    <span className="fs-5 fw-bolder text-dark mb-0 lh-1">{timeObj.value}</span>
                                    <span className="small text-secondary fw-bold text-uppercase">{timeObj.period}</span>
                                    {/* Timeline Dot */}
                                    <div className="position-absolute bg-white rounded-circle border border-2 border-primary" style={{ width: '14px', height: '14px', right: '-8px', top: '50%', transform: 'translateY(-50%)' }}></div>
                                </div>

                                {/* Patient Dossier Card */}
                                <div className={`card border-0 shadow-sm rounded-4 flex-grow-1 overflow-hidden transition-all hover-lift ${isActive ? 'border border-primary' : ''}`}>
                                    <div className="card-body p-3 p-md-4 d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4">
                                        
                                        <div className="d-flex align-items-center gap-3">
                                            {/* Avatar */}
                                            <div className="bg-primary bg-opacity-10 rounded-circle overflow-hidden flex-shrink-0 d-flex align-items-center justify-content-center border" style={{ width: '56px', height: '56px' }}>
                                                {appointment.patient_image && appointment.patient_image.trim() !== "" && !imageErrors[appointment.id] ? (
                                                    <img 
                                                        src={toAssetUrl(appointment.patient_image)} 
                                                        alt={appointment.patient_name} 
                                                        className="w-100 h-100 object-fit-cover"
                                                        crossOrigin="anonymous"
                                                        onError={() => setImageErrors(prev => ({ ...prev, [appointment.id]: true }))}
                                                    />
                                                ) : (
                                                    <span className="fs-4 fw-bolder text-primary">
                                                        {appointment.patient_name ? appointment.patient_name.charAt(0).toUpperCase() : 'P'}
                                                    </span>
                                                )}
                                            </div>
                                            {/* Name & Status */}
                                            <div>
                                                <h4 className="h6 fw-bolder text-dark mb-1">{appointment.patient_name}</h4>
                                                <span className={`badge bg-${style.bg} bg-opacity-10 text-${style.text} border border-${style.bg} border-opacity-25 rounded-pill px-2 py-1 text-uppercase fw-bold`} style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                                                    {getStatusLabel(appointment.status)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex-grow-1 px-lg-3">
                                            <div className="d-inline-block bg-light px-3 py-2 rounded-3 border w-100 mt-2 mt-lg-0">
                                                <p className="small fw-medium text-dark mb-0 text-truncate" style={{ maxWidth: '400px' }}>
                                                    {appointment.reason || "Routine Clinical Assessment"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0 justify-content-end border-top border-lg-0 pt-3 pt-lg-0 w-100 flex-shrink-0" style={{ maxWidth: '100%', width: 'auto' }}>
                                            <button 
                                                onClick={() => navigate(`/doctor/patient-records?patientId=${appointment.patient_id}`)}
                                                className="btn btn-outline-primary rounded-pill px-4 fw-bold shadow-sm flex-grow-1 flex-md-grow-0"
                                            >
                                                Open Record
                                            </button>
                                            
                                            {appointment.status.toLowerCase() === 'approved' && (
                                                <div className="d-flex align-items-center gap-2">
                                                    <button 
                                                        onClick={() => handleAction(appointment.id, 'complete')}
                                                        className="btn btn-success text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm hover-lift"
                                                        title="Complete OPD"
                                                        style={{ width: '40px', height: '40px' }}
                                                    >
                                                        <Check size={18} strokeWidth={3} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleAction(appointment.id, 'cancel')}
                                                        className="btn btn-danger text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm hover-lift"
                                                        title="Cancel Session"
                                                        style={{ width: '40px', height: '40px' }}
                                                    >
                                                        <X size={18} strokeWidth={3} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )})}
                    </div>
                )}
            </div>
            
            <style>{`
                .hover-lift { transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
                .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.1) !important; }
            `}</style>
        </div>
    );
};

export default TodaySchedule;
