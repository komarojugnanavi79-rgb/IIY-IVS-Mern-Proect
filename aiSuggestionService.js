export const getAISuggestion = (medicines = [], metrics = []) => {
  const lowStock = medicines.filter((medicine) => medicine.stock <= medicine.lowStockThreshold);
  const recentMetric = metrics[0];

  if (lowStock.length) {
    return `Refill ${lowStock[0].name} soon. Stock is down to ${lowStock[0].stock}.`;
  }

  if (recentMetric?.type === 'blood_sugar') {
    return 'Keep glucose readings with meal notes to uncover a more reliable medicine rhythm.';
  }

  if (medicines.length > 3) {
    return 'Bundle nearby reminder times into a single care block to reduce missed doses.';
  }

  return 'Your routine looks stable. Keep notifications enabled for on-time reminders.';
};

