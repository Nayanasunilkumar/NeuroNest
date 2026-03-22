import io
from pathlib import Path
from datetime import datetime, timezone
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.units import inch

try:
    from zoneinfo import ZoneInfo
except ImportError:  # Python older than 3.9
    from backports.zoneinfo import ZoneInfo  # type: ignore

# --- GLOBAL CONSTANTS ---
BASE_DIR = Path(__file__).resolve().parent.parent
ICONS_DIR = BASE_DIR / "static" / "assets" / "icons"
STYLES = getSampleStyleSheet()

# Pre-define custom styles for recycling
STYLES.add(ParagraphStyle(
    'MainTitle',
    parent=STYLES['Heading1'],
    fontSize=24,
    textColor=colors.HexColor("#4f46e5"),
    spaceAfter=20,
    alignment=1 # Center
))

STYLES.add(ParagraphStyle(
    'SectionHeader',
    parent=STYLES['Heading2'],
    fontSize=14,
    textColor=colors.HexColor("#1e293b"),
    spaceBefore=15,
    spaceAfter=10,
    borderPadding=5
))

STYLES.add(ParagraphStyle('Label', parent=STYLES['Normal'], fontWeight='bold', textColor=colors.HexColor("#64748b")))

# Safety styles for vitals
if 'HRRed' not in STYLES:
    STYLES.add(ParagraphStyle('HRRed', parent=STYLES['Normal'], textColor=colors.red))
if 'SpO2Red' not in STYLES:
    STYLES.add(ParagraphStyle('SpO2Red', parent=STYLES['Normal'], textColor=colors.red))
if 'TempRed' not in STYLES:
    STYLES.add(ParagraphStyle('TempRed', parent=STYLES['Normal'], textColor=colors.red))

