import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Add this check before registering service worker
if ('serviceWorker' in navigator) {
  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/'
    });
    console.log('ServiceWorker registration successful');
  } catch (error) {
    console.log('ServiceWorker registration failed:', error);
  }
}
