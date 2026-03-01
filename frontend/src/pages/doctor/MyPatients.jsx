import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Filter, Loader2, ArrowUpDown, UserPlus, SlidersHorizontal, UserX } from 'lucide-react';
import { getPatients } from '../../api/doctor';
import PatientCard from './PatientCard';
import '../../styles/doctor-patients.css';

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
        <div className="opd-dashboard-root">
            {/* SUMMARY METRIC GRID */}
            <div className="summary-metric-grid">
                <div className="metric-card-pro total">
                    <div className="metric-icon-circle">
                        <Users size={20} />
                    </div>
                    <div className="metric-info">
                        <span className="count">{stats.total}</span>
                        <span className="label">Clinical Roster</span>
                    </div>
                </div>
                <div className="metric-card-pro approved">
                    <div className="metric-icon-circle">
                        <UserPlus size={20} />
                    </div>
                    <div className="metric-info">
                        <span className="count">{stats.active}</span>
                        <span className="label">Active Patients</span>
                    </div>
                </div>
                <div className="metric-card-pro pending">
                    <div className="metric-icon-circle">
                        <UserX size={20} />
                    </div>
                    <div className="metric-info">
                        <span className="count">{stats.inactive}</span>
                        <span className="label">Inactive</span>
                    </div>
                </div>
            </div>

            {/* FUNCTIONAL CONTROL BAR */}
            <div className="control-instrument-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', background: 'transparent' }}>
                <div className="flex-1 min-w-[280px] max-w-md relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text"
                        placeholder="Search roster by name or email..."
                        className="w-full h-11 pl-12 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-[13px] font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0" style={{ scrollbarWidth: 'none' }}>
                    
                    {/* Status Dropdown */}
                    <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl h-11 px-3 shadow-sm hover:border-blue-500/30 transition-colors shrink-0 cursor-pointer">
                        <Filter size={14} className="text-slate-400 mr-2" />
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-transparent border-none text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 outline-none cursor-pointer pr-2 appearance-none"
                            style={{ WebkitAppearance: 'none' }}
                        >
                            <option value="all">Every Patient</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl h-11 px-3 shadow-sm hover:border-blue-500/30 transition-colors shrink-0 cursor-pointer">
                        <ArrowUpDown size={14} className="text-slate-400 mr-2" />
                        <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-transparent border-none text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 outline-none cursor-pointer pr-2 appearance-none"
                            style={{ WebkitAppearance: 'none' }}
                        >
                            <option value="recent">Recent Visit</option>
                            <option value="upcoming">Upcoming Visit</option>
                            <option value="name">Alphabetical</option>
                        </select>
                    </div>

                    {/* Export Button */}
                    <button className="flex items-center gap-2 px-5 h-11 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0">
                        <Users size={14} />
                        Export
                    </button>
                </div>
            </div>

            {/* PATIENT LIST AREA */}
            <div className="mt-8">
                {loading ? (
                    <div className="py-32 flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compiling Patient Identities...</p>
                    </div>
                ) : filteredPatients.length === 0 ? (
                    <div className="py-32 text-center bg-white dark:bg-slate-800/50 rounded-[32px] border-2 border-dashed border-slate-100 dark:border-slate-800">
                        <Users size={64} className="mx-auto mb-6 text-slate-200 dark:text-slate-800" />
                        <h3 className="text-xl font-black text-slate-800 dark:text-slate-200 mb-2">No Clinical Bonds Found</h3>
                        <p className="text-slate-400 text-xs max-w-xs mx-auto">
                            Patients will appear here once they have approved or completed appointments with you.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
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
