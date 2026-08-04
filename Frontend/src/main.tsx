import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

async function enableMocking() {
  if (import.meta.env.VITE_USE_MOCK_API !== 'true') return;

  const { worker } = await import('./mocks/browser');
  return worker.start({
    onUnhandledRequest: 'bypass', // Don't warn for non-API requests
  });
}

void enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});

