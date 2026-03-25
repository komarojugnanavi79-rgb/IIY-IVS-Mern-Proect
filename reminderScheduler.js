import cron from 'node-cron';
import Medicine from '../models/Medicine.js';
import User from '../models/User.js';
import { buildReminderDate, isSameDay } from '../utils/date.js';
import { sendEmail } from './emailService.js';
import { sendPush } from './pushService.js';
import { sendSMS } from './smsService.js';

const shouldRunForFrequency = (medicine, now) => {
  const start = new Date(medicine.startDate);
  const diffDays = Math.floor((new Date(now).setHours(0, 0, 0, 0) - new Date(start).setHours(0, 0, 0, 0)) / 86400000);

  if (medicine.frequency === 'alternate') return diffDays % 2 === 0;
  if (medicine.frequency === 'weekly') return new Date(start).getDay() === new Date(now).getDay();
  if (medicine.frequency === 'weekdays') return ![0, 6].includes(new Date(now).getDay());
  if (medicine.frequency === 'monthly') return new Date(start).getDate() === new Date(now).getDate();
  return true;
};

const notifyForMedicine = async (user, medicine, scheduledAt) => {
  const subject = `Medicine reminder: ${medicine.name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #123;">
      <h2>Time to take ${medicine.name}</h2>
      <p>Dosage: <strong>${medicine.dosage}</strong></p>
      <p>Meal timing: <strong>${medicine.mealTiming?.replace(/_/g, ' ') || 'anytime'}</strong></p>
      <p>Scheduled time: <strong>${scheduledAt.toLocaleTimeString()}</strong></p>
    </div>
  `;

  if (user.notifications?.email) {
    await sendEmail({ to: user.email, subject, html });
  }

  if (user.notifications?.browser) {
    await sendPush(user.pushSubscription, {
      title: subject,
      body: `${medicine.dosage} at ${scheduledAt.toLocaleTimeString()}`,
      url: '/dashboard'
    });
  }

  if (user.notifications?.sms) {
    await sendSMS({
      to: user.phone,
      body: `${medicine.name} reminder: take ${medicine.dosage} ${medicine.mealTiming?.replace(/_/g, ' ') || 'anytime'}.`
    });
  }
};

const notifyCaregiverForMiss = async (user, medicine) => {
  if (user.caregiverEmail) {
    await sendEmail({
      to: user.caregiverEmail,
      subject: `Missed dose alert for ${user.name}`,
      html: `<p>${user.name} missed ${medicine.name}. Please check in with them.</p>`
    });
  }

  if (user.caregiverPhone && user.notifications?.sms) {
    await sendSMS({
      to: user.caregiverPhone,
      body: `${user.name} missed ${medicine.name}.`
    });
  }
};

export const startReminderScheduler = () => {
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    const medicines = await Medicine.find({ isActive: true }).populate('user');

    for (const medicine of medicines) {
      if (!shouldRunForFrequency(medicine, now)) continue;

      const snoozedLog = medicine.adherence.find(
        (item) =>
          item.status === 'snoozed' &&
          item.snoozedUntil &&
          Math.abs(now.getTime() - new Date(item.snoozedUntil).getTime()) / 60000 < 1
      );

      if (snoozedLog) {
        await notifyForMedicine(medicine.user, medicine, new Date(snoozedLog.snoozedUntil));
        snoozedLog.status = 'scheduled';
        snoozedLog.notifiedAt = new Date();
        await medicine.save();
      }

      for (const time of medicine.times) {
        const scheduledAt = buildReminderDate(now, time);
        const minutesDiff = Math.abs(now.getTime() - scheduledAt.getTime()) / 60000;
        const existingLog = medicine.adherence.find((item) => isSameDay(item.scheduledAt, now) && item.scheduledAt.getHours() === scheduledAt.getHours() && item.scheduledAt.getMinutes() === scheduledAt.getMinutes());

        if (minutesDiff < 1 && (!existingLog || !existingLog.notifiedAt)) {
          await notifyForMedicine(medicine.user, medicine, scheduledAt);

          if (existingLog) {
            existingLog.notifiedAt = new Date();
          } else {
            medicine.adherence.push({ scheduledAt, notifiedAt: new Date() });
          }

          await medicine.save();
        }

        const overdueLog = medicine.adherence.find((item) => isSameDay(item.scheduledAt, now) && item.status === 'scheduled' && now.getTime() - new Date(item.scheduledAt).getTime() > 30 * 60000);

        if (overdueLog) {
          overdueLog.status = 'missed';
          await medicine.save();
          await notifyCaregiverForMiss(medicine.user, medicine);
        }
      }

      const shouldSendLowStock =
        medicine.stock <= medicine.lowStockThreshold &&
        (!medicine.lastLowStockAlertAt ||
          now.getTime() - new Date(medicine.lastLowStockAlertAt).getTime() > 24 * 60 * 60000);

      if (shouldSendLowStock) {
        await sendEmail({
          to: medicine.user.email,
          subject: `Low stock alert for ${medicine.name}`,
          html: `<p>${medicine.name} stock is low (${medicine.stock} left). Refill soon.</p>`
        });
        medicine.lastLowStockAlertAt = now;
        await medicine.save();
      }
    }
  });
};
