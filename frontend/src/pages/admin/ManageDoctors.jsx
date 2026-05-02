import React, { useState, useEffect } from 'react';
import { 
    Search, UserPlus, ShieldCheck, Mail, MapPin, 
    MoreVertical, RefreshCw, CheckCircle, AlertTriangle, 
    User, ShieldAlert, X, Clock, Activity, Download, FileText, ChevronRight,
    Users, Verified, ShieldQuestion, UserCheck
} from 'lucide-react';
import { fetchDoctors, createDoctor, verifyDoctor, updateDoctorStatus, deleteDoctor } from '../../services/adminDoctorAPI';
import AddDoctorModal from '../../components/admin/AddDoctorModal';
import DoctorDrawer from '../../components/admin/DoctorDrawer';
import '../../styles/admin-manage-doctors.css';

const ManageDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0, active: 0 });
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sectorFilter, setSectorFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDoctors, setSelectedDoctors] = useState([]);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [selectedDoctorId, setSelectedDoctorId] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        loadDoctors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, statusFilter, sectorFilter]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (openMenuId && !e.target.closest('.actions-cell')) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openMenuId]);

    const loadDoctors = async () => {
        setLoading(true);
        setLoadError('');
        try {
            const data = await fetchDoctors({ page, status: statusFilter, search, sector: sectorFilter });
            setDoctors(data.doctors);
            setTotalPages(data.pages);
            if (data.stats) setStats(data.stats);
            setSelectedDoctors([]); 
            setOpenMenuId(null);
        } catch (err) {
            console.error('Failed to load doctors', err);
            const payload = err?.response?.data;
            const backendMessage =
                (typeof payload === 'string' && payload) ||
                payload?.error ||
                payload?.msg ||
                payload?.message;
            setLoadError(backendMessage || 'Unable to load doctor roster. Please refresh or re-login.');
        } finally {
            setLoading(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedDoctors.length === doctors.length && doctors.length > 0) {
            setSelectedDoctors([]);
        } else {
            setSelectedDoctors(doctors.map(d => d.id));
        }
    };

    const toggleSelectDoctor = (id) => {
        setSelectedDoctors(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleBulkVerify = async () => {
        if (selectedDoctors.length === 0) return;
        if (window.confirm(`Authorize clinical credentials for ${selectedDoctors.length} specialists?`)) {
            try {
                setLoading(true);
                await Promise.all(selectedDoctors.map(id => verifyDoctor(id)));
                loadDoctors();
                setSelectedDoctors([]);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleBulkActivate = async () => {
        if (selectedDoctors.length === 0) return;
        if (window.confirm(`Restore active status for ${selectedDoctors.length} specialists?`)) {
            try {
                setLoading(true);
                await Promise.all(selectedDoctors.map(id => updateDoctorStatus(id, { status: 'active', reason: 'Mass activation' })));
                loadDoctors();
                setSelectedDoctors([]);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleBulkSuspend = async () => {
        const reason = prompt(`Reason for mass suspension of ${selectedDoctors.length} providers:`);
        if (!reason) return;
        try {
            setLoading(true);
            await Promise.all(selectedDoctors.map(id => updateDoctorStatus(id, { status: 'suspended', reason })));
            loadDoctors();
            setSelectedDoctors([]);
        } finally {
            setLoading(false);
        }
    };

    const triggerSearch = () => {
        setPage(1);
        loadDoctors();
    };

    const handleOnboard = async (formData) => {
        const result = await createDoctor(formData);
        if (result?.email_sent) {
            alert('Doctor created and credentials email sent successfully.');
        } else {
            alert('Doctor created, but credentials email was NOT sent. Please check email provider keys in Render env.');
        }
        loadDoctors();
    };

    const handleVerify = async (id) => {
        if (window.confirm('Confirm clinical credential verification?')) {
            await verifyDoctor(id);
            loadDoctors();
        }
    };

    const handleTerminate = async (id) => {
        if (window.confirm('DANGER: Permanently delete this provider record?')) {
            await deleteDoctor(id);
            loadDoctors();
        }
    };

    const handleStatusToggle = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        const reason = prompt(`Reason for changing status to ${newStatus}:`);
        if (!reason) return;
        await updateDoctorStatus(id, { status: newStatus, reason });
        loadDoctors();
    };

    return (
        <div className="py-2">
            <header className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-5">
                <div>
                    <h1 className="h3 fw-black text-dark mb-1">Medical Roster</h1>
                    <p className="text-secondary fw-medium mb-0">Clinical Governance & Credentialing Intelligence</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary rounded-pill p-2" onClick={loadDoctors}>
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button 
                        className="btn btn-primary btn-onboard-specialist rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 border-0 shadow-sm"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <UserPlus size={18} /> Onboard Specialist
                    </button>
                </div>
            </header>

            <div className="row g-4 mb-5">
                {[
                    { label: "Total Providers", value: stats.total, color: "primary", icon: <Users size={20} /> },
                    { label: "Verified Specialists", value: stats.verified, color: "success", icon: <Verified size={20} /> },
                    { label: "Pending Review", value: stats.pending, color: "warning", icon: <ShieldQuestion size={20} /> },
                    { label: "Active Roster", value: stats.active, color: "info", icon: <UserCheck size={20} /> },
                ].map((stat, i) => (
                    <div key={i} className="col-6 col-lg-3">
                        <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden position-relative">
                            <div className="card-body p-4">
                                <div className={`bg-${stat.color} bg-opacity-10 text-${stat.color} p-2 rounded-3 d-inline-flex mb-3`}>
                                    {stat.icon}
                                </div>
                                <div className="small fw-bold text-uppercase text-secondary mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>{stat.label}</div>
                                <div className={`h2 fw-black text-dark mb-0`}>{stat.value}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-5">
                {loadError && (
                    <div className="alert alert-danger border-0 rounded-0 mb-0 fw-semibold">
                        {loadError}
                    </div>
                )}
                <div className="card-header bg-white border-0 p-4 pb-0">
                    <div className="doctor-roster-toolbar">
                        <div className="doctor-search-cell">
                            <div className="input-group doctor-search-group">
                                <span className="input-group-text bg-light border-0"><Search size={16} /></span>
                                <input 
                                    type="text" 
                                    className="form-control bg-light border-0" 
                                    placeholder="Search by name, license..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && triggerSearch()}
                                    aria-label="Search doctors by name or license"
                                />
                                <button className="btn btn-light border-0 doctor-search-submit" onClick={triggerSearch} aria-label="Search doctors"><ChevronRight size={16} /></button>
                            </div>
                        </div>
                        <div className="doctor-filter-group">
                            <div className="doctor-filter-cell">
                                <select className="form-select bg-light border-0 doctor-filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter doctors by account status">
                                    <option value="">ALL STATUS</option>
                                    <option value="active">ACTIVE</option>
                                    <option value="suspended">SUSPENDED</option>
                                </select>
                            </div>
                            <div className="doctor-filter-cell">
                                <select className="form-select bg-light border-0 doctor-filter-select" value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)} aria-label="Filter doctors by region">
                                    <option value="">ALL REGIONS</option>
                                    <option value="North Sector">NORTH</option>
                                    <option value="South Sector">SOUTH</option>
                                    <option value="East Sector">EAST</option>
                                    <option value="West Sector">WEST</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-body p-0 mt-4">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light bg-opacity-50">
                                <tr>
                                    <th className="px-4 py-3 border-0" style={{ width: '40px' }}>
                                        <div className="form-check">
                                            <input className="form-check-input" type="checkbox" checked={doctors.length > 0 && selectedDoctors.length === doctors.length} onChange={toggleSelectAll} />
                                        </div>
                                    </th>
                                    <th className="py-3 border-0 small fw-black text-uppercase opacity-50">Specialist</th>
                                    <th className="py-3 border-0 small fw-black text-uppercase opacity-50">Credentials</th>
                                    <th className="py-3 border-0 small fw-black text-uppercase opacity-50 text-center">Verification</th>
                                    <th className="py-3 border-0 small fw-black text-uppercase opacity-50 text-center">Account</th>
                                    <th className="py-3 border-0 small fw-black text-uppercase opacity-50 text-end px-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && doctors.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-5 opacity-50 fw-bold">INITIALIZING CLINICAL DATA...</td></tr>
                                ) : doctors.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-5 opacity-50 fw-bold">NO RECORDS FOUND</td></tr>
                                ) : (
                                    doctors.map((doc) => (
                                        <tr key={doc.id} className={selectedDoctors.includes(doc.id) ? 'table-primary bg-opacity-10' : ''}>
                                            <td className="px-4">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" checked={selectedDoctors.includes(doc.id)} onChange={() => toggleSelectDoctor(doc.id)} />
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-black" style={{ width: '40px', height: '40px' }}>
                                                        {doc.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'}
                                                    </div>
                                                    <div>
                                                        <div className="fw-black text-dark small mb-0">{doc.full_name}</div>
                                                        <div className="text-secondary" style={{ fontSize: '0.75rem' }}>{doc.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="fw-bold small text-dark">{doc.specialization || 'General'}</div>
                                                <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Lic: {doc.license_number || 'PENDING'}</div>
                                            </td>
                                            <td className="text-center">
                                                {doc.is_verified ? (
                                                    <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2">
                                                        <ShieldCheck size={12} className="me-1 mb-1" /> Verified
                                                    </span>
                                                ) : (
                                                    <span className="badge rounded-pill bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-3 py-2 cursor-pointer" onClick={() => handleVerify(doc.id)}>
                                                        <AlertTriangle size={12} className="me-1 mb-1" /> Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="text-center">
                                                <span className={`badge rounded-pill px-3 py-2 ${doc.account_status === 'active' ? 'bg-info bg-opacity-10 text-info border-info' : 'bg-danger bg-opacity-10 text-danger border-danger'} border border-opacity-25`}>
                                                    {doc.account_status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="text-end px-4 actions-cell position-relative">
                                                <button className="btn btn-light btn-sm rounded-circle p-2 border-0" onClick={() => setOpenMenuId(openMenuId === doc.id ? null : doc.id)}>
                                                    <MoreVertical size={18} />
                                                </button>
                                                
                                                {openMenuId === doc.id && (
                                                    <div className="dropdown-menu show shadow-lg border-light rounded-4 p-2 end-0 translate-middle-y mt-2" style={{ zIndex: 1000, right: '50px' }}>
                                                        <button className="dropdown-item rounded-3 d-flex align-items-center gap-2 py-2" onClick={() => { setSelectedDoctorId(doc.id); setIsDrawerOpen(true); setOpenMenuId(null); }}>
                                                            <User size={14} /> Profile
                                                        </button>
                                                        <button className="dropdown-item rounded-3 d-flex align-items-center gap-2 py-2" onClick={() => { window.open(`mailto:${doc.email}`, '_self'); setOpenMenuId(null); }}>
                                                            <Mail size={14} /> Contact
                                                        </button>
                                                        <div className="dropdown-divider mx-2"></div>
                                                        <button className="dropdown-item rounded-3 d-flex align-items-center gap-2 py-2" onClick={() => handleStatusToggle(doc.id, doc.account_status)}>
                                                            {doc.account_status === 'active' ? <AlertTriangle size={14} className="text-danger" /> : <CheckCircle size={14} className="text-success" />}
                                                            {doc.account_status === 'active' ? 'Suspend' : 'Activate'}
                                                        </button>
                                                        <button className="dropdown-item rounded-3 d-flex align-items-center gap-2 py-2 text-danger" onClick={() => handleTerminate(doc.id)}>
                                                            <X size={14} /> Terminate
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card-footer bg-white border-0 p-4 d-flex justify-content-between align-items-center">
                    <div className="small fw-black text-uppercase opacity-50" style={{ letterSpacing: '1px', fontSize: '0.65rem' }}>
                        Page {page} of {totalPages}
                    </div>
                    <nav className="d-flex gap-1">
                        <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" disabled={page === 1} onClick={() => setPage(page-1)}>Prev</button>
                        <button className="btn btn-primary btn-sm rounded-pill px-3 fw-bold">{page}</button>
                        <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" disabled={page === totalPages} onClick={() => setPage(page+1)}>Next</button>
                    </nav>
                </div>
            </div>

            {/* Bulk Actions Floating Bar */}
            {selectedDoctors.length > 0 && (
                <div className="fixed-bottom p-4 d-flex justify-content-center" style={{ zIndex: 2000 }}>
                    <div className="bg-dark text-white rounded-pill px-5 py-3 shadow-lg d-flex align-items-center gap-4 border border-secondary">
                        <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-primary rounded-pill px-2">{selectedDoctors.length}</span>
                            <span className="small fw-black text-uppercase border-end border-secondary pe-4 me-1">Specialists Selected</span>
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-outline-light rounded-pill px-3 fw-bold border-0" onClick={handleBulkVerify}><ShieldCheck size={14} className="me-2" /> Verify</button>
                            <button className="btn btn-sm btn-outline-light rounded-pill px-3 fw-bold border-0" onClick={handleBulkActivate}><CheckCircle size={14} className="me-2" /> Activate</button>
                            <button className="btn btn-sm btn-outline-danger-soft rounded-pill px-3 fw-bold border-0" onClick={handleBulkSuspend}><AlertTriangle size={14} className="me-2" /> Suspend</button>
                            <button className="btn btn-sm btn-link text-light text-decoration-none fw-black small px-3" onClick={() => setSelectedDoctors([])}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <AddDoctorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleOnboard} />
            <DoctorDrawer doctorId={selectedDoctorId} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

            <style>{`
                .fw-black { font-weight: 950; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .btn-outline-danger-soft { color: #ff6b6b; }
                .btn-outline-danger-soft:hover { background: #ff6b6b; color: white; }
                .dropdown-item:active { background-color: var(--bs-primary); }
                .btn-onboard-specialist {
                  background: var(--admin-accent-gradient) !important;
                  border: 1px solid color-mix(in srgb, var(--admin-accent) 55%, transparent) !important;
                  box-shadow: 0 8px 20px color-mix(in srgb, var(--admin-accent) 26%, transparent) !important;
                }
                .btn-onboard-specialist:hover {
                  transform: translateY(-1px);
                  filter: brightness(1.03);
                }
            `}</style>
        </div>
    );
};

export default ManageDoctors;
