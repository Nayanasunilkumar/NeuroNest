import { useState, useEffect } from "react";
import { getAppointmentRequests, approveAppointment, rejectAppointment } from "../../api/doctor";
import { Check, X, Clock, Calendar, MessageSquare, User } from "lucide-react";
import "../../styles/doctor.css";

const AppointmentRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await getAppointmentRequests();
            setRequests(data);
        } catch (err) {
            console.error("Error fetching requests:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        setActionLoading(id);
        try {
            if (action === "approve") {
                await approveAppointment(id);
            } else {
                await rejectAppointment(id);
            }
            // Filter out the acted upon request
            setRequests(requests.filter(req => req.id !== id));
        } catch (err) {
            console.error(`Error ${action}ing appointment:`, err);
        } finally {
            setActionLoading(null);
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return "Time not set";
        const [hour, minute] = timeString.split(":");
        const hourNum = Number(hour);
        if (Number.isNaN(hourNum)) return timeString.substring(0, 5);
        const period = hourNum >= 12 ? "PM" : "AM";
        const convertedHour = hourNum % 12 || 12;
        return `${convertedHour}:${minute} ${period}`;
    };

    if (loading) {
        return (
            <div className="doc-loader-container">
                <div className="doc-spinner"></div>
                <p className="text-slate-500">Fetching your requests...</p>
            </div>
        );
    }

    return (
        <div className="fade-in appointment-requests-page">
            <div className="doc-page-header">
                <h1>Appointment Requests</h1>
                <p>Review and manage incoming patient booking requests</p>
            </div>

            {requests.length === 0 ? (
                <div className="empty-state-card">
                    <Clock size={48} className="mx-auto mb-4 text-slate-300" />
                    <h3>No pending requests</h3>
                    <p>New appointment requests will appear here when patients book with you.</p>
                </div>
            ) : (
                <div className="requests-grid">
                    {requests.map((request) => (
                        <div key={request.id} className="request-card">
                            <div className="card-header">
                                <div className="patient-info-mini">
                                    <div className="patient-avatar-mini">
                                        {request.patient_name ? request.patient_name.charAt(0) : <User size={20} />}
                                    </div>
                                    <div className="patient-name-stack">
                                        <h4>{request.patient_name}</h4>
                                        <span>Requested on {new Date(request.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <span className="doc-badge doc-badge-amber">
                                    Pending
                                </span>
                            </div>

                            <div className="appointment-details-list">
                                <div className="detail-item">
                                    <Calendar size={16} />
                                    <span>{new Date(request.appointment_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                <div className="detail-item">
                                    <Clock size={16} />
                                    <span>{formatTime(request.appointment_time)}</span>
                                </div>
                                <div className="detail-item">
                                    <MessageSquare size={16} />
                                    <div className="reason-container">
                                        <p><strong>Reason:</strong> {request.reason}</p>
                                    </div>
                                </div>
                                {request.notes && (
                                    <div className="detail-item request-notes">
                                        <div className="notes-text">
                                            "{request.notes}"
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="card-actions">
                                <button 
                                    onClick={() => handleAction(request.id, "approve")}
                                    disabled={actionLoading === request.id}
                                    className="btn-approve"
                                >
                                    {actionLoading === request.id ? (
                                        <div className="doc-spinner spinner-sm"></div>
                                    ) : (
                                        <>
                                            <Check size={18} />
                                            Approve Request
                                        </>
                                    )}
                                </button>
                                <button 
                                    onClick={() => handleAction(request.id, "reject")}
                                    disabled={actionLoading === request.id}
                                    className="btn-reject"
                                    title="Reject Request"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AppointmentRequests;
