import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Otp from '@/models/Otp';
import { signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await dbConnect();

    const { name, email, password, otp } = await request.json();

    // Validate all fields are present
    if (!name || !email || !password || !otp) {
      return Response.json(
        { error: 'Name, email, password, and OTP are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return Response.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    // Verify OTP
    const validOtp = await Otp.findOne({ email: email.toLowerCase(), otp });
    if (!validOtp) {
      return Response.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Delete the OTP as it's been used
    await Otp.deleteOne({ _id: validOtp._id });

    // Create new user (password is hashed by pre-save hook)
    const user = await User.create({ name, email, password });

    // Sign JWT
    const token = signToken({
      userId: user._id,
      name: user.name,
      email: user.email,
    });

    // Build response with httpOnly cookie
    const response = Response.json(
      {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );

    response.headers.set(
      'Set-Cookie',
      `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`
    );

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
