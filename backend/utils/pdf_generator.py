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

# Added for better status visibility
STYLES.add(ParagraphStyle('StatusPending', parent=STYLES['Normal'], fontSize=9, textColor=colors.HexColor("#ef4444"), fontName='Helvetica-Bold'))
STYLES.add(ParagraphStyle('StatusCompleted', parent=STYLES['Normal'], fontSize=9, textColor=colors.HexColor("#10b981"), fontName='Helvetica-Bold'))
STYLES.add(ParagraphStyle('StatusNeutral', parent=STYLES['Normal'], fontSize=9, textColor=colors.HexColor("#4f46e5"), fontName='Helvetica-Bold'))

# Alert Box Style
STYLES.add(ParagraphStyle(
    'AlertBox',
    parent=STYLES['Normal'],
    fontSize=9,
    textColor=colors.HexColor("#92400e"),
    backColor=colors.HexColor("#fffbeb"),
    borderPadding=10,
    borderRadius=8,
    borderWidth=1,
    borderColor=colors.HexColor("#fef3c7")
))

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
        elements.append(Paragraph("<i>No active vitals monitoring data detect for this period.</i>", STYLES['Normal']))
        elements.append(Spacer(1, 0.1 * inch))
        alert_data = [[get_icon("bell_warning") or "⚠️", Paragraph("No active vitals monitoring data detected for this period.", STYLES['AlertBox'])]]
        at = Table(alert_data, colWidths=[0.3*inch, 7.2*inch])
        at.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'MIDDLE'), ('LEFTPADDING', (0,0), (-1,-1), 10)]))
        elements.append(at)
    
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
        for i, a in enumerate(appts[:20]):
            status = (a.get("status") or "N/A").upper()
            status_style = STYLES['StatusNeutral']
            if any(s in status for s in ['PENDING', 'CANCEL', 'REJECT']):
                status_style = STYLES['StatusPending']
            elif any(s in status for s in ['COMPLETED', 'APPROVE', 'SUCCESS']):
                status_style = STYLES['StatusCompleted']

            rows.append([
                Paragraph(str(a.get("appointment_date") or ""), STYLES['Value']),
                Paragraph(str(a.get("appointment_time") or "")[:5], STYLES['Value']),
                Paragraph(a.get("doctor_name") or "Specialist", STYLES['Value']),
                Paragraph((a.get("status") or "N/A").title(), status_style),
                Paragraph((a.get("reason") or "Routine Checkup")[:60], STYLES['Value'])
            ])
        
        t = Table(rows, colWidths=[1.0*inch, 0.7*inch, 1.4*inch, 1.3*inch, 3.1*inch])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ('TOPPADDING', (0,0), (-1,-1), 10),
            ('LINEBELOW', (0,0), (-1,0), 1, colors.HexColor("#4f46e5")),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
            ('GRID', (0,0), (-1,0), 0.5, colors.transparent),
        ]))
        elements.append(t)

        # Added "View Full History" Button representation
        elements.append(Spacer(1, 0.15 * inch))
        btn_data = [[Paragraph("<font color='#2563eb'>View Full Consultation History →</font>", STYLES['SubTitle'])]]
        bt = Table(btn_data, colWidths=[3.2*inch])
        bt.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#eef2ff")),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('ROUNDEDCORNERS', [10, 10, 10, 10]),
        ]))
        elements.append(bt)

    # 4. Prescriptions Grid (2 Columns)
    presc = data.get("prescriptions", [])
    if presc:
        elements.append(Paragraph("Active Prescriptions & Medications", STYLES['SectionHeader']))
        
        cards = []
        for p in presc[:12]:
            diag = p.get('diagnosis') or "General Consultation"
            date_str = str(p.get('created_at') or "")[:10]
            meds_list = p.get('medicines') or []
            meds_text = ", ".join(meds_list) if meds_list else "None listed"
            
            card_content = [
                [Paragraph(f"<font size='11'><b>{diag}</b></font>", STYLES['Value'])],
                [Paragraph(f"<b>Medications:</b> {meds_text}", STYLES['Normal']), Paragraph(f"Issued: {date_str}", STYLES['Label'])]
            ]
            ct = Table(card_content, colWidths=[3.5*inch])
            ct.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#ffffff")),
                ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
                ('TOPPADDING', (0,0), (-1,-1), 12),
                ('BOTTOMPADDING', (0,0), (-1,-1), 12),
                ('LEFTPADDING', (0,0), (-1,-1), 12),
                ('RIGHTPADDING', (0,0), (-1,-1), 12),
            ]))
            cards.append(ct)

        # Split into rows for 2-column grid
        grid_rows = []
        for i in range(0, len(cards), 2):
            row = [cards[i]]
            if i + 1 < len(cards):
                row.append(cards[i+1])
            else:
                row.append("")
            grid_rows.append(row)
        
        gt = Table(grid_rows, colWidths=[3.7*inch, 3.7*inch])
        gt.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 15),
        ]))
        elements.append(gt)

    # Footer Disclaimer Box
    elements.append(Spacer(1, 0.4 * inch))
    footer_content = [
        [Paragraph("<b>CONFIDENTIAL MEDICAL RECORD</b>", ParagraphStyle('FooterTitle', parent=STYLES['Normal'], fontSize=12, textColor=colors.HexColor("#1e293b"), spaceAfter=8))],
        [Paragraph("This document contains protected health information (PHI) and must be handled securely and in accordance with HIPAA regulations. Summary of clinical data depends on healthcare calibration. © 2026 NeuroNest Health Systems.", 
                  ParagraphStyle('FooterText', parent=STYLES['Normal'], fontSize=8, textColor=colors.HexColor("#64748b"), leading=12))]
    ]
    ft = Table(footer_content, colWidths=[7.2*inch])
    ft.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#eff6ff")),
        ('ROUNDEDCORNERS', [12, 12, 12, 12]),
        ('TOPPADDING', (0,0), (-1,-1), 15),
        ('BOTTOMPADDING', (0,0), (-1,-1), 15),
        ('LEFTPADDING', (0,0), (-1,-1), 20),
        ('RIGHTPADDING', (0,0), (-1,-1), 20),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#dbeafe")),
    ]))
    elements.append(ft)

    def add_page_numbers(canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica', 9)
        canvas.setFillColor(colors.HexColor("#64748b"))
        # Top-middle page indicator
        page_num = f"Page {doc.page} of 3" # Static '3' as typical for this template
        canvas.drawCentredString(A4[0]/2, A4[1]-20, page_num)
        canvas.restoreState()

    doc.build(elements, onFirstPage=add_page_numbers, onLaterPages=add_page_numbers)
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
