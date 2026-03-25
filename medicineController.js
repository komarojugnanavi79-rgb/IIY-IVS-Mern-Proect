import asyncHandler from 'express-async-handler';
import Medicine from '../models/Medicine.js';
import { buildReminderDate, isSameDay } from '../utils/date.js';

const syncEndDate = (startDate, durationDays) => {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + Number(durationDays || 0));
  return endDate;
};

export const getMedicines = asyncHandler(async (req, res) => {
  const medicines = await Medicine.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(medicines);
});

export const createMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.create({
    ...req.body,
    user: req.user._id,
    endDate: syncEndDate(req.body.startDate || new Date(), req.body.durationDays)
  });

  res.status(201).json(medicine);
});

export const updateMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findOne({ _id: req.params.id, user: req.user._id });

  if (!medicine) {
    res.status(404);
    throw new Error('Medicine not found');
  }

  Object.assign(medicine, req.body);
  medicine.endDate = syncEndDate(medicine.startDate, medicine.durationDays);
  await medicine.save();
  res.json(medicine);
});

export const deleteMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findOneAndDelete({ _id: req.params.id, user: req.user._id });

  if (!medicine) {
    res.status(404);
    throw new Error('Medicine not found');
  }

  res.json({ message: 'Medicine deleted' });
});

export const getTodaySchedule = asyncHandler(async (req, res) => {
  const medicines = await Medicine.find({ user: req.user._id, isActive: true });
  const today = new Date();

  const schedule = medicines.flatMap((medicine) =>
    medicine.times.map((time) => {
      const scheduledAt = buildReminderDate(today, time);
      const existing = medicine.adherence.find((item) => isSameDay(item.scheduledAt, today) && new Date(item.scheduledAt).getHours() === scheduledAt.getHours() && new Date(item.scheduledAt).getMinutes() === scheduledAt.getMinutes());

      return {
        medicineId: medicine._id,
        name: medicine.name,
        dosage: medicine.dosage,
        time,
        frequency: medicine.frequency,
        mealTiming: medicine.mealTiming,
        reminderWindowMinutes: medicine.reminderWindowMinutes,
        stock: medicine.stock,
        status: existing?.status || 'scheduled',
        scheduledAt,
        note: existing?.note || ''
      };
    })
  );

  schedule.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
  res.json(schedule);
});

export const updateIntakeStatus = asyncHandler(async (req, res) => {
  const { status, scheduledAt, note, snoozeMinutes = 10 } = req.body;
  const medicine = await Medicine.findOne({ _id: req.params.id, user: req.user._id });

  if (!medicine) {
    res.status(404);
    throw new Error('Medicine not found');
  }

  const scheduleDate = new Date(scheduledAt);
  let intake = medicine.adherence.find((item) => new Date(item.scheduledAt).getTime() === scheduleDate.getTime());

  if (!intake) {
    intake = { scheduledAt: scheduleDate };
    medicine.adherence.push(intake);
    intake = medicine.adherence[medicine.adherence.length - 1];
  }

  intake.status = status;
  intake.note = note || intake.note;

  if (status === 'taken') {
    intake.takenAt = new Date();
    medicine.stock = Math.max(0, medicine.stock - 1);
  }

  if (status === 'snoozed') {
    intake.snoozedUntil = new Date(Date.now() + Number(snoozeMinutes) * 60000);
  }

  await medicine.save();
  res.json(medicine);
});

export const getHistory = asyncHandler(async (req, res) => {
  const medicines = await Medicine.find({ user: req.user._id }).select('name dosage adherence');
  const history = medicines.flatMap((medicine) =>
    medicine.adherence.map((item) => ({
      medicineId: medicine._id,
      name: medicine.name,
      dosage: medicine.dosage,
      ...item.toObject()
    }))
  );

  history.sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));
  res.json(history);
});
