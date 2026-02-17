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

const MedicalRecordTable = ({ records, onView, onDelete, onDownload, loading }) => {
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
                            <td className="text-gray-500 font-medium text-sm whitespace-nowrap">
                                {new Date(record.record_date || record.created_at).toLocaleDateString('en-US', { 
                                    year: 'numeric', month: 'short', day: 'numeric' 
                                })}
                            </td>
                            <td>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100 dark:bg-gray-800 dark:border-gray-700 dark:text-blue-400">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white truncate max-w-[200px]" title={record.title}>{record.title}</p>
                                        {record.description && (
                                            <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                                {record.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span className={`record-badge ${getBadgeClass(record.category)}`}>
                                    {record.category}
                                </span>
                            </td>
                            <td className="text-gray-600 dark:text-gray-300 font-medium">
                                {record.doctor_name || <span className="text-gray-400 text-sm">Not specified</span>}
                            </td>
                            <td>
                                {record.verified_by_doctor ? (
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 w-fit">
                                        <ShieldCheck size={13} fill="currentColor" className="text-emerald-500/20" /> Verified
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200 w-fit">
                                        <User size={13} /> Self Upload
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
