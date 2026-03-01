import React, { useEffect, useState, useRef } from 'react';
import { getDoctorProfile, updateDoctorProfile, uploadProfileImage } from '../../services/doctorProfileService';
import { 
  User, Briefcase, Shield, Edit2, Save, X, Camera, Award, MapPin, Search, Tag, CalendarClock 
} from 'lucide-react';
import ExpertiseTags from '../../components/doctor/ExpertiseTags';
import AvailabilityOverview from '../../components/doctor/AvailabilityOverview';
import AvailabilityModal from '../../components/doctor/AvailabilityModal';
import { fetchSpecialties } from '../../services/adminDoctorAPI';
import { toAssetUrl } from '../../utils/media';
import '../../styles/profile-premium.css';

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
    const [activeTab, setActiveTab] = useState('bio'); // bio, details, schedule
    const [isHoveringImage, setIsHoveringImage] = useState(false);

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

    // Decide which component renders the actual UI body
    const renderActiveTab = () => {
        if (activeTab === 'bio') {
            return (
                <div className="animation-fade-in text-start">
                    <p className="text-secondary fw-medium" style={{ lineHeight: '1.8', fontSize: '0.95rem' }}>
                        {isEditing ? (
                            <textarea 
                                name="bio" 
                                className="form-control premium-input text-secondary" 
                                value={formData.bio || ''} 
                                onChange={handleChange} 
                                rows={5}
                                placeholder="Describe your professional career..."
                            />
                        ) : (
                            profile.bio || "No professional summary added yet. Click 'Edit' to update."
                        )}
                    </p>

                    <div className="mt-4 pt-3 border-top border-light">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                             <span className="small fw-semibold text-secondary text-uppercase tracking-wider">Expertise Labels</span>
                             <span className="badge bg-light text-muted fw-bold">{formData.expertise_tags?.length || 0}</span>
                        </div>
                        <ExpertiseTags 
                            tags={formData.expertise_tags || []} 
                            isEditing={isEditing}
                            onAddTag={handleAddTag} 
                            onRemoveTag={handleRemoveTag}
                        />
                    </div>
                </div>
            );
        }

        if (activeTab === 'details') {
            return (
                <div className="animation-fade-in row g-4 text-start">
                    <div className="col-12 col-md-6">
                        <label className="small fw-semibold text-secondary text-uppercase mb-1">Phone Number</label>
                        {isEditing ? (
                            <input name="phone" className="form-control premium-input" value={formData.phone || ''} onChange={handleChange} />
                        ) : <div className="fw-bolder text-dark" style={{ fontSize: '1rem' }}>{profile.phone || 'Not set'}</div>}
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="small fw-semibold text-secondary text-uppercase mb-1">Date of Birth</label>
                        {isEditing ? (
                            <input type="date" name="dob" className="form-control premium-input" value={formData.dob || ''} onChange={handleChange} />
                        ) : <div className="fw-bolder text-dark" style={{ fontSize: '1rem' }}>{profile.dob || 'Not set'}</div>}
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="small fw-semibold text-secondary text-uppercase mb-1">Gender</label>
                        {isEditing ? (
                            <select name="gender" className="form-select premium-input" value={formData.gender || ''} onChange={handleChange}>
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        ) : <div className="fw-bolder text-dark" style={{ fontSize: '1rem' }}>{profile.gender || 'Not set'}</div>}
                    </div>
                    
                    <div className="col-12"><hr className="text-light opacity-50"/></div>

                    <div className="col-12 col-md-6">
                        <label className="small fw-semibold text-secondary text-uppercase mb-1">License No.</label>
                        {isEditing ? (
                            <input name="license_number" className="form-control premium-input" value={formData.license_number || ''} onChange={handleChange} />
                        ) : <div className="fw-bolder text-dark d-flex align-items-center gap-1"><Shield size={16} className="text-success"/> {profile.license_number}</div>}
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="small fw-semibold text-secondary text-uppercase mb-1">Specialization</label>
                        {isEditing ? (
                            <select name="specialization" className="form-select premium-input" value={formData.specialization || ''} onChange={handleChange}>
                                <option value="">Select Specialization</option>
                                {specialties.map(spec => (
                                    <option key={spec} value={spec}>{spec}</option>
                                ))}
                            </select>
                        ) : <div className="fw-bolder text-dark">{profile.specialization}</div>}
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="small fw-semibold text-secondary text-uppercase mb-1">Qualification</label>
                        {isEditing ? (
                            <input name="qualification" className="form-control premium-input" value={formData.qualification || ''} onChange={handleChange} />
                        ) : <div className="fw-bolder text-dark">{profile.qualification}</div>}
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="small fw-semibold text-secondary text-uppercase mb-1">Consultation Mode</label>
                        {isEditing ? (
                            <select name="consultation_mode" className="form-select premium-input" value={formData.consultation_mode === 'Both' ? 'Online and Offline' : (formData.consultation_mode || '')} onChange={handleChange}>
                                <option value="">Select</option>
                                <option value="Online">Online</option>
                                <option value="Offline">Offline</option>
                                <option value="Online and Offline">Online and Offline</option>
                            </select>
                        ) : <div className="fw-bolder text-dark">{profile.consultation_mode === 'Both' ? 'Online and Offline' : profile.consultation_mode}</div>}
                    </div>
                </div>
            );
        }

        if (activeTab === 'schedule') {
            return (
                <div className="animation-fade-in text-start">
                    <p className="text-secondary fw-medium small mw-100">Review your existing schedule and manage your online/offline availability timings.</p>
                    <AvailabilityOverview 
                        availability={profile.availability} 
                        onManage={() => setIsAvailabilityModalOpen(true)}
                    />
                </div>
            );
        }
    };

    return (
        <div className="premium-page-bg py-5">
            <div className="container" style={{ maxWidth: '1280px' }}>
                <div className="premium-main-card">
                    {/* Pale blue accent floating shape inside card */}
                    <div className="premium-left-accent d-none d-lg-block"></div>

                    <div className="row g-0 position-relative z-1 p-3 p-md-5">
                        
                        {/* LEFT COLUMN: Main Poster (Image + Title) */}
                        <div className="col-12 col-lg-5 col-xl-4 text-center d-flex flex-column pt-3">
                            <h5 className="fw-bold d-none d-lg-block" style={{ color: '#2b3650', letterSpacing: '-0.5px' }}>
                                NEURO<span className="fw-normal">NEST</span>
                            </h5>

                            <div 
                                className="premium-circle-bg mt-4 shadow-sm" 
                                onMouseEnter={() => setIsHoveringImage(true)}
                                onMouseLeave={() => setIsHoveringImage(false)}
                                onClick={handleImageClick}
                                style={{
                                    width: '280px', height: '280px', 
                                    background: isEditing && isHoveringImage ? '#5d4d9b' : '#7b68c2'
                                }}
                            >
                                <img 
                                    src={toAssetUrl(formData.profile_image) || "https://via.placeholder.com/300"} 
                                    alt="Doctor Portrait"
                                    className="w-100 h-100 rounded-circle object-fit-cover shadow"
                                    style={{ border: '4px solid #fff', transform: 'scale(0.95)' }}
                                />
                                {isEditing && (
                                    <div className="position-absolute d-flex align-items-center justify-content-center top-0 start-0 w-100 h-100 rounded-circle" style={{ backgroundColor: 'rgba(0,0,0,0.5)', opacity: isHoveringImage ? 1 : 0, transition: 'all 0.2s' }}>
                                        <Camera color="#fff" size={36} />
                                    </div>
                                )}
                                <input type="file" ref={fileInputRef} className="d-none" accept="image/*" onChange={handleFileChange} />
                            </div>

                            {/* Info below image */}
                            <div className="mt-4 pt-2">
                                <h1 className="fw-bolder mb-1 lh-1" style={{ color: '#2b3650', fontSize: '2.5rem', letterSpacing: '-1.5px' }}>
                                    {formData.full_name || "Dr. Name"}
                                </h1>
                                <p className="text-secondary fw-semibold text-uppercase mb-3 mt-2" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                                    <MapPin size={12} className="me-1 mb-1"/> {formData.hospital_name || "Hospital"} &bull; {formData.specialization || "Specialist"}
                                </p>
                            </div>
                        </div>

                        {/* CENTER COLUMN: Data and Tabs */}
                        <div className="col-12 col-lg-7 col-xl-6 px-lg-5 pt-5 pt-lg-4 text-center text-lg-start d-flex flex-column justify-content-center">
                            
                            {/* Desktop header metadata: Price & Badge */}
                            <div className="d-flex flex-column flex-md-row align-items-center justify-content-lg-between gap-3 mb-4">
                                <div>
                                    <div className="premium-price-tag mb-0">₹{formData.consultation_fee || 0}</div>
                                </div>
                                <div>
                                    <span className="badge bg-light text-dark shadow-sm border px-3 py-2 fw-bold rounded-pill text-uppercase d-inline-flex align-items-center gap-2" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                                        <Briefcase size={14} className="text-primary"/> {formData.experience_years} Years Exp.
                                    </span>
                                </div>
                            </div>
                            
                            {/* Pill Navigation (Bio, Details, Schedule) */}
                            <div className="premium-pill-nav justify-content-center justify-content-lg-start mt-3">
                                <button className={activeTab === 'bio' ? 'active' : ''} onClick={() => setActiveTab('bio')}>Professional Info</button>
                                <button className={activeTab === 'details' ? 'active' : ''} onClick={() => setActiveTab('details')}>Records</button>
                                <button className={activeTab === 'schedule' ? 'active' : ''} onClick={() => setActiveTab('schedule')}>Schedules</button>
                            </div>

                            {/* dynamic tab content */}
                            <div style={{ minHeight: '300px' }}>
                                {renderActiveTab()}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Floating Vertical Controls */}
                        <div className="col-12 col-xl-2 py-4 px-3 d-flex flex-row flex-xl-column align-items-center justify-content-center align-items-xl-end pe-xl-5 gap-4">
                            {!isEditing ? (
                                <div className="premium-action-bar flex-row flex-xl-column w-100 align-items-center bg-white shadow-sm border border-light">
                                    <button onClick={() => setIsEditing(true)} className="premium-action-btn w-100 flex-xl-column flex-row gap-2 py-2" style={{ height: 'auto', minHeight: '80px' }}>
                                        <Edit2 size={20} />
                                        <span>Edit</span>
                                    </button>
                                    <button onClick={() => setIsAvailabilityModalOpen(true)} className="premium-action-btn w-100 flex-xl-column flex-row gap-2 py-2" style={{ height: 'auto', minHeight: '80px' }}>
                                        <CalendarClock size={20} />
                                        <span>Manage</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="premium-action-bar bg-light border border-light w-100 flex-row flex-xl-column align-items-center">
                                    <button onClick={handleSave} className="premium-action-btn active-main w-100 flex-xl-column flex-row gap-2 py-2" style={{ height: 'auto', minHeight: '80px' }}>
                                        <Save size={20} />
                                        <span>Save</span>
                                    </button>
                                    <button onClick={cancelEdit} className="premium-action-btn w-100 flex-xl-column flex-row gap-2 py-2" style={{ height: 'auto', minHeight: '80px' }}>
                                        <X size={20} className="text-danger"/>
                                        <span className="text-danger">Cancel</span>
                                    </button>
                                </div>
                            )}

                             {/* Little metric card like the mock '6.0 Scores' -> '4.9 Rating' */}
                            <div className="d-none d-xl-flex flex-column align-items-center justify-content-center mt-auto mb-3" style={{ width: '90px', height: '90px', borderRadius: '50%', border: '2px solid #e2e8f0' }}>
                                <span className="fw-bolder fs-3 text-dark lh-1">4.9</span>
                                <span className="small text-secondary fw-semibold mt-1" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>RATING</span>
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
