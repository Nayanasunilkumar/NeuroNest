import React, { useState, useRef } from 'react';
import { Camera, Edit2, MapPin, Briefcase, Award } from 'lucide-react';
import { toAssetUrl } from '../../utils/media';
import '../../styles/doctor-profile-premium.css';

const ProfileHeader = ({ profile, onEdit, onImageUpload, isEditing }) => {
    const fileInputRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);

    const handleImageClick = () => {
        if (isEditing && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onImageUpload(file);
        }
    };

    return (
        <div className="profile-banner-card">
            {/* Profile Image with Hover Overlay */}
            <div 
                className="premium-avatar-wrapper"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={handleImageClick}
                style={{ cursor: isEditing ? 'pointer' : 'default' }}
            >
                <img 
                    src={toAssetUrl(profile.profile_image) || "https://via.placeholder.com/150"} 
                    alt="Dr. Profile" 
                    className="premium-avatar"
                />
                
                {/* Only show overlay if editing */}
                {isEditing && (
                    <div 
                        className="avatar-upload-overlay" 
                        style={{ opacity: isHovering ? 1 : 0 }}
                    >
                        <Camera size={24} />
                    </div>
                )}
                
                {/* Hidden Input */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={!isEditing}
                />
            </div>

            {/* Info Section */}
            <div className="profile-header-info">
                {/* Name & Experience Group */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                    <h1 className="profile-name-large">{profile.full_name || "Dr. Name"}</h1>
                    <span className="badge-primary badge-pill" style={{ display: 'inline-flex', width: 'auto' }}>
                        <Briefcase size={16} /> <span className="ml-2">{profile.experience_years || 0} Years Exp.</span>
                    </span>
                </div>

                {/* Badges Row */}
                <div className="profile-badges">
                    <span className="badge-secondary badge-pill">
                        <Award size={16} /> <span className="ml-2">{profile.specialization || "Specialization"}</span>
                    </span>
                    <span className="badge-secondary badge-pill">
                        <MapPin size={16} /> <span className="ml-2">{profile.hospital_name || "Hospital Name"}</span>
                    </span>
                    <span className="badge-success badge-pill">
                        <span className="font-bold">₹{profile.consultation_fee || 0} / Visit</span>
                    </span>
                </div>

                {/* Bio */}
                <p style={{ marginTop: '16px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                    {profile.bio || "No bio added yet. Click 'Edit Profile' to add a professional summary."}
                </p>
            </div>

            {/* Action Buttons - Hide if already editing */}
            {!isEditing && (
                <div className="banner-actions">
                    <button 
                        onClick={onEdit} 
                        className="btn-outline-primary"
                    >
                        <Edit2 size={16} /> <span>Edit Profile</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfileHeader;
