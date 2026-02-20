import React from 'react';

const STAR_COLORS = {
  5: '#10b981',
  4: '#34d399',
  3: '#f59e0b',
  2: '#f97316',
  1: '#ef4444',
};

const RatingDistributionChart = ({ distribution }) => {
  if (!distribution) return <div className="df-panel skeleton" style={{ height: 220 }} />;

  const total = Object.values(distribution).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="df-panel">
      <div className="df-panel-header">
        <h3 className="df-panel-title">Rating Distribution</h3>
        <span className="df-panel-sub">{total} total reviews</span>
      </div>
      <div className="df-dist-bars">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star] || 0;
          const pct = Math.round((count / total) * 100);
          return (
            <div key={star} className="df-dist-row">
              <div className="df-dist-label">
                <span style={{ color: STAR_COLORS[star], fontWeight: 900 }}>{star}★</span>
              </div>
              <div className="df-dist-track">
                <div
                  className="df-dist-fill"
                  style={{
                    width: `${pct}%`,
                    background: STAR_COLORS[star],
                    boxShadow: `0 0 8px ${STAR_COLORS[star]}44`,
                  }}
                />
              </div>
              <div className="df-dist-count">
                <span style={{ fontWeight: 800 }}>{count}</span>
                <span className="df-dist-pct">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RatingDistributionChart;
