import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import PasswordReset from '@/models/PasswordReset';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export async function POST(request) {
  try {
    await dbConnect();
    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // For security, do not reveal whether the email exists or not.
      return Response.json({ message: 'If that email address is in our database, we will send you an email to reset your password.' }, { status: 200 });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Save token to DB (upsert so we don't have multiple valid tokens for the same email)
    await PasswordReset.findOneAndUpdate(
      { email: email.toLowerCase() },
      { email: email.toLowerCase(), token: resetToken, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Get the base URL for the reset link
    // e.g., http://localhost:3000 or https://buildfolio.com
    const host = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const resetLink = `${host}/reset-password?token=${resetToken}`;

    // For development logging
    console.log(`[DEV RESET LINK] For ${email}: ${resetLink}`);

    // Send email via nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 465,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"BuildFolio" <${process.env.SENDER_EMAIL || process.env.SMTP_USER || 'noreply@buildfolio.com'}>`,
      to: email,
      subject: 'Reset your BuildFolio password',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #000;">Reset your password</h2>
          <p style="color: #475569; font-size: 16px;">Hi ${user.name},</p>
          <p style="color: #475569; font-size: 16px;">We received a request to reset the password for your BuildFolio account. This link will expire in 15 minutes.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" style="background-color: #000; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">Reset Password</a>
          </div>
          <p style="color: #475569; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      `,
    };

    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await transporter.sendMail(mailOptions);
      } else {
        console.log(`SMTP credentials missing. Email not sent. Use the reset link from the console.`);
      }
    } catch (mailError) {
      console.error('Failed to send reset email:', mailError);
    }

    return Response.json({ message: 'If that email address is in our database, we will send you an email to reset your password.' }, { status: 200 });
  } catch (error) {
    console.error('Forgot password error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
