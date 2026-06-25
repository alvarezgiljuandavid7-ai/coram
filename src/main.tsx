import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { reportError } from './domain/observability/observabilityRepository.ts';
import './index.css';

window.addEventListener('error', (event) => {
  console.error(JSON.stringify({ level: 'error', message: event.message, stack: event.error?.stack, route: window.location.pathname }));
  void reportError({
    severity: 'error',
    message: event.message,
    stack: event.error?.stack,
  });
});

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
  console.error(JSON.stringify({ level: 'error', message: reason.message, stack: reason.stack, route: window.location.pathname }));
  void reportError({
    severity: 'error',
    message: reason.message,
    stack: reason.stack,
  });
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
