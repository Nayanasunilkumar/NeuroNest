import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Calendar,
  CalendarPlus2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Files,
  Info,
  MapPin,
  MessageSquare,
  MoonStar,
  Phone,
  Pill,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Stethoscope,
  Sun,
  SunMedium,
  Sunset,
  TriangleAlert,
  Video,
  X,
  Megaphone,
} from "lucide-react";
import BulletinBoard from "../../components/announcements/BulletinBoard";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { getAppointmentCallState, getAppointments, joinAppointmentCall } from "../../api/appointments";
import { getClinicalSummary, getMyNotifications, markNotificationRead } from "../../api/profileApi";
import { API_BASE_URL } from "../../config/env";
import { formatClockTimeIST, formatDateFromISTDate, formatTimeIST, parseISTDateTime, getISTDayKey, getISTHour, formatDateIST } from "../../utils/time";

const METRIC_CONFIG = {
  hr: { label: "Heart Rate", unit: "BPM", normal: [60, 100], border: [50, 120], colors: { normal: "#129c7d", borderline: "#f59e0b", critical: "#dc2626" } },
  spo2: { label: "SpO2", unit: "%", normal: [95, 100], border: [92, 100], colors: { normal: "#129c7d", borderline: "#f59e0b", critical: "#dc2626" } },
  temp: { label: "Temperature", unit: "C", normal: [36.1, 37.2], border: [35.8, 37.8], colors: { normal: "#129c7d", borderline: "#f59e0b", critical: "#dc2626" } },
};

const MEDICATION_SLOTS = [
  { key: "morning", label: "Morning", icon: SunMedium, time: "08:00", overdueHour: 10 },
  { key: "afternoon", label: "Afternoon", icon: Sun, time: "13:00", overdueHour: 15 },
  { key: "evening", label: "Evening", icon: Sunset, time: "18:00", overdueHour: 20 },
  { key: "night", label: "Night", icon: MoonStar, time: "21:00", overdueHour: 23 },
];

const EMERGENCY_SERVICES = [
  { icon: "🚑", label: "Ambulance", number: "108", theme: "red" },
  { icon: "🚔", label: "Police", number: "100", theme: "orange" },
  { icon: "🔥", label: "Fire", number: "101", theme: "orange" },
  { icon: "🏥", label: "National Health Helpline", number: "104", theme: "red" },
];

const getISTDayOffset = (offsetDays = 0) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + offsetDays);
  return getISTDayKey(dt);
};

const FALLBACK_APPOINTMENTS = [
  { id: "fallback-1", doctor_name: "Dr. Priya Raman", specialization: "Neurology", appointment_date: getISTDayOffset(1), appointment_time: "15:00:00", consultation_type: "online", status: "approved" },
  { id: "fallback-2", doctor_name: "Dr. Arjun Mehta", specialization: "Cardiology", appointment_date: getISTDayOffset(3), appointment_time: "10:30:00", consultation_type: "in_person", status: "pending" },
];

const todayKey = getISTDayKey(new Date());

const parseAppointmentDateTime = (appt) => parseISTDateTime(appt?.appointment_date, appt?.appointment_time || "00:00:00");
const formatDate = (value) => formatDateIST(value, { weekday: "short", month: "short", day: "numeric" });
const formatTime = (time) => formatClockTimeIST(time);
const formatTimeFromISO = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return formatTimeIST(date.toISOString());
};
const formatCountdown = (targetTime, nowMs) => {
  const delta = targetTime - nowMs;
  const abs = Math.abs(delta);
  const mins = Math.floor(abs / 60000);
  const secs = Math.floor((abs % 60000) / 1000);
  const mm = String(mins).padStart(2, "0");
  const ss = String(secs).padStart(2, "0");
  if (delta >= 0) return `Starts in: ${mm}:${ss}`;
  return `Started: ${mm}:${ss} ago`;
};

const getCountdown = (appt) => {
  const dt = parseAppointmentDateTime(appt);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  const diff = Math.round((target - today) / 86400000);
  if (diff <= 0) return `Today at ${formatTime(appt.appointment_time)}`;
  if (diff === 1) return `Tomorrow at ${formatTime(appt.appointment_time)}`;
  return `In ${diff} days`;
};
const getCurrentHourIST = () => getISTHour();

