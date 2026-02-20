import React, { useEffect, useState } from 'react';
import prescriptionService from '../../services/prescriptionService';
import { Activity, Users } from 'lucide-react';
import '../../styles/doctor-prescription-pro.css';

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

    const renderHistoryItem = (p) => (
        <div key={p.id} className="history-item fade-in" style={{ 
            background: '#FFFFFF', 
            border: '1px solid #F1F5F9',
            borderRadius: '12px', 
            padding: '16px', 
            marginBottom: '12px', 
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{ 
                position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px',
                background: p.status === 'Active' ? '#10B981' : p.status === 'Draft' ? '#F59E0B' : '#94A3B8'
            }}></div>

            <div style={{ paddingLeft: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: 'var(--doc-text-main)', fontSize: '0.9rem' }}>
                        {new Date(p.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span style={{ 
                        fontSize: '0.7rem', padding: '4px 8px', borderRadius: '6px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                        background: p.status === 'Active' ? '#ECFDF5' : '#F8FAFC',
                        color: p.status === 'Active' ? '#059669' : '#64748B'
                    }}>
                        {p.status}
                    </span>
                </div>
                
                <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--doc-text-main)', marginBottom: '8px', lineHeight: '1.4' }}>
                    {p.diagnosis || 'No Diagnosis'}
                </div>
                
                <div style={{ fontSize: '0.8rem', color: 'var(--doc-text-muted)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {p.items?.length || 0} Medicines
                    </span>
                    {p.valid_until && (
                        <span style={{ color: new Date(p.valid_until) < new Date() ? '#EF4444' : 'inherit' }}>
                            • Valid until {new Date(p.valid_until).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Filter Tabs */}
            <div className="history-filters">
                {['All', 'Active', 'Expired'].map(tab => (
                    <button 
                        key={tab}
                        className={`filter-tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}

                {hasPatientFilter && (
                    <div className="history-patient-picker-wrap">
                        <label htmlFor="historyPatientSelect">Patient</label>
                        <select
                            id="historyPatientSelect"
                            className="history-patient-picker"
                            value={selectedPatientKey}
                            onChange={(e) => setSelectedPatientKey(e.target.value)}
                        >
                            <option value="all">All patients</option>
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
            <div className="history-list" style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', color: 'var(--doc-text-muted)', padding: '40px' }}>
                        <div className="doc-spinner" style={{ margin: '0 auto 12px' }}></div>
                        Loading records...
                    </div>
                ) : filteredList.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--doc-text-muted)', padding: '60px 20px', opacity: 0.7 }}>
                        <Activity size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                        <p>{patientId ? 'No matching records.' : 'No prescriptions found.'}</p>
                    </div>
                ) : (
                    patientId ? (
                        filteredList.map(renderHistoryItem)
                    ) : selectedPatientKey !== 'all' ? (
                        <section className="history-patient-group">
                            <div className="history-patient-header">
                                <div className="history-patient-title">
                                    <Users size={14} />
                                    <span>{selectedPatientGroup?.patientName || 'Patient'}</span>
                                </div>
                                <span className="history-patient-count">{listForSelectedPatient.length} records</span>
                            </div>
                            {listForSelectedPatient.map(renderHistoryItem)}
                        </section>
                    ) : (
                        patientGroups.map(([groupId, group]) => (
                            <section key={groupId} className="history-patient-group">
                                <div className="history-patient-header">
                                    <div className="history-patient-title">
                                        <Users size={14} />
                                        <span>{group.patientName}</span>
                                    </div>
                                    <span className="history-patient-count">{group.items.length} records</span>
                                </div>
                                {group.items.map(renderHistoryItem)}
                            </section>
                        ))
                    )
                )}
            </div>
        </div>
    );
};

export default PrescriptionList;
