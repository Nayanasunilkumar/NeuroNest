import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Filter, Loader2, ArrowUpDown, UserPlus, SlidersHorizontal, UserX } from 'lucide-react';
import { getPatients } from '../../api/doctor';
import PatientCard from './PatientCard';

const MyPatients = () => {
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("recent");
    const navigate = useNavigate();

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const data = await getPatients();
            setPatients(data);
            setFilteredPatients(data);
        } catch (error) {
            console.error("Failed to load clinical roster:", error);
        } finally {
            setLoading(false);
        }
    };

    // Real-time Search & Filter Logic
    useEffect(() => {
        let results = patients.filter(patient =>
            patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Apply Status Filter
        if (statusFilter !== "all") {
            results = results.filter(p => p.status?.toLowerCase() === statusFilter.toLowerCase());
        }

        // Apply Sorting
        results.sort((a, b) => {
            if (sortBy === "name") {
                return a.full_name.localeCompare(b.full_name);
            } else if (sortBy === "recent") {
                const dateA = a.last_visit ? new Date(a.last_visit).getTime() : 0;
                const dateB = b.last_visit ? new Date(b.last_visit).getTime() : 0;
                return dateB - dateA; // Descending (newest first)
            } else if (sortBy === "upcoming") {
                const dateA = a.next_appointment ? new Date(a.next_appointment).getTime() : Infinity;
                const dateB = b.next_appointment ? new Date(b.next_appointment).getTime() : Infinity;
                return dateA - dateB; // Ascending (closest first)
            }
            return 0;
        });

        setFilteredPatients(results);
    }, [searchTerm, statusFilter, sortBy, patients]);

    const stats = {
        total: patients.length,
        active: patients.filter(p => p.status === 'Active').length,
        inactive: patients.filter(p => p.status === 'Inactive').length
    };

    return (
        <div className="container-fluid py-4" style={{ maxWidth: '1200px' }}>
            
            <div className="mb-4">
                 <h2 className="fw-bolder text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>Clinical Roster</h2>
                 <p className="text-secondary small fw-medium">Manage and access all your patient dossiers and history</p>
            </div>

            {/* PREMIUM METRIC GRID */}
            <div className="row g-4 mb-4">
                {/* Total Patients */}
                <div className="col-12 col-md-4">
                    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative" style={{ transition: 'transform 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.transform='translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform='translateY(0)'}>
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="rounded-4 bg-primary bg-opacity-10 d-flex align-items-center justify-content-center text-primary" style={{ width: '56px', height: '56px' }}>
                                    <Users size={24} strokeWidth={2.5} />
                                </div>
                                <span className="display-5 fw-bolder text-dark m-0 pb-1">{stats.total}</span>
                            </div>
                            <h6 className="text-muted text-uppercase fw-bold m-0" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Total Patients</h6>
                        </div>
                    </div>
                </div>

                {/* Active Patients */}
                <div className="col-12 col-md-4">
                    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative" style={{ transition: 'transform 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.transform='translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform='translateY(0)'}>
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="rounded-4 bg-success bg-opacity-10 d-flex align-items-center justify-content-center text-success" style={{ width: '56px', height: '56px' }}>
                                    <UserPlus size={24} strokeWidth={2.5} />
                                </div>
                                <span className="display-5 fw-bolder text-dark m-0 pb-1">{stats.active}</span>
                            </div>
                            <h6 className="text-muted text-uppercase fw-bold m-0" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Active Status</h6>
                        </div>
                    </div>
                </div>

                {/* Inactive Patients */}
                <div className="col-12 col-md-4">
                    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative" style={{ transition: 'transform 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.transform='translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform='translateY(0)'}>
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="rounded-4 bg-warning bg-opacity-10 d-flex align-items-center justify-content-center text-warning" style={{ width: '56px', height: '56px' }}>
                                    <UserX size={24} strokeWidth={2.5} />
                                </div>
                                <span className="display-5 fw-bolder text-dark m-0 pb-1">{stats.inactive}</span>
                            </div>
                            <h6 className="text-muted text-uppercase fw-bold m-0" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Inactive / Archived</h6>
                        </div>
                    </div>
                </div>
            </div>

            {/* FUNCTIONAL CONTROL BAR */}
            {/* FUNCTIONAL CONTROL BAR */}
            <div className="d-flex flex-column flex-md-row gap-3 align-items-center justify-content-between mb-4">
                <div className="position-relative flex-grow-1" style={{ maxWidth: '500px', width: '100%' }}>
                    <Search className="position-absolute text-secondary" style={{ left: '16px', top: '50%', transform: 'translateY(-50%)' }} size={16} />
                    <input 
                        type="text"
                        placeholder="Search roster by name or email..."
                        className="form-control rounded-pill border-0 shadow-sm"
                        style={{ paddingLeft: '44px', height: '48px', fontSize: '0.9rem', backgroundColor: '#fff' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="d-flex align-items-center gap-2 overflow-auto" style={{ width: '100%', maxWidth: '100%', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                    
                    {/* Status Dropdown */}
                    <div className="input-group shadow-sm border-0 rounded-pill overflow-hidden" style={{ minWidth: '160px', backgroundColor: '#fff' }}>
                        <span className="input-group-text bg-white border-0 text-secondary pe-1 ps-3">
                            <Filter size={14} />
                        </span>
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="form-select border-0 bg-white shadow-none fw-bold text-secondary"
                            style={{ fontSize: '0.8rem', cursor: 'pointer', height: '48px' }}
                        >
                            <option value="all">Every Patient</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="input-group shadow-sm border-0 rounded-pill overflow-hidden" style={{ minWidth: '160px', backgroundColor: '#fff' }}>
                        <span className="input-group-text bg-white border-0 text-secondary pe-1 ps-3">
                            <ArrowUpDown size={14} />
                        </span>
                        <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="form-select border-0 bg-white shadow-none fw-bold text-secondary"
                            style={{ fontSize: '0.8rem', cursor: 'pointer', height: '48px' }}
                        >
                            <option value="recent">Recent Visit</option>
                            <option value="upcoming">Upcoming Visit</option>
                            <option value="name">Alphabetical</option>
                        </select>
                    </div>

                    {/* Export Button */}
                    <button className="btn btn-dark rounded-pill d-flex align-items-center shadow-sm fw-bold px-4" style={{ height: '48px', fontSize: '0.8rem' }}>
                        <Users size={14} className="me-2" />
                        Export
                    </button>
                </div>
            </div>

            {/* PATIENT LIST AREA */}
            <div className="mt-2">
                {loading ? (
                    <div className="d-flex flex-column align-items-center justify-content-center py-5 my-5">
                       <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                         <span className="visually-hidden">Loading...</span>
                       </div>
                       <p className="text-secondary small fw-bold text-uppercase" style={{ letterSpacing: '2px' }}>Compiling Patient Identities...</p>
                    </div>
                ) : filteredPatients.length === 0 ? (
                    <div className="text-center py-5 my-5 bg-white rounded-5 border border-dashed border-2 shadow-sm d-flex flex-column align-items-center justify-content-center p-5">
                        <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mb-4" style={{ width: '90px', height: '90px' }}>
                             <Users size={40} className="text-secondary" />
                        </div>
                        <h3 className="fw-bolder text-dark mb-2">No Clinical Bonds Found</h3>
                        <p className="text-secondary small mx-auto" style={{ maxWidth: '350px' }}>
                            Patients will automatically populate your roster once they complete appointments or get their requests approved.
                        </p>
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-3 pb-5">
                        {filteredPatients.map(patient => (
                            <PatientCard 
                                key={patient.id} 
                                patient={patient}
                                onNavigate={(id) => navigate(`/doctor/patient-records?patientId=${id}`)}
                                onMessage={(id) => navigate(`/doctor/chat?patientId=${id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyPatients;
