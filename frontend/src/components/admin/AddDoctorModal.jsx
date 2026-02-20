import React, { useState, useEffect } from 'react';
import { X, UserPlus, Info } from 'lucide-react';
import { fetchSpecialties } from '../../services/adminDoctorAPI';

const AddDoctorModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    specialization: 'Neurologist',
    license_number: '',
    sector: 'North Sector',
    password: 'Doctor@123' // Default
  });
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSpecialties();
    }
  }, [isOpen]);

  const loadSpecialties = async () => {
    try {
      const data = await fetchSpecialties();
      setSpecialties(data.specialties);
      if (data.specialties.length > 0 && !formData.specialization) {
        setFormData(prev => ({ ...prev, specialization: data.specialties[0] }));
      }
    } catch (err) {
      console.error('Failed to load specialties', err);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onAdd(formData);
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to onboard doctor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="onboard-modal">
        <button className="close-btn" onClick={onClose} style={{position: 'absolute', top: '1.5rem', right: '1.5rem', border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8'}}>
          <X size={24} />
        </button>
        
        <h2>Onboard Specialist</h2>
        <p style={{fontSize: '0.9rem', color: '#94a3b8', marginBottom: '2rem'}}>
          Provision a clinical gateway account. The initial system access key will be: <strong style={{color: '#fff'}}>Doctor@123</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Professional Name</label>
              <input 
                type="text" 
                required 
                placeholder="Dr. Alexander Wright"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Institutional Email</label>
              <input 
                type="email" 
                required 
                placeholder="alexander@neuronest.org"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Primary Specialization</label>
              <select 
                value={formData.specialization}
                onChange={(e) => setFormData({...formData, specialization: e.target.value})}
              >
                {specialties.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>License Identifier</label>
              <input 
                type="text" 
                required 
                placeholder="MC-22948-X"
                value={formData.license_number}
                onChange={(e) => setFormData({...formData, license_number: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Assigned Sector</label>
              <select 
                value={formData.sector}
                onChange={(e) => setFormData({...formData, sector: e.target.value})}
              >
                <option value="North Sector">North Sector</option>
                <option value="South Sector">South Sector</option>
                <option value="East Sector">East Sector</option>
                <option value="West Sector">West Sector</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="modal-cancel-btn">
              Cancel
            </button>
            <button type="submit" className="onboard-btn" disabled={loading}>
              {loading ? 'Authorizing...' : (
                <>
                  <UserPlus size={18} />
                  Authorize Access
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDoctorModal;
