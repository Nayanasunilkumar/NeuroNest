import React, { useState } from 'react';
import { Mail, MessageSquare, ExternalLink } from 'lucide-react';
import { toAssetUrl } from '../../utils/media';

const PatientCard = ({ patient, onNavigate, onMessage }) => {
    const [imageError, setImageError] = useState(false);

    return (
        <div className="dossier-card-pro hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group">
            {/* LEFT: Identity Block */}
            <div className="dossier-identity-block">
                <div className="patient-avatar-pro overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                    {patient.patient_image && !imageError ? (
                        <img 
                            src={toAssetUrl(patient.patient_image)} 
                            alt={patient.full_name} 
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                            {patient.full_name ? patient.full_name.charAt(0).toUpperCase() : 'P'}
                        </span>
                    )}
                </div>
                <div className="identity-meta">
                    <h4>{patient.full_name}</h4>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                        <Mail size={10} />
                        {patient.email}
                    </div>
                </div>
            </div>

            {/* MIDDLE: Clinical Visit Summary */}
            <div className="hidden md:flex flex-1 items-center justify-center gap-12 px-8">
                <div className="text-center">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Visit</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {patient.last_visit ? new Date(patient.last_visit).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </span>
                </div>
                <div className="text-center">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Upcoming</span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {patient.next_appointment ? new Date(patient.next_appointment).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No Schedule'}
                    </span>
                </div>
            </div>

            {/* RIGHT: Action Cluster & Status */}
            <div className="dossier-action-cluster">
                <div className="flex flex-col items-end gap-3">
                    <span className={`status-pill-minimal ${patient.status === 'Active' ? 'approved' : 'cancelled'}`}>
                        {patient.status === 'Active' ? '🟢 Active' : '⚪ Inactive'}
                    </span>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => onMessage(patient.id)}
                            className="w-10 h-10 flex items-center justify-center bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            title="Message Patient"
                        >
                            <MessageSquare size={18} />
                        </button>
                        <button 
                            onClick={() => onNavigate(patient.id)}
                            className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-900 hover:text-white dark:hover:bg-slate-50 dark:hover:text-slate-900 transition-all shadow-sm"
                            title="View Profile"
                        >
                            <ExternalLink size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientCard;
