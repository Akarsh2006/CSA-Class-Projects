import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import PasswordReset from '@/models/PasswordReset';

export async function POST(request) {
  try {
    await dbConnect();
    const { token, password } = await request.json();

    if (!token || !password) {
      return Response.json({ error: 'Token and new password are required' }, { status: 400 });
    }

    // Verify token
    const resetRecord = await PasswordReset.findOne({ token });
    if (!resetRecord) {
      return Response.json({ error: 'Invalid or expired password reset token' }, { status: 400 });
    }

    // Find user
    const user = await User.findOne({ email: resetRecord.email });
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Update password (hashing is handled by the pre-save hook in User model)
    user.password = password;
    await user.save();

    // Delete the reset token so it can't be reused
    await PasswordReset.deleteOne({ _id: resetRecord._id });

    return Response.json({ message: 'Password has been successfully reset' }, { status: 200 });
  } catch (error) {
    console.error('Reset password error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
