import { useState, useEffect } from "react";
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
    setProfile(initialProfileSnapshot);
    setEmergencyContacts(initialEmergencySnapshot);
    setEditing(false);
  };

  const handleSave = async () => {
    try {
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
    }
  };

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

  const normalizeSeverity = (rawValue) => {
    const value = String(rawValue || "active").toLowerCase();
    if (value.includes("severe") || value.includes("critical") || value.includes("high")) return "severe";
    if (value.includes("monitor") || value.includes("moderate") || value.includes("medium")) return "monitoring";
    if (value.includes("stable") || value.includes("healthy")) return "stable";
    return "active";
  };

  const conditionItems = [
    ...(clinicalData?.conditions || []).map((c) => ({
      name: c.condition_name,
      status: c.status,
      severity: normalizeSeverity(c.status),
      date: c.updated_at || c.created_at,
      doctor: c.doctor_name || "Specialist",
      type: "Condition"
    })),
    ...(clinicalData?.allergies || []).map((a) => ({
      name: a.allergy_name,
      status: "Active",
      severity: normalizeSeverity(a.severity),
      date: a.created_at,
      doctor: "Clinical Team",
      type: "Allergy"
    }))
  ];

  const timelineEntries = (clinicalData?.timeline || []).slice(0, 8);

  const getTimelineIcon = (reason = "") => {
    const normalized = reason.toLowerCase();
    if (normalized.includes("video") || normalized.includes("consult")) return <Video size={18} />;
    if (normalized.includes("prescription")) return <FileText size={18} />;
    return <Stethoscope size={18} />;
  };

  if (loading) return <div className="patient-profile-page-wrapper"><div className="text-center py-5">Loading Patient Dashboard...</div></div>;

  return (
    <div className="patient-profile-page-wrapper">
      <div className="profile-container">
        {!editing ? (
          <div className="health-dashboard-grid">
            {/* HERO SECTION */}
            <div className="span-12 dashboard-card hero-profile-card">
              <div className="hero-avatar-section">
                <div className="hero-avatar-frame">
                  {profile.profile_image ? (
                    <img src={toAssetUrl(profile.profile_image)} alt={profile.full_name} />
                  ) : (
                    <div className="avatar-placeholder d-flex align-items-center justify-content-center bg-light text-primary">
                      <User size={64} />
                    </div>
                  )}
                </div>
              </div>

              <div className="hero-identity-section">
                <h1 className="hero-name-title">
                  {profile.full_name}
                  <span className="badge bg-primary-subtle text-primary rounded-pill fs-6 px-3">{age} yrs</span>
                </h1>
                
                <div className="hero-sub-badges">
                  <div className="hero-demo-chip"><User size={14} /> {profile.gender}</div>
                  <div className="hero-demo-chip"><MapPin size={14} /> {profile.city}, {profile.country}</div>
                  <div className="hero-demo-chip"><Droplet size={14} /> {profile.blood_group} Group</div>
                </div>

                <div className="hero-stats-row">
                  <div className="hero-stat-chip">
                    <span className="hero-stat-label">BMI Status</span>
                    <span className="hero-stat-value">{bmi} · {bmiMeta.label}</span>
                  </div>
                  <div className="hero-stat-chip">
                    <span className="hero-stat-label">Current Weight</span>
                    <span className="hero-stat-value">{profile.weight_kg} kg</span>
                  </div>
                  <div className="hero-stat-chip">
                    <span className="hero-stat-label">Height</span>
                    <span className="hero-stat-value">{profile.height_cm} cm</span>
                  </div>
                </div>
              </div>

              <div className="hero-actions-section">
                <div className="hero-btn-group">
                  <button onClick={startEditing} className="btn-premium btn-premium-primary">
                    <Edit2 size={16} /> Edit Profile
                  </button>
                  <button className="btn-premium btn-premium-light">
                    <FileText size={16} /> Records
                  </button>
                </div>
                
                <div className="hero-medical-tags">
                  {clinicalData?.allergies?.slice(0, 2).map((a, i) => (
                    <span key={i} className="medical-pill pill-allergy">{a.allergy_name}</span>
                  ))}
                  {clinicalData?.conditions?.filter(c => c.status !== 'Resolved').slice(0, 2).map((c, i) => (
                    <span key={i} className="medical-pill pill-condition">{c.condition_name}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="span-8">
              {/* MEDICAL CONDITIONS GRID */}
              <div className="mb-5">
                <h2 className="dashboard-section-title"><Activity size={22} /> Medical Conditions & Allergies</h2>
                <div className="medical-card-grid">
                  {conditionItems.length > 0 ? conditionItems.map((item, i) => (
                    <div key={i} className={`medical-condition-card ${item.severity}`}>
                      <div className="med-card-header">
                        <span className="med-card-name">{item.name}</span>
                        <span className={`severity-tag ${item.severity}`}>{item.status || "Active"}</span>
                      </div>
                      <div className="med-card-meta">
                        <div className="med-meta-item"><Stethoscope size={14} /> {item.doctor}</div>
                        <div className="med-meta-item"><Calendar size={14} /> {formatDate(item.date)}</div>
                      </div>
                    </div>
                  )) : (
                    <div className="span-12 py-4 text-muted">No active medical records found.</div>
                  )}
                </div>
              </div>

              {/* TIMELINE SECTION */}
              <div>
                <h2 className="dashboard-section-title"><Calendar size={22} /> Clinical Activity Feed</h2>
                <div className="compact-timeline">
                  {timelineEntries.length > 0 ? timelineEntries.map((event, i) => (
                    <div key={i} className="timeline-event">
                      <div className="timeline-dot-premium" />
                      <div className="timeline-event-card">
                        <div className="event-icon-box">
                          {getTimelineIcon(event.reason)}
                        </div>
                        <div className="event-details">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="event-title">{event.reason || "Medical Consultation"}</span>
                            <span className="text-muted small">{formatDate(event.appointment_date)}</span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="event-doctor">With Dr. {event.doctor_name}</span>
                            <span className={`event-status-pill bg-${event.status === 'Completed' ? 'success' : 'primary'}-subtle text-${event.status === 'Completed' ? 'success' : 'primary'}`}>
                              {event.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-muted py-3">No recent clinical activity.</div>
                  )}
                </div>
              </div>
            </div>

            {/* SIDEBAR SUMMARY PANEL */}
            <div className="span-4">
              <div className="dashboard-card summary-panel">
                <h2 className="dashboard-section-title mb-4"><Heart size={20} /> Health Snapshot</h2>
                
                <div className="health-score-ring">
                  <div className="score-value">84</div>
                  <svg className="position-absolute" width="120" height="120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#F1F5F9" strokeWidth="8" />
                    <circle cx="60" cy="60" r="54" fill="none" stroke="var(--brand-primary)" strokeWidth="8" 
                            strokeDasharray="339" strokeDashoffset={339 * (1 - 0.84)} strokeLinecap="round" />
                  </svg>
                </div>

                <div className="summary-list">
                  <div className="summary-item">
                    <span className="summary-label">Active Conditions</span>
                    <span className="summary-value text-primary">{clinicalData?.conditions?.length || 0}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Allergies Reported</span>
                    <span className="summary-value text-danger">{clinicalData?.allergies?.length || 0}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Next Appointment</span>
                    <span className="summary-value">12 May, 2026</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Blood Group</span>
                    <span className="summary-value">{profile.blood_group}</span>
                  </div>
                </div>

                <hr className="my-4 opacity-10" />

                <h3 className="fs-6 fw-bold mb-3">Emergency Contact</h3>
                {emergencyContacts.slice(0, 1).map((c, i) => (
                  <div key={i} className="emergency-row primary border-0 p-3 rounded-4 mb-3">
                    <div className="emergency-info">
                      <span className="emergency-relation">{c.relationship} (Primary)</span>
                      <h4 className="emergency-name fs-6">{c.contact_name}</h4>
                      <p className="emergency-meta x-small">{c.phone}</p>
                    </div>
                    <div className="emergency-actions">
                      <button className="action-circle-btn"><Phone size={14} /></button>
                    </div>
                  </div>
                ))}

                <div className="contact-grid-modern mt-4">
                   <div className="contact-card-lite w-100">
                      <div className="label">Primary Email</div>
                      <div className="value text-truncate">{profile.email}</div>
                   </div>
                   <div className="contact-card-lite w-100">
                      <div className="label">Registered Phone</div>
                      <div className="value">{profile.phone}</div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="dashboard-card edit-dashboard-form p-5">
            <div className="d-flex align-items-center justify-content-between mb-5">
              <h2 className="m-0"><Edit2 size={24} className="text-primary me-2" /> Refine Health Profile</h2>
              <div className="d-flex gap-3">
                <button className="btn btn-light rounded-pill px-4" onClick={() => setEditing(false)}>Discard</button>
                <button className="btn btn-primary rounded-pill px-4 fw-bold" onClick={handleSave}>Apply Changes</button>
              </div>
            </div>

            <div className="form-row-premium">
              <div className="form-group-premium">
                <label>Full Name</label>
                <input name="full_name" value={profile.full_name} onChange={handleChange} placeholder="John Doe" />
              </div>
              <div className="form-group-premium">
                <label>Profile Picture</label>
                <input type="file" accept="image/*" onChange={handleImageChange} className="form-control" />
              </div>
            </div>

            <div className="form-row-premium">
              <div className="form-group-premium">
                <label>Date of Birth</label>
                <input type="date" name="date_of_birth" value={profile.date_of_birth} onChange={handleChange} />
              </div>
              <div className="form-group-premium">
                <label>Gender</label>
                <select name="gender" value={profile.gender} onChange={handleChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row-premium">
              <div className="form-group-premium">
                <label>Blood Group</label>
                <select name="blood_group" value={profile.blood_group} onChange={handleChange}>
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
              <div className="form-group-premium">
                <label>Height (cm)</label>
                <input type="number" name="height_cm" value={profile.height_cm} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group-premium mb-4">
              <label>Weight (kg)</label>
              <input type="number" name="weight_kg" value={profile.weight_kg} onChange={handleChange} />
            </div>

            <div className="form-group-premium full-width mb-4">
              <label>Current Address</label>
              <textarea name="address" value={profile.address} onChange={handleChange} rows="3" className="form-control" />
            </div>

            <div className="form-row-premium">
              <div className="form-group-premium">
                <label>Country</label>
                <select name="country" value={profile.country} onChange={handleChange}>
                  <option value="">Select Country</option>
                  {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group-premium">
                <label>State</label>
                <select name="state" value={profile.state} onChange={handleChange}>
                  <option value="">Select State</option>
                  {states.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row-premium mb-5">
              <div className="form-group-premium">
                <label>City</label>
                <input name="city" value={profile.city} onChange={handleChange} />
              </div>
              <div className="form-group-premium">
                <label>Pincode</label>
                <input name="pincode" value={profile.pincode} onChange={handleChange} />
              </div>
            </div>

            <div className="border-top pt-5">
              <h3 className="fs-5 fw-bold mb-4">Emergency Contact Strategy</h3>
              {emergencyContacts.map((contact, index) => (
                <div key={index} className="dashboard-card bg-light border-0 mb-4 p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <span className="badge bg-white text-dark shadow-sm px-3 py-2">Contact #{index + 1}</span>
                    <button className="btn btn-link text-danger p-0" onClick={() => removeContact(index)}><Trash2 size={20} /></button>
                  </div>
                  <div className="form-row-premium">
                    <div className="form-group-premium">
                      <label>Contact Name</label>
                      <input name="contact_name" value={contact.contact_name} onChange={(e) => handleEmergencyChange(index, e)} />
                    </div>
                    <div className="form-group-premium">
                      <label>Relationship</label>
                      <input name="relationship" value={contact.relationship} onChange={(e) => handleEmergencyChange(index, e)} />
                    </div>
                  </div>
                  <div className="form-row-premium mt-3">
                    <div className="form-group-premium">
                      <label>Phone Number</label>
                      <input name="phone" value={contact.phone} onChange={(e) => handleEmergencyChange(index, e)} />
                    </div>
                    <div className="form-group-premium">
                      <label>Email Address</label>
                      <input name="email" value={contact.email} onChange={(e) => handleEmergencyChange(index, e)} />
                    </div>
                  </div>
                </div>
              ))}
              <button className="btn btn-outline-primary w-100 rounded-4 py-3 fw-bold" onClick={addNewContact}>
                <Plus size={20} className="me-2" /> Add Secondary Emergency Contact
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
