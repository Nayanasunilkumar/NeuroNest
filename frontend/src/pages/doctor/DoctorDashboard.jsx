import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Calendar,
  ClipboardList,
  Activity,
  ArrowRight,
  AlertTriangle,
  Stethoscope,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDoctorProfile } from '../../services/doctorProfileService';
import { getDoctorStats, getPatients, getSchedule, joinDoctorAppointmentCall } from '../../api/doctor';
import { formatClockTimeIST, formatDateFromISTDate, formatTimeIST, getISTDayKey, parseISTDateTime, formatDateIST } from '../../../utils/time';
import '../../styles/dashboard.css';

const StatCard = ({ label, value, hint, icon, tone = 'primary' }) => (
  <div className={`nn-metric-card nn-tone-${tone} nn-metric-card-accent`}>
    <div className="nn-metric-accent" aria-hidden="true" />
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
  return formatDateFromISTDate(value, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    ...options,
  }) || 'Not available';
};

const formatTime = (value) => {
  if (!value) return 'TBD';
  return formatClockTimeIST(value) || value;
};

const formatJoinTime = (isoString) => formatTimeIST(isoString) || 'TBD';
const formatCountdown = (targetTime, nowMs) => {
  const delta = targetTime - nowMs;
  const abs = Math.abs(delta);
  const mins = Math.floor(abs / 60000);
  const secs = Math.floor((abs % 60000) / 1000);
  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  if (delta >= 0) return `Starts in: ${mm}:${ss}`;
  return `Started: ${mm}:${ss} ago`;
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
  const [popupDismissedById, setPopupDismissedById] = useState({});
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const fetchData = async () => {
      const today = getISTDayKey(new Date());
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
    const timer = window.setInterval(fetchData, 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const doctorName = doctorProfile?.full_name || 'Doctor';
  const doctorLastName = doctorName.split(' ').slice(-1)[0];
  const doctorHeroInitials = getInitials(`Dr ${doctorLastName}`);

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
        const timeA = parseISTDateTime(a.appointment_date, a.appointment_time || "00:00:00");
        const timeB = parseISTDateTime(b.appointment_date, b.appointment_time || "00:00:00");
        return (timeA?.getTime() || 0) - (timeB?.getTime() || 0);
      })
      .slice(0, 5);
  }, [appointments]);

  const getDoctorCallStatusText = (appointment) => {
    const state = appointment?.call_state || {};
    if (!state || (appointment.consultation_type || 'in_person') !== 'online') return null;

    if (state.missed) return 'Appointment marked as missed';
    if (state.both_joined || appointment.call_status === 'ongoing') return 'Video call started';
    if (!state.doctor_can_join_now) return `Join available at ${formatJoinTime(appointment.join_enabled_doctor_time)}`;
    if (state.doctor_joined && !state.patient_joined) return 'You joined. Waiting for patient';
    if (!state.doctor_joined && state.patient_joined) return 'Patient has joined and is waiting';
    return 'Patient not joined yet';
  };

  const popupAppointment = useMemo(() => {
    const eligible = appointments.filter((appt) => {
      if ((appt.consultation_type || 'in_person') !== 'online') return false;
      const status = String(appt.status || '').toLowerCase();
      if (['completed', 'cancelled', 'cancelled_by_doctor', 'cancelled_by_patient', 'no_show'].includes(status)) return false;
      const apptTime = parseISTDateTime(appt.appointment_date, appt.appointment_time || "00:00:00")?.getTime() || 0;
      const inWindow = nowMs >= (apptTime - 10 * 60 * 1000) && nowMs <= (apptTime + 15 * 60 * 1000);
      const missed = Boolean(appt?.call_state?.missed);
      return inWindow && !missed;
    });
    if (!eligible.length) return null;
    const nearest = [...eligible].sort((a, b) => {
      const aTime = parseISTDateTime(a.appointment_date, a.appointment_time || "00:00:00")?.getTime() || 0;
      const bTime = parseISTDateTime(b.appointment_date, b.appointment_time || "00:00:00")?.getTime() || 0;
      const aDiff = Math.abs(aTime - nowMs);
      const bDiff = Math.abs(bTime - nowMs);
      return aDiff - bDiff;
    })[0];
    if (popupDismissedById[nearest.id]) return null;
    return nearest;
  }, [appointments, nowMs, popupDismissedById]);

  const getDoctorPopupJoinMeta = (appointment) => {
    const state = appointment?.call_state || {};
    if (state.missed) return { label: 'Appointment Missed', enabled: false };
    if (state.both_joined || appointment.call_status === 'ongoing') return { label: 'Call in Progress', enabled: true };
    if (state.doctor_joined && !state.patient_joined) return { label: 'Waiting for Patient', enabled: true };
    if (!state.doctor_joined && state.patient_joined) return { label: 'Patient is waiting - Join Now', enabled: true };
    if (state.doctor_can_join_now) return { label: 'Join Call', enabled: true };
    return { label: 'Join not open yet', enabled: false };
  };

  const handleJoinAppointmentCall = async (appointment) => {
    try {
      const payload = await joinDoctorAppointmentCall(appointment.id);
      navigate(`/consultation/${payload.room_id || `appointment-${appointment.id}`}`);
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data?.error || 'Unable to join call right now';
      window.alert(message);
    }
  };

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
    <div className="nn-dashboard-wrap nn-doctor-dashboard-v3">
      {popupAppointment && (() => {
        const apptTime = parseISTDateTime(popupAppointment.appointment_date, popupAppointment.appointment_time || "00:00:00")?.getTime() || 0;
        const joinMeta = getDoctorPopupJoinMeta(popupAppointment);
        return (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15,23,42,0.38)',
              zIndex: 1200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <div style={{ width: '100%', maxWidth: 440, background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 30px 80px rgba(15,23,42,0.35)' }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>
                Upcoming Video Appointment
              </div>
              <h3 style={{ margin: 0, fontSize: 28, color: '#0f172a', fontWeight: 800 }}>{popupAppointment.patient_name || 'Patient'}</h3>
              <p style={{ margin: '4px 0 16px', color: '#64748b', fontWeight: 600 }}>Patient Consultation</p>
              <div style={{ color: '#1e293b', fontWeight: 700, marginBottom: 4 }}>
                {formatDate(popupAppointment.appointment_date)} • {formatTime(popupAppointment.appointment_time)}
              </div>
              <div style={{ color: '#475569', fontWeight: 600, marginBottom: 16 }}>Video Consultation</div>
              <div style={{ background: '#f1f5f9', borderRadius: 12, padding: '10px 12px', color: '#0f172a', fontWeight: 800, marginBottom: 18 }}>
                {formatCountdown(apptTime, nowMs)}
              </div>
              <div style={{ marginBottom: 14, color: '#475569', fontWeight: 600, fontSize: 14 }}>
                {getDoctorCallStatusText(popupAppointment)}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => handleJoinAppointmentCall(popupAppointment)}
                  disabled={!joinMeta.enabled}
                  className="btn btn-primary rounded-pill fw-bold"
                  style={{ flex: 1 }}
                >
                  {joinMeta.label}
                </button>
                <button
                  type="button"
                  onClick={() => setPopupDismissedById((prev) => ({ ...prev, [popupAppointment.id]: true }))}
                  className="btn btn-outline-secondary rounded-pill fw-bold"
                  style={{ flex: 1 }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      <section className="nn-dashboard-head">
        <div>
          <h2 className="nn-title">Welcome back, Dr. {doctorLastName}</h2>
          <p className="nn-subtitle">
            {formatDateIST(new Date(), { weekday: 'long', month: 'long', day: 'numeric' })}{' '}
            · Clinical operations snapshot
          </p>
        </div>
        <div className="nn-head-chip">
          <Activity size={14} />
          <span>System Active</span>
        </div>
      </section>

      <section className="row g-4">
        <div className="col-12">
          <div
            className="nn-overview-hero-card nn-clickable"
            role="button"
            tabIndex={0}
            onClick={() => navigate('/doctor/profile')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/doctor/profile');
              }
            }}
            aria-label="Open doctor profile"
          >
            <div className="nn-overview-hero-left">
              <div className="nn-overview-hero-avatar" aria-hidden="true">
                <span className="nn-overview-hero-avatar-initials">{doctorHeroInitials}</span>
              </div>
              <div className="nn-overview-hero-copy">
                <p className="nn-panel-kicker nn-overview-hero-kicker">DOCTOR OVERVIEW</p>
                <h3 className="nn-overview-hero-name">Dr. {doctorLastName}</h3>
                <div className="nn-overview-hero-meta">
                  <span>{doctorProfile?.specialization || 'Clinical Specialist'}</span>
                </div>
              </div>
            </div>
            <div className="nn-overview-hero-badge">
              <Stethoscope size={16} />
              <span>Clinician Dashboard</span>
            </div>
          </div>
        </div>

        <div className="col-12">
          <section className="row g-3 mb-1">
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
                  const statusKey = status.toLowerCase().replace(/[^a-z]/g, '-');
                  return (
                    <article key={patient.id} className="nn-preview-item nn-patient-preview-item">
                      <div className="nn-patient-preview-left">
                        <div className="nn-patient-avatar" aria-hidden="true">
                          {getInitials(patient.full_name)}
                        </div>
                        <div className="nn-preview-main">
                          <strong>{patient.full_name}</strong>
                          <span>Last visit: {formatDate(patient.last_visit)}</span>
                        </div>
                      </div>
                      <span className={`nn-followup-btn nn-followup-${statusKey}`}>Follow-up</span>
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
                  <article key={appointment.id} className="nn-preview-item nn-appointment-preview-item">
                    <div className="nn-appointment-preview-left">
                      <div className="nn-patient-avatar nn-appointment-avatar" aria-hidden="true">
                        {getInitials(appointment.patient_name || 'Patient')}
                      </div>
                      <div className="nn-preview-main">
                        <strong>{appointment.patient_name || 'Patient'}</strong>
                        <span>
                          {formatTime(appointment.appointment_time)} · {(appointment.consultation_type || 'in_person').replace('_', ' ')}
                        </span>
                        {(appointment.consultation_type || 'in_person') === 'online' && (
                          <span style={{ fontSize: '12px', color: '#64748b' }}>
                            {getDoctorCallStatusText(appointment)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <span className="nn-appointment-date-badge">{formatDate(appointment.appointment_date)}</span>
                      {(appointment.consultation_type || 'in_person') === 'online' && (
                        <button
                          type="button"
                          onClick={() => handleJoinAppointmentCall(appointment)}
                          disabled={!appointment?.call_state?.doctor_can_join_now || appointment?.call_state?.missed}
                          className="btn btn-sm btn-outline-primary rounded-pill fw-bold"
                        >
                          Join
                        </button>
                      )}
                    </div>
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
