import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, CirclePlay, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getFeedPostHref, listPublishedFeedPosts, type FeedPost } from '../../domain/feed/feedRepository';
import { CoramLogo } from '../../components/CoramLogo';
import styles from './FeedPage.module.css';

type FeedLoadState = 'loading' | 'ready' | 'unavailable';

export function FeedPage() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loadState, setLoadState] = useState<FeedLoadState>('loading');

  useEffect(() => {
    let active = true;

    void listPublishedFeedPosts()
      .then((nextPosts) => {
        if (!active) return;
        setPosts(nextPosts);
        setLoadState('ready');
      })
      .catch(() => {
        if (active) setLoadState('unavailable');
      });

    return () => {
      active = false;
    };
  }, []);

  if (loadState === 'loading') return <FeedState title="Preparando el feed" body="Cargando historias seleccionadas por CorAM." />;
  if (loadState === 'unavailable') return <FeedState title="Feed en preparacion" body="El feed se activara cuando su migracion de Supabase este disponible." />;
  if (posts.length === 0) return <FeedState title="Pronto habra algo nuevo" body="El equipo de CorAM esta preparando las primeras historias para este espacio." />;

  return (
    <main className={styles.feed} aria-label="Feed curado de CorAM">
      <FeedHeader />
      {posts.map((post) => <FeedPostCard key={post.id} post={post} />)}
    </main>
  );
}

function FeedHeader() {
  return (
    <header className={styles.header}>
      <Link to="/app/inicio" className={styles.backLink}><ArrowLeft className="h-4 w-4" /> Inicio</Link>
      <div className={styles.feedBrand}><CoramLogo variant="icon" size={34} /><span>CorAM Feed</span></div>
    </header>
  );
}

function FeedState({ title, body }: { title: string; body: string }) {
  return (
    <main className={styles.state}>
      <FeedHeader />
      <div className={styles.stateContent}>
        <Sparkles className="h-8 w-8 text-[#d7a934]" />
        <p className={styles.eyebrow}>Feed curado</p>
        <h1>{title}</h1>
        <p>{body}</p>
        <Link to="/app/inicio" className={styles.stateAction}>Volver al inicio</Link>
      </div>
    </main>
  );
}

function FeedPostCard({ post }: { post: FeedPost }) {
  const href = getFeedPostHref(post.ctaUrl);
  const publishedDate = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' }).format(new Date(post.publishedAt));
  const action = href ? <FeedPostAction href={href} label={post.ctaLabel || 'Abrir'} /> : null;

  return (
    <article className={styles.post}>
      <FeedPostMedia post={post} />
      <div className={styles.shade} />
      <div className={styles.postContent}>
        <p className={styles.meta}>{post.authorName} <span aria-hidden="true">/</span> <time dateTime={post.publishedAt}>{publishedDate}</time></p>
        <h1>{post.title}</h1>
        {post.body && <p className={styles.body}>{post.body}</p>}
        {action}
      </div>
      <div className={styles.progress} aria-hidden="true" />
    </article>
  );
}

function FeedPostMedia({ post }: { post: FeedPost }) {
  if (!post.mediaUrl) return <div className={styles.mediaFallback}><CirclePlay className="h-12 w-12" /></div>;
  if (post.mediaType === 'video') return <video className={styles.media} src={post.mediaUrl} autoPlay muted loop playsInline preload="metadata" />;
  return <img className={styles.media} src={post.mediaUrl} alt="" />;
}

function FeedPostAction({ href, label }: { href: string; label: string }) {
  const content = <>{label}<ArrowUpRight className="h-4 w-4" /></>;
  return href.startsWith('/')
    ? <Link to={href} className={styles.action}>{content}</Link>
    : <a href={href} target="_blank" rel="noreferrer" className={styles.action}>{content}</a>;
}
