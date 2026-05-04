/**
 * NeuroNest Enterprise PDF Report Generator
 * Produces a structured document - NOT a UI screenshot.
 * Uses jsPDF + jsPDF-AutoTable for professional output.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// -- Colour palette ------------------------------------------------------------
const C = {
  primary:    [41,  82, 163],   // deep blue
  accent:     [16, 185, 129],   // emerald
  danger:     [239, 68,  68],   // red
  warning:    [245,158,  11],   // amber
  dark:       [15,  23,  42],   // slate-900
  muted:      [100,116,139],    // slate-500
  border:     [226,232,240],    // slate-200
  white:      [255,255,255],
  lightBg:    [248,250,252],    // slate-50
};

// -- Helpers -------------------------------------------------------------------
const fmt = {
  date:    (d) => new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }),
  pct:     (n) => `${Number(n).toFixed(1)}%`,
  rating:  (n) => n ? `${Number(n).toFixed(1)} / 5.0` : 'N/A',
  num:     (n) => Number(n || 0).toLocaleString(),
};

/** Draw a coloured section header bar */
function sectionHeader(doc, y, title, subtitle = '') {
  doc.setFillColor(...C.primary);
  doc.rect(14, y, 182, 8, 'F');
  doc.setTextColor(...C.white);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), 18, y + 5.5);
  if (subtitle) {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, 170, y + 5.5, { align: 'right' });
  }
  doc.setTextColor(...C.dark);
  return y + 12;
}

/** Draw a small KPI card (inline boxes) */
function kpiRow(doc, y, items) {
  const w = 182 / items.length;
  items.forEach((item, i) => {
    const x = 14 + i * w;
    doc.setFillColor(...C.lightBg);
    doc.setDrawColor(...C.border);
    doc.roundedRect(x, y, w - 2, 18, 2, 2, 'FD');
    doc.setTextColor(...C.muted);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label.toUpperCase(), x + (w-2)/2, y + 5, { align: 'center' });
    doc.setTextColor(...(item.color || C.primary));
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(String(item.value ?? '-'), x + (w-2)/2, y + 13, { align: 'center' });
  });
  return y + 22;
}

/** Insight bullet */
function insight(doc, y, text, color = C.accent) {
  doc.setFillColor(...color);
  doc.circle(16, y + 1.5, 1.2, 'F');
  doc.setTextColor(...C.dark);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(text, 174);
  doc.text(lines, 20, y + 2);
  return y + lines.length * 4.5 + 2;
}

/** Ensure we have room; add page if not */
function ensureSpace(doc, y, needed = 30) {
  if (y + needed > 275) {
    doc.addPage();
    return 18;
  }
  return y;
}

