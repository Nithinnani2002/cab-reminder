import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.GF_EMAIL,
    subject: '🚕 Dedee! Book your Wipro cabs NOW!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; background: #f9f9f9; border-radius: 12px;">
        <h2 style="color: #e53e3e;">🚨 Cab Booking Reminder!</h2>
        <p style="font-size: 16px; color: #333;">Hey Dedee! 💕</p>
        <p style="font-size: 15px; color: #555;">
          It's Sunday and you need to book your <strong>Wipro cabs for the entire week</strong> before the window closes!
        </p>
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; border-radius: 6px; margin: 16px 0;">
          ⏰ <strong>Don't wait!</strong> The booking window closes soon. Log in to the Wipro cab portal and book now!
        </div>
        <p style="font-size: 14px; color: #888;">
          Once done, just reply <strong>"done"</strong> to the SMS you received and the reminders will stop! 😄
        </p>
        <p style="font-size: 13px; color: #aaa; margin-top: 24px;">
          Sent with love by your annoying boyfriend 🤖❤️
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
