import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { CoramAppProvider } from './app/CoramAppContext';
import { createCoramQueryClient } from './app/queryClient';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppRouter } from './routes/AppRouter';
import { SponsorProvider } from './features/sponsors/SponsorProvider';

export default function App() {
  const [queryClient] = useState(createCoramQueryClient);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <CoramAppProvider>
          <SponsorProvider><AppRouter /></SponsorProvider>
        </CoramAppProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
