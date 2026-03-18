import io
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.units import inch
from datetime import datetime, timezone

try:
    from zoneinfo import ZoneInfo
except ImportError:  # Python older than 3.9
    from backports.zoneinfo import ZoneInfo  # type: ignore

def generate_patient_report(data):
    """
    data schema (same as export_data JSON):
    {
      "account": { ... },
      "profile": { ... },
      "emergency_contact": { ... },
      "appointments": [ ... ],
      "prescriptions": [ ... ]
    }
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=50, leftMargin=50, topMargin=50, bottomMargin=50)
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        'MainTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor("#4f46e5"),
        spaceAfter=20,
        alignment=1 # Center
    )
    
    section_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor("#1e293b"),
        spaceBefore=15,
        spaceAfter=10,
        borderPadding=5,
        # borderLeftColor=colors.HexColor("#4f46e5"),
        # borderLeftWidth=2
    )
    
    normal_style = styles['Normal']
    label_style = ParagraphStyle('Label', parent=styles['Normal'], fontWeight='bold', textColor=colors.HexColor("#64748b"))

    elements = []

    # Header
    elements.append(Paragraph("NeuroNest Clinical Report", title_style))
    elements.append(Paragraph(f"Generated on {datetime.now().strftime('%B %d, %Y at %H:%M')}", styles['Italic']))
    elements.append(Spacer(1, 0.3 * inch))

    # 1. Patient Identity
    elements.append(Paragraph("Patient Identity", section_style))
    acc = data.get("account", {})
    prof = data.get("profile", {})
    
    identity_data = [
        ["Full Name:", acc.get("full_name", "N/A"), "Email:", acc.get("email", "N/A")],
        ["Date of Birth:", prof.get("date_of_birth", "N/A"), "Gender:", prof.get("gender", "N/A")],
        ["Phone:", prof.get("phone", "N/A"), "Blood Group:", prof.get("blood_group", "N/A")],
        ["Address:", prof.get("address", "N/A"), "", ""]
    ]
    
    id_table = Table(identity_data, colWidths=[1.2*inch, 1.8*inch, 1.2*inch, 1.8*inch])
    id_table.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('TEXTCOLOR', (0,0), (0,-1), colors.HexColor("#64748b")),
        ('TEXTCOLOR', (2,0), (2,-1), colors.HexColor("#64748b")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    elements.append(id_table)
    elements.append(Spacer(1, 0.2 * inch))

    # 2. Emergency Contact
    ec = data.get("emergency_contact", {})
    if ec:
        elements.append(Paragraph("Emergency Contact", section_style))
        ec_data = [
            ["Name:", ec.get("contact_name", "N/A")],
            ["Relation:", ec.get("relationship", "N/A")],
            ["Phone:", ec.get("phone", "N/A")],
        ]
        ec_table = Table(ec_data, colWidths=[1.2*inch, 4.8*inch])
        ec_table.setStyle(TableStyle([
            ('FONTSIZE', (0,0), (-1,-1), 10),
            ('TEXTCOLOR', (0,0), (0,-1), colors.HexColor("#64748b")),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ]))
        elements.append(ec_table)

    # 3. Appointments
    appts = data.get("appointments", [])
    if appts:
        elements.append(Paragraph(f"Recent Appointments ({len(appts)})", section_style))
        header = ["Date", "Time", "Doctor", "Status", "Reason"]
        rows = [header]
        for a in appts[:10]: # Limit to last 10
            rows.append([
                str(a.get("appointment_date") or ""),
                str(a.get("appointment_time") or ""),
                a.get("doctor_name") or "N/A",
                Paragraph((a.get("status") or "N/A").capitalize().replace('_', ' '), styles['Normal']),
                Paragraph((a.get("reason") or "")[:50], styles['Normal'])
            ])
        
        t = Table(rows, colWidths=[0.9*inch, 0.7*inch, 1.3*inch, 1.1*inch, 2.5*inch])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f8fafc")),
            ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor("#475569")),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 9),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ('TOPPADDING', (0,0), (-1,-1), 10),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ]))
        elements.append(t)

    # 4. Prescriptions
    presc = data.get("prescriptions", [])
    if presc:
        elements.append(Paragraph(f"Recent Prescriptions ({len(presc)})", section_style))
        for p in presc[:5]:
            diag = p.get('diagnosis') or "No diagnosis recorded"
            date_str = str(p.get('created_at') or "")[:10]
            meds = p.get('medicines') or []
            rows = [
                [Paragraph(f"<b>Diagnosis:</b> {diag}", styles['Normal']), f"Date: {date_str}"],
                [Paragraph(f"<b>Medicines:</b> {', '.join(meds)}", styles['Normal']), ""]
            ]
            pt = Table(rows, colWidths=[4.5*inch, 1.5*inch])
            pt.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('BOTTOMPADDING', (0,0), (-1,-1), 10),
                ('TOPPADDING', (0,0), (-1,-1), 10),
            ]))
            elements.append(pt)
            elements.append(Spacer(1, 0.1 * inch))

    # Footer Notice
    elements.append(Spacer(1, 0.5 * inch))
    notice = "Confidential: This document contains sensitive medical information. " \
             "Authorized patient use only. (c) 2026 NeuroNest Health Systems."
    elements.append(Paragraph(notice, ParagraphStyle('Footer', parent=styles['Italic'], fontSize=8, textColor=colors.gray, alignment=1)))

    doc.build(elements)
    buffer.seek(0)
    return buffer


def generate_assessment_report(data, tz_name: str = "UTC"):
    """Generate a PDF for vitals assessment.

    Args:
        data: Data mapping for patient/latest/history/summary.
        tz_name: IANA timezone name used to render timestamps in the PDF.
            When passed from the frontend, this will match the user's local timezone.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=50, leftMargin=50, topMargin=50, bottomMargin=50)
    styles = getSampleStyleSheet()

    try:
        tz_info = ZoneInfo(tz_name)
    except Exception:
        tz_info = datetime.now(timezone.utc).astimezone().tzinfo or timezone.utc
    
    # Custom Styles
    title_style = ParagraphStyle(
        'MainTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor("#4f46e5"),
        spaceAfter=20,
        alignment=1 # Center
    )
    
    section_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor("#1e293b"),
        spaceBefore=15,
        spaceAfter=10,
    )
    
    normal_style = styles['Normal']
    label_style = ParagraphStyle('Label', parent=styles['Normal'], fontWeight='bold', textColor=colors.HexColor("#64748b"))

    elements = []
    
    # Header
    elements.append(Paragraph("NeuroNest Vitals Assessment Report", title_style))
    generated_ts = datetime.now(tz_info).strftime('%B %d, %Y at %H:%M')
    elements.append(Paragraph(f"Generated on {generated_ts}", styles['Italic']))
    elements.append(Spacer(1, 0.3 * inch))
    
    # Patient Info
    patient = data.get("patient", {})
    elements.append(Paragraph("Patient Information", section_style))
    patient_data = [
        ["Name:", patient.get("full_name", "N/A")],
        ["Email:", patient.get("email", "N/A")],
    ]
    patient_table = Table(patient_data, colWidths=[1.2*inch, 4.8*inch])
    patient_table.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('TEXTCOLOR', (0,0), (0,-1), colors.HexColor("#64748b")),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(patient_table)
    elements.append(Spacer(1, 0.2 * inch))
    
    def _format_timestamp(ts):
        """Convert UTC ISO timestamp to local time string.

        The vitals stream is sent in UTC (often as a bare ISO string without timezone).
        The frontend treats those as UTC (it appends 'Z' before parsing). We do the
        same here so the PDF shows the same local-time timestamps as the UI.
        """
        if not ts:
            return "N/A"

        try:
            # If we got a datetime already, treat naive datetimes as UTC
            if isinstance(ts, datetime):
                dt = ts
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=datetime.timezone.utc)
            else:
                # Some vitals timestamps are sent as ISO strings WITHOUT timezone info.
                # Treat those as UTC (same behavior as the frontend).
                ts_str = str(ts)
                if not ts_str.endswith("Z") and not any(sign in ts_str[-6:] for sign in ["+", "-"]):
                    ts_str = ts_str + "Z"
                dt = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))

            local_dt = dt.astimezone(tz_info)  # convert to requested timezone
            return local_dt.strftime("%Y-%m-%d %H:%M:%S")
        except Exception:
            return str(ts)

    # Latest Vitals
    latest = data.get("latest", {})
    if latest:
        elements.append(Paragraph("Current Vitals Reading", section_style))
        latest_data = [
            ["Heart Rate (BPM):", f"{latest.get('hr', 'N/A')} BPM"],
            ["SpO2 (%):", f"{latest.get('spo2', 'N/A')}%"],
            ["Temperature (°C):", f"{latest.get('temp', 'N/A')}°C"],
            ["Signal Quality:", latest.get('signal', 'N/A').capitalize()],
            ["Timestamp:", _format_timestamp(latest.get('ts'))],
        ]
        latest_table = Table(latest_data, colWidths=[2*inch, 3*inch])
        latest_table.setStyle(TableStyle([
            ('FONTSIZE', (0,0), (-1,-1), 10),
            ('TEXTCOLOR', (0,0), (0,-1), colors.HexColor("#64748b")),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ]))
        elements.append(latest_table)
        elements.append(Spacer(1, 0.2 * inch))
    
    # Summary
    summary = data.get("summary", {})
    if summary:
        elements.append(Paragraph("Vitals Summary", section_style))
        summary_data = [
            ["Average Heart Rate:", f"{summary.get('hr_avg', 'N/A')} BPM"],
            ["Average SpO2:", f"{summary.get('spo2_avg', 'N/A')}%"],
            ["Average Temperature:", f"{summary.get('temp_avg', 'N/A')}°C"],
        ]
        summary_table = Table(summary_data, colWidths=[2*inch, 3*inch])
        summary_table.setStyle(TableStyle([
            ('FONTSIZE', (0,0), (-1,-1), 10),
            ('TEXTCOLOR', (0,0), (0,-1), colors.HexColor("#64748b")),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ]))
        elements.append(summary_table)
        
        alerts = summary.get("alerts", [])
        if alerts:
            elements.append(Paragraph("Alerts:", label_style))
            for alert in alerts:
                elements.append(Paragraph(f"• {alert}", normal_style))
        elements.append(Spacer(1, 0.2 * inch))
    
    # History Table
    history = data.get("history", [])
    if history:
        elements.append(Paragraph(f"Vitals History (Last {len(history)} Readings)", section_style))
        header = ["Timestamp", "HR (BPM)", "SpO2 (%)", "Temp (°C)", "Signal"]
        rows = [header]
        for h in history[-20:]:  # Last 20 readings
            rows.append([
                _format_timestamp(h.get('ts')),
                str(h.get('hr', 'N/A')),
                str(h.get('spo2', 'N/A')),
                str(h.get('temp', 'N/A')),
                h.get('signal', 'N/A').capitalize()
            ])
        
        t = Table(rows, colWidths=[1.5*inch, 0.8*inch, 0.8*inch, 0.8*inch, 0.8*inch])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f8fafc")),
            ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor("#475569")),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 9),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ]))
        elements.append(t)
    
    # Footer Notice
    elements.append(Spacer(1, 0.5 * inch))
    notice = "Confidential: This document contains sensitive medical information. " \
             "Authorized patient use only. (c) 2026 NeuroNest Health Systems."
    elements.append(Paragraph(notice, ParagraphStyle('Footer', parent=styles['Italic'], fontSize=8, textColor=colors.gray, alignment=1)))
    
    doc.build(elements)
    buffer.seek(0)
    return buffer
