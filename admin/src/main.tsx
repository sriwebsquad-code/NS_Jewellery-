import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css'; // Assuming Tailwind is configured here
import { GoogleOAuthProvider } from '@react-oauth/google';

const rootElement = document.getElementById('app');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-client-id.apps.googleusercontent.com'}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
