import asyncHandler from 'express-async-handler';
import Medicine from '../models/Medicine.js';
import HealthMetric from '../models/HealthMetric.js';
import User from '../models/User.js';
import { generateReportBuffer } from '../services/reportService.js';
import { getAISuggestion } from '../services/aiSuggestionService.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const [medicines, metrics, familyMembers] = await Promise.all([
    Medicine.find({ user: req.user._id }).sort({ createdAt: -1 }),
    HealthMetric.find({ user: req.user._id }).sort({ recordedAt: -1 }).limit(5),
    User.find({ familyCode: req.user.familyCode }).select('name email')
  ]);

  const today = new Date().toDateString();
  const adherenceEntries = medicines.flatMap((medicine) => medicine.adherence);
  const takenToday = adherenceEntries.filter(
    (entry) => new Date(entry.scheduledAt).toDateString() === today && entry.status === 'taken'
  ).length;

  const missedToday = adherenceEntries.filter(
    (entry) => new Date(entry.scheduledAt).toDateString() === today && entry.status === 'missed'
  ).length;

  res.json({
    summary: {
      activeMedicines: medicines.filter((medicine) => medicine.isActive).length,
      lowStockCount: medicines.filter((medicine) => medicine.stock <= medicine.lowStockThreshold).length,
      takenToday,
      missedToday
    },
    aiSuggestion: getAISuggestion(medicines, metrics),
    medicines,
    metrics,
    familyMembers
  });
});

export const downloadReport = asyncHandler(async (req, res) => {
  const [user, medicines, metrics] = await Promise.all([
    User.findById(req.user._id),
    Medicine.find({ user: req.user._id, isActive: true }),
    HealthMetric.find({ user: req.user._id }).sort({ recordedAt: -1 }).limit(10)
  ]);

  const pdfBuffer = await generateReportBuffer({ user, medicines, metrics });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="medicine-report.pdf"');
  res.send(pdfBuffer);
});

