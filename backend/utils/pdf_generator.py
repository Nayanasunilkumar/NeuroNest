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
    fontSize=26,
    textColor=colors.whitesmoke,
    spaceAfter=10,
    alignment=1, # Center
    fontName='Helvetica-Bold'
))

STYLES.add(ParagraphStyle(
    'SubTitle',
    parent=STYLES['Normal'],
    fontSize=10,
    textColor=colors.whitesmoke,
    alignment=1,
    spaceAfter=15
))

STYLES.add(ParagraphStyle(
    'SectionHeader',
    parent=STYLES['Heading2'],
    fontSize=15,
    textColor=colors.HexColor("#4f46e5"),
    spaceBefore=25,
    spaceAfter=12,
    borderPadding=2,
    underlineWidth=1,
    fontName='Helvetica-Bold'
))

STYLES.add(ParagraphStyle('Label', parent=STYLES['Normal'], fontSize=9, fontName='Helvetica-Bold', textColor=colors.HexColor("#64748b")))
STYLES.add(ParagraphStyle('Value', parent=STYLES['Normal'], fontSize=10, textColor=colors.HexColor("#1e293b")))

# Safety styles for vitals
if 'HRRed' not in STYLES:
    STYLES.add(ParagraphStyle('HRRed', parent=STYLES['Normal'], textColor=colors.HexColor("#ef4444"), fontName='Helvetica-Bold'))
if 'SpO2Red' not in STYLES:
    STYLES.add(ParagraphStyle('SpO2Red', parent=STYLES['Normal'], textColor=colors.HexColor("#ef4444"), fontName='Helvetica-Bold'))
if 'TempRed' not in STYLES:
    STYLES.add(ParagraphStyle('TempRed', parent=STYLES['Normal'], textColor=colors.HexColor("#ef4444"), fontName='Helvetica-Bold'))

def get_icon(name):
    """Helper to get image or placeholder."""
    path = ICONS_DIR / f"{name}.png"
    if path.exists():
        try:
            return Image(str(path), width=18, height=18)
        except Exception:
            return "● "
    return ""

def _draw_header(elements):
    """Adds a branded top header bar."""
    header_data = [
        [Paragraph("NEURONEST", STYLES['MainTitle'])],
        [Paragraph(f"Digital Health Clinical Report • {datetime.now().strftime('%B %d, %Y')}", STYLES['SubTitle'])]
    ]
    t = Table(header_data, colWidths=[7.5*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#4f46e5")),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 15),
        ('TOPPADDING', (0,0), (-1,-1), 20),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 0.4 * inch))

