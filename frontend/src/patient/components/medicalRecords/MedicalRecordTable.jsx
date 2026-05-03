import React from 'react';
import { FileText, Eye, Trash2, Download, User, ShieldCheck } from 'lucide-react';

const getBadgeClass = (category) => {
    if (!category) return 'badge-other';
    const lower = category.toLowerCase();
    if (lower.includes('prescription')) return 'badge-prescription';
    if (lower.includes('lab')) return 'badge-lab';
    if (lower.includes('scan') || lower.includes('mri') || lower.includes('x-ray')) return 'badge-scan';
    return 'badge-other';
};

const formatCategory = (category) => {
    if (!category) return "Other";
    const c = category.toLowerCase();
    if (c === "lab") return "Lab Report";
    if (c === "scan") return "Scan";
    if (c === "discharge") return "Discharge Summary";
    if (c === "prescription") return "Prescription";
    return category;
};

const MedicalRecordTable = ({ records, onView, onDelete, onDownload, loading, isDoctorView = false }) => {
    if (loading) {
        return (
            <div className="records-table-container">
                <table className="records-table">
                    <thead>
                        <tr>
                            <th style={{ width: '15%' }}>Date</th>
                            <th style={{ width: '25%' }}>Record Details</th>
                            <th style={{ width: '15%' }}>Category</th>
                            <th style={{ width: '20%' }}>Doctor</th>
                            <th style={{ width: '15%' }}>Status</th>
                            <th style={{ width: '10%' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[1, 2, 3, 4].map((i) => (
                            <tr key={i} className="animate-pulse">
                                <td><div className="h-4 bg-gray-100 rounded w-24 mb-1"></div></td>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg shrink-0"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-100 rounded w-32"></div>
                                            <div className="h-3 bg-gray-100 rounded w-20"></div>
                                        </div>
                                    </div>
                                </td>
                                <td><div className="h-6 bg-gray-100 rounded-full w-20"></div></td>
                                <td><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                                <td><div className="h-6 bg-gray-100 rounded-full w-24"></div></td>
                                <td>
                                    <div className="flex gap-2">
                                        <div className="w-8 h-8 bg-gray-100 rounded"></div>
                                        <div className="w-8 h-8 bg-gray-100 rounded"></div>
                                        <div className="w-8 h-8 bg-gray-100 rounded"></div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    if (!records || records.length === 0) {
        return (
            <div className="empty-records">
                <div className="empty-icon">
                    <FileText size={32} />
                </div>
                <h3>No Medical Records Found</h3>
                <p>Upload a prescription or report to get started.</p>
            </div>
        );
    }

    return (
        <div className="records-table-container">
            <table className="records-table">
                <thead>
                    <tr>
                        <th style={{ width: '15%' }}>Date</th>
                        <th style={{ width: '25%' }}>Record Details</th>
                        <th style={{ width: '15%' }}>Category</th>
                        <th style={{ width: '20%' }}>Doctor</th>
                        <th style={{ width: '15%' }}>Status</th>
                        <th style={{ width: '10%' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((record) => (
                        <tr key={record.id}>
                            <td className="record-date">
                                {new Date(record.record_date || record.created_at).toLocaleDateString('en-US', { 
                                    year: 'numeric', month: 'short', day: 'numeric' 
                                })}
                            </td>
                            <td>
                                <div className="record-detail-wrap">
                                    <div className="record-detail-icon">
                                        <FileText size={20} />
                                    </div>
                                    <div className="record-detail-text">
                                        <p className="record-detail-title" title={record.title}>{record.title}</p>
                                        {record.description && (
                                            <p className="record-detail-subtitle">
                                                {record.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span className={`record-badge ${getBadgeClass(record.category)}`}>
                                    {formatCategory(record.category)}
                                </span>
                            </td>
                            <td className="record-doctor-cell">
                                <div className="record-doctor-wrap">
                                    <span>{record.doctor_name || "Not specified"}</span>
                                    {record.hospital_name && (
                                        <span className="record-hospital">{record.hospital_name}</span>
                                    )}
                                </div>
                            </td>
                            <td>
                                {(!record.uploaded_by || record.uploaded_by === record.patient_id) ? (
                                    <div className="record-status-badge record-status-self">
                                        <User size={13} className="record-status-icon" /> 
                                        {isDoctorView ? "Added by Patient" : "Added by You"}
                                    </div>
                                ) : (
                                    <div className="record-status-badge record-status-verified" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #d1fae5' }}>
                                        <ShieldCheck size={13} fill="currentColor" className="record-status-icon" /> 
                                        {isDoctorView ? "Added by Doctor" : "Added by Doctor"}
                                    </div>
                                )}
                            </td>
                            <td>
                                <div className="action-buttons">
                                    <button 
                                        className="action-btn view" 
                                        onClick={() => onView(record)} 
                                        title="View"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button 
                                        className="action-btn download" 
                                        onClick={() => onDownload(record)} 
                                        title="Download"
                                    >
                                        <Download size={18} />
                                    </button>
                                    <button 
                                        className="action-btn delete" 
                                        onClick={() => onDelete(record)} 
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MedicalRecordTable;
