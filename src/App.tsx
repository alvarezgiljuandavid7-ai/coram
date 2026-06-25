import { CoramAppProvider } from './app/CoramAppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppRouter } from './routes/AppRouter';

export default function App() {
  return (
    <ErrorBoundary>
      <CoramAppProvider>
        <AppRouter />
      </CoramAppProvider>
    </ErrorBoundary>
  );
}
