import { useState, useEffect } from "react";
import { formatDate, calculateAgeIST } from "../../shared/utils/time";
import api from "../../shared/services/api/axios";
import axios from "axios";
import { toAssetUrl } from "../../shared/utils/media";
import "../../shared/styles/ProfileStyles.css";
import { getClinicalSummary } from "../../shared/services/api/profileApi";
import {
  User, Phone, Mail, MapPin, Activity,
  Heart, Calendar, Weight, Edit2, MessageCircle,
  Save, Plus, Trash2, ShieldAlert,
  Droplet, Scale, Video, Stethoscope, FileText,
  Camera, Download, ChevronRight, AlertCircle,
  TrendingUp, Clock, Info, X
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
    if (countries.length > 0) return;
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
      Object.keys(profile).forEach((key) => { formData.append(key, profile[key] ?? ""); });
      if (profileImage) formData.append("profile_image", profileImage);

      await api.put("/api/profile/me", formData, { headers: { "Content-Type": "multipart/form-data" } });
      await api.put("/api/profile/emergency-contact/me", emergencyContacts.filter(c => c.contact_name));

      setEditing(false);
      fetchClinicalData();
      window.location.reload();
    } catch (err) {
      console.error("Profile update failed:", err);
    }
  };

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return "N/A";
    const h = height / 100;
    return (weight / (h * h)).toFixed(1);
  };

  if (loading || !profile) {
    return <div className="patient-profile-page-wrapper">Loading dashboard...</div>;
  }

  const age = calculateAgeIST(profile?.date_of_birth);
  const bmi = calculateBMI(profile?.weight_kg, profile?.height_cm);
  
  const conditionItems = [
    ...(clinicalData?.conditions || []).map(c => ({ ...c, type: 'condition' })),
    ...(clinicalData?.allergies || []).map(a => ({ ...a, type: 'allergy' }))
  ];

  const groupedTimeline = (clinicalData?.timeline || []).reduce((acc, curr) => {
    const month = new Date(curr.appointment_date).toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[month]) acc[month] = [];
    acc[month].push(curr);
    return acc;
  }, {});

  return (
    <div className="patient-profile-page-wrapper">
      <div className="profile-dashboard-container">
        
        {/* HERO SECTION */}
        <header className="profile-hero-section">
          <div className="hero-left-profile">
            <div className="hero-avatar-wrapper">
              <div className="hero-avatar-frame">
                {profile.profile_image ? (
                  <img src={toAssetUrl(profile.profile_image)} alt={profile.full_name} />
                ) : (
                  <div className="hero-avatar-placeholder"><User size={60} /></div>
                )}
              </div>
              <label className="camera-overlay">
                <Camera size={20} />
                <input type="file" hidden onChange={handleImageChange} />
              </label>
            </div>

            <div className="hero-identity-block">
              <h1 className="hero-name">{profile.full_name}</h1>
              <div className="hero-meta-row">
                <span className="hero-meta-item"><User size={16} /> {profile.gender}</span>
                <span className="hero-meta-item"><Calendar size={16} /> {age} Years</span>
                <span className="hero-meta-item"><MapPin size={16} /> {profile.city}</span>
              </div>
              <div className="hero-stats-chips">
                <div className="stat-chip">
                  <span className="stat-chip-label">BMI</span>
                  <span className="stat-chip-value">{bmi}</span>
                </div>
                <div className="stat-chip">
                  <span className="stat-chip-label">Weight</span>
                  <span className="stat-chip-value">{profile.weight_kg}<span className="stat-chip-unit">kg</span></span>
                </div>
                <div className="stat-chip">
                  <span className="stat-chip-label">Height</span>
                  <span className="stat-chip-value">{profile.height_cm}<span className="stat-chip-unit">cm</span></span>
                </div>
                <div className="stat-chip">
                  <span className="stat-chip-label">Blood</span>
                  <span className="stat-chip-value">{profile.blood_group}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-right-actions">
            {!editing ? (
              <div className="hero-action-buttons">
                <button onClick={startEditing} className="btn-premium-action btn-premium-primary">
                  <Edit2 size={18} /> Edit Profile
                </button>
                <button className="btn-premium-action">
                  <Download size={18} /> Records
                </button>
              </div>
            ) : (
              <div className="hero-action-buttons">
                <button onClick={handleSave} className="btn-premium-action btn-premium-primary">
                  <Save size={18} /> Save
                </button>
                <button onClick={cancelEdit} className="btn-premium-action">
                  <X size={18} /> Cancel
                </button>
              </div>
            )}
            <div className="medical-tags-row">
              {(clinicalData?.allergies || []).map((a, i) => (
                <span key={i} className="medical-tag tag-allergy"><AlertCircle size={12} /> {a.allergy_name}</span>
              ))}
              {(clinicalData?.conditions || []).filter(c => c.status === 'active').map((c, i) => (
                <span key={i} className="medical-tag tag-condition"><Heart size={12} /> {c.condition_name}</span>
              ))}
            </div>
          </div>
        </header>

        {editing ? (
          <div className="edit-dashboard-grid">
            <h2 className="hero-name mb-4" style={{fontSize: '1.5rem'}}>Update Personal Information</h2>
            <div className="form-grid-layout">
              <div className="form-group-custom"><label>Full Name</label><input name="full_name" value={profile.full_name} onChange={handleChange} /></div>
              <div className="form-group-custom"><label>Gender</label>
                <select name="gender" value={profile.gender} onChange={handleChange}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="form-group-custom"><label>Date of Birth</label><input type="date" name="date_of_birth" value={profile.date_of_birth} onChange={handleChange} /></div>
              <div className="form-group-custom"><label>Blood Group</label>
                <select name="blood_group" value={profile.blood_group} onChange={handleChange}>
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
              <div className="form-group-custom"><label>Height (cm)</label><input type="number" name="height_cm" value={profile.height_cm} onChange={handleChange} /></div>
              <div className="form-group-custom"><label>Weight (kg)</label><input type="number" name="weight_kg" value={profile.weight_kg} onChange={handleChange} /></div>
              
              <div className="form-group-full form-group-custom mt-3"><label>Full Address</label><input name="address" value={profile.address} onChange={handleChange} /></div>
              <div className="form-group-custom"><label>Country</label>
                <select name="country" value={profile.country} onChange={handleChange}>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group-custom"><label>State</label><input name="state" value={profile.state} onChange={handleChange} /></div>
              <div className="form-group-custom"><label>City</label><input name="city" value={profile.city} onChange={handleChange} /></div>
              <div className="form-group-custom"><label>Pincode</label><input name="pincode" value={profile.pincode} onChange={handleChange} /></div>
            </div>
            
            <h2 className="hero-name mt-5 mb-4" style={{fontSize: '1.5rem'}}>Emergency Contacts</h2>
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="emergency-contact-display mb-3" style={{border: '1px solid var(--border-soft)'}}>
                 <div className="form-grid-layout w-100 p-2">
                    <div className="form-group-custom"><label>Contact Name</label><input name="contact_name" value={contact.contact_name} onChange={(e) => handleEmergencyChange(index, e)} /></div>
                    <div className="form-group-custom"><label>Relationship</label><input name="relationship" value={contact.relationship} onChange={(e) => handleEmergencyChange(index, e)} /></div>
                    <div className="form-group-custom"><label>Phone</label><input name="phone" value={contact.phone} onChange={(e) => handleEmergencyChange(index, e)} /></div>
                    <button className="btn-premium-action text-danger" style={{marginTop: '28px', border: 'none'}} onClick={() => removeContact(index)}><Trash2 size={18} /> Remove</button>
                 </div>
              </div>
            ))}
            <button className="btn-premium-action w-100 mt-3" onClick={addNewContact}><Plus size={18} /> Add New Emergency Contact</button>

            <div className="form-actions-dashboard">
               <button onClick={cancelEdit} className="btn-premium-action">Cancel Discard</button>
               <button onClick={handleSave} className="btn-premium-action btn-premium-primary">Save Profile Changes</button>
            </div>
          </div>
        ) : (
          <>
            {/* MAIN CONTENT AREA */}
            <main className="dashboard-main-content">
              
              {/* MEDICAL CONDITIONS */}
              <section className="dashboard-section-card">
                <div className="card-header-flex">
                  <div className="card-title-group">
                    <div className="card-icon-box"><Activity size={20} /></div>
                    <h2 className="card-title">Medical Conditions</h2>
                  </div>
                  <button className="btn-premium-action" onClick={() => setShowAllConditions(!showAllConditions)}>
                    {showAllConditions ? "Show Less" : "View All"}
                  </button>
                </div>

                <div className="conditions-interactive-grid">
                  {(showAllConditions ? conditionItems : conditionItems.slice(0, 4)).map((item, i) => (
                    <div key={i} className={`medical-condition-card card-${item.severity?.toLowerCase() || 'active'}`}>
                      <div className="condition-card-header">
                        <h3 className="condition-name-bold">{item.condition_name || item.allergy_name}</h3>
                        <span className={`severity-pill pill-${item.severity?.toLowerCase() || 'active'}`}>
                          {item.severity || 'Active'}
                        </span>
                      </div>
                      <div className="condition-meta-info">
                        <div className="meta-item-small"><Clock size={14} /> <strong>Diagnosed:</strong> {formatDate(item.created_at)}</div>
                        <div className="meta-item-small"><Stethoscope size={14} /> <strong>Specialist:</strong> Dr. Specialist</div>
                        <div className="meta-item-small"><TrendingUp size={14} /> <strong>Status:</strong> {item.status || 'Ongoing'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* MEDICAL ACTIVITY FEED */}
              <section className="dashboard-section-card">
                <div className="card-header-flex">
                  <div className="card-title-group">
                    <div className="card-icon-box"><Clock size={20} /></div>
                    <h2 className="card-title">Health Activity Timeline</h2>
                  </div>
                </div>

                <div className="medical-activity-timeline">
                  {Object.entries(groupedTimeline).map(([month, activities]) => (
                    <div key={month} className="timeline-month-group">
                      <div className="timeline-month-label">{month}</div>
                      {activities.map((appt, idx) => (
                        <div key={idx} className="timeline-activity-card">
                          <div className="activity-icon-circle">
                            {appt.reason?.toLowerCase().includes('video') ? <Video size={18} /> : <Stethoscope size={18} />}
                          </div>
                          <div className="activity-main-info">
                            <div className="activity-title-row">
                              <h4 className="activity-title">{appt.reason || 'General Consultation'}</h4>
                              <span className="activity-date">{formatDate(appt.appointment_date)}</span>
                            </div>
                            <div className="activity-sub">Consulted with <strong>Dr. {appt.doctor_name}</strong> · {appt.status}</div>
                          </div>
                          <ChevronRight size={18} className="text-muted" />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </section>
            </main>

            {/* SIDEBAR AREA */}
            <aside className="dashboard-sidebar">
              
              <div className="sidebar-summary-panel">
                {/* HEALTH SCORE */}
                <div className="health-score-card">
                  <div className="score-circle-wrap">
                    <div className="score-number">84</div>
                  </div>
                  <h3 className="score-label">Health Score Index</h3>
                  <p className="small mt-2 opacity-75">Your overall clinical health stability is Excellent.</p>
                </div>

                {/* QUICK SUMMARY LIST */}
                <div className="dashboard-section-card">
                  <h3 className="card-title mb-4" style={{fontSize: '1rem'}}>Profile Summary</h3>
                  <div className="summary-stats-list">
                    <div className="summary-stat-row">
                      <div className="stat-row-left">
                        <Heart size={16} className="stat-row-icon" />
                        <span className="stat-row-label">Active Conditions</span>
                      </div>
                      <span className="stat-row-value">{clinicalData?.conditions?.length || 0}</span>
                    </div>
                    <div className="summary-stat-row">
                      <div className="stat-row-left">
                        <AlertCircle size={16} className="stat-row-icon" />
                        <span className="stat-row-label">Allergies Detected</span>
                      </div>
                      <span className="stat-row-value">{clinicalData?.allergies?.length || 0}</span>
                    </div>
                    <div className="summary-stat-row">
                      <div className="stat-row-left">
                        <Clock size={16} className="stat-row-icon" />
                        <span className="stat-row-label">Last Checkup</span>
                      </div>
                      <span className="stat-row-value">{formatDate(clinicalData?.timeline?.[0]?.appointment_date) || 'None'}</span>
                    </div>
                    <div className="summary-stat-row">
                      <div className="stat-row-left">
                        <ShieldAlert size={16} className="stat-row-icon" />
                        <span className="stat-row-label">Emergency Contacts</span>
                      </div>
                      <span className="stat-row-value">{emergencyContacts.length}</span>
                    </div>
                  </div>
                </div>

                {/* EMERGENCY CONTACT MINI */}
                <div className="emergency-premium-card">
                  <div className="emergency-header">
                    <ShieldAlert size={20} />
                    <span className="fw-bold">Primary Emergency Contact</span>
                  </div>
                  {emergencyContacts.length > 0 ? (
                    <div className="emergency-contact-display">
                      <div className="emergency-avatar-mini"><User size={20} /></div>
                      <div className="emergency-details-mini">
                        <h4 className="emergency-name-mini">{emergencyContacts[0].contact_name}</h4>
                        <span className="emergency-relation-pill">{emergencyContacts[0].relationship}</span>
                      </div>
                      <div className="emergency-actions-mini">
                        <button className="btn-circle-action"><Phone size={14} /></button>
                        <button className="btn-circle-action"><MessageCircle size={14} /></button>
                      </div>
                    </div>
                  ) : (
                    <p className="small text-muted mb-0">No emergency contact set.</p>
                  )}
                </div>

                {/* CONTACT DETAILS CARD */}
                <div className="dashboard-section-card">
                   <h3 className="card-title mb-4" style={{fontSize: '1rem'}}>Contact Information</h3>
                   <div className="summary-stats-list">
                      <div className="summary-stat-row" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '4px'}}>
                         <span className="stat-row-label">Email Address</span>
                         <span className="stat-row-value">{profile.email}</span>
                      </div>
                      <div className="summary-stat-row" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '4px'}}>
                         <span className="stat-row-label">Phone Number</span>
                         <span className="stat-row-value">{profile.phone}</span>
                      </div>
                      <div className="summary-stat-row" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '4px'}}>
                         <span className="stat-row-label">Permanent Address</span>
                         <span className="stat-row-value text-muted" style={{fontSize: '0.85rem'}}>{profile.address}, {profile.city}, {profile.country}</span>
                      </div>
                   </div>
                </div>

              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
