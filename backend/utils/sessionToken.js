const jwt = require('jsonwebtoken');
const crypto = require('crypto');

let lastVerifyFail = { msg: null, ts: 0, count: 0 };

/**
 * New: Create session-scoped JWT used in signaling payloads
 */
function createSessionToken({ sessionId, callerDeviceId, receiverDeviceId, role }) {
  const secret = process.env.SESSION_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    console.error('[sessionToken] CRITICAL: SESSION_SECRET and JWT_SECRET are both missing!');
    throw new Error('SESSION_SECRET or JWT_SECRET required for token generation');
  }
  
  console.log('[sessionToken] Creating session token:', {
    sessionId,
    role,
    hasSecret: !!secret,
    callerDeviceId: String(callerDeviceId),
    receiverDeviceId: String(receiverDeviceId)
  });

  const token = jwt.sign(
    {
      sessionId,
      callerDeviceId: String(callerDeviceId),
      receiverDeviceId: String(receiverDeviceId),
      role,
      type: 'desklink-session',
    },
    secret,
    { expiresIn: '10m' }
  );

  console.log('[sessionToken] Token created successfully for session:', sessionId);
  console.log('[sessionToken] Token preview (first 50 chars):', token.substring(0, 50));
  console.log('[sessionToken] Token length:', token.length);
  console.log('[sessionToken] Token type:', typeof token);
  return token;
}

/**
 * Generate ephemeral session token for older flows (kept for compatibility)
 * Short-lived (5 minutes default) and tied to specific session
 */
function generateSessionToken(sessionId, userId, deviceId, expiresInSeconds = 300) {
  const payload = {
    sessionId,
    userId: String(userId),
    deviceId: String(deviceId),
    type: 'webrtc-session',
    iat: Math.floor(Date.now() / 1000),
  };

  const secret = process.env.SESSION_SECRET || process.env.JWT_SECRET;
  return jwt.sign(payload, secret, {
    expiresIn: expiresInSeconds,
  });
}

/**
 * Verify session token (supports both token types)
 */
function verifySessionToken(token) {
  try {
    if (!token) {
      console.warn('[sessionToken] verify called with null/undefined token');
      return null;
    }

    if (typeof token !== 'string') {
      console.warn('[sessionToken] verify called with non-string token:', typeof token);
      return null;
    }

    const trimmed = token.trim();
    if (!trimmed || trimmed === 'undefined' || trimmed === 'null') {
      console.warn('[sessionToken] verify called with invalid token string');
      return null;
    }

    const secret = process.env.SESSION_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      console.error('[sessionToken] CRITICAL: Cannot verify token - no secret available');
      return null;
    }

    const decoded = jwt.verify(trimmed, secret);

    if (decoded.type !== 'webrtc-session' && decoded.type !== 'desklink-session') {
      console.warn('[sessionToken] invalid token type:', decoded.type);
      return null;
    }

    console.log('[sessionToken] Token verified:', { 
      sessionId: decoded.sessionId, 
      type: decoded.type, 
      role: decoded.role 
    });

    return decoded;
  } catch (err) {
    const now = Date.now();
    const msg = String(err && err.message ? err.message : 'unknown');
    if (lastVerifyFail.msg === msg && now - lastVerifyFail.ts < 2000) {
      lastVerifyFail.count += 1;
      // suppress spam
    } else {
      if (lastVerifyFail.count > 0) {
        console.warn('[sessionToken] verify failed (suppressed repeats):', lastVerifyFail.msg, 'x', lastVerifyFail.count);
      }
      lastVerifyFail = { msg, ts: now, count: 0 };
      console.warn('[sessionToken] verify failed:', msg);
    }
    return null; // ❗ do NOT throw, just return null
  }
}

/**
 * Generate TURN credentials using HMAC (for coturn long-term credentials)
 */
function generateTurnCredentials(username, ttl = 86400) {
  const secret = process.env.TURN_SECRET;
  if (!secret) {
    return null;
  }

  const timestamp = Math.floor(Date.now() / 1000) + ttl;
  const turnUsername = `${timestamp}:${username}`;
  const hmac = crypto.createHmac('sha1', secret);
  hmac.update(turnUsername);
  const turnPassword = hmac.digest('base64');

  return {
    username: turnUsername,
    password: turnPassword,
    ttl: timestamp,
  };
}

module.exports = {
  createSessionToken,
  generateSessionToken,
  verifySessionToken,
  generateTurnCredentials,
};