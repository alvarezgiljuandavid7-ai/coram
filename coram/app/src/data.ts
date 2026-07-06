import { Corario, Course, Resource, MentorshipSession, Sponsor, UserProfile, DashboardMetric } from './types';

export const initialCorarios: Corario[] = [
  {
    id: 'cor-1',
    title: 'Yo tengo un Dios muy, muy grande',
    category: 'Avivamiento',
    key: 'G',
    tempo: 135,
    author: 'Tradicional Pentecostal',
    lyrics: `[Intro]
G - C - D - G

[Estrofa 1]
    G                       C
Yo tengo un Dios muy, muy, muy grande,
    D                     G
Maravilloso, que siempre está conmigo.
    G                       C
Él no me deja solo, en la tormenta,
    D                     G
Su mano fuerte me da abrigo.

[Coro]
      G                  C
Y si le canto, Él me responde,
      D                    G
Y si le alabo, desciende el fuego,
      G                  C
Y si le adoro con toda el alma,
         D                     G
Se van las dudas y viene el consuelo.

[Estrofa 2]
    G                       C
No hay gigante que pueda vencerme,
    D                     G
Pues mi Señor pelea la batalla,
    G                       C
Su Santo Espíritu llena mi vida,
    D                     G
Su fiel Palabra nunca falla.`,
    isPremium: false
  },
  {
    id: 'cor-2',
    title: 'Como Jericó (Las Murallas Caerán)',
    category: 'Avivamiento',
    key: 'Am',
    tempo: 140,
    author: 'Letra Tradicional / Arreglos Angie MZ',
    lyrics: `[Intro]
Am - F - G - Am

[Estrofa 1]
    Am                       F
Siete vueltas daremos al gran enemigo,
    G                        Am
Con grito de júbilo y gran clamor.
    Am                       F
No valen espadas, no valen escudos,
    G                        Am
Pues la victoria la da el Señor.

[Coro]
          Am                F
¡Como Jericó, las murallas caerán!
          G                 Am
¡Como Jericó, la victoria vendrá!
          Am                F
Alza tu voz, no dejes de cantar,
          G                       Am
Que el poder del Santo está en este lugar.

[Puente]
   Am                 F
El arca va al frente, los sacerdotes tocan,
     G               Am
Las trompetas suenan, la fe se despierta.
   Am                  F
¡Grita con fuerza, que el muro se rompe,
     G                 Am
Y el enemigo huye con vergüenza!`,
    isPremium: false
  },
  {
    id: 'cor-3',
    title: 'Una Mirada de Fe',
    category: 'Adoración',
    key: 'C',
    tempo: 85,
    author: 'Clásico de Adoración Pentecostal',
    lyrics: `[Estrofa 1]
C                    G
Una mirada de fe, una mirada de fe,
                      C
Es la que puede salvar al pecador (Am)
C                    C7             F
Porque una mirada de fe puesta en el Salvador,
       C           G             C
Es la que puede salvar al pecador.

[Coro]
        C                     G
¡Y si tú miras a Cristo, vivirás!
                           C
¡Si tú le miras hoy, salvo serás!
       C           C7            F
Porque una mirada de fe puesta en el Salvador,
       C           G             C
Es la que puede salvar al pecador.`,
    isPremium: false
  },
  {
    id: 'cor-4',
    title: 'Alabaré, Alabaré (Cadena de Coros)',
    category: 'Pentecostales',
    key: 'E',
    tempo: 130,
    author: 'Dominio Público',
    lyrics: `[Coro]
E
Alabaré, alabaré,
                    B7
Alabaré, alabaré, alabaré a mi Señor.
B7
Alabaré, alabaré,
                    E
Alabaré, alabaré, alabaré a mi Señor.

[Estrofa 1]
     E
Juan vio el número de los redimidos
                       B7
Y todos alababan al Señor.

Unos oraban, otros cantaban,
                         E
Y todos alababan al Señor.

[Estrofa 2]
     E
No hay Dios tan grande como tú,
     B7               E
No lo hay, no lo hay.
     A                E
No hay Dios que pueda hacer las obras
     B7              E
Como las que haces tú.`,
    isPremium: false
  },
  {
    id: 'cor-5',
    title: 'Jehová está en su Templo',
    category: 'Coros antiguos',
    key: 'Dm',
    tempo: 120,
    author: 'Tradicional',
    lyrics: `[Estrofa 1]
    Dm
Jehová está en su templo,
                  A7
Alabadle que Él vive.
    A7
Jehová está en su templo,
                  Dm
Alabadle que Él vive.

[Coro]
   D7               Gm
Alabadle, alabadle, alabadle que Él vive.
   C7               F          A7
Alabadle, alabadle, alabadle que Él vive.
   Dm               A7         Dm
Alabadle, alabadle, alabadle que Él vive.

[Estrofa 2]
    Dm
Fuego ha descendido,
                  A7
Fuego del altar divino.
    A7
Fuego ha descendido,
                  Dm
Fuego del altar divino.`,
    isPremium: true
  },
  {
    id: 'cor-6',
    title: 'Siento la Unción de tu Santo Espíritu',
    category: 'Adoración',
    key: 'F',
    tempo: 75,
    author: 'Angie MZ Composiciones',
    lyrics: `[Estrofa 1]
F                         C
Siento la unción de tu Santo Espíritu,
Dm                        Bb
Rompiento ataduras en este altar,
F                          C
Siento tu paz como un río fluyendo,
Dm                            Bb
Y un gran renuevo que me hace cantar.

[Coro]
      F               C
Ven y lléname, ven y lléname,
      Dm              Bb
Espíritu Santo consuélame.
      F               C
En mi debilidad me das poder,
       Dm               Bb       F
Para vencer, para creer, vuelvo a nacer.`,
    isPremium: true
  },
  {
    id: 'cor-7',
    title: 'Me Gozaré en Jehová (Avivamiento Puro)',
    category: 'Evangelísticos',
    key: 'Em',
    tempo: 145,
    author: 'Tradicional',
    lyrics: `[Estrofa 1]
   Em                  Am
Me gozaré en Jehová, me alegraré,
   B7               Em
En el Dios de mi salvación.
   Em                  Am
Me gozaré en Jehová, me alegraré,
   B7               Em
En el Dios de mi salvación.

[Coro]
   Em               Am
Y mi boca cantará, mis manos batirán,
  D                  G      B7
Y en su santo monte yo danzaré.
   Em               Am
Y mi boca cantará, mis manos batirán,
  B7                 Em
Pues la victoria Él me entregará.`,
    isPremium: false
  },
  {
    id: 'cor-8',
    title: 'Glorioso Intercambio (Nuevos Coros de Alabanza)',
    category: 'Coros nuevos',
    key: 'C',
    tempo: 90,
    author: 'Ministerio CorAM',
    lyrics: `[Estrofa 1]
  C                       F
En la cruz humillado, mi culpa cargó,
  Am                      G
La gracia excelsa mi vida compró.
  C                       F
Por sus heridas sanidad tengo hoy,
  Am                      G
Soy hijo del Rey, justificado estoy.

[Coro]
   F                 C
¡Oh glorioso intercambio de amor!
   G                 Am
Él tomó mi pecado, me entregó su esplendor.
   F                 C
Hoy me rindo delante de Ti,
   G                 C
Jesucristo mi Rey, todo te lo di.`,
    isPremium: true
  }
];

