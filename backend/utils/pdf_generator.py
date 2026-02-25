import io
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.units import inch
from datetime import datetime

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
