import React, { useState, useEffect } from 'react';
import { Users, Calendar, Clock, FileText, Activity, TrendingUp, TrendingDown, ArrowRight, Loader } from 'lucide-react';
import { getDoctorProfile } from '../../services/doctorProfileService';
import { getDoctorStats } from '../../api/doctor';
import '../../styles/doctor.css';

const StatCard = ({ label, value, icon, trendValue }) => (
    <div className="stat-card group">
        <div className="stat-header">
            <div className="stat-icon group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            {trendValue !== undefined && (
                <div className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${trendValue >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {trendValue >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {Math.abs(trendValue)}%
                </div>
            )}
        </div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
    </div>
);

const DoctorDashboard = () => {
    const [doctorName, setDoctorName] = useState('Doctor');
    const [stats, setStats] = useState({
        total_patients: 0,
        today_appointments: 0,
        pending_requests: 0,
        active_assessments: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [profileData, statsData] = await Promise.all([
                    getDoctorProfile(),
                    getDoctorStats()
                ]);
                setDoctorName(profileData.full_name || 'Doctor');
                setStats(statsData);
            } catch (err) {
                console.error("Dashboard data fetch error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const statCards = [
        { label: "Total Patients", value: stats.total_patients, icon: <Users size={24} />, trendValue: 12 },
        { label: "Today's Schedule", value: stats.today_appointments, icon: <Calendar size={24} />, trendValue: 0 },
        { label: "Pending Requests", value: stats.pending_requests, icon: <Clock size={24} />, trendValue: -5 },
        { label: "Active Assessments", value: stats.active_assessments, icon: <FileText size={24} />, trendValue: 8 },
    ];

    if (loading) {
        return (
            <div className="doc-loader-container">
                <div className="doc-spinner"></div>
                <p className="text-slate-500">Initializing your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="doctor-dashboard relative fade-in">
            {/* Header Gradient Background */}
            <div className="header-gradient-bg"></div>

            <div className="doc-page-header relative z-10">
                <h1>Good Afternoon, {doctorName}</h1>
                <p>You have {stats.pending_requests} new requests waiting for your approval.</p>
            </div>
            
            {/* Stats Grid */}
            <div className="stats-grid">
                {statCards.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Charts Section */}
            <div className="charts-section grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Chart 1 */}
                <div className="chart-container">
                    <div className="doc-flex-between mb-6">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Patient Activity</h3>
                        <div className="doc-badge doc-badge-primary">This Week</div>
                    </div>
                    <div className="h-64 flex items-center justify-center bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                        <div className="text-center">
                            <Activity size={32} className="mx-auto text-blue-400 mb-2 opacity-50" />
                            <p className="text-sm text-slate-400">Activity Chart Visualization</p>
                        </div>
                    </div>
                </div>

                {/* Chart 2 */}
                <div className="chart-container">
                    <div className="doc-flex-between mb-6">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Revenue Overview</h3>
                         <button className="text-sm text-blue-600 hover:text-blue-700 font-bold flex items-center">
                            Full Report <ArrowRight size={14} className="ml-1" />
                         </button>
                    </div>
                    <div className="h-64 flex items-center justify-center bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                        <div className="text-center">
                            <TrendingUp size={32} className="mx-auto text-green-400 mb-2 opacity-50" />
                            <p className="text-sm text-slate-400">Revenue Chart Visualization</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
