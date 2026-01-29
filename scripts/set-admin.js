// scripts/set-admin.js
// Usage: node scripts/set-admin.js <UID>
// Requires: serviceAccountKey.json placed at the repo root (do NOT commit this file).

const admin = require('firebase-admin');
const path = require('path');
const keyPath = path.join(__dirname, '..', 'serviceAccountKey.json');

try {
  const serviceAccount = require(keyPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (err) {
  console.error('Cannot load serviceAccountKey.json. Place your service account JSON at:', keyPath);
  process.exit(1);
}

const uid = process.argv[2];
if (!uid) {
  console.error('Usage: node scripts/set-admin.js <UID>');
  process.exit(1);
}

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log('Custom claim set for', uid);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error setting custom claim:', err);
    process.exit(1);
  });