export const initialCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Técnica Vocal y Unción en el Altar',
    instructor: 'Angie MZ',
    duration: '12 Clases • 8 horas',
    isPremium: false,
    description: 'Aprende a cuidar tu voz, técnicas de respiración diafragmática aplicadas al canto en vivo y cómo guiar la adoración con excelencia técnica y espiritual.',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?q=80&w=600&auto=format&fit=crop&referrerpolicy=no-referrer',
    syllabus: [
      { id: '1-1', title: 'Introducción al Cuidado Vocal del Ministro de Alabanza', duration: '35m', isPreview: true },
      { id: '1-2', title: 'Apoyo Diafragmático: El Motor de la Voz', duration: '45m', isPreview: true },
      { id: '1-3', title: 'Afinación y Modulación Teatral en Tiempos de Clamor', duration: '50m', isPreview: false },
      { id: '1-4', title: 'Manejo del Pánico Escénico y Conexión Espiritual', duration: '40m', isPreview: false }
    ]
  },
  {
    id: 'course-2',
    title: 'Dirección Dinámica de Alabanza y Corarios',
    instructor: 'Angie MZ',
    duration: '15 Clases • 10 horas',
    isPremium: true,
    description: 'Aprende teoría matemática detrás de las cadenas de coros (tempos, tonalidades relativas, ritmos de marchas pentecostales y transiciones impecables).',
    rating: 5.0,
    imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=600&auto=format&fit=crop&referrerpolicy=no-referrer',
    syllabus: [
      { id: '2-1', title: 'Estructura de un Córter / Cadena de Alabanza', duration: '40m', isPreview: true },
      { id: '2-2', title: 'Modulaciones armónicas sin baches en el teclado', duration: '55m', isPreview: false },
      { id: '2-3', title: 'Lectura de la atmósfera y guiatura del remanso', duration: '60m', isPreview: false },
      { id: '2-4', title: 'Dirección visual señalamiento de coros para la banda', duration: '45m', isPreview: false }
    ]
  },
  {
    id: 'course-3',
    title: 'Armonía y Piano Moderno de Iglesia',
    instructor: 'David Alvarez (Invitado)',
    duration: '20 Clases • 14 horas',
    isPremium: true,
    description: 'Transforma tus acordes básicos tríadas en sonoridades ricas (maj9, min11, voicing suspendido y acordes de paso gospel para levantar un culto celestial).',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=600&auto=format&fit=crop&referrerpolicy=no-referrer',
    syllabus: [
      { id: '3-1', title: 'El piano como colchón y conductor de adoración', duration: '50m', isPreview: true },
      { id: '3-2', title: 'Acordes de sus4 y acordes de novena de paso', duration: '45m', isPreview: false },
      { id: '3-3', title: 'El circulo de cuartas y quintas para coros rápidos', duration: '60m', isPreview: false }
    ]
  },
  {
    id: 'course-4',
    title: 'Liderazgo y Orden en Ministerios de Alabanza',
    instructor: 'Angie MZ',
    duration: '8 Clases • 5 horas',
    isPremium: false,
    description: 'Cómo organizar ensayos eficientes, resolver conflictos entre músicos, planificar el rol anual y establecer un estándar de consagración ordenado y excelente.',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop&referrerpolicy=no-referrer',
    syllabus: [
      { id: '4-1', title: 'Misión celestial de un Ministerio de Alabanza', duration: '30m', isPreview: true },
      { id: '4-2', title: 'Ensayos Planificados: Disciplina Vs. Desorden', duration: '45m', isPreview: true },
      { id: '4-3', title: 'Resolución de Conflictos en Base al Amor y la Palabra', duration: '40m', isPreview: false }
    ]
  }
];

