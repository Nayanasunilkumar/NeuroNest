import React, { useState, useRef } from 'react';
import { Camera, Edit2, MapPin, Briefcase, Award } from 'lucide-react';
import { toAssetUrl } from '../../utils/media';

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
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-4 bg-white position-relative">
            <div className="card-body p-4 p-md-5">
                <div className="row g-4 align-items-center">
                    
                    {/* Profile Image Column */}
                    <div className="col-auto">
                        <div 
                            className="position-relative d-inline-block rounded-circle overflow-hidden shadow"
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                            onClick={handleImageClick}
                            style={{ 
                                width: '130px', 
                                height: '130px', 
                                cursor: isEditing ? 'pointer' : 'default',
                                padding: '4px',
                                background: 'linear-gradient(135deg, #0d6efd, #6610f2)'
                            }}
                        >
                            <img 
                                src={toAssetUrl(profile.profile_image) || "https://via.placeholder.com/150"} 
                                alt="Dr. Profile" 
                                className="w-100 h-100 rounded-circle object-fit-cover bg-white"
                                style={{ border: '3px solid white' }}
                            />
                            
                            {/* Overlay if editing */}
                            {isEditing && (
                                <div 
                                    className="position-absolute py-2 top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark text-white rounded-circle transition-all" 
                                    style={{ 
                                        opacity: isHovering ? 0.7 : 0,
                                        transition: 'all 0.2s ease',
                                        margin: '4px', // account for outer padding
                                        width: 'calc(100% - 8px)',
                                        height: 'calc(100% - 8px)'
                                    }}
                                >
                                    <Camera size={26} />
                                </div>
                            )}
                            
                            {/* Hidden Input */}
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="d-none"
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    {/* Info Column */}
                    <div className="col text-center text-sm-start">
                        <div className="mb-3">
                            <h1 className="fw-bolder text-dark mb-1" style={{ fontSize: '1.8rem', letterSpacing: '-0.02em' }}>
                                {profile.full_name || "Dr. Name"}
                            </h1>
                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1 rounded-pill fw-bold text-uppercase d-inline-flex align-items-center gap-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                <Briefcase size={12} /> {profile.experience_years || 0} Years Exp.
                            </span>
                        </div>

                        {/* Badges Row */}
                        <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-md-start mb-3">
                            <span className="badge bg-light text-dark fw-medium border px-3 py-2 rounded-pill d-flex align-items-center gap-1">
                                <Award size={14} className="text-warning" /> {profile.specialization || "Specialization"}
                            </span>
                            <span className="badge bg-light text-dark fw-medium border px-3 py-2 rounded-pill d-flex align-items-center gap-1">
                                <MapPin size={14} className="text-secondary" /> {profile.hospital_name || "Hospital Name"}
                            </span>
                            <span className="badge bg-success bg-opacity-10 text-success fw-bold border border-success border-opacity-25 px-3 py-2 rounded-pill d-flex align-items-center gap-1">
                                ₹{profile.consultation_fee || 0} / Visit
                            </span>
                        </div>

                        {/* Bio */}
                        <p className="text-secondary mb-0 fw-medium" style={{ lineHeight: '1.6', maxWidth: '800px' }}>
                            {profile.bio || "No bio added yet. Click 'Edit Profile' to add a professional summary."}
                        </p>
                    </div>

                    {/* Action Column */}
                    {!isEditing && (
                        <div className="col-12 col-md-auto text-end position-absolute top-0 end-0 p-4">
                            <button 
                                onClick={onEdit} 
                                className="btn btn-primary d-flex align-items-center gap-2 rounded-pill px-4 fw-bold shadow-sm"
                            >
                                <Edit2 size={16} /> <span>Edit Profile</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;
