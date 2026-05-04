import React, { useState } from 'react';
import {
  AlertTriangle, AlertCircle, ShieldAlert, UserX,
  TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp,
  CheckCircle2, Clock, Activity, Lock
} from 'lucide-react';

/* ─── Colour palette per category ─────────────────────────────────── */
const PALETTE = {
  amber:   { accent: '#f59e0b', light: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.22)', text: '#92400e' },
  rose:    { accent: '#f43f5e', light: 'rgba(244, 63,94,0.10)', border: 'rgba(244, 63,94,0.22)', text: '#9f1239' },
  blue:    { accent: '#3b82f6', light: 'rgba(59,130,246,0.10)', border: 'rgba(59,130,246,0.22)', text: '#1e3a8a' },
  fuchsia: { accent: '#a855f7', light: 'rgba(168,85,247,0.10)', border: 'rgba(168,85,247,0.22)', text: '#581c87' },
};

/* ─── Mini progress bar ────────────────────────────────────────────── */
const ProgressBar = ({ value, max, color }) => {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ height: 4, borderRadius: 99, background: 'rgba(0,0,0,0.07)', overflow: 'hidden', marginTop: 6 }}>
      <div style={{
        height: '100%', borderRadius: 99,
        width: `${pct}%`,
        background: color,
        transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
      }} />
    </div>
  );
};

/* ─── Severity badge ───────────────────────────────────────────────── */
const SeverityBadge = ({ count, label, color }) => {
  if (!count && count !== 0) return null;
  const isAlert = count > 0;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      background: isAlert ? `rgba(${color},0.12)` : 'rgba(16,185,129,0.10)',
      border: `1px solid ${isAlert ? `rgba(${color},0.28)` : 'rgba(16,185,129,0.25)'}`,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.02em',
      color: isAlert ? `rgb(${color})` : '#059669',
    }}>
      {isAlert
        ? <AlertCircle size={11} strokeWidth={2.5} />
        : <CheckCircle2 size={11} strokeWidth={2.5} />}
      {isAlert ? `${count} ${label}` : 'All Clear'}
    </div>
  );
};