export const initialResources: Resource[] = [
  {
    id: 'res-1',
    title: 'Manual de Técnicas de Respiración Diafragmática',
    category: 'Guías Prácticas',
    description: 'Guía paso a paso con ilustraciones de la anatomía vocal y ejercicios diarios de 15 minutos para ampliar tu rango vocal y resistencia en vigilias.',
    fileSize: '4.8 MB (PDF)',
    downloadsCount: 1540,
    isPremium: false
  },
  {
    id: 'res-2',
    title: 'Cancionero Consolidado CorAM con Acordes Completos',
    category: 'PDF Acordes',
    description: 'El compendio definitivo de 150 coros tradicionales y nuevos en PDF con diagramas de acordes para teclado, guitarra y bajo.',
    fileSize: '12.5 MB (PDF)',
    downloadsCount: 3200,
    isPremium: true
  },
  {
    id: 'res-3',
    title: 'Pack de Pad Ambientales en los 12 Tonos Colectivos',
    category: 'Pistas / Audio',
    description: 'Pistas de sintetizador ambientales fluidas (Pads continuos) de 10 minutos por cada nota para servir de fondo acústico de adoración, oración y predicación.',
    fileSize: '145 MB (ZIP/WAV)',
    downloadsCount: 940,
    isPremium: true
  },
  {
    id: 'res-4',
    title: 'Guía del Director de Alabanza: Plantilla de Ensayos',
    category: 'Guías Prácticas',
    description: 'Planilla imprimible y plantilla de Notion para estructurar ensayos del ministerio, listas de cantos semanales y asignación de coros solistas.',
    fileSize: '2.1 MB (PDF/Notion)',
    downloadsCount: 810,
    isPremium: false
  }
];

