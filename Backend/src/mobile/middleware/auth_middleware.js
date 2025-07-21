// backend/middleware/auth_middleware.js
import admin from 'firebase-admin';

export default async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const idToken = authHeader.split('Bearer ')[1];
    if (!idToken) throw new Error('No token');

    const decoded = await admin.auth().verifyIdToken(idToken);
    // Attach the Firebase UID to the request
    req.firebaseUid = decoded.uid;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
