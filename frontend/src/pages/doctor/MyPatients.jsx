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
        <div className="max-w-[1200px] mx-auto flex flex-col h-full mt-4">
            
            <div className="mb-6">
                 <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Clinical Roster</h2>
                 <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Manage and access all your patient dossiers and history</p>
            </div>

            {/* PREMIUM METRIC GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Patients */}
                <div className="bg-white dark:bg-slate-800 rounded-[24px] p-6 border border-slate-200/60 dark:border-slate-700/50 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 dark:hover:border-blue-900/50">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-150" />
                    <div className="flex items-center justify-between mb-6 relative">
                        <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 shadow-inner">
                            <Users size={24} strokeWidth={2.5} />
                        </div>
                        <span className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">{stats.total}</span>
                    </div>
                    <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest relative">Total Patients</h3>
                </div>

                {/* Active Patients */}
                <div className="bg-white dark:bg-slate-800 rounded-[24px] p-6 border border-slate-200/60 dark:border-slate-700/50 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 dark:hover:border-emerald-900/50">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-150" />
                    <div className="flex items-center justify-between mb-6 relative">
                        <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 shadow-inner">
                            <UserPlus size={24} strokeWidth={2.5} />
                        </div>
                        <span className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">{stats.active}</span>
                    </div>
                    <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest relative">Active Status</h3>
                </div>

                {/* Inactive Patients */}
                <div className="bg-white dark:bg-slate-800 rounded-[24px] p-6 border border-slate-200/60 dark:border-slate-700/50 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-amber-200 dark:hover:border-amber-900/50">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-150" />
                    <div className="flex items-center justify-between mb-6 relative">
                        <div className="w-14 h-14 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 shadow-inner">
                            <UserX size={24} strokeWidth={2.5} />
                        </div>
                        <span className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">{stats.inactive}</span>
                    </div>
                    <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest relative">Inactive / Archived</h3>
                </div>
            </div>

            {/* FUNCTIONAL CONTROL BAR */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
                <div className="w-full md:flex-1 md:max-w-md relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text"
                        placeholder="Search roster by name or email..."
                        className="w-full h-11 pl-12 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-[13px] font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="w-full md:w-auto flex flex-nowrap items-center gap-3 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    
                    {/* Status Dropdown */}
                    <div className="relative flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-11 px-3 shadow-sm hover:border-blue-500/30 transition-colors shrink-0">
                        <Filter size={14} className="text-slate-400 mr-2 pointer-events-none" />
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-transparent border-none text-[12px] font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer appearance-none pr-4"
                        >
                            <option value="all">Every Patient</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <span className="text-[10px] text-slate-400">▼</span>
                        </div>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-11 px-3 shadow-sm hover:border-blue-500/30 transition-colors shrink-0">
                        <ArrowUpDown size={14} className="text-slate-400 mr-2 pointer-events-none" />
                        <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-transparent border-none text-[12px] font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer appearance-none pr-4"
                        >
                            <option value="recent">Recent Visit</option>
                            <option value="upcoming">Upcoming Visit</option>
                            <option value="name">Alphabetical</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <span className="text-[10px] text-slate-400">▼</span>
                        </div>
                    </div>

                    {/* Export Button */}
                    <button className="flex items-center gap-2 px-5 h-11 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-[12px] font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0">
                        <Users size={14} />
                        Export
                    </button>
                </div>
            </div>

            {/* PATIENT LIST AREA */}
            <div className="mt-4">
                {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center space-y-5">
                        <div className="relative w-20 h-20 flex items-center justify-center mb-2">
                            <div className="absolute inset-0 border-[6px] border-slate-100 dark:border-slate-800 rounded-full"></div>
                            <div className="absolute inset-0 border-[6px] border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                            <Users size={24} className="text-blue-600 dark:text-blue-500 animate-pulse" />
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Compiling Patient Identities...</p>
                    </div>
                ) : filteredPatients.length === 0 ? (
                    <div className="py-28 flex flex-col items-center justify-center bg-white dark:bg-slate-800/30 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-700/50 shadow-sm">
                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800/80 rounded-full flex items-center justify-center mb-6 shadow-inner">
                             <Users size={40} className="text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-slate-200 mb-2 tracking-tight">No Clinical Bonds Found</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm text-center font-medium leading-relaxed">
                            Patients will automatically populate your roster once they complete appointments or get their requests approved.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-5 pb-12">
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
