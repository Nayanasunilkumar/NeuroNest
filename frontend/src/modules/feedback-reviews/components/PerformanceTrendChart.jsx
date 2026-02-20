import React from 'react';

const MAX_RATING = 5;

// Pure SVG line chart — no external dependencies required
const PerformanceTrendChart = ({ trend }) => {
  if (!trend || !trend.length) return <div className="df-panel skeleton" style={{ height: 220 }} />;

  const W = 420, H = 140, PAD = { top: 16, right: 16, bottom: 32, left: 36 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  // Filter months that have data for the line, but show all for x-axis
  const xStep = innerW / (trend.length - 1 || 1);

  const toX = (i) => PAD.left + i * xStep;
  const toY = (val) => PAD.top + innerH - (val / MAX_RATING) * innerH;

  // Build polyline points
  const points = trend.map((d, i) => `${toX(i)},${toY(d.avg_rating)}`).join(' ');
  const areaPoints = [
    `${toX(0)},${PAD.top + innerH}`,
    ...trend.map((d, i) => `${toX(i)},${toY(d.avg_rating)}`),
    `${toX(trend.length - 1)},${PAD.top + innerH}`,
  ].join(' ');

  // Y grid lines
  const yLines = [1, 2, 3, 4, 5];

  return (
    <div className="df-panel">
      <div className="df-panel-header">
        <h3 className="df-panel-title">Monthly Performance Trend</h3>
        <span className="df-panel-sub">Avg rating per month</span>
      </div>
      <div className="df-trend-container" style={{ overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 280, display: 'block' }}>
          <defs>
            <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Y grid */}
          {yLines.map((y) => (
            <g key={y}>
              <line
                x1={PAD.left} x2={PAD.left + innerW}
                y1={toY(y)} y2={toY(y)}
                stroke="rgba(255,255,255,0.05)" strokeWidth="1"
              />
              <text x={PAD.left - 6} y={toY(y) + 4} fill="#94a3b8" fontSize="9" textAnchor="end">{y}</text>
            </g>
          ))}

          {/* Area fill */}
          <polygon points={areaPoints} fill="url(#trendGrad)" />

          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Dots + labels */}
          {trend.map((d, i) => (
            <g key={i}>
              <circle cx={toX(i)} cy={toY(d.avg_rating)} r="4"
                fill="#6366f1" stroke="#fff" strokeWidth="1.5" />
              {/* Month label */}
              <text x={toX(i)} y={H - 6} fill="#64748b" fontSize="8" textAnchor="middle">
                {d.month.split(' ')[0]}
              </text>
              {/* Value tooltip on hover — static label */}
              {d.avg_rating > 0 && (
                <text x={toX(i)} y={toY(d.avg_rating) - 8}
                  fill="#818cf8" fontSize="8.5" textAnchor="middle" fontWeight="700">
                  {d.avg_rating}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Review count below chart */}
      <div className="df-trend-count-row">
        {trend.map((d, i) => (
          <div key={i} className="df-trend-count-item">
            <span className="df-trend-count-dot" />
            <span>{d.review_count} rev</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceTrendChart;
