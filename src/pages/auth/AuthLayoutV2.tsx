import type { ReactNode } from 'react';
import { BookOpenCheck, Music2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CoramLogo } from '../../components/CoramLogo';
import styles from './AuthLayoutV2.module.css';

export function AuthLayoutV2({ children }: { children: ReactNode }) {
  return (
    <main className={styles.canvas}>
      <div className={styles.frame}>
        <section className={styles.editorialPanel} aria-label="Bienvenida a CorAM">
          <Link to="/" className={styles.brandLink} aria-label="Ir al inicio publico de CorAM">
            <CoramLogo variant="icon" size={56} className="rounded-2xl" />
            <span>
              <strong>CorAM</strong>
              <small>Musica · Alabanza · Formacion</small>
            </span>
          </Link>

          <div className={styles.editorialCopy}>
            <p className={styles.eyebrow}>Acceso seguro</p>
            <h1>Tu ministerio, listo para continuar.</h1>
            <span className={styles.rule} />
            <p className={styles.bodyCopy}>Organiza letras, himnos, herramientas y formacion desde un mismo lugar, con una experiencia pensada para servir.</p>
          </div>

          <div className={styles.editorialNotes} aria-hidden="true">
            <span><Music2 /> Biblioteca musical</span>
            <span><BookOpenCheck /> Formacion continua</span>
            <span><Sparkles /> Preparacion vocal</span>
          </div>
        </section>

        <section className={styles.formPanel} aria-label="Acceso a CorAM">
          <div className={styles.mobileBrand}>
            <Link to="/" className={styles.brandLink} aria-label="Ir al inicio publico de CorAM">
              <CoramLogo variant="icon" size={52} className="rounded-2xl" />
              <span><strong>CorAM</strong><small>Musica · Alabanza · Formacion</small></span>
            </Link>
          </div>
          <div className={styles.formContent}>{children}</div>
        </section>
      </div>
    </main>
  );
}
