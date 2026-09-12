import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { AircraftTelemetry, MaintenanceWorkOrder, OperationalAlert } from '../types';

export class ReportExporter {
  public static exportExecutivePDF(
    aircraft: AircraftTelemetry,
    fleet: AircraftTelemetry[],
    workOrders: MaintenanceWorkOrder[],
    alerts: OperationalAlert[]
  ) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Dark Aerospace Dossier Styling
    const primaryColor: [number, number, number] = [6, 11, 24]; // Dark slate
    const cyanColor: [number, number, number] = [0, 180, 216];
    const whiteColor: [number, number, number] = [240, 245, 250];

    // Header Background
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 38, 'F');

    // Title & Logo
    doc.setTextColor(...cyanColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('AEROVISION INTELLIGENCE PLATFORM', 14, 18);

    doc.setFontSize(10);
    doc.setTextColor(160, 175, 200);
    doc.setFont('helvetica', 'normal');
    doc.text('EXECUTIVE FLIGHT OPERATIONS & PREDICTIVE MAINTENANCE DOSSIER', 14, 26);
    doc.text(`Generated: ${new Date().toUTCString()} | CLASSIFICATION: COMMERCIAL CONFIDENTIAL`, 14, 32);

    // Summary Box
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text('1. FLEET HEALTH & FLIGHT TELEMETRY SUMMARY', 14, 48);

    const avgFleetHealth = Math.round(fleet.reduce((acc, a) => acc + a.overallHealthScore, 0) / fleet.length);
    const totalAirborne = fleet.filter(a => a.phase === 'CRUISING' || a.phase === 'AIRBORNE' || a.phase === 'CLIMBING' || a.phase === 'DESCENDING').length;

    autoTable(doc, {
      startY: 52,
      head: [['Metric', 'Value', 'Status / Benchmark', 'Risk Index']],
      body: [
        ['Monitored Aircraft', `${aircraft.flightNumber} (${aircraft.model})`, aircraft.tailNumber, `${aircraft.riskScore}/100`],
        ['Fleet Operational Availability', `${((totalAirborne / fleet.length) * 100).toFixed(1)}%`, `${totalAirborne} of ${fleet.length} Airborne`, 'NOMINAL'],
        ['Average Fleet Health Index', `${avgFleetHealth} / 100`, avgFleetHealth > 85 ? 'OPTIMAL' : 'MONITORED', 'LOW'],
        ['Monitored Engine 1 EGT / Vibration', `${aircraft.engine1.egtDegC}°C / ${aircraft.engine1.vibrationN1} mm/s`, 'Within OEM limits', 'SAFE'],
        ['Monitored Engine 2 EGT / Vibration', `${aircraft.engine2.egtDegC}°C / ${aircraft.engine2.vibrationN2} mm/s`, aircraft.engine2.egtMarginDegC < 20 ? 'EGT MARGIN DEGRADED' : 'NOMINAL', aircraft.engine2.egtMarginDegC < 20 ? 'ELEVATED' : 'LOW'],
        ['Fuel Efficiency / Cost Index', `${aircraft.fuel.fuelBurnRateTotalKgHr.toLocaleString()} kg/hr (CI: ${aircraft.fuel.costIndex})`, 'Optimized Profile', 'LOW']
      ],
      theme: 'grid',
      headStyles: { fillColor: [14, 28, 56], textColor: [0, 240, 255] },
      styles: { fontSize: 9 }
    });

    // Work Orders Table
    const nextY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('2. PREDICTIVE MAINTENANCE WORK ORDERS & RUL ALERTS', 14, nextY);

    const woBody = workOrders.map(wo => [
      wo.id,
      wo.tailNumber,
      wo.ataChapter.substring(0, 20),
      wo.urgency,
      `$${wo.costEstimateUsd.toLocaleString()}`,
      wo.status
    ]);

    autoTable(doc, {
      startY: nextY + 4,
      head: [['Work Order ID', 'Tail #', 'ATA Chapter', 'Urgency', 'Cost (USD)', 'Status']],
      body: woBody,
      theme: 'grid',
      headStyles: { fillColor: [14, 28, 56], textColor: [0, 240, 255] },
      styles: { fontSize: 8.5 }
    });

    // Active Operational Alerts Table
    const nextY2 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('3. ACTIVE OPERATIONAL & SAFETY OCCURRENCE NOTICES', 14, nextY2);

    const alertBody = alerts.map(alt => [
      alt.id,
      alt.flightNumber,
      alt.severity,
      alt.category,
      alt.message.substring(0, 55) + (alt.message.length > 55 ? '...' : '')
    ]);

    autoTable(doc, {
      startY: nextY2 + 4,
      head: [['Alert ID', 'Flight', 'Severity', 'System', 'Diagnostic Message']],
      body: alertBody,
      theme: 'grid',
      headStyles: { fillColor: [14, 28, 56], textColor: [0, 240, 255] },
      styles: { fontSize: 8 }
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(120, 130, 145);
      doc.text(`AeroVision Aviation Intelligence Platform | Page ${i} of ${pageCount}`, 14, 290);
      doc.text('Confidential - Airline Flight Operations & Engineering Directive', 120, 290);
    }

    doc.save(`AeroVision_Executive_Dossier_${aircraft.flightNumber}_${Date.now()}.pdf`);
  }

  public static exportWorkOrdersExcel(workOrders: MaintenanceWorkOrder[]) {
    const data = workOrders.map(wo => ({
      'Work Order ID': wo.id,
      'Aircraft ID': wo.aircraftId,
      'Tail Number': wo.tailNumber,
      'ATA Chapter': wo.ataChapter,
      'Title': wo.title,
      'Description': wo.description,
      'Urgency': wo.urgency,
      'Health Impact Score': wo.healthImpactScore,
      'Est. Labor Hours': wo.estimatedLaborHours,
      'Assigned Technician': wo.assignedTechnician,
      'Status': wo.status,
      'Predicted Failure Risk (%)': wo.predictedFailureRisk,
      'Cost Estimate (USD)': wo.costEstimateUsd,
      'Due Date': wo.dueTimestamp
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Maintenance Work Orders');
    XLSX.writeFile(wb, `AeroVision_WorkOrders_${Date.now()}.xlsx`);
  }

  public static exportTelemetryCSV(fleet: AircraftTelemetry[]) {
    const data = fleet.map(a => ({
      'Flight Number': a.flightNumber,
      'Tail Number': a.tailNumber,
      'Model': a.model,
      'Origin': a.originIata,
      'Destination': a.destIata,
      'Latitude': a.latitude.toFixed(4),
      'Longitude': a.longitude.toFixed(4),
      'Altitude (ft)': a.altitudeFt,
      'Ground Speed (kts)': a.groundSpeedKnots,
      'Heading (deg)': a.headingDeg,
      'Phase': a.phase,
      'Health Score': a.overallHealthScore,
      'Risk Score': a.riskScore,
      'ENG1 EGT (°C)': a.engine1.egtDegC,
      'ENG1 N1 (%)': a.engine1.n1Percent,
      'ENG1 Fuel Flow (kg/h)': a.engine1.fuelFlowKgHr,
      'ENG2 EGT (°C)': a.engine2.egtDegC,
      'ENG2 N1 (%)': a.engine2.n1Percent,
      'ENG2 Fuel Flow (kg/h)': a.engine2.fuelFlowKgHr,
      'HYD SYS A (PSI)': a.hydraulics.systemAPressurePsi,
      'HYD SYS B (PSI)': a.hydraulics.systemBPressurePsi,
      'Fuel Remaining (kg)': a.fuel.totalQuantityKg,
      'Cost Index': a.fuel.costIndex
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const csvOutput = XLSX.utils.sheet_to_csv(ws);

    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AeroVision_Fleet_Telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
