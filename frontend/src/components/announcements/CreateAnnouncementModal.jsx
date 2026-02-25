import React, { useState, useEffect } from 'react';
import { X, Save, Send } from 'lucide-react';

const CreateAnnouncementModal = ({ announcement = null, onClose, onSave }) => {
    const isEdit = !!announcement;
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'General',
        priority: 'Low',
        status: 'Draft',
        publish_at: new Date().toISOString().slice(0, 16),
        expiry_at: '',
        is_pinned: false,
        require_acknowledgement: false,
        targets: [{ type: 'All', value: '' }]
    });

    useEffect(() => {
        if (announcement) {
            setFormData({
                ...announcement,
                publish_at: announcement.publish_at ? announcement.publish_at.slice(0, 16) : new Date().toISOString().slice(0, 16),
                expiry_at: announcement.expiry_at ? announcement.expiry_at.slice(0, 16) : '',
                targets: announcement.targets.length > 0 ? announcement.targets.map(t => ({ type: t.target_type, value: t.target_value })) : [{ type: 'All', value: '' }]
            });
        }
    }, [announcement]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleTargetChange = (index, field, value) => {
        const newTargets = [...formData.targets];
        newTargets[index][field] = value;
        setFormData(prev => ({ ...prev, targets: newTargets }));
    };

    const addTarget = () => {
        setFormData(prev => ({ ...prev, targets: [...prev.targets, { type: 'Role', value: '' }] }));
    };

    const removeTarget = (index) => {
        setFormData(prev => ({ ...prev, targets: prev.targets.filter((_, i) => i !== index) }));
    };

    const handleSubmit = (status = formData.status) => {
        onSave({ ...formData, status });
    };

    return (
        <div className="ann-modal-overlay">
            <div className="ann-modal-content">
                <div className="ann-modal-header">
                    <h2>{isEdit ? 'Edit Announcement' : 'Create New Announcement'}</h2>
                    <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                </div>
                <div className="ann-modal-body">
                    <div className="ann-form-group">
                        <label>Title</label>
                        <input 
                            name="title" 
                            className="ann-form-input" 
                            value={formData.title} 
                            onChange={handleChange} 
                            placeholder="Annoucement title..."
                        />
                    </div>
                    
                    <div className="ann-form-row">
                        <div className="ann-form-group">
                            <label>Category</label>
                            <select name="category" className="ann-form-select" value={formData.category} onChange={handleChange}>
                                <option>General</option>
                                <option>System Update</option>
                                <option>Policy</option>
                                <option>Emergency</option>
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
                    </div>

                    <div className="ann-form-group">
                        <label>Content</label>
                        <textarea 
                            name="content" 
                            className="ann-form-textarea" 
                            value={formData.content} 
                            onChange={handleChange}
                            placeholder="Write your announcement message here..."
                        ></textarea>
                    </div>

                    <div className="ann-form-row">
                        <div className="ann-form-group">
                            <label>Publish Date</label>
                            <input 
                                type="datetime-local" 
                                name="publish_at" 
                                className="ann-form-input" 
                                value={formData.publish_at} 
                                onChange={handleChange} 
                            />
                        </div>
                        <div className="ann-form-group">
                            <label>Expiry Date (Optional)</label>
                            <input 
                                type="datetime-local" 
                                name="expiry_at" 
                                className="ann-form-input" 
                                value={formData.expiry_at} 
                                onChange={handleChange} 
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 mb-2">
                        <label className="ann-checkbox-label">
                            <input type="checkbox" name="is_pinned" checked={formData.is_pinned} onChange={handleChange} />
                            Pin to Top Dashboard
                        </label>
                        <label className="ann-checkbox-label">
                            <input type="checkbox" name="require_acknowledgement" checked={formData.require_acknowledgement} onChange={handleChange} />
                            Require User Acknowledgement
                        </label>
                    </div>

                    <div className="ann-form-group">
                        <label className="flex justify-between items-center">
                            Target Audience
                            <button type="button" className="btn-add-target" onClick={addTarget}>+ Add Target</button>
                        </label>
                        {formData.targets.map((target, index) => (
                            <div key={index} className="flex gap-3 items-center">
                                <select 
                                    className="ann-form-select w-1/3" 
                                    value={target.type} 
                                    onChange={(e) => handleTargetChange(index, 'type', e.target.value)}
                                >
                                    <option value="All">All Users</option>
                                    <option value="Role">By Role</option>
                                    <option value="User">Specific User ID</option>
                                </select>
                                {target.type !== 'All' && (
                                    <input 
                                        className="ann-form-input flex-1" 
                                        placeholder={target.type === 'Role' ? 'patient, doctor, admin...' : 'User ID...'}
                                        value={target.value}
                                        onChange={(e) => handleTargetChange(index, 'value', e.target.value)}
                                    />
                                )}
                 <button className="btn-icon btn-icon-delete flex-shrink-0" type="button" onClick={() => removeTarget(index)} disabled={formData.targets.length === 1}>
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="ann-modal-footer">
                    <button className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors" type="button" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="px-6 py-2.5 rounded-xl font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2" type="button" onClick={() => handleSubmit('Draft')}>
                        <Save size={18} />
                        Save as Draft
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
