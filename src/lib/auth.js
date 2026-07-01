import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Sign a JWT with the given payload. Expires in 7 days.
 */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verify a JWT and return the decoded payload.
 * Returns null if verification fails.
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Read the 'token' cookie from the incoming request
 * and return the decoded user payload, or null if invalid/missing.
 */
export function getAuthUser(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/(?:^|;\s*)token=([^;]*)/);
  if (!match) return null;

  const token = match[1];
  return verifyToken(token);
}
