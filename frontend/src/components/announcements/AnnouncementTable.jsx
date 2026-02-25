import React from 'react';
import { Edit2, Trash2, ExternalLink, Archive, Pin, Eye } from 'lucide-react';

const AnnouncementTable = ({ announcements, onEdit, onDelete, onStatusChange }) => {
    return (
        <div className="announcements-table-container">
            <table className="announcements-table-custom">
                <thead>
                    <tr>
                        <th>Title & Audience</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Schedule</th>
                        <th>Views</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>

                    {announcements.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        {item.is_pinned && <Pin size={14} className="text-blue-500 fill-blue-500" />}
                                        <span className="font-bold text-slate-900 line-clamp-1">{item.title}</span>
                                    </div>
                                    <span className="text-xs text-slate-500 font-medium">
                                        Category: {item.category} • Targets: {item.targets.map(t => t.target_type === 'All' ? 'All' : `${t.target_type}:${t.target_value}`).join(', ')}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`badge badge-${item.priority.toLowerCase()}`}>
                                    {item.priority}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`status-pill status-${item.status.toLowerCase()}`}>
                                    {item.status}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col text-xs">
                                    <span className="text-slate-700 font-semibold">Pub: {new Date(item.publish_at).toLocaleDateString()}</span>
                                    <span className="text-slate-400">Exp: {item.expiry_at ? new Date(item.expiry_at).toLocaleDateString() : 'Never'}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-1.5 text-slate-600 font-bold text-sm">
                                    <Eye size={16} />
                                    {item.views_count}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button 
                                        className="btn-icon" 
                                        title="Archive"
                                        onClick={() => onStatusChange(item.id, 'Archived')}
                                    >
                                        <Archive size={16} />
                                    </button>
                                    <button 
                                        className="btn-icon" 
                                        title="Edit"
                                        onClick={() => onEdit(item)}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        className="btn-icon btn-icon-delete" 
                                        title="Delete"
                                        onClick={() => onDelete(item.id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {announcements.length === 0 && (
                        <tr>
                            <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">
                                No announcements found matching your filters.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AnnouncementTable;
