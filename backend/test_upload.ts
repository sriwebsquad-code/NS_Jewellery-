import { storage } from './src/config/firebase';

const file = storage.file('test.txt');

file.save('hello world', { contentType: 'text/plain' })
  .then(() => {
    console.log('Upload successful!');
    process.exit(0);
  })
  .catch((err: any) => {
    console.error('Upload failed:', err);
    process.exit(1);
  });
