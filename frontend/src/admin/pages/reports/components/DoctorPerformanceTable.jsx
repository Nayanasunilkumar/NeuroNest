import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, UserCheck, ChevronUp, ChevronDown } from 'lucide-react';

const DoctorPerformanceTable = ({ doctors }) => {
  const [sortKey, setSortKey]   = useState('total_appointments');
  const [sortDir, setSortDir]   = useState('desc');

  if (!doctors?.length) {
    return (
      <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
        <UserCheck size={32} style={{ opacity: 0.2, marginBottom: 12 }} />
        <p style={{ fontSize: 13 }}>No doctor performance data available.</p>
      </div>
    );
  }

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const sorted = [...doctors].sort((a, b) => {
    const av = a[sortKey] ?? 0;
    const bv = b[sortKey] ?? 0;
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  const getRateBadge = (rate) => {
    if (rate >= 80) return { bg: 'rgba(16,185,129,0.1)', color: '#059669', Icon: ArrowUpRight };
    if (rate >= 50) return { bg: 'rgba(245,158,11,0.1)',  color: '#d97706', Icon: Minus };
    return             { bg: 'rgba(239,68,68,0.1)',   color: '#dc2626', Icon: ArrowDownRight };
  };

  // Column definitions — drives both th and td alignment
  const cols = [
    { key: 'doctor_name',         label: 'Doctor',          align: 'left',   width: '26%', sortable: false },
    { key: 'total_appointments',  label: 'Total Appts',     align: 'center', width: '15%', sortable: true  },
    { key: 'completed',           label: 'Completed',       align: 'center', width: '15%', sortable: true  },
    { key: 'cancelled',           label: 'Cancelled',       align: 'center', width: '14%', sortable: true  },
    { key: 'pending',             label: 'Pending',         align: 'center', width: '15%', sortable: true  },
    { key: 'completion_rate_pct', label: 'Completion Rate', align: 'center', width: '15%', sortable: true  },
  ];

  return (
    <div style={{ overflowX: 'auto', borderRadius: 12 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', tableLayout: 'fixed' }}>
        <colgroup>
          {cols.map(c => <col key={c.key} style={{ width: c.width }} />)}
        </colgroup>

        <thead>
          <tr style={{ background: 'var(--ar-surface-2, #f8fafc)' }}>
            {cols.map(col => (
              <th
                key={col.key}
                onClick={() => col.sortable && toggleSort(col.key)}
                style={{
                  padding: '0.875rem 1rem',
                  textAlign: col.align,
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  color: sortKey === col.key ? '#6366f1' : 'var(--ar-muted, #64748b)',
                  borderBottom: '2px solid var(--ar-border, #e2e8f0)',
                  cursor: col.sortable ? 'pointer' : 'default',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                  background: 'transparent',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: col.align === 'left' ? 'flex-start' : 'center', width: '100%' }}>
                  {col.label}
                  {col.sortable && (
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      <ChevronUp   size={9} style={{ opacity: sortKey === col.key && sortDir === 'asc'  ? 1 : 0.25 }} />
                      <ChevronDown size={9} style={{ opacity: sortKey === col.key && sortDir === 'desc' ? 1 : 0.25 }} />
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {sorted.map((doc, idx) => {
            const badge = getRateBadge(doc.completion_rate_pct ?? 0);
            const BadgeIcon = badge.Icon;
            const pending = doc.pending ?? Math.max(0, (doc.total_appointments || 0) - (doc.completed || 0) - (doc.cancelled || 0));
            return (
              <tr
                key={doc.doctor_id ?? idx}
                style={{ borderBottom: '1px solid var(--ar-border, #e2e8f0)', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--ar-bg, #f8fafc)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Doctor name */}
                <td style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--ar-text, #0f172a)' }}>
                  <div style={{ fontSize: '0.875rem' }}>{doc.doctor_name || doc.name || '—'}</div>
                  {doc.avg_rating > 0 && (
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>
                      {'★'.repeat(Math.round(doc.avg_rating))}{'☆'.repeat(5 - Math.round(doc.avg_rating))} {doc.avg_rating?.toFixed(1)}
                    </div>
                  )}
                </td>

                {/* Total */}
                <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>
                  {doc.total_appointments ?? 0}
                </td>

                {/* Completed */}
                <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: '#059669' }}>
                  {doc.completed ?? 0}
                </td>

                {/* Cancelled */}
                <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: '#dc2626' }}>
                  {doc.cancelled ?? 0}
                </td>

                {/* Pending */}
                <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: '#d97706' }}>
                  {pending}
                </td>

                {/* Completion rate badge */}
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '3px 10px', borderRadius: 99,
                    background: badge.bg, color: badge.color,
                    fontWeight: 700, fontSize: '0.75rem',
                  }}>
                    <BadgeIcon size={12} strokeWidth={2.5} />
                    {(doc.completion_rate_pct ?? 0).toFixed(1)}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DoctorPerformanceTable;