/* ─── Individual governance card ───────────────────────────────────── */
const GovCard = ({ card, maxTotal }) => {
  const [expanded, setExpanded] = useState(false);
  const p = PALETTE[card.color] || PALETTE.blue;
  const Icon = card.icon;
  const hasAlert = (card.unresolved ?? 0) > 0;
  const hasDetails = card.details && card.details.length > 0;

  return (
    <div style={{
      background: '#fff',
      border: `1.5px solid ${hasAlert ? p.border : 'rgba(0,0,0,0.07)'}`,
      borderRadius: 16,
      padding: '20px 22px',
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      boxShadow: hasAlert
        ? `0 4px 24px ${p.light}, 0 1px 4px rgba(0,0,0,0.06)`
        : '0 1px 4px rgba(0,0,0,0.05)',
      transition: 'box-shadow 0.2s, border-color 0.2s',
      cursor: hasDetails ? 'pointer' : 'default',
      userSelect: 'none',
    }}
      onClick={() => hasDetails && setExpanded(e => !e)}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: p.light,
            border: `1px solid ${p.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon size={17} color={p.accent} strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>{card.title}</div>
            {card.subtitle && (
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{card.subtitle}</div>
            )}
          </div>
        </div>
        {hasDetails && (
          <div style={{ color: '#94a3b8', marginTop: 2 }}>
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </div>
        )}
      </div>

      {/* Metric */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em', lineHeight: 1 }}>
            {card.total ?? '—'}
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 3 }}>
            Total Logs
          </div>
        </div>
        <SeverityBadge
          count={card.unresolved}
          label={card.subLabel || 'Unresolved'}
          color={card.alertRgb || '239,68,68'}
        />
      </div>

      {/* Progress bar */}
      <ProgressBar value={card.total ?? 0} max={maxTotal} color={p.accent} />

      {/* Expandable details */}
      {expanded && hasDetails && (
        <div style={{
          marginTop: 14,
          borderTop: '1px solid rgba(0,0,0,0.06)',
          paddingTop: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          {card.details.map((d, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: d.alert ? '#f43f5e' : '#94a3b8' }} />
                <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>{d.label}</span>
              </div>
              <span style={{
                fontSize: 12, fontWeight: 700,
                color: d.alert ? '#f43f5e' : '#64748b',
                background: d.alert ? 'rgba(244,63,94,0.08)' : 'rgba(0,0,0,0.04)',
                padding: '1px 8px', borderRadius: 20,
              }}>{d.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Main component ───────────────────────────────────────────────── */
const GovernancePanel = ({ data }) => {
  if (!data) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
      <Activity size={24} style={{ marginBottom: 8, opacity: 0.4 }} />
      <div>Loading Governance Data...</div>
    </div>
  );

  const totalEsc  = data.escalations?.total ?? 0;
  const totalSec  = data.security?.events_logged ?? 0;
  const totalFlags = data.patient_flags?.total ?? 0;
  const totalDr   = data.doctor_status_changes ?? 0;
  const maxTotal  = Math.max(totalEsc, totalSec, totalFlags, totalDr, 1);

  const cards = [
    {
      title: 'Review Escalations',
      subtitle: 'Patient-reported complaints',
      total: totalEsc,
      unresolved: data.escalations?.unresolved,
      icon: AlertTriangle,
      color: 'amber',
      alertRgb: '245,158,11',
      subLabel: 'Open',
      details: [
        { label: 'Total Escalations', value: totalEsc },
        { label: 'Unresolved', value: data.escalations?.unresolved ?? 0, alert: (data.escalations?.unresolved ?? 0) > 0 },
        { label: 'Resolved', value: Math.max(0, totalEsc - (data.escalations?.unresolved ?? 0)) },
      ],
    },
    {
      title: 'Patient Flags',
      subtitle: 'Compliance & conduct alerts',
      total: totalFlags,
      unresolved: data.patient_flags?.unresolved,
      icon: AlertCircle,
      color: 'rose',
      alertRgb: '244,63,94',
      subLabel: 'Pending',
      details: [
        { label: 'Total Flags', value: totalFlags },
        { label: 'Unresolved', value: data.patient_flags?.unresolved ?? 0, alert: (data.patient_flags?.unresolved ?? 0) > 0 },
      ],
    },
    {
      title: 'Security Events',
      subtitle: 'Authentication & access logs',
      total: totalSec,
      unresolved: data.security?.failed_authentications,
      icon: ShieldAlert,
      color: 'blue',
      alertRgb: '59,130,246',
      subLabel: 'Failed Logins',
      details: [
        { label: 'Total Events', value: totalSec },
        { label: 'Failed Logins', value: data.security?.failed_authentications ?? 0, alert: (data.security?.failed_authentications ?? 0) > 0 },
        { label: 'Suspicious Activity', value: data.security?.suspicious ?? 0, alert: (data.security?.suspicious ?? 0) > 0 },
      ],
    },
    {
      title: 'Doctor Status Changes',
      subtitle: 'Suspensions & governance actions',
      total: totalDr,
      unresolved: 0,
      icon: UserX,
      color: 'fuchsia',
      alertRgb: '168,85,247',
      subLabel: 'Suspensions',
      details: [
        { label: 'Total Status Changes', value: totalDr },
        { label: 'Suspensions', value: data.doctor_suspensions ?? 0, alert: (data.doctor_suspensions ?? 0) > 0 },
        { label: 'Reactivations', value: data.doctor_reactivations ?? 0 },
      ],
    },
  ];

  const totalIssues = cards.reduce((s, c) => s + (c.unresolved ?? 0), 0);

  return (
    <div>
      {/* Summary bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
          Click any card to see breakdown
        </div>
        {totalIssues > 0 ? (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 20,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            fontSize: 11, fontWeight: 700, color: '#dc2626',
          }}>
            <AlertCircle size={12} />
            {totalIssues} open issue{totalIssues !== 1 ? 's' : ''} require attention
          </div>
        ) : (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 20,
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
            fontSize: 11, fontWeight: 700, color: '#059669',
          }}>
            <CheckCircle2 size={12} />
            All systems clear
          </div>
        )}
      </div>

      {/* Cards grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 14,
      }}>
        {cards.map((card, i) => (
          <GovCard key={i} card={card} maxTotal={maxTotal} />
        ))}
      </div>
    </div>
  );
};

export default GovernancePanel;
