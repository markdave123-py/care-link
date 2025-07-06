// utils/pdfSessionReport.ts
import PDFDocument from 'pdfkit';
import { Response } from 'express';

export const generatePrescriptionPDF = (session: any, res: Response) => {
  const doc = new PDFDocument();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=session_${session.id}.pdf`);

  doc.pipe(res);

  doc.fontSize(18).text('Medical Session Summary', { underline: true });
  doc.moveDown();

  // Patient Info
  doc.fontSize(14).text(`Patient: ${session.patient.firstname} ${session.patient.lastname}`);
  doc.text(`Email: ${session.patient.email}`);
  doc.text(`Date: ${new Date(session.createdAt).toLocaleDateString()}`);
  doc.moveDown();

  // Diagnosis & Prescription
  doc.fontSize(16).text('Diagnosis:', { underline: true });
  doc.fontSize(12).text(session.diagnosis || 'N/A');
  doc.moveDown();

  doc.fontSize(16).text('Prescription:', { underline: true });
  doc.fontSize(12).text(session.prescription || 'N/A');

  doc.end();
}
