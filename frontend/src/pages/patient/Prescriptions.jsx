import React, { useState, useEffect } from "react";
import prescriptionService from "../../services/prescriptionService";
import PrescriptionModal from "../../components/patient/prescriptions/PrescriptionModal";
import "../../styles/patient-prescriptions.css"; // New CSS
import { Eye, FileText, AlertCircle, Calendar, User, CheckCircle, Clock, Pill } from "lucide-react";

const Prescriptions = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Modal State
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const fetchPrescriptions = async () => {
        try {
            setLoading(true);
            const data = await prescriptionService.getPatientPrescriptions();
            setPrescriptions(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching prescriptions:", err);
            setError("Failed to load prescriptions.");
        } finally {
            setLoading(false);
        }
    };

    const handleView = (prescription) => {
        setSelectedPrescription(prescription);
        setIsModalOpen(true);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="prescriptions-page-shell">
            {/* Header */}
            <div className="prescriptions-page-header">
                <h1 className="prescriptions-title-row">
                    <div className="prescriptions-title-icon">
                        <Pill size={28} />
                    </div>
                    <span className="prescriptions-title">My Prescriptions</span>
                </h1>
                <p className="prescriptions-subtitle">
                    Access and manage your medical prescriptions securely.
                </p>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center text-red-600 flex flex-col items-center gap-2 mb-6">
                    <AlertCircle size={32} />
                    <p>{error}</p>
                    <button onClick={fetchPrescriptions} className="text-blue-600 hover:underline text-sm font-semibold mt-2">Try Again</button>
                </div>
            )}

            {/* Content: Grid of Cards */}
            {loading ? (
                <div className="prescriptions-grid">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="rx-card" style={{ height: '240px' }}>
                            <div className="animate-pulse flex flex-col gap-4">
                                <div className="h-6 bg-gray-100 rounded w-1/3"></div>
                                <div className="h-12 bg-gray-100 rounded full"></div>
                                <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : prescriptions.length === 0 ? (
                <div className="prescriptions-empty">
                    <div className="prescriptions-empty-icon">
                        <FileText size={40} className="text-gray-300" />
                    </div>
                    <h3 className="prescriptions-empty-title">No Prescriptions Yet</h3>
                    <p className="prescriptions-empty-subtitle">Your received prescriptions will appear here.</p>
                </div>
            ) : (
                <div className="prescriptions-grid">
                    {prescriptions.map((p) => (
                        <div key={p.id} className="rx-card">
                            <div className="rx-card-header">
                                <div className="rx-date-badge">
                                    <Calendar size={14} />
                                    {formatDate(p.created_at)}
                                </div>
                                <span className={`rx-status-badge ${String(p.status).toLowerCase() === 'active' ? 'rx-status-active' : 'rx-status-expired'}`}>
                                    {p.status}
                                </span>
                            </div>

                            <div className="rx-doctor-info">
                                <div className="rx-doctor-avatar">
                                    <User size={24} />
                                </div>
                                <div className="rx-doctor-details">
                                    <h4>{p.doctor_name || "Doctor"}</h4>
                                    <p>General Physician</p> {/* Placeholder if specialization not available */}
                                </div>
                            </div>

                            <div style={{ marginTop: 'auto' }}>
                                <label className="rx-diagnosis-label">Diagnosis</label>
                                <div className="rx-diagnosis-tag">
                                    {p.diagnosis || "No Diagnosis"}
                                </div>
                            </div>

                            <button onClick={() => handleView(p)} className="btn-view-rx" style={{ marginTop: '20px', width: '100%', justifyContent: 'center' }}>
                                <Eye size={18} />
                                View Prescription
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <PrescriptionModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                prescription={selectedPrescription} 
            />
        </div>
    );
};

export default Prescriptions;