def get_icon(name):
    """Helper to get image or placeholder."""
    path = ICONS_DIR / f"{name}.png"
    if path.exists():
        try:
            return Image(str(path), width=20, height=20)
        except Exception:
            return "● " # Fallback bullet
    return ""

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
    
    elements = []

    # Header
    elements.append(Paragraph("NeuroNest Clinical Report", STYLES['MainTitle']))
    elements.append(Paragraph(f"Generated on {datetime.now().strftime('%B %d, %Y at %H:%M')}", STYLES.get('Italic', STYLES['Normal'])))
    elements.append(Spacer(1, 0.3 * inch))

    # 1. Patient Identity
    elements.append(Paragraph("Patient Identity", STYLES['SectionHeader']))
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

    # 2. Vitals Section (NEW)
    elements.append(Paragraph("Vitals Monitoring", STYLES['SectionHeader']))
    vitals_data = data.get("vitals", {})
    
    if vitals_data.get("is_active"):
        latest = vitals_data.get("latest", {})
        
        # Determine if abnormal
        hr = latest.get("hr", 0) or 0
        spo2 = latest.get("spo2", 0) or 0
        temp = latest.get("temp", 0) or 0
        
        hr_color = colors.red if (hr > 0 and (hr < 60 or hr > 100)) else colors.black
        spo2_color = colors.red if (spo2 > 0 and spo2 < 95) else colors.black
        temp_color = colors.red if (temp > 0 and (temp < 36.1 or temp > 37.5)) else colors.black
        
        # Latest Readings "Cards"
        v_rows = [
            [
                get_icon("heart_red"), Paragraph(f"<b>Heart Rate:</b> <font color='{hr_color}'>{hr} BPM</font>", STYLES['Normal']),
                get_icon("oxygen_blue"), Paragraph(f"<b>SpO2:</b> <font color='{spo2_color}'>{spo2}%</font>", STYLES['Normal']),
                get_icon("temp_green"), Paragraph(f"<b>Temperature:</b> <font color='{temp_color}'>{temp}°C</font>", STYLES['Normal'])
            ]
        ]
        vt = Table(v_rows, colWidths=[0.3*inch, 1.7*inch, 0.3*inch, 1.7*inch, 0.3*inch, 1.7*inch])
        vt.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
            ('BOTTOMPADDING', (0,0), (-1,-1), 12),
            ('TOPPADDING', (0,0), (-1,-1), 12),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
        ]))
        elements.append(vt)
        elements.append(Spacer(1, 0.1 * inch))
        
        # Recent History Summary
        history = vitals_data.get("history", [])
        if history:
            elements.append(Paragraph("Recent Readings Summary", STYLES['Label']))
            h_header = ["Timestamp", "HR", "SpO2", "Temp"]
            h_rows = [h_header]
            for h in history[-5:]: # Last 5
                ts = str(h.get("ts") or "")[11:19] # HH:MM:SS
                h_rows.append([ts, f"{h.get('hr')} BPM", f"{h.get('spo2')}%", f"{h.get('temp')}°C"])
            
            ht = Table(h_rows, colWidths=[1.5*inch, 1.5*inch, 1.5*inch, 1.5*inch])
            ht.setStyle(TableStyle([
                ('FONTSIZE', (0,0), (-1,-1), 8),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('INNERGRID', (0,0), (-1,-1), 0.25, colors.HexColor("#e2e8f0")),
                ('BOX', (0,0), (-1,-1), 0.25, colors.HexColor("#e2e8f0")),
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
            ]))
            elements.append(ht)
    else:
        elements.append(Paragraph("No vitals data available (No device assigned)", STYLES.get('Italic', STYLES['Normal'])))
    
    elements.append(Spacer(1, 0.2 * inch))

    # 3. Emergency Contact
    ec = data.get("emergency_contact", {})
    if ec:
        elements.append(Paragraph("Emergency Contact", STYLES['SectionHeader']))
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

    # 4. Appointments
    appts = data.get("appointments", [])
    if appts:
        elements.append(Paragraph(f"Recent Appointments ({len(appts)})", STYLES['SectionHeader']))
        header = ["Date", "Time", "Doctor", "Status", "Reason"]
        rows = [header]
        for a in appts[:10]: # Limit to last 10
            rows.append([
                str(a.get("appointment_date") or ""),
                str(a.get("appointment_time") or ""),
                a.get("doctor_name") or "N/A",
                Paragraph((a.get("status") or "N/A").capitalize().replace('_', ' '), STYLES['Normal']),
                Paragraph((a.get("reason") or "")[:50], STYLES['Normal'])
            ])
        
        t = Table(rows, colWidths=[0.9*inch, 0.7*inch, 1.3*inch, 1.1*inch, 2.5*inch])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), ( -1,0), colors.HexColor("#f8fafc")),
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

    # 5. Prescriptions
    presc = data.get("prescriptions", [])
    if presc:
        elements.append(Paragraph(f"Recent Prescriptions ({len(presc)})", STYLES['SectionHeader']))
        for p in presc[:5]:
            diag = p.get('diagnosis') or "No diagnosis recorded"
            date_str = str(p.get('created_at') or "")[:10]
            meds = p.get('medicines') or []
            rows = [
                [Paragraph( f"<b>Diagnosis:</b> {diag}", STYLES['Normal']), f"Date: {date_str}"],
                [Paragraph(f"<b>Medicines:</b> {', '.join(meds)}", STYLES['Normal']), ""]
            ]
            pt = Table(rows, colWidths=[4.5*inch, 1.5*inch])
            pt.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('BOTTOMPADDING', (0,0), (-1,-1), 10),
                ('TOPPADDING', (0,0), (-1,-1), 10),
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#ffffff")), # White background for cards
                ('BOX', (0,0), (-1,-1), 0.25, colors.HexColor("#e2e8f0")), # Card-like box
            ]))
            elements.append(pt)
            elements.append(Spacer(1, 0.1 * inch))

    # Footer Notice
    elements.append(Spacer(1, 0.5 * inch))
    notice = "Confidential: This document contains sensitive medical information. " \
             "Authorized patient use only. (c) 2026 NeuroNest Health Systems."
    elements.append(Paragraph(notice, ParagraphStyle('Footer', parent=STYLES.get('Italic', STYLES['Normal']), fontSize=8, textColor=colors.gray, alignment=1)))

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
