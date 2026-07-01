import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}

/**
 * Cached connection helper for serverless environments.
 * Uses a global promise to avoid creating multiple connections
 * across hot-reloads in development or concurrent invocations.
 */
async function dbConnect() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (!global._mongoosePromise) {
    global._mongoosePromise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  await global._mongoosePromise;
  return mongoose.connection;
}

export default dbConnect;
