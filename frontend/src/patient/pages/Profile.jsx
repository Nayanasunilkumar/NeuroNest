import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatDate, calculateAgeIST } from "../../shared/utils/time";
import api from "../../shared/services/api/axios";
import axios from "axios";
import { toAssetUrl } from "../../shared/utils/media";
import "../../patient/styles/patient-records.css"; // Reuse premium clinical styles
import "../../shared/styles/ProfileStyles.css";
import { getClinicalSummary } from "../../shared/services/api/profileApi";
import {
  User, Phone, Mail, MapPin, Activity,
  Heart, Calendar, Weight, Edit2, MessageCircle,
  Save, Plus, Trash2, ShieldAlert,
  Droplet, Scale, Video, Stethoscope, FileText
} from "lucide-react";

const PROFILE_KEYS = [
  "full_name",
  "phone",
  "date_of_birth",
  "gender",
  "blood_group",
  "height_cm",
  "weight_kg",
  "address",
  "city",
  "state",
  "country",
  "pincode",
  "allergies",
  "chronic_conditions",
  "profile_image",
  "email",
];

const normalizeProfile = (data = {}) =>
  PROFILE_KEYS.reduce((acc, key) => {
    acc[key] = data[key] ?? "";
    return acc;
  }, {});

const normalizeEmergencyContacts = (contacts = []) =>
  (contacts || []).map((contact) => ({
    id: contact.id ?? null,
    contact_name: contact.contact_name ?? "",
    relationship: contact.relationship ?? "",
    phone: contact.phone ?? "",
    alternate_phone: contact.alternate_phone ?? "",
    email: contact.email ?? "",
    is_primary: Boolean(contact.is_primary),
  }));

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [clinicalData, setClinicalData] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [_CITIES, setCities] = useState([]);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAllConditions, setShowAllConditions] = useState(false);
  const [initialProfileSnapshot, setInitialProfileSnapshot] = useState(null);
  const [initialEmergencySnapshot, setInitialEmergencySnapshot] = useState(null);

  const fetchClinicalData = async () => {
    try {
      const data = await getClinicalSummary();
      setClinicalData(data);
      const cleanedProfile = normalizeProfile(data.identity);
      setProfile(cleanedProfile);
      localStorage.setItem("userProfile", JSON.stringify(cleanedProfile));
    } catch (err) {
      console.error("Failed to fetch clinical summary", err);
    }
  };

  const fetchEmergencyContact = async () => {
    try {
      const res = await api.get("/api/profile/emergency-contact/me");
      if (Array.isArray(res.data)) {
        const normalizedContacts = normalizeEmergencyContacts(res.data);
        setEmergencyContacts(normalizedContacts);
      }
    } catch {
      console.log("No emergency contacts found");
    }
  };

  const fetchCountries = async () => {
    if (countries.length > 0) return; // Already fetched
    try {
      const res = await axios.get("https://countriesnow.space/api/v0.1/countries/positions");
      const list = res.data.data.map((c) => c.name);
      setCountries(list);
    } catch (err) { console.error(err); }
  };

  const fetchStates = async (country) => {
    try {
      const res = await axios.post("https://countriesnow.space/api/v0.1/countries/states", { country });
      setStates(res.data.data.states.map((s) => s.name));
    } catch { setStates([]); }
  };

  const fetchCities = async (country, state) => {
    try {
      const res = await axios.post("https://countriesnow.space/api/v0.1/countries/state/cities", { country, state });
      setCities(res.data.data);
    } catch { setCities([]); }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      // Removed fetchCountries from initial load - only fetch on edit
      await Promise.all([fetchClinicalData(), fetchEmergencyContact()]);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (editing && JSON.stringify(profile) !== JSON.stringify(initialProfileSnapshot)) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [editing, profile, initialProfileSnapshot]);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    if (name === "country") {
      setProfile((prev) => ({ ...prev, country: value, state: "", city: "", pincode: "" }));
      await fetchStates(value);
      return;
    }
    if (name === "state") {
      setProfile((prev) => ({ ...prev, state: value, city: "" }));
      await fetchCities(profile.country, value);
      return;
    }
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleEmergencyChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const updatedContacts = [...emergencyContacts];
    if (name === "is_primary" && checked) {
      updatedContacts.forEach((c) => { c.is_primary = false; });
    }
    updatedContacts[index][name] = type === "checkbox" ? checked : value;
    setEmergencyContacts(updatedContacts);
  };

  const addNewContact = () => setEmergencyContacts([...emergencyContacts, { contact_name: "", relationship: "", phone: "", alternate_phone: "", email: "", is_primary: false }]);
  const removeContact = (index) => setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));

  const buildEmergencyContactPayload = () => {
    const cleanedContacts = normalizeEmergencyContacts(emergencyContacts)
      .map((contact) => ({
        ...contact,
        contact_name: String(contact.contact_name || "").trim(),
        relationship: String(contact.relationship || "").trim(),
        phone: String(contact.phone || "").trim(),
        alternate_phone: String(contact.alternate_phone || "").trim(),
        email: String(contact.email || "").trim(),
      }))
      .filter((contact) => (
        contact.contact_name ||
        contact.relationship ||
        contact.phone ||
        contact.alternate_phone ||
        contact.email
      ));

    return cleanedContacts.map((contact, index) => ({
      ...contact,
      is_primary: cleanedContacts.some((item) => item.is_primary)
        ? Boolean(contact.is_primary)
        : index === 0,
    }));
  };

  const startEditing = () => {
    fetchCountries(); // Lazy load countries on edit click
    setInitialProfileSnapshot(normalizeProfile(profile));
    setInitialEmergencySnapshot(normalizeEmergencyContacts(emergencyContacts));
    setEditing(true);
  };

  const cancelEdit = () => {
    const hasChanges = JSON.stringify(profile) !== JSON.stringify(initialProfileSnapshot) || 
                       JSON.stringify(emergencyContacts) !== JSON.stringify(initialEmergencySnapshot);
    
    if (hasChanges) {
      if (!window.confirm("You have unsaved changes. Are you sure you want to discard them?")) {
        return;
      }
    }
    setProfile(initialProfileSnapshot);
    setEmergencyContacts(initialEmergencySnapshot);
    setEditing(false);
  };

    try {
      setSaving(true);
      const formData = new FormData();
      Object.keys(profile).forEach((key) => { formData.append(key, profile[key] ?? ""); });
      if (profileImage) formData.append("profile_image", profileImage);

      await api.put("/api/profile/me", formData, { headers: { "Content-Type": "multipart/form-data" } });
      await api.put("/api/profile/emergency-contact/me", buildEmergencyContactPayload());

      const userStr = localStorage.getItem("neuronest_user");
      if (userStr && profile.full_name) {
        try {
          const parsedUser = JSON.parse(userStr);
          parsedUser.full_name = profile.full_name;
          localStorage.setItem("neuronest_user", JSON.stringify(parsedUser));
        } catch {
          // Ignore malformed local cache and proceed.
        }
      }

      setEditing(false);
      fetchClinicalData();

      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      console.error("Profile update failed:", err);
      alert(err.response?.data?.message || "Update failed. Check console for details.");
    } finally {
      setSaving(false);
    }

  if (loading || !profile) {
      return (
          <div className="patient-profile-page-wrapper">
              <div className="profile-container py-4 px-3 px-md-5">
                  <div className="skeleton-hero skeleton-box" />
                  <div className="profile-body-grid mb-4">
                      <div className="skeleton-card skeleton-box" />
                      <div className="skeleton-card skeleton-box" />
                  </div>
                  <div className="row g-4 mb-4">
                      <div className="col-md-4"><div className="skeleton-mini skeleton-box" /></div>
                      <div className="col-md-4"><div className="skeleton-mini skeleton-box" /></div>
                      <div className="col-md-4"><div className="skeleton-mini skeleton-box" /></div>
                  </div>
              </div>
          </div>
      );
  }

  // Using shared formatDate from utils/time

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    try { return calculateAgeIST(dob); } catch { return "N/A"; }
  };

  const calculateBMI = (weight, height) => {
    if (!weight || !height || isNaN(weight) || isNaN(height)) return "N/A";
    try {
      const heightMeters = Number(height) / 100;
      const weightNum = Number(weight);
      if (heightMeters <= 0) return "N/A";
      return (weightNum / (heightMeters * heightMeters)).toFixed(1);
    } catch { return "N/A"; }
  };

  const age = calculateAge(profile?.date_of_birth);
  const bmi = calculateBMI(profile?.weight_kg, profile?.height_cm);
  const bmiNumber = parseFloat(bmi);
  const hasValidBmi = !isNaN(bmiNumber) && isFinite(bmiNumber);

  const bmiMeta = (() => {
    if (!hasValidBmi) return { label: "Not Set", tone: "neutral", score: 0 };
    if (bmiNumber < 18.5) return { label: "Underweight", tone: "low", score: 25 };
    if (bmiNumber < 25) return { label: "Healthy", tone: "healthy", score: 50 };
    if (bmiNumber < 30) return { label: "Overweight", tone: "elevated", score: 75 };
    return { label: "Obese", tone: "critical", score: 100 };
  })();

  const timelineEntries = (clinicalData?.timeline || []).slice(0, 5);

  const normalizeSeverity = (rawValue, fallback = "severe") => {
    const value = String(rawValue ?? fallback).trim().toLowerCase();
    if (value === "critical" || value === "high") return "critical";
    if (value === "active") return "active";
    if (value === "moderate" || value === "medium") return "moderate";
    if (value === "mild" || value === "low") return "active";
    return "severe";
  };

  const conditionItems = [
    ...(clinicalData?.conditions || []).map((c) => ({
      name: c.condition_name || "Unknown Condition",
      severity: normalizeSeverity(c.status, "active"),
      kind: "condition",
      status: String(c.status || "active").toLowerCase() === "resolved" ? "Resolved" : "Active",
      updatedAt: c.updated_at || c.created_at,
    })),
    ...(clinicalData?.allergies || []).map((a) => ({
      name: a.allergy_name || "Unknown Allergy",
      severity: normalizeSeverity(a.severity, "severe"),
      kind: "allergy",
      status: "Active",
      updatedAt: a.updated_at || a.created_at,
    })),
  ];

  const visibleConditions = showAllConditions ? conditionItems : conditionItems.slice(0, 5);
  const activeCount = conditionItems.filter((item) => item.severity === "active").length;
  const severeCount = conditionItems.filter((item) => item.severity === "severe").length;

  const getTimelineIcon = (reason = "") => {
    const normalized = String(reason || "").toLowerCase();
    if (normalized.includes("video") || normalized.includes("consult")) return <Video size={14} />;
    if (normalized.includes("prescription") || normalized.includes("med")) return <FileText size={14} />;
    return <Stethoscope size={14} />;
  };

  const timelineStatus = (rawStatus = "") => {
    const value = String(rawStatus || "").toLowerCase();
    if (value === "upcoming" || value === "scheduled") return "upcoming";
    if (value === "cancelled" || value === "canceled") return "cancelled";
    return "completed";
  };

  return (
    <div className="patient-profile-page-wrapper">
      <div className="profile-dashboard-container">
        {/* HEADER ACTIONS */}
          <div>
            <h1 className="h4 fw-800 text-dark mb-1">Patient Health Dashboard</h1>
            <p className="text-muted small mb-0">Manage your clinical records and personal health telemetry</p>
          </div>

        {!editing ? (
          <>
            {/* HERO PROFILE SECTION */}
            <div className="hero-profile-section">
              <div className="hero-avatar-area">
                <div className="hero-avatar-frame">
                  {profile.profile_image ? (
                    <img src={toAssetUrl(profile.profile_image)} alt={profile.full_name} />
                  ) : (
                    <div className="avatar-placeholder-icon"><User size={64} /></div>
                  )}
                </div>
                <div className="edit-photo-overlay" onClick={startEditing}>
                  <Edit2 size={18} />
                </div>
              </div>

              <div className="hero-info-area">
                <div className="hero-name-row">
                  <h2 className="hero-name">{profile.full_name}</h2>
                </div>
                <div className="hero-demographics">
                  <span className="demo-item"><User size={14} /> {profile.gender || "Not Specified"}</span>
                  <span className="demo-item"><Calendar size={14} /> {profile.date_of_birth} ({age} yrs)</span>
                  <span className="demo-item"><MapPin size={14} /> {profile.city || "Kollam"}, {profile.state || "Kerala"}</span>
                  <span className="demo-item"><Phone size={14} /> {profile.phone}</span>
                </div>

                <div className="mini-vitals-row">
                  <div className="vital-stat-chip">
                    <span className="vital-stat-label">BMI</span>
                    <span className="vital-stat-value">{hasValidBmi ? bmi : "—"} <span className={`text-${bmiMeta.tone}`}>{bmiMeta.label}</span></span>
                  </div>
                  <div className="vital-stat-chip">
                    <span className="vital-stat-label">Weight</span>
                    <span className="vital-stat-value">{profile.weight_kg || "—"} <span>kg</span></span>
                  </div>
                  <div className="vital-stat-chip">
                    <span className="vital-stat-label">Height</span>
                    <span className="vital-stat-value">{profile.height_cm || "—"} <span>cm</span></span>
                  </div>
                  <div className="vital-stat-chip">
                    <span className="vital-stat-label">Blood</span>
                    <span className="vital-stat-value">{profile.blood_group || "—"}</span>
                  </div>
                </div>
              </div>

              <div className="hero-actions-area">
                <div className="action-buttons-stack">
                  <button onClick={startEditing} className="btn-premium-action btn-primary-blue">
                    <Edit2 size={16} /> Edit Profile
                  </button>
                  <button onClick={() => navigate('/patient/medical-records')} className="btn-premium-action btn-outline-soft">
                    <FileText size={16} /> View Medical Records
                  </button>
                </div>

                <div className="medical-badges-area">
                  <div className="tag-group">
                    <span className="badge-group-label">Known Allergies</span>
                    <div className="badge-pill-stack">
                      {(clinicalData?.allergies || []).slice(0, 3).map((a, i) => (
                        <span key={i} className="premium-pill pill-allergy">{a.allergy_name}</span>
                      ))}
                      {(clinicalData?.allergies || []).length === 0 && <span className="text-muted small">None reported</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DASHBOARD GRID */}
            <div className="profile-main-grid">
              {/* MAIN CONTENT (LEFT) */}
              <div className="profile-main-content">
                
                {/* CONDITIONS LOG */}
                <div className="modern-card">
                  <div className="card-header-row">
                    <div className="card-title-wrap">
                      <div className="card-icon-box"><Activity size={20} /></div>
                      <div>
                        <h3 className="card-title">Conditions Log</h3>
                        <p className="card-subtitle">Active and monitored medical conditions</p>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2 small fw-bold">{activeCount} Active</span>
                      <span className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-3 py-2 small fw-bold">{severeCount} Severe</span>
                    </div>
                  </div>

                  <div className="conditions-interactive-grid">
                    {conditionItems.map((item, i) => (
                      <div key={i} className={`condition-card-premium ${item.severity}`}>
                        <div className="cond-top-line">
                          <h4 className="cond-name">{item.name}</h4>
                          <span className={`cond-status-badge badge-${item.severity === "active" ? "active" : "severe"}`}>{item.severity}</span>
                        </div>
                        <div className="cond-meta-grid">
                          <div className="meta-item">
                            <span className="meta-label">Status</span>
                            <span className="meta-val">{item.status}</span>
                          </div>
                          <div className="meta-item">
                            <span className="meta-label">Updated</span>
                            <span className="meta-val">{formatDate(item.updatedAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {conditionItems.length === 0 && <p className="text-muted py-4 text-center grid-column-span-2">No active conditions found.</p>}
                  </div>
                </div>

                {/* TIMELINE SECTION */}
                <div className="modern-card">
                  <div className="card-header-row">
                    <div className="card-title-wrap">
                      <div className="card-icon-box"><Calendar size={20} /></div>
                      <div>
                        <h3 className="card-title">Medical Timeline</h3>
                        <p className="card-subtitle">Recent visits and activity history</p>
                      </div>
                    </div>
                  </div>

                  <div className="compact-timeline-feed">
                    {timelineEntries.map((appt, i) => {
                      const status = timelineStatus(appt.status);
                      return (
                        <div key={i} className={`timeline-item-minimal ${status}`}>
                          <div className="timeline-marker-dot" />
                          <div className="timeline-card-soft">
                            <div className="tl-info">
                              <span className="tl-type">Appointment</span>
                              <h4 className="tl-reason">{appt.reason || "General Consultation"}</h4>
                              <span className="tl-doctor">Dr. {appt.doctor_name || "Specialist"}</span>
                            </div>
                            <div className="tl-date-wrap">
                              <div className="tl-date">{formatDate(appt.appointment_date)}</div>
                              <span className={`tl-status ${status}`}>{status}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {timelineEntries.length === 0 && <p className="text-muted py-3">No recent activity recorded.</p>}
                  </div>
                </div>

                {/* CONTACT DETAILS CARD */}
                <div className="modern-card">
                  <div className="card-header-row">
                    <div className="card-title-wrap">
                      <div className="card-icon-box"><MapPin size={20} /></div>
                      <div>
                        <h3 className="card-title">Contact Information</h3>
                        <p className="card-subtitle">Personal communication details</p>
                      </div>
                    </div>
                  </div>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="p-3 rounded-4 bg-light bg-opacity-50">
                        <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Primary Email</label>
                        <span className="fw-bold d-block">{profile.email || "Not provided"}</span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 rounded-4 bg-light bg-opacity-50">
                        <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Phone Number</label>
                        <span className="fw-bold d-block">{profile.phone || "Not provided"}</span>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="p-3 rounded-4 bg-light bg-opacity-50">
                        <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Permanent Address</label>
                        <span className="fw-bold d-block">{profile.address || "Not provided"}</span>
                        <span className="text-muted small mt-1 d-block">
                          {[profile.city, profile.state, profile.country].filter(Boolean).join(", ")} {profile.pincode ? ` - ${profile.pincode}` : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SIDEBAR (RIGHT) */}
              <div className="profile-sidebar-area">
                {/* HEALTH SCORE WIDGET */}
                <div className="health-score-widget">
                  <span className="score-label">Overall Health Score</span>
                  <div className="score-circle-wrap">
                    <span className="score-val">84</span>
                  </div>
                  <p className="small text-white opacity-75 mb-0">Based on recent vitals and compliance</p>
                </div>

                {/* QUICK SUMMARY LIST */}
                <div className="modern-card">
                  <h4 className="fw-800 small text-uppercase mb-4">Quick Summary</h4>
                  <div className="quick-summary-list">
                    <div className="summary-item">
                      <div className="summary-icon"><Activity size={18} /></div>
                      <div className="summary-details">
                        <span className="summary-label">Active Conditions</span>
                        <span className="summary-val">{activeCount} Conditions</span>
                      </div>
                    </div>
                    <div className="summary-item">
                      <div className="summary-icon"><Heart size={18} /></div>
                      <div className="summary-details">
                        <span className="summary-label">Allergies Reported</span>
                        <span className="summary-val">{(clinicalData?.allergies || []).length} Reported</span>
                      </div>
                    </div>
                    <div className="summary-item">
                      <div className="summary-icon"><Calendar size={18} /></div>
                      <div className="summary-details">
                        <span className="summary-label">Next Visit</span>
                        <span className="summary-val">May 15, 2026</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* EMERGENCY CONTACT PREMIUM */}
                <div className="emergency-contact-premium">
                  <div className="em-header">
                    <div className="em-identity">
                      <div className="em-avatar"><User size={24} /></div>
                      <div className="em-name-wrap">
                        <span className="em-relation">Primary Contact</span>
                        <span className="em-name">{emergencyContacts.find(c => c.is_primary)?.contact_name || "None Set"}</span>
                      </div>
                    </div>
                    <div className="em-actions">
                      <button className="btn-em-action"><Phone size={16} /></button>
                      <button className="btn-em-action"><MessageCircle size={16} /></button>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-top border-danger border-opacity-10">
                    <p className="small text-danger fw-600 mb-0 d-flex align-items-center gap-2">
                      <ShieldAlert size={14} /> Quick-access emergency protocol
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="edit-profile-form-container">
            <div className="modern-card edit-profile-card">
              <div className="edit-card-header">
                <div className="card-icon-box bg-primary bg-opacity-10 text-primary"><Edit2 size={20} /></div>
                <div>
                  <h2 className="edit-card-title">Update Medical Profile</h2>
                  <p className="edit-card-subtitle">Keep your clinical and contact information accurate</p>
                </div>
              </div>

              <div className="edit-card-body">
                {/* PROFILE IMAGE SECTION */}
                <div className="profile-image-edit-section">
                  <div className="edit-avatar-container">
                    <div className="edit-avatar-frame">
                      {profileImage ? (
                        <img src={URL.createObjectURL(profileImage)} alt="Preview" />
                      ) : profile.profile_image ? (
                        <img src={toAssetUrl(profile.profile_image)} alt="Profile" />
                      ) : (
                        <div className="avatar-placeholder-icon"><User size={48} /></div>
                      )}
                      <div className="avatar-upload-overlay" onClick={() => document.getElementById('profile-image-input').click()}>
                        <Plus size={24} />
                      </div>
                    </div>
                    <input
                      id="profile-image-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                    <div className="avatar-edit-label">
                      <span className="fw-800 small text-uppercase">Profile Photo</span>
                      <p className="text-muted extra-small mb-0">JPG or PNG, Max 2MB</p>
                    </div>
                  </div>
                </div>

                <div className="row g-4">
                  {/* BASIC INFORMATION */}
                  <div className="col-12"><div className="form-section-divider"><span>Basic Information</span></div></div>
                  
                  <div className="col-md-6">
                    <FG label="Full Name" required>
                      <input className="nn-input" name="full_name" value={profile.full_name} onChange={handleChange} placeholder="John Doe" />
                    </FG>
                  </div>
                  
                  <div className="col-md-3">
                    <FG label="Date of Birth" icon={<Calendar size={12} />} required>
                      <input type="date" className="nn-input" name="date_of_birth" value={profile.date_of_birth} onChange={handleChange} />
                    </FG>
                  </div>

                  <div className="col-md-3">
                    <FG label="Gender" required>
                      <select className="nn-select" name="gender" value={profile.gender} onChange={handleChange}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </FG>
                  </div>

                  <div className="col-md-3">
                    <FG label="Blood Group">
                      <select className="nn-select" name="blood_group" value={profile.blood_group} onChange={handleChange}>
                        <option value="">Select</option>
                        {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                      </select>
                    </FG>
                  </div>

                  <div className="col-md-3">
                    <FG label="Height (cm)" icon={<Scale size={12} />}>
                      <input type="number" className="nn-input" name="height_cm" value={profile.height_cm} onChange={handleChange} placeholder="175" />
                    </FG>
                  </div>

                  <div className="col-md-3">
                    <FG label="Weight (kg)" icon={<Weight size={12} />}>
                      <input type="number" className="nn-input" name="weight_kg" value={profile.weight_kg} onChange={handleChange} placeholder="70" />
                    </FG>
                  </div>

                  <div className="col-md-3">
                    <FG label="Phone Number" icon={<Phone size={12} />} required>
                      <input className="nn-input" name="phone" value={profile.phone} onChange={handleChange} placeholder="+91 0000000000" />
                    </FG>
                  </div>

                  {/* LOCATION DETAILS */}
                  <div className="col-12 mt-5"><div className="form-section-divider"><span>Location Details</span></div></div>
                  
                  <div className="col-12">
                    <FG label="Full Address" icon={<MapPin size={12} />}>
                      <input className="nn-input" name="address" value={profile.address} onChange={handleChange} placeholder="Street name, Building No." />
                    </FG>
                  </div>

                  <div className="col-md-3">
                    <FG label="Country">
                      <select className="nn-select" name="country" value={profile.country} onChange={handleChange}>
                        <option value="">Select Country</option>
                        {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </FG>
                  </div>

                  <div className="col-md-3">
                    <FG label="State">
                      <select className="nn-select" name="state" value={profile.state} onChange={handleChange}>
                        <option value="">Select State</option>
                        {states.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </FG>
                  </div>

                  <div className="col-md-3">
                    <FG label="City">
                      <input className="nn-input" name="city" value={profile.city} onChange={handleChange} placeholder="City" />
                    </FG>
                  </div>

                  <div className="col-md-3">
                    <FG label="Pincode">
                      <input className="nn-input" name="pincode" value={profile.pincode} onChange={handleChange} placeholder="000000" />
                    </FG>
                  </div>

                  {/* EMERGENCY CONTACTS */}
                  <div className="col-12 mt-5">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="form-section-divider flex-grow-1"><span>Emergency Contacts</span></div>
                      <button className="btn btn-outline-primary btn-sm rounded-pill px-3 ms-3" onClick={addNewContact}><Plus size={16} /> Add Contact</button>
                    </div>
                  </div>

                  {emergencyContacts.map((contact, index) => (
                    <div key={index} className="col-12">
                      <div className="emergency-contact-edit-card">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div className="d-flex align-items-center gap-2">
                            <div className="contact-number-badge">{index + 1}</div>
                            <span className="fw-800 small text-uppercase text-muted">Emergency Contact</span>
                          </div>
                          <button className="btn btn-link text-danger p-0" onClick={() => removeContact(index)}><Trash2 size={18} /></button>
                        </div>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <FG label="Full Name">
                              <input className="nn-input-sm" name="contact_name" value={contact.contact_name} onChange={(e) => handleEmergencyChange(index, e)} />
                            </FG>
                          </div>
                          <div className="col-md-6">
                            <FG label="Relationship">
                              <input className="nn-input-sm" name="relationship" value={contact.relationship} onChange={(e) => handleEmergencyChange(index, e)} />
                            </FG>
                          </div>
                          <div className="col-md-6">
                            <FG label="Phone">
                              <input className="nn-input-sm" name="phone" value={contact.phone} onChange={(e) => handleEmergencyChange(index, e)} />
                            </FG>
                          </div>
                          <div className="col-md-6">
                            <FG label="Email">
                              <input className="nn-input-sm" name="email" value={contact.email} onChange={(e) => handleEmergencyChange(index, e)} />
                            </FG>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* FORM ACTIONS (BOTTOM ONLY) */}
                  <div className="col-12 mt-5 pt-4 border-top">
                    <div className="form-actions-row">
                      <button className="btn-nn-primary d-flex align-items-center gap-2" onClick={handleSave} disabled={saving}>
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            Saving...
                          </>
                        ) : (
                          <>Save Changes</>
                        )}
                      </button>
                      <button className="btn-nn-secondary" onClick={cancelEdit} disabled={saving}>Discard Changes</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

};

export default Profile;
