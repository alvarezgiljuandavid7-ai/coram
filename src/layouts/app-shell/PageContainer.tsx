import type { ReactNode } from 'react';
import type { PageContainerMode } from './appNavigation';
import styles from './AppShellV2.module.css';

export function PageContainer({ children, mode }: { children: ReactNode; mode: PageContainerMode }) {
  const className = mode === 'edge-to-edge'
    ? styles.edgeContainer
    : mode === 'wide'
      ? styles.wideContainer
      : styles.standardContainer;

  return <div data-shell-page-container={mode} className={className}>{children}</div>;
}
