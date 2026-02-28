import { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";
import axios from "axios";
import { toAssetUrl } from "../../utils/media";
import "../../styles/ProfileStyles.css"; // ✅ Use new premium styles
import { useNavigate } from "react-router-dom";
import { getAppointments } from "../../api/appointments";
import { 
  User, Phone, Mail, MapPin, Activity, 
  Heart, Calendar, Ruler, Weight, Edit2, 
  Save, X, Plus, Trash2, ShieldAlert,
  CalendarDays, History, ArrowRight, Clock 
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
];

const ALLERGY_SUGGESTIONS = [
  "Penicillin",
  "Sulfa drugs",
  "Pollen",
  "Dust",
  "Latex",
  "Nuts",
  "Seafood",
  "Milk",
];

const CONDITION_SUGGESTIONS = [
  "Diabetes",
  "Hypertension",
  "Asthma",
  "Thyroid disorder",
  "Arthritis",
  "Migraine",
  "Heart disease",
  "Kidney disease",
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

const normalizeText = (value = "") => value.toString().trim().toLowerCase();
const splitMedicalTags = (value = "") =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const joinMedicalTags = (tags = []) => tags.join(", ");

const levenshteinDistance = (a = "", b = "") => {
  const left = normalizeText(a);
  const right = normalizeText(b);
  const rows = left.length + 1;
  const cols = right.length + 1;
  const dp = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i += 1) dp[i][0] = i;
  for (let j = 0; j < cols; j += 1) dp[0][j] = j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[rows - 1][cols - 1];
};

const pickBestPincode = (postOffices = [], { city, state }) => {
  const normalizedCity = normalizeText(city);
  const normalizedState = normalizeText(state);

  const scored = postOffices
    .map((office) => {
      const officeState = normalizeText(office.State);
      const officeDistrict = normalizeText(office.District);
      const officeName = normalizeText(office.Name);
      const officeTaluk = normalizeText(office.Taluk || office.Block || office.Region || office.Division);
      const branchType = normalizeText(office.BranchType);

      let score = 0;
      if (normalizedState && officeState === normalizedState) score += 50;
      if (normalizedCity && officeDistrict === normalizedCity) score += 30;
      if (normalizedCity && officeName === normalizedCity) score += 20;
      if (
        normalizedCity &&
        (
          officeName.includes(normalizedCity) ||
          normalizedCity.includes(officeName) ||
          officeTaluk.includes(normalizedCity) ||
          normalizedCity.includes(officeTaluk)
        )
      ) score += 15;
      if (
        normalizedCity &&
        (
          levenshteinDistance(officeName, normalizedCity) <= 2 ||
          levenshteinDistance(officeTaluk, normalizedCity) <= 2
        )
      ) score += 12;
      if (branchType.includes("head")) score += 10;

      return { office, score };
    })
    .filter(({ office }) => Boolean(office?.Pincode));

  if (!scored.length) return "";

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const pinA = String(a.office.Pincode).padStart(6, "0");
    const pinB = String(b.office.Pincode).padStart(6, "0");
    if (pinA !== pinB) return pinA.localeCompare(pinB);
    return normalizeText(a.office.Name).localeCompare(normalizeText(b.office.Name));
  });

  return scored[0].office.Pincode ?? "";
};

