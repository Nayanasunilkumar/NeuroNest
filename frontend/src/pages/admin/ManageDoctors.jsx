import React, { useState, useEffect } from 'react';
import { 
    Search, UserPlus, ShieldCheck, Mail, MapPin, 
    MoreVertical, RefreshCw, CheckCircle, AlertTriangle, 
    User, ShieldAlert, X, Clock, Activity, Download, FileText, ChevronRight
} from 'lucide-react';
import { fetchDoctors, createDoctor, verifyDoctor, updateDoctorStatus, deleteDoctor } from '../../services/adminDoctorAPI';
import AddDoctorModal from '../../components/admin/AddDoctorModal';
import DoctorDrawer from '../../components/admin/DoctorDrawer';
import '../../styles/admin-manage-doctors.css';

const ManageDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0, active: 0 });
    const [loading, setLoading] = useState(true);
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
        try {
            const data = await fetchDoctors({ page, status: statusFilter, search, sector: sectorFilter });
            setDoctors(data.doctors);
            setTotalPages(data.pages);
            if (data.stats) setStats(data.stats);
            setSelectedDoctors([]); // Reset selection on reload/page change
            setOpenMenuId(null);
        } catch (err) {
            console.error('Failed to load doctors', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedDoctors.length === doctors.length) {
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

        if (window.confirm(`Authorize/Refresh clinical credentials for ${selectedDoctors.length} selected specialists?`)) {
            try {
                setLoading(true);
                // We now allow proactive re-verification to ensure administrative intent is always synchronized
                await Promise.all(selectedDoctors.map(id => verifyDoctor(id)));
                alert(`SUCCESS: Institutional credentials authorized for ${selectedDoctors.length} providers.`);
                loadDoctors();
                setSelectedDoctors([]);
            } catch (err) {
                console.error('Credentialing Failure:', err);
                alert('ERROR: Technical failure during institutional credentialing.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleBulkActivate = async () => {
        if (selectedDoctors.length === 0) return;

        if (window.confirm(`Restore active status for ${selectedDoctors.length} selected specialists?`)) {
            try {
                setLoading(true);
                await Promise.all(selectedDoctors.map(id => updateDoctorStatus(id, { status: 'active', reason: 'Bulk restoration by Senior Admin' })));
                alert(`SUCCESS: Active roster status restored for ${selectedDoctors.length} specialists.`);
                loadDoctors();
                setSelectedDoctors([]);
            } catch (err) {
                console.error('Reactivation Failure:', err);
                alert('ERROR: Technical failure during roster reactivation.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleBulkSuspend = async () => {
        const reason = prompt(`Reason for mass suspension of ${selectedDoctors.length} providers:`);
        if (!reason) return;
        await Promise.all(selectedDoctors.map(id => updateDoctorStatus(id, { status: 'suspended', reason })));
        loadDoctors();
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            setPage(1);
            if (page === 1) loadDoctors(); // If already on page 1, trigger manually
        }
    };

    const triggerSearch = () => {
        setPage(1);
        if (page === 1) loadDoctors();
    };

    const handleExport = () => {
        if (selectedDoctors.length === 0) return;
        const selectedData = doctors.filter(d => selectedDoctors.includes(d.id));
        const csvContent = "data:text/csv;charset=utf-8," 
            + "ID,Name,Email,Specialization,License,Sector,Status\n"
            + selectedData.map(d => `${d.id},${d.full_name},${d.email},${d.specialization},${d.license_number},${d.sector},${d.account_status}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `NeuroNest_Specialist_Export_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert(`SUCCESS: Export manifest generated for ${selectedDoctors.length} specialists.`);
    };

    const handleOnboard = async (formData) => {
        await createDoctor(formData);
        loadDoctors();
    };

    const handleVerify = async (id) => {
        if (window.confirm('Confirm clinical credential verification for this provider?')) {
            await verifyDoctor(id);
            loadDoctors();
        }
    };

    const handleRevoke = async (id) => {
        if (window.confirm('WARNING: You are about to revoke all clinical credentials for this specialist. Continue?')) {
            await verifyDoctor(id, false);
            loadDoctors();
        }
    };

    const handleTerminate = async (id) => {
        const confirmTerm = window.confirm('DANGER: This action permanently removes the record from the clinical database, including all audit logs and prescriptions. Are you absolutely sure?');
        if (confirmTerm) {
            try {
                setLoading(true);
                await deleteDoctor(id);
                alert('SUCCESS: Specialist record and all clinical dependencies have been purged from the institutional roster.');
                loadDoctors();
                setOpenMenuId(null);
            } catch (err) {
                console.error('Record Decommissioning Failure:', err);
                alert(`ERROR: Technical failure while purging record. This may be due to active institutional dependencies. Details: ${err.response?.data?.error || err.message}`);
            } finally {
                setLoading(false);
            }
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
        <div className="manage-doctors-page">
            <header className="manage-header">
                <div className="title-group">
                    <h1>Medical Roster</h1>
                    <p>Clinical Governance & Credentialing</p>
                </div>
                <div className="header-actions">
                    <button className="onboard-btn" onClick={() => setIsModalOpen(true)}>
                        <UserPlus size={18} />
                        Onboard Specialist
                    </button>
                    <button className="refresh-btn" onClick={loadDoctors}>
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </header>

            <div className="doctors-stats-banner">
                <div className="stat-metric-card">
                    <span className="label">Total Providers</span>
                    <div className="value">{stats.total}</div>
                </div>
                <div className="stat-metric-card">
                    <span className="label">Verified Specialists</span>
                    <div className="value" style={{color: 'var(--admin-secondary)'}}>
                        {stats.verified}
                    </div>
                </div>
                <div className="stat-metric-card highlight">
                    <span className="label">Pending Review</span>
                    <div className="value" style={{color: '#f59e0b'}}>
                        {stats.pending}
                    </div>
                </div>
                <div className="stat-metric-card">
                    <span className="label">Active Roster</span>
                    <div className="value" style={{color: 'var(--admin-success)'}}>
                        {stats.active}
                    </div>
                </div>
            </div>

            <div className="filters-bar">
                <div className="search-input-wrap">
                    <Search size={18} style={{position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)'}} />
                    <input 
                        type="text" 
                        placeholder="Search by name, license or specialty..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                    <button className="search-trigger-btn" onClick={triggerSearch}>
                        <ChevronRight size={18} />
                    </button>
                </div>
                <select 
                    className="status-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">ALL STATUS</option>
                    <option value="active">ACTIVE ONLY</option>
                    <option value="suspended">SUSPENDED</option>
                </select>
                <select 
                    className="status-select"
                    value={sectorFilter}
                    onChange={(e) => setSectorFilter(e.target.value)}
                >
                    <option value="">ALL REGIONS</option>
                    <option value="North Sector">NORTH SECTOR</option>
                    <option value="South Sector">SOUTH SECTOR</option>
                    <option value="East Sector">EAST SECTOR</option>
                    <option value="West Sector">WEST SECTOR</option>
                </select>
            </div>

            <div className="doctor-table-container">
                <table className="doctor-table">
                    <thead>
                        <tr>
                            <th style={{width: '40px'}}>
                                <input 
                                    type="checkbox" 
                                    className="bulk-checkbox" 
                                    checked={doctors.length > 0 && selectedDoctors.length === doctors.length}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th>Member Identity</th>
                            <th style={{width: '180px'}}>Specialization</th>
                            <th style={{width: '150px'}}>License #</th>
                            <th style={{width: '150px'}}>Credentialing</th>
                            <th style={{width: '110px'}}>Status</th>
                            <th style={{width: '130px'}}>Onboarded</th>
                            <th style={{width: '80px', textAlign: 'center'}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && doctors.length === 0 ? (
                            <tr><td colSpan="8" style={{textAlign: 'center', padding: '5rem', color: 'var(--admin-accent)', fontFamily: 'monospace'}}>INITIALIZING PROVIDER DATA...</td></tr>
                        ) : doctors.length === 0 ? (
                            <tr><td colSpan="8" style={{textAlign: 'center', padding: '5rem', color: 'var(--admin-text-muted)'}}>NO PROVIDERS FOUND IN THIS SECTOR</td></tr>
                        ) : (
                            doctors.map((doc) => {
                                const initials = doc.full_name
                                    .split(' ')
                                    .map(n => n[0])
                                    .join('')
                                    .slice(0, 2);
                                
                                let displayStatus = doc.account_status;
                                if (!doc.is_verified) displayStatus = 'restricted';
                                if (doc.account_status === 'suspended') displayStatus = 'suspended';

                                const riskClass = doc.account_status === 'suspended' ? 'risk-danger' : (!doc.is_verified ? 'risk-warn' : 'risk-safe');
                                
                                return (
                                    <tr key={doc.id} className={`doctor-row ${selectedDoctors.includes(doc.id) ? 'selected' : ''}`}>
                                        <td>
                                            <input 
                                                type="checkbox" 
                                                className="bulk-checkbox" 
                                                checked={selectedDoctors.includes(doc.id)}
                                                onChange={() => toggleSelectDoctor(doc.id)}
                                            />
                                        </td>
                                        <td>
                                            <div className="doctor-info-cell">
                                                <span className={`risk-indicator ${riskClass}`} title={`Risk Factor: ${riskClass.replace('risk-', '')}`} />
                                                <div className="doctor-avatar">
                                                    {initials}
                                                </div>
                                                <div className="doctor-identity-nexus">
                                                    <div className="doctor-name">{doc.full_name}</div>
                                                    <div className="doctor-email">{doc.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{fontWeight: 700, color: 'var(--admin-text-main)'}}>
                                            {doc.specialization || '—'}
                                        </td>
                                        <td className="license-cell">
                                            {doc.license_number || '—'}
                                        </td>
                                        <td>
                                            {doc.is_verified ? (
                                                <span className="verif-badge verif-done">
                                                    <ShieldCheck size={12} />
                                                    Verified
                                                </span>
                                            ) : (
                                                <button className="verif-badge verif-pending" style={{border: 'none', cursor: 'pointer'}} onClick={() => handleVerify(doc.id)}>
                                                    <AlertTriangle size={12} />
                                                    Pending Review
                                                </button>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`status-pill status-${displayStatus}`}>
                                                {displayStatus}
                                            </span>
                                        </td>
                                        <td style={{color: 'var(--admin-text-muted)', fontSize: '0.75rem'}}>
                                            {doc.created_at ? new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                        </td>
                                        <td className="actions-cell">
                                            <button 
                                                className="action-trigger-btn"
                                                onClick={() => setOpenMenuId(openMenuId === doc.id ? null : doc.id)}
                                                title="Operator Actions"
                                            >
                                                <MoreVertical size={16} />
                                            </button>

                                            {openMenuId === doc.id && (
                                                <div className="action-menu-dropdown">
                                                    <button 
                                                        className="action-menu-item"
                                                        onClick={() => {
                                                            setSelectedDoctorId(doc.id);
                                                            setIsDrawerOpen(true);
                                                            setOpenMenuId(null);
                                                        }}
                                                    >
                                                        <User size={14} />
                                                        View Profile
                                                    </button>
                                                    <button 
                                                        className="action-menu-item"
                                                        onClick={() => {
                                                            window.open(`mailto:${doc.email}?subject=NeuroNest Clinical Governance - Institutional Notice`, '_self');
                                                            setOpenMenuId(null);
                                                        }}
                                                    >
                                                        <Mail size={14} />
                                                        Contact Specialist
                                                    </button>
                                                    <div className="action-menu-divider" />
                                                    {!doc.is_verified ? (
                                                        <button 
                                                            className="action-menu-item" 
                                                            onClick={() => handleVerify(doc.id)}
                                                            style={{color: 'var(--admin-accent)'}}
                                                        >
                                                            <ShieldCheck size={14} />
                                                            Apply Verification
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            className="action-menu-item"
                                                            style={{color: '#f59e0b'}}
                                                            onClick={() => handleRevoke(doc.id)}
                                                        >
                                                            <ShieldAlert size={14} />
                                                            Revoke Access
                                                        </button>
                                                    )}
                                                    
                                                    <button className="action-menu-item" onClick={() => handleStatusToggle(doc.id, doc.account_status)}>
                                                        {doc.account_status === 'active' ? (
                                                            <>
                                                                <AlertTriangle size={14} style={{color: '#ef4444'}} />
                                                                Suspend Member
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircle size={14} style={{color: '#10b981'}} />
                                                                Reactivate
                                                            </>
                                                        )}
                                                    </button>
                                                    <div className="action-menu-divider" />
                                                    <button className="action-menu-item danger" onClick={() => handleTerminate(doc.id)}>
                                                        <X size={14} />
                                                        Terminate Record
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>

                <div className="pagination">
                    <span style={{fontSize: '0.65rem', fontWeight: 900, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em'}}>
                        Viewing Profile Range {((page-1)*10)+1} – {Math.min(page*10, doctors.length)} of {doctors.length}
                    </span>
                    <div className="pagination-controls" style={{display: 'flex', gap: '4px'}}>
                        <button disabled={page === 1} onClick={() => setPage(page-1)} className="page-btn">PREVIOUS</button>
                        <button className="page-btn active">{page}</button>
                        <button className="page-btn" onClick={() => setPage(page+1)} disabled={page === totalPages}>NEXT</button>
                    </div>
                </div>
            </div>

            {/* Nexus Selection Bar - Floating Analytics & Governance */}
            {selectedDoctors.length > 0 && (
                <div className="bulk-action-bar">
                    <div className="selection-info">
                        <span className="selection-count">{selectedDoctors.length}</span>
                        <span className="selection-label">Specialists Selected</span>
                    </div>
                    <div className="bulk-btn-group">
                        <button className="bulk-btn primary" onClick={handleBulkVerify} disabled={loading}>
                            <ShieldCheck size={14} />
                            {loading ? 'Authorizing...' : 'Verify Licenses'}
                        </button>
                        <button className="bulk-btn success" onClick={handleBulkActivate} disabled={loading} style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)'}}>
                            <CheckCircle size={14} />
                            {loading ? 'Activating...' : 'Activate Selected'}
                        </button>
                        <button className="bulk-btn danger" onClick={handleBulkSuspend} disabled={loading}>
                            <AlertTriangle size={14} />
                            {loading ? 'Suspending...' : 'Suspend Selected'}
                        </button>
                        <button className="bulk-btn secondary" onClick={handleExport} disabled={loading}>
                            <Download size={14} />
                            {loading ? 'Preparing...' : 'Export CSV'}
                        </button>
                    </div>
                    <button 
                        className="refresh-btn" 
                        style={{border: 'none', background: 'none', color: 'var(--admin-text-muted)'}}
                        onClick={() => setSelectedDoctors([])}
                    >
                        Cancel
                    </button>
                </div>
            )}

            <AddDoctorModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onAdd={handleOnboard}
            />

            <DoctorDrawer 
                doctorId={selectedDoctorId} 
                isOpen={isDrawerOpen} 
                onClose={() => setIsDrawerOpen(false)} 
            />
        </div>
    );
};

export default ManageDoctors;
