import io
from datetime import datetime, timedelta
import pytz
from openpyxl import Workbook
from openpyxl.utils import get_column_letter
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side as BorderSide
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

IST = pytz.timezone('Asia/Kolkata')

def filter_trades_by_range(trades, range_param):
    """Filter trades by range: 15days, 1month, or all."""
    now_ist = datetime.now(IST).date()
    if range_param == '15days':
        start_date = now_ist - timedelta(days=15)
        return [t for t in trades if t.trade_date >= start_date]
    elif range_param == '1month':
        start_date = now_ist - timedelta(days=30)
        return [t for t in trades if t.trade_date >= start_date]
    return trades

def generate_excel_export(trades, user, range_param='all'):
    """
    Generates a professional Excel workbook for the user's trades.
    FINAL Excel columns:
    Date | Entry Time | Exit Time | Market | Instrument | Position | Quantity/Lot Size | Lots | Strategy | R:R | Status
    """
    filtered_trades = filter_trades_by_range(trades, range_param)
    filtered_trades.sort(key=lambda t: (t.trade_date, t.entry_time or '00:00'))

    wb = Workbook()
    ws = wb.active
    ws.title = "Trading Terminal"
    ws.views.sheetView[0].showGridLines = True

    # Styling constants
    header_fill = PatternFill(start_color="0F172A", end_color="0F172A", fill_type="solid")
    header_font = Font(name="Segoe UI", size=10, bold=True, color="FFFFFF")
    data_font = Font(name="Segoe UI", size=9.5)
    bold_font = Font(name="Segoe UI", size=9.5, bold=True)
    green_font = Font(name="Segoe UI", size=9.5, bold=True, color="16A34A")
    red_font = Font(name="Segoe UI", size=9.5, bold=True, color="DC2626")
    center_align = Alignment(horizontal="center", vertical="center")
    left_align = Alignment(horizontal="left", vertical="center")
    right_align = Alignment(horizontal="right", vertical="center")

    thin_border = Border(
        left=BorderSide(style='thin', color='CBD5E1'),
        right=BorderSide(style='thin', color='CBD5E1'),
        top=BorderSide(style='thin', color='CBD5E1'),
        bottom=BorderSide(style='thin', color='CBD5E1')
    )

    # Title & Metadata Block
    ws.merge_cells("A1:K1")
    title_cell = ws["A1"]
    title_cell.value = "TRADING TERMINAL — OFFICIAL TRADE LOG"
    title_cell.font = Font(name="Segoe UI", size=13, bold=True, color="0F172A")
    title_cell.alignment = Alignment(horizontal="left", vertical="center")
    ws.row_dimensions[1].height = 24

    ws["A2"].value = f"Trader: {user.name} ({user.email}) | Export Date: {datetime.now(IST).strftime('%d-%b-%Y %I:%M %p')} IST | Range: {range_param.upper()}"
    ws["A2"].font = Font(name="Segoe UI", size=9, italic=True, color="64748B")
    ws.merge_cells("A2:K2")
    ws.row_dimensions[2].height = 18

    # Summary Statistics Bar
    total_trades = len(filtered_trades)
    tp_hits = len([t for t in filtered_trades if getattr(t, 'status', '') == 'TP Hit'])
    sl_hits = len([t for t in filtered_trades if getattr(t, 'status', '') == 'SL Hit'])
    win_rate = round((tp_hits / total_trades * 100), 1) if total_trades > 0 else 0.0

    ws["A3"].value = f"Summary: Total Trades: {total_trades}  |  TP Hit: {tp_hits}  |  SL Hit: {sl_hits}  |  Win Rate: {win_rate}%"
    ws["A3"].font = Font(name="Segoe UI", size=9.5, bold=True, color="0F766E")
    ws.merge_cells("A3:K3")
    ws.row_dimensions[3].height = 20

    # EXACT Columns and Order required:
    # Date | Entry Time | Exit Time | Market | Instrument | Position | Quantity/Lot Size | Lots | Strategy | R:R | Status
    headers = [
        "Date", "Entry Time", "Exit Time", "Market", "Instrument",
        "Position", "Quantity/Lot Size", "Lots", "Strategy", "R:R", "Status"
    ]

    header_row = 5
    ws.row_dimensions[header_row].height = 24

    for col_idx, header in enumerate(headers, 1):
        cell = ws.cell(row=header_row, column=col_idx, value=header)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = center_align
        cell.border = thin_border

    # Data Rows
    current_row = header_row + 1
    for t in filtered_trades:
        ws.row_dimensions[current_row].height = 20
        is_indian = (getattr(t, 'market_type', None) or 'Indian Market') == 'Indian Market'
        qty_lot_size = t.quantity if is_indian else (t.lot_size if t.lot_size is not None else '-')
        lots_val = '-' if is_indian else (t.lots if t.lots is not None else '-')
        pos = (getattr(t, 'side', '') or 'BUY').upper()
        status_val = getattr(t, 'status', '')

        row_values = [
            t.trade_date.strftime('%d-%m-%Y'),
            t.entry_time or '-',
            t.exit_time or '-',
            getattr(t, 'market_type', None) or 'Indian Market',
            t.instrument,
            pos,
            qty_lot_size,
            lots_val,
            t.strategy or '-',
            t.rr or '-',
            status_val
        ]

        for col_idx, val in enumerate(row_values, 1):
            cell = ws.cell(row=current_row, column=col_idx, value=val)
            cell.font = data_font
            cell.border = thin_border

            # Alignment
            if col_idx in (1, 2, 3, 4, 6, 10, 11):
                cell.alignment = center_align
            elif col_idx in (7, 8):
                cell.alignment = right_align
            else:
                cell.alignment = left_align

            # Color Position (col 6)
            if col_idx == 6:
                cell.font = green_font if pos == 'BUY' else red_font

            # Color Status (col 11)
            if col_idx == 11:
                cell.font = green_font if status_val == 'TP Hit' else red_font

        current_row += 1

    # Auto-adjust column widths
    for col_idx in range(1, len(headers) + 1):
        col_letter = get_column_letter(col_idx)
        max_len = 0
        for r in range(header_row, current_row):
            cell_val = str(ws.cell(row=r, column=col_idx).value or '')
            max_len = max(max_len, len(cell_val))
        ws.column_dimensions[col_letter].width = max(max_len + 4, 12)

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    return output

