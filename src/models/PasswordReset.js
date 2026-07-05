import mongoose from 'mongoose';

const PasswordResetSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 900, // Document is automatically deleted after 15 minutes (900 seconds)
  },
});

export default mongoose.models.PasswordReset || mongoose.model('PasswordReset', PasswordResetSchema);
