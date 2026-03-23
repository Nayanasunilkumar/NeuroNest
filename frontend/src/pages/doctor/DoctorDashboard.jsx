import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Calendar,
  ClipboardList,
  Activity,
  ArrowRight,
  AlertTriangle,
  UserRound,
  Stethoscope,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDoctorProfile } from '../../services/doctorProfileService';
import { getDoctorStats, getPatients, getSchedule } from '../../api/doctor';
import '../../styles/dashboard.css';

const StatCard = ({ label, value, hint, icon, tone = 'primary' }) => (
  <div className={`nn-metric-card nn-tone-${tone}`}>
    <div className="d-flex justify-content-between align-items-start mb-2">
      <div className="nn-stat-label">{label}</div>
      <div className="nn-stat-icon">
        {React.createElement(icon, { size: 16 })}
      </div>
    </div>
    <div>
      <div className="nn-stat-value">{value}</div>
      <div className="nn-stat-hint">{hint}</div>
    </div>
  </div>
);

const formatDate = (value, options = {}) => {
  if (!value) return 'Not available';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Not available';
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    ...options,
  });
};

const formatTime = (value) => {
  if (!value) return 'TBD';
  const [hourStr, minuteStr = '00'] = String(value).split(':');
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return value;
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const getInitials = (name = 'Doctor') =>
  String(name)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'DR';

const getPatientStatus = (patient) => {
  const raw = String(patient?.status || '').toLowerCase();
  if (raw.includes('critical') || raw.includes('high')) return 'Critical';
  if (raw.includes('inactive') || raw.includes('follow')) return 'Follow-up';
  return 'Stable';
};

const getAlertSeverity = (alert) => {
  const severity = String(alert?.severity || '').toLowerCase();
  if (severity === 'critical') return 'critical';
  if (severity === 'warning') return 'follow-up';
  return 'stable';
};

const PreviewEmpty = ({ title }) => (
  <div className="nn-preview-empty">
    <strong>{title}</strong>
    <span>Nothing to review right now.</span>
  </div>
);

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [stats, setStats] = useState({
    total_patients: 0,
    today_appointments: 0,
    pending_requests: 0,
    active_assessments: 0,
  });
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const today = new Date().toISOString().split('T')[0];
      try {
        setLoading(true);
        const results = await Promise.allSettled([
          getDoctorProfile(),
          getDoctorStats(),
          getPatients(),
          getSchedule(today, 'all'),
        ]);

        const [profileResult, statsResult, patientsResult, appointmentsResult] = results;

        if (profileResult.status === 'fulfilled') {
          setDoctorProfile(profileResult.value || null);
        }
        if (statsResult.status === 'fulfilled') {
          setStats(statsResult.value || {});
        }
        if (patientsResult.status === 'fulfilled') {
          setPatients(Array.isArray(patientsResult.value) ? patientsResult.value : []);
        }
        if (appointmentsResult.status === 'fulfilled') {
          setAppointments(Array.isArray(appointmentsResult.value) ? appointmentsResult.value : []);
        }
      } catch (err) {
        console.error('Dashboard data fetch error', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const doctorName = doctorProfile?.full_name || 'Doctor';

  const patientPreview = useMemo(() => {
    return [...patients]
      .sort((a, b) => {
        const dateA = a.last_visit ? new Date(a.last_visit).getTime() : 0;
        const dateB = b.last_visit ? new Date(b.last_visit).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 6);
  }, [patients]);

  const appointmentPreview = useMemo(() => {
    return [...appointments]
      .filter((item) => {
        const status = String(item.status || '').toLowerCase();
        return status !== 'cancelled' && status !== 'completed' && status !== 'no-show';
      })
      .sort((a, b) => {
        const timeA = `${a.appointment_date || ''} ${a.appointment_time || ''}`.trim();
        const timeB = `${b.appointment_date || ''} ${b.appointment_time || ''}`.trim();
        return new Date(timeA).getTime() - new Date(timeB).getTime();
      })
      .slice(0, 5);
  }, [appointments]);

  if (loading) {
    return (
      <div className="nn-dashboard-wrap d-flex align-items-center justify-content-center">
        <div className="spinner-grow text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="nn-dashboard-wrap">
      <section className="nn-dashboard-head">
        <div>
          <h2 className="nn-title">Welcome back, Dr. {doctorName.split(' ').slice(-1)[0]}</h2>
          <p className="nn-subtitle">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}{' '}
            · Clinical operations snapshot
          </p>
        </div>
        <div className="nn-head-chip">
          <Activity size={14} />
          <span>System Active</span>
        </div>
      </section>

      <section className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            label="Total Patients"
            value={stats.total_patients}
            hint="Under your care"
            icon={Users}
            tone="primary"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            label="Today's Appointments"
            value={stats.today_appointments}
            hint="Planned sessions"
            icon={Calendar}
            tone="info"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            label="Pending Requests"
            value={stats.pending_requests}
            hint="Awaiting approval"
            icon={AlertTriangle}
            tone="warning"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            label="Active Assessments"
            value={stats.active_assessments}
            hint="Open clinical reviews"
            icon={ClipboardList}
            tone="success"
          />
        </div>
      </section>

      <section className="row g-4">
        <div className="col-12">
          <div className="nn-panel nn-overview-card">
            <div className="nn-overview-avatar">
              <UserRound size={24} />
              <span>{getInitials(doctorName)}</span>
            </div>
            <div className="nn-overview-copy">
              <p className="nn-panel-kicker">Doctor Overview</p>
              <h3>{doctorName}</h3>
              <div className="nn-overview-meta">
                <span>{doctorProfile?.specialization || 'Clinical Specialist'}</span>
              </div>
            </div>
            <div className="nn-overview-badge">
              <Stethoscope size={16} />
              <span>Clinician Dashboard</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-6">
          <div className="nn-panel">
            <div className="nn-panel-head">
              <div>
                <p className="nn-panel-kicker">Patients Overview</p>
                <h3>Recent patient snapshot</h3>
              </div>
              <button className="nn-inline-link" onClick={() => navigate('/doctor/patients')}>
                View All Patients <ArrowRight size={14} />
              </button>
            </div>
            <div className="nn-preview-list">
              {patientPreview.length === 0 ? (
                <PreviewEmpty title="No patients found" />
              ) : (
                patientPreview.map((patient) => {
                  const status = getPatientStatus(patient);
                  return (
                    <article key={patient.id} className="nn-preview-item">
                      <div className="nn-preview-main">
                        <strong>{patient.full_name}</strong>
                        <span>Last visit: {formatDate(patient.last_visit)}</span>
                      </div>
                      <span className={`nn-status-chip nn-status-${status.toLowerCase().replace(/[^a-z]/g, '-')}`}>
                        {status}
                      </span>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-6">
          <div className="nn-panel">
            <div className="nn-panel-head">
              <div>
                <p className="nn-panel-kicker">Upcoming Appointments</p>
                <h3>Next few sessions</h3>
              </div>
              <button className="nn-inline-link" onClick={() => navigate('/doctor/schedule')}>
                View All Appointments <ArrowRight size={14} />
              </button>
            </div>
            <div className="nn-preview-list">
              {appointmentPreview.length === 0 ? (
                <PreviewEmpty title="No upcoming appointments" />
              ) : (
                appointmentPreview.map((appointment) => (
                  <article key={appointment.id} className="nn-preview-item">
                    <div className="nn-preview-main">
                      <strong>{appointment.patient_name || 'Patient'}</strong>
                      <span>
                        {formatTime(appointment.appointment_time)} · {(appointment.consultation_type || 'in_person').replace('_', ' ')}
                      </span>
                    </div>
                    <span className="nn-preview-date">{formatDate(appointment.appointment_date)}</span>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>

      </section>
    </div>
  );
};

export default DoctorDashboard;
