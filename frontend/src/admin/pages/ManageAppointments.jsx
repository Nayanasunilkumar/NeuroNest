import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import AppointmentSummaryCards from '../../admin/components/appointments/AppointmentSummaryCards';
import AppointmentFilters from '../../admin/components/appointments/AppointmentFilters';
import AppointmentTable from '../../admin/components/appointments/AppointmentTable';
import AppointmentDetailDrawer from '../../admin/components/appointments/AppointmentDetailDrawer';
import { 
    fetchAdminAppointments, 
    updateAppointmentStatus,
    fetchSectors,
    fetchDepartments,
    fetchDoctorsBySpecialty
} from '../../admin/services/adminAppointmentAPI';
import '../../admin/styles/admin-appointments.css';

const ManageAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState(null);
    const [loadingData, setLoadingData] = useState(false);
    
    // Paging
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // Hierarchical Filters (Persistent across refresh)
    const [sectors, setSectors] = useState([]);
    const [selectedSector, setSelectedSector] = useState(localStorage.getItem('admin_appt_sector') || '');
    
    const [departments, setDepartments] = useState([]);
    const [selectedDept, setSelectedDept] = useState(localStorage.getItem('admin_appt_dept') || '');
    
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(localStorage.getItem('admin_appt_doctor') || '');
    
    const [statusFilter, setStatusFilter] = useState(localStorage.getItem('admin_appt_status') || 'all');
    const [search, setSearch] = useState(localStorage.getItem('admin_appt_search') || '');

    // Detail Drawer
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Initial Load: Sectors
    useEffect(() => {
        const init = async () => {
            try {
                const s = await fetchSectors();
                setSectors(s);
            } catch (err) { console.error("Identity Axis Failure:", err); }
        };
        init();
    }, []);

    // Effect: Sector Change -> Load Departments
    useEffect(() => {
        if (!selectedSector) {
            setDepartments([]);
            // Only clear if not already empty (prevents double reset)
            if (selectedDept) setSelectedDept('');
            return;
        }
        const loadDepts = async () => {
            try {
                const d = await fetchDepartments(selectedSector);
                setDepartments(d);
                
                // CRITICAL: If the currently selectedDept is NOT in the new department list, then clear it.
                // But if it is (e.g. from localStorage), keep it.
                if (selectedDept && !d.includes(selectedDept)) {
                    setSelectedDept('');
                    setDoctors([]);
                    setSelectedDoctor('');
                }
            } catch (err) { console.error("Specialty Axis Failure:", err); }
        };
        loadDepts();
    }, [selectedSector]);

    // Effect: Dept Change -> Load Doctors
    useEffect(() => {
        if (!selectedDept || !selectedSector) {
            setDoctors([]);
            if (selectedDoctor) setSelectedDoctor('');
            return;
        }
        const loadDocs = async () => {
            try {
                const docList = await fetchDoctorsBySpecialty(selectedSector, selectedDept);
                setDoctors(docList);
                
                // CRITICAL: Keep selectedDoctor if it exists in the new list
                if (selectedDoctor && !docList.find(d => String(d.id) === String(selectedDoctor))) {
                    setSelectedDoctor('');
                }
            } catch (err) { console.error("Specialist Axis Failure:", err); }
        };
        loadDocs();
    }, [selectedDept, selectedSector]);

    useEffect(() => {
        setPage(1);
    }, [selectedSector, selectedDept, selectedDoctor, statusFilter, search]);

    // Sync Filters to localStorage
    useEffect(() => {
        localStorage.setItem('admin_appt_sector', selectedSector);
        localStorage.setItem('admin_appt_dept', selectedDept);
        localStorage.setItem('admin_appt_doctor', selectedDoctor);
        localStorage.setItem('admin_appt_status', statusFilter);
        localStorage.setItem('admin_appt_search', search);
    }, [selectedSector, selectedDept, selectedDoctor, statusFilter, search]);

    // Effect: Load Main Data (Appointments + Stats)
    useEffect(() => {
        if (!selectedSector || !selectedDept) {
            setAppointments([]);
            setStats(null);
            setTotalPages(1);
            setPage(1);
            return;
        }
        
        const loadMainData = async () => {
            setLoadingData(true);
            try {
                const data = await fetchAdminAppointments({
                    page,
                    sector: selectedSector,
                    department: selectedDept,
                    doctor_id: selectedDoctor || undefined,
                    status: statusFilter,
                    search,
                    limit: 15
                });
                setAppointments(data.appointments);
                setStats(data.stats);
                setTotalPages(data.pages);
            } catch (err) {
                console.error("Clinical Stream Failure:", err);
            } finally {
                setLoadingData(false);
            }
        };
        loadMainData();
    }, [selectedDoctor, page, statusFilter, search, selectedSector, selectedDept]);

    const handleUpdateStatus = async (id, newStatus, notes) => {
        try {
            await updateAppointmentStatus(id, newStatus, notes);
            // Refresh current view
            const data = await fetchAdminAppointments({
                page, sector: selectedSector, department: selectedDept, doctor_id: selectedDoctor || undefined,
                status: statusFilter, search, limit: 15
            });
            setAppointments(data.appointments);
            setStats(data.stats);
            setIsDrawerOpen(false);
        } catch {
            alert("Governance Error: Transition Denied.");
        }
    };

    const isFilterIncomplete = !selectedSector || !selectedDept;

    return (
        <div className="admin-layout">
            <main className="admin-main">
                <div className="appointments-page">
                    <header className="appt-header">
                        <div className="appt-title-nexus">
                            <h1>Institutional Appointments</h1>
                            <p>Global Monitoring & Clinical Exception Handling</p>
                        </div>

                        {stats && <AppointmentSummaryCards stats={stats} />}
                    </header>

                    <AppointmentFilters 
                        sectors={sectors}
                        selectedSector={selectedSector}
                        setSelectedSector={setSelectedSector}
                        departments={departments}
                        selectedDept={selectedDept}
                        setSelectedDept={setSelectedDept}
                        doctors={doctors}
                        selectedDoctor={selectedDoctor}
                        setSelectedDoctor={setSelectedDoctor}
                        status={statusFilter}
                        setStatus={setStatusFilter}
                        search={search}
                        setSearch={setSearch}
                    />

                    <section className="appt-data-nexus">
                        {!isFilterIncomplete && (
                            <div className="appt-breadcrumb-nexus" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.7rem', fontWeight: 850, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                <span style={{ color: 'var(--admin-accent)' }}>{selectedSector}</span>
                                <span style={{ opacity: 0.3 }}>/</span>
                                <span>{selectedDept}</span>
                                <span style={{ opacity: 0.3 }}>/</span>
                                <span style={{ color: 'var(--admin-text-main)', fontFamily: 'JetBrains Mono, monospace' }}>
                                    {selectedDoctor
                                        ? (doctors.find(d => d.id == selectedDoctor)?.full_name || 'Specialist')
                                        : 'All Specialists'}
                                </span>
                            </div>
                        )}
                        
                        {isFilterIncomplete ? (
                            <div className="table-placeholder-nexus">
                                <div className="placeholder-icon">
                                    <Info size={32} />
                                </div>
                                <div className="placeholder-text">
                                    <h3>Awaiting Structural Selection</h3>
                                    <p>Select Sector and Specialty to initialize the clinical stream. Specialist is optional.</p>
                                </div>
                            </div>
                        ) : loadingData ? (
                            <div style={{ padding: '8rem', textAlign: 'center', fontWeight: 900, color: 'var(--admin-accent)', letterSpacing: '0.2em' }}>
                                INITIALIZING CLINICAL STREAM...
                            </div>
                        ) : (
                            <>
                                <AppointmentTable 
                                    appointments={appointments} 
                                    onSelect={(appt) => { setSelectedAppointment(appt); setIsDrawerOpen(true); }} 
                                />

                                <div className="nexus-pagination">
                                    <div className="page-info">
                                        Scale: {appointments.length} Records | Page {page} of {totalPages}
                                    </div>
                                    <div className="page-controls">
                                        <button className="pg-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                                        <button className="pg-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
                                    </div>
                                </div>
                            </>
                        )}
                    </section>
                </div>

                <AppointmentDetailDrawer 
                    appointment={selectedAppointment}
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    onUpdateStatus={handleUpdateStatus}
                />
            </main>
        </div>
    );
};

export default ManageAppointments;
