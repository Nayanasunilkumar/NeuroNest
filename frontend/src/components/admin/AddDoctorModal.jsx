import React, { useState, useEffect } from 'react';
import { X, UserPlus, Info, CheckCircle, Shield } from 'lucide-react';
import { fetchSpecialties } from '../../services/adminDoctorAPI';

const AddDoctorModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    specialization: 'Neurologist',
    license_number: '',
    sector: 'North Sector',
    password: 'Doctor@123'
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
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header bg-primary text-white p-4 border-0 position-relative" style={{ background: 'linear-gradient(135deg, #0d6efd, #6610f2)' }}>
            <div className="d-flex align-items-center gap-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-3">
                    <UserPlus size={24} />
                </div>
                <div>
                    <h5 className="modal-title fw-black mb-0">Onboard Clinical Specialist</h5>
                    <p className="small mb-0 opacity-75 fw-bold">Provision systemic access for a new medical provider</p>
                </div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4 p-lg-5">
              <div className="alert alert-info border-0 rounded-3 d-flex align-items-center gap-3 mb-4 bg-primary bg-opacity-10 text-primary border border-primary border-opacity-10">
                <Shield size={20} className="flex-shrink-0" />
                <div className="small fw-bold">
                    Default access key will be set to <span className="badge bg-primary text-white font-monospace">Doctor@123</span>. User will be prompted for mandatory reset on first uplink.
                </div>
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label small fw-black text-uppercase opacity-50 letter-spacing-1">Professional Name</label>
                  <input 
                    type="text" 
                    className="form-control bg-light border-0 py-2 px-3 rounded-3 fw-bold" 
                    required 
                    placeholder="e.g. Dr. Alexander Wright"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-black text-uppercase opacity-50 letter-spacing-1">Institutional Email</label>
                  <input 
                    type="email" 
                    className="form-control bg-light border-0 py-2 px-3 rounded-3 fw-bold font-monospace" 
                    required 
                    placeholder="alexander@neuronest.org"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-black text-uppercase opacity-50 letter-spacing-1">Primary Specialization</label>
                  <select 
                    className="form-select bg-light border-0 py-2 px-3 rounded-3 fw-bold"
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                  >
                    {specialties.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-black text-uppercase opacity-50 letter-spacing-1">License Identifier</label>
                  <input 
                    type="text" 
                    className="form-control bg-light border-0 py-2 px-3 rounded-3 fw-bold font-monospace shadow-none" 
                    required 
                    placeholder="MC-22948-X"
                    value={formData.license_number}
                    onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                  />
                </div>

                <div className="col-md-12">
                  <label className="form-label small fw-black text-uppercase opacity-50 letter-spacing-1">Assigned Operational Sector</label>
                  <div className="d-flex flex-wrap gap-2 mt-1">
                    {['North Sector', 'South Sector', 'East Sector', 'West Sector'].map(sector => (
                        <button
                            key={sector}
                            type="button"
                            className={`btn btn-sm rounded-pill px-3 fw-bold border ${formData.sector === sector ? 'btn-primary border-primary' : 'btn-light border-transparent'}`}
                            onClick={() => setFormData({...formData, sector})}
                        >
                            {sector.replace(' Sector', '')}
                        </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer bg-light p-4 border-0">
              <button type="button" className="btn btn-link text-secondary text-decoration-none fw-black small" onClick={onClose}>
                ABORT ONBOARDING
              </button>
              <button 
                type="submit" 
                className="btn btn-primary px-5 py-2 rounded-pill fw-black shadow-sm d-flex align-items-center gap-2 border-0" 
                style={{ background: 'linear-gradient(135deg, #0d6efd, #6610f2)' }}
                disabled={loading}
              >
                {loading ? (
                    <>
                        <div className="spinner-border spinner-border-sm" role="status"></div>
                        AUTHORIZING...
                    </>
                ) : (
                    <>
                        <CheckCircle size={18} /> AUTHORIZED ACCESS
                    </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`
        .fw-black { font-weight: 950; }
        .letter-spacing-1 { letter-spacing: 1px; }
      `}</style>
    </div>
  );
};

export default AddDoctorModal;