const getAppointmentType = (appt) => String(appt?.consultation_type || "in_person").toLowerCase() === "online" ? "Video" : "In-person";
const getStatusMeta = (status) => {
  const value = String(status || "pending").toLowerCase();
  if (value === "approved" || value === "confirmed") return { label: "Confirmed", className: "confirmed" };
  if (value === "rescheduled") return { label: "Action Needed", className: "pending" };
  return { label: "Pending", className: "pending" };
};
const getSeverity = (notification) => {
  const text = `${notification?.title || ""} ${notification?.message || ""}`.toLowerCase();
  if (text.includes("critical") || text.includes("emergency") || text.includes("immediately") || text.includes("abnormal")) return "critical";
  if (text.includes("warning") || text.includes("pending") || text.includes("urgent") || text.includes("rescheduled") || notification?.type === "appointment_rescheduled") return "warning";
  return "info";
};

const classifyMetric = (key, value) => {
  const config = METRIC_CONFIG[key];
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return "normal";
  if (numeric >= config.normal[0] && numeric <= config.normal[1]) return "normal";
  if (numeric >= config.border[0] && numeric <= config.border[1]) return "borderline";
  return "critical";
};

const buildTrendSeries = (history = [], latest = null) => {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i));
    return {
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      dateKey: getISTDayKey(date),
      hr: null,
      spo2: null,
      temp: null,
      count: 0,
    };
  });

  history.forEach((entry, index) => {
    const ts = entry?.ts ? new Date(entry.ts) : null;
    const fallbackDay = days[Math.max(0, days.length - history.length + index)];
    const key = ts && !Number.isNaN(ts.getTime()) ? getISTDayKey(ts) : fallbackDay?.dateKey;
    const bucket = days.find((day) => day.dateKey === key);
    if (!bucket) return;
    bucket.hr = (bucket.hr ?? 0) + Number(entry.hr || 0);
    bucket.spo2 = (bucket.spo2 ?? 0) + Number(entry.spo2 || 0);
    bucket.temp = (bucket.temp ?? 0) + Number(entry.temp || 0);
    bucket.count += 1;
  });

  days.forEach((bucket, index) => {
    const previous = days[index - 1];
    if (bucket.count) {
      bucket.hr /= bucket.count;
      bucket.spo2 /= bucket.count;
      bucket.temp /= bucket.count;
      return;
    }
    bucket.hr = previous?.hr ?? Number(latest?.hr ?? 76);
    bucket.spo2 = previous?.spo2 ?? Number(latest?.spo2 ?? 98);
    bucket.temp = previous?.temp ?? Number(latest?.temp ?? 36.8);
  });

  if (latest) {
    const last = days[days.length - 1];
    if (latest.hr != null) last.hr = Number(latest.hr);
    if (latest.spo2 != null) last.spo2 = Number(latest.spo2);
    if (latest.temp != null) last.temp = Number(latest.temp);
  }

  return days.map((day) => ({
    label: day.label,
    hr: Number(day.hr?.toFixed?.(0) ?? day.hr ?? 76),
    spo2: Number(day.spo2?.toFixed?.(0) ?? day.spo2 ?? 98),
    temp: Number(day.temp?.toFixed?.(1) ?? day.temp ?? 36.8),
  }));
};

const buildMedicationSchedule = (medications = []) => {
  const slots = Object.fromEntries(MEDICATION_SLOTS.map((slot) => [slot.key, []]));
  const pickSlots = (frequency, index) => {
    const text = String(frequency || "").toLowerCase();
    if (text.includes("4")) return ["morning", "afternoon", "evening", "night"];
    if (text.includes("3")) return ["morning", "afternoon", "night"];
    if (text.includes("2")) return ["morning", "evening"];
    if (text.includes("night")) return ["night"];
    if (text.includes("evening")) return ["evening"];
    if (text.includes("afternoon")) return ["afternoon"];
    if (text.includes("morning")) return ["morning"];
    return [MEDICATION_SLOTS[index % MEDICATION_SLOTS.length].key];
  };

  medications.filter((med) => String(med?.status || "active").toLowerCase() === "active").forEach((med, index) => {
    pickSlots(med.frequency, index).forEach((slotKey, slotIndex) => {
      slots[slotKey].push({
        id: `${med.id || med.drug_name}-${slotKey}-${slotIndex}`,
        name: med.drug_name || "Prescription",
        dosage: med.dosage || med.instructions || "1 tablet",
      });
    });
  });

  return MEDICATION_SLOTS.map((slot) => ({ ...slot, medications: slots[slot.key] }));
};

