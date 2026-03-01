import React, { useEffect, useState } from 'react';
import prescriptionService from '../../services/prescriptionService';
import { Activity, Users } from 'lucide-react';

const PrescriptionList = ({ patientId, refreshTrigger }) => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('All');
    const [selectedPatientKey, setSelectedPatientKey] = useState('all');

    useEffect(() => {
        const fetchHistory = async () => {
            if (!patientId) {
                // Load recent or empty
                try {
                    const all = await prescriptionService.getDoctorPrescriptions();
                    setPrescriptions(all);
                } catch (e) { console.error(e); }
                return;
            }

            setLoading(true);
            try {
                const data = await prescriptionService.getPrescriptionsByPatient(patientId);
                setPrescriptions(data);
            } catch (err) {
                console.error("Error fetching history:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [patientId, refreshTrigger]);

    const getFilteredPrescriptions = () => {
        if (activeTab === 'All') return prescriptions;
        const now = new Date();
        return prescriptions.filter(p => {
            if (activeTab === 'Active') {
                return p.status === 'Active' && (!p.valid_until || new Date(p.valid_until) >= now);
            }
            if (activeTab === 'Expired') {
                return (p.valid_until && new Date(p.valid_until) < now) || p.status === 'Cancelled';
            }
            return true;
        });
    };

    const filteredList = getFilteredPrescriptions();

    const groupedByPatient = filteredList.reduce((acc, item) => {
        const patientKey = item.patient_id || `unknown-${item.id}`;
        const patientName = item.patient_name || `Patient #${item.patient_id || 'Unknown'}`;
        if (!acc[patientKey]) {
            acc[patientKey] = { patientName, items: [] };
        }
        acc[patientKey].items.push(item);
        return acc;
    }, {});

    const patientGroups = Object.entries(groupedByPatient);
    const hasPatientFilter = !patientId;
    const selectedPatientGroup = selectedPatientKey === 'all'
        ? null
        : groupedByPatient[selectedPatientKey];
    const listForSelectedPatient = selectedPatientGroup ? selectedPatientGroup.items : [];

    React.useEffect(() => {
        if (!hasPatientFilter) {
            setSelectedPatientKey('all');
            return;
        }

        if (selectedPatientKey !== 'all' && !groupedByPatient[selectedPatientKey]) {
            setSelectedPatientKey('all');
        }
    }, [hasPatientFilter, selectedPatientKey, groupedByPatient]);

    const renderHistoryItem = (p) => {
        const bgStatus = p.status === 'Active' ? 'success' : p.status === 'Draft' ? 'warning' : 'secondary';
        return (
        <div key={p.id} className="card border-0 shadow-sm rounded-4 mb-3 position-relative overflow-hidden hover-shadow transition-all" style={{ borderLeft: `5px solid var(--bs-${bgStatus})` }}>
            <div className={`position-absolute top-0 bottom-0 start-0 bg-${bgStatus}`} style={{ width: '5px' }}></div>
            <div className="card-body p-3 p-md-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bolder text-dark" style={{ fontSize: '0.9rem' }}>
                        {new Date(p.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className={`badge bg-${bgStatus} bg-opacity-10 text-${bgStatus} border border-${bgStatus} border-opacity-25 rounded-pill px-2 py-1 text-uppercase fw-bold`} style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                        {p.status}
                    </span>
                </div>
                
                <div className="fw-medium text-dark mb-3 lh-sm" style={{ fontSize: '0.95rem' }}>
                    {p.diagnosis || 'No Diagnosis specified for this session.'}
                </div>
                
                <div className="d-flex flex-wrap align-items-center gap-3 text-secondary small fw-bold">
                    <span className="d-flex align-items-center gap-2 bg-light px-2 py-1 rounded-3">
                        <Activity size={14} className="text-secondary" />
                        {p.items?.length || 0} Meds
                    </span>
                    {p.valid_until && (
                        <span className={`d-flex align-items-center px-2 py-1 rounded-3 ${new Date(p.valid_until) < new Date() ? 'bg-danger bg-opacity-10 text-danger' : 'bg-light text-secondary'}`}>
                            • Valid until {new Date(p.valid_until).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )};

    return (
        <div className="d-flex flex-column h-100 bg-white">
            {/* Filter Tabs */}
            <div className="px-4 pt-3 pb-2 border-bottom border-light">
                <div className="d-flex gap-2 mb-3 bg-light p-1 rounded-pill">
                    {['All', 'Active', 'Expired'].map(tab => (
                        <button 
                            key={tab}
                            className={`btn flex-grow-1 rounded-pill fw-bold text-uppercase border-0 transition-all ${activeTab === tab ? 'btn-white bg-white shadow-sm text-dark' : 'text-secondary hover-bg-white'}`}
                            style={{ fontSize: '0.75rem', letterSpacing: '0.5px', padding: '0.5rem 1rem' }}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {hasPatientFilter && (
                    <div className="mb-2">
                        <select
                            className="form-select form-select-sm border-0 bg-light shadow-none fw-bold text-dark rounded-pill px-3 py-2"
                            value={selectedPatientKey}
                            onChange={(e) => setSelectedPatientKey(e.target.value)}
                        >
                            <option value="all">Every Patient ({filteredList.length})</option>
                            {patientGroups.map(([key, group]) => (
                                <option key={key} value={key}>
                                    {group.patientName} ({group.items.length})
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* List Content */}
            <div className="flex-grow-1 overflow-y-auto p-4 custom-scrollbar">
                {loading ? (
                    <div className="d-flex flex-column align-items-center py-5 text-secondary">
                        <div className="spinner-border text-primary border-3 mb-3" style={{ width: '2rem', height: '2rem' }}></div>
                        <span className="small fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Loading records...</span>
                    </div>
                ) : filteredList.length === 0 ? (
                    <div className="d-flex flex-column align-items-center justify-content-center text-center py-5 my-4 bg-light rounded-4 border border-dashed text-secondary">
                        <Activity size={32} className="opacity-50 mb-3" />
                        <h5 className="fw-bolder text-dark mb-1">No Records</h5>
                        <p className="small mb-0 opacity-75">{patientId ? 'No matching prescriptions for this patient.' : 'No prescriptions found.'}</p>
                    </div>
                ) : (
                    patientId ? (
                        filteredList.map(renderHistoryItem)
                    ) : selectedPatientKey !== 'all' ? (
                        <section className="mb-4">
                            <div className="d-flex align-items-center justify-content-between mb-3 px-2">
                                <div className="d-flex align-items-center gap-2 text-dark fw-bolder" style={{ fontSize: '0.9rem' }}>
                                    <Users size={16} className="text-primary" />
                                    <span>{selectedPatientGroup?.patientName || 'Patient'}</span>
                                </div>
                                <span className="badge bg-light text-secondary border px-2 py-1">{listForSelectedPatient.length} records</span>
                            </div>
                            {listForSelectedPatient.map(renderHistoryItem)}
                        </section>
                    ) : (
                        patientGroups.map(([groupId, group]) => (
                            <section key={groupId} className="mb-4">
                                <div className="d-flex align-items-center justify-content-between mb-3 px-2">
                                    <div className="d-flex align-items-center gap-2 text-dark fw-bolder" style={{ fontSize: '0.9rem' }}>
                                        <Users size={16} className="text-primary" />
                                        <span>{group.patientName}</span>
                                    </div>
                                    <span className="badge bg-light text-secondary border px-2 py-1">{group.items.length} records</span>
                                </div>
                                {group.items.map(renderHistoryItem)}
                            </section>
                        ))
                    )
                )}
            </div>

            <style>{`
                .hover-shadow { transition: box-shadow 0.3s ease; }
                .hover-shadow:hover { box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08) !important; z-index: 10; }
                .hover-bg-white:hover { background-color: rgba(255,255,255,0.5); }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>
        </div>
    );
};

export default PrescriptionList;
