import { useEffect, useState } from "react";
import axios from "axios";
import { formatDate, calculateAgeIST } from "../../shared/utils/time";
import api from "../../shared/services/api/axios";
import { toAssetUrl } from "../../shared/utils/media";
import { getClinicalSummary } from "../../shared/services/api/profileApi";
import "../../shared/styles/ProfileStyles.css";
import {
  Activity,
  AlertCircle,
  BadgeCheck,
  Building2,
  Calendar,
  CalendarClock,
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Download,
  Droplet,
  Edit2,
  FileHeart,
  FileText,
  Gauge,
  Heart,
  Mail,
  MapPinned,
  Phone,
  Pill,
  Plus,
  QrCode,
  Save,
  Share2,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Trash2,
  TrendingUp,
  User,
  X,
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

const calculateBMI = (weight, height) => {
  if (!weight || !height) return "N/A";
  const h = Number(height) / 100;
  if (!h) return "N/A";
  return (Number(weight) / (h * h)).toFixed(1);
};

const getConditionTone = (item = {}) => {
  const value = `${item.severity || item.status || item.type || ""}`.toLowerCase();
  if (value.includes("severe") || value.includes("critical") || value.includes("allergy")) return "critical";
  if (value.includes("moderate") || value.includes("observation") || value.includes("pending")) return "observation";
  if (value.includes("resolved") || value.includes("stable") || value.includes("completed")) return "resolved";
  return "monitored";
};

const getStatusTone = (status = "") => {
  const value = status.toLowerCase();
  if (value.includes("completed") || value.includes("approved")) return "resolved";
  if (value.includes("reject") || value.includes("cancel")) return "critical";
  if (value.includes("pending") || value.includes("reschedule")) return "observation";
  return "monitored";
};

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [clinicalData, setClinicalData] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [_cities, setCities] = useState([]);
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
      const res = await api.get("/api/profile/emergency-contact/me");
      if (Array.isArray(res.data)) setEmergencyContacts(normalizeEmergencyContacts(res.data));
    } catch {
      console.log("No emergency contacts found");
    }
  };

  const fetchCountries = async () => {
    if (countries.length > 0) return;
    try {
      const res = await axios.get("https://countriesnow.space/api/v0.1/countries/positions");
      setCountries(res.data.data.map((country) => country.name));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStates = async (country) => {
    try {
      const res = await axios.post("https://countriesnow.space/api/v0.1/countries/states", { country });
      setStates(res.data.data.states.map((state) => state.name));
    } catch {
      setStates([]);
    }
  };

  const fetchCities = async (country, state) => {
    try {
      const res = await axios.post("https://countriesnow.space/api/v0.1/countries/state/cities", { country, state });
      setCities(res.data.data);
    } catch {
      setCities([]);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchClinicalData(), fetchEmergencyContact()]);
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
    if (e.target.files?.[0]) setProfileImage(e.target.files[0]);
  };

  const handleEmergencyChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const updatedContacts = [...emergencyContacts];
    if (name === "is_primary" && checked) {
      updatedContacts.forEach((contact) => {
        contact.is_primary = false;
      });
    }
    updatedContacts[index][name] = type === "checkbox" ? checked : value;
    setEmergencyContacts(updatedContacts);
  };

  const addNewContact = () =>
    setEmergencyContacts([
      ...emergencyContacts,
      { contact_name: "", relationship: "", phone: "", alternate_phone: "", email: "", is_primary: false },
    ]);

  const removeContact = (index) => setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));

  const startEditing = () => {
    fetchCountries();
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
      Object.keys(profile).forEach((key) => {
        formData.append(key, profile[key] ?? "");
      });
      if (profileImage) formData.append("profile_image", profileImage);

      await api.put("/api/profile/me", formData, { headers: { "Content-Type": "multipart/form-data" } });
      await api.put("/api/profile/emergency-contact/me", emergencyContacts.filter((contact) => contact.contact_name));

      setEditing(false);
      await fetchClinicalData();
      await fetchEmergencyContact();
    } catch (err) {
      console.error("Profile update failed:", err);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await api.post("/api/patient/settings/export-report", {}, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `NeuroNest_Medical_Report_${profile.full_name.replace(/\s+/g, "_")}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Report download failed:", error);
      alert("Failed to generate report. Please try again later.");
    }
  };

  if (loading || !profile) {
    return (
      <div className="patient-profile-page-wrapper">
        <div className="profile-loading-card">Loading patient profile...</div>
      </div>
    );
  }

  const age = calculateAgeIST(profile?.date_of_birth);
  const bmi = calculateBMI(profile?.weight_kg, profile?.height_cm);
  const patientId = clinicalData?.identity?.id || "2026-0142";
  const conditionItems = [
    ...(clinicalData?.conditions || []).map((condition) => ({ ...condition, type: "condition" })),
    ...(clinicalData?.allergies || []).map((allergy) => ({ ...allergy, type: "allergy" })),
  ];
  const primaryEmergency = emergencyContacts.find((contact) => contact.is_primary) || emergencyContacts[0];
  const timeline = clinicalData?.timeline || [];
  const lastVisit = [...timeline].filter((item) => item.appointment_date).sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date))[0];
  const nextAppointment = [...timeline].filter((item) => item.appointment_date && new Date(item.appointment_date) >= new Date()).sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))[0];
  const groupedTimeline = timeline.reduce((acc, curr) => {
    const month = new Date(curr.appointment_date).toLocaleString("default", { month: "long", year: "numeric" });
    if (!acc[month]) acc[month] = [];
    acc[month].push(curr);
    return acc;
  }, {});
  const quickStats = [
    { label: "Active Conditions", value: clinicalData?.conditions?.length || 0, icon: Activity, tone: "blue" },
    { label: "Appointments", value: timeline.length, icon: CalendarClock, tone: "green" },
    { label: "Medications", value: clinicalData?.medications?.length || 0, icon: Pill, tone: "indigo" },
    { label: "Allergies", value: clinicalData?.allergies?.length || 0, icon: AlertCircle, tone: "red" },
    { label: "Emergency", value: emergencyContacts.length, icon: ShieldAlert, tone: "amber" },
    { label: "Insurance", value: "Active", icon: Building2, tone: "cyan" },
  ];

  return (
    <div className="patient-profile-page-wrapper">
      <div className="profile-dashboard-container">
        <header className="profile-hero-section">
          <div className="hero-profile-cluster">
            <div className="hero-avatar-wrapper">
              <div className="hero-avatar-frame">
                {profile.profile_image ? (
                  <img src={toAssetUrl(profile.profile_image)} alt={profile.full_name} />
                ) : (
                  <div className="hero-avatar-placeholder">
                    <User size={52} />
                  </div>
                )}
              </div>
              <span className="verified-dot" title="Verified patient">
                <BadgeCheck size={15} />
              </span>
              <label className="camera-overlay" aria-label="Update profile image">
                <Camera size={18} />
                <input type="file" hidden onChange={handleImageChange} />
              </label>
            </div>

            <div className="hero-identity-block">
              <div className="hero-eyebrow">
                <Sparkles size={14} /> Patient Summary
              </div>
              <h1 className="hero-name">{profile.full_name || "Patient"}</h1>
              <div className="hero-patient-id">Patient ID: NN-{patientId}</div>
              <div className="hero-meta-row">
                <span className="hero-meta-item"><User size={16} /> {profile.gender || "Gender not set"}</span>
                <span className="hero-meta-item"><Calendar size={16} /> {age || "N/A"} Years</span>
                <span className="hero-meta-item"><Droplet size={16} /> {profile.blood_group || "N/A"}</span>
                <span className="hero-meta-item"><Phone size={16} /> {profile.phone || "Phone not set"}</span>
                <span className="hero-meta-item"><Mail size={16} /> {profile.email || "Email not set"}</span>
                <span className="hero-meta-item"><MapPinned size={16} /> {profile.city || profile.state || "Location not set"}</span>
              </div>
              <div className="hero-visit-strip">
                <span>Last visit: {lastVisit ? formatDate(lastVisit.appointment_date) : "No visits yet"}</span>
                <span>Emergency: {primaryEmergency ? "Configured" : "Needs setup"}</span>
                <span>Insurance: Active</span>
              </div>
              <div className="hero-stats-chips">
                <div className="stat-chip">
                  <span className="stat-chip-label">BMI Index</span>
                  <span className="stat-chip-value">{bmi}</span>
                  <div className="bmi-bar-bg">
                    <div className="bmi-bar-fill"></div>
                    <div className="bmi-pointer" style={{ left: `${bmi === "N/A" ? 0 : Math.min(Math.max(((bmi - 15) / 20) * 100, 0), 100)}%` }}></div>
                  </div>
                </div>
                <div className="stat-chip"><span className="stat-chip-label">Weight</span><span className="stat-chip-value">{profile.weight_kg || "N/A"}<span className="stat-chip-unit">kg</span></span></div>
                <div className="stat-chip"><span className="stat-chip-label">Height</span><span className="stat-chip-value">{profile.height_cm || "N/A"}<span className="stat-chip-unit">cm</span></span></div>
                <div className="stat-chip"><span className="stat-chip-label">Blood Group</span><span className="stat-chip-value">{profile.blood_group || "N/A"}</span></div>
              </div>
            </div>
          </div>

          <div className="hero-actions-panel">
            {!editing ? (
              <div className="hero-action-buttons">
                <button onClick={startEditing} className="btn-premium-action btn-premium-primary"><Edit2 size={18} /> Edit Profile</button>
                <button onClick={handleDownloadReport} className="btn-premium-action"><Download size={18} /> Download Records</button>
                <button className="btn-premium-action icon-only" aria-label="Share medical summary"><Share2 size={18} /></button>
                <button className="btn-premium-action icon-only" aria-label="Open QR medical access"><QrCode size={18} /></button>
              </div>
            ) : (
              <div className="hero-action-buttons">
                <button onClick={handleSave} className="btn-premium-action btn-premium-primary"><Save size={18} /> Save Changes</button>
                <button onClick={cancelEdit} className="btn-premium-action"><X size={18} /> Cancel</button>
              </div>
            )}
            <div className="hero-health-compact">
              <div className="hero-score-mini" style={{ "--score": 88 }}><span>88</span></div>
              <div><strong>Low Risk</strong><span>Health score stable</span></div>
            </div>
            <div className="medical-tags-row">
              {(clinicalData?.allergies || []).slice(0, 2).map((allergy, i) => <span key={`a-${i}`} className="medical-tag tag-allergy"><AlertCircle size={14} /> {allergy.allergy_name}</span>)}
              {(clinicalData?.conditions || []).filter((condition) => condition.status === "active").slice(0, 2).map((condition, i) => <span key={`c-${i}`} className="medical-tag tag-condition"><Heart size={14} /> {condition.condition_name}</span>)}
              <span className="medical-tag tag-safe"><ShieldAlert size={14} /> No critical risks</span>
            </div>
          </div>
        </header>

        {editing ? (
          <div className="edit-dashboard-grid">
            <h2 className="section-edit-title">Update Clinical Identity</h2>
            <div className="form-grid-layout">
              <div className="form-group-custom"><label>Full Name</label><input name="full_name" value={profile.full_name} onChange={handleChange} /></div>
              <div className="form-group-custom"><label>Gender</label><select name="gender" value={profile.gender} onChange={handleChange}><option>Male</option><option>Female</option><option>Other</option></select></div>
              <div className="form-group-custom"><label>Date of Birth</label><input type="date" name="date_of_birth" value={profile.date_of_birth} onChange={handleChange} /></div>
              <div className="form-group-custom"><label>Blood Group</label><select name="blood_group" value={profile.blood_group} onChange={handleChange}>{["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => <option key={bg} value={bg}>{bg}</option>)}</select></div>
              <div className="form-group-custom"><label>Height (cm)</label><input type="number" name="height_cm" value={profile.height_cm} onChange={handleChange} /></div>
              <div className="form-group-custom"><label>Weight (kg)</label><input type="number" name="weight_kg" value={profile.weight_kg} onChange={handleChange} /></div>
              <div className="form-group-full form-group-custom"><label>Permanent Address</label><input name="address" value={profile.address} onChange={handleChange} /></div>
              <div className="form-group-custom"><label>Country</label><select name="country" value={profile.country} onChange={handleChange}>{countries.map((country) => <option key={country} value={country}>{country}</option>)}</select></div>
              <div className="form-group-custom"><label>State</label><input name="state" value={profile.state} onChange={handleChange} /></div>
              <div className="form-group-custom"><label>City</label><input name="city" value={profile.city} onChange={handleChange} /></div>
              <div className="form-group-custom"><label>Pincode</label><input name="pincode" value={profile.pincode} onChange={handleChange} /></div>
            </div>

            <h2 className="section-edit-title">Emergency Contact Management</h2>
            {emergencyContacts.map((contact, index) => (
              <div key={contact.id || index} className="dashboard-section-card edit-contact-card">
                <div className="form-grid-layout">
                  <div className="form-group-custom"><label>Contact Name</label><input name="contact_name" value={contact.contact_name} onChange={(e) => handleEmergencyChange(index, e)} /></div>
                  <div className="form-group-custom"><label>Relationship</label><input name="relationship" value={contact.relationship} onChange={(e) => handleEmergencyChange(index, e)} /></div>
                  <div className="form-group-custom"><label>Phone</label><input name="phone" value={contact.phone} onChange={(e) => handleEmergencyChange(index, e)} /></div>
                  <div className="form-group-custom form-check-row"><label><input type="checkbox" name="is_primary" checked={contact.is_primary} onChange={(e) => handleEmergencyChange(index, e)} /> Primary contact</label></div>
                  <div className="form-group-custom"><button className="btn-premium-action danger-action" onClick={() => removeContact(index)}><Trash2 size={18} /> Remove Contact</button></div>
                </div>
              </div>
            ))}
            <button className="btn-premium-action add-contact-action" onClick={addNewContact}><Plus size={20} /> Add Emergency Contact</button>
            <div className="form-actions-dashboard">
              <button onClick={cancelEdit} className="btn-premium-action">Discard Changes</button>
              <button onClick={handleSave} className="btn-premium-action btn-premium-primary">Save Clinical Profile</button>
            </div>
          </div>
        ) : (
          <div className="profile-main-grid">
            <div className="profile-left-col">
              <section className="dashboard-section-card">
                <div className="card-header-flex">
                  <div className="card-title-group">
                    <div className="card-icon-box"><Activity size={22} /></div>
                    <h2 className="card-title">Clinical Conditions</h2>
                  </div>
                  <div className="condition-filter-row" aria-label="Condition filters">
                    <button className="filter-chip active">All</button>
                    <button className="filter-chip">Monitored</button>
                    <button className="filter-chip">Critical</button>
                  </div>
                  <button className="btn-premium-action" onClick={() => setShowAllConditions(!showAllConditions)}>
                    {showAllConditions ? "Collapse" : "View Full History"}
                  </button>
                </div>

                <div className="conditions-list">
                  {(showAllConditions ? conditionItems : conditionItems.slice(0, 4)).map((item, i) => {
                    const tone = getConditionTone(item);
                    return (
                      <details key={i} className={`medical-condition-card card-${tone}`}>
                        <summary>
                          <span className="condition-pulse"></span>
                          <span className="condition-title-wrap">
                            <strong>{item.condition_name || item.allergy_name}</strong>
                            <small>{item.type === "allergy" ? "Allergy record" : "Clinical condition"}</small>
                          </span>
                          <span className={`severity-badge badge-${tone}`}>{item.severity || item.status || "Monitored"}</span>
                          <ChevronRight size={18} className="summary-chevron" />
                        </summary>
                        <div className="condition-detail-grid">
                          <span><CalendarClock size={15} /> Diagnosed {formatDate(item.created_at)}</span>
                          <span><Stethoscope size={15} /> Dr. Specialist</span>
                          <span><FileHeart size={15} /> Treatment: Active follow-up</span>
                          <span><Activity size={15} /> Status: {item.status || "Monitoring"}</span>
                        </div>
                      </details>
                    );
                  })}
                  {conditionItems.length === 0 && <div className="empty-widget-text">No medical conditions recorded.</div>}
                </div>
              </section>

              <section className="dashboard-section-card">
                <div className="card-header-flex">
                  <div className="card-title-group">
                    <div className="card-icon-box"><TrendingUp size={22} /></div>
                    <h2 className="card-title">Medical Activity Timeline</h2>
                  </div>
                </div>

                <div className="compact-activity-feed">
                  {Object.entries(groupedTimeline).length > 0 ? Object.entries(groupedTimeline).map(([month, activities]) => (
                    <div key={month} className="timeline-month-group">
                      <div className="timeline-month-divider"><span>{month}</span></div>
                      {activities.map((appt, idx) => {
                        const tone = getStatusTone(appt.status);
                        return (
                          <details key={idx} className="timeline-item">
                            <summary>
                              <div className={`timeline-point ${tone}`}><ClipboardList size={15} /></div>
                              <div className="timeline-content">
                                <div className="timeline-header">
                                  <span className="timeline-title">{appt.reason || "Clinical Consultation"}</span>
                                  <span className="timeline-time">{formatDate(appt.appointment_date)}</span>
                                </div>
                                <div className="timeline-doctor">Dr. {appt.doctor_name} · <span className={`status-text ${tone}`}>{appt.status}</span></div>
                              </div>
                              <ChevronRight size={18} className="summary-chevron" />
                            </summary>
                            <p>Clinical event reviewed and added to the longitudinal patient history.</p>
                          </details>
                        );
                      })}
                    </div>
                  )) : <div className="empty-widget-text">No recent medical activity.</div>}
                </div>
              </section>
            </div>

            <aside className="profile-right-col">
              <div className="sidebar-sticky">
                <div className="summary-panel-card">
                  <div className="health-score-ring" style={{ "--score": 88 }}><span className="health-score-value">88</span></div>
                  <div className="score-copy">
                    <h3>Health Vitality Index</h3>
                    <p>Clinical stability is currently within the optimal range.</p>
                    <div className="mini-trend" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>
                  </div>
                  <div className="summary-list">
                    <div className="summary-item"><span className="summary-label">Risk Level</span><span className="summary-value">Low</span></div>
                    <div className="summary-item"><span className="summary-label">Active Conditions</span><span className="summary-value">{clinicalData?.conditions?.length || 0}</span></div>
                    <div className="summary-item"><span className="summary-label">Next Appointment</span><span className="summary-value">{nextAppointment ? formatDate(nextAppointment.appointment_date) : "Not scheduled"}</span></div>
                  </div>
                </div>

                <div className="emergency-card-new">
                  <div className="emergency-header-new"><ShieldAlert size={18} /> Primary Emergency Support</div>
                  {primaryEmergency ? (
                    <>
                      <div className="emergency-contact-box">
                        <div className="emergency-avatar"><User size={24} /></div>
                        <div className="emergency-info"><h4>{primaryEmergency.contact_name}</h4><span>{primaryEmergency.relationship}</span></div>
                      </div>
                      <div className="emergency-actions">
                        <button className="btn-emergency"><Phone size={16} /> Call</button>
                        <button className="btn-emergency"><Mail size={16} /> Message</button>
                      </div>
                    </>
                  ) : <p className="empty-widget-text">No emergency contact configured.</p>}
                </div>

                <div className="sidebar-widget quick-stats-widget">
                  <div className="widget-title"><Gauge size={18} /> Quick Stats</div>
                  <div className="quick-stat-grid">
                    {quickStats.map(({ label, value, icon: Icon, tone }) => (
                      <div className={`quick-stat-card tone-${tone}`} key={label}>
                        <Icon size={17} />
                        <span>{label}</span>
                        <strong>{value}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="sidebar-widget">
                  <div className="widget-title"><Pill size={18} /> Medication Summary</div>
                  {(clinicalData?.medications || []).slice(0, 3).map((med, index) => (
                    <div className="medication-row" key={index}><span>{med.drug_name || med.name || "Medication"}</span><strong>{med.status || "Active"}</strong></div>
                  ))}
                  {(clinicalData?.medications || []).length === 0 && <p className="empty-widget-text">No active medication listed.</p>}
                </div>

                <div className="sidebar-widget">
                  <div className="widget-title"><Building2 size={18} /> Insurance</div>
                  <div className="insurance-card"><CheckCircle2 size={18} /><div><strong>HDFC Ergo</strong><span>Policy active · Cashless eligible</span></div></div>
                </div>

                <div className="sidebar-widget">
                  <div className="widget-title"><FileText size={18} /> Contact Summary</div>
                  <div className="contact-line"><span>Email</span><strong>{profile.email || "Not set"}</strong></div>
                  <div className="contact-line"><span>Phone</span><strong>{profile.phone || "Not set"}</strong></div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
