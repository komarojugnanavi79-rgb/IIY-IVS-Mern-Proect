import webpush from 'web-push';

if (
  process.env.VAPID_PUBLIC_KEY &&
  process.env.VAPID_PRIVATE_KEY &&
  process.env.VAPID_SUBJECT
) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export const sendPush = async (subscription, payload) => {
  if (!subscription || !process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return;
  }

  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (error) {
    console.error('Push notification error:', error.message);
  }
};

