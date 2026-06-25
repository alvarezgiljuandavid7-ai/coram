import { useEffect, useState } from 'react';
import type { Corario } from '../../../types';

export const corariosScreens = ['corarios-list', 'corario-detail'] as const;

interface UseCorariosModuleOptions {
  selectedCorario: Corario | null;
}

export function useCorariosModule({ selectedCorario }: UseCorariosModuleOptions) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todo');
  const [transposeOffset, setTransposeOffset] = useState<number>(0);
  const [fontSize, setFontSize] = useState<number>(15);
  const [metronomeBPM, setMetronomeBPM] = useState<number>(90);

  useEffect(() => {
    if (selectedCorario) {
      setMetronomeBPM(selectedCorario.tempo || 90);
    }
  }, [selectedCorario]);

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    transposeOffset,
    setTransposeOffset,
    fontSize,
    setFontSize,
    metronomeBPM,
    setMetronomeBPM,
  };
}