def generate_patient_report(data):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=30, bottomMargin=50)
    
    elements = []
    _draw_header(elements)

    # 1. Patient Profile Card
    elements.append(Paragraph("Patient Identity", STYLES['SectionHeader']))
    acc = data.get("account", {})
    prof = data.get("profile", {})
    
    identity_data = [
        [Paragraph("Full Name", STYLES['Label']), Paragraph(acc.get("full_name", "N/A"), STYLES['Value']), 
         Paragraph("Email Address", STYLES['Label']), Paragraph(acc.get("email", "N/A"), STYLES['Value'])],
        [Paragraph("Date of Birth", STYLES['Label']), Paragraph(prof.get("date_of_birth", "N/A"), STYLES['Value']), 
         Paragraph("Gender", STYLES['Label']), Paragraph((prof.get("gender") or "N/A").capitalize(), STYLES['Value'])],
        [Paragraph("Phone Number", STYLES['Label']), Paragraph(prof.get("phone", "N/A"), STYLES['Value']), 
         Paragraph("Blood Group", STYLES['Label']), Paragraph(prof.get("blood_group", "N/A"), STYLES['Value'])],
        [Paragraph("Residential Address", STYLES['Label']), Paragraph(prof.get("address", "N/A"), STYLES['Value']), "", ""]
    ]
    
    id_table = Table(identity_data, colWidths=[1.4*inch, 2.3*inch, 1.4*inch, 2.3*inch])
    id_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('LEFTPADDING', (0,0), (-1,-1), 15),
        ('RIGHTPADDING', (0,0), (-1,-1), 15),
        ('TOPPADDING', (0,0), (-1,-1), 15),
    ]))
    elements.append(id_table)

    # 2. Vitals Status
    elements.append(Paragraph("Clinical Vitals Monitoring", STYLES['SectionHeader']))
    vitals_data = data.get("vitals", {})
    
    if vitals_data.get("is_active"):
        latest = vitals_data.get("latest", {})
        hr, spo2, temp = (latest.get("hr") or 0), (latest.get("spo2") or 0), (latest.get("temp") or 0)
        
        hr_color = "#ef4444" if (hr > 0 and (hr < 60 or hr > 100)) else "#10b981"
        spo2_color = "#ef4444" if (spo2 > 0 and spo2 < 95) else "#10b981"
        temp_color = "#ef4444" if (temp > 0 and (temp < 36.1 or temp > 37.5)) else "#10b981"
        
        v_rows = [
            [
                get_icon("heart_red"), Paragraph("<b>Heart Rate</b>", STYLES['Label']), 
                Paragraph(f"<font color='{hr_color}'>{hr} BPM</font>", STYLES['Value']),
                get_icon("oxygen_blue"), Paragraph("<b>SpO2</b>", STYLES['Label']), 
                Paragraph(f"<font color='{spo2_color}'>{spo2}%</font>", STYLES['Value']),
                get_icon("temp_green"), Paragraph("<b>Temp</b>", STYLES['Label']), 
                Paragraph(f"<font color='{temp_color}'>{temp}°C</font>", STYLES['Value'])
            ]
        ]
        vt = Table(v_rows, colWidths=[0.3*inch, 1.1*inch, 1.1*inch, 0.3*inch, 1.1*inch, 1.1*inch, 0.3*inch, 1.1*inch, 1.1*inch])
        vt.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#ffffff")),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ('TOPPADDING', (0,0), (-1,-1), 10),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
        ]))
        elements.append(vt)
    else:
        elements.append(Paragraph("<i>No active vitals monitoring data detected for this period.</i>", STYLES['Normal']))
    
    # 3. Appointments Table
    appts = data.get("appointments", [])
    if appts:
        elements.append(Paragraph("Recent Medical Consultations", STYLES['SectionHeader']))
        header = [
            Paragraph("Date", STYLES['Label']), 
            Paragraph("Time", STYLES['Label']), 
            Paragraph("Doctor", STYLES['Label']), 
            Paragraph("Status", STYLES['Label']), 
            Paragraph("Reason / Notes", STYLES['Label'])
        ]
        rows = [header]
        for i, a in enumerate(appts[:15]):
            rows.append([
                Paragraph(str(a.get("appointment_date") or ""), STYLES['Value']),
                Paragraph(str(a.get("appointment_time") or "")[:5], STYLES['Value']),
                Paragraph(a.get("doctor_name") or "Specialist", STYLES['Value']),
                Paragraph((a.get("status") or "N/A").title(), STYLES['Value']),
                Paragraph((a.get("reason") or "Routine Checkup")[:60], STYLES['Value'])
            ])
        
        t = Table(rows, colWidths=[1.0*inch, 0.8*inch, 1.5*inch, 1.1*inch, 3.1*inch])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ('TOPPADDING', (0,0), (-1,-1), 10),
            ('LINEBELOW', (0,0), (-1,0), 1, colors.HexColor("#4f46e5")),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ]))
        elements.append(t)

    # 4. Prescriptions Cards
    presc = data.get("prescriptions", [])
    if presc:
        elements.append(Paragraph("Active Prescriptions & Medications", STYLES['SectionHeader']))
        for p in presc[:8]:
            diag = p.get('diagnosis') or "General Consultation"
            date_str = str(p.get('created_at') or "")[:10]
            meds = p.get('medicines') or []
            
            p_data = [
                [Paragraph(f"<b>{diag}</b>", STYLES['Value']), Paragraph(f"Issued: {date_str}", STYLES['Label'])],
                [Paragraph(f"Medications: {', '.join(meds)}", STYLES['Normal']), ""]
            ]
            pt = Table(p_data, colWidths=[5.5*inch, 2.0*inch])
            pt.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('BOTTOMPADDING', (0,0), (-1,-1), 12),
                ('TOPPADDING', (0,0), (-1,-1), 12),
                ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
            ]))
            pt.hAlign = 'LEFT'
            elements.append(pt)
            elements.append(Spacer(1, 0.1 * inch))

    # Emergency Contact Footer
    ec = data.get("emergency_contact", {})
    if ec:
        elements.append(Spacer(1, 0.4 * inch))
        elements.append(Paragraph("Emergency Support Context", STYLES['Label']))
        ec_text = f"Primary Contact: {ec.get('contact_name')} ({ec.get('relationship')}) • Phone: {ec.get('phone')}"
        elements.append(Paragraph(ec_text, STYLES['Normal']))

    # Footer Disclaimer
    elements.append(Spacer(1, 0.6 * inch))
    notice = "<b>CONFIDENTIAL MEDICAL RECORD</b><br/>" \
             "This document contains protected health information (PHI) intended solely for the patient. " \
             "Accuracy of clinical vitals depends on hardware calibration. © 2026 NeuroNest Health Systems."
    elements.append(Paragraph(notice, ParagraphStyle('Footer', parent=STYLES['Normal'], fontSize=7, textColor=colors.gray, alignment=1, leading=10)))

    doc.build(elements)
    buffer.seek(0)
    return buffer


