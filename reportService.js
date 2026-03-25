import PDFDocument from 'pdfkit';

export const generateReportBuffer = ({ user, medicines, metrics }) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(22).text('Online Medicine Reminder Report');
    doc.moveDown();
    doc.fontSize(12).text(`Patient: ${user.name}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown();

    doc.fontSize(16).text('Active Medicines');
    medicines.forEach((medicine) => {
      doc.fontSize(12).text(
        `${medicine.name} | ${medicine.dosage} | ${medicine.times.join(', ')} | Stock: ${medicine.stock}`
      );
    });

    doc.moveDown();
    doc.fontSize(16).text('Recent Health Metrics');
    metrics.forEach((metric) => {
      doc
        .fontSize(12)
        .text(
          `${metric.type.replace('_', ' ')}: ${metric.value} (${new Date(metric.recordedAt).toLocaleString()})`
        );
    });

    doc.end();
  });