const getMetricSummary = (series, metric) => {
  const values = series.map((item) => Number(item[metric])).filter((value) => !Number.isNaN(value));
  if (!values.length) return { min: "--", max: "--", avg: "--", tone: "normal" };
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
  return {
    min: Math.min(...values).toFixed(metric === "temp" ? 1 : 0),
    max: Math.max(...values).toFixed(metric === "temp" ? 1 : 0),
    avg: avg.toFixed(metric === "temp" ? 1 : 0),
    tone: classifyMetric(metric, avg),
  };
};

function QuickActionCard({ icon: Icon, title, subtitle, tone = "default", onClick }) {
  return (
    <button type="button" className={`nn-quick-action nn-quick-action-${tone}`} onClick={onClick}>
      <span className="nn-quick-action-icon">{React.createElement(Icon, { size: 20 })}</span>
      <span className="nn-quick-action-copy">
        <span className="nn-quick-action-title">{title}</span>
        <span className="nn-quick-action-subtitle">{subtitle}</span>
      </span>
    </button>
  );
}

function EmergencyConfirmModal({ onClose, onConfirm }) {
  return (
    <div className="nn-modal-backdrop" onClick={onClose}>
      <div className="nn-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="nn-confirm-icon"><Siren size={26} /></div>
        <h3>Open emergency support?</h3>
        <p>This will show official helplines and your saved emergency contacts in a full-screen SOS panel.</p>
        <div className="nn-confirm-actions">
          <button type="button" className="btn btn-light rounded-pill px-4" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-danger rounded-pill px-4" onClick={onConfirm}>Continue</button>
        </div>
      </div>
    </div>
  );
}

