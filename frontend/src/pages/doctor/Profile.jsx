import React, { useEffect, useState } from 'react';
import { getDoctorProfile, updateDoctorProfile, uploadProfileImage } from '../../services/doctorProfileService';
import '../../styles/doctor-profile-premium.css';
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
        <div className="content-section">
            <div className="section-top-bar">
                <h3 className="section-title-large">
                    <User size={24} className="text-blue-500 bg-blue-50 p-1 rounded-lg" />
                    Basic Information
                </h3>
            </div>
            
            <div className="premium-form-grid">
                <div className="input-group">
                    <label className="input-label">Phone Number</label>
                    {isEditing ? (
                        <input 
                            name="phone" 
                            className="premium-input" 
                            value={formData.phone || ''} 
                            onChange={handleChange} 
                        />
                    ) : (
                        <div className="read-only-value">{profile.phone || 'Not set'}</div>
                    )}
                </div>
                
                <div className="input-group">
                    <label className="input-label">Date of Birth</label>
                    {isEditing ? (
                        <input 
                            type="date" 
                            name="dob" 
                            className="premium-input" 
                            value={formData.dob || ''} 
                            onChange={handleChange} 
                        />
                    ) : (
                        <div className="read-only-value">{profile.dob || 'Not set'}</div>
                    )}
                </div>

                <div className="input-group">
                    <label className="input-label">Gender</label>
                    {isEditing ? (
                        <select 
                            name="gender" 
                            className="premium-input" 
                            value={formData.gender || ''} 
                            onChange={handleChange}
                        >
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    ) : (
                        <div className="read-only-value">{profile.gender || 'Not set'}</div>
                    )}
                </div>

                <div className="input-group col-span-full">
                    <label className="input-label">Professional Bio</label>
                    {isEditing ? (
                        <textarea 
                            name="bio" 
                            className="premium-input" 
                            value={formData.bio || ''} 
                            onChange={handleChange} 
                        />
                    ) : (
                        <div className="read-only-value leading-relaxed text-slate-600 dark:text-slate-300">
                            {profile.bio || 'Click "Edit Profile" to add your bio.'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // --- Sub-component: Professional Details ---
    const renderProfessionalDetails = () => (
        <div className="content-section">
            <div className="section-top-bar">
                <h3 className="section-title-large">
                    <Briefcase size={24} className="text-indigo-500 bg-indigo-50 p-1 rounded-lg" />
                    Professional Details
                </h3>
            </div>
            
            <div className="premium-form-grid">
                <div className="input-group">
                    <label className="input-label">License Number</label>
                    {isEditing ? (
                        <input 
                            name="license_number" 
                            className="premium-input" 
                            value={formData.license_number || ''} 
                            onChange={handleChange} 
                        />
                    ) : (
                        <div className="read-only-value flex items-center gap-2">
                            <Shield size={14} className="text-green-500" />
                            {profile.license_number}
                        </div>
                    )}
                </div>

                <div className="input-group">
                    <label className="input-label">Specialization</label>
                    {isEditing ? (
                        <select 
                            name="specialization" 
                            className="premium-input" 
                            value={formData.specialization || ''} 
                            onChange={handleChange} 
                        >
                            <option value="">Select Specialization</option>
                            {specialties.map(spec => (
                                <option key={spec} value={spec}>{spec}</option>
                            ))}
                        </select>
                    ) : (
                        <div className="read-only-value">{profile.specialization}</div>
                    )}
                </div>

                <div className="input-group">
                    <label className="input-label">Qualification</label>
                    {isEditing ? (
                        <input 
                            name="qualification" 
                            className="premium-input" 
                            value={formData.qualification || ''} 
                            onChange={handleChange} 
                        />
                    ) : (
                        <div className="read-only-value">{profile.qualification}</div>
                    )}
                </div>

                <div className="input-group">
                    <label className="input-label">Experience (Years)</label>
                    {isEditing ? (
                        <input 
                            type="number"
                            name="experience_years" 
                            className="premium-input" 
                            value={formData.experience_years || ''} 
                            onChange={handleChange} 
                        />
                    ) : (
                        <div className="read-only-value">{profile.experience_years} Years</div>
                    )}
                </div>

                <div className="input-group">
                    <label className="input-label">Consultation Fee (₹)</label>
                    {isEditing ? (
                        <input 
                            type="number"
                            name="consultation_fee" 
                            className="premium-input" 
                            value={formData.consultation_fee || ''} 
                            onChange={handleChange} 
                        />
                    ) : (
                        <div className="read-only-value font-bold text-green-600">₹{profile.consultation_fee}</div>
                    )}
                </div>

                <div className="input-group">
                    <label className="input-label">Hospital</label>
                    {isEditing ? (
                        <input 
                            name="hospital_name" 
                            className="premium-input" 
                            value={formData.hospital_name || ''} 
                            onChange={handleChange} 
                        />
                    ) : (
                        <div className="read-only-value">{profile.hospital_name}</div>
                    )}
                </div>

                <div className="input-group">
                    <label className="input-label">Department</label>
                    {isEditing ? (
                        <input 
                            name="department" 
                            className="premium-input" 
                            value={formData.department || ''} 
                            onChange={handleChange} 
                        />
                    ) : (
                        <div className="read-only-value">{profile.department || 'Not set'}</div>
                    )}
                </div>

                <div className="input-group">
                    <label className="input-label">Consultation Mode</label>
                    {isEditing ? (
                        <select 
                            name="consultation_mode" 
                            className="premium-input" 
                            value={formData.consultation_mode === 'Both' ? 'Online and Offline' : (formData.consultation_mode || '')} 
                            onChange={handleChange}
                        >
                            <option value="">Select Mode</option>
                            <option value="Online">Online</option>
                            <option value="Offline">Offline</option>
                            <option value="Online and Offline">Online and Offline</option>
                        </select>
                    ) : (
                        <div className="read-only-value">
                            {profile.consultation_mode === 'Both' ? 'Online and Offline' : (profile.consultation_mode || 'Not set')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    if (loading) return (
        <div className="flex items-center justify-center h-full bg-slate-50">
            <Loader className="animate-spin text-blue-600" size={48} />
        </div>
    );
    
    if (error) return (
        <div className="flex items-center justify-center h-full text-red-500">
            {error}
        </div>
    );

    if (!profile) return null;

    return (
        <div className="doctor-profile-container">
            {/* SINGLE CARD CONTAINER */}
            <div className="single-card-frame">
                {/* HEAD SECTION */}
                <ProfileHeader 
                    profile={formData} 
                    onEdit={() => setIsEditing(true)}
                    onImageUpload={handleImageUpload}
                    isEditing={isEditing}
                />

                {/* BODY SECTION (Grid) */}
                <div className="profile-grid-layout pb-0"> 
                    
                    {/* LEFT SIDEBAR (Stats, Tags, Schedule) */}
                    <div className="left-col-stack">
                        <div className="stat-card-row">
                            <div className="mini-stat">
                                <div className="mini-stat-icon"><Briefcase size={20} /></div>
                                <div className="mini-stat-val">{profile.experience_years}</div>
                                <div className="mini-stat-label">Years</div>
                            </div>
                            <div className="mini-stat">
                                <div className="mini-stat-icon"><CheckCircle size={20} /></div>
                                <div className="mini-stat-val">4.9</div>
                                <div className="mini-stat-label">Rating</div>
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
                    <div className="right-col-stack">
                        {renderBasicInfo()}
                        <div className="h-px bg-slate-100 dark:bg-slate-700 my-2"></div>
                        {renderProfessionalDetails()}
                    </div>

                </div>
            </div>
            
            {/* BOTTOM ACTION BAR (When Editing) */}
            {isEditing && (
                <div className="bottom-action-bar slide-in-from-bottom-4">
                    <span className="text-sm font-medium text-slate-500 mr-auto pl-4">Unsaved changes...</span>
                    <button onClick={cancelEdit} className="btn-secondary flex items-center gap-2">
                        <X size={16} /> Cancel
                    </button>
                    <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                        <Save size={16} /> Save Changes
                    </button>
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