export const mentorshipSessions: MentorshipSession[] = [
  {
    id: 'ment-1',
    title: 'Mentoría Privada 1-a-1 de Canto y Dirección con Angie MZ',
    coach: 'Angie MZ',
    benefits: [
      'Análisis personalizado de tu rango vocal y debilidades.',
      'Simulación en vivo de dirección de cánticos y corrección en tiempo real.',
      'Soporte directo por WhatsApp por 30 días para resolver dudas operativas.',
      'Acceso gratuito garantizado a 2 cursos premium de CorAM.'
    ],
    price: '$49.99 / Sesión',
    duration: '60 Minutos vía Zoom',
    whatsAppMsg: 'Hola Angie, me gustaría agendar una Sesión Privada de Mentoría 1-a-1 de Canto y Dirección. ¿Cuál es la disponibilidad?'
  },
  {
    id: 'ment-2',
    title: 'Auditoría Técnica y Espiritual para Ministros Colectivos',
    coach: 'Angie MZ & Profesores Invitados',
    benefits: [
      'Reunión zoom con TODA la banda y cantores de tu iglesia.',
      'Auditoría visual de videos de tus cultos para pulir acoples y microfonía.',
      'Diseño personalizado de un plan de ensayos semestral.',
      'Material didáctico exclusivo para tu congregación.'
    ],
    price: '$120.00 / Plan Grupal',
    duration: '2 Sesiones de 90 Mins',
    whatsAppMsg: 'Hola Angie, quiero solicitar una Auditoría Exclusiva para el Ministerio de Alabanza de mi congregación. Deseo información de fechas.'
  }
];

export const sponsorsList: Sponsor[] = [
  {
    id: 'spon-1',
    name: 'Gospel Sound Store',
    category: 'Instrumentos y Accesorios',
    logoUrl: '🎹',
    promoText: '15% DE DESCUENTO en teclados y controladores con el código CORAM15.'
  },
  {
    id: 'spon-2',
    name: 'Selah Micrófonos',
    category: 'Equipos de Audio',
    logoUrl: '🎙️',
    promoText: 'Envíos gratuitos a toda Latinoamérica en sistemas de monitoreo y microfonía inalámbrica.'
  },
  {
    id: 'spon-3',
    name: 'Sion Academy',
    category: 'Formación Musical Afiliada',
    logoUrl: '🎸',
    promoText: 'Alianza exclusiva: 1 mes gratuito en cursos virtuales de guitarra y bajo de Sion.'
  }
];

export const mockDashboardMetrics: DashboardMetric = {
  usersCount: 8430,
  activeToday: 1354,
  premiumSubscribers: 1240,
  conversionRate: 14.7,
  revenueThisMonth: 12400
};

export const initialUserProfile: UserProfile = {
  name: 'Hermano Juan Gil',
  email: 'alvarezgiljuandavid7@gmail.com',
  authProvider: 'Google',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop&referrerpolicy=no-referrer',
  isPremium: false,
  favoriteCorarios: ['cor-1', 'cor-3'],
  enrolledCourses: ['course-1']
};

export const mockUsersForAdmin = [
  { name: 'Diana Ortega', email: 'diana.or@gloria.com', country: 'Guatemala', type: 'Premium', joinDate: '2026-05-12' },
  { name: 'Hno. Marcos Pérez', email: 'marcos77@gmail.com', country: 'El Salvador', type: 'Gratuito', joinDate: '2026-06-01' },
  { name: 'Angie MZ', email: 'contacto@angiemz.com', country: 'Colombia', type: 'Premium', joinDate: '2025-01-10' },
  { name: 'María Esther Luna', email: 'estherl@live.com', country: 'México', type: 'Premium', joinDate: '2026-04-20' },
  { name: 'Héctor Carranza', email: 'hector.bajo@outlook.com', country: 'Perú', type: 'Gratuito', joinDate: '2026-06-03' },
  { name: 'Juan David Alvarez', email: 'alvarezgiljuandavid7@gmail.com', country: 'Colombia', type: 'Gratuito', joinDate: '2026-06-08' }
];

export const adCampanas = [
  { id: 'ad-1', title: 'Banner Campamento Pentecostal 2026', views: 8900, clicks: 1200, status: 'Activa' },
  { id: 'ad-2', title: 'Promo Lanzamiento CorAM Premium Angie MZ', views: 15400, clicks: 3400, status: 'Activa' },
  { id: 'ad-3', title: 'Patrocinios Gospel Sound Store Mayo', views: 7800, clicks: 650, status: 'Finalizada' }
];
