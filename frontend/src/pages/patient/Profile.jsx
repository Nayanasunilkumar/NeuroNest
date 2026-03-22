import { useState, useEffect } from "react";
import api from "../../api/axios";
import axios from "axios";
import { toAssetUrl } from "../../utils/media";
import "../../styles/ProfileStyles.css"; 
import "../../styles/patient-records.css"; // Reuse premium clinical styles
import { getClinicalSummary } from "../../api/profileApi";
import {
  User, Phone, Mail, MapPin, Activity,
  Heart, Calendar, Edit2,
  Save, Plus, Trash2, ShieldAlert, Pill
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

  return (
    <div className="patient-profile-page-wrapper">
      <div className="background-decoration">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="profile-container py-4 px-3 px-md-5 font-['DM_Sans']">
        <div
          className="position-relative overflow-hidden rounded-2xl shadow-md bg-white mb-4 px-4 px-md-5 py-4 py-md-5 text-white"
          style={{ background: "linear-gradient(135deg, #0f766e 0%, #1d4ed8 45%, #0f172a 100%)" }}
        >
          <div
            className="position-absolute top-0 start-0 w-100 h-100 opacity-50"
            style={{
              background:
                "radial-gradient(circle at top left, rgba(255,255,255,0.22), transparent 35%), radial-gradient(circle at 85% 20%, rgba(56,189,248,0.25), transparent 30%), linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0))",
            }}
          ></div>
          <div className="position-relative d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
            <h1 className="mb-0 text-4xl font-['Outfit'] font-bold tracking-tight">My Health Profile</h1>
            {!editing ? (
              <button
                onClick={startEditing}
                className="btn d-inline-flex align-items-center gap-2 backdrop-blur-sm bg-white bg-opacity-10 border border-white border-opacity-30 text-white rounded-pill px-4 px-md-6 py-2 fw-bold shadow-sm transition-all duration-200 ease-in-out hover:bg-white hover:bg-opacity-20"
              >
                <Edit2 size={18} /> Edit Profile
              </button>
            ) : (
              <div className="d-flex gap-2">
                <button onClick={cancelEdit} className="btn btn-light rounded-pill px-4 fw-bold shadow-sm transition-all duration-200 ease-in-out">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2 transition-all duration-200 ease-in-out"
                >
                  <Save size={18} /> Save Changes
                </button>
              </div>
            )}
          </div>
        </div>

        {!editing ? (
            <div className="mx-auto" style={{ maxWidth: '1440px' }}>
                {/* MATERIALLY MATCHED IDENTITY CARD */}
                <div className="card clinical-panel mb-4 border-0 rounded-2xl shadow-lg bg-white p-4 p-md-5">
                    <div className="d-flex flex-wrap flex-lg-nowrap gap-4">
                        {/* Avatar Col */}
                        <div className="d-flex flex-column align-items-center gap-3 pe-lg-3">
                            <div
                              className="rounded-full p-0.5"
                              style={{
                                background: "linear-gradient(135deg, #60a5fa, #2dd4bf)",
                                boxShadow: "0 0 0 2px #60a5fa, 0 0 0 6px rgba(255,255,255,0.95)",
                              }}
                            >
                            <div className="patient-img-large overflow-hidden rounded-full bg-white">
                                {profile.profile_image ? (
                                    <img src={toAssetUrl(profile.profile_image)} alt={profile.full_name} className="w-100 h-100 object-fit-cover" />
                                ) : (
                                    <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary"><User size={64} /></div>
                                )}
                            </div>
                            </div>
                            <div className="d-flex gap-2 flex-wrap justify-content-center">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-600 border border-red-200">ALCOHOL</div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200">SMOKER</div>
                            </div>
                        </div>

                        {/* Details Col */}
                        <div className="flex-grow-1 d-flex flex-column justify-content-between gap-4">
                            {/* Top row */}
                            <div className="d-flex justify-content-between align-items-start w-100">
                                <div>
                                    <div className="d-flex align-items-center gap-3 mb-2 flex-wrap">
                                        <h2 className="mb-0 text-2xl font-['Outfit'] font-bold text-slate-800">{profile.full_name}</h2>
                                        <div className="d-flex gap-2">
                                            <button className="btn btn-light btn-sm rounded-circle p-2 shadow-sm border border-light d-flex align-items-center justify-content-center transition-all duration-200 ease-in-out hover:bg-slate-100"><Phone size={14} className="text-secondary"/></button>
                                            <button className="btn btn-light btn-sm rounded-circle p-2 shadow-sm border border-light d-flex align-items-center justify-content-center transition-all duration-200 ease-in-out hover:bg-slate-100"><Mail size={14} className="text-secondary"/></button>
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
                                <button onClick={startEditing} className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700 border border-blue-200 rounded-lg px-3 py-1 hover:bg-blue-50 transition-all">
                                    <Edit2 size={14} /> Edit
                                </button>
                            </div>

                            {/* Bottom row: Vitals + Tags */}
                            <div className="d-flex flex-wrap flex-xl-nowrap justify-content-between align-items-center gap-4">
                                {/* Vitals Box */}
                                <div className="d-flex flex-wrap gap-3">
                                    <div className="bg-slate-50 rounded-xl px-4 py-3 text-center border border-slate-100 min-w-[108px]">
                                        <div className="text-xs text-slate-400 uppercase tracking-wider">BMI</div>
                                        <div className="text-xl font-bold text-slate-800">{bmi}</div>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl px-4 py-3 text-center border border-slate-100 min-w-[108px]">
                                        <div className="text-xs text-slate-400 uppercase tracking-wider">Weight</div>
                                        <div className="text-xl font-bold text-slate-800">{profile.weight_kg || 'N/A'}</div>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl px-4 py-3 text-center border border-slate-100 min-w-[108px]">
                                        <div className="text-xs text-slate-400 uppercase tracking-wider">Height</div>
                                        <div className="text-xl font-bold text-slate-800">{profile.height_cm || 'N/A'}</div>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl px-4 py-3 text-center border border-slate-100 min-w-[108px]">
                                        <div className="text-xs text-slate-400 uppercase tracking-wider">Blood Type</div>
                                        <div className="text-xl font-bold text-slate-800">{profile.blood_group || 'N/A'}</div>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="d-flex flex-column align-items-end gap-3 text-end">
                                    <div className="d-flex flex-column align-items-end gap-1">
                                        <span className="text-dark fw-bolder mb-1 font-['Outfit']" style={{fontSize: '0.75rem'}}>Own diagnosis</span>
                                        <div className="d-flex gap-2 flex-wrap justify-content-end">
                                            {(clinicalData?.conditions || []).filter(c => c.status === 'active').slice(0, 2).map((c, i) =>(
                                               <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">{c.condition_name}</span>
                                            ))}
                                            {(!clinicalData?.conditions || clinicalData.conditions.length === 0) && <span className="text-muted small">None</span>}
                                        </div>
                                    </div>
                                    <div className="d-flex flex-column align-items-end gap-1">
                                        <span className="text-dark fw-bolder mb-1 font-['Outfit']" style={{fontSize: '0.75rem'}}>Known Allergies</span>
                                        <div className="d-flex gap-2 flex-wrap justify-content-end">
                                            {(clinicalData?.allergies || []).slice(0, 2).map((a, i) =>(
                                               <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">{a.allergy_name}</span>
                                            ))}
                                            {(!clinicalData?.allergies || clinicalData.allergies.length === 0) && <span className="text-muted small">None</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MIDDLE ROW Grid */}
                <div className="row g-4 mb-4">
                    {/* TIMELINE */}
                    <div className="col-12 col-lg-4">
                        <div className="clinical-panel h-100 rounded-2xl shadow-md bg-white p-4 p-md-5">
                            <div className="panel-header">
                                <div className="panel-title font-['Outfit'] fw-bold"><Calendar size={18} className="text-primary" /> Timeline</div>
                                <button className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700 border border-blue-200 rounded-lg px-3 py-1 hover:bg-blue-50 transition-all">Edit</button>
                            </div>
                            <div className="pt-2" style={{ maskImage: "linear-gradient(to bottom, black 70%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 70%, transparent 100%)" }}>
                                {(clinicalData?.timeline || []).slice(0, 5).map((appt, i) => {
                                    const dateObj = new Date(appt.appointment_date);
                                    const month = dateObj.toLocaleString('default', { month: 'short' });
                                    const year = dateObj.getFullYear();
                                    return (
                                    <div key={i} className="timeline-row hover:bg-slate-50 rounded-xl px-3 py-2 transition-all cursor-default">
                                        <div className="timeline-left"><span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{month}</span><span className="text-xs text-slate-400">{year}</span></div>
                                        <div className="timeline-center"><div className={`timeline-marker w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-100 ${i === 0 ? 'animate-pulse' : ''}`}></div></div>
                                        <div className="timeline-right">
                                            <div className="timeline-title font-['Outfit']">{appt.reason || 'General Appt'}</div>
                                            <div className="timeline-subtitle text-xs text-slate-400 mt-0.5">Dr. {appt.doctor_name || 'Specialist'}</div>
                                        </div>
                                    </div>
                                    );
                                })}
                                {(!clinicalData?.timeline || clinicalData.timeline.length === 0) && <div className="text-muted text-center pt-4 fw-bold">No recent history</div>}
                            </div>
                        </div>
                    </div>

                    {/* EMERGENCY / CONTACT (Replaced Medical History with Emergency logic for Profile page) */}
                    <div className="col-12 col-lg-8">
                        <div className="clinical-panel h-100 rounded-2xl shadow-md bg-white p-4 p-md-5">
                            <div className="panel-header">
                                <div className="panel-title font-['Outfit'] fw-bold"><span className="d-inline-flex align-items-center justify-content-center bg-red-50 p-2 rounded-lg text-red-500"><ShieldAlert size={18} /></span> Emergency Support</div>
                                <button className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700 border border-blue-200 rounded-lg px-3 py-1 hover:bg-blue-50 transition-all" onClick={startEditing}>Edit</button>
                            </div>
                            <div className="row g-3">
                                {emergencyContacts.map((c, i) => (
                                    <div key={i} className="col-md-6">
                                        <div className="position-relative rounded-xl border border-slate-200 shadow-sm p-4 p-md-5 hover:shadow-md hover:border-blue-200 transition-all bg-white h-100" style={c.is_primary ? { borderLeft: "4px solid #f87171" } : {}}>
                                            {c.is_primary && <span className="position-absolute top-0 end-0 translate-middle-y me-4 text-xs bg-red-500 text-white px-2 py-0.5 rounded-pill fw-semibold">PRIMARY</span>}
                                            <div className="med-history-header">
                                                <div className="d-inline-flex align-items-center justify-content-center bg-red-50 p-2 rounded-lg text-red-500"><Phone size={14} className={c.is_primary ? 'text-primary' : ''}/></div>
                                                <span className="med-history-title font-['Outfit']">{c.relationship || 'Emergency Contact'}</span>
                                            </div>
                                            <div className="med-history-data font-['Outfit'] text-slate-800">{c.contact_name}</div>
                                            <div className="d-flex align-items-center gap-2 fw-semibold text-slate-700 mt-2"><Phone size={14} className="text-blue-500" /> {c.phone}</div>
                                            <div className="d-flex align-items-center gap-2 text-sm text-slate-400 mt-1"><Mail size={14} /> {c.email}</div>
                                        </div>
                                    </div>
                                ))}
                                {emergencyContacts.length === 0 && <div className="col-12 text-muted fw-bold">No emergency contacts listed</div>}
                                
                                <div className="col-12 mt-4">
                                    <div className="rounded-xl border border-slate-200 shadow-sm p-4 p-md-5 hover:shadow-md hover:border-blue-200 transition-all bg-white">
                                        <div className="med-history-header">
                                            <div className="d-inline-flex align-items-center justify-content-center bg-blue-50 p-2 rounded-lg text-blue-500"><MapPin size={14} /></div>
                                            <span className="med-history-title font-['Outfit']">Personal Address</span>
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

                {/* BOTTOM ROW Grid */}
                <div className="row g-4 mb-5">
                    {/* MEDICATIONS */}
                    <div className="col-12 col-lg-8">
                        <div className="clinical-panel h-100 rounded-2xl shadow-md bg-white p-4 p-md-5 d-flex flex-column">
                            <div className="panel-header m-0 mb-3">
                                <div className="panel-title font-['Outfit'] fw-bold"><Pill size={18} className="text-primary" /> Active Medications</div>
                                <button className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700 border border-blue-200 rounded-lg px-3 py-1 hover:bg-blue-50 transition-all">Edit</button>
                            </div>
                            <div className="d-flex flex-column gap-3 flex-grow-1">
                                {(clinicalData?.medications || []).filter(m => m.status === 'active').map((med, i) => (
                                    <div key={i} className="d-flex flex-column flex-md-row align-items-md-center justify-content-between bg-white rounded-xl border border-slate-100 shadow-sm px-4 px-md-5 py-4 hover:bg-slate-50 transition-all gap-3" style={{ borderLeft: "4px solid #60a5fa" }}>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-blue-50 p-2 rounded-lg text-blue-500"><Pill size={18}/></div>
                                            <div>
                                                <div className="font-semibold text-slate-800 font-['Outfit']">{med.drug_name}</div>
                                                <div className="text-sm text-slate-400">{med.dosage} / {med.frequency}</div>
                                            </div>
                                        </div>
                                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold align-self-start align-self-md-center">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            ACTIVE
                                        </span>
                                    </div>
                                ))}
                                {(!clinicalData?.medications || clinicalData.medications.filter(m => m.status === 'active').length === 0) && <div className="text-center py-4 fw-bold text-muted">No active medications</div>}
                            </div>
                        </div>
                    </div>

                    {/* DIET */}
                    <div className="col-12 col-lg-4">
                        <div className="clinical-panel h-100 rounded-2xl shadow-md bg-white p-4 p-md-5 d-flex flex-column">
                            <div className="panel-header mb-3">
                                <div className="panel-title font-['Outfit'] fw-bold"><Activity size={18} className="animate-pulse text-blue-500" /> Conditions Log</div>
                            </div>
                            <div className="d-flex flex-column pt-1 overflow-auto pe-2" style={{ maxHeight: "420px" }}>
                                {(clinicalData?.conditions || []).map((c, i) => (
                                    <div key={i} className="d-flex align-items-center justify-content-between py-3 px-2 hover:bg-slate-50 rounded-lg transition-all">
                                        <div className="d-flex align-items-center gap-2 font-semibold text-slate-800"><Heart size={16} className={c.status === 'active' ? 'text-emerald-500' : c.status === 'severe' ? 'text-red-500' : 'text-amber-500'}/> {c.condition_name}</div>
                                        <span className={`text-white px-2 py-0.5 rounded-full text-xs font-bold ${c.status === 'active' ? 'bg-emerald-500' : c.status === 'severe' ? 'bg-red-500' : 'bg-amber-400'}`}>{String(c.status).toUpperCase()}</span>
                                    </div>
                                ))}
                                {(clinicalData?.allergies || []).map((a, i) => (
                                    <div key={i + 10} className="d-flex align-items-center justify-content-between py-3 px-2 hover:bg-slate-50 rounded-lg transition-all">
                                        <div className="d-flex align-items-center gap-2 font-semibold text-slate-800"><ShieldAlert size={16} className={String(a.severity).toLowerCase() === 'severe' ? 'text-red-500' : String(a.severity).toLowerCase() === 'moderate' ? 'text-amber-500' : 'text-emerald-500'}/> {a.allergy_name}</div>
                                        <span className={`text-white px-2 py-0.5 rounded-full text-xs font-bold ${String(a.severity).toLowerCase() === 'severe' ? 'bg-red-500' : String(a.severity).toLowerCase() === 'moderate' ? 'bg-amber-400' : 'bg-emerald-500'}`}>{String(a.severity).toUpperCase()}</span>
                                    </div>
                                ))}
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
