import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminDashboardApi } from '../../api/adminDashboardApi';
import { 
    Users, UserPlus, Calendar, DollarSign, FileText, 
    CreditCard, Star, Radio, Activity, AlertCircle, 
    ArrowUpRight, ArrowDownRight, CheckCircle2, Clock, 
    ChevronRight, LayoutDashboard, Settings, MoreVertical,
    ShieldAlert
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const AdminDashboard = () => {
    const { isDark: darkMode } = useTheme();
    const [data, setData] = useState({
        stats: [],
        activities: [],
        tasks: [],
        chartData: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminDashboardApi.getDashboardSummary();
            setData({
                stats: response.stats || [],
                activities: response.activities || [],
                tasks: response.tasks || [],
                chartData: response.chartData || []
            });
        } catch (err) {
            console.error("Failed to load dashboard data:", err);
            setError("Failed to load dashboard data. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const getStatColor = (id) => {
        switch (id) {
            case 'patients': return 'from-blue-500 to-indigo-600';
            case 'doctors': return 'from-emerald-500 to-teal-600';
            case 'load': return 'from-amber-500 to-orange-600';
            case 'revenue': return 'from-fuchsia-500 to-purple-600';
            default: return 'from-slate-500 to-slate-600';
        }
    };

    const getStatIcon = (id) => {
        switch (id) {
            case 'patients': return <Users className="w-6 h-6" />;
            case 'doctors': return <UserPlus className="w-6 h-6" />;
            case 'load': return <Activity className="w-6 h-6" />;
            case 'revenue': return <DollarSign className="w-6 h-6" />;
            default: return <Activity className="w-6 h-6" />;
        }
    };

    const modules = [
        { title: 'Manage Patients', desc: 'Securely access and update patient health records.', icon: <Users className="w-6 h-6" />, path: '/admin/manage-patients', color: 'blue' },
        { title: 'Manage Doctors', desc: 'Manage medical staff profiles and credentials.', icon: <UserPlus className="w-6 h-6" />, path: '/admin/manage-doctors', color: 'emerald' },
        { title: 'Appointments', desc: 'Oversee scheduling across all departments.', icon: <Calendar className="w-6 h-6" />, path: '/admin/appointment-management', color: 'sky' },
        { title: 'Assessments', desc: 'Analyze clinical outcomes and test results.', icon: <FileText className="w-6 h-6" />, path: '/admin/assessment-management', color: 'amber' },
        { title: 'Payments', desc: 'Automated billing and financial reconciliation.', icon: <CreditCard className="w-6 h-6" />, path: '/admin/payment-management', color: 'rose' },
        { title: 'Reviews', desc: 'Monitor and respond to patient feedback.', icon: <Star className="w-6 h-6" />, path: '/admin/review-management', color: 'indigo' },
        { title: 'Governance', desc: 'Manage doctor escalations and risk events.', icon: <ShieldAlert className="w-6 h-6" />, path: '/admin/governance/queue', color: 'rose' },
    ];

    if (loading) return (
        <div className={`flex flex-col items-center justify-center min-h-screen ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
            <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse opacity-50"></div>
                </div>
            </div>
            <p className={`mt-6 font-bold text-xs uppercase tracking-[0.2em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Synchronizing Operations...
            </p>
        </div>
    );

    if (error) return (
        <div className="container mx-auto py-20 text-center px-4">
            <div className={`inline-block p-10 rounded-3xl shadow-2xl ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
                <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle size={40} />
                </div>
                <h4 className={`text-2xl font-black mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>System Integrity Issue</h4>
                <p className={`mb-8 max-w-md mx-auto ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{error}</p>
                <button 
                    onClick={fetchDashboardData} 
                    className="px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-bold shadow-lg shadow-rose-600/20 transition-all hover:-translate-y-1"
                >
                    Retry Connection
                </button>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen pb-20 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                             <span className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                System Core / Dashboard
                            </span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight">System Overview</h1>
                    </div>
                    
                    <button className="group relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-95">
                        <Radio size={18} className="animate-pulse" />
                        <span>Internal Broadcast</span>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border-2 border-white dark:border-slate-950 rounded-full"></div>
                    </button>
                </header>

                {/* Stats Grid - Bento Style */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {data.stats.map((stat, index) => (
                        <div key={index} className={`group relative overflow-hidden p-6 rounded-[2rem] transition-all hover:shadow-2xl ${darkMode ? 'bg-slate-900 border border-slate-800 hover:border-slate-700' : 'bg-white border border-slate-200 hover:border-blue-200'}`}>
                            <div className="relative z-10 flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl bg-gradient-to-br transition-transform group-hover:scale-110 duration-500 text-white shadow-lg ${getStatColor(stat.id)}`}>
                                    {getStatIcon(stat.id)}
                                </div>
                                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                    stat.trend?.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 
                                    stat.trend === 'Stable' ? 'bg-slate-500/10 text-slate-500' : 'bg-rose-500/10 text-rose-500'
                                }`}>
                                    {stat.trend?.startsWith('+') ? <ArrowUpRight size={12} strokeWidth={3} /> : stat.trend?.startsWith('-') ? <ArrowDownRight size={12} strokeWidth={3} /> : null}
                                    {stat.trend || 'N/A'}
                                </span>
                            </div>
                            <div className="relative z-10">
                                <h3 className={`text-[10px] font-black uppercase tracking-widest mb-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{stat.label}</h3>
                                <div className="text-4xl font-black tracking-tight">{stat.value}</div>
                            </div>
                            {/* Decorative background element */}
                            <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${getStatColor(stat.id)}`}></div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
                    
                    {/* Metrics Chart Section */}
                    <section className={`lg:col-span-8 p-8 rounded-[2.5rem] ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200 shadow-sm'}`}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                            <div>
                                <h2 className="text-xl font-black mb-1">Engagement Metrics</h2>
                                <p className={`text-xs font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>System throughput analysis for the last 7 cycles</p>
                            </div>
                            <div className="flex items-center gap-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                    <span className="text-[10px] font-bold uppercase text-slate-500">Intake</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                                    <span className="text-[10px] font-bold uppercase text-slate-500">Outflow</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative h-[300px] flex items-end justify-between gap-4 mt-12">
                            {data.chartData.map((d, i) => (
                                <div key={i} className="flex-1 group flex flex-col items-center gap-4">
                                    <div className="w-full flex justify-center items-end gap-1 h-[240px]">
                                        <div 
                                            className="w-1/3 min-w-[8px] max-w-[12px] bg-gradient-to-t from-blue-600 to-blue-400 rounded-full transition-all duration-700 group-hover:from-blue-500 group-hover:to-blue-300 relative group/bar"
                                            style={{ height: `${d.p}%` }}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20">
                                                {d.p}% Intake
                                            </div>
                                        </div>
                                        <div 
                                            className="w-1/3 min-w-[8px] max-w-[12px] bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-full transition-all duration-700 delay-75 group-hover:from-indigo-500 group-hover:to-indigo-300 relative group/bar"
                                            style={{ height: `${d.s}%` }}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20">
                                                {d.s}% Outflow
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{d.day}</span>
                                </div>
                            ))}
                            {/* Y-axis labels helper */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10 py-6 border-l border-slate-500">
                                {[100, 75, 50, 25, 0].map(val => (
                                    <div key={val} className="w-full border-t border-slate-500 relative"></div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Active Tasks Section */}
                    <section className={`lg:col-span-4 p-8 rounded-[2.5rem] ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200 shadow-sm'}`}>
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-black">Active Tasks</h2>
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                <MoreVertical size={18} className="text-slate-400" />
                            </button>
                        </div>
                        
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {data.tasks.map((task, i) => (
                                <div key={i} className={`group p-4 rounded-2xl transition-all hover:translate-x-1 border-l-4 ${
                                    task.priority === 'High' ? 'border-rose-500 bg-rose-500/5 hover:bg-rose-500/10' : 
                                    task.priority === 'Medium' ? 'border-amber-500 bg-amber-500/5 hover:bg-amber-500/10' : 
                                    'border-blue-500 bg-blue-500/5 hover:bg-blue-500/10'
                                }`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{task.title}</h4>
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                                            task.priority === 'High' ? 'bg-rose-500 text-white' : 
                                            task.priority === 'Medium' ? 'bg-amber-500 text-white' : 
                                            'bg-blue-500 text-white'
                                        }`}>
                                            {task.priority}
                                        </span>
                                    </div>
                                    <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{task.desc}</p>
                                    <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                        <Clock size={12} />
                                        <span>2 hours ago</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <button className={`w-full mt-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
                            darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}>
                            View Work Pipeline
                        </button>
                    </section>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    
                    {/* Operations Nexus Section */}
                    <section className="xl:col-span-8">
                        <header className="flex justify-between items-end mb-6">
                            <div>
                                <h2 className="text-2xl font-black">Operations Nexus</h2>
                                <p className={`text-xs font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Direct administrative management control</p>
                            </div>
                            <Link to="/admin/settings" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                <Settings size={20} className="text-slate-400" />
                            </Link>
                        </header>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {modules.map((mod, index) => (
                                <Link 
                                    key={index} 
                                    to={mod.path} 
                                    className={`group flex items-center gap-5 p-6 rounded-3xl transition-all hover:-translate-y-1 hover:shadow-xl ${
                                        darkMode ? 'bg-slate-900 border border-slate-800 hover:bg-slate-800/50' : 'bg-white border border-slate-200 hover:border-blue-200'
                                    }`}
                                >
                                    <div className={`p-4 rounded-2xl bg-${mod.color}-500/10 text-${mod.color}-500 group-hover:bg-${mod.color}-500 group-hover:text-white transition-all duration-300`}>
                                        {mod.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-slate-800 dark:text-slate-100 mb-1">{mod.title}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">{mod.desc}</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* System Logs Section */}
                    <section className="xl:col-span-4">
                        <h2 className="text-2xl font-black mb-6">System Logs</h2>
                        <div className={`p-6 rounded-[2.5rem] border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <div className="activity-list max-h-[360px] overflow-y-auto pr-3 custom-scrollbar">
                                {data.activities.map((act, index) => (
                                    <div key={index} className="relative pl-6 pb-6 last:pb-0 group">
                                        {/* Timeline Line */}
                                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-slate-100 dark:bg-slate-800 group-last:bottom-auto group-last:h-4"></div>
                                        {/* Timeline Dot */}
                                        <div className={`absolute left-[-4px] top-1.5 w-[10px] h-[10px] rounded-full border-2 border-white dark:border-slate-900 ${
                                            act.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
                                        }`}></div>
                                        
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[9px] font-black font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                                {act.time}
                                            </span>
                                            {act.type === 'error' && (
                                                <span className="flex items-center gap-1 text-[8px] font-black uppercase text-rose-500">
                                                    <AlertCircle size={8} /> Failure
                                                </span>
                                            )}
                                            {act.type === 'success' && (
                                                <span className="flex items-center gap-1 text-[8px] font-black uppercase text-emerald-500">
                                                    <CheckCircle2 size={8} /> Nominal
                                                </span>
                                            )}
                                        </div>
                                        <p className={`text-[13px] font-medium leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                            {act.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            
                            <button className={`w-full mt-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                                darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                            }`}>
                                <Clock size={14} /> Access Audit Ledger
                            </button>
                        </div>
                    </section>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 20px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
                
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