def generate_pdf_export(trades, user, range_param='all'):
    """
    Generates a professional Landscape PDF trade report using ReportLab.
    FINAL PDF columns:
    Date | Entry Time | Exit Time | Market | Instrument | Position | Quantity/Lot Size | Lots | Strategy | R:R | Status
    """
    filtered_trades = filter_trades_by_range(trades, range_param)
    filtered_trades.sort(key=lambda t: (t.trade_date, t.entry_time or '00:00'))

    output = io.BytesIO()
    doc = SimpleDocTemplate(
        output,
        pagesize=landscape(letter),
        rightMargin=20,
        leftMargin=20,
        topMargin=20,
        bottomMargin=20
    )

    elements = []
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=colors.HexColor('#0F172A')
    )
    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#64748B')
    )
    cell_center = ParagraphStyle(
        'CellCenter',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        alignment=1
    )
    cell_left = ParagraphStyle(
        'CellLeft',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        alignment=0
    )
    cell_right = ParagraphStyle(
        'CellRight',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        alignment=2
    )

    # Document Header
    elements.append(Paragraph("TRADING TERMINAL — TRADING JOURNAL REPORT", title_style))
    meta_text = (
        f"<b>Trader:</b> {user.name} ({user.email}) &nbsp;|&nbsp; "
        f"<b>Generated:</b> {datetime.now(IST).strftime('%d-%m-%Y %I:%M %p')} IST &nbsp;|&nbsp; "
        f"<b>Range:</b> {range_param.upper()} ({len(filtered_trades)} trades)"
    )
    elements.append(Paragraph(meta_text, meta_style))
    elements.append(Spacer(1, 10))

    # Summary Statistics Bar
    total_trades = len(filtered_trades)
    tp_hits = len([t for t in filtered_trades if getattr(t, 'status', '') == 'TP Hit'])
    sl_hits = len([t for t in filtered_trades if getattr(t, 'status', '') == 'SL Hit'])
    win_rate = round((tp_hits / total_trades * 100), 1) if total_trades > 0 else 0.0

    summary_data = [
        ["Total Trades", "TP Hit", "SL Hit", "Win Rate"],
        [str(total_trades), str(tp_hits), str(sl_hits), f"{win_rate}%"]
    ]
    summary_table = Table(summary_data, colWidths=[120, 120, 120, 120])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8.5),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (1, 1), (1, 1), colors.HexColor('#16A34A')),
        ('TEXTCOLOR', (2, 1), (2, 1), colors.HexColor('#DC2626')),
        ('TEXTCOLOR', (3, 1), (3, 1), colors.HexColor('#0284C7')),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 12))

    # EXACT Columns and Order:
    # Date | Entry Time | Exit Time | Market | Instrument | Position | Quantity/Lot Size | Lots | Strategy | R:R | Status
    table_headers = [
        "Date", "Entry Time", "Exit Time", "Market", "Instrument",
        "Position", "Qty/Lot Size", "Lots", "Strategy", "R:R", "Status"
    ]
    table_data = [[Paragraph(f"<b>{h}</b>", cell_center) for h in table_headers]]

    for t in filtered_trades:
        is_indian = (getattr(t, 'market_type', None) or 'Indian Market') == 'Indian Market'
        qty_lot_size = str(t.quantity) if is_indian and t.quantity is not None else (str(t.lot_size) if t.lot_size is not None else "-")
        lots_str = "-" if is_indian else (str(t.lots) if t.lots is not None else "-")
        pos = (getattr(t, 'side', '') or 'BUY').upper()
        status_val = getattr(t, 'status', '')

        pos_color = "#16A34A" if pos == 'BUY' else "#DC2626"
        status_color = "#16A34A" if status_val == 'TP Hit' else "#DC2626"

        row = [
            Paragraph(t.trade_date.strftime('%d-%m-%Y'), cell_center),
            Paragraph(t.entry_time or '-', cell_center),
            Paragraph(t.exit_time or '-', cell_center),
            Paragraph(getattr(t, 'market_type', None) or 'Indian Market', cell_center),
            Paragraph(f"<b>{t.instrument}</b>", cell_left),
            Paragraph(f"<font color='{pos_color}'><b>{pos}</b></font>", cell_center),
            Paragraph(qty_lot_size, cell_right),
            Paragraph(lots_str, cell_center),
            Paragraph(t.strategy or "-", cell_left),
            Paragraph(f"<b>{t.rr}</b>" if t.rr else "-", cell_center),
            Paragraph(f"<font color='{status_color}'><b>{status_val}</b></font>", cell_center)
        ]
        table_data.append(row)

    # 11 columns in total; width fits landscape letter (~750 pt usable)
    col_widths = [65, 55, 55, 90, 85, 55, 70, 45, 105, 55, 65]
    trade_table = Table(table_data, colWidths=col_widths, repeatRows=1)
    trade_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
    ]))
    elements.append(trade_table)

    # Footer note
    elements.append(Spacer(1, 15))
    credit_style = ParagraphStyle(
        'Credit',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        textColor=colors.HexColor('#94A3B8'),
        alignment=1
    )
    elements.append(Paragraph("Trading Terminal &copy; 2026 &nbsp;|&nbsp; Personal Trading Journal", credit_style))

    doc.build(elements)
    output.seek(0)
    return output
