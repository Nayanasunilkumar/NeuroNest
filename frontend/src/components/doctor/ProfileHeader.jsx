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
        <div className="card border-0 rounded-4 overflow-hidden mb-4" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.05)', backgroundColor: '#fff' }}>
            {/* Subtle premium cover banner */}
            <div className="w-100" style={{ height: '120px', background: 'linear-gradient(135deg, rgba(13,110,253,0.1) 0%, rgba(102,16,242,0.1) 100%)' }}></div>
            
            <div className="card-body px-4 px-md-5 pb-5 position-relative" style={{ marginTop: '-60px' }}>
                <div className="row g-4 align-items-end mb-4">
                    
                    {/* Profile Image Column */}
                    <div className="col-auto">
                        <div 
                            className="position-relative d-inline-block rounded-circle overflow-hidden shadow-lg"
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                            onClick={handleImageClick}
                            style={{ 
                                width: '140px', 
                                height: '140px', 
                                cursor: isEditing ? 'pointer' : 'default',
                                padding: '5px',
                                background: 'linear-gradient(135deg, #0d6efd, #6610f2)',
                                backgroundColor: '#fff'
                            }}
                        >
                            <img 
                                src={toAssetUrl(profile.profile_image) || "https://via.placeholder.com/150"} 
                                alt="Dr. Profile" 
                                className="w-100 h-100 rounded-circle object-fit-cover bg-white"
                                style={{ border: '4px solid white' }}
                            />
                            
                            {/* Overlay if editing */}
                            {isEditing && (
                                <div 
                                    className="position-absolute py-2 top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark text-white rounded-circle transition-all" 
                                    style={{ 
                                        opacity: isHovering ? 0.8 : 0,
                                        transition: 'all 0.3s ease',
                                        margin: '5px', // account for outer padding
                                        width: 'calc(100% - 10px)',
                                        height: 'calc(100% - 10px)'
                                    }}
                                >
                                    <Camera size={28} />
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

                    {/* Action Column for Top Right (Absolute in card but visually aligned) */}
                    {!isEditing && (
                        <div className="position-absolute top-0 end-0 p-4 mt-2">
                            <button 
                                onClick={onEdit} 
                                className="btn btn-white text-primary bg-white border-0 shadow-sm d-flex align-items-center gap-2 rounded-pill px-4 py-2 fw-bold transition-all"
                                style={{ transform: 'translateY(0)' }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <Edit2 size={16} /> <span style={{ letterSpacing: '0.5px' }}>Edit Profile</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Info Details below image */}
                <div className="row">
                    <div className="col-12 col-lg-8">
                        <div className="d-flex flex-column flex-md-row align-items-md-center gap-3 mb-3">
                            <h1 className="fw-bolder text-dark mb-0" style={{ fontSize: '2.2rem', letterSpacing: '-1px' }}>
                                {profile.full_name || "Dr. Name"}
                            </h1>
                            <span className="badge bg-primary bg-gradient text-white px-3 py-2 rounded-pill fw-bold text-uppercase d-inline-flex align-items-center gap-2 shadow-sm" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>
                                <Briefcase size={14} /> {profile.experience_years || 0} Years Exp.
                            </span>
                        </div>

                        {/* Badges Row */}
                        <div className="d-flex flex-wrap gap-3 mb-4">
                            <span className="badge bg-light text-dark fw-bold border border-secondary border-opacity-25 px-3 py-2 rounded-pill d-inline-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                                <Award size={16} className="text-warning" /> {profile.specialization || "Specialization"}
                            </span>
                            <span className="badge bg-light text-dark fw-bold border border-secondary border-opacity-25 px-3 py-2 rounded-pill d-inline-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                                <MapPin size={16} className="text-primary" /> {profile.hospital_name || "Hospital Name"}
                            </span>
                            <span className="badge bg-success bg-opacity-10 text-success fw-bolder border border-success border-opacity-50 px-3 py-2 rounded-pill d-inline-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                                ₹{profile.consultation_fee || 0} / Visit
                            </span>
                        </div>

                        {/* Bio */}
                        <div className="bg-light bg-opacity-50 border rounded-4 p-4 position-relative overflow-hidden">
                            <div className="position-absolute top-0 start-0 w-100 h-100 bg-primary opacity-10 d-none d-md-block" style={{ maskImage: 'linear-gradient(to right, transparent, black)' }}></div>
                            <p className="text-secondary mb-0 fw-medium position-relative z-1" style={{ lineHeight: '1.7', fontSize: '1rem' }}>
                                {profile.bio || "No bio added yet. Click 'Edit Profile' to add a professional summary."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;
