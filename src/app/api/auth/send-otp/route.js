import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Otp from '@/models/Otp';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    await dbConnect();
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return Response.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return Response.json({ error: 'A user with this email already exists' }, { status: 409 });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // For development, log the OTP
    console.log(`[DEV OTP] For ${email}: ${otp}`);

    // Save OTP to DB (upsert if they requested another one before the previous expired)
    await Otp.findOneAndUpdate(
      { email: email.toLowerCase() },
      { email: email.toLowerCase(), otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Send email via nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 465,
      secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"BuildFolio" <${process.env.SENDER_EMAIL || process.env.SMTP_USER || 'noreply@buildfolio.com'}>`,
      to: email,
      subject: 'Verify your BuildFolio account',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #000;">Verify your email address</h2>
          <p style="color: #475569; font-size: 16px;">Hi ${name},</p>
          <p style="color: #475569; font-size: 16px;">Please use the following OTP to complete your registration with BuildFolio. This code will expire in 5 minutes.</p>
          <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #000;">${otp}</span>
          </div>
          <p style="color: #475569; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    };

    // Attempt to send email, but don't fail registration if credentials are not configured
    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${email}`);
      } else {
        console.log(`SMTP credentials missing. Email not sent. Use the OTP from the console to verify.`);
      }
    } catch (mailError) {
      console.error('Failed to send OTP email:', mailError);
      // We can still proceed, just log it for dev
    }

    return Response.json({ message: 'OTP sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Send OTP error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
