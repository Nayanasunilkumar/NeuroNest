import React, { useState } from 'react';
import { Mail, MessageSquare, ExternalLink, CalendarClock, History } from 'lucide-react';
import { toAssetUrl } from '../../utils/media';

const PatientCard = ({ patient, onNavigate, onMessage }) => {
    const [imageError, setImageError] = useState(false);
    const isActive = patient.status === 'Active';
    const formatDate = (value) => {
        if (!value) return 'Not available';
        return new Date(value).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <article className="group relative bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            {/* Edge Color Accent */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-400 to-blue-600 opacity-80" />
            
            <div className="p-5 md:p-6 flex flex-col md:flex-row items-center gap-6">
                
                {/* Identity */}
                <div className="flex items-center gap-4 flex-1 w-full md:w-auto min-w-[280px]">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center flex-shrink-0 shadow-inner relative overflow-hidden">
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
                    <div>
                        <h4 className="text-lg font-black tracking-tight text-slate-800 dark:text-white mb-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors w-full overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">{patient.full_name}</h4>
                        <div className="flex items-center gap-1.5 text-[0.85rem] font-medium text-slate-500 dark:text-slate-400">
                            <Mail size={14} className="text-slate-400" />
                            <span className="truncate max-w-[180px]">{patient.email}</span>
                        </div>
                    </div>
                </div>

                {/* Visits info - Beautiful chips */}
                <div className="flex flex-row items-center gap-3 flex-1 w-full md:w-auto">
                    <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3 border border-slate-100 dark:border-slate-700/50">
                        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1">
                            <History size={12} strokeWidth={2.5} /> Last Visit
                        </div>
                        <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            {formatDate(patient.last_visit)}
                        </div>
                    </div>
                    <div className="flex-1 bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl p-3 border border-blue-100 dark:border-blue-800/50">
                        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-black text-blue-500 dark:text-blue-400 mb-1">
                            <CalendarClock size={12} strokeWidth={2.5} /> Upcoming
                        </div>
                        <div className="text-sm font-bold text-blue-700 dark:text-blue-300">
                            {patient.next_appointment ? formatDate(patient.next_appointment) : 'No schedule'}
                        </div>
                    </div>
                </div>

                {/* Actions & Status */}
                <div className="flex items-center justify-between md:justify-end gap-5 w-full md:w-auto mt-2 md:mt-0">
                    <div className="hidden md:block">
                        <span className={`px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest uppercase shadow-sm ${isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-slate-50 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'} `}>
                            {isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <button 
                            onClick={() => onMessage(patient.id)} 
                            title="Message Patient"
                            className="flex-1 md:flex-none md:w-11 md:h-11 h-10 px-4 md:px-0 rounded-xl bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-600 dark:hover:bg-blue-500 text-blue-600 dark:text-blue-400 hover:text-white flex items-center justify-center transition-all border border-blue-100 dark:border-transparent hover:border-transparent shadow-sm hover:shadow-blue-500/25 group/btn"
                        >
                            <MessageSquare size={18} className="group-hover/btn:scale-110 transition-transform" />
                        </button>
                        <button 
                            onClick={() => onNavigate(patient.id)} 
                            title="View Clinical Profile"
                            className="flex-1 md:flex-none md:w-11 md:h-11 h-10 px-4 md:px-0 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-white text-slate-500 dark:text-slate-400 hover:text-white dark:hover:text-slate-900 flex items-center justify-center transition-all border border-slate-200 dark:border-slate-700 hover:border-transparent shadow-sm hover:shadow-xl group/btn2"
                        >
                            <ExternalLink size={18} className="group-hover/btn2:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default PatientCard;
