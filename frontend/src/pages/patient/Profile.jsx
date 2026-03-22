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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-50">
      <div className="background-decoration">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="profile-container py-4 px-3 px-md-5 font-['DM_Sans']">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-blue-700 to-indigo-800 px-10 py-12 mb-6">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_70%_50%,_white,_transparent)]" />
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
          <div className="position-relative d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
            <h1 className="text-4xl font-black text-white tracking-tight relative z-10 mb-0">My Health Profile</h1>
            {!editing ? (
              <button
                onClick={startEditing}
                className="relative z-10 flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold px-5 py-2.5 rounded-xl backdrop-blur-sm transition-all duration-200 text-sm"
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
                <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.10)] border border-slate-100 p-8 mb-6">
                    <div className="d-flex flex-wrap flex-lg-nowrap gap-4">
                        {/* Avatar Col */}
                        <div className="d-flex flex-column align-items-center gap-3 pe-lg-3">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-blue-100 shadow-xl shrink-0">
                                {profile.profile_image ? (
                                    <img src={toAssetUrl(profile.profile_image)} alt={profile.full_name} className="w-100 h-100 object-fit-cover" />
                                ) : (
                                    <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary"><User size={64} /></div>
                                )}
                            </div>
                            <div className="d-flex gap-2 flex-wrap justify-content-center">
                                <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 rounded-full px-3 py-1.5 text-xs font-bold">ALCOHOL</div>
                                <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full px-3 py-1.5 text-xs font-bold">SMOKER</div>
                            </div>
                        </div>

                        {/* Details Col */}
                        <div className="flex-grow-1 d-flex flex-column justify-content-between gap-4">
                            {/* Top row */}
                            <div className="d-flex justify-content-between align-items-start w-100">
                                <div>
                                    <div className="d-flex align-items-center gap-3 mb-2 flex-wrap">
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-0">{profile.full_name}</h2>
                                        <div className="d-flex gap-2">
                                            <button className="btn btn-light btn-sm rounded-circle p-2 shadow-sm border border-light d-flex align-items-center justify-content-center transition-all duration-200 ease-in-out hover:bg-slate-100"><Phone size={14} className="text-secondary"/></button>
                                            <button className="btn btn-light btn-sm rounded-circle p-2 shadow-sm border border-light d-flex align-items-center justify-content-center transition-all duration-200 ease-in-out hover:bg-slate-100"><Mail size={14} className="text-secondary"/></button>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-500 mt-1">
                                        <span className="d-flex align-items-center gap-2"><User className="text-blue-400 w-4 h-4" /> {profile.gender || 'Not Specified'}</span>
                                        <span className="d-flex align-items-center gap-2"><MapPin className="text-blue-400 w-4 h-4" /> {profile.city || 'Elshiekh zayed, Giza'}</span>
                                        <span className="d-flex align-items-center gap-2"><Calendar className="text-blue-400 w-4 h-4" /> {profile.date_of_birth} ({age} years)</span>
                                        <span className="d-flex align-items-center gap-2"><Phone className="text-blue-400 w-4 h-4" /> {profile.phone}</span>
                                        <span className="d-flex align-items-center gap-2"><Mail className="text-blue-400 w-4 h-4" /> {profile.email}</span>
                                    </div>
                                </div>
                                <button onClick={startEditing} className="flex items-center gap-1.5 text-sm font-semibold text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-4 py-2 rounded-xl transition-all">
                                    <Edit2 size={14} /> Edit
                                </button>
                            </div>

                            {/* Bottom row: Vitals + Tags */}
                            <div className="d-flex flex-wrap flex-xl-nowrap justify-content-between align-items-start gap-4">
                                {/* Vitals Box */}
                                <div className="grid grid-cols-4 gap-3 mt-5">
                                    <div className="flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white border border-slate-100 rounded-2xl py-4 px-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                                        <div className="text-2xl font-black text-slate-800">{bmi}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 text-center">BMI</div>
                                    </div>
                                    <div className="flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white border border-slate-100 rounded-2xl py-4 px-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                                        <div className="text-2xl font-black text-slate-800">{profile.weight_kg || 'N/A'}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 text-center">Weight</div>
                                    </div>
                                    <div className="flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white border border-slate-100 rounded-2xl py-4 px-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                                        <div className="text-2xl font-black text-slate-800">{profile.height_cm || 'N/A'}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 text-center">Height</div>
                                    </div>
                                    <div className="flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white border border-slate-100 rounded-2xl py-4 px-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                                        <div className="text-2xl font-black text-slate-800">{profile.blood_group || 'N/A'}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 text-center">Blood Type</div>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="d-flex flex-column align-items-end gap-3 text-end">
                                    <div className="d-flex flex-column align-items-end gap-1">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Own Diagnosis</span>
                                        <div className="d-flex gap-2 flex-wrap justify-content-end">
                                            {(clinicalData?.conditions || []).filter(c => c.status === 'active').slice(0, 2).map((c, i) =>(
                                               <span key={i} className="bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full px-3 py-1 text-xs font-semibold">{c.condition_name}</span>
                                            ))}
                                            {(!clinicalData?.conditions || clinicalData.conditions.length === 0) && <span className="text-muted small">None</span>}
                                        </div>
                                    </div>
                                    <div className="d-flex flex-column align-items-end gap-1">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 mt-3">Known Allergies</span>
                                        <div className="d-flex gap-2 flex-wrap justify-content-end">
                                            {(clinicalData?.allergies || []).slice(0, 2).map((a, i) =>(
                                               <span key={i} className="bg-rose-50 text-rose-600 border border-rose-200 rounded-full px-3 py-1 text-xs font-semibold">{a.allergy_name}</span>
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
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6 h-full">
                            <div className="panel-header">
                                <div className="text-base font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-5"><Calendar className="text-blue-500 w-5 h-5" /> Timeline</div>
                                <button className="text-sm font-semibold text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-4 py-2 rounded-xl transition-all">Edit</button>
                            </div>
                            <div className="pt-2 relative" style={{ maskImage: "linear-gradient(to bottom, black 70%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 70%, transparent 100%)" }}>
                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-blue-200 to-transparent"></div>
                                {(clinicalData?.timeline || []).slice(0, 5).map((appt, i) => {
                                    const dateObj = new Date(appt.appointment_date);
                                    const month = dateObj.toLocaleString('default', { month: 'short' });
                                    const year = dateObj.getFullYear();
                                    return (
                                    <div key={i} className="group flex items-start gap-3 hover:bg-slate-50 rounded-xl px-3 py-2.5 -mx-3 transition-all cursor-default">
                                        <div className="timeline-left"><span className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">{month}</span><span className="text-[10px] text-slate-400 leading-none mt-0.5">{year}</span></div>
                                        <div className="timeline-center"><div className={i === 0 ? "w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-200 shadow-sm z-10 shrink-0 animate-pulse" : "w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-100 shadow-sm z-10 shrink-0"}></div></div>
                                        <div className="timeline-right">
                                            <div className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{appt.reason || 'General Appt'}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">Dr. {appt.doctor_name || 'Specialist'}</div>
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
                        <div className="bg-white rounded-2xl border border-rose-100 shadow-md p-6">
                            <div className="panel-header">
                                <div className="flex items-center gap-2"><span className="bg-rose-100 p-2 rounded-xl"><ShieldAlert className="text-rose-500 w-5 h-5" /></span><span className="text-base font-black text-slate-800 uppercase tracking-widest">Emergency Support</span></div>
                                <button className="text-sm font-semibold text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-4 py-2 rounded-xl transition-all" onClick={startEditing}>Edit</button>
                            </div>
                            <div className="row g-3">
                                {emergencyContacts.map((c, i) => (
                                    <div key={i} className="col-md-6">
                                        <div className={c.is_primary ? "relative bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-5 shadow-lg hover:-translate-y-0.5 transition-all" : "bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-default"}>
                                            {c.is_primary && <span className="absolute top-3 right-3 bg-blue-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">PRIMARY</span>}
                                            <div className="med-history-header">
                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">{c.relationship || 'Emergency Contact'}</div>
                                            </div>
                                            <div className="text-base font-black text-slate-800 mt-2">{c.contact_name}</div>
                                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mt-1"><Phone className="text-blue-400 w-4 h-4 shrink-0" /> {c.phone}</div>
                                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1"><Mail className="text-slate-300 w-4 h-4 shrink-0" /> {c.email}</div>
                                        </div>
                                    </div>
                                ))}
                                {emergencyContacts.length === 0 && <div className="col-12 text-muted fw-bold">No emergency contacts listed</div>}
                                
                                <div className="col-12 mt-4">
                                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mt-3">
                                        <div className="med-history-header">
                                            <MapPin className="text-blue-400 w-4 h-4" />
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Personal Address</span>
                                        </div>
                                        <div className="text-base font-black text-slate-800 mt-1">{profile.address}</div>
                                        <div className="text-sm text-slate-500 mt-0.5">{profile.city}, {profile.state}</div>
                                        <div className="text-sm text-slate-500 mt-0.5">{profile.country} - {profile.pincode}</div>
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
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6">
                            <div className="panel-header m-0 mb-3">
                                <div className="text-base font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><Pill className="text-blue-500 w-5 h-5" /> Active Medications</div>
                                <button className="text-sm font-semibold text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-4 py-2 rounded-xl transition-all">Edit</button>
                            </div>
                            <div className="d-flex flex-column gap-3 flex-grow-1">
                                {(clinicalData?.medications || []).filter(m => m.status === 'active').map((med, i) => (
                                    <div key={i} className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md hover:border-blue-100 hover:-translate-y-0.5 transition-all group mb-2">
                                        <div className="w-1 h-10 rounded-full bg-blue-400 shrink-0" />
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-blue-50 p-2.5 rounded-xl group-hover:bg-blue-100 transition-colors shrink-0"><Pill className="text-blue-500 w-4 h-4" /></div>
                                            <div className="flex-1">
                                                <div className="text-sm font-bold text-slate-800 flex-1">{med.drug_name}</div>
                                                <div className="text-xs text-slate-400 mt-0.5">{med.dosage} / {med.frequency}</div>
                                            </div>
                                        </div>
                                        <span className="ml-auto flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6 h-full">
                            <div className="panel-header mb-3">
                                <div className="text-base font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><Activity className="text-blue-500 w-5 h-5 animate-pulse" /> Conditions Log</div>
                            </div>
                            <div className="d-flex flex-column pt-1 overflow-auto pe-2" style={{ maxHeight: "420px" }}>
                                {(clinicalData?.conditions || []).map((c, i) => (
                                    <div key={i} className={`flex items-center justify-between px-3 py-3 rounded-xl hover:bg-slate-50 transition-all group border-l-2 mb-1 ${c.status === 'active' ? 'border-l-emerald-300' : c.status === 'severe' ? 'border-l-rose-400' : 'border-l-amber-300'}`}>
                                        <div className="d-flex align-items-center gap-2"><Heart className={c.status === 'active' ? 'text-emerald-400 w-4 h-4' : c.status === 'severe' ? 'text-rose-400 w-4 h-4' : 'text-amber-400 w-4 h-4'} /> <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{c.condition_name}</span></div>
                                        <span className={c.status === 'active' ? 'bg-emerald-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider' : c.status === 'severe' ? 'bg-rose-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider' : 'bg-amber-400 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider'}>{String(c.status).toUpperCase()}</span>
                                    </div>
                                ))}
                                {(clinicalData?.allergies || []).map((a, i) => (
                                    <div key={i + 10} className={`flex items-center justify-between px-3 py-3 rounded-xl hover:bg-slate-50 transition-all group border-l-2 mb-1 ${String(a.severity).toLowerCase() === 'severe' ? 'border-l-rose-400' : String(a.severity).toLowerCase() === 'moderate' ? 'border-l-amber-300' : 'border-l-emerald-300'}`}>
                                        <div className="d-flex align-items-center gap-2"><ShieldAlert className={String(a.severity).toLowerCase() === 'severe' ? 'text-rose-400 w-4 h-4' : String(a.severity).toLowerCase() === 'moderate' ? 'text-amber-400 w-4 h-4' : 'text-emerald-400 w-4 h-4'} /> <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{a.allergy_name}</span></div>
                                        <span className={String(a.severity).toLowerCase() === 'severe' ? 'bg-rose-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider' : String(a.severity).toLowerCase() === 'moderate' ? 'bg-amber-400 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider' : 'bg-emerald-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider'}>{String(a.severity).toUpperCase()}</span>
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
