import React, { useEffect, useState, useRef } from 'react';
import { getDoctorProfile, updateDoctorProfile, uploadProfileImage } from '../../services/doctorProfileService';
import { 
  User, Briefcase, Shield, Edit2, Save, X, Camera, Award, MapPin, Search, ChevronRight, Activity, Clock, Calendar, Star, CheckCircle, Plus
} from 'lucide-react';
import ExpertiseTags from '../../components/doctor/ExpertiseTags';
import AvailabilityModal from '../../components/doctor/AvailabilityModal';
import { fetchSpecialties } from '../../services/adminDoctorAPI';
import { toAssetUrl } from '../../utils/media';
import '../../styles/profile-dashboard.css';

const Profile = () => {
    const fileInputRef = useRef(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Core state
    const [isEditing, setIsEditing] = useState(false);
    const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [specialties, setSpecialties] = useState([]);
    const [activeTab, setActiveTab] = useState('dashboard');

    useEffect(() => {
        fetchProfile();
        loadSpecialties();
    }, []);

    const loadSpecialties = async () => {
        try {
            const data = await fetchSpecialties();
            setSpecialties(data.specialties || []);
        } catch (err) {
            console.error('Failed to load specialties', err);
        }
    };

    const fetchProfile = async () => {
        try {
            const data = await getDoctorProfile();
            setProfile(data);
            setFormData(data); 
        } catch (err) {
            setError('Failed to load profile.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            const updatedProfile = await updateDoctorProfile(formData);
            setProfile(updatedProfile);
            setFormData(updatedProfile);
            setIsEditing(false);
            alert("Profile updated successfully!"); 
        } catch (err) {
            console.error("Failed to update profile", err);
            alert("Failed to update profile. Please try again.");
        }
    };

    const cancelEdit = () => {
        setFormData(profile); 
        setIsEditing(false);
    };

    // --- Image Upload Handler ---
    const handleImageClick = () => {
        if (isEditing && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const response = await uploadProfileImage(file); 
            if (response.image_url) {
                setProfile(prev => ({ ...prev, profile_image: response.image_url }));
                setFormData(prev => ({ ...prev, profile_image: response.image_url }));
                alert("Profile photo updated!");
            }
        } catch (error) {
            console.error("Image upload failed", error);
            alert("Failed to upload image.");
        }
    };

    // --- Tag Handlers (Local State until Save) ---
    const handleAddTag = (newTag) => {
        if (!formData.expertise_tags) return;
        const exists = formData.expertise_tags.some(t => 
            (typeof t === 'string' ? t : t.tag_name) === newTag
        );
        if (exists) return;

        setFormData(prev => ({
            ...prev,
            expertise_tags: [...(prev.expertise_tags || []), { tag_name: newTag }]
        }));
    };

    const handleRemoveTag = (tagIdOrName) => {
        setFormData(prev => ({
            ...prev,
            expertise_tags: prev.expertise_tags.filter(t => {
                const val = typeof t === 'string' ? t : (t.id || t.tag_name);
                return val !== tagIdOrName;
            })
        }));
    };
    
    // --- Availability Update Handler (from Modal) ---
    const handleAvailabilityUpdate = (updatedProfile) => {
        setProfile(updatedProfile);
        setFormData(updatedProfile);
    };

    if (loading) return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
            <div className="spinner-border text-primary border-3" style={{ width: '3rem', height: '3rem' }} role="status"></div>
        </div>
    );
    
    if (error) return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 text-danger fw-medium">
            Error: {error}
        </div>
    );

    if (!profile) return null;

    return (
        <div className="dash-page-bg">
            <div className="dash-container">
                
                {/* Header Navigation Area */}
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                    <div className="dash-header-nav mb-0">
                        <button className="dash-header-btn active">Dashboard</button>
                        <button className="dash-header-btn" onClick={() => setIsEditing(!isEditing)}>
                            {isEditing ? 'Editing Mode' : 'Profile Settings'}
                        </button>
                    </div>
                </div>

                <div className="row g-0">
                    {/* Left Column (Main content area) */}
                    <div className="col-12 col-xl-9 pe-xl-4 pb-4">
                        
                        {/* Title Section */}
                        <div className="mb-4">
                            <h1 className="dash-title">Smart online profiles</h1>
                            <p className="dash-subtitle mb-0">Using technology and expert algorithms, we offer you the opportunity to organize your professional information gracefully.</p>
                        </div>

                        <div className="row g-4 mb-4">
                            {/* Biggest Card: Image + Title */}
                            <div className="col-12 col-lg-7">
                                <div className="dash-card-white position-relative d-flex flex-column h-100 p-0 overflow-hidden">
                                    <div className="dash-img-container rounded-0" style={{ height: '320px', backgroundColor: '#f8fafc' }}>
                                        <img 
                                            src={toAssetUrl(formData.profile_image) || "https://via.placeholder.com/600x400"} 
                                            alt="Doctor Profile" 
                                            className="w-100 h-100 object-fit-cover"
                                        />
                                        
                                        {/* Fake controls to match the reference */}
                                        <div className="position-absolute top-0 start-0 p-3">
                                            <div className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{width: '40px', height: '40px'}}>
                                                <User size={20} color="#475569" />
                                            </div>
                                        </div>
                                        
                                        {!isEditing ? (
                                            <button className="dash-img-overlay-btn" onClick={() => setIsEditing(true)}>
                                                Edit Profile <ChevronRight size={16} />
                                            </button>
                                        ) : (
                                            <div className="dash-file-input-overlay" onClick={handleImageClick}>
                                                <Camera color="#fff" size={40} />
                                            </div>
                                        )}
                                        <input type="file" ref={fileInputRef} className="d-none" accept="image/*" onChange={handleFileChange} />
                                    </div>
                                    <div className="p-4 bg-white">
                                        <h3 className="fw-bolder fs-4 mb-1 text-dark">{formData.full_name || "Dr. Name"}</h3>
                                        <p className="text-secondary fw-medium mb-0 d-flex align-items-center gap-2">
                                            <MapPin size={14}/> {formData.hospital_name || "Hospital"} &bull; {formData.specialization || "Specialist"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Top Right: Chart / Bar activity */}
                            <div className="col-12 col-lg-5">
                                <div className="dash-card">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h4 className="fs-6 fw-bold text-dark mb-0 d-flex flex-column">
                                            Physiological <br /> state of users
                                        </h4>
                                        <div className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{width: '40px', height: '40px'}}>
                                            <Activity size={20} color="#475569" />
                                        </div>
                                    </div>
                                    
                                    {/* Mock bar chart mimicking reference */}
                                    <div className="dash-chart-bars">
                                        {[40, 70, 50, 60, 45, 65, 55].map((h, i) => (
                                            <div className="dash-chart-bar-wrap" key={i}>
                                                <div className={`dash-bar ${i === 1 ? 'active' : ''}`} style={{ height: `${h}%` }}></div>
                                                <span className="dash-chart-label" style={{ bottom: '-20px' }}>
                                                    {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row g-4">
                            {/* Smart Lessons box (Bio & Tags) */}
                            <div className="col-12 col-lg-5">
                                <div className="dash-card-white h-100">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="fs-6 fw-bold text-dark mb-0">Professional Summary #95</h5>
                                        <span className="badge bg-light text-secondary border rounded-pill">Info</span>
                                    </div>
                                    
                                    {isEditing ? (
                                        <textarea 
                                            name="bio" 
                                            className="dash-input text-secondary mb-3" 
                                            value={formData.bio || ''} 
                                            onChange={handleChange} 
                                            rows={4}
                                            placeholder="Biography..."
                                        />
                                    ) : (
                                        <p className="small text-secondary fw-medium mb-4" style={{ lineHeight: '1.6' }}>
                                            {profile.bio || "Let our advanced platform guide you through managing your medical practice online with serenity and focus. No bio set yet."}
                                        </p>
                                    )}

                                    <div className="dash-tags-container pb-2">
                                        {formData.expertise_tags?.slice(0, 4).map((tag, idx) => (
                                            <span key={idx} className={`dash-tag ${idx === 1 ? 'active' : ''}`}>#{typeof tag === 'string' ? tag : tag.tag_name}</span>
                                        ))}
                                        {(!formData.expertise_tags || formData.expertise_tags.length === 0) && (
                                            <>
                                                <span className="dash-tag">#health</span>
                                                <span className="dash-tag active">#online</span>
                                                <span className="dash-tag">#takecare</span>
                                                <span className="dash-tag">#medical</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Radial Chart Box */}
                            <div className="col-12 col-md-6 col-lg-3">
                                <div className="dash-card h-100 d-flex flex-column align-items-center justify-content-center text-center">
                                    <div className="dash-radial mb-3 shadow-sm">
                                        <div className="dash-radial-inner shadow-sm">
                                            <div className="fw-bolder fs-6 text-dark lh-1 mb-1">28</div>
                                            <div className="small text-secondary" style={{ fontSize: '0.65rem' }}>Sep</div>
                                        </div>
                                    </div>
                                    <h4 className="fs-3 fw-bolder text-dark mb-0" style={{ letterSpacing: '-1px' }}>%89.2</h4>
                                    <p className="small text-secondary fw-semibold mb-0">20 Minutes</p>
                                </div>
                            </div>

                            {/* Additional Stats Box */}
                            <div className="col-12 col-md-6 col-lg-4">
                                <div className="dash-card-white h-100 p-0 overflow-hidden d-flex flex-column justify-content-between pb-3">
                                    <div className="p-4 d-flex justify-content-between">
                                        <div>
                                            <h5 className="fs-6 fw-bold text-dark mb-1">Meditation<br/>Excellence</h5>
                                            <span className="badge border border-light text-secondary rounded-pill fw-medium" style={{ fontSize: '0.65rem' }}>Pro AI - based Chart</span>
                                        </div>
                                        <div className="d-flex flex-column align-items-end">
                                            <div className="d-flex align-items-center gap-1 text-dark fw-bold mb-1">
                                                <Star size={14} className="text-primary"/> 4.7
                                            </div>
                                            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center opacity-75" style={{width: '24px', height: '24px'}}>
                                                <div className="bg-white rounded-circle" style={{width: '6px', height: '6px'}}></div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="px-4 mt-auto">
                                        <svg viewBox="0 0 200 50" width="100%" height="40" className="opacity-75">
                                            <path d="M0 25 Q 25 5 50 25 T 100 25 T 150 25 T 200 45" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
                                            <circle cx="100" cy="25" r="3" fill="#3b82f6" />
                                        </svg>
                                        <div className="d-flex justify-content-between text-secondary mt-1" style={{ fontSize: '0.6rem', fontWeight: 600 }}>
                                            <span>24</span><span>25</span><span>26</span><span>27</span>
                                            <span className="bg-primary text-white rounded px-2">28</span>
                                            <span>29</span><span>30</span><span>31</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Edit Forms Area (if editing) */}
                        {isEditing && (
                            <div className="dash-card-white mt-4 animation-fade-in">
                                <h4 className="fs-5 fw-bold text-dark mb-4">Edit Core Details</h4>
                                <div className="row g-4">
                                    <div className="col-12 col-md-6">
                                        <label className="dash-label">Phone Number</label>
                                        <input name="phone" className="dash-input" value={formData.phone || ''} onChange={handleChange} />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="dash-label">Date of Birth</label>
                                        <input type="date" name="dob" className="dash-input" value={formData.dob || ''} onChange={handleChange} />
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <label className="dash-label">License No.</label>
                                        <input name="license_number" className="dash-input" value={formData.license_number || ''} onChange={handleChange} />
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <label className="dash-label">Specialization</label>
                                        <select name="specialization" className="dash-input" value={formData.specialization || ''} onChange={handleChange}>
                                            <option value="">Select Specialization</option>
                                            {specialties.map(spec => (
                                                <option key={spec} value={spec}>{spec}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <label className="dash-label">Consultation Fee (₹)</label>
                                        <input type="number" name="consultation_fee" className="dash-input" value={formData.consultation_fee || ''} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top border-light">
                                    <button className="btn btn-light fw-bold px-4 rounded-pill" onClick={cancelEdit}>Cancel</button>
                                    <button className="dash-btn-primary" style={{ width: 'auto' }} onClick={handleSave}>
                                        Save Changes <div className="dash-btn-primary-circle"><ChevronRight size={14}/></div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Side Panel */}
                    <div className="col-12 col-xl-3">
                        <div className="dash-right-panel">
                            {/* Top row actions in panel */}
                            <div className="d-flex justify-content-end mb-4">
                                <div className="badge border border-secondary text-secondary rounded-pill px-3 py-2 d-flex align-items-center gap-1 bg-white">
                                    About Zen State <ChevronRight size={14} />
                                </div>
                            </div>
                            
                            {/* Meditation Time -> Availability section */}
                            <div className="bg-white rounded-4 p-4 mb-4 shadow-sm border border-light">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: '36px', height: '36px' }}>
                                        <Clock size={18} />
                                    </div>
                                    <span className="small fw-semibold text-secondary text-uppercase" style={{ fontSize: '0.7rem' }}>Free and New Lessons</span>
                                </div>
                                
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="fs-6 fw-bold text-dark mb-0">Consultation Time</h5>
                                    <span className="text-dark fw-bold small">&#8593; 29.5%</span>
                                </div>

                                <div className="dash-date-pill">
                                    <span>Friday, Sep 28, 2023</span>
                                    <span>+</span>
                                </div>

                                <div className="dash-time-pills">
                                    <span className="dash-time-pill">07:00 AM</span>
                                    <span className="dash-time-pill">11:00 AM</span>
                                </div>
                                
                                <button className="dash-btn-primary" onClick={() => setIsAvailabilityModalOpen(true)}>
                                    Manage Schedule 
                                    <div className="dash-btn-primary-circle"><Calendar size={14}/></div>
                                </button>
                            </div>

                            {/* Try Yoga -> Credentials overview */}
                            <div className="bg-white rounded-pill p-2 d-flex align-items-center justify-content-between shadow-sm border border-light mb-4">
                                <div className="bg-primary text-white rounded-pill px-3 py-2 fw-semibold small">
                                    Credentials
                                </div>
                                <span className="small fw-medium text-secondary me-3">Take care and get started</span>
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-1" style={{ width: '32px', height: '32px', cursor: 'pointer' }}>
                                    <ChevronRight size={14}/>
                                </div>
                            </div>

                            <div className="d-flex justify-content-between align-items-center px-2">
                                <h6 className="fw-bold fs-6 text-dark mb-0">Level 2</h6>
                                <span className="small text-secondary fw-semibold">&plusmn; 3.45 h</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <AvailabilityModal 
                isOpen={isAvailabilityModalOpen}
                onClose={() => setIsAvailabilityModalOpen(false)}
                availability={profile.availability}
                onUpdate={handleAvailabilityUpdate}
            />
        </div>
    );
};

export default Profile;
