import { useState } from 'react';

export const perfilScreens = ['profile'] as const;

interface UsePerfilModuleOptions {
  showToast: (message: string) => void;
}

export function usePerfilModule({ showToast }: UsePerfilModuleOptions) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('coram_dark_mode') === 'true';
    } catch {
      return false;
    }
  });

  const toggleDarkMode = () => {
    setIsDarkMode((current) => {
      const next = !current;
      try {
        localStorage.setItem('coram_dark_mode', String(next));
      } catch {
        // localStorage may be unavailable in restricted browser contexts.
      }
      showToast(next ? 'Modo Oscuro Activado' : 'Modo Claro Activado');
      return next;
    });
  };

  return { isDarkMode, toggleDarkMode };
}