def generate_assessment_report(data, tz_name: str = "UTC"):
    """Enhanced Assessment Report - reusing styles for consistency."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=30, bottomMargin=50)

    try:
        tz_info = ZoneInfo(tz_name)
    except Exception:
        tz_info = datetime.now(timezone.utc).astimezone().tzinfo or timezone.utc
    
    elements = []
    
    # Branded Header
    assessment_header_data = [
        [Paragraph("NEURONEST ASSESSMENT", STYLES['MainTitle'])],
        [Paragraph(f"Vitals Diagnostic Summary • {datetime.now(tz_info).strftime('%B %d, %Y')}", STYLES['SubTitle'])]
    ]
    at = Table(assessment_header_data, colWidths=[7.5*inch])
    at.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#7c3aed")), # Purple for assessments
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 15),
        ('TOPPADDING', (0,0), (-1,-1), 20),
    ]))
    elements.append(at)
    elements.append(Spacer(1, 0.4 * inch))
    
    patient = data.get("patient", {})
    latest = data.get("latest", {})
    summary = data.get("summary", {})
    history = data.get("history", [])

    elements.append(Paragraph("Patient Overview", STYLES['SectionHeader']))
    p_data = [["Name:", patient.get("full_name", "N/A"), "Email:", patient.get("email", "N/A")]]
    pt = Table(p_data, colWidths=[1.2*inch, 2.5*inch, 0.8*inch, 3*inch])
    pt.setStyle(TableStyle([('FONTSIZE', (0,0), (-1,-1), 10), ('TEXTCOLOR', (0,0), (0,-1), colors.gray), ('TEXTCOLOR', (2,0), (2,-1), colors.gray)]))
    elements.append(pt)

    elements.append(Paragraph("Vitals Assessment Results", STYLES['SectionHeader']))
    s_data = [
        [Paragraph("Avg Heart Rate", STYLES['Label']), Paragraph(f"{summary.get('hr_avg', 'N/A')} BPM", STYLES['Value'])],
        [Paragraph("Avg SpO2", STYLES['Label']), Paragraph(f"{summary.get('spo2_avg', 'N/A')}%", STYLES['Value'])],
        [Paragraph("Avg Temperature", STYLES['Label']), Paragraph(f"{summary.get('temp_avg', 'N/A')}°C", STYLES['Value'])]
    ]
    st = Table(s_data, colWidths=[2*inch, 5.5*inch])
    st.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")), ('BOTTOMPADDING', (0,0), (-1,-1), 10), ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0"))]))
    elements.append(st)
    
    if history:
        elements.append(Paragraph(f"Vitals History Log ({len(history)} entries)", STYLES['SectionHeader']))
        h_rows = [[Paragraph("Reading Time", STYLES['Label']), "HR", "SpO2", "Temp"]]
        for h in history[-25:]:
            h_rows.append([str(h.get('ts'))[11:19], f"{h.get('hr')} BPM", f"{h.get('spo2')}%", f"{h.get('temp')}°C"])
        ht = Table(h_rows, colWidths=[2*inch, 1.8*inch, 1.8*inch, 1.8*inch])
        ht.setStyle(TableStyle([('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]), ('ALIGN', (0,0), (-1,-1), 'CENTER'), ('GRID', (0,0), (-1,-1), 0.25, colors.HexColor("#e2e8f0"))]))
        elements.append(ht)

    elements.append(Spacer(1, 1*inch))
    elements.append(Paragraph("<b>End of Assessment</b><br/><font size='7' color='gray'>© 2026 NeuroNest Systems</font>", ParagraphStyle('FooterStatus', parent=STYLES['Normal'], alignment=1)))

    doc.build(elements)
    buffer.seek(0)
    return buffer
