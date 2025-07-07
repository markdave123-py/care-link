"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePrescriptionPDF = void 0;
const pdfkit_1 = require("pdfkit");
const generatePrescriptionPDF = (session, res) => {
    const doc = new pdfkit_1.default();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=session_${session.id}.pdf`);
    doc.pipe(res);
    doc.fontSize(18).text('Medical Session Summary', { underline: true });
    doc.moveDown();
    doc.fontSize(14).text(`Patient: ${session.patient.firstname} ${session.patient.lastname}`);
    doc.text(`Email: ${session.patient.email}`);
    doc.text(`Date: ${new Date(session.createdAt).toLocaleDateString()}`);
    doc.moveDown();
    doc.fontSize(16).text('Diagnosis:', { underline: true });
    doc.fontSize(12).text(session.diagnosis || 'N/A');
    doc.moveDown();
    doc.fontSize(16).text('Prescription:', { underline: true });
    doc.fontSize(12).text(session.prescription || 'N/A');
    doc.end();
};
exports.generatePrescriptionPDF = generatePrescriptionPDF;
//# sourceMappingURL=pdfGenerator.service.js.map