import React from 'react';

const RatingStars = ({ value, onChange, size = 'lg', readOnly = false }) => {
  const [hovered, setHovered] = React.useState(0);
  const sz = size === 'lg' ? '2.25rem' : '1.1rem';

  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <button
            key={i}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange && onChange(i)}
            onMouseEnter={() => !readOnly && setHovered(i)}
            onMouseLeave={() => !readOnly && setHovered(0)}
            style={{
              background: 'none', border: 'none', cursor: readOnly ? 'default' : 'pointer',
              padding: '0.1rem',
              fontSize: sz,
              color: i <= (hovered || value)
                ? (i <= 2 ? '#ef4444' : i === 3 ? '#f59e0b' : '#10b981')
                : 'rgba(0,0,0,0.12)',
              transform: i <= (hovered || value) ? 'scale(1.15)' : 'scale(1)',
              transition: 'all 0.15s cubic-bezier(0.34,1.56,0.64,1)',
              lineHeight: 1,
            }}
          >★</button>
        ))}
      </div>
      {!readOnly && (hovered || value) > 0 && (
        <div style={{
          marginTop: '0.4rem', fontSize: '0.78rem', fontWeight: 800,
          color: (hovered || value) <= 2 ? '#ef4444' : (hovered || value) === 3 ? '#f59e0b' : '#10b981'
        }}>
          {labels[hovered || value]}
        </div>
      )}
    </div>
  );
};

export default RatingStars;
