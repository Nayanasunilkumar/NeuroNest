import React, { useEffect, useState } from 'react';
import { ShieldCheck, RefreshCcw, AlertTriangle } from 'lucide-react';
import { useFeedback } from '../../hooks/useFeedback';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/env';
import { feedbackService } from '../../services/feedbackService';
import QualityStatsCards from './components/QualityStatsCards';
import ReviewFilters from './components/ReviewFilters';
import ReviewTable from './components/ReviewTable';
import ReviewDetailModal from './components/ReviewDetailModal';

const FeedbackPage = () => {
  const navigate = useNavigate();
  const { 
    reviews, stats, loading, error, filters,
    updateFilters, moderateReview, refresh 
  } = useFeedback();
  
  const [selectedReview, setSelectedReview] = useState(null);
  const [apiMismatchWarning, setApiMismatchWarning] = useState('');

  useEffect(() => {
    let active = true;

    const runApiCheck = async () => {
      try {
        const marker = await feedbackService.getMarker(true);
        if (!active || !marker?.request_host) return;
        const pointsToHost = API_BASE_URL.includes(marker.request_host);
        if (!pointsToHost) {
          setApiMismatchWarning(
            `API route mismatch detected. Frontend base: ${API_BASE_URL} | responding backend host: ${marker.request_host} | marker: ${marker.marker || 'n/a'}`
          );
        } else {
          setApiMismatchWarning('');
        }
      } catch {
        // Marker check is diagnostic only.
      }
    };

    runApiCheck();
    return () => {
      active = false;
    };
  }, []);

  const handleCardClick = (key) => {
    if (key === 'reported' && stats?.most_reported_doctor_id) {
        navigate(`/admin/governance/doctor/${stats.most_reported_doctor_id}`);
    } else if (key === 'escalations') {
        navigate('/admin/governance/queue');
    }
  };

  if (error) return (
    <div className="appointments-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <AlertTriangle size={48} color="var(--admin-danger)" />
      <h2 style={{ marginTop: '1rem' }}>Governance Stream Disruption</h2>
      <p style={{ color: 'var(--admin-text-muted)', marginBottom: '2rem' }}>{error}</p>
      <button className="btn-toggle" onClick={() => window.location.reload()}>Retry Connection</button>
    </div>
  );

  return (
    <div className="appointments-page">
      {/* Header Nexus */}
      <div className="appt-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="appt-title-nexus">
            <h1>Quality Governance & Feedback</h1>
            <p>Institutional Service Monitoring Axis</p>
          </div>
          <button 
            className="header-icon-btn" 
            onClick={refresh} 
            disabled={loading}
            title="Refresh Governance Data"
          >
            <RefreshCcw size={18} className={loading ? 'spin' : ''} />
          </button>
        </div>
        {apiMismatchWarning && (
          <div style={{ marginTop: '0.75rem', color: 'var(--admin-warning)', fontSize: '0.8rem', fontWeight: 700 }}>
            {apiMismatchWarning}
          </div>
        )}

        {/* Dynamic Telemetry */}
        <QualityStatsCards stats={stats} onCardClick={handleCardClick} />
      </div>

      {/* Control Matrix */}
      <ReviewFilters filters={filters} onFilterChange={updateFilters} />

      {/* Review Data Grid */}
      {loading && !reviews.length ? (
        <div style={{ textAlign: 'center', padding: '10rem', opacity: 0.5 }}>
          <div className="spin" style={{ display: 'inline-block', marginBottom: '1rem' }}>
            <ShieldCheck size={48} color="var(--admin-accent)" />
          </div>
          <p style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Authenticating Oversight Streams...</p>
        </div>
      ) : (
        <ReviewTable 
          reviews={reviews} 
          onSelectReview={setSelectedReview} 
        />
      )}

      {/* Moderation Detail Portal */}
      {selectedReview && (
        <ReviewDetailModal 
          key={selectedReview.id}
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
          onModerate={moderateReview}
        />
      )}

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .table-row-hover:hover {
          background: var(--admin-accent-soft) !important;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default FeedbackPage;