// -- MAIN GENERATOR ------------------------------------------------------------
export async function generateEnterpriseReport({ overview, appointments, doctors, governance, days }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const now  = new Date();
  const pageW = doc.internal.pageSize.width;

  // -- COVER PAGE --------------------------------------------------------------
  doc.setFillColor(...C.primary);
  doc.rect(0, 0, pageW, 80, 'F');

  // Logo area
  doc.setFillColor(...C.white);
  doc.circle(pageW/2, 35, 18, 'F');
  doc.setTextColor(...C.primary);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('NN', pageW/2, 38, { align: 'center' });

  doc.setTextColor(...C.white);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('NeuroNest', pageW/2, 60, { align: 'center' });
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Enterprise Analytics & Governance Report', pageW/2, 68, { align: 'center' });

  // Report metadata
  doc.setTextColor(...C.dark);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Report Details', 14, 96);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.muted);
  const meta = [
    ['Generated',      fmt.date(now) + ' ' + now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })],
    ['Analysis Period', `Last ${days} day${days !== 1 ? 's' : ''}`],
    ['Report Type',    'Enterprise Executive Summary'],
    ['Classification', 'Confidential - Internal Use Only'],
    ['System',         'NeuroNest Hospital Management System'],
  ];
  let my = 102;
  meta.forEach(([k, v]) => {
    doc.setTextColor(...C.muted);  doc.text(k + ':', 14, my);
    doc.setTextColor(...C.dark);   doc.text(v, 60, my);
    my += 6;
  });

  // Horizontal rule
  doc.setDrawColor(...C.border);
  doc.line(14, my + 2, 196, my + 2);

  // Executive snapshot on cover
  my += 8;
  doc.setTextColor(...C.dark);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Snapshot', 14, my);
  my += 6;

  const appts = overview?.appointments || {};
  my = kpiRow(doc, my, [
    { label: 'Total Patients',      value: fmt.num(overview?.users?.total_patients), color: C.primary },
    { label: 'Total Doctors',       value: fmt.num(overview?.users?.total_doctors),  color: C.accent  },
    { label: 'Total Appointments',  value: fmt.num(appts.total),                     color: C.primary },
    { label: 'Avg Rating',          value: fmt.rating(overview?.reviews?.average_rating), color: C.accent },
  ]);
  my += 4;
  my = kpiRow(doc, my, [
    { label: 'Completed',  value: fmt.num(appts.completed),  color: C.accent   },
    { label: 'Pending',    value: fmt.num(appts.pending),    color: C.warning  },
    { label: 'Cancelled',  value: fmt.num(appts.cancelled),  color: C.danger   },
    { label: 'Reviews',    value: fmt.num(overview?.reviews?.total), color: C.primary },
  ]);

  // Footer on cover
  doc.setTextColor(...C.muted);
  doc.setFontSize(7);
  doc.text('This report is auto-generated by NeuroNest. Contains confidential clinical and operational data.', pageW/2, 285, { align: 'center' });

  // -- PAGE 2: APPOINTMENT ANALYTICS ------------------------------------------
  doc.addPage();
  let y = 18;

  y = sectionHeader(doc, y, '1. Appointment Analytics', `Period: Last ${days} days`);

  // Completion rate summary
  const total    = appts.total || 1;
  const compPct  = ((appts.completed || 0) / total * 100).toFixed(1);
  const cancPct  = ((appts.cancelled || 0) / total * 100).toFixed(1);
  const pendPct  = ((appts.pending   || 0) / total * 100).toFixed(1);

  y = kpiRow(doc, y, [
    { label: 'Completion Rate',    value: compPct + '%', color: C.accent  },
    { label: 'Cancellation Rate',  value: cancPct + '%', color: C.danger  },
    { label: 'Pending Rate',       value: pendPct + '%', color: C.warning },
    { label: "Today's Sessions",   value: fmt.num(appts.today), color: C.primary },
  ]);

  // Daily trend table
  if (appointments?.length) {
    y = ensureSpace(doc, y, 50);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.dark);
    doc.text('Daily Appointment Trend', 14, y);
    y += 3;

    autoTable(doc, {
      startY: y,
      head: [['Date', 'Total', 'Completed', 'Cancelled', 'Pending', 'Completion %']],
      body: appointments.map(d => [
        d.date,
        d.total ?? d.count ?? 0,
        d.completed ?? '-',
        d.cancelled ?? '-',
        d.pending   ?? '-',
        d.total > 0 ? fmt.pct((d.completed / d.total) * 100) : '-',
      ]),
      styles:      { fontSize: 7.5, cellPadding: 2.5, textColor: C.dark },
      headStyles:  { fillColor: C.primary, textColor: C.white, fontStyle: 'bold', fontSize: 7.5 },
      alternateRowStyles: { fillColor: C.lightBg },
      columnStyles: {
        0: { fontStyle: 'bold' },
        5: { textColor: C.accent, fontStyle: 'bold' },
      },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 6;
  }

  // Insights
  y = ensureSpace(doc, y, 35);
  doc.setFontSize(8.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...C.dark);
  doc.text('Key Insights', 14, y); y += 5;

  const compRate = parseFloat(compPct);
  if (compRate >= 80)  y = insight(doc, y, `Strong completion rate of ${compPct}% - operational efficiency is above benchmark.`, C.accent);
  else if (compRate >= 60) y = insight(doc, y, `Moderate completion rate of ${compPct}% - review scheduling workflows to reduce gaps.`, C.warning);
  else y = insight(doc, y, `Low completion rate of ${compPct}% - immediate operational review recommended.`, C.danger);

  if (parseFloat(cancPct) > 15) y = insight(doc, y, `Cancellation rate of ${cancPct}% exceeds 15% threshold - investigate patient no-show patterns.`, C.danger);
  else y = insight(doc, y, `Cancellation rate of ${cancPct}% is within acceptable range.`, C.accent);

  // -- PAGE 3: DOCTOR PERFORMANCE ---------------------------------------------
  doc.addPage();
  y = 18;
  y = sectionHeader(doc, y, '2. Doctor Performance Matrix', `${doctors?.length || 0} specialists evaluated`);

  if (doctors?.length) {
    // Top performers
    const sorted   = [...doctors].sort((a, b) => (b.completed || 0) - (a.completed || 0));
    const topDoc   = sorted[0];
    const bestRated = [...doctors].sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0))[0];

    y = kpiRow(doc, y, [
      { label: 'Total Specialists',  value: doctors.length,                        color: C.primary },
      { label: 'Top by Volume',      value: (topDoc?.name || topDoc?.doctor_name || '-').split(' ').slice(-1)[0], color: C.accent },
      { label: 'Best Rated',         value: (bestRated?.name || bestRated?.doctor_name || '-').split(' ').slice(-1)[0], color: C.accent },
      { label: 'Avg Rating Overall', value: fmt.rating(overview?.reviews?.average_rating), color: C.primary },
    ]);

    doc.setFontSize(8.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...C.dark);
    doc.text('Full Performance Breakdown', 14, y); y += 3;

    autoTable(doc, {
      startY: y,
      head: [['#', 'Specialist', 'Total Appts', 'Completed', 'Cancelled', 'Pending', 'Completion %', 'Avg Rating']],
      body: sorted.map((d, i) => [
        i + 1,
        d.name || d.doctor_name || '-',
        fmt.num(d.total_appointments),
        fmt.num(d.completed),
        fmt.num(d.cancelled),
        fmt.num(d.pending ?? (d.total_appointments - d.completed - d.cancelled)),
        fmt.pct(d.completion_rate_pct),
        fmt.rating(d.avg_rating),
      ]),
      styles:      { fontSize: 7, cellPadding: 2.2, textColor: C.dark },
      headStyles:  { fillColor: C.primary, textColor: C.white, fontStyle: 'bold', fontSize: 7 },
      alternateRowStyles: { fillColor: C.lightBg },
      columnStyles: {
        1: { fontStyle: 'bold' },
        6: { textColor: C.accent },
        7: { textColor: C.primary },
      },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 6;

    // Performance insights
    y = ensureSpace(doc, y, 30);
    doc.setFontSize(8.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...C.dark);
    doc.text('Performance Insights', 14, y); y += 5;
    y = insight(doc, y, `${topDoc?.name || topDoc?.doctor_name} leads in appointment volume with ${fmt.num(topDoc?.completed)} completed sessions.`, C.accent);
    if (bestRated?.avg_rating > 0)
      y = insight(doc, y, `Highest patient satisfaction: ${bestRated?.name || bestRated?.doctor_name} (${fmt.rating(bestRated?.avg_rating)}).`, C.accent);

    const underperformers = doctors.filter(d => d.completion_rate_pct < 60);
    if (underperformers.length)
      y = insight(doc, y, `${underperformers.length} specialist(s) have completion rates below 60% - review workload allocation.`, C.danger);
  }

  // -- PAGE 4: FEEDBACK & REVIEW ANALYSIS ------------------------------------
  doc.addPage();
  y = 18;
  y = sectionHeader(doc, y, '3. Patient Feedback & Review Analysis');

  const rev = overview?.reviews || {};
  y = kpiRow(doc, y, [
    { label: 'Total Reviews',   value: fmt.num(rev.total),           color: C.primary },
    { label: 'Average Rating',  value: fmt.rating(rev.average_rating), color: C.accent },
    { label: 'Satisfaction',    value: rev.average_rating >= 4 ? 'High' : rev.average_rating >= 3 ? 'Moderate' : 'Low',
                                color: rev.average_rating >= 4 ? C.accent : C.warning },
    { label: 'Benchmark',       value: '4.0 / 5.0',                 color: C.muted   },
  ]);

  // Rating distribution (visual bar)
  y = ensureSpace(doc, y, 40);
  doc.setFontSize(8.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...C.dark);
  doc.text('Rating Scale Interpretation', 14, y); y += 5;

  const ratingBands = [
    { label: '5 Star   Excellent     5.0',       from: 4.5 },
    { label: '4 Star   Good          4.0 - 4.4', from: 4.0 },
    { label: '3 Star   Average       3.0 - 3.9', from: 3.0 },
    { label: '2 Star   Poor          2.0 - 2.9', from: 2.0 },
    { label: '1 Star   Critical      Below 2.0', from: 0   },
  ];

  autoTable(doc, {
    startY: y,
    body: ratingBands.map(b => [
      b.label,
      Number(rev.average_rating) >= b.from ? 'o Current system is at or above this level' : '',
    ]),
    styles:     { fontSize: 7.5, cellPadding: 2.5 },
    columnStyles: { 0: { fontStyle: 'bold' }, 1: { textColor: C.accent } },
    theme: 'plain',
    margin: { left: 14, right: 14 },
  });
  y = doc.lastAutoTable.finalY + 6;

  // Feedback insights
  y = ensureSpace(doc, y, 30);
  doc.setFontSize(8.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...C.dark);
  doc.text('Analysis & Recommendations', 14, y); y += 5;

  const avgR = parseFloat(rev.average_rating || 0);
  if (avgR >= 4.5)      y = insight(doc, y, `Outstanding patient satisfaction (${fmt.rating(avgR)}) - consistently exceeds expectations.`, C.accent);
  else if (avgR >= 4.0) y = insight(doc, y, `Good satisfaction level (${fmt.rating(avgR)}) - above industry benchmark of 4.0.`, C.accent);
  else if (avgR >= 3.0) y = insight(doc, y, `Moderate satisfaction (${fmt.rating(avgR)}) - targeted service improvements recommended.`, C.warning);
  else                   y = insight(doc, y, `Low satisfaction (${fmt.rating(avgR)}) - immediate quality audit required.`, C.danger);

  if (rev.total < 10)   y = insight(doc, y, 'Low review volume - consider implementing post-appointment feedback prompts.', C.warning);

  // -- PAGE 5: GOVERNANCE & COMPLIANCE ---------------------------------------
  doc.addPage();
  y = 18;
  y = sectionHeader(doc, y, '4. Governance & Compliance Report', `Period: Last ${days} days`);

  const esc   = governance?.escalations   || {};
  const flags = governance?.patient_flags || {};
  const sec   = governance?.security      || {};
  const drChg = governance?.doctor_status_changes || 0;

  y = kpiRow(doc, y, [
    { label: 'Review Escalations', value: fmt.num(esc.total),          color: esc.unresolved > 0   ? C.danger  : C.accent },
    { label: 'Patient Flags',      value: fmt.num(flags.total),         color: flags.unresolved > 0 ? C.warning : C.accent },
    { label: 'Security Events',    value: fmt.num(sec.events_logged),   color: sec.failed_authentications > 0 ? C.danger : C.accent },
    { label: 'Doctor Status Chg.', value: fmt.num(drChg),               color: drChg > 0 ? C.warning : C.accent },
  ]);

  doc.setFontSize(8.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...C.dark);
  doc.text('Governance Event Summary', 14, y); y += 3;

  autoTable(doc, {
    startY: y,
    head: [['Category', 'Total Events', 'Open / Unresolved', 'Risk Level']],
    body: [
      ['Review Escalations',   fmt.num(esc.total),         fmt.num(esc.unresolved),                 esc.unresolved > 5 ? 'HIGH' : esc.unresolved > 0 ? 'MEDIUM' : 'CLEAR'],
      ['Patient Flags',        fmt.num(flags.total),        fmt.num(flags.unresolved),               flags.unresolved > 3 ? 'HIGH' : flags.unresolved > 0 ? 'MEDIUM' : 'CLEAR'],
      ['Failed Authentications', '-',                       fmt.num(sec.failed_authentications),     sec.failed_authentications > 10 ? 'HIGH' : sec.failed_authentications > 0 ? 'MEDIUM' : 'CLEAR'],
      ['Security Events Total', fmt.num(sec.events_logged), '-',                                     'MONITOR'],
      ['Doctor Status Changes', fmt.num(drChg),             '-',                                     drChg > 5 ? 'REVIEW' : 'NORMAL'],
    ],
    styles:     { fontSize: 7.5, cellPadding: 2.5, textColor: C.dark },
    headStyles: { fillColor: C.primary, textColor: C.white, fontStyle: 'bold', fontSize: 7.5 },
    alternateRowStyles: { fillColor: C.lightBg },
    columnStyles: {
      0: { fontStyle: 'bold' },
      3: {
        fontStyle: 'bold',
        textColor: (cell) => {
          if (cell.raw === 'HIGH')   return C.danger;
          if (cell.raw === 'MEDIUM') return C.warning;
          return C.accent;
        },
      },
    },
    margin: { left: 14, right: 14 },
  });
  y = doc.lastAutoTable.finalY + 6;

  // Compliance insights
  y = ensureSpace(doc, y, 40);
  doc.setFontSize(8.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...C.dark);
  doc.text('Compliance Assessment', 14, y); y += 5;

  const totalIssues = (esc.unresolved || 0) + (flags.unresolved || 0) + (sec.failed_authentications || 0);
  if (totalIssues === 0) {
    y = insight(doc, y, 'All governance indicators are clear - no unresolved compliance issues detected.', C.accent);
  } else {
    y = insight(doc, y, `${totalIssues} open governance issue(s) require attention before next audit cycle.`, C.danger);
  }
  if (esc.unresolved > 0) y = insight(doc, y, `${esc.unresolved} unresolved review escalation(s) - assign clinical officers for review.`, C.danger);
  if (sec.failed_authentications > 0) y = insight(doc, y, `${sec.failed_authentications} failed authentication attempt(s) logged - verify account security.`, C.warning);
  if (drChg > 0) y = insight(doc, y, `${drChg} doctor status change(s) recorded - confirm all transitions follow institutional protocol.`, C.warning);

  // -- PAGE N: SIGNATURE & FOOTER ---------------------------------------------
  doc.addPage();
  y = 18;
  y = sectionHeader(doc, y, '5. Report Certification & Disclaimer');

  y += 5;
  doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...C.dark);
  const disclaimer = [
    'This report has been automatically generated by the NeuroNest Hospital Management System.',
    `It reflects data collected for the period ending ${fmt.date(now)}.`,
    '',
    'All figures are derived from live system records. This document is intended for',
    'authorized administrative personnel only. Redistribution outside the institution',
    'without approval is strictly prohibited.',
    '',
    'Data accuracy is subject to system record completeness. For audit-grade reporting,',
    'please cross-reference with primary database records.',
  ];
  disclaimer.forEach(line => {
    doc.text(line, 14, y);
    y += 5;
  });

  // Signature blocks
  y += 10;
  doc.setDrawColor(...C.border);
  [[55, 'System Administrator'], [120, 'Clinical Officer'], [180, 'Compliance Officer']].forEach(([xEnd, role]) => {
    doc.line(xEnd - 45, y, xEnd, y);
    doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(...C.muted);
    doc.text(role, xEnd - 22.5, y + 5, { align: 'center' });
  });

  // -- PAGE NUMBERS on every page ---------------------------------------------
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(...C.primary);
    doc.rect(0, 287, pageW, 10, 'F');
    doc.setTextColor(...C.white);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('NeuroNest Enterprise Report - CONFIDENTIAL', 14, 293);
    doc.text(`Page ${p} of ${totalPages}`, pageW - 14, 293, { align: 'right' });
    doc.text(fmt.date(now), pageW / 2, 293, { align: 'center' });
  }

  return doc;
}

/** Trigger download */
export function downloadReport(doc, days) {
  const slug = new Date().toISOString().slice(0, 10);
  doc.save(`neuronest_enterprise_report_${days}d_${slug}.pdf`);
}
