import React, { useEffect, useState } from 'react';
import { Save, Send, X } from 'lucide-react';

const initialForm = {
  title: '',
  content: '',
  audience: 'all_users',
  audience_user_id: '',
  category: 'System',
  priority: 'Medium',
  status: 'Draft',
  publish_at: new Date().toISOString().slice(0, 16),
  expiry_at: '',
  send_notification: true,
  send_email: false,
  require_acknowledgement: false,
  is_pinned: false,
  attachment_url: '',
};

const CreateAnnouncementModal = ({ announcement = null, onClose, onSave }) => {
  const isEdit = !!announcement;
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (!announcement) {
      setFormData(initialForm);
      return;
    }

    const targets = announcement.targets || [];
    let audience = 'all_users';
    let audience_user_id = '';
    const firstTarget = targets[0];
    if (firstTarget) {
      if (firstTarget.target_type === 'All') audience = 'all_users';
      if (firstTarget.target_type === 'Role' && firstTarget.target_value === 'doctor') audience = 'all_doctors';
      if (firstTarget.target_type === 'Role' && firstTarget.target_value === 'patient') audience = 'all_patients';
      if (firstTarget.target_type === 'Audience') audience = firstTarget.target_value || 'all_users';
      if (firstTarget.target_type === 'User') {
        audience = 'specific_patient';
        audience_user_id = firstTarget.target_value || '';
      }
    }

    setFormData({
      title: announcement.title || '',
      content: announcement.content || '',
      audience,
      audience_user_id,
      category: announcement.category || 'System',
      priority: announcement.priority || 'Medium',
      status: announcement.status || 'Draft',
      publish_at: announcement.publish_at ? announcement.publish_at.slice(0, 16) : new Date().toISOString().slice(0, 16),
      expiry_at: announcement.expiry_at ? announcement.expiry_at.slice(0, 16) : '',
      send_notification: true,
      send_email: false,
      require_acknowledgement: !!announcement.require_acknowledgement,
      is_pinned: !!announcement.is_pinned,
      attachment_url: '',
    });
  }, [announcement]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const buildTargets = (payload) => {
    const targets = [];
    const aud = payload.audience;
    if (aud === 'all_users') targets.push({ type: 'All', value: '' });
    if (aud === 'all_doctors') targets.push({ type: 'Role', value: 'doctor' });
    if (aud === 'all_patients') targets.push({ type: 'Role', value: 'patient' });
    if (aud === 'admin_only') targets.push({ type: 'Audience', value: 'admin_only' });
    if (aud === 'monitoring_doctors') targets.push({ type: 'Audience', value: 'monitoring_doctors' });
    if (aud === 'suspended_doctors') targets.push({ type: 'Audience', value: 'suspended_doctors' });
    if (aud === 'specific_doctor' && payload.audience_user_id) {
      targets.push({ type: 'Audience', value: 'specific_doctor' });
      targets.push({ type: 'User', value: payload.audience_user_id });
    }
    if (aud === 'specific_patient' && payload.audience_user_id) {
      targets.push({ type: 'Audience', value: 'specific_patient' });
      targets.push({ type: 'User', value: payload.audience_user_id });
    }
    return targets.length ? targets : [{ type: 'All', value: '' }];
  };

  const handleSubmit = (status = formData.status) => {
    const payload = {
      ...formData,
      status,
      targets: buildTargets(formData),
    };
    onSave(payload);
  };

  return (
    <div className="ann-modal-overlay">
      <div className="ann-modal-content">
        <div className="ann-modal-header">
          <h2>{isEdit ? 'Edit Announcement' : 'Create New Announcement'}</h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="ann-modal-body">
          <div className="ann-form-group">
            <label>Title</label>
            <input
              name="title"
              className="ann-form-input"
              value={formData.title}
              onChange={handleChange}
              placeholder="Announcement title..."
            />
          </div>

          <div className="ann-form-group">
            <label>Message</label>
            <textarea
              name="content"
              className="ann-form-textarea"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write policy update, maintenance notice, or emergency guidance..."
            />
          </div>

          <div className="ann-form-row">
            <div className="ann-form-group">
              <label>Audience</label>
              <select name="audience" className="ann-form-select" value={formData.audience} onChange={handleChange}>
                <option value="all_users">All Users</option>
                <option value="all_doctors">All Doctors</option>
                <option value="all_patients">All Patients</option>
                <option value="monitoring_doctors">Monitoring Doctors</option>
                <option value="suspended_doctors">Suspended Doctors</option>
                <option value="specific_doctor">Specific Doctor</option>
                <option value="specific_patient">Specific Patient</option>
                <option value="admin_only">Admin Only</option>
              </select>
            </div>
            {(formData.audience === 'specific_doctor' || formData.audience === 'specific_patient') && (
              <div className="ann-form-group">
                <label>{formData.audience === 'specific_doctor' ? 'Doctor User ID' : 'Patient User ID'}</label>
                <input
                  name="audience_user_id"
                  className="ann-form-input"
                  value={formData.audience_user_id}
                  onChange={handleChange}
                  placeholder="Enter user ID"
                />
              </div>
            )}
          </div>

          <div className="ann-form-row">
            <div className="ann-form-group">
              <label>Category</label>
              <select name="category" className="ann-form-select" value={formData.category} onChange={handleChange}>
                <option>System</option>
                <option>Policy</option>
                <option>Emergency</option>
                <option>General</option>
              </select>
            </div>
            <div className="ann-form-group">
              <label>Priority</label>
              <select name="priority" className="ann-form-select" value={formData.priority} onChange={handleChange}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>
            <div className="ann-form-group">
              <label>Status</label>
              <select name="status" className="ann-form-select" value={formData.status} onChange={handleChange}>
                <option>Draft</option>
                <option>Scheduled</option>
                <option>Published</option>
                <option>Archived</option>
              </select>
            </div>
          </div>

          <div className="ann-form-row">
            <div className="ann-form-group">
              <label>Publish Date</label>
              <input type="datetime-local" name="publish_at" className="ann-form-input" value={formData.publish_at} onChange={handleChange} />
            </div>
            <div className="ann-form-group">
              <label>Expiry Date</label>
              <input type="datetime-local" name="expiry_at" className="ann-form-input" value={formData.expiry_at} onChange={handleChange} />
            </div>
          </div>

          <div className="ann-form-group">
            <label>Attachment URL (Optional)</label>
            <input
              name="attachment_url"
              className="ann-form-input"
              value={formData.attachment_url}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <div className="flex gap-4 mb-2 flex-wrap">
            <label className="ann-checkbox-label">
              <input type="checkbox" name="send_notification" checked={formData.send_notification} onChange={handleChange} />
              Send Notification
            </label>
            <label className="ann-checkbox-label">
              <input type="checkbox" name="send_email" checked={formData.send_email} onChange={handleChange} />
              Send Email
            </label>
            <label className="ann-checkbox-label">
              <input type="checkbox" name="require_acknowledgement" checked={formData.require_acknowledgement} onChange={handleChange} />
              Require Acknowledgement
            </label>
            <label className="ann-checkbox-label">
              <input type="checkbox" name="is_pinned" checked={formData.is_pinned} onChange={handleChange} />
              Pin to Top
            </label>
          </div>
        </div>
        <div className="ann-modal-footer">
          <button className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="px-6 py-2.5 rounded-xl font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2" type="button" onClick={() => handleSubmit('Draft')}>
            <Save size={18} />
            Save Draft
          </button>
          <button className="btn-primary flex items-center gap-2" type="button" onClick={() => handleSubmit('Published')}>
            <Send size={18} />
            {isEdit ? 'Update & Publish' : 'Publish Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAnnouncementModal;
