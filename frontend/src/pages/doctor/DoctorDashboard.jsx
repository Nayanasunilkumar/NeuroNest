import React, { useState, useEffect } from 'react';
import { 
    Users, Calendar, Clock, FileText, Activity, 
    TrendingUp, TrendingDown, ArrowRight, Home, 
    Briefcase, Pill, Settings, Search, Bell, 
    MessageCircle, MoreHorizontal, ChevronRight,
    Zap, Brain, Heart, Eye
} from 'lucide-react';
import { 
    ResponsiveContainer, PieChart, Pie, Cell, 
    AreaChart, Area, XAxis, YAxis, Tooltip 
} from 'recharts';
import { getDoctorProfile } from '../../services/doctorProfileService';
import { getDoctorStats } from '../../api/doctor';
import '../../styles/dashboard.css';

const ACTIVITY_DATA = [
    { name: 'Mon', active: 40 },
    { name: 'Tue', active: 30 },
    { name: 'Wed', active: 45 },
    { name: 'Thu', active: 50 },
    { name: 'Fri', active: 35 },
    { name: 'Sat', active: 20 },
    { name: 'Sun', active: 15 },
];

const GENERAL_OVERVIEW_DATA = [
    { name: 'Ambulation', value: 23, color: '#f97316' },
    { name: 'Doctor Visit', value: 36, color: '#e2e8f0' },
    { name: 'Hospital', value: 41, color: '#3b82f6' },
];

const PremiumStatCard = ({ label, value, subLabel, icon, colorClass, avatars = [] }) => (
    <div className={`card-premium p-4 h-100 ${colorClass}`}>
        <div className="d-flex justify-content-between align-items-start mb-3">
            <div className="small fw-bold text-uppercase opacity-75" style={{ letterSpacing: '1px', fontSize: '0.7rem' }}>{label}</div>
            <MoreHorizontal size={18} className="opacity-50" />
        </div>
        <div className="d-flex align-items-end justify-content-between">
            <div>
                <h2 className="fw-black mb-1" style={{ fontSize: '2.4rem' }}>{value}</h2>
                <div className="small fw-bold opacity-75">{subLabel}</div>
            </div>
            {avatars.length > 0 && (
                <div className="avatar-stack">
                    {avatars.map((a, i) => (
                        <img key={i} src={a} className="avatar-stack-item" alt="avatar" />
                    ))}
                </div>
            )}
            {icon && !avatars.length && (
                <div className="bg-white bg-opacity-50 p-3 rounded-circle d-flex align-items-center justify-content-center">
                    {icon}
                </div>
            )}
        </div>
    </div>
);

