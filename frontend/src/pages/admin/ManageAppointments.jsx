import React, { useState, useEffect } from 'react';
import { Search, Info } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import AppointmentSummaryCards from '../../components/admin/appointments/AppointmentSummaryCards';
import AppointmentFilters from '../../components/admin/appointments/AppointmentFilters';
import AppointmentTable from '../../components/admin/appointments/AppointmentTable';
import AppointmentDetailDrawer from '../../components/admin/appointments/AppointmentDetailDrawer';
import { 
    fetchAdminAppointments, 
    updateAppointmentStatus,
    fetchSectors,
    fetchDepartments,
    fetchDoctorsBySpecialty
} from '../../services/adminAppointmentAPI';
import '../../styles/admin-appointments.css';

const ManageAppointments = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState(null);
    const [loadingData, setLoadingData] = useState(false);
    
    // Paging
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // Hierarchical Filters
    const [sectors, setSectors] = useState([]);
    const [selectedSector, setSelectedSector] = useState('');
    
    const [departments, setDepartments] = useState([]);
    const [selectedDept, setSelectedDept] = useState('');
    
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');

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
            setSelectedDept('');
            return;
        }
        const loadDepts = async () => {
            try {
                const d = await fetchDepartments(selectedSector);
                setDepartments(d);
                setSelectedDept('');
                setDoctors([]);
                setSelectedDoctor('');
            } catch (err) { console.error("Specialty Axis Failure:", err); }
        };
        loadDepts();
    }, [selectedSector]);

    // Effect: Dept Change -> Load Doctors
    useEffect(() => {
        if (!selectedDept) {
            setDoctors([]);
            setSelectedDoctor('');
            return;
        }
        const loadDocs = async () => {
            try {
                const docList = await fetchDoctorsBySpecialty(selectedSector, selectedDept);
                setDoctors(docList);
                setSelectedDoctor('');
            } catch (err) { console.error("Specialist Axis Failure:", err); }
        };
        loadDocs();
    }, [selectedDept, selectedSector]);

    // Effect: Load Main Data (Appointments + Stats)
    useEffect(() => {
        if (!selectedSector || !selectedDept || !selectedDoctor) {
            setAppointments([]);
            setStats(null);
            return;
        }
        
        const loadMainData = async () => {
            setLoadingData(true);
            try {
                const data = await fetchAdminAppointments({
                    page,
                    sector: selectedSector,
                    department: selectedDept,
                    doctor_id: selectedDoctor,
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
                page, sector: selectedSector, department: selectedDept, doctor_id: selectedDoctor,
                status: statusFilter, search, limit: 15
            });
            setAppointments(data.appointments);
            setStats(data.stats);
        } catch (err) {
            alert("Governance Error: Transition Denied.");
        }
    };

    const isFilterIncomplete = !selectedSector || !selectedDept || !selectedDoctor;

    return (
        <div className="admin-layout dark">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} role="admin" title="NeuroNest Admin" />
            
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
                                    {doctors.find(d => d.id == selectedDoctor)?.full_name || 'Specialist'}
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
                                    <p>Select Sector, Specialty, and Specialist to initialize clinical stream.</p>
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
