import React, { useState, useRef } from 'react';
import { X, Upload, FilePlus, CheckCircle, Calendar, Tag, StickyNote, Building2, UserRound } from 'lucide-react';
import ReactDOM from 'react-dom';

const CATEGORIES = [
  { value: 'prescription', label: 'Prescription',     emoji: '💊', color: '#7C3AED', bg: '#F5F3FF' },
  { value: 'lab',          label: 'Lab Report',        emoji: '🧪', color: '#0891B2', bg: '#ECFEFF' },
  { value: 'scan',         label: 'Scan / Imaging',    emoji: '🫁', color: '#0284C7', bg: '#F0F9FF' },
  { value: 'discharge',    label: 'Discharge Summary', emoji: '🏥', color: '#059669', bg: '#ECFDF5' },
  { value: 'vaccination',  label: 'Vaccination',       emoji: '💉', color: '#DC2626', bg: '#FEF2F2' },
  { value: 'other',        label: 'Other',             emoji: '📄', color: '#64748B', bg: '#F8FAFC' },
];

const UploadMedicalRecordModal = ({ isOpen, onClose, onUpload, defaultDoctorName = '', defaultHospitalName = '' }) => {
  const [title,        setTitle]        = useState('');
  const [doctorName,   setDoctorName]   = useState(defaultDoctorName);
  const [hospitalName, setHospitalName] = useState(defaultHospitalName);
  const [tags,         setTags]         = useState('');
  const [notes,        setNotes]        = useState('');
  const [category,     setCategory]     = useState('prescription');
  const [recordDate,   setRecordDate]   = useState(new Date().toISOString().split('T')[0]);
  const [file,         setFile]         = useState(null);
  const [dragging,     setDragging]     = useState(false);
  const [loading,      setLoading]      = useState(false);
  const fileInputRef = useRef();

  if (!isOpen) return null;

  const handleFileChange = (e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); };
  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files?.[0]; if (f) setFile(f);
  };
  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!file || !title.trim()) return;
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file); fd.append('title', title);
    fd.append('doctor_name', doctorName); fd.append('hospital_name', hospitalName);
    fd.append('category', category); fd.append('record_date', recordDate);
    fd.append('tags', tags); fd.append('notes', notes);
    try {
      await onUpload(fd); onClose();
      setTitle(''); setDoctorName(defaultDoctorName); setHospitalName(defaultHospitalName);
      setTags(''); setNotes(''); setFile(null);
    } catch (err) {
      alert(`Upload failed: ${err.response?.data?.message || err.message || 'Unknown error'}`);
    } finally { setLoading(false); }
  };

  const canSubmit = !loading && !!file && !!title.trim();
  const fileMB = file ? (file.size / 1024 / 1024).toFixed(2) : null;
  const selCat = CATEGORIES.find(c => c.value === category);

  const modal = (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(2,12,30,0.65)', backdropFilter: 'blur(8px)' }} />

      {/* Centering wrapper */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 640,
            background: '#fff', borderRadius: 22,
            boxShadow: '0 40px 100px rgba(0,0,0,0.28)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* ── Header ── */}
          <div style={{
            background: 'linear-gradient(130deg, #0c1e40 0%, #1a56db 100%)',
            padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FilePlus size={19} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontSize: 15, fontWeight: 800 }}>Upload Medical Record</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11.5, marginTop: 1 }}>Attach clinical documents to the patient's health file</div>
            </div>
            <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.12)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', flexShrink: 0 }}>
              <X size={14} />
            </button>
          </div>

          {/* ── Two-column body ── */}
          <div style={{ display: 'flex', overflow: 'hidden', flexShrink: 0 }}>

            {/* LEFT: Category + Drop Zone */}
            <div style={{ width: 200, flexShrink: 0, background: '#F8FAFC', borderRight: '1px solid #E2E8F0', padding: '18px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 2 }}>Document Type</div>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px', borderRadius: 10, cursor: 'pointer',
                    border: category === cat.value ? `1.5px solid ${cat.color}` : '1.5px solid transparent',
                    background: category === cat.value ? cat.bg : 'transparent',
                    transition: 'all 0.15s', textAlign: 'left', width: '100%',
                  }}
                >
                  <span style={{ fontSize: 16, lineHeight: 1 }}>{cat.emoji}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: category === cat.value ? cat.color : '#475569' }}>
                    {cat.label}
                  </span>
                  {category === cat.value && (
                    <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                  )}
                </button>
              ))}

              {/* Mini Drop Zone */}
              <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px dashed #CBD5E1' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 8 }}>
                  File <span style={{ color: '#EF4444' }}>*</span>
                </div>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  style={{
                    border: `2px dashed ${file ? '#22C55E' : dragging ? '#2563EB' : '#CBD5E1'}`,
                    borderRadius: 12, padding: '14px 10px',
                    background: file ? '#F0FDF4' : dragging ? '#EFF6FF' : '#fff',
                    cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                  }}
                >
                  <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleFileChange} style={{ display: 'none' }} />
                  {file ? (
                    <>
                      <CheckCircle size={22} color="#16A34A" style={{ margin: '0 auto 6px' }} />
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#15803D', wordBreak: 'break-all', lineHeight: 1.3 }}>{file.name}</div>
                      <div style={{ fontSize: 10.5, color: '#86EFAC', marginTop: 3 }}>{fileMB} MB</div>
                      <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }}
                        style={{ marginTop: 8, fontSize: 10.5, color: '#DC2626', background: '#FEE2E2', border: 'none', borderRadius: 5, padding: '3px 8px', cursor: 'pointer', fontWeight: 700 }}>
                        Remove
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload size={20} color={dragging ? '#2563EB' : '#94A3B8'} style={{ margin: '0 auto 6px' }} />
                      <div style={{ fontSize: 11, fontWeight: 700, color: dragging ? '#2563EB' : '#64748B' }}>
                        {dragging ? 'Drop here' : 'Click or drag'}
                      </div>
                      <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>PDF, JPG, PNG, DOC</div>
                      <div style={{ fontSize: 10, color: '#94A3B8' }}>Max 15 MB</div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: Form fields */}
            <div style={{ flex: 1, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 13, overflowY: 'auto' }}>

              {/* Record Title */}
              <FG label="Record Title" required>
                <SI value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Blood Test Report, MRI Brain 2026" required />
              </FG>

              {/* Doctor + Hospital */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <FG label="Doctor" icon={<UserRound size={9} />} autoFilled={!!defaultDoctorName}>
                  <SI
                    value={doctorName}
                    onChange={e => setDoctorName(e.target.value)}
                    placeholder="Dr. Smith"
                    readOnly={!!defaultDoctorName}
                    extraStyle={defaultDoctorName ? { background: '#F0F9FF', borderColor: '#BAE6FD', color: '#0369A1', cursor: 'default' } : {}}
                  />
                </FG>
                <FG label="Hospital" icon={<Building2 size={9} />} autoFilled={!!defaultHospitalName}>
                  <SI
                    value={hospitalName}
                    onChange={e => setHospitalName(e.target.value)}
                    placeholder="City Hospital"
                    readOnly={!!defaultHospitalName}
                    extraStyle={defaultHospitalName ? { background: '#F0F9FF', borderColor: '#BAE6FD', color: '#0369A1', cursor: 'default' } : {}}
                  />
                </FG>
              </div>

              {/* Date + Tags */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <FG label="Date" icon={<Calendar size={9} />}>
                  <SI type="date" value={recordDate} onChange={e => setRecordDate(e.target.value)} />
                </FG>
                <FG label="Tags" icon={<Tag size={9} />}>
                  <SI value={tags} onChange={e => setTags(e.target.value)} placeholder="blood-test, checkup" />
                </FG>
              </div>

              {/* Notes */}
              <FG label="Notes" icon={<StickyNote size={9} />}>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Clinical context, observations, or important details…"
                  rows={3}
                  style={{ ...si, resize: 'none', fontFamily: 'inherit', lineHeight: 1.5 }}
                  onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.background = '#fff'; }}
                  onBlur={e =>  { e.target.style.borderColor = '#E2E8F0'; e.target.style.background = '#F8FAFC'; }}
                />
              </FG>

              {/* Selected category preview */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, background: selCat.bg, border: `1px solid ${selCat.color}22` }}>
                <span style={{ fontSize: 20 }}>{selCat.emoji}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: selCat.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {selCat.label}
                  </div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>
                    {file ? `${file.name} — ${fileMB} MB` : 'No file selected yet'}
                  </div>
                </div>
                {file && <CheckCircle size={16} color="#22C55E" style={{ marginLeft: 'auto', flexShrink: 0 }} />}
              </div>

            </div>
          </div>

          {/* ── Footer ── */}
          <div style={{
            padding: '12px 20px', borderTop: '1px solid #F1F5F9',
            background: '#FAFAFA', display: 'flex', justifyContent: 'flex-end',
            gap: 10, flexShrink: 0,
          }}>
            <button type="button" onClick={onClose}
              style={{ padding: '9px 18px', borderRadius: 9, border: '1.5px solid #E2E8F0', background: '#fff', fontWeight: 700, fontSize: 13, color: '#64748B', cursor: 'pointer' }}>
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                padding: '9px 22px', borderRadius: 9, border: 'none',
                background: canSubmit ? 'linear-gradient(135deg,#2563EB,#1D4ED8)' : '#E2E8F0',
                color: canSubmit ? '#fff' : '#94A3B8',
                fontWeight: 800, fontSize: 13, cursor: canSubmit ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', gap: 7,
                boxShadow: canSubmit ? '0 4px 12px rgba(37,99,235,0.28)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {loading
                ? <><Spin /> Uploading…</>
                : <><Upload size={14} /> Upload Record</>
              }
            </button>
          </div>

        </div>
      </div>
      <style>{`@keyframes _spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );

  return ReactDOM.createPortal(modal, document.body);
};

/* ── Micro helpers ─────────────────────────────────── */
const si = {
  border: '1.5px solid #E2E8F0', borderRadius: 9, padding: '9px 12px',
  fontSize: 13, background: '#F8FAFC', color: '#1E293B',
  outline: 'none', width: '100%', boxSizing: 'border-box',
  transition: 'border-color 0.15s, background 0.15s',
};
const SI = ({ extraStyle = {}, ...props }) => (
  <input
    {...props}
    style={{ ...si, ...extraStyle }}
    onFocus={e => { if (!props.readOnly) { e.target.style.borderColor = '#2563EB'; e.target.style.background = '#fff'; } }}
    onBlur={e =>  { if (!props.readOnly) { e.target.style.borderColor = extraStyle.borderColor || '#E2E8F0'; e.target.style.background = extraStyle.background || '#F8FAFC'; } }}
  />
);
const FG = ({ label, icon, required, autoFilled, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    <label style={{ fontSize: 10, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 3 }}>
      {icon} {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
      {autoFilled && (
        <span style={{ marginLeft: 4, fontSize: 9, fontWeight: 700, color: '#0369A1', background: '#E0F2FE', padding: '1px 6px', borderRadius: 999, textTransform: 'none', letterSpacing: 0 }}>
          Auto-filled
        </span>
      )}
    </label>
    {children}
  </div>
);
const Spin = () => (
  <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', display: 'inline-block', animation: '_spin 0.7s linear infinite' }} />
);

export default UploadMedicalRecordModal;
