import { useState, useEffect } from "react";
import api from "../../api/axios";
import axios from "axios";
import { toAssetUrl } from "../../utils/media";
import "../../styles/patient-records.css"; // Reuse premium clinical styles
import "../../styles/ProfileStyles.css";
import { getClinicalSummary } from "../../api/profileApi";
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
      updatedContacts.forEach((c) => { c.is_primary = false; });
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

  const bmiMeta = (() => {
    if (!hasValidBmi) return { label: "Unknown", tone: "neutral", score: 0 };
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
      name: c.condition_name,
      severity: normalizeSeverity(c.status, "active"),
      kind: "condition",
      status: String(c.status || "active").toLowerCase() === "resolved" ? "Resolved" : "Active",
      updatedAt: c.updated_at || c.created_at,
    })),
    ...(clinicalData?.allergies || []).map((a) => ({
      name: a.allergy_name,
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
    const normalized = String(reason).toLowerCase();
    if (normalized.includes("video") || normalized.includes("consult")) return <Video size={14} />;
    if (normalized.includes("prescription") || normalized.includes("med")) return <FileText size={14} />;
    return <Stethoscope size={14} />;
  };

  const formatDate = (value) => {
    if (!value) return "Not available";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not available";
    return date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  };

  const timelineStatus = (rawStatus = "") => {
    const value = String(rawStatus || "").toLowerCase();
    if (value === "upcoming" || value === "scheduled") return "upcoming";
    if (value === "cancelled" || value === "canceled") return "cancelled";
    return "completed";
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
          {editing && (
            <div className="d-flex gap-2">
              <button onClick={cancelEdit} className="btn btn-light rounded-pill px-4 fw-bold shadow-sm">Cancel</button>
              <button onClick={handleSave} className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2">
                <Save size={18} /> Save Changes
              </button>
            </div>
          )}
        </div>

        {!editing ? (
          <div className="mx-auto" style={{ maxWidth: "1600px" }}>
            <div className="profile-hero-card mb-4">
              <div className="profile-header-strip">
                <div className="profile-avatar-wrapper">
                  <div className="profile-avatar-frame">
                    {profile.profile_image ? (
                      <img src={toAssetUrl(profile.profile_image)} alt={profile.full_name} />
                    ) : (
                      <div className="avatar-placeholder"><User size={48} /></div>
                    )}
                  </div>
                </div>

                <div className="profile-identity-center">
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <h2 className="profile-name-title">{profile.full_name}</h2>
                    <button className="icon-action-btn"><Phone size={14} /></button>
                    <button className="icon-action-btn"><Mail size={14} /></button>
                  </div>
                  <div className="demographic-pills">
                    <span className="demo-pill"><User size={12} /> {profile.gender || "Not Specified"}</span>
                    <span className="demo-pill"><MapPin size={12} /> {profile.city || "Kollam"}</span>
                    <span className="demo-pill"><Calendar size={12} /> {profile.date_of_birth} ({age} years)</span>
                    <span className="demo-pill"><Phone size={12} /> {profile.phone}</span>
                    <span className="demo-pill"><Mail size={12} /> {profile.email}</span>
                  </div>

                  <div className="header-stats-row">
                    <div className="header-stat">
                      <div className="stat-label-wrap"><Scale size={14} /> BMI</div>
                      <div className="stat-value">{hasValidBmi ? bmi : "N/A"}</div>
                      <div className={`stat-sublabel bmi-${bmiMeta.tone}`}>{bmiMeta.label}</div>
                      <div className="bmi-gradient-bar">
                        <div className="bmi-progress-marker" style={{ left: `${bmiMeta.score}%` }} />
                      </div>
                    </div>
                    <div className="stat-divider" />
                    <div className="header-stat">
                      <div className="stat-label-wrap"><Weight size={14} /> Weight</div>
                      <div className="stat-value">{profile.weight_kg || "N/A"} <span className="stat-unit">kg</span></div>
                    </div>
                    <div className="stat-divider" />
                    <div className="header-stat">
                      <div className="stat-label-wrap"><Activity size={14} /> Height</div>
                      <div className="stat-value">{profile.height_cm || "N/A"} <span className="stat-unit">Cm</span></div>
                    </div>
                    <div className="stat-divider" />
                    <div className="header-stat">
                      <div className="stat-label-wrap"><Droplet size={14} /> Blood Type</div>
                      <div className="stat-value">{profile.blood_group || "N/A"}</div>
                    </div>
                  </div>
                </div>

                <div className="profile-header-right">
                  <div className="tags-stack">
                    <div className="tag-group">
                      <span className="tag-header">Own diagnosis</span>
                      <div className="tag-pills">
                        {(clinicalData?.conditions || []).filter((c) => c.status === "active").slice(0, 2).map((c, i) => (
                          <span key={i} className="badge diagnosis-pill">{c.condition_name}</span>
                        ))}
                      </div>
                    </div>
                    <div className="tag-group">
                      <span className="tag-header">Known Allergies</span>
                      <div className="tag-pills">
                        {(clinicalData?.allergies || []).slice(0, 2).map((a, i) => (
                          <span key={i} className="badge allergy-pill">{a.allergy_name}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button onClick={startEditing} className="btn-edit-header">
                    <Edit2 size={14} /> Edit Profile
                  </button>
                </div>
              </div>
            </div>

            <div className="profile-body-grid mb-4">
              <div className="profile-body-column">
                <div className="profile-section-card mb-4">
                  <div className="section-header">
                    <h3 className="section-title"><MapPin size={18} /> Contact Details</h3>
                    <button className="section-edit-link" onClick={startEditing}>Edit</button>
                  </div>
                  <div className="contact-details-grid">
                    <div className="contact-detail-item">
                      <span className="contact-detail-label">Email</span>
                      <p className="contact-detail-value">{profile.email || "Not provided"}</p>
                    </div>
                    <div className="contact-detail-item">
                      <span className="contact-detail-label">Phone</span>
                      <p className="contact-detail-value">{profile.phone || "Not provided"}</p>
                    </div>
                    <div className="contact-detail-item contact-detail-item-wide">
                      <span className="contact-detail-label">Address</span>
                      <p className="contact-detail-value">{profile.address || "Not provided"}</p>
                    </div>
                    <div className="contact-detail-item">
                      <span className="contact-detail-label">Location</span>
                      <p className="contact-detail-value">
                        {[profile.city, profile.state, profile.country].filter(Boolean).join(", ") || "Not provided"}
                      </p>
                    </div>
                    <div className="contact-detail-item">
                      <span className="contact-detail-label">Pincode</span>
                      <p className="contact-detail-value">{profile.pincode || "Not provided"}</p>
                    </div>
                  </div>
                </div>

                <div className="profile-section-card mb-4">
                  <div className="section-header">
                    <h3 className="section-title"><Calendar size={18} /> Timeline</h3>
                    <button className="section-edit-link">Edit</button>
                  </div>
                  <div className="timeline-container">
                    {timelineEntries.map((appt, i) => {
                      const dateObj = new Date(appt.appointment_date);
                      const month = dateObj.toLocaleString("default", { month: "short" });
                      const year = dateObj.getFullYear();
                      const status = timelineStatus(appt.status);
                      return (
                        <div key={i} className="timeline-entry">
                          <div className="timeline-date-stack">
                            <span className="month">{month}</span>
                            <span className="year">{year}</span>
                          </div>
                          <div className="timeline-connector">
                            <div className={`timeline-dot ${status}`} />
                            {i < timelineEntries.length - 1 && <div className="timeline-line" />}
                          </div>
                          <div className="timeline-content-card">
                            <div className="timeline-header">
                              <span className="appt-kind">{getTimelineIcon(appt.reason)} Appointment</span>
                              <span className={`status-pill ${status}`}>{status}</span>
                            </div>
                            <h4 className="appt-title">{appt.reason || "General Checkup"}</h4>
                            <p className="appt-doctor">Dr. {appt.doctor_name || "Specialist"}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="profile-body-column">
                <div className="profile-section-card mb-4">
                  <div className="section-header">
                    <h3 className="section-title"><ShieldAlert size={18} /> Emergency Support</h3>
                    <button className="section-edit-link" onClick={startEditing}>Edit</button>
                  </div>
                  <div className="emergency-list">
                    {emergencyContacts.map((c, i) => (
                      <div key={i} className={`emergency-row ${c.is_primary ? "primary" : ""}`}>
                        <div className="emergency-info">
                          <span className="emergency-relation">{c.relationship || "Emergency Contact"} {c.is_primary && "(Primary)"}</span>
                          <h4 className="emergency-name">{c.contact_name}</h4>
                          <p className="emergency-meta">{c.phone} · {c.email}</p>
                        </div>
                        <div className="emergency-actions">
                          <button className="action-circle-btn"><Phone size={14} /></button>
                          <button className="action-circle-btn"><MessageCircle size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="profile-section-card">
                  <div className="section-header">
                    <div className="d-flex align-items-center gap-3">
                      <h3 className="section-title"><Activity size={18} /> Conditions Log</h3>
                      <div className="condition-counters">
                        <span className="counter-pill active">{activeCount} Active</span>
                        <span className="counter-pill severe">{severeCount} Severe</span>
                      </div>
                    </div>
                  </div>
                  <div className="conditions-list-stack">
                    {visibleConditions.map((item, i) => (
                      <div key={i} className="condition-item-row">
                        <div className="condition-icon-wrap">
                          <Heart size={16} className={`icon-${item.severity}`} />
                        </div>
                        <div className="condition-details">
                          <h4 className="condition-name">{item.name}</h4>
                          <p className="condition-meta">{item.status} · Updated {formatDate(item.updatedAt)}</p>
                        </div>
                        <div className="condition-severity-wrap">
                          <span className={`severity-badge ${item.severity === "active" ? "blue" : "amber"}`}>
                            {item.severity === "active" ? "ACTIVE" : "SEVERE"}
                          </span>
                        </div>
                      </div>
                    ))}
                    {conditionItems.length > 5 && (
                      <button className="show-all-link" onClick={() => setShowAllConditions(!showAllConditions)}>
                        {showAllConditions ? "Show less" : "Show all"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
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
                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => <option key={bg} value={bg}>{bg}</option>)}
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
                {countries.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>State</label>
              <select name="state" value={profile.state} onChange={handleChange}>
                {states.map((s) => <option key={s} value={s}>{s}</option>)}
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
                    <button className="btn btn-outline-danger btn-sm" onClick={() => removeContact(index)}><Trash2 size={16} /></button>
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6"><label className="small fw-bold">Name</label><input name="contact_name" value={contact.contact_name} onChange={(e) => handleEmergencyChange(index, e)} className="form-control" /></div>
                    <div className="col-md-6"><label className="small fw-bold">Relationship</label><input name="relationship" value={contact.relationship} onChange={(e) => handleEmergencyChange(index, e)} className="form-control" /></div>
                    <div className="col-md-6"><label className="small fw-bold">Phone</label><input name="phone" value={contact.phone} onChange={(e) => handleEmergencyChange(index, e)} className="form-control" /></div>
                    <div className="col-md-6"><label className="small fw-bold">Email</label><input name="email" value={contact.email} onChange={(e) => handleEmergencyChange(index, e)} className="form-control" /></div>
                  </div>
                </div>
              ))}
              <button className="btn btn-outline-primary w-100 mt-2" onClick={addNewContact}><Plus size={16} /> Add New Contact</button>
            </div>
            <div className="form-actions mt-4">
              <button className="btn-save" onClick={handleSave}>Save Changes</button>
              <button className="btn-cancel" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
