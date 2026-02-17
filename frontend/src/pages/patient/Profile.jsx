import { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";
import axios from "axios";
import { toAssetUrl } from "../../utils/media";
import "../../styles/ProfileStyles.css"; // ✅ Use new premium styles
import { 
  User, Phone, Mail, MapPin, Activity, 
  Heart, Calendar, Ruler, Weight, Edit2, 
  Save, X, Plus, Trash2, ShieldAlert 
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

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

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
        setEmergencyContacts(res.data);
        localStorage.setItem("emergencyContacts", JSON.stringify(res.data));
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
      const cleanedData = {};
      PROFILE_KEYS.forEach((key) => {
        cleanedData[key] = res.data[key] ?? "";
      });
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

  const fetchPincode = async (city) => {
    try {
      const res = await axios.get(`https://api.postalpincode.in/postoffice/${city}`);
      if (res.data[0].Status === "Success" && res.data[0].PostOffice.length > 0) {
        setProfile((prev) => ({ ...prev, pincode: res.data[0].PostOffice[0].Pincode }));
      }
    } catch { console.log("Pincode fetch failed"); }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));

    if (name === "country") {
      setStates([]); setCities([]);
      await fetchStates(value);
      setProfile((prev) => ({ ...prev, state: "", city: "", pincode: "" }));
    }
    if (name === "state") {
      setCities([]);
      await fetchCities(profile.country, value);
      setProfile((prev) => ({ ...prev, city: "", pincode: "" }));
    }
    if (name === "city") fetchPincode(value);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
      setProfileImageName(e.target.files[0].name);
    }
  };

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
                onClick={() => setEditing(!editing)}
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

             {/* 3. MEDICAL INFO */}
             <div className="info-card full-width">
                <div className="card-title"><Activity size={20} className="text-red-500"/> Medical Information</div>
                <div className="mb-4">
                    <div className="label mb-2">Allergies</div>
                    <div className="medical-tags-container">
                        {profile.allergies ? profile.allergies.split(',').map((tag, i) => (
                            <span key={i} className="medical-tag allergy">{tag.trim()}</span>
                        )) : <span className="value">None reported</span>}
                    </div>
                </div>
                <div>
                    <div className="label mb-2">Chronic Conditions</div>
                     <div className="medical-tags-container">
                        {profile.chronic_conditions ? profile.chronic_conditions.split(',').map((tag, i) => (
                            <span key={i} className="medical-tag condition">{tag.trim()}</span>
                        )) : <span className="value">None reported</span>}
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


            {/* --- 3. MEDICAL INFO SECTION --- */}
            <div className="form-section-title mt-6"><Activity size={20} className="text-red-500"/> Medical Information</div>

            <div className="form-group full-width">
                <label>Allergies (comma separated)</label>
                <input name="allergies" value={profile.allergies} onChange={handleChange} placeholder="e.g. Peanuts, Penicillin" />
            </div>

            <div className="form-group full-width">
                <label>Chronic Conditions (comma separated)</label>
                <input name="chronic_conditions" value={profile.chronic_conditions} onChange={handleChange} placeholder="e.g. Asthma, Diabetes" />
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

            <div className="form-actions-refined">
                <button className="btn-premium-cancel" onClick={() => setEditing(false)}><X size={18}/> Cancel</button>
                <button className="btn-premium-save" onClick={handleSave}><Save size={18}/> Save Changes</button>
            </div>
        </div>
      )}
    </div>
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

export default Profile;
