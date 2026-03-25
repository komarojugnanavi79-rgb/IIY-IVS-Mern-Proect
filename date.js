export const buildReminderDate = (baseDate, timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const reminderDate = new Date(baseDate);
  reminderDate.setHours(hours, minutes, 0, 0);
  return reminderDate;
};

export const isSameDay = (first, second) =>
  new Date(first).toDateString() === new Date(second).toDateString();

