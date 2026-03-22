import { useState, useEffect, useMemo } from "react";
import api from "../../api/axios";
import axios from "axios";
import { toAssetUrl } from "../../utils/media";
import "../../styles/patient-records.css"; // Reuse premium clinical styles
import "../../styles/ProfileStyles.css";
import { getClinicalSummary } from "../../api/profileApi";
import {
  User, Phone, Mail, MapPin, Activity,
  Heart, Calendar, Weight, Edit2,
  Save, Plus, Trash2, ShieldAlert,
  Droplet, Scale, Pill, Video, Stethoscope, FileText, AlertTriangle, ShieldCheck
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
    contact_name: contact.contact_name ?? "",
    relationship: contact.relationship ?? "",
    phone: contact.phone ?? "",
    alternate_phone: contact.alternate_phone ?? "",
    email: contact.email ?? "",
    is_primary: Boolean(contact.is_primary),
  }));

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [clinicalData, setClinicalData] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [_CITIES, setCities] = useState([]);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
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
      const res = await api.get("/profile/emergency-contact/me");
      if (Array.isArray(res.data)) {
        const normalizedContacts = normalizeEmergencyContacts(res.data);
        setEmergencyContacts(normalizedContacts);
      }
    } catch {
      console.log("No emergency contacts found");
    }
  };

  const fetchCountries = async () => {
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
      await Promise.all([fetchClinicalData(), fetchEmergencyContact(), fetchCountries()]);
      setLoading(false);
    };
    init();
  }, []);

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
        updatedContacts.forEach(c => c.is_primary = false);
    }
    updatedContacts[index][name] = type === "checkbox" ? checked : value;
    setEmergencyContacts(updatedContacts);
  };

  const addNewContact = () => setEmergencyContacts([...emergencyContacts, { contact_name: "", relationship: "", phone: "", alternate_phone: "", email: "", is_primary: false }]);
  const removeContact = (index) => setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));

  const startEditing = () => {
    setInitialProfileSnapshot(normalizeProfile(profile));
    setInitialEmergencySnapshot(normalizeEmergencyContacts(emergencyContacts));
    setEditing(true);
  };

  const cancelEdit = () => {
    setProfile(initialProfileSnapshot);
    setEmergencyContacts(initialEmergencySnapshot);
    setEditing(false);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      Object.keys(profile).forEach((key) => { formData.append(key, profile[key] ?? ""); });
      if (profileImage) formData.append("profile_image", profileImage);

      await api.put("/profile/me", formData, { headers: { "Content-Type": "multipart/form-data" } });
      await api.put("/profile/emergency-contact/me", emergencyContacts);

      // Force local storage to reflect new name synchronously
      const userStr = localStorage.getItem('neuronest_user');
      if (userStr && profile.full_name) {
          try {
              const parsedUser = JSON.parse(userStr);
              parsedUser.full_name = profile.full_name;
              localStorage.setItem('neuronest_user', JSON.stringify(parsedUser));
          } catch {
              // Ignore malformed local cache and proceed.
          }
      }

      setEditing(false);
      fetchClinicalData();
      
      // Reload page briefly to refresh global UI context (navbar, layout, etc.)
      setTimeout(() => {
          window.location.reload();
      }, 500);
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  if (loading || !profile) return <div className="loading-spinner">Loading Profile...</div>;

  const calculateAge = (dobString) => {
    if (!dobString || dobString === "N/A") return "N/A";
    const now = new Date();
    const birthDate = new Date(dobString);
    const difference = now.getTime() - birthDate.getTime();
    return Math.abs(new Date(difference).getUTCFullYear() - 1970);
  };

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return "N/A";
    const heightMeters = height / 100;
    return (weight / (heightMeters * heightMeters)).toFixed(1);
  };

  const age = calculateAge(profile.date_of_birth);
  const bmi = calculateBMI(profile.weight_kg, profile.height_cm);
  const bmiNumber = Number(bmi);
  const hasValidBmi = Number.isFinite(bmiNumber);

  const bmiMeta = useMemo(() => {
    if (!hasValidBmi) return { label: "Unknown", tone: "neutral", score: 0 };
    if (bmiNumber < 18.5) return { label: "Underweight", tone: "low", score: 25 };
    if (bmiNumber < 25) return { label: "Healthy", tone: "healthy", score: 50 };
    if (bmiNumber < 30) return { label: "Overweight", tone: "elevated", score: 75 };
    return { label: "Obese", tone: "critical", score: 100 };
  }, [bmiNumber, hasValidBmi]);

  const activeMeds = (clinicalData?.medications || []).filter((m) => m.status === "active");
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
      name: c.condition_name,
      severity: normalizeSeverity(c.status, "active"),
      kind: "condition",
    })),
    ...(clinicalData?.allergies || []).map((a) => ({
      name: a.allergy_name,
      severity: normalizeSeverity(a.severity, "severe"),
      kind: "allergy",
    })),
  ];

  const severityClass = (severity = "") => {
    const value = normalizeSeverity(severity, "severe");
    if (value === "critical") return "severity-critical";
    if (value === "active") return "severity-active";
    if (value === "moderate") return "severity-moderate";
    return "severity-severe";
  };

  const visibleConditions = showAllConditions ? conditionItems : conditionItems.slice(0, 5);
  const activeCount = conditionItems.filter((item) => item.severity === "active").length;
  const severeCount = conditionItems.filter((item) => item.severity === "severe").length;

  const getTimelineIcon = (reason = "") => {
    const normalized = String(reason).toLowerCase();
    if (normalized.includes("video") || normalized.includes("consult")) return <Video size={14} />;
    if (normalized.includes("prescription") || normalized.includes("med")) return <FileText size={14} />;
    return <Stethoscope size={14} />;
  };

  return (
    <div className="patient-profile-page-wrapper">
      <div className="background-decoration">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="profile-container py-4 px-3 px-md-5">
        <div className="d-flex align-items-center justify-content-between mb-4">
            <h1 className="h3 fw-black text-dark mb-0">My Health Profile</h1>
            {!editing ? (
                <button onClick={startEditing} className="btn btn-dark rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2">
                    <Edit2 size={18} /> Edit Profile
                </button>
            ) : (
                <div className="d-flex gap-2">
                    <button onClick={cancelEdit} className="btn btn-light rounded-pill px-4 fw-bold shadow-sm">Cancel</button>
                    <button onClick={handleSave} className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2">
                        <Save size={18} /> Save Changes
                    </button>
                </div>
            )}
        </div>

        {!editing ? (
            <div className="mx-auto" style={{ maxWidth: '1440px' }}>
                <div className="card clinical-panel profile-hero mb-4 border-0 section-animate">
                    <div className="d-flex flex-wrap flex-lg-nowrap gap-4">
                        <div className="d-flex flex-column align-items-center gap-3 pe-lg-3">
                            <div className="patient-img-large overflow-hidden calm-avatar-frame">
                                {profile.profile_image ? (
                                    <img src={toAssetUrl(profile.profile_image)} alt={profile.full_name} className="w-100 h-100 object-fit-cover" />
                                ) : (
                                    <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary"><User size={64} /></div>
                                )}
                            </div>
                            <div className="d-flex gap-2 flex-wrap justify-content-center">
                                <div className="badge rounded-pill warning-chip d-flex align-items-center fw-bold"><AlertTriangle size={12} className="me-1" /> ALCOHOL</div>
                                <div className="badge rounded-pill warning-chip d-flex align-items-center fw-bold"><AlertTriangle size={12} className="me-1" /> SMOKER</div>
                            </div>
                        </div>

                        <div className="flex-grow-1 d-flex flex-column justify-content-between gap-4">
                            <div className="d-flex justify-content-between align-items-start w-100">
                                <div>
                                    <div className="d-flex align-items-center gap-3 mb-2">
                                        <h2 className="fw-black text-dark mb-0 calm-heading" style={{fontSize: '1.7rem'}}>{profile.full_name}</h2>
                                        <div className="d-flex gap-2">
                                            <button className="btn btn-light btn-sm rounded-circle p-2 shadow-sm border border-light d-flex align-items-center justify-content-center calm-icon-btn"><Phone size={14} className="text-secondary"/></button>
                                            <button className="btn btn-light btn-sm rounded-circle p-2 shadow-sm border border-light d-flex align-items-center justify-content-center calm-icon-btn"><Mail size={14} className="text-secondary"/></button>
                                        </div>
                                    </div>
                                    <div className="d-flex flex-wrap gap-4 text-dark fw-bold" style={{fontSize: '0.8rem'}}>
                                        <span className="d-flex align-items-center gap-2"><User size={14} className="text-secondary"/> {profile.gender || 'Not Specified'}</span>
                                        <span className="d-flex align-items-center gap-2"><MapPin size={14} className="text-secondary"/> {profile.city || 'Elshiekh zayed, Giza'}</span>
                                        <span className="d-flex align-items-center gap-2"><Calendar size={14} className="text-secondary"/> {profile.date_of_birth} ({age} years)</span>
                                        <span className="d-flex align-items-center gap-2"><Phone size={14} className="text-secondary"/> {profile.phone}</span>
                                        <span className="d-flex align-items-center gap-2"><Mail size={14} className="text-secondary"/> {profile.email}</span>
                                    </div>
                                </div>
                                <button onClick={startEditing} className="btn rounded-pill px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2 text-white edit-gradient-btn">
                                    <Edit2 size={14} /> Edit
                                </button>
                            </div>

                            <div className="d-flex flex-wrap flex-xl-nowrap justify-content-between align-items-center gap-4">
                                <div className="vitals-glass-grid">
                                    <div className="vitals-stat text-center">
                                        <div className="vitals-icon"><Scale size={16} /></div>
                                        <div className="d-flex align-items-baseline justify-content-center gap-1">
                                            <span className="fw-black text-dark lh-1" style={{fontSize: '1.25rem'}}>{hasValidBmi ? bmi : "N/A"}</span>
                                        </div>
                                        <div className="text-muted fw-bold mt-1 d-flex align-items-center justify-content-center gap-1" style={{fontSize: '0.65rem'}}>BMI</div>
                                        <div className={`bmi-state bmi-${bmiMeta.tone}`}>{bmiMeta.label}</div>
                                        <div className="bmi-progress">
                                            <span style={{ width: `${bmiMeta.score}%` }} />
                                        </div>
                                    </div>
                                    <div className="vitals-stat text-center">
                                        <div className="vitals-icon"><Weight size={16} /></div>
                                        <div className="d-flex align-items-baseline justify-content-center gap-1">
                                            <span className="fw-black text-dark lh-1" style={{fontSize: '1.25rem'}}>{profile.weight_kg || 'N/A'}</span>
                                            <span className="fw-bold text-muted" style={{fontSize: '0.75rem'}}>kg</span>
                                        </div>
                                        <div className="text-muted fw-bold mt-1 d-flex align-items-center justify-content-center gap-1" style={{fontSize: '0.65rem'}}>
                                            Weight
                                        </div>
                                    </div>
                                    <div className="vitals-stat text-center">
                                        <div className="vitals-icon"><Activity size={16} /></div>
                                        <div className="d-flex align-items-baseline justify-content-center gap-1">
                                            <span className="fw-black text-dark lh-1" style={{fontSize: '1.25rem'}}>{profile.height_cm || 'N/A'}</span>
                                            <span className="fw-bold text-muted" style={{fontSize: '0.75rem'}}>Cm</span>
                                        </div>
                                        <div className="text-muted fw-bold mt-1 d-flex align-items-center justify-content-center gap-1" style={{fontSize: '0.65rem'}}>
                                            Height
                                        </div>
                                    </div>
                                    <div className="vitals-stat text-center">
                                        <div className="vitals-icon"><Droplet size={16} /></div>
                                        <div className="d-flex align-items-baseline justify-content-center gap-1">
                                            <span className="fw-black text-dark lh-1" style={{fontSize: '1.25rem'}}>{profile.blood_group || 'N/A'}</span>
                                        </div>
                                        <div className="text-muted fw-bold mt-1 d-flex align-items-center justify-content-center gap-1" style={{fontSize: '0.65rem'}}>
                                            Blood Type
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex flex-column align-items-end gap-3 text-end profile-tags-column">
                                    <div className="d-flex flex-column align-items-end gap-1 w-100">
                                        <span className="text-dark fw-bolder mb-1" style={{fontSize: '0.75rem'}}>Own diagnosis</span>
                                        <div className="d-flex gap-2 flex-wrap justify-content-end">
                                            {(clinicalData?.conditions || []).filter(c => c.status === 'active').slice(0, 2).map((c, i) =>(
                                               <span key={i} className="badge rounded-pill px-3 py-2 fw-bold diagnosis-chip">{c.condition_name}</span>
                                            ))}
                                            {(!clinicalData?.conditions || clinicalData.conditions.length === 0) && <span className="text-muted small">None</span>}
                                        </div>
                                    </div>
                                    <div className="d-flex flex-column align-items-end gap-1 w-100">
                                        <span className="text-dark fw-bolder mb-1" style={{fontSize: '0.75rem'}}>Known Allergies</span>
                                        <div className="d-flex gap-2 flex-wrap justify-content-end">
                                            {(clinicalData?.allergies || []).slice(0, 2).map((a, i) =>(
                                               <span key={i} className="badge rounded-pill px-3 py-2 fw-bold allergy-chip">{a.allergy_name}</span>
                                            ))}
                                            {(!clinicalData?.allergies || clinicalData.allergies.length === 0) && <span className="text-muted small">None</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4 mb-4">
                    <div className="col-12 col-lg-4">
                        <div className="clinical-panel h-100 section-animate">
                            <div className="panel-header">
                                <div className="panel-title"><Calendar size={18} /> Timeline</div>
                                <button className="panel-edit-btn">Edit</button>
                            </div>
                            <div className="pt-2">
                                {timelineEntries.map((appt, i) => {
                                    const dateObj = new Date(appt.appointment_date);
                                    const month = dateObj.toLocaleString('default', { month: 'short' });
                                    const year = dateObj.getFullYear();
                                    return (
                                    <div key={i} className="timeline-row timeline-row-card">
                                        <div className="timeline-left"><span className="timeline-date-pill">{month} {year}</span></div>
                                        <div className="timeline-center"><div className="timeline-marker" style={i === (clinicalData?.timeline?.length || 0) - 1 ? {borderColor: '#2b70ff'} : {}}></div></div>
                                        <div className="timeline-right">
                                            <div className="timeline-kind">{getTimelineIcon(appt.reason)} Appointment</div>
                                            <div className="timeline-title">{appt.reason || 'General Appt'}</div>
                                            <div className="timeline-subtitle">Dr. {appt.doctor_name || 'Specialist'}</div>
                                        </div>
                                    </div>
                                    );
                                })}
                                {(!clinicalData?.timeline || clinicalData.timeline.length === 0) && <div className="text-muted text-center pt-4 fw-bold">No recent history</div>}
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-lg-8">
                        <div className="clinical-panel h-100 section-animate">
                            <div className="panel-header">
                                <div className="panel-title"><ShieldAlert size={18} /> Emergency Support <span className="pulse-dot" /></div>
                                <button className="panel-edit-btn" onClick={startEditing}>Edit</button>
                            </div>
                            <div className="row g-3">
                                {emergencyContacts.map((c, i) => (
                                    <div key={i} className="col-md-6">
                                        <div className={`med-history-box emergency-card ${c.is_primary ? 'is-primary-contact' : ''}`}>
                                            <div className="med-history-header">
                                                <div className="med-history-icon"><Phone size={14} className={c.is_primary ? 'text-primary' : ''}/></div>
                                                <span className="med-history-title">{c.relationship || 'Emergency Contact'} {c.is_primary && '(Primary)'}</span>
                                                <button className="emergency-call-btn" type="button"><Phone size={12} /></button>
                                            </div>
                                            <div className="med-history-data">{c.contact_name}</div>
                                            <div className="text-muted fw-bold mt-1" style={{fontSize: '0.75rem'}}>{c.phone}</div>
                                            <div className="text-muted fw-bold" style={{fontSize: '0.75rem'}}>{c.email}</div>
                                        </div>
                                    </div>
                                ))}
                                {emergencyContacts.length === 0 && <div className="col-12 text-muted fw-bold">No emergency contacts listed</div>}
                                
                                <div className="col-12 mt-4">
                                    <div className="med-history-box">
                                        <div className="med-history-header">
                                            <div className="med-history-icon"><MapPin size={14} /></div>
                                            <span className="med-history-title">Personal Address</span>
                                        </div>
                                        <div className="med-history-data">{profile.address}</div>
                                        <div className="text-muted fw-bold mt-1" style={{fontSize: '0.75rem'}}>{profile.city}, {profile.state}</div>
                                        <div className="text-muted fw-bold" style={{fontSize: '0.75rem'}}>{profile.country} - {profile.pincode}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4 mb-5">
                    <div className="col-12 col-lg-8">
                        <div className="clinical-panel h-100 p-0 overflow-hidden d-flex flex-column section-animate">
                            <div className="panel-header p-4 pb-2 m-0">
                                <div className="panel-title"><Pill size={18} /> Active Medications</div>
                                <button className="panel-edit-btn">Edit</button>
                            </div>
                            <div className="medications-grid p-4 pt-2">
                                {activeMeds.map((med, i) => (
                                    <div key={i} className="medication-card">
                                        <div className="medication-top">
                                            <div className="pill-icon-wrap"><Pill size={16} /></div>
                                            <span className="badge rounded-pill status-chip status-active">ACTIVE</span>
                                        </div>
                                        <div className="medication-name">{med.drug_name}</div>
                                        <div className="medication-meta">{med.dosage || "Dose not set"} · {med.frequency || "Schedule not set"}</div>
                                    </div>
                                ))}
                                {activeMeds.length === 0 && <div className="text-center py-4 fw-bold text-muted">No active medications</div>}
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-lg-4">
                        <div className="clinical-panel h-100 section-animate">
                            <div className="panel-header mb-3">
                                <div className="panel-title"><Activity size={18} /> Conditions Log</div>
                            </div>
                            <div className="conditions-summary">
                                <span className="summary-pill active-pill">{activeCount} Active</span>
                                <span className="summary-pill severe-pill">{severeCount} Severe</span>
                            </div>
                            <div className="d-flex flex-column pt-1">
                                {visibleConditions.map((item, i) => (
                                    <div key={i} className="diet-list-item justify-content-between">
                                        <div className="d-flex align-items-center gap-2">
                                            {item.severity === "active" ? <Heart size={16} className="text-primary" /> : item.severity === "critical" ? <AlertTriangle size={16} className="text-danger" /> : <ShieldCheck size={16} className="text-warning" />}
                                            {item.name}
                                        </div>
                                        <span className={`badge rounded-pill status-chip ${severityClass(item.severity)}`}>{item.severity}</span>
                                    </div>
                                ))}
                                {conditionItems.length > 5 && (
                                    <button
                                        type="button"
                                        onClick={() => setShowAllConditions((prev) => !prev)}
                                        className="conditions-toggle-btn"
                                    >
                                        {showAllConditions ? "Collapse" : "Show all"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            /* EDIT FORM */
            <div className="edit-form-grid">
                <div className="form-section-title"><User size={20} className="text-primary" /> Basic Information</div>
                <div className="form-group">
                    <label>Full Name</label>
                    <input name="full_name" value={profile.full_name} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Profile Picture</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="form-control" />
                </div>
                <div className="form-group">
                    <label>Date of Birth</label>
                    <input type="date" name="date_of_birth" value={profile.date_of_birth} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Gender</label>
                    <select name="gender" value={profile.gender} onChange={handleChange}>
                        <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Blood Group</label>
                    <select name="blood_group" value={profile.blood_group} onChange={handleChange}>
                        {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>Height (cm)</label>
                    <input type="number" name="height_cm" value={profile.height_cm} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Weight (kg)</label>
                    <input type="number" name="weight_kg" value={profile.weight_kg} onChange={handleChange} />
                </div>

                <div className="form-section-title mt-4"><MapPin size={20} className="text-primary" /> Contact Details</div>
                <div className="form-group full-width"><label>Full Address</label><input name="address" value={profile.address} onChange={handleChange} /></div>
                <div className="form-group">
                    <label>Country</label>
                    <select name="country" value={profile.country} onChange={handleChange}>
                        {countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>State</label>
                    <select name="state" value={profile.state} onChange={handleChange}>
                        {states.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>City</label>
                    <input name="city" value={profile.city} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Pincode</label>
                    <input name="pincode" value={profile.pincode} onChange={handleChange} />
                </div>

                <div className="form-section-title mt-4"><ShieldAlert size={20} className="text-danger" /> Emergency Contacts</div>
                <div className="full-width">
                     {emergencyContacts.map((contact, index) => (
                         <div key={index} className="emergency-edit-card mb-3 p-3 border rounded-3 bg-light">
                             <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="fw-bold">Contact #{index + 1}</span>
                                <button className="btn btn-outline-danger btn-sm" onClick={() => removeContact(index)}><Trash2 size={16}/></button>
                             </div>
                             <div className="row g-3">
                                 <div className="col-md-6"><label className="small fw-bold">Name</label><input name="contact_name" value={contact.contact_name} onChange={(e) => handleEmergencyChange(index, e)} className="form-control" /></div>
                                 <div className="col-md-6"><label className="small fw-bold">Relationship</label><input name="relationship" value={contact.relationship} onChange={(e) => handleEmergencyChange(index, e)} className="form-control" /></div>
                                 <div className="col-md-6"><label className="small fw-bold">Phone</label><input name="phone" value={contact.phone} onChange={(e) => handleEmergencyChange(index, e)} className="form-control" /></div>
                                 <div className="col-md-6"><label className="small fw-bold">Email</label><input name="email" value={contact.email} onChange={(e) => handleEmergencyChange(index, e)} className="form-control" /></div>
                             </div>
                         </div>
                     ))}
                     <button className="btn btn-outline-primary w-100 mt-2" onClick={addNewContact}><Plus size={16}/> Add New Contact</button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