const TimetableItem = ({ time, name, status, active }) => (
    <div className="timetable-appointment-card d-flex align-items-center gap-3 mb-2">
        <div className="small fw-bold text-muted" style={{ width: '40px' }}>{time}</div>
        <div className="d-flex align-items-center gap-2 flex-grow-1">
            <div className={`rounded-circle bg-secondary bg-opacity-10`} style={{ width: '32px', height: '32px' }}></div>
            <div>
                <div className="small fw-bold text-dark">{name}</div>
                <div className="opacity-50" style={{ fontSize: '0.65rem' }}>{status}</div>
            </div>
        </div>
        <div className="bg-white p-2 rounded-circle shadow-sm">
            <MessageCircle size={14} className="text-secondary" />
        </div>
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

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center min-vh-100 premium-dashboard-bg">
                <div className="spinner-grow text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="premium-dashboard-bg py-4 px-4 px-lg-5">
            {/* Ultra Premium Header */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-4 mb-5 pt-2">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary p-2 rounded-4 shadow-sm">
                        <Activity size={24} className="text-white" />
                    </div>
                    <div>
                        <h4 className="fw-black mb-0" style={{ letterSpacing: '-0.5px' }}>NeuroNest Hub</h4>
                        <div className="small fw-bold text-muted opacity-75">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                    </div>
                </div>

                <div className="d-none d-xl-flex align-items-center gap-2 bg-white p-2 rounded-pill shadow-sm">
                    <button className="action-pill-nav active"><Home size={16} /> Home</button>
                    <button className="action-pill-nav"><Briefcase size={16} /> Patients</button>
                    <button className="action-pill-nav"><Pill size={16} /> Labs</button>
                    <button className="action-pill-nav"><Settings size={16} /> Config</button>
                </div>

                <div className="d-flex align-items-center gap-3">
                    <div className="position-relative bg-white p-2 rounded-circle shadow-sm cursor-pointer hover-scale">
                        <Search size={20} className="text-secondary" />
                    </div>
                    <div className="position-relative bg-white p-2 rounded-circle shadow-sm cursor-pointer hover-scale">
                        <Bell size={20} className="text-secondary" />
                        <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
                    </div>
                    <div className="d-flex align-items-center gap-2 bg-white p-1 pe-3 rounded-pill shadow-sm">
                        <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center fw-bold text-primary" style={{ width: '34px', height: '34px' }}>
                            {doctorName.charAt(0)}
                        </div>
                        <span className="small fw-bold text-dark">{doctorName}</span>
                    </div>
                </div>
            </div>

            {/* Main Premium Grid */}
            <div className="row g-4 mb-4">
                {/* Top Left: Patients Stat */}
                <div className="col-12 col-md-6 col-xl-3">
                    <PremiumStatCard 
                        label="Number of patients"
                        value={stats.total_patients || "130"}
                        subLabel={`• ${stats.pending_requests} waiting approval`}
                        avatars={[
                            "https://i.pravatar.cc/150?u=1",
                            "https://i.pravatar.cc/150?u=2",
                            "https://i.pravatar.cc/150?u=3"
                        ]}
                        colorClass="stat-pill-green"
                    />
                </div>

                {/* Top Icons Strip */}
                <div className="col-12 col-md-6 col-xl-6">
                    <div className="card-premium h-100 p-4 bg-white">
                        <div className="d-flex align-items-center justify-content-around h-100">
                             {[
                                { icon: <Brain size={28} className="text-primary" />, label: 'Neuro' },
                                { icon: <Heart size={28} className="text-danger" />, label: 'Vitals' },
                                { icon: <Eye size={28} className="text-success" />, label: 'Ocular' },
                                { icon: <Activity size={28} className="text-warning" />, label: 'Pulse' },
                                { icon: <Zap size={28} className="text-purple" />, label: 'Trauma' }
                             ].map((item, i) => (
                                <div key={i} className="text-center cursor-pointer hover-scale">
                                    <div className="bg-light p-3 rounded-circle mb-2 transition-all hover-shadow-sm border">
                                        {item.icon}
                                    </div>
                                    <div className="small fw-black text-uppercase opacity-50" style={{ fontSize: '0.6rem' }}>{item.label}</div>
                                </div>
                             ))}
                        </div>
                    </div>
                </div>

                {/* Top Right: Folders Stat */}
                <div className="col-12 col-md-6 col-xl-3">
                    <PremiumStatCard 
                        label="Clinical Archives"
                        value={stats.active_assessments || "48"}
                        subLabel="Recently Updated"
                        icon={<Briefcase size={24} className="text-primary" />}
                        colorClass="stat-pill-blue"
                    />
                </div>
            </div>

            <div className="row g-4">
                {/* Mid Left: Timetable */}
                <div className="col-12 col-xl-3">
                    <div className="card-premium p-4 h-100">
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <h5 className="fw-black mb-0">Your Timetable</h5>
                            <Settings size={18} className="text-muted" />
                        </div>
                        
                        <div className="d-flex justify-content-between gap-1 mb-4">
                            {[
                                { day: 'Sun', date: 20 },
                                { day: 'Mon', date: 21, active: true },
                                { day: 'Tue', date: 22 },
                                { day: 'Wed', date: 23 },
                                { day: 'Thu', date: 24 }
                            ].map((d, i) => (
                                <div key={i} className={`timetable-date-btn ${d.active ? 'active' : ''}`}>
                                    <div className="small fw-bold opacity-50 mb-1" style={{ fontSize: '0.65rem' }}>{d.day}</div>
                                    <div className="fw-black fs-5">{d.date}</div>
                                </div>
                            ))}
                        </div>

                        <div className="timetable-list">
                            <TimetableItem time="2 p.m." name="Teresa Willer" status="Neuropathy Checkup" />
                            <TimetableItem time="4 p.m." name="Ivan Wiler" status="Status: Stable" />
                            <TimetableItem time="6 p.m." name="Anna Wiler" status="Reports Pending" />
                            <TimetableItem time="8 p.m." name="Jacob Wiler" status="Follow-up" />
                        </div>

                        <button className="btn w-100 mt-3 rounded-4 bg-light fw-bold text-secondary border-0 py-3 transition-all hover-bg-primary hover-text-white">
                            View Full Schedule
                        </button>
                    </div>
                </div>

                {/* Mid Center: Anatomical Centerpiece */}
                <div className="col-12 col-xl-6">
                    <div className="card-premium p-0 h-100 brain-centerpiece-container overflow-hidden">
                        <img 
                            src="/assets/brain-model.png" 
                            className="w-100 h-100 object-fit-cover animate-float" 
                            alt="Brain Model" 
                        />
                        
                        {/* Floating Labels */}
                        <div className="brain-label" style={{ top: '20%', left: '15%' }}>FRONTAL LOBE</div>
                        <div className="brain-label" style={{ bottom: '35%', left: '25%' }}>TEMPORAL LOBE</div>
                        <div className="brain-label" style={{ bottom: '25%', right: '15%' }}>CEREBELLUM</div>
                        <div className="brain-label" style={{ top: '35%', right: '20%' }}>OCCIPITAL LOBE</div>

                        <div className="position-absolute bottom-0 start-0 w-100 p-4 bg-gradient-to-t from-white to-transparent pt-5">
                            <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="p-3 bg-white rounded-4 shadow-sm">
                                        <Brain size={24} className="text-primary" />
                                    </div>
                                    <div>
                                        <div className="fw-black text-dark">Active Treatment Plan</div>
                                        <div className="small fw-bold text-muted">6 Files • 230mb • Revised Today</div>
                                    </div>
                                </div>
                                <button className="btn btn-dark rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2">
                                    Expand <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mid Right: Health Overview */}
                <div className="col-12 col-xl-3">
                    <div className="d-flex flex-column gap-4 h-100">
                        {/* Summary Widget */}
                        <div className="card-premium p-4 flex-grow-1" style={{ background: '#eef3ff' }}>
                            <div className="d-flex align-items-center justify-content-between mb-4">
                                <div className="bg-white p-2 rounded-circle shadow-sm"><Zap size={20} className="text-primary" /></div>
                                <div className="badge bg-white text-dark rounded-pill border shadow-sm">Analysis</div>
                            </div>
                            <div className="mb-4">
                                <div className="small fw-bold text-primary text-uppercase mb-2" style={{ letterSpacing: '1px' }}>Active Case</div>
                                <h3 className="fw-black mb-1">Cerebral Pulse</h3>
                                <div className="small fw-medium opacity-75">Range: 82% of total lymphocytes</div>
                            </div>
                            <div className="bg-white p-4 rounded-4 shadow-sm mb-2">
                                <div className="d-flex justify-content-between mb-3">
                                    <span className="fw-bold">Vulnerability</span>
                                    <span className="fw-black text-primary">82%</span>
                                </div>
                                <div className="health-metric-progress">
                                    <div className="bg-primary h-100" style={{ width: '82%' }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Pie Chart Widget */}
                        <div className="card-premium p-4">
                            <h6 className="fw-black mb-4">General Overview</h6>
                            <div style={{ height: '180px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={GENERAL_OVERVIEW_DATA}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {GENERAL_OVERVIEW_DATA.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-2 row g-2">
                                {GENERAL_OVERVIEW_DATA.map((item, i) => (
                                    <div key={i} className="col-6">
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="rounded-circle" style={{ width: '8px', height: '8px', background: item.color }}></div>
                                            <span className="fw-bold" style={{ fontSize: '0.65rem' }}>{item.name} {item.value}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Large Chart */}
            <div className="row mt-4 g-4">
                <div className="col-12">
                    <div className="card-premium p-4">
                        <div className="d-flex align-items-center justify-content-between mb-4 px-2">
                            <div>
                                <h5 className="fw-black mb-1">Patient Dynamic Activity</h5>
                                <p className="small text-muted mb-0">Analysis across all registered medical departments</p>
                            </div>
                            <div className="d-flex gap-2">
                                <button className="btn btn-sm btn-light rounded-pill px-3 fw-bold">MTD</button>
                                <button className="btn btn-sm btn-dark rounded-pill px-3 fw-bold">YTD</button>
                            </div>
                        </div>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={ACTIVITY_DATA}>
                                    <defs>
                                        <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} dy={10} />
                                    <YAxis hide={true} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="active" 
                                        stroke="#3b82f6" 
                                        strokeWidth={4} 
                                        fillOpacity={1} 
                                        fill="url(#colorActive)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .fw-black { font-weight: 950; }
                .hover-scale { transition: transform 0.3s; }
                .hover-scale:hover { transform: scale(1.1); }
                .bg-gradient-to-t {
                    background: linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%);
                }
            `}</style>
        </div>
    );
};

export default DoctorDashboard;
