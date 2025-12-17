import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Analytics } from '@vercel/analytics/react';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Only initialize Analytics if not in a local/preview environment
// This prevents the "[Vercel Web Analytics] Failed to load script" error
// because the script endpoint (/_vercel/insights/script.js) is only available on Vercel deployments.
const isProduction = typeof window !== 'undefined' && 
  !window.location.hostname.includes('localhost') && 
  !window.location.hostname.includes('127.0.0.1') &&
  !window.location.hostname.includes('webcontainer') &&
  !window.location.hostname.includes('googleusercontent.com');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
    {isProduction && <Analytics />}
  </React.StrictMode>
);