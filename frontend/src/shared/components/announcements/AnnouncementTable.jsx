import React from 'react';
import { Archive, Copy, Edit2, Eye, Megaphone, Send, Trash2 } from 'lucide-react';

const targetLabel = (targets = []) => {
  if (!targets.length) return 'All Users';
  return targets
    .map((t) => {
      if (t.target_type === 'All') return 'All Users';
      if (t.target_type === 'Role') return `Role: ${t.target_value}`;
      if (t.target_type === 'User') return `User: ${t.target_value}`;
      if (t.target_type === 'Audience') return `Audience: ${t.target_value}`;
      return `${t.target_type}:${t.target_value || ''}`;
    })
    .join(', ');
};

const formatDate = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString();
};

const AnnouncementTable = ({ announcements, onEdit, onDelete, onStatusChange }) => {
  const onDuplicate = (item) => {
    onEdit({
      ...item,
      id: undefined,
      title: `${item.title} (Copy)`,
      status: 'Draft',
    });
  };

  return (
    <table className="announcements-table-custom">
      <thead>
        <tr>
          <th>Title & Audience</th>
          <th>Category</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Schedule</th>
          <th>Expiry</th>
          <th>Views</th>
          <th>Created By</th>
          <th style={{ textAlign: 'right' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {announcements.map((item) => (
          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4">
              <div className="d-flex flex-column">
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-bold text-slate-900">{item.title}</span>
                </div>
                <span className="text-xs text-slate-500 fw-medium">{targetLabel(item.targets)}</span>
              </div>
            </td>
            <td className="px-6 py-4">{item.category || 'General'}</td>
            <td className="px-6 py-4">
              <span className={`badge badge-${(item.priority || 'low').toLowerCase()}`}>{item.priority}</span>
            </td>
            <td className="px-6 py-4">
              <span className={`status-pill status-${(item.status || 'draft').toLowerCase()}`}>{item.status}</span>
            </td>
            <td className="px-6 py-4">{formatDate(item.publish_at)}</td>
            <td className="px-6 py-4">{formatDate(item.expiry_at)}</td>
            <td className="px-6 py-4">
              <div className="d-flex flex-column text-xs">
                <span className="d-flex align-items-center gap-1">
                  <Eye size={14} /> {item.views_count || 0}
                </span>
                <span className="text-slate-500">Unread: {item.unread_count || 0}</span>
              </div>
            </td>
            <td className="px-6 py-4">{item.author_name || 'Admin'}</td>
            <td className="px-6 py-4 text-right">
              <div className="d-flex justify-content-end gap-2 flex-wrap">
                {item.status !== 'Published' && (
                  <button className="btn-icon" title="Publish" onClick={() => onStatusChange(item.id, 'Published')}>
                    <Send size={16} />
                  </button>
                )}
                <button className="btn-icon" title="Archive" onClick={() => onStatusChange(item.id, 'Archived')}>
                  <Archive size={16} />
                </button>
                <button className="btn-icon" title="Send Reminder" onClick={() => onStatusChange(item.id, 'Published')}>
                  <Megaphone size={16} />
                </button>
                <button className="btn-icon" title="Duplicate" onClick={() => onDuplicate(item)}>
                  <Copy size={16} />
                </button>
                <button className="btn-icon" title="Edit" onClick={() => onEdit(item)}>
                  <Edit2 size={16} />
                </button>
                <button className="btn-icon btn-icon-delete" title="Delete" onClick={() => onDelete(item.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          </tr>
        ))}
        {announcements.length === 0 && (
          <tr>
            <td colSpan="9" className="px-6 py-12 text-center text-slate-500 font-medium">
              No announcements found matching your filters.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default AnnouncementTable;
