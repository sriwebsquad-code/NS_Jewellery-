const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'nsjewellery-53b2d.appspot.com'
});

const bucket = admin.storage().bucket();
const file = bucket.file('test.txt');

file.save('hello world', { contentType: 'text/plain' })
  .then(() => {
    console.log('Upload successful!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Upload failed:', err);
    process.exit(1);
  });
