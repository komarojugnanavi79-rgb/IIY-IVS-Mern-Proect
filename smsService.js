import twilio from 'twilio';

const isConfigured =
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_PHONE_NUMBER;

const client = isConfigured
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export const sendSMS = async ({ to, body }) => {
  if (!client || !to) return;
  await client.messages.create({
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
    body
  });
};

