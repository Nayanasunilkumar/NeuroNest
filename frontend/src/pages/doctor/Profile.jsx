import React, { useEffect, useState, useRef } from 'react';
import { getDoctorProfile, updateDoctorProfile, uploadProfileImage } from '../../services/doctorProfileService';
import { 
  Camera, Briefcase, FileText, Phone, Award, Shield, DollarSign, Hospital, Globe, Clock, Settings, ArrowRight, User
} from 'lucide-react';
import ExpertiseTags from '../../components/doctor/ExpertiseTags';
import AvailabilityModal from '../../components/doctor/AvailabilityModal';
import { fetchSpecialties } from '../../services/adminDoctorAPI';
import { toAssetUrl } from '../../utils/media';
import { useTheme } from '../../context/ThemeContext';
import '../../styles/profile-dark.css';

const Profile = () => {
    const { isDark } = useTheme();
    const fileInputRef = useRef(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Core state
    const [isEditing, setIsEditing] = useState(false);
    const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [specialties, setSpecialties] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');

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
        setFormData(prev => ({ ...prev, [name]: value }));
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

    // --- Tag Handlers ---
    const handleAddTag = (newTag) => {
        if (!formData.expertise_tags) return;
        const exists = formData.expertise_tags.some(t => (typeof t === 'string' ? t : t.tag_name) === newTag);
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
    
    // --- Availability Update Handler ---
    const handleAvailabilityUpdate = (updatedProfile) => {
        setProfile(updatedProfile);
        setFormData(updatedProfile);
    };

    if (loading) return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 bg-black">
            <div className="spinner-border text-light border-3" role="status"></div>
        </div>
    );
    if (error) return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 text-danger fw-medium bg-black">
            Error: {error}
        </div>
    );
    if (!profile) return null;

    return (
        <div className={`dark-profile-page ${!isDark ? 'light-theme' : ''}`}>
            <div className="dark-container">
                <div className="dark-banner p-4">
                    {!isEditing && (
                        <button 
                            className="dark-btn-secondary ms-auto d-flex align-items-center gap-2" 
                            style={{marginTop: 0, width: 'auto'}} 
                            onClick={() => setIsEditing(true)}
                        >
                            <Settings size={14}/> Edit Profile
                        </button>
                    )}
                </div>
                
                <div className="dark-content-row">
                    {/* LEFT SIDEBAR */}
                    <div className="dark-sidebar">
                        <div className="dark-profile-img-wrap" onClick={handleImageClick}>
                            <img src={toAssetUrl(formData.profile_image) || "https://via.placeholder.com/300"} alt="Avatar" />
                            <span className="dark-verified-badge">&#10003;</span>
                            {isEditing && (
                                <div className="editing-overlay">
                                    <Camera color="#fff" size={24} />
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} className="d-none" accept="image/*" onChange={handleFileChange} />
                        </div>
                        
                        <h2 className="dark-username">{formData.full_name || "Dr. Name"}</h2>
                        <h3 className="dark-usertitle">{formData.specialization || "Clinical Specialist"}</h3>

                        <div className="dark-section-title mt-2">Skills and Expertise</div>
                        <div className="dark-tags">
                            {formData.expertise_tags?.length > 0 ? (
                                formData.expertise_tags.map((tag, idx) => (
                                    <span key={idx} className="dark-tag filled">
                                        {typeof tag === 'string' ? tag : tag.tag_name}
                                    </span>
                                ))
                            ) : (
                                <span className="dark-tag">#medical</span>
                            )}
                            {isEditing && (
                                <button className="dark-tag" style={{ borderStyle: 'dashed', cursor: 'pointer' }} onClick={() => {
                                    const tag = prompt("Enter new skill tag:");
                                    if(tag) handleAddTag(tag);
                                }}>+ Add</button>
                            )}
                        </div>

                        <div className="dark-section-title mt-2">Contact & Info</div>
                        <div className="dark-sidebar-list">
                            <div className="dark-sidebar-item">
                                <div className="dark-sidebar-icon"><Phone size={14} color="#00d2ff"/></div>
                                <div className="dark-sidebar-text">
                                    <span className="title">{formData.phone || "Not provided"}</span>
                                    <span className="subtitle">Phone Number</span>
                                </div>
                            </div>
                            <div className="dark-sidebar-item">
                                <div className="dark-sidebar-icon"><Hospital size={14} color="#00d2ff"/></div>
                                <div className="dark-sidebar-text">
                                    <span className="title">{formData.hospital_name || "Independent"}</span>
                                    <span className="subtitle">Facility / Network</span>
                                </div>
                            </div>
                            <div className="dark-sidebar-item">
                                <div className="dark-sidebar-icon"><Globe size={14} color="#00d2ff"/></div>
                                <div className="dark-sidebar-text">
                                    <span className="title">{formData.consultation_mode || "Mixed"}</span>
                                    <span className="subtitle">Modality</span>
                                </div>
                            </div>
                        </div>

                        <div className="dark-section-title">About Career</div>
                        {isEditing ? (
                            <textarea 
                                name="bio" 
                                className="dark-input mt-2" 
                                value={formData.bio || ''} 
                                onChange={handleChange} 
                                rows={6}
                                placeholder="Write your professional bio here..."
                            />
                        ) : (
                            <p className="dark-sidebar-bio">
                                {profile.bio || "No professional summary added yet. Focuses on creating scalable clinical experiences and elevating patient journeys."}
                            </p>
                        )}
                        
                    </div>

                    {/* MAIN RIGHT COLUMN */}
                    <div className="dark-main-content">
                        
                        <div className="dark-tabs d-flex flex-wrap">
                            <button className={`dark-tab ${activeTab === 'overview' ? 'dark-tab-box' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
                            <button className="dark-tab" style={{ marginLeft: 'auto' }} onClick={() => setIsAvailabilityModalOpen(true)}>
                                <Clock size={16} className="me-2"/> Scheduling
                            </button>
                        </div>

                        {/* VIEW MODE */}
                        {!isEditing && activeTab === 'overview' && (
                            <div className="dark-card-grid">
                                {/* Card 1: Senior credentials */}
                                <div className="dark-card">
                                    <div className="dark-card-header">
                                        <div className="dark-card-icon"><Briefcase size={20} color="#0055ff"/></div>
                                        <div className="dark-card-title-wrap">
                                            <span className="dark-card-title">Professional Background</span>
                                            <span className="dark-card-sub">Clinical Roles</span>
                                        </div>
                                    </div>
                                    <p className="dark-card-desc">
                                        The Specialist will create intuitive, scalable methodologies across advanced clinical platforms and ensure optimal patient outcomes through proven expertise.
                                    </p>
                                    <div className="dark-card-pills">
                                        <span className="dark-card-pill">{formData.qualification || "Degree"}</span>
                                        <span className="dark-card-pill">Min. {formData.experience_years || 0} Years</span>
                                        <span className="dark-card-pill">{formData.department || "Medical"}</span>
                                    </div>
                                </div>

                                {/* Card 2: Regulatory Identity */}
                                <div className="dark-card">
                                    <div className="dark-card-header">
                                        <div className="dark-card-icon"><Shield size={20} color="#0055ff"/></div>
                                        <div className="dark-card-title-wrap">
                                            <span className="dark-card-title">Regulatory Identity</span>
                                            <span className="dark-card-sub">Accreditations</span>
                                        </div>
                                    </div>
                                    <p className="dark-card-desc">
                                        As a registered medical practitioner, you shape next-generation clinical experiences securely, bridging trusted identities across systems.
                                    </p>
                                    <div className="dark-card-pills">
                                        <span className="dark-card-pill">Lic: {formData.license_number || "None"}</span>
                                        <span className="dark-card-pill">DOB: {formData.dob || "XX-XX"}</span>
                                        <span className="dark-card-pill">{formData.gender || "Gender"}</span>
                                    </div>
                                </div>

                                {/* Card 3: Consultation Format */}
                                <div className="dark-card">
                                    <div className="dark-card-header">
                                        <div className="dark-card-icon"><DollarSign size={20} color="#0055ff"/></div>
                                        <div className="dark-card-title-wrap">
                                            <span className="dark-card-title">Consultation Params</span>
                                            <span className="dark-card-sub">Monetization & Modes</span>
                                        </div>
                                    </div>
                                    <p className="dark-card-desc">
                                        Ensure clear and efficient transactional pipelines. Manage your consulting rates and operational modalities accurately to inform patients.
                                    </p>
                                    <div className="dark-card-pills">
                                        <span className="dark-card-pill">Fee: ₹{formData.consultation_fee || 0}</span>
                                        <span className="dark-card-pill">Format: {formData.consultation_mode || "Mixed"}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* EDIT MODE (Configuration Tab or Editing triggered) */}
                        {(isEditing || activeTab === 'manage') && (
                            <div className="dark-edit-form">
                                <h4 className="text-white mb-4 fw-bold">Update Infrastructure Logic <br/><span className="text-secondary fw-normal fs-6">Manage data bindings for your core credentials.</span></h4>
                                
                                <div className="row">
                                    <div className="col-12 col-md-4 dark-input-group">
                                        <label className="dark-label">Contact Payload</label>
                                        <input name="phone" className="dark-input" value={formData.phone || ''} onChange={handleChange} placeholder="Phone Number" />
                                    </div>
                                    <div className="col-12 col-md-4 dark-input-group">
                                        <label className="dark-label">DoB Param</label>
                                        <input type="date" name="dob" className="dark-input" value={formData.dob || ''} onChange={handleChange} />
                                    </div>
                                    <div className="col-12 col-md-4 dark-input-group">
                                        <label className="dark-label">Gender Entity</label>
                                        <select name="gender" className="dark-input" value={formData.gender || ''} onChange={handleChange}>
                                            <option value="">Select</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div className="col-12"><hr style={{borderColor:'#333', margin:'10px 0 25px 0'}}/></div>

                                    <div className="col-12 col-md-6 dark-input-group">
                                        <label className="dark-label">License Reference</label>
                                        <input name="license_number" className="dark-input" value={formData.license_number || ''} onChange={handleChange} />
                                    </div>
                                    <div className="col-12 col-md-6 dark-input-group">
                                        <label className="dark-label">Specialization Module</label>
                                        <select name="specialization" className="dark-input" value={formData.specialization || ''} onChange={handleChange}>
                                            <option value="">Select Value</option>
                                            {specialties.map(spec => (
                                                <option key={spec} value={spec}>{spec}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="col-12 col-md-6 dark-input-group">
                                        <label className="dark-label">Qualification Core</label>
                                        <input name="qualification" className="dark-input" value={formData.qualification || ''} onChange={handleChange} />
                                    </div>
                                    <div className="col-12 col-md-6 dark-input-group">
                                        <label className="dark-label">Experience Runtime (Yrs)</label>
                                        <input type="number" name="experience_years" className="dark-input" value={formData.experience_years || ''} onChange={handleChange} />
                                    </div>

                                    <div className="col-12"><hr style={{borderColor:'#333', margin:'10px 0 25px 0'}}/></div>

                                    <div className="col-12 col-md-4 dark-input-group">
                                        <label className="dark-label">Fee Base Node (₹)</label>
                                        <input type="number" name="consultation_fee" className="dark-input" value={formData.consultation_fee || ''} onChange={handleChange} />
                                    </div>
                                    <div className="col-12 col-md-4 dark-input-group">
                                        <label className="dark-label">Hospital Cluster</label>
                                        <input name="hospital_name" className="dark-input" value={formData.hospital_name || ''} onChange={handleChange} />
                                    </div>
                                    <div className="col-12 col-md-4 dark-input-group">
                                        <label className="dark-label">Consultation Proxy</label>
                                        <select name="consultation_mode" className="dark-input" value={formData.consultation_mode || ''} onChange={handleChange}>
                                            <option value="">Routing Mode</option>
                                            <option value="Online">Online Payload</option>
                                            <option value="Offline">Offline Payload</option>
                                            <option value="Both">Dual Stack</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="dark-form-actions">
                                    <button className="dark-btn-secondary" style={{ backgroundColor: '#222', color: '#fff', border: '1px solid #444' }} onClick={() => { cancelEdit(); setActiveTab('overview'); }}>Cancel Sequence</button>
                                    <button className="dark-btn-primary" onClick={handleSave}>Execute Changes</button>
                                </div>
                            </div>
                        )}

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
