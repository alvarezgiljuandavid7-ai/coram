import instrumentImage from '../../../assets/images/corarios-library-instrument.jpg';
import scoreImage from '../../../assets/images/corarios-library-score.jpg';
import worshipImage from '../../../assets/images/corarios-library-worship.jpg';

export interface CorariosHeroSlide {
  badge: string;
  title: string;
  description: string;
  action: string;
  to: string;
  image: string;
  imagePosition: string;
}

export const corariosHeroSlides: CorariosHeroSlide[] = [
  {
    badge: 'Biblioteca activa',
    title: 'Repertorio que inspira y edifica',
    description: 'Accede a letras completas, acordes y tonos para cada momento.',
    action: 'Explorar colección',
    to: '/app/colecciones',
    image: scoreImage,
    imagePosition: 'center',
  },
  {
    badge: 'Preparación musical',
    title: 'Tu repertorio, listo para servir',
    description: 'Organiza canciones para cada ensayo y guarda las que más ministran.',
    action: 'Ver favoritos',
    to: '/app/favoritos',
    image: instrumentImage,
    imagePosition: 'right center',
  },
  {
    badge: 'Voz y alabanza',
    title: 'Ensaya con intención',
    description: 'Encuentra herramientas para preparar tu voz y tu oído musical.',
    action: 'Abrir herramientas',
    to: '/app/herramientas',
    image: worshipImage,
    imagePosition: 'center',
  },
];

export function getCorariosHeroSlideIndex(current: number, direction: -1 | 1, total: number) {
  if (total <= 0) {
    return 0;
  }

  return (current + direction + total) % total;
}
