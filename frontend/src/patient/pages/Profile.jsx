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

  const handleDownloadReport = async () => {
    try {
      const response = await api.post(`/api/patient/settings/export-report`, {}, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `NeuroNest_Medical_Report_${profile.full_name.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Report download failed:", error);
      alert("Failed to generate report. Please try again later.");
    }
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
                  <div className="hero-avatar-placeholder"><User size={64} /></div>
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
                <span className="hero-meta-item"><User size={18} /> {profile.gender}</span>
                <span className="hero-meta-item"><Calendar size={18} /> {age} Years</span>
                <span className="hero-meta-item"><MapPin size={18} /> {profile.city || 'Location not set'}</span>
                <span className="hero-meta-item"><Phone size={18} /> {profile.phone}</span>
                <span className="hero-meta-item"><Mail size={18} /> {profile.email}</span>
              </div>
              
              <div className="hero-stats-chips">
                <div className="stat-chip">
                  <span className="stat-chip-label">BMI Index</span>
                  <span className="stat-chip-value">{bmi}</span>
                  <div className="bmi-progress-container">
                    <div className="bmi-bar-bg">
                      <div className="bmi-bar-fill"></div>
                      <div className="bmi-pointer" style={{ left: `${Math.min(Math.max((bmi - 15) / 20 * 100, 0), 100)}%` }}></div>
                    </div>
                  </div>
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
                  <span className="stat-chip-label">Blood Group</span>
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
                <button onClick={handleDownloadReport} className="btn-premium-action">
                  <Download size={18} /> Download Records
                </button>
              </div>
            ) : (
              <div className="hero-action-buttons">
                <button onClick={handleSave} className="btn-premium-action btn-premium-primary">
                  <Save size={18} /> Save Changes
                </button>
                <button onClick={cancelEdit} className="btn-premium-action">
                  <X size={18} /> Cancel
                </button>
              </div>
            )}
            <div className="medical-tags-row">
              {(clinicalData?.allergies || []).map((a, i) => (
                <span key={i} className="medical-tag tag-allergy"><AlertCircle size={14} /> {a.allergy_name}</span>
              ))}
              {(clinicalData?.conditions || []).filter(c => c.status === 'active').map((c, i) => (
                <span key={i} className="medical-tag tag-condition"><Heart size={14} /> {c.condition_name}</span>
              ))}
              <span className="medical-tag" style={{background: '#f1f5f9', color: '#475569'}}><ShieldAlert size={14} /> No Risks</span>
            </div>
          </div>
        </header>

        {editing ? (
          <div className="edit-dashboard-grid">
            <h2 className="hero-name" style={{fontSize: '1.75rem', marginBottom: '32px'}}>Update Clinical Identity</h2>
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
              
              <div className="form-group-full form-group-custom"><label>Permanent Address</label><input name="address" value={profile.address} onChange={handleChange} /></div>
              <div className="form-group-custom"><label>Country</label>
                <select name="country" value={profile.country} onChange={handleChange}>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group-custom"><label>State</label><input name="state" value={profile.state} onChange={handleChange} /></div>
              <div className="form-group-custom"><label>City</label><input name="city" value={profile.city} onChange={handleChange} /></div>
              <div className="form-group-custom"><label>Pincode</label><input name="pincode" value={profile.pincode} onChange={handleChange} /></div>
            </div>
            
            <h2 className="hero-name" style={{fontSize: '1.75rem', marginTop: '48px', marginBottom: '32px'}}>Emergency Contact Management</h2>
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="dashboard-section-card" style={{padding: '24px', marginBottom: '20px'}}>
                 <div className="form-grid-layout">
                    <div className="form-group-custom"><label>Contact Name</label><input name="contact_name" value={contact.contact_name} onChange={(e) => handleEmergencyChange(index, e)} /></div>
                    <div className="form-group-custom"><label>Relationship</label><input name="relationship" value={contact.relationship} onChange={(e) => handleEmergencyChange(index, e)} /></div>
                    <div className="form-group-custom"><label>Phone</label><input name="phone" value={contact.phone} onChange={(e) => handleEmergencyChange(index, e)} /></div>
                    <div className="form-group-custom" style={{justifyContent: 'center'}}>
                      <button className="btn-premium-action" style={{color: '#ef4444', borderColor: '#fee2e2'}} onClick={() => removeContact(index)}><Trash2 size={18} /> Remove Contact</button>
                    </div>
                 </div>
              </div>
            ))}
            <button className="btn-premium-action w-100" style={{borderStyle: 'dashed', height: '60px'}} onClick={addNewContact}>
              <Plus size={20} /> Add Another Emergency Contact
            </button>

            <div className="form-actions-dashboard">
               <button onClick={cancelEdit} className="btn-premium-action">Discard Changes</button>
               <button onClick={handleSave} className="btn-premium-action btn-premium-primary">Save Clinical Profile</button>
            </div>
          </div>
        ) : (
          <>
            {/* HEALTH OVERVIEW DASHBOARD */}
            <section className="dashboard-overview-grid">
              <div className="overview-card">
                <div className="overview-card-header">
                  <div className="overview-icon-box" style={{background: '#eff6ff', color: '#2563eb'}}><Activity size={24} /></div>
                  <span className="overview-card-title">Conditions</span>
                </div>
                <div className="overview-card-value">{(clinicalData?.conditions || []).length} Active</div>
              </div>
              <div className="overview-card">
                <div className="overview-card-header">
                  <div className="overview-icon-box" style={{background: '#fef2f2', color: '#ef4444'}}><AlertCircle size={24} /></div>
                  <span className="overview-card-title">Allergies</span>
                </div>
                <div className="overview-card-value">{(clinicalData?.allergies || []).length} Detected</div>
              </div>
              <div className="overview-card">
                <div className="overview-card-header">
                  <div className="overview-icon-box" style={{background: '#f0fdf4', color: '#10b981'}}><Calendar size={24} /></div>
                  <span className="overview-card-title">Appointments</span>
                </div>
                <div className="overview-card-value">{(clinicalData?.timeline || []).length} Total</div>
              </div>
              <div className="overview-card">
                <div className="overview-card-header">
                  <div className="overview-icon-box" style={{background: '#fdf4ff', color: '#a855f7'}}><Heart size={24} /></div>
                  <span className="overview-card-title">Medications</span>
                </div>
                <div className="overview-card-value">{(clinicalData?.medications || []).length} Prescribed</div>
              </div>
              <div className="overview-card">
                <div className="overview-card-header">
                  <div className="overview-icon-box" style={{background: '#fff7ed', color: '#f59e0b'}}><ShieldAlert size={24} /></div>
                  <span className="overview-card-title">Emergency</span>
                </div>
                <div className="overview-card-value">{emergencyContacts.length} Contacts</div>
              </div>
              <div className="overview-card">
                <div className="overview-card-header">
                  <div className="overview-icon-box" style={{background: '#f0f9ff', color: '#0ea5e9'}}><FileText size={24} /></div>
                  <span className="overview-card-title">Insurance</span>
                </div>
                <div className="overview-card-value">HDFC Ergo</div>
              </div>
            </section>

            <div className="profile-main-grid">
              {/* LEFT COLUMN: CONDITIONS & TIMELINE */}
              <div className="profile-left-col">
                {/* MEDICAL CONDITIONS */}
                <section className="dashboard-section-card">
                  <div className="card-header-flex">
                    <div className="card-title-group">
                      <div className="card-icon-box"><Activity size={24} /></div>
                      <h2 className="card-title">Clinical Conditions Log</h2>
                    </div>
                    <button className="btn-premium-action" onClick={() => setShowAllConditions(!showAllConditions)}>
                      {showAllConditions ? "Show Less" : "View Full Log"}
                    </button>
                  </div>

                  <div className="conditions-interactive-grid">
                    {(showAllConditions ? conditionItems : conditionItems.slice(0, 4)).map((item, i) => (
                      <div key={i} className={`medical-condition-card card-${item.severity?.toLowerCase() || 'active'}`}>
                        <span className={`severity-badge badge-${item.severity?.toLowerCase() || 'active'}`}>
                          {item.severity || 'Active'}
                        </span>
                        <h3 className="condition-name-bold" style={{marginBottom: '16px', fontSize: '1.15rem'}}>{item.condition_name || item.allergy_name}</h3>
                        <div className="condition-meta-info" style={{gap: '12px'}}>
                          <div className="meta-item-small"><Clock size={16} /> <span><strong>Diagnosed:</strong> {formatDate(item.created_at)}</span></div>
                          <div className="meta-item-small"><Stethoscope size={16} /> <span><strong>Treating:</strong> Dr. Specialist</span></div>
                          <div className="meta-item-small"><Activity size={16} /> <span><strong>Status:</strong> {item.status || 'Monitoring'}</span></div>
                        </div>
                      </div>
                    ))}
                    {conditionItems.length === 0 && (
                      <div className="p-4 text-center text-muted w-100">No medical conditions recorded.</div>
                    )}
                  </div>
                </section>

                {/* COMPACT ACTIVITY FEED */}
                <section className="dashboard-section-card">
                  <div className="card-header-flex">
                    <div className="card-title-group">
                      <div className="card-icon-box"><TrendingUp size={24} /></div>
                      <h2 className="card-title">Medical Activity Feed</h2>
                    </div>
                  </div>

                  <div className="compact-activity-feed">
                    {Object.entries(groupedTimeline).length > 0 ? Object.entries(groupedTimeline).map(([month, activities]) => (
                      <div key={month}>
                        <div className="timeline-month-divider">{month}</div>
                        {activities.map((appt, idx) => (
                          <div key={idx} className="timeline-item">
                            <div className="timeline-point"></div>
                            <div className="timeline-content">
                              <div className="timeline-header">
                                <span className="timeline-title">{appt.reason || 'Clinical Consultation'}</span>
                                <span className="timeline-time">{formatDate(appt.appointment_date)}</span>
                              </div>
                              <div className="timeline-doctor">Consulted with Dr. {appt.doctor_name} · <span style={{color: appt.status === 'completed' ? '#10b981' : '#f59e0b'}}>{appt.status}</span></div>
                            </div>
                            <ChevronRight size={18} style={{opacity: 0.3}} />
                          </div>
                        ))}
                      </div>
                    )) : (
                      <div className="p-4 text-center text-muted">No recent medical activity.</div>
                    )}
                  </div>
                </section>
              </div>

              {/* RIGHT COLUMN: STICKY SUMMARY */}
              <div className="profile-right-col">
                <div className="sidebar-sticky">
                  {/* HEALTH SCORE */}
                  <div className="summary-panel-card">
                    <div className="health-score-ring">
                      <span className="health-score-value">88</span>
                    </div>
                    <div style={{textAlign: 'center', marginBottom: '24px'}}>
                      <h3 style={{fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px'}}>Health Vitality Index</h3>
                      <p style={{fontSize: '0.9rem', opacity: 0.8}}>Your clinical stability is currently within the optimal range.</p>
                    </div>
                    <div className="summary-list">
                      <div className="summary-item">
                        <span className="summary-label">Active Conditions</span>
                        <span className="summary-value">{(clinicalData?.conditions || []).length}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Next Appointment</span>
                        <span className="summary-value">15 May 2026</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Blood Type</span>
                        <span className="summary-value">{profile.blood_group}</span>
                      </div>
                    </div>
                  </div>

                  {/* EMERGENCY CONTACT */}
                  <div className="emergency-card-new">
                    <div className="emergency-header-new">
                      <ShieldAlert size={18} /> Primary Emergency Support
                    </div>
                    {emergencyContacts.length > 0 ? (
                      <>
                        <div className="emergency-contact-box">
                          <div className="emergency-avatar"><User size={24} /></div>
                          <div className="emergency-info">
                            <h4>{emergencyContacts[0].contact_name}</h4>
                            <span>{emergencyContacts[0].relationship}</span>
                          </div>
                        </div>
                        <div className="emergency-actions">
                          <button className="btn-emergency"><Phone size={16} /> Call</button>
                          <button className="btn-emergency"><MessageCircle size={16} /> Message</button>
                        </div>
                      </>
                    ) : (
                      <p style={{fontSize: '0.9rem', color: '#64748b', textAlign: 'center'}}>No emergency contact configured.</p>
                    )}
                  </div>

                  {/* QUICK INFO */}
                  <div className="dashboard-section-card" style={{marginTop: '24px', padding: '24px'}}>
                    <h4 style={{fontSize: '1rem', fontWeight: 700, marginBottom: '20px'}}>Contact Summary</h4>
                    <div className="summary-list">
                      <div className="summary-item" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '4px'}}>
                        <span className="summary-label">Email Address</span>
                        <span className="summary-value" style={{color: 'var(--clinical-blue)'}}>{profile.email}</span>
                      </div>
                      <div className="summary-item" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '4px'}}>
                        <span className="summary-label">Phone Line</span>
                        <span className="summary-value">{profile.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
