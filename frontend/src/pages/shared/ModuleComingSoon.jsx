import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Rocket } from 'lucide-react';

const ModuleComingSoon = ({ title = 'Module', description = 'This module is prepared and ready for phased rollout.' }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');

  const handleBack = () => {
    if (patientId) {
      navigate(`/doctor/patient-records?patientId=${patientId}`);
    } else {
      navigate(-1);
    }
  };

  return (
    <div style={{ padding: '0 32px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 0',
        borderBottom: '1px solid #F1F5F9',
      }}>
        <button
          onClick={handleBack}
          title="Back to Clinical Dossier"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '1px solid #E2E8F0',
            background: '#F8FAFC',
            color: '#64748B',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.color = '#2563EB'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B'; }}
        >
          <ChevronLeft size={20} />
        </button>

        <div>
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8' }}>
            Clinical Dossier / {title}
          </span>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            {title}
          </h1>
        </div>
      </div>

      {/* Coming Soon Card */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)',
        borderRadius: '24px',
        padding: '48px 40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '20px',
        boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.3)',
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#60A5FA',
        }}>
          <Rocket size={36} />
        </div>
        <div>
          <h2 style={{ margin: '0 0 8px', fontSize: '1.6rem', fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.02em' }}>
            Launching Soon
          </h2>
          <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.95rem', maxWidth: '400px', lineHeight: '1.6' }}>
            {description}
          </p>
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 18px',
          borderRadius: '999px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: '#60A5FA',
          fontSize: '13px',
          fontWeight: 600,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }}></span>
          Module scaffolded · Ready for phased rollout
        </div>
      </div>
    </div>
  );
};

export default ModuleComingSoon;
