import React, { useState, useEffect } from 'react';
import { Users, Calendar, Clock, FileText, Activity, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { getDoctorProfile } from '../../services/doctorProfileService';
import { getDoctorStats } from '../../api/doctor';

const StatCard = ({ label, value, icon, trendValue }) => {
    const isPositive = trendValue >= 0;
    return (
        <div className="card border-0 shadow-sm rounded-4 h-100 bg-white transition-all hover-shadow-lg" style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}>
            <div className="card-body p-4 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="rounded-3 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary" style={{ width: '48px', height: '48px' }}>
                        {icon}
                    </div>
                    {trendValue !== undefined && (
                        <span className={`badge rounded-pill d-flex align-items-center gap-1 px-2 py-1 ${isPositive ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`} style={{ fontSize: '0.75rem' }}>
                            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {Math.abs(trendValue)}%
                        </span>
                    )}
                </div>
                <div className="mt-auto">
                    <h3 className="fw-bolder text-dark mb-1" style={{ fontSize: '1.8rem', letterSpacing: '-0.03em' }}>{value}</h3>
                    <p className="text-muted fw-medium mb-0 small text-uppercase tracking-wider">{label}</p>
                </div>
            </div>
        </div>
    );
};

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
            <div className="d-flex flex-column align-items-center justify-content-center min-vh-100">
                <div className="spinner-border text-primary border-3" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted fw-medium">Initializing your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            {/* Header Content */}
            <div className="mb-5 position-relative z-1">
                <h1 className="fw-bolder text-dark mb-2" style={{ fontSize: 'clamp(1.85rem, 2.5vw, 2.6rem)', letterSpacing: '-0.03em' }}>Good Afternoon, {doctorName}</h1>
                <p className="text-secondary fw-medium fs-6">You have {stats.pending_requests} new requests waiting for your approval.</p>
            </div>
            
            {/* Stats Grid */}
            <div className="row g-4 mb-5">
                {statCards.map((stat, index) => (
                    <div key={index} className="col-12 col-sm-6 col-xl-3">
                        <StatCard {...stat} />
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="row g-4">
                {/* Chart 1 */}
                <div className="col-12 col-lg-6">
                    <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3 className="h5 fw-bold text-dark mb-0">Patient Activity</h3>
                                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2 fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>This Week</span>
                            </div>
                            <div className="d-flex align-items-center justify-content-center bg-light rounded-4 border border-dashed" style={{ height: '260px' }}>
                                <div className="text-center opacity-50">
                                    <Activity size={32} className="text-primary mb-2 mx-auto" />
                                    <p className="text-muted small fw-medium mb-0">Activity Chart Visualization</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chart 2 */}
                <div className="col-12 col-lg-6">
                    <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3 className="h5 fw-bold text-dark mb-0">Revenue Overview</h3>
                                 <button className="btn btn-link text-decoration-none text-primary fw-bold p-0 d-flex align-items-center gap-1" style={{ fontSize: '0.875rem' }}>
                                    Full Report <ArrowRight size={16} />
                                 </button>
                            </div>
                            <div className="d-flex align-items-center justify-content-center bg-light rounded-4 border border-dashed" style={{ height: '260px' }}>
                                <div className="text-center opacity-50">
                                    <TrendingUp size={32} className="text-success mb-2 mx-auto" />
                                    <p className="text-muted small fw-medium mb-0">Revenue Chart Visualization</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