function EmergencySOSModal({ contacts, onClose }) {
  const navigate = useNavigate();
  const ordered = [...contacts].sort((a, b) => Number(Boolean(b.is_primary)) - Number(Boolean(a.is_primary)));

  return (
    <div className="nn-sos-overlay">
      <div className="nn-sos-shell">
        <div className="nn-sos-header">
          <div>
            <span className="nn-sos-kicker">Emergency Support</span>
            <h2>Immediate help and trusted contacts</h2>
            <p>Use official emergency services first if there is immediate danger.</p>
          </div>
          <button type="button" className="nn-sos-close" onClick={onClose} aria-label="Close emergency support">
            <X size={22} />
          </button>
        </div>

        <div className="nn-sos-grid">
          <section className="nn-sos-section">
            <div className="nn-sos-section-head">
              <TriangleAlert size={18} />
              <span>Official Emergency Numbers</span>
            </div>
            <div className="nn-sos-service-grid">
              {EMERGENCY_SERVICES.map((service) => (
                <div key={service.number} className={`nn-sos-service nn-sos-service-${service.theme}`}>
                  <div className="nn-sos-service-icon">{service.icon}</div>
                  <div className="nn-sos-service-copy">
                    <span>{service.label}</span>
                    <strong>{service.number}</strong>
                  </div>
                  <a className="btn btn-light rounded-pill fw-bold" href={`tel:${service.number}`}>Call Now</a>
                </div>
              ))}
            </div>
          </section>

          <section className="nn-sos-section">
            <div className="nn-sos-section-head">
              <ShieldCheck size={18} />
              <span>Personal Emergency Contacts</span>
            </div>

            {ordered.length ? (
              <div className="nn-sos-contact-grid">
                {ordered.map((contact, index) => (
                  <div key={`${contact.phone}-${index}`} className={`nn-sos-contact-card ${contact.is_primary ? "is-primary" : ""}`}>
                    <div className="nn-sos-contact-top">
                      <div>
                        <h3>{contact.contact_name || "Emergency Contact"}</h3>
                        <p>{contact.relationship || "Support contact"}</p>
                      </div>
                      {contact.is_primary && <span className="nn-primary-badge">Primary Contact</span>}
                    </div>
                    <div className="nn-sos-contact-meta">
                      <span><Phone size={14} /> {contact.phone || "No phone saved"}</span>
                      <span><Info size={14} /> {contact.email || "No email saved"}</span>
                    </div>
                    <a
                      className="btn btn-danger rounded-pill fw-bold"
                      href={contact.phone ? `tel:${contact.phone}` : undefined}
                      aria-disabled={!contact.phone}
                      onClick={(e) => {
                        if (!contact.phone) e.preventDefault();
                      }}
                    >
                      Call
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="nn-empty-sos-state">
                <p>No emergency contacts added. Go to Profile -&gt; Emergency Support to add them.</p>
                <button
                  type="button"
                  className="btn btn-outline-light rounded-pill"
                  onClick={() => {
                    onClose();
                    navigate("/patient/profile");
                  }}
                >
                  Open Profile
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default function DashboardEnhancements() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [clinicalData, setClinicalData] = useState(null);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [trendSeries, setTrendSeries] = useState(() => buildTrendSeries());
  const [selectedMetric, setSelectedMetric] = useState("hr");
  const [dismissingAlerts, setDismissingAlerts] = useState([]);
  const [showSosConfirm, setShowSosConfirm] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);
  const [callStateById, setCallStateById] = useState({});
  const [popupDismissedById, setPopupDismissedById] = useState({});
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [medicationChecks, setMedicationChecks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`nn-medications-${todayKey}`) || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [notificationData, appointmentData, clinicalSummary, contactData, latest, history] = await Promise.all([
          getMyNotifications(true).catch(() => []),
          getAppointments().catch(() => []),
          getClinicalSummary().catch(() => null),
          api.get("/profile/emergency-contact/me").catch(() => ({ data: [] })),
          fetch(`${API_BASE_URL}/api/vitals/latest`, { headers: { Authorization: `Bearer ${localStorage.getItem("neuronest_token")}` } }).then((res) => res.json()).catch(() => null),
          fetch(`${API_BASE_URL}/api/vitals/history`, { headers: { Authorization: `Bearer ${localStorage.getItem("neuronest_token")}` } }).then((res) => res.json()).catch(() => []),
        ]);

        setNotifications(Array.isArray(notificationData) ? notificationData : []);
        setAppointments(Array.isArray(appointmentData) && appointmentData.length ? appointmentData : FALLBACK_APPOINTMENTS);
        setClinicalData(clinicalSummary);
        setEmergencyContacts(Array.isArray(contactData?.data) ? contactData.data : []);
        setTrendSeries(buildTrendSeries(Array.isArray(history) ? history : [], latest));
      } catch (error) {
        console.error("Dashboard enhancements failed to load", error);
        setAppointments(FALLBACK_APPOINTMENTS);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const onlineUpcoming = appointments.filter((appt) => {
      const status = String(appt.status || "").toLowerCase();
      return String(appt.consultation_type || "in_person").toLowerCase() === "online" && ["pending", "approved", "rescheduled", "confirmed"].includes(status);
    });
    if (!onlineUpcoming.length) {
      setCallStateById({});
      return;
    }

    let isCancelled = false;
    const loadCallStates = async () => {
      const results = await Promise.allSettled(onlineUpcoming.map((appt) => getAppointmentCallState(appt.id)));
      if (isCancelled) return;
      const nextState = {};
      results.forEach((result, idx) => {
        if (result.status === "fulfilled") {
          nextState[onlineUpcoming[idx].id] = result.value;
        }
      });
      setCallStateById(nextState);
    };

    loadCallStates();
    const timer = window.setInterval(loadCallStates, 30000);
    return () => {
      isCancelled = true;
      window.clearInterval(timer);
    };
  }, [appointments]);

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem(`nn-medications-${todayKey}`, JSON.stringify(medicationChecks));
  }, [medicationChecks]);

  const upcomingAppointments = useMemo(() => appointments
    .filter((appt) => ["pending", "approved", "rescheduled", "confirmed"].includes(String(appt.status || "").toLowerCase()))
    .filter((appt) => parseAppointmentDateTime(appt) >= new Date(Date.now() - 60 * 60 * 1000))
    .sort((a, b) => parseAppointmentDateTime(a) - parseAppointmentDateTime(b))
    .slice(0, 3), [appointments]);

  const activeAlerts = useMemo(() => notifications
    .filter((item) => !dismissingAlerts.includes(item.id))
    .map((item) => ({ ...item, severity: getSeverity(item) }))
    .sort((a, b) => ({ critical: 0, warning: 1, info: 2 }[a.severity] - { critical: 0, warning: 1, info: 2 }[b.severity])), [dismissingAlerts, notifications]);

  const medicationTimeline = useMemo(() => buildMedicationSchedule(clinicalData?.medications || []), [clinicalData]);
  const medicationTotal = medicationTimeline.reduce((sum, slot) => sum + slot.medications.length, 0);
  const medicationDone = Object.values(medicationChecks).filter(Boolean).length;
  const nearestAppointment = upcomingAppointments[0];
  const metricSummary = getMetricSummary(trendSeries, selectedMetric);
  const metricColor = METRIC_CONFIG[selectedMetric].colors[metricSummary.tone];

  const acknowledgeAlert = (id) => {
    setDismissingAlerts((prev) => [...prev, id]);
    window.setTimeout(async () => {
      try {
        await markNotificationRead(id);
      } catch (error) {
        console.error("Failed to acknowledge alert", error);
      } finally {
        setNotifications((prev) => prev.filter((item) => item.id !== id));
        setDismissingAlerts((prev) => prev.filter((item) => item !== id));
      }
    }, 280);
  };

  const getPatientCallStatus = (appointment) => {
    const callData = callStateById[appointment.id];
    const state = callData?.call_state || {};
    if (!callData) return null;
    if (state.missed) return "Appointment marked as missed";
    if (state.both_joined || callData.call_status === "ongoing") return "Video call started";
    if (!state.patient_can_join_now) return `Join available at ${formatTimeFromISO(callData.join_enabled_patient_time)}`;
    if (state.patient_joined && !state.doctor_joined) return "You joined. Waiting for doctor";
    if (!state.patient_joined && state.doctor_joined) return "Doctor is waiting. Join now";
    return "Waiting for doctor to join";
  };

  const popupCandidate = useMemo(() => {
    const now = nowMs;
    const eligible = appointments.filter((appt) => {
      if (String(appt.consultation_type || "in_person").toLowerCase() !== "online") return false;
      const status = String(appt.status || "").toLowerCase();
      if (["completed", "cancelled", "cancelled_by_patient", "cancelled_by_doctor", "no_show"].includes(status)) return false;
      const apptTime = parseAppointmentDateTime(appt).getTime();
      const inWindow = now >= (apptTime - 10 * 60 * 1000) && now <= (apptTime + 15 * 60 * 1000);
      const missed = Boolean(callStateById[appt.id]?.call_state?.missed);
      return inWindow && !missed;
    });

    if (!eligible.length) return null;
    return [...eligible].sort((a, b) => {
      const aDiff = Math.abs(parseAppointmentDateTime(a).getTime() - now);
      const bDiff = Math.abs(parseAppointmentDateTime(b).getTime() - now);
      return aDiff - bDiff;
    })[0];
  }, [appointments, callStateById, nowMs]);

  const popupAppointment = useMemo(() => {
    if (!popupCandidate) return null;
    if (popupDismissedById[popupCandidate.id]) return null;
    return popupCandidate;
  }, [popupCandidate, popupDismissedById]);

  const getPopupJoinMeta = (appointment) => {
    const callData = callStateById[appointment.id];
    const state = callData?.call_state || {};
    if (!callData) {
      return { label: "Join Call", enabled: false };
    }
    if (state.missed) return { label: "Appointment Missed", enabled: false };
    if (state.both_joined || callData.call_status === "ongoing") return { label: "Call in Progress", enabled: true };
    if (state.patient_joined && !state.doctor_joined) return { label: "Waiting for Doctor", enabled: true };
    if (!state.patient_joined && state.doctor_joined) return { label: "Doctor is waiting - Join Now", enabled: true };
    if (state.patient_can_join_now) return { label: "Join Call", enabled: true };
    return { label: "Join not open yet", enabled: false };
  };

  const openAppointmentAction = async (appointment) => {
    if (getAppointmentType(appointment) === "Video") {
      if (!Number.isFinite(Number(appointment?.id))) {
        navigate("/patient/appointments");
        return;
      }
      try {
        const payload = await joinAppointmentCall(appointment.id);
        setCallStateById((prev) => ({ ...prev, [appointment.id]: payload }));
        navigate(`/consultation/${payload.room_id || `appointment-${appointment.id}`}`, {
          state: { appointmentId: appointment.id },
        });
      } catch (error) {
        const message = error?.response?.data?.error || error?.response?.data?.message || "Join is not available yet";
        window.alert(message);
      }
      return;
    }
    const query = encodeURIComponent(`NeuroNest clinic ${appointment.specialization || "specialist"}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank", "noopener,noreferrer");
  };

  const toggleMedication = (id) => setMedicationChecks((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <>
      {popupAppointment && (() => {
        const callMeta = getPopupJoinMeta(popupAppointment);
        const apptTime = parseAppointmentDateTime(popupAppointment).getTime();
        return (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,23,42,0.38)",
              zIndex: 1200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <div style={{ width: "100%", maxWidth: 440, background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 30px 80px rgba(15,23,42,0.35)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", color: "#64748b", textTransform: "uppercase", marginBottom: 8 }}>
                Upcoming Video Appointment
              </div>
              <h3 style={{ margin: 0, fontSize: 28, color: "#0f172a", fontWeight: 800 }}>{popupAppointment.doctor_name || "Doctor"}</h3>
              <p style={{ margin: "4px 0 16px", color: "#64748b", fontWeight: 600 }}>{popupAppointment.specialization || "Specialist"}</p>
              <div style={{ color: "#1e293b", fontWeight: 700, marginBottom: 4 }}>
                {formatDate(parseAppointmentDateTime(popupAppointment))} • {formatTime(popupAppointment.appointment_time)}
              </div>
              <div style={{ color: "#475569", fontWeight: 600, marginBottom: 16 }}>Video Consultation</div>
              <div style={{ background: "#f1f5f9", borderRadius: 12, padding: "10px 12px", color: "#0f172a", fontWeight: 800, marginBottom: 18 }}>
                {formatCountdown(apptTime, nowMs)}
              </div>
              {callStateById[popupAppointment.id] && (
                <div style={{ marginBottom: 14, color: "#475569", fontWeight: 600, fontSize: 14 }}>
                  {getPatientCallStatus(popupAppointment)}
                </div>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => openAppointmentAction(popupAppointment)}
                  disabled={!callMeta.enabled}
                  className="btn btn-primary rounded-pill fw-bold"
                  style={{ flex: 1 }}
                >
                  {callMeta.label}
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
      <section className="nn-quick-actions-row">
        <QuickActionCard icon={CalendarPlus2} title="Book Appointment" subtitle="Schedule a consultation" onClick={() => navigate("/patient/book")} />
        <QuickActionCard icon={MessageSquare} title="Message Doctor" subtitle="Open patient messages" onClick={() => navigate("/patient/messages")} />
        <QuickActionCard icon={Files} title="View Reports" subtitle="Open medical records" onClick={() => navigate("/patient/medical-records")} />
        <QuickActionCard icon={ShieldAlert} title="Emergency SOS" subtitle="Critical support access" tone="sos" onClick={() => setShowSosConfirm(true)} />
      </section>

      <div className="row g-4 mb-4">
        <div className="col-12 col-xl-6">
          <section className="nn-panel nn-appointments-panel">
            <div className="nn-panel-head">
              <div><span className="nn-panel-kicker">Appointments</span><h2>Upcoming care schedule</h2></div>
              <Link to="/patient/appointments" className="nn-panel-link">View all</Link>
            </div>
            {nearestAppointment && (
              <div className="nn-next-appointment-banner">
                <div><span className="nn-countdown-label">Nearest appointment</span><strong>{getCountdown(nearestAppointment)}</strong></div>
                <Clock size={18} />
              </div>
            )}
            <div className="nn-appointment-list">
              {upcomingAppointments.length ? upcomingAppointments.map((appointment, index) => {
                const status = getStatusMeta(appointment.status);
                const type = getAppointmentType(appointment);
                return (
                  <article key={appointment.id} className="nn-appointment-card" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="nn-appointment-top">
                      <div className="nn-specialty-icon"><Stethoscope size={18} /></div>
                      <div className="flex-grow-1">
                        <h3>{appointment.doctor_name || "Assigned Specialist"}</h3>
                        <p>{appointment.specialization || appointment.specialty || "Neurology"}</p>
                      </div>
                      <span className={`nn-status-badge ${status.className}`}>{status.label}</span>
                    </div>
                    <div className="nn-appointment-meta">
                      <span><Calendar size={14} /> {formatDate(parseAppointmentDateTime(appointment))}</span>
                      <span><Clock size={14} /> {formatTime(appointment.appointment_time)}</span>
                      <span>{type === "Video" ? <Video size={14} /> : <MapPin size={14} />} {type}</span>
                    </div>
                    <div className="nn-appointment-footer">
                      <span className="nn-countdown-chip">{getCountdown(appointment)}</span>
                      {type === "Video" ? (
                        (Number.isFinite(Number(appointment?.id))
                          && callStateById[appointment.id]
                          && callStateById[appointment.id]?.call_state?.patient_can_join_now
                          && !callStateById[appointment.id]?.call_state?.missed) ? (
                          <button
                            type="button"
                            className="btn btn-outline-primary rounded-pill fw-bold"
                            onClick={() => openAppointmentAction(appointment)}
                          >
                            Join Call
                          </button>
                        ) : null
                      ) : (
                        <button
                          type="button"
                          className="btn btn-outline-primary rounded-pill fw-bold"
                          onClick={() => openAppointmentAction(appointment)}
                        >
                          Get Directions
                        </button>
                      )}
                    </div>
                    {type === "Video" && callStateById[appointment.id] && (
                      <div style={{ marginTop: 8, fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                        {getPatientCallStatus(appointment)}
                      </div>
                    )}
                  </article>
                );
              }) : (
                <div className="nn-empty-state"><Calendar size={24} /><div><strong>No upcoming appointments</strong><p>Your next booking will appear here.</p></div></div>
              )}
            </div>
          </section>
        </div>

        <div className="col-12 col-xl-6">
          <section className="nn-panel nn-medication-panel">
            <div className="nn-panel-head">
              <div><span className="nn-panel-kicker">Medication</span><h2>Prescription reminder</h2></div>
              <span className="nn-progress-copy">{medicationDone} of {medicationTotal || 0} medications taken today</span>
            </div>
            <div className="nn-progress-track"><div className="nn-progress-fill" style={{ width: `${medicationTotal ? (medicationDone / medicationTotal) * 100 : 0}%` }} /></div>
            <div className="nn-medication-timeline">
              {medicationTimeline.map((slot) => {
                const Icon = slot.icon;
                const hour = getCurrentHourIST();
                return (
                  <div key={slot.key} className="nn-medication-slot">
                    <div className="nn-medication-slot-head">
                      <span className="nn-slot-icon"><Icon size={16} /></span>
                      <div><h3>{slot.label}</h3><p>{slot.time}</p></div>
                    </div>
                    <div className="nn-medication-items">
                      {slot.medications.length ? slot.medications.map((medication) => {
                        const checked = Boolean(medicationChecks[medication.id]);
                        const overdue = !checked && hour >= slot.overdueHour;
                        return (
                          <label key={medication.id} className={`nn-medication-item ${checked ? "is-complete" : ""} ${overdue ? "is-overdue" : ""}`}>
                            <span className="nn-pill-icon"><Pill size={15} /></span>
                            <span className="nn-medication-copy"><strong>{medication.name}</strong><span>{medication.dosage}</span></span>
                            <input type="checkbox" checked={checked} onChange={() => toggleMedication(medication.id)} />
                          </label>
                        );
                      }) : <div className="nn-medication-empty">No dose scheduled for this slot.</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-7">
          <section className="nn-panel nn-trends-panel">
            <div className="nn-panel-head">
              <div><span className="nn-panel-kicker">Health Trends</span><h2>7-day mini chart</h2></div>
              <Link to="/patient/medical-records" className="nn-panel-link">Full Report <ChevronRight size={15} /></Link>
            </div>
            <div className="nn-metric-tabs">
              {Object.entries(METRIC_CONFIG).map(([key, config]) => (
                <button key={key} type="button" className={`nn-metric-tab ${selectedMetric === key ? "active" : ""}`} onClick={() => setSelectedMetric(key)}>
                  {config.label}
                </button>
              ))}
            </div>
            <div className="nn-trend-chart">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={trendSeries} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#6b7a90", fontSize: 12 }} />
                  <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
                  <Tooltip
                    contentStyle={{ borderRadius: 16, border: "1px solid rgba(15,23,42,0.08)", boxShadow: "0 20px 40px rgba(15,23,42,0.12)" }}
                    formatter={(value) => `${value} ${METRIC_CONFIG[selectedMetric].unit}`}
                  />
                  <Line type="monotone" dataKey={selectedMetric} stroke={metricColor} strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} isAnimationActive animationDuration={900} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="nn-stat-grid">
              <div className="nn-stat-card"><span>Min</span><strong>{metricSummary.min} {METRIC_CONFIG[selectedMetric].unit}</strong></div>
              <div className="nn-stat-card"><span>Max</span><strong>{metricSummary.max} {METRIC_CONFIG[selectedMetric].unit}</strong></div>
              <div className="nn-stat-card"><span>Avg</span><strong>{metricSummary.avg} {METRIC_CONFIG[selectedMetric].unit}</strong></div>
            </div>
          </section>
        </div>

        <div className="col-12 col-xl-5">
          <section className="nn-panel nn-alerts-panel">
            <div className="nn-panel-head">
              <div><span className="nn-panel-kicker">Bulletin</span><h2>Institutional Updates</h2></div>
            </div>
            <div className="mb-4">
              <BulletinBoard limit={2} />
            </div>

            <div className="nn-panel-head">
              <div><span className="nn-panel-kicker">Notifications</span><h2>Reminders & Alerts</h2></div>
              <span className="nn-alert-count">{activeAlerts.length} Active Alerts</span>
            </div>
            <div className="d-flex flex-column gap-3 dashboard-scroll-container nn-alert-scroll">
              {activeAlerts.length ? activeAlerts.map((notification) => {
                const config = {
                  critical: { icon: ShieldAlert, label: "Critical", className: "critical" },
                  warning: { icon: Clock, label: "Warning", className: "warning" },
                  info: { icon: Bell, label: "Info", className: "info" },
                }[notification.severity];
                const Icon = config.icon;
                return (
                  <article key={notification.id} className={`nn-alert-card ${config.className} ${dismissingAlerts.includes(notification.id) ? "is-dismissing" : ""}`}>
                    <div className="nn-alert-top">
                      <div className="nn-alert-icon"><Icon size={18} /></div>
                      <div className="flex-grow-1">
                        <div className="nn-alert-heading-row">
                          <strong>{notification.title}</strong>
                          <span className={`nn-severity-pill ${config.className}`}>{config.label}</span>
                        </div>
                        <p>{notification.message}</p>
                      </div>
                    </div>
                    <div className="nn-alert-actions">
                      {notification.type === "appointment_rescheduled" && (
                        <button type="button" className="btn btn-warning btn-sm rounded-pill fw-bold" onClick={() => navigate("/patient/appointments")}>Review Appointment</button>
                      )}
                      <button type="button" className="btn btn-outline-secondary btn-sm rounded-pill fw-bold" onClick={() => acknowledgeAlert(notification.id)}>Acknowledge</button>
                    </div>
                  </article>
                );
              }) : (
                <div className="nn-empty-state"><CheckCircle2 size={24} /><div><strong>All clear</strong><p>No active dashboard alerts right now.</p></div></div>
              )}
            </div>
          </section>
        </div>
      </div>

      {showSosConfirm && (
        <EmergencyConfirmModal
          onClose={() => setShowSosConfirm(false)}
          onConfirm={() => {
            setShowSosConfirm(false);
            setShowSosModal(true);
          }}
        />
      )}

      {showSosModal && <EmergencySOSModal contacts={emergencyContacts} onClose={() => setShowSosModal(false)} />}
    </>
  );
}