const Profile = () => {
  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    blood_group: "",
    height_cm: "",
    weight_kg: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    allergies: "",
    chronic_conditions: "",
    profile_image: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [profileImageName, setProfileImageName] = useState("");
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apptStats, setApptStats] = useState({ total: 0, next: null, last: null });
  const [initialProfileSnapshot, setInitialProfileSnapshot] = useState(null);
  const [initialEmergencySnapshot, setInitialEmergencySnapshot] = useState(null);

  // ... (Keep existing fetch functions: fetchEmergencyContact, handleEmergencyChange, addNewContact, removeContact, fetchProfile, fetchCountries, fetchStates, fetchCities, fetchPincode, handleChange, handleImageChange, handleSave) ...
  // NOTE: For brevity in this replacement, I am assuming the logic methods ABOVE render return are unchanged. 
  // IMPORTANT: The user context implies I should keep the logic. I will re-inject the logic below to ensure the file is complete.

  // =========================
  // FETCH EMERGENCY CONTACTS
  // =========================
  const fetchEmergencyContact = async () => {
    const cached = localStorage.getItem("emergencyContacts");
    if (cached) setEmergencyContacts(JSON.parse(cached));

    try {
      const res = await api.get("/profile/emergency-contact/me");
      if (Array.isArray(res.data)) {
        const normalizedContacts = normalizeEmergencyContacts(res.data);
        setEmergencyContacts(normalizedContacts);
        localStorage.setItem("emergencyContacts", JSON.stringify(normalizedContacts));
      } else {
        setEmergencyContacts([]);
      }
    } catch {
      console.log("No emergency contacts found");
      if (!cached) setEmergencyContacts([]);
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

  const addNewContact = () => {
    setEmergencyContacts([
      ...emergencyContacts,
      {
        contact_name: "",
        relationship: "",
        phone: "",
        alternate_phone: "",
        email: "",
        is_primary: false,
      },
    ]);
  };

  const removeContact = (index) => {
    const updatedContacts = emergencyContacts.filter((_, i) => i !== index);
    setEmergencyContacts(updatedContacts);
  };

  const fetchProfile = useCallback(async () => {
    const cached = localStorage.getItem("userProfile");
    if (cached) {
       setProfile(JSON.parse(cached));
       setLoading(false);
    }

    try {
      const res = await api.get("/profile/me");
      const cleanedData = normalizeProfile(res.data);
      setProfile(cleanedData);
      localStorage.setItem("userProfile", JSON.stringify(cleanedData));

      if (cleanedData.country) await fetchStates(cleanedData.country);
      if (cleanedData.country && cleanedData.state) await fetchCities(cleanedData.country, cleanedData.state);
    } catch (err) {
      console.error(err);
      if (!cached) alert("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCountries = async () => {
    const cached = localStorage.getItem("countries");
    if (cached) {
        setCountries(JSON.parse(cached));
        return; 
    }

    try {
      const res = await axios.get("https://countriesnow.space/api/v0.1/countries/positions");
      const list = res.data.data.map((c) => c.name);
      setCountries(list);
      localStorage.setItem("countries", JSON.stringify(list));
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

  const fetchPincode = async ({ country, state, city }) => {
    if (normalizeText(country) !== "india" || !city) {
      setProfile((prev) => ({ ...prev, pincode: "" }));
      return;
    }

    try {
      const res = await axios.get(`https://api.postalpincode.in/postoffice/${city}`);
      const payload = Array.isArray(res.data) ? res.data[0] : null;
      let postOffices = payload?.Status === "Success" ? payload.PostOffice || [] : [];

      // Fallback: if city query is empty (common for variant spellings), query state and score locally.
      if (!postOffices.length && state) {
        const fallbackRes = await axios.get(`https://api.postalpincode.in/postoffice/${state}`);
        const fallbackPayload = Array.isArray(fallbackRes.data) ? fallbackRes.data[0] : null;
        postOffices = fallbackPayload?.Status === "Success" ? fallbackPayload.PostOffice || [] : [];
      }

      const bestPincode = pickBestPincode(postOffices, { city, state });

      if (!bestPincode) return;

      setProfile((prev) => {
        // Prevent stale async responses from overwriting current selection
        if (
          normalizeText(prev.country) !== normalizeText(country) ||
          normalizeText(prev.state) !== normalizeText(state) ||
          normalizeText(prev.city) !== normalizeText(city)
        ) {
          return prev;
        }
        return { ...prev, pincode: bestPincode };
      });
    } catch {
      console.log("Pincode fetch failed");
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;

    if (name === "country") {
      setProfile((prev) => ({ ...prev, country: value, state: "", city: "", pincode: "" }));
      setStates([]);
      setCities([]);
      await fetchStates(value);
      return;
    }

    if (name === "state") {
      setProfile((prev) => ({ ...prev, state: value, city: "", pincode: "" }));
      setCities([]);
      await fetchCities(profile.country, value);
      return;
    }

    if (name === "city") {
      setProfile((prev) => ({ ...prev, city: value, pincode: "" }));
      await fetchPincode({ country: profile.country, state: profile.state, city: value });
      return;
    }

    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
      setProfileImageName(e.target.files[0].name);
    }
  };

  const startEditing = () => {
    setInitialProfileSnapshot(normalizeProfile(profile));
    setInitialEmergencySnapshot(normalizeEmergencyContacts(emergencyContacts));
    setEditing(true);
  };

  const cancelEdit = () => {
    if (initialProfileSnapshot) {
      setProfile(initialProfileSnapshot);
    }
    if (initialEmergencySnapshot) {
      setEmergencyContacts(initialEmergencySnapshot);
    }
    setProfileImage(null);
    setProfileImageName("");
    setEditing(false);
  };

  const hasUnsavedChanges =
    editing &&
    (
      Boolean(profileImage) ||
      JSON.stringify(normalizeProfile(profile)) !== JSON.stringify(initialProfileSnapshot || {}) ||
      JSON.stringify(normalizeEmergencyContacts(emergencyContacts)) !== JSON.stringify(initialEmergencySnapshot || [])
    );

  const handleSave = async () => {
    try {
      const formData = new FormData();
      Object.keys(profile).forEach((key) => { formData.append(key, profile[key] ?? ""); });
      if (profileImage) formData.append("profile_image", profileImage);

      // Optimistic cache update
      localStorage.setItem("userProfile", JSON.stringify(profile));
      localStorage.setItem("emergencyContacts", JSON.stringify(emergencyContacts));

      await api.put("/profile/me", formData, { headers: { "Content-Type": "multipart/form-data" } });
      await api.put("/profile/emergency-contact/me", emergencyContacts);

      setInitialProfileSnapshot(normalizeProfile(profile));
      setInitialEmergencySnapshot(normalizeEmergencyContacts(emergencyContacts));
      setProfileImage(null);
      setProfileImageName("");
      setEditing(false);
      fetchProfile();
      fetchEmergencyContact();
      alert("Profile updated successfully");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Update failed";
      alert(msg);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    fetchCountries();
    fetchProfile();
    fetchEmergencyContact();

    const fetchApptStats = async () => {
      try {
        const appts = await getAppointments();
        if (Array.isArray(appts)) {
          const now = new Date();
          let next = null;
          let last = null;

          appts.forEach(appt => {
            const timeStr = appt.appointment_time || "00:00:00";
            const apptDate = new Date(`${appt.appointment_date}T${timeStr}`);
            if (apptDate >= now && (appt.status === 'pending' || appt.status === 'approved')) {
              if (!next || apptDate < new Date(`${next.appointment_date}T${next.appointment_time || "00:00:00"}`)) {
                next = appt;
              }
            } else if (apptDate < now && appt.status === 'completed') {
              if (!last || apptDate > new Date(`${last.appointment_date}T${last.appointment_time || "00:00:00"}`)) {
                last = appt;
              }
            }
          });

          setApptStats({
            total: appts.length,
            next: next,
            last: last
          });
        }
      } catch (err) {
        console.error("Failed to load appointment stats", err);
      }
    };

    fetchApptStats();
  }, [fetchProfile]);

  if (loading) return <div className="loading-spinner">Loading Profile...</div>;

  return (
    <>
      <div className="background-decoration">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
      <div className="profile-container">
        <h1 className="page-heading">My Profile</h1>
      
      {/* --- HEADER --- */}
      <div className="profile-header-card">
        <div className="avatar-wrapper">
              <img
            src={
              profile.profile_image
                ? toAssetUrl(profile.profile_image)
                : "https://via.placeholder.com/150"
            }
            alt="Profile"
            className="profile-avatar-large"
          />
        </div>
        
        <div className="header-info">
            <h2>{profile.full_name || "Patient Name"}</h2>
            <p>Welcome to your personal health dashboard.</p>
        </div>

            <button 
                className={`edit-toggle-btn ${editing ? 'cancel' : ''}`} 
                onClick={() => (editing ? cancelEdit() : startEditing())}
            >
                {editing ? <><X size={18}/> Cancel Edit</> : <><Edit2 size={18}/> Edit Profile</>}
            </button>
      </div>

      {/* ================= VIEW MODE ================= */}
      {!editing ? (
        <div className="profile-content-grid">
            
            {/* 1. PERSONAL DETAILS */}
            <div className="info-card">
                <div className="card-title"><User size={20} className="text-blue-500"/> Personal Details</div>
                <InfoRow label="Full Name" value={profile.full_name} />
                <InfoRow label="Date of Birth" value={profile.date_of_birth} />
                <InfoRow label="Gender" value={profile.gender} />
                <InfoRow label="Blood Group" value={profile.blood_group} />
                <InfoRow label="Height" value={profile.height_cm ? `${profile.height_cm} cm` : '-'} />
                <InfoRow label="Weight" value={profile.weight_kg ? `${profile.weight_kg} kg` : '-'} />
            </div>

            {/* 2. CONTACT & ADDRESS */}
            <div className="info-card">
                <div className="card-title"><MapPin size={20} className="text-blue-500"/> Contact & Address</div>
                <InfoRow label="Phone" value={profile.phone} />
                <InfoRow label="City" value={profile.city} />
                <InfoRow label="State" value={profile.state} />
                <InfoRow label="Country" value={profile.country} />
                <InfoRow label="Pincode" value={profile.pincode} />
                <InfoRow label="Full Address" value={profile.address} />
            </div>



            {/* APPOINTMENT STATS */}
            <div 
               className="info-card full-width appointment-stats-card" 
               onClick={() => navigate('/patient/appointments')} 
            >
                <div className="card-title flex items-center justify-between" style={{marginBottom: '0'}}>
                   <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1'}}>
                       <CalendarDays size={20}/> Appointment History Snapshot
                   </div>
                   <ArrowRight size={18} className="text-gray-400" />
                </div>
                
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px'}}>
                    
                    <div style={{padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <span style={{fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px'}}><History size={15}/> Total Consultations</span>
                        <span style={{fontSize: '24px', fontWeight: '700', color: '#1e293b'}}>{apptStats.total}</span>
                    </div>

                    <div style={{padding: '16px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #dbeafe', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                         <span style={{fontSize: '13px', fontWeight: '600', color: '#2563eb', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px'}}><Clock size={15}/> Next Upcoming</span>
                         <span style={{fontSize: '15px', fontWeight: '700', color: '#1e3a8a', textAlign: 'center'}}>
                           {apptStats.next ? `${new Date(apptStats.next.appointment_date).toLocaleDateString('en-IN', {month: 'short', day: 'numeric'})} at ${(apptStats.next.appointment_time || "00:00").substring(0,5)}` : "No upcoming"}
                         </span>
                    </div>

                    <div style={{padding: '16px', background: '#ecfdf5', borderRadius: '12px', border: '1px solid #d1fae5', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                         <span style={{fontSize: '13px', fontWeight: '600', color: '#059669', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px'}}><Calendar size={15}/> Last Consult</span>
                         <span style={{fontSize: '15px', fontWeight: '700', color: '#064e3b', textAlign: 'center'}}>
                           {apptStats.last ? `${new Date(apptStats.last.appointment_date).toLocaleDateString('en-IN', {month: 'short', day: 'numeric'})} with ${apptStats.last.doctor_name || 'Doctor'}` : "None"}
                         </span>
                    </div>
                    
                </div>
            </div>

            {/* 4. EMERGENCY CONTACTS */}
            <div className="info-card full-width">
                <div className="card-title"><ShieldAlert size={20} className="text-red-600"/> Emergency Contacts</div>
                <div className="emergency-grid">
                    {emergencyContacts.length === 0 && <p className="text-gray-500">No emergency contacts added.</p>}
                    {emergencyContacts.map((contact, index) => (
                        <div key={index} className={`emergency-contact-card ${contact.is_primary ? 'primary' : ''}`}>
                            <div className="contact-name">{contact.contact_name}</div>
                            <div className="contact-role">{contact.relationship} {contact.is_primary && "(Primary)"}</div>
                            <div className="flex items-center gap-2 text-sm mb-1 text-gray-700"><Phone size={14}/> {contact.phone}</div>
                            {contact.email && <div className="flex items-center gap-2 text-sm text-gray-700"><Mail size={14}/> {contact.email}</div>}
                        </div>
                    ))}
                </div>
            </div>

        </div>
      ) : (
        /* ================= EDIT MODE (FORM) ================= */
        <div className="edit-form-grid">
            
            {/* --- 1. PERSONAL DETAILS SECTION --- */}
            <div className="form-section-title"><User size={20} className="text-blue-500"/> Personal Details</div>
            
            <div className="form-group full-width">
                <label>Profile Picture</label>
                <div className="file-upload-wrapper">
                    <label htmlFor="file-upload" className="file-upload-label">
                        <Plus size={16} style={{display: 'inline', marginRight: '6px'}}/> Choose File
                    </label>
                    <input id="file-upload" type="file" accept="image/*" onChange={handleImageChange} className="file-upload-input"/>
                    <span className="file-name-display">{profileImageName || "No file selected"}</span>
                </div>
            </div>

            <div className="form-group">
                <label>Full Name</label>
                <input name="full_name" value={profile.full_name} onChange={handleChange} placeholder="e.g. John Doe" />
            </div>
            
            <div className="form-group">
                <label>Date of Birth</label>
                <input type="date" name="date_of_birth" value={profile.date_of_birth} onChange={handleChange} />
            </div>

            <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={profile.gender} onChange={handleChange}>
                    <option value="">Select Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                </select>
            </div>

            <div className="form-group">
                <label>Blood Group</label>
                <select name="blood_group" value={profile.blood_group} onChange={handleChange}>
                    <option value="">Select</option>
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => <option key={bg}>{bg}</option>)}
                </select>
            </div>

            <div className="form-group">
                <label>Height (cm)</label>
                <input type="number" name="height_cm" value={profile.height_cm} onChange={handleChange} placeholder="e.g. 175" />
            </div>

            <div className="form-group">
                <label>Weight (kg)</label>
                <input type="number" name="weight_kg" value={profile.weight_kg} onChange={handleChange} placeholder="e.g. 70" />
            </div>


            {/* --- 2. CONTACT & ADDRESS SECTION --- */}
            <div className="form-section-title mt-6"><MapPin size={20} className="text-blue-500"/> Contact & Address</div>

            <div className="form-group">
                <label>Phone</label>
                <input name="phone" value={profile.phone} onChange={handleChange} placeholder="e.g. 1234567890" />
            </div>

            <div className="form-group">
                <label>Country</label>
                <select name="country" value={profile.country} onChange={handleChange}>
                   <option value="">Select Country</option>
                   {countries.map(c => <option key={c}>{c}</option>)}
                </select>
            </div>

             <div className="form-group">
                <label>State</label>
                <select name="state" value={profile.state} onChange={handleChange} disabled={!profile.country}>
                   <option value="">Select State</option>
                   {states.map(s => <option key={s}>{s}</option>)}
                </select>
            </div>

             <div className="form-group">
                <label>City</label>
                <select name="city" value={profile.city} onChange={handleChange} disabled={!profile.state}>
                   <option value="">Select City</option>
                   {cities.map(c => <option key={c}>{c}</option>)}
                </select>
            </div>
            
            <div className="form-group">
                <label>Pincode</label>
                <input value={profile.pincode} disabled placeholder="Auto-filled" />
            </div>

            <div className="form-group full-width">
                <label>Full Address</label>
                <input name="address" value={profile.address} onChange={handleChange} placeholder="House No, Street, Landmark..." />
            </div>





            {/* --- 4. EMERGENCY CONTACTS SECTION --- */}
            <div className="form-section-title mt-6"><ShieldAlert size={20} className="text-red-600"/> Emergency Contacts</div>
            
            <div className="full-width">
                <div className="emergency-edit-grid">
                    {emergencyContacts.map((contact, index) => (
                      <div key={index} className={`emergency-edit-card ${contact.is_primary ? 'is-primary' : ''}`}>
                         {contact.is_primary && <span className="primary-badge-pill">Primary</span>}
                         
                         <button className="remove-icon-btn-refined" onClick={() => removeContact(index)} title="Remove Contact">
                            <Trash2 size={16}/>
                         </button>

                         <div className="contact-card-grid">
                            <div className="form-group spaced">
                                <label>Name</label>
                                <input name="contact_name" value={contact.contact_name} onChange={(e) => handleEmergencyChange(index, e)} placeholder="Contact Name" style={{fontWeight: 600}} />
                            </div>
                            <div className="form-group spaced">
                                <label>Relationship</label>
                                <input name="relationship" value={contact.relationship} onChange={(e) => handleEmergencyChange(index, e)} placeholder="e.g. Father" />
                            </div>
                            <div className="form-group spaced">
                                <label>Phone</label>
                                <input name="phone" value={contact.phone} onChange={(e) => handleEmergencyChange(index, e)} placeholder="Phone Number" />
                            </div>
                            <div className="form-group spaced">
                                <label>Alt Phone</label>
                                <input name="alternate_phone" value={contact.alternate_phone} onChange={(e) => handleEmergencyChange(index, e)} placeholder="Alternate Phone" />
                            </div>
                            <div className="form-group spaced full-width" style={{gridColumn: '1 / -1'}}>
                                <label>Email</label>
                                <input name="email" value={contact.email} onChange={(e) => handleEmergencyChange(index, e)} placeholder="Email Address" />
                            </div>
                            <div className="full-width" style={{gridColumn: '1 / -1'}}>
                                 <label className="premium-toggle-wrapper">
                                    <input type="checkbox" name="is_primary" checked={contact.is_primary} onChange={(e) => handleEmergencyChange(index, e)} className="premium-toggle-input" />
                                    <div className="premium-toggle-switch"></div>
                                    <span className="premium-toggle-label">Mark as Primary Contact</span>
                                 </label>
                            </div>
                         </div>
                      </div>
                    ))}
                </div>
                <button className="secondary-btn flex items-center gap-2 mt-2 w-full justify-center py-3 border-dashed border-2 hover:border-solid" onClick={addNewContact}><Plus size={18}/> Add Another Emergency Contact</button>
            </div>

        </div>
      )}
    </div>

    {editing && (
      <div className="profile-floating-action-bar">
        <span className="profile-floating-hint">
          {hasUnsavedChanges ? "Unsaved changes..." : "No changes yet"}
        </span>
        <button className="btn-premium-cancel" onClick={cancelEdit}>
          <X size={18}/> Cancel
        </button>
        <button
          className="btn-premium-save"
          onClick={handleSave}
          disabled={!hasUnsavedChanges}
        >
          <Save size={18}/> Save Changes
        </button>
      </div>
    )}
    </>
  );
};

// Helper Component for View Mode
const InfoRow = ({ label, value }) => (
    <div className="info-row">
        <span className="label">{label}</span>
        <span className="value">{value || "-"}</span>
    </div>
);

const TagInputField = ({ name, value, onChange, suggestions, placeholder }) => {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const tags = splitMedicalTags(value);

  const updateValue = (nextTags) => {
    onChange({ target: { name, value: joinMedicalTags(nextTags) } });
  };

  const addTag = (rawValue) => {
    const cleaned = rawValue.replace(/\s+/g, " ").trim();
    if (!cleaned) return;
    if (cleaned.length < 3) {
      setError("Enter at least 3 letters.");
      return;
    }
    if (!/^[A-Za-z ]+$/.test(cleaned)) {
      setError("Use only letters and spaces.");
      return;
    }
    if (tags.length >= 10) {
      setError("Maximum 10 entries allowed.");
      return;
    }
    if (tags.some((tag) => normalizeText(tag) === normalizeText(cleaned))) {
      setError("This entry is already added.");
      return;
    }

    updateValue([...tags, cleaned]);
    setDraft("");
    setError("");
  };

  const removeTag = (index) => {
    const nextTags = tags.filter((_, i) => i !== index);
    updateValue(nextTags);
    setError("");
  };

  const filteredSuggestions = suggestions
    .filter((item) => !tags.some((tag) => normalizeText(tag) === normalizeText(item)))
    .filter((item) => (draft ? normalizeText(item).includes(normalizeText(draft)) : true))
    .slice(0, 6);

  return (
    <div className="tag-input-wrap">
      <div className="tag-chip-list">
        {tags.map((tag, index) => (
          <span key={`${tag}-${index}`} className="tag-chip">
            {tag}
            <button
              type="button"
              className="tag-chip-remove"
              onClick={() => removeTag(index)}
              aria-label={`Remove ${tag}`}
            >
              <X size={13} />
            </button>
          </span>
        ))}
      </div>

      <div className="tag-input-row">
        <input
          type="text"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag(draft);
            }
          }}
          placeholder={placeholder}
        />
        <button type="button" className="tag-add-btn" onClick={() => addTag(draft)}>
          Add
        </button>
      </div>

      {filteredSuggestions.length > 0 && (
        <div className="tag-suggestions">
          {filteredSuggestions.map((item) => (
            <button
              type="button"
              key={item}
              className="tag-suggestion-chip"
              onClick={() => addTag(item)}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {error && <p className="tag-input-error">{error}</p>}
    </div>
  );
};

export default Profile;
