import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Remove or comment out the service worker registration for now
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/service-worker.js')
//     .then((registration) => {
//       console.log('ServiceWorker registration successful');
//     })
//     .catch((error) => {
//       console.log('ServiceWorker registration failed:', error);
//     });
//   });
// }
