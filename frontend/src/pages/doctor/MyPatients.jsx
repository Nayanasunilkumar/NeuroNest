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

    // Real-time Search Logic
    useEffect(() => {
        const results = patients.filter(patient =>
            patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredPatients(results);
    }, [searchTerm, patients]);

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

            {/* CONTROL BAR (Search & Filters) */}
            <div className="control-instrument-bar">
                <div className="flex-1 max-w-md relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text"
                        placeholder="Search roster by name or email..."
                        className="w-full h-11 pl-12 pr-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-4 h-11 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-all">
                        <SlidersHorizontal size={14} />
                        Advanced Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 h-11 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all">
                        <Users size={14} />
                        Export Roster
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
