import React, { useEffect, useState } from 'react';
import { getDoctorProfile, updateDoctorProfile, uploadProfileImage } from '../../services/doctorProfileService';
import { 
  User, Briefcase, CheckCircle, Shield, Edit2, Loader, Save, X 
} from 'lucide-react';
import ExpertiseTags from '../../components/doctor/ExpertiseTags';
import AvailabilityOverview from '../../components/doctor/AvailabilityOverview';
import AvailabilityModal from '../../components/doctor/AvailabilityModal';
import ProfileHeader from '../../components/doctor/ProfileHeader';
import { fetchSpecialties } from '../../services/adminDoctorAPI';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [specialties, setSpecialties] = useState([]);

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
    const handleImageUpload = async (file) => {
        try {
            const response = await uploadProfileImage(file); // Returns { message, image_url }
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
        // Check if exists
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
        // Modal stays open or closes? Usually nice to keep open to add more slots.
    };


    // --- Sub-component: Basic Info ---
    const renderBasicInfo = () => (
        <div className="card shadow-sm border-0 rounded-4 mb-4" style={{ backgroundColor: '#fff', boxShadow: '0 5px 20px rgba(0,0,0,0.03)' }}>
            <div className="card-body p-4 p-md-5">
                <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom border-light">
                    <div className="bg-primary bg-gradient shadow-sm text-white p-2 rounded-3 d-flex align-items-center justify-content-center">
                        <User size={24} />
                    </div>
                    <h3 className="h5 fw-bold text-dark mb-0" style={{ letterSpacing: '-0.3px' }}>Basic Information</h3>
                </div>
                
                <div className="row g-4">
                    <div className="col-12 col-md-4">
                        <label className="form-label small fw-bold text-secondary text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>Phone Number</label>
                        {isEditing ? (
                            <input 
                                name="phone" 
                                className="form-control border-2 shadow-none rounded-3 py-2 fw-medium" 
                                value={formData.phone || ''} 
                                onChange={handleChange} 
                            />
                        ) : (
                            <div className="fw-medium text-dark bg-light px-3 py-2 rounded-3 border">{profile.phone || 'Not set'}</div>
                        )}
                    </div>
                    
                    <div className="col-12 col-md-4">
                        <label className="form-label small fw-bold text-secondary text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>Date of Birth</label>
                        {isEditing ? (
                            <input 
                                type="date" 
                                name="dob" 
                                className="form-control border-2 shadow-none rounded-3 py-2 fw-medium" 
                                value={formData.dob || ''} 
                                onChange={handleChange} 
                            />
                        ) : (
                            <div className="fw-medium text-dark bg-light px-3 py-2 rounded-3 border">{profile.dob || 'Not set'}</div>
                        )}
                    </div>

                    <div className="col-12 col-md-4">
                        <label className="form-label small fw-bold text-secondary text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>Gender</label>
                        {isEditing ? (
                            <select 
                                name="gender" 
                                className="form-select border-2 shadow-none rounded-3 py-2 fw-medium" 
                                value={formData.gender || ''} 
                                onChange={handleChange}
                            >
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        ) : (
                            <div className="fw-medium text-dark bg-light px-3 py-2 rounded-3 border">{profile.gender || 'Not set'}</div>
                        )}
                    </div>

                    <div className="col-12">
                        <label className="form-label small fw-bold text-secondary text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>Professional Bio</label>
                        {isEditing ? (
                            <textarea 
                                name="bio" 
                                className="form-control border-2 shadow-none rounded-3 py-2 fw-medium" 
                                value={formData.bio || ''} 
                                onChange={handleChange} 
                                rows={4}
                            />
                        ) : (
                            <div className="fw-medium text-dark bg-light px-4 py-3 rounded-3 border mb-0 text-wrap text-break" style={{ lineHeight: '1.6' }}>
                                {profile.bio || 'Click "Edit Profile" to add your bio.'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    // --- Sub-component: Professional Details ---
    const renderProfessionalDetails = () => (
        <div className="card shadow-sm border-0 rounded-4 mb-4" style={{ backgroundColor: '#fff', boxShadow: '0 5px 20px rgba(0,0,0,0.03)' }}>
            <div className="card-body p-4 p-md-5">
                <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom border-light">
                    <div className="bg-indigo bg-gradient shadow-sm text-white p-2 rounded-3 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>
                        <Briefcase size={24} />
                    </div>
                    <h3 className="h5 fw-bold text-dark mb-0" style={{ letterSpacing: '-0.3px' }}>Professional Details</h3>
                </div>
                
                <div className="row g-4">
                    <div className="col-12 col-md-6">
                        <label className="form-label small fw-bold text-secondary text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>License Number</label>
                        {isEditing ? (
                            <input 
                                name="license_number" 
                                className="form-control border-2 shadow-none rounded-3 py-2 fw-medium" 
                                value={formData.license_number || ''} 
                                onChange={handleChange} 
                            />
                        ) : (
                            <div className="fw-medium text-dark bg-light px-3 py-2 rounded-3 border d-flex align-items-center gap-2">
                                <Shield size={16} className="text-success" />
                                {profile.license_number}
                            </div>
                        )}
                    </div>

                    <div className="col-12 col-md-6">
                        <label className="form-label small fw-bold text-secondary text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>Specialization</label>
                        {isEditing ? (
                            <select 
                                name="specialization" 
                                className="form-select border-2 shadow-none rounded-3 py-2 fw-medium" 
                                value={formData.specialization || ''} 
                                onChange={handleChange} 
                            >
                                <option value="">Select Specialization</option>
                                {specialties.map(spec => (
                                    <option key={spec} value={spec}>{spec}</option>
                                ))}
                            </select>
                        ) : (
                            <div className="fw-medium text-dark bg-light px-3 py-2 rounded-3 border">{profile.specialization}</div>
                        )}
                    </div>

                    <div className="col-12 col-md-6">
                        <label className="form-label small fw-bold text-secondary text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>Qualification</label>
                        {isEditing ? (
                            <input 
                                name="qualification" 
                                className="form-control border-2 shadow-none rounded-3 py-2 fw-medium" 
                                value={formData.qualification || ''} 
                                onChange={handleChange} 
                            />
                        ) : (
                            <div className="fw-medium text-dark bg-light px-3 py-2 rounded-3 border">{profile.qualification}</div>
                        )}
                    </div>

                    <div className="col-12 col-md-6">
                        <label className="form-label small fw-bold text-secondary text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>Experience (Years)</label>
                        {isEditing ? (
                            <input 
                                type="number"
                                name="experience_years" 
                                className="form-control border-2 shadow-none rounded-3 py-2 fw-medium" 
                                value={formData.experience_years || ''} 
                                onChange={handleChange} 
                            />
                        ) : (
                            <div className="fw-medium text-dark bg-light px-3 py-2 rounded-3 border">{profile.experience_years} Years</div>
                        )}
                    </div>

                    <div className="col-12 col-md-6">
                        <label className="form-label small fw-bold text-secondary text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>Consultation Fee (₹)</label>
                        {isEditing ? (
                            <input 
                                type="number"
                                name="consultation_fee" 
                                className="form-control border-2 shadow-none rounded-3 py-2 fw-medium" 
                                value={formData.consultation_fee || ''} 
                                onChange={handleChange} 
                            />
                        ) : (
                            <div className="fw-bold text-success bg-light px-3 py-2 rounded-3 border">₹{profile.consultation_fee}</div>
                        )}
                    </div>

                    <div className="col-12 col-md-6">
                        <label className="form-label small fw-bold text-secondary text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>Hospital</label>
                        {isEditing ? (
                            <input 
                                name="hospital_name" 
                                className="form-control border-2 shadow-none rounded-3 py-2 fw-medium" 
                                value={formData.hospital_name || ''} 
                                onChange={handleChange} 
                            />
                        ) : (
                            <div className="fw-medium text-dark bg-light px-3 py-2 rounded-3 border">{profile.hospital_name}</div>
                        )}
                    </div>

                    <div className="col-12 col-md-6">
                        <label className="form-label small fw-bold text-secondary text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>Department</label>
                        {isEditing ? (
                            <input 
                                name="department" 
                                className="form-control border-2 shadow-none rounded-3 py-2 fw-medium" 
                                value={formData.department || ''} 
                                onChange={handleChange} 
                            />
                        ) : (
                            <div className="fw-medium text-dark bg-light px-3 py-2 rounded-3 border">{profile.department || 'Not set'}</div>
                        )}
                    </div>

                    <div className="col-12 col-md-6">
                        <label className="form-label small fw-bold text-secondary text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>Consultation Mode</label>
                        {isEditing ? (
                            <select 
                                name="consultation_mode" 
                                className="form-select border-2 shadow-none rounded-3 py-2 fw-medium" 
                                value={formData.consultation_mode === 'Both' ? 'Online and Offline' : (formData.consultation_mode || '')} 
                                onChange={handleChange}
                            >
                                <option value="">Select Mode</option>
                                <option value="Online">Online</option>
                                <option value="Offline">Offline</option>
                                <option value="Online and Offline">Online and Offline</option>
                            </select>
                        ) : (
                            <div className="fw-medium text-dark bg-light px-3 py-2 rounded-3 border">
                                {profile.consultation_mode === 'Both' ? 'Online and Offline' : (profile.consultation_mode || 'Not set')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
            <div className="spinner-border text-primary border-3" style={{ width: '3rem', height: '3rem' }} role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
    
    if (error) return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 text-danger fw-medium">
            <AlertCircle size={24} className="me-2" /> {error}
        </div>
    );

    if (!profile) return null;

    return (
        <div className="container-fluid py-4 min-vh-100 position-relative" style={{ paddingBottom: isEditing ? '80px' : '1.5rem' }}>
            {/* HEAD SECTION */}
            <ProfileHeader 
                profile={formData} 
                onEdit={() => setIsEditing(true)}
                onImageUpload={handleImageUpload}
                isEditing={isEditing}
            />

            {/* BODY SECTION (Grid) */}
            <div className="row g-4"> 
                
                {/* LEFT SIDEBAR (Stats, Tags, Schedule) */}
                <div className="col-12 col-xl-4 d-flex flex-column gap-4">
                    <div className="card shadow-sm border-0 rounded-4 bg-white">
                        <div className="card-body p-4">
                            <div className="row g-3">
                                <div className="col-6">
                                    <div className="bg-light rounded-3 p-3 text-center border">
                                        <div className="mx-auto rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center mb-2" style={{ width: 40, height: 40 }}>
                                            <Briefcase size={20} />
                                        </div>
                                        <div className="fw-bolder fs-5 text-dark lh-1 mb-1">{profile.experience_years}</div>
                                        <div className="text-muted small fw-medium text-uppercase tracking-wider" style={{ fontSize: '0.7rem' }}>Years</div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="bg-light rounded-3 p-3 text-center border">
                                        <div className="mx-auto rounded-circle bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center mb-2" style={{ width: 40, height: 40 }}>
                                            <CheckCircle size={20} />
                                        </div>
                                        <div className="fw-bolder fs-5 text-dark lh-1 mb-1">4.9</div>
                                        <div className="text-muted small fw-medium text-uppercase tracking-wider" style={{ fontSize: '0.7rem' }}>Rating</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ExpertiseTags handles its own title */}
                    <ExpertiseTags 
                        tags={formData.expertise_tags || []} 
                        isEditing={isEditing}
                        onAddTag={handleAddTag} 
                        onRemoveTag={handleRemoveTag}
                    />

                    {/* AvailabilityOverview handles its own title */}
                    <AvailabilityOverview 
                        availability={profile.availability} 
                        onManage={() => setIsAvailabilityModalOpen(true)}
                    />
                </div>

                {/* RIGHT CONTENT (Forms) */}
                <div className="col-12 col-xl-8">
                    {renderBasicInfo()}
                    {renderProfessionalDetails()}
                </div>

            </div>
            
            {/* BOTTOM ACTION BAR (When Editing) */}
            {isEditing && (
                <div className="position-fixed bottom-0 start-0 w-100 bg-white border-top shadow-lg p-3 z-3" style={{ animation: 'slideInUp 0.3s ease' }}>
                    <div className="container-fluid d-flex align-items-center justify-content-between">
                        <span className="text-muted small fw-medium d-none d-md-block ms-md-4">Unsaved changes...</span>
                        <div className="d-flex align-items-center gap-3 ms-auto pe-md-4">
                            <button onClick={cancelEdit} className="btn btn-light border d-flex align-items-center gap-2 px-4 rounded-pill fw-medium">
                                <X size={18} /> Cancel
                            </button>
                            <button onClick={handleSave} className="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-pill fw-bold shadow-sm">
                                <Save size={18} /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODALS */}
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
