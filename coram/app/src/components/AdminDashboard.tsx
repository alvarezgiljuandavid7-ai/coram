import React, { useEffect, useState } from 'react';
import { CoramLogo } from './CoramLogo';
import {
  Users, 
  BookOpen, 
  Tv, 
  TrendingUp, 
  DollarSign, 
  Award, 
  Trash2, 
  Plus, 
  Sparkles, 
  Activity, 
  Layers, 
  Globe, 
  FileText, 
  Check, 
  Calendar,
  AlertCircle,
  FolderMinus,
  Edit2,
  ImageUp,
  Loader2,
  UploadCloud,
  Video
} from 'lucide-react';
import { Corario, Course, Resource, Sponsor, DashboardMetric, MonetizationToolSetting } from '../types';
import { applyPremiumSubscriberDelta } from '../domain/admin/metrics';
import { uploadMediaAsset } from '../domain/media/mediaAssets';
import { auditAdminAction } from '../domain/observability/observabilityRepository';
import { fetchAdvertisements } from '../domain/sponsors/sponsorsRepository';
import { useAdminDashboardTabs } from './admin/useAdminDashboardTabs';

export type AdminDashboardTab = 'overview' | 'users' | 'corarios' | 'courses' | 'ads' | 'monetize';
const DEMO_ADMIN_DATA_ENABLED = import.meta.env.DEV || import.meta.env.VITE_CORAM_ENABLE_DEMO === 'true';

export interface AdminDashboardProps {
  corarios: Corario[];
  setCorarios: React.Dispatch<React.SetStateAction<Corario[]>>;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  resources: Resource[];
  sponsors: Sponsor[];
  setSponsors: React.Dispatch<React.SetStateAction<Sponsor[]>>;
  metrics: DashboardMetric;
  setMetrics: React.Dispatch<React.SetStateAction<DashboardMetric>>;
  monetizationSettings?: MonetizationToolSetting[];
  setMonetizationSettings?: React.Dispatch<React.SetStateAction<MonetizationToolSetting[]>>;
  initialTab?: AdminDashboardTab;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  corarios,
  setCorarios,
  courses,
  setCourses,
  resources,
  sponsors,
  setSponsors,
  metrics,
  setMetrics,
  monetizationSettings = [],
  setMonetizationSettings,
  initialTab = 'overview' as AdminDashboardTab
}) => {
  // Current tab in the SaaS Dashboard
  const { activeTab, setActiveTab } = useAdminDashboardTabs(initialTab);

  // Interactive states for adding a new Corario
  const [showAddCorarioModal, setShowAddCorarioModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<Corario['category']>('Avivamiento');
  const [newKey, setNewKey] = useState<string>('G');
  const [newLyrics, setNewLyrics] = useState<string>('');
  const [newTempo, setNewTempo] = useState<number>(120);
  const [newIsPremium, setNewIsPremium] = useState<boolean>(false);

  // Search filter for lists inside the Admin Dashboard
  const [userSearchText, setUserSearchText] = useState<string>('');
  const [corarioSearchText, setCorarioSearchText] = useState<string>('');

  // Interactive users state
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminAds, setAdminAds] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;

    fetchAdvertisements()
      .then((ads) => {
        if (!isMounted) return;
        setAdminAds(
          ads.map((ad) => ({
            id: ad.id,
            title: ad.title,
            status: ad.status === 'active' ? 'Activa' : ad.status === 'ended' ? 'Finalizada' : 'Programada',
            views: ad.viewsCount,
            clicks: ad.clicksCount,
          })),
        );
      })
      .catch((error) => {
        console.error('Unable to load Supabase advertisements', error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // --- NEW INTERACTIVE STATES FOR COURSES, SPONSORS & ADS ---
  const [showCourseModal, setShowCourseModal] = useState<boolean>(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseFormTitle, setCourseFormTitle] = useState<string>('');
  const [courseFormInstructor, setCourseFormInstructor] = useState<string>('Angie MZ');
  const [courseFormDuration, setCourseFormDuration] = useState<string>('12 Clases • 8 horas');
  const [courseFormIsPremium, setCourseFormIsPremium] = useState<boolean>(false);
  const [courseFormDescription, setCourseFormDescription] = useState<string>('');
  const [courseFormImageUrl, setCourseFormImageUrl] = useState<string>('');
  const [courseFormPrice, setCourseFormPrice] = useState<string>('');
  const [courseFormOffer, setCourseFormOffer] = useState<string>('');
  const [courseFormVideoUrl, setCourseFormVideoUrl] = useState<string>('');
  const [courseFormSyllabusTxt, setCourseFormSyllabusTxt] = useState<string>('');
  const [courseImageUploading, setCourseImageUploading] = useState<boolean>(false);
  const [courseVideoUploading, setCourseVideoUploading] = useState<boolean>(false);
  const [courseMediaMessage, setCourseMediaMessage] = useState<string>('');

  const [showAdModal, setShowAdModal] = useState<boolean>(false);
  const [editingAd, setEditingAd] = useState<any | null>(null);
  const [adFormTitle, setAdFormTitle] = useState<string>('');
  const [adFormStatus, setAdFormStatus] = useState<'Activa' | 'Finalizada' | 'Programada'>('Activa');
  const [adFormViews, setAdFormViews] = useState<number>(0);
  const [adFormClicks, setAdFormClicks] = useState<number>(0);

  const [showSponsorModal, setShowSponsorModal] = useState<boolean>(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [sponsorFormName, setSponsorFormName] = useState<string>('');
  const [sponsorFormCategory, setSponsorFormCategory] = useState<string>('Instrumentos y Accesorios');
  const [sponsorFormLogoUrl, setSponsorFormLogoUrl] = useState<string>('🎹');
  const [sponsorFormPromoText, setSponsorFormPromoText] = useState<string>('');

  // Handlers
  const handleToggleUserPremium = (email: string) => {
    setAdminUsers(prevUsers => 
      prevUsers.map(u => {
        if (u.email === email) {
          const nextType = u.type === 'Premium' ? 'Gratuito' : 'Premium';
          setMetrics(prev => applyPremiumSubscriberDelta(prev, nextType === 'Premium' ? 1 : -1));
          return { ...u, type: nextType };
        }
        return u;
      })
    );
  };

  const handleCreateCorario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newLyrics) return;

    const added: Corario = {
      id: `cor-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      key: newKey,
      lyrics: newLyrics,
      tempo: newTempo,
      isPremium: newIsPremium,
      author: 'Administración'
    };

    setCorarios([added, ...corarios]);
    
    // Clear inputs and close
    setNewTitle('');
    setNewLyrics('');
    setShowAddCorarioModal(false);
    
    // Update metrics count
    setMetrics(prev => ({ ...prev, activeToday: prev.activeToday + 5 }));
    void auditAdminAction('create_corario', 'corarios', added.id, { title: added.title });
  };

  const handleDeleteCorario = (id: string) => {
    setCorarios(prev => prev.filter(c => c.id !== id));
    void auditAdminAction('delete_corario', 'corarios', id);
  };

  const handleToggleCourseType = (id: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, isPremium: !c.isPremium };
      }
      return c;
    }));
    void auditAdminAction('toggle_course_premium', 'courses', id);
  };

  // --- COURSE CRUD OPERATIONS ---
  const handleDeleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    void auditAdminAction('delete_course', 'courses', id);
  };

  const handleOpenCourseModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setCourseFormTitle(course.title);
      setCourseFormInstructor(course.instructor);
      setCourseFormDuration(course.duration);
      setCourseFormIsPremium(course.isPremium);
      setCourseFormDescription(course.description);
      setCourseFormImageUrl(course.imageUrl);
      setCourseFormPrice(course.price || '');
      setCourseFormOffer(course.offer || '');
      setCourseFormVideoUrl(course.videoUrl || '');
      // convert syllabus to newline-separated text
      const syllabusStr = course.syllabus
        ? course.syllabus.map(s => `${s.title} (${s.duration})`).join('\n')
        : '';
      setCourseFormSyllabusTxt(syllabusStr);
    } else {
      setEditingCourse(null);
      setCourseFormTitle('');
      setCourseFormInstructor('Angie MZ');
      setCourseFormDuration('12 Clases • 8 horas');
      setCourseFormIsPremium(false);
      setCourseFormDescription('');
      setCourseFormImageUrl('https://images.unsplash.com/photo-1516280440614-37939bbacd6a?q=80&w=600&auto=format&fit=crop');
      setCourseFormPrice('$24.99');
      setCourseFormOffer('20% Descuento Especial');
      setCourseFormVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      setCourseFormSyllabusTxt('Clase 1: Introducción a la Técnica Vocal (40m)\nClase 2: Ejercicios Diarios de Respiración (35m)\nClase 3: Postura y Presencia en el Altar (30m)\nClase 4: El Flujo Espiritual de la Adoración (50m)');
    }
    setCourseMediaMessage('');
    setShowCourseModal(true);
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseFormTitle || !courseFormInstructor) return;

    // Parse syllabus text
    const lines = courseFormSyllabusTxt.split('\n').filter(l => l.trim().length > 0);
    const parsedSyllabus = lines.map((line, idx) => {
      const match = line.match(/\(([^)]+)\)/);
      const duration = match ? match[1] : '35m';
      const cleanTitle = line.replace(/\([^)]+\)/, '').trim();
      return {
        id: `sys-${Date.now()}-${idx}`,
        title: cleanTitle,
        duration,
        isPreview: idx === 0
      };
    });

    if (editingCourse) {
      setCourses(prev => prev.map(c => {
        if (c.id === editingCourse.id) {
          return {
            ...c,
            title: courseFormTitle,
            instructor: courseFormInstructor,
            duration: courseFormDuration,
            isPremium: courseFormIsPremium,
            description: courseFormDescription,
            imageUrl: courseFormImageUrl,
            price: courseFormPrice || undefined,
            offer: courseFormOffer || undefined,
            videoUrl: courseFormVideoUrl || undefined,
            syllabus: parsedSyllabus.length > 0 ? parsedSyllabus : c.syllabus
          };
        }
        return c;
      }));
    } else {
      const newCourse: Course = {
        id: `course-${Date.now()}`,
        title: courseFormTitle,
        instructor: courseFormInstructor,
        duration: courseFormDuration,
        isPremium: courseFormIsPremium,
        description: courseFormDescription,
        rating: 4.9,
        imageUrl: courseFormImageUrl || 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?q=80&w=600&auto=format&fit=crop',
        syllabus: parsedSyllabus.length > 0 ? parsedSyllabus : [
          { id: `${Date.now()}-1`, title: 'Introducción del Curso', duration: '20m', isPreview: true }
        ],
        price: courseFormPrice || undefined,
        offer: courseFormOffer || undefined,
        videoUrl: courseFormVideoUrl || undefined
      };
      setCourses(prev => [...prev, newCourse]);
    }

    setShowCourseModal(false);
    setEditingCourse(null);
  };

  const handleUploadCourseImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    setCourseImageUploading(true);
    setCourseMediaMessage('');

    try {
      const uploaded = await uploadMediaAsset({
        file,
        bucketId: 'course-images',
        assetType: 'image',
        visibility: 'public',
        linkedEntityType: 'course',
        linkedEntityId: editingCourse?.id,
      });

      if (uploaded.publicUrl) {
        setCourseFormImageUrl(uploaded.publicUrl);
      }

      setCourseMediaMessage('Portada subida a Supabase Storage.');
    } catch (error) {
      setCourseMediaMessage(error instanceof Error ? error.message : 'No se pudo subir la portada.');
    } finally {
      setCourseImageUploading(false);
    }
  };

  const handleUploadCourseVideo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    setCourseVideoUploading(true);
    setCourseMediaMessage('');

    try {
      const uploaded = await uploadMediaAsset({
        file,
        bucketId: 'course-videos',
        assetType: 'video',
        visibility: courseFormIsPremium ? 'premium' : 'private',
        linkedEntityType: 'course',
        linkedEntityId: editingCourse?.id,
      });

      setCourseFormVideoUrl(`supabase://course-videos/${uploaded.objectPath}`);
      setCourseMediaMessage('Video subido a Supabase Storage. Quedó privado y listo para acceso protegido.');
    } catch (error) {
      setCourseMediaMessage(error instanceof Error ? error.message : 'No se pudo subir el video.');
    } finally {
      setCourseVideoUploading(false);
    }
  };

  // --- SPONSOR CRUD OPERATIONS ---
  const handleDeleteSponsor = (id: string) => {
    setSponsors(prev => prev.filter(sp => sp.id !== id));
  };

  const handleOpenSponsorModal = (sponsor?: Sponsor) => {
    if (sponsor) {
      setEditingSponsor(sponsor);
      setSponsorFormName(sponsor.name);
      setSponsorFormCategory(sponsor.category);
      setSponsorFormLogoUrl(sponsor.logoUrl);
      setSponsorFormPromoText(sponsor.promoText);
    } else {
      setEditingSponsor(null);
      setSponsorFormName('');
      setSponsorFormCategory('Instrumentos y Accesorios');
      setSponsorFormLogoUrl('🎹');
      setSponsorFormPromoText('Nueva promoción especial para miembros del ministerio.');
    }
    setShowSponsorModal(true);
  };

  const handleSaveSponsor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorFormName) return;

    if (editingSponsor) {
      setSponsors(prev => prev.map(sp => {
        if (sp.id === editingSponsor.id) {
          return {
            ...sp,
            name: sponsorFormName,
            category: sponsorFormCategory,
            logoUrl: sponsorFormLogoUrl,
            promoText: sponsorFormPromoText
          };
        }
        return sp;
      }));
    } else {
      const newSp: Sponsor = {
        id: `spon-${Date.now()}`,
        name: sponsorFormName,
        category: sponsorFormCategory,
        logoUrl: sponsorFormLogoUrl,
        promoText: sponsorFormPromoText
      };
      setSponsors(prev => [...prev, newSp]);
    }
    setShowSponsorModal(false);
    setEditingSponsor(null);
  };

  // --- AD CAMPAIGN CRUD OPERATIONS ---
  const handleDeleteAd = (id: string) => {
    setAdminAds(prev => prev.filter(ad => ad.id !== id));
  };

  const handleOpenAdModal = (ad?: any) => {
    if (ad) {
      setEditingAd(ad);
      setAdFormTitle(ad.title);
      setAdFormStatus(ad.status);
      setAdFormViews(ad.views);
      setAdFormClicks(ad.clicks);
    } else {
      setEditingAd(null);
      setAdFormTitle('');
      setAdFormStatus('Activa');
      setAdFormViews(0);
      setAdFormClicks(0);
    }
    setShowAdModal(true);
  };

  const handleSaveAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adFormTitle) return;

    if (editingAd) {
      setAdminAds(prev => prev.map(ad => {
        if (ad.id === editingAd.id) {
          return {
            ...ad,
            title: adFormTitle,
            status: adFormStatus,
            views: adFormViews,
            clicks: adFormClicks
          };
        }
        return ad;
      }));
    } else {
      const newAd = {
        id: `ad-${Date.now()}`,
        title: adFormTitle,
        status: adFormStatus,
        views: adFormViews,
        clicks: adFormClicks
      };
      setAdminAds(prev => [...prev, newAd]);
    }
    setShowAdModal(false);
    setEditingAd(null);
  };

  return (
    <div id="coram-admin-dashboard" className="w-full bg-[#FAF9F6] border border-slate-200/60 rounded-3xl overflow-hidden shadow-xl flex flex-col lg:flex-row h-full min-h-[640px]">
      
      {/* Sidebar de Navegación SaaS */}
      <div className="w-full lg:w-60 bg-[#0B2545] text-slate-200 p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          
          {/* Dashboard Premium Brand Header */}
          <div className="flex items-center space-x-2.5 pb-4 border-b border-white/10">
            <CoramLogo variant="icon" size={34} className="shrink-0" />
            <div>
              <span className="font-serif font-black text-white text-md tracking-tight block">CorAM SaaS</span>
              <span className="text-[9px] text-[#D4AF37] tracking-widest block uppercase font-bold">Portal del Administrador</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {[
              { id: 'overview', label: 'Estadísticas', icon: Activity },
              { id: 'users', label: 'Usuarios & Membresías', icon: Users },
              { id: 'corarios', label: 'Gestión de Corarios', icon: BookOpen },
              { id: 'courses', label: 'Academia & Cursos', icon: Layers },
              { id: 'ads', label: 'Publicidad & Sponsors', icon: Tv },
              { id: 'monetize', label: 'Acceso y Monetización', icon: DollarSign }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button 
                  key={tab.id}
                  id={`btn-admin-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                    isActive 
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md' 
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <TabIcon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Dynamic status card in sidebar footer */}
        <div className="mt-8 bg-slate-900/40 border border-white/5 p-3 rounded-xl">
          <div className="flex items-center space-x-1.5 justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] text-white/70 font-semibold uppercase">SISTEMA ONLINE (2026)</span>
          </div>
          <span className="text-[9px] text-slate-400 block text-center mt-1">Conectado a Firebase API</span>
        </div>

      </div>

      {/* Main Content Pane */}
      <div className="flex-1 p-6 flex flex-col overflow-y-auto bg-white">
        
        {/* Header Block bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-6 border-b border-slate-100 gap-4">
          <div>
            <h1 className="font-sans font-black text-2xl text-slate-900 tracking-tight">
              {activeTab === 'overview' && 'Consola de Control de Angie MZ'}
              {activeTab === 'users' && 'Membresías e Ingresos de CorAM'}
              {activeTab === 'corarios' && 'Manejador de Cancioneros'}
              {activeTab === 'courses' && 'Contenidos de la Academia'}
              {activeTab === 'ads' && 'Monetización y Sponsors'}
              {activeTab === 'monetize' && 'Ajustes de Acceso y Monetización'}
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Administra la experiencia móvil del ministerio en tiempo real.
            </p>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            {activeTab === 'corarios' && (
              <button 
                id="btn-admin-add-corario"
                onClick={() => setShowAddCorarioModal(true)}
                className="bg-[#0B2545] hover:bg-slate-900 text-white text-xs font-bold py-2 px-3.5 rounded-xl flex items-center space-x-1.5 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Corario</span>
              </button>
            )}
            {activeTab === 'courses' && (
              <button 
                id="btn-admin-add-course"
                onClick={() => handleOpenCourseModal()}
                className="bg-[#0B2545] hover:bg-slate-900 text-white text-xs font-bold py-2 px-3.5 rounded-xl flex items-center space-x-1.5 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Subir Curso</span>
              </button>
            )}
            {activeTab === 'ads' && (
              <div className="flex items-center space-x-1.5">
                <button 
                  id="btn-admin-add-ad"
                  onClick={() => handleOpenAdModal()}
                  className="bg-[#0B2545] hover:bg-slate-905 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center space-x-1.5 transition-all shadow-xs border border-white/10"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Subir Campaña</span>
                </button>
                <button 
                  id="btn-admin-add-sponsor"
                  onClick={() => handleOpenSponsorModal()}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold py-2 px-3 rounded-xl flex items-center space-x-1.5 transition-all shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Sponsor</span>
                </button>
              </div>
            )}
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-mono">
              UTC Local: 22:12
            </span>
          </div>
        </div>

        {/* TAB 1: OVERVIEW CONTROL PANEL */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* SaaS Metrics 4-Column Grid row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className="border border-slate-100 p-4 rounded-2xl bg-[#FAF9F6] shadow-3xs flex flex-col justify-between">
                <div>
                  <span className="text-[10.5px] font-black text-slate-500 uppercase tracking-wider block">Usuarios Colectivos</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">8,430</span>
                </div>
                <div className="flex items-center space-x-1 text-emerald-600 text-[10.5px] font-bold mt-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+12.4% este mes</span>
                </div>
              </div>

              <div className="border border-slate-100 p-4 rounded-2xl bg-[#FAF9F6] shadow-3xs flex flex-col justify-between">
                <div>
                  <span className="text-[10.5px] font-black text-slate-500 uppercase tracking-wider block">Suscripciones Activas</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">{metrics.premiumSubscribers}</span>
                </div>
                <div className="flex items-center space-x-1 text-emerald-600 text-[10.5px] font-bold mt-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Conversión 14.7%</span>
                </div>
              </div>

              <div className="border border-slate-100 p-4 rounded-2xl bg-[#FAF9F6] shadow-3xs flex flex-col justify-between">
                <div>
                  <span className="text-[10.5px] font-black text-slate-400 uppercase tracking-wider block">Ingresos Estimados</span>
                  <span className="text-2xl font-black text-slate-950 mt-1 block">${metrics.revenueThisMonth.toFixed(2)}</span>
                </div>
                <span className="text-[9.5px] text-slate-400 block mt-2 font-mono">Suscripciones + Cursos</span>
              </div>

              <div className="border border-slate-100 p-4 rounded-2xl bg-[#FAF9F6] shadow-3xs flex flex-col justify-between">
                <div>
                  <span className="text-[10.5px] font-black text-slate-405 uppercase tracking-wider block">Visitas Hoy</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">{metrics.activeToday} users</span>
                </div>
                <div className="flex items-center space-x-1 text-slate-500 text-[9.5px] font-medium mt-2">
                  <Users className="w-3.5 h-3.5" />
                  <span>Pico: 122 activos/hr</span>
                </div>
              </div>

            </div>

            {/* Custom SVG Analytics Vector Chart (Visualizer) */}
            <div className="border border-slate-100 rounded-2xl p-5 shadow-3xs bg-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-sans font-bold text-slate-900 text-sm">Crecimiento de Conversión SaaS 2026</h3>
                  <p className="text-[10px] text-slate-400">Picos de suscripciones Premium post-conferencias de Angie MZ.</p>
                </div>
                <div className="flex space-x-3 text-[10px] font-bold">
                  <span className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0B2545]"></span>
                    <span className="text-slate-600">Suscripciones directas</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]"></span>
                    <span className="text-slate-600">Cursos comprados</span>
                  </span>
                </div>
              </div>

              {/* Breathtaking responsive chart visual representation natively with SVGs */}
              <div className="w-full h-48 bg-[#FAF9F6]/60 rounded-xl relative p-2 overflow-hidden flex items-end">
                {/* SVG Vector Path line */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="500" y2="30" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="3,3" />
                  <line x1="0" y1="75" x2="500" y2="75" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="3,3" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="3,3" />

                  {/* Elegant Gradient Area */}
                  <defs>
                    <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0B2545" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#0B2545" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Under path fill */}
                  <path d="M 0 150 Q 80 110 150 90 T 300 45 T 420 25 T 500 15 L 500 150 L 0 150 Z" fill="url(#chartGlow)" />
                  
                  {/* Stroke main curve */}
                  <path d="M 0 150 Q 80 110 150 90 T 300 45 T 420 25 T 500 15" fill="none" stroke="#0B2545" strokeWidth="3" />
                  <path d="M 0 150 Q 110 130 190 110 T 340 70 T 450 55 T 500 35" fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeDasharray="4,2" />
                </svg>

                {/* Simulated x-axis months indicators */}
                <div className="absolute bottom-2 left-0 right-0 px-4 flex justify-between text-[8.5px] font-semibold text-slate-400 font-mono">
                  <span>ENE</span>
                  <span>FEB</span>
                  <span>MAR</span>
                  <span>ABR</span>
                  <span>MAY</span>
                  <span>JUN (ACTUAL)</span>
                </div>
              </div>
            </div>

            {/* Grid for activity logging and system notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Activity Log list panel */}
              <div className="border border-slate-100 p-4 rounded-xl shadow-3xs space-y-3">
                <h4 className="font-sans font-bold text-slate-800 text-xs flex items-center space-x-1.5 border-b border-slate-100 pb-2">
                  <Activity className="w-4 h-4 text-[#D4AF37]" />
                  <span>Actividades Colectivas de Suscriptores</span>
                </h4>
                
                <div className="space-y-2.5">
                  {[
                    { user: 'Hna. Diana Ortega', status: 'Se unió a CorAM Premium', log: 'Membresía anual procesada con éxito.', time: 'Hace 4 minutos' },
                    { user: 'Hno. Héctor Carranza', status: 'Favoritó Coro', log: 'Añadió "Como Jericó" a sus coros personales.', time: 'Hace 12 minutos' },
                    { user: 'María Luna', status: 'Inscripción en Curso', log: 'Inició "Técnica Vocal y Unción" de Angie MZ.', time: 'Hace 45 minutos' },
                    { user: 'Director Marcos Pérez', status: 'Descarga PDF', log: 'Descargó Cancionero Consolidado CorAM.', time: 'Hace 2 horas' }
                  ].map((act, idx) => (
                    <div key={idx} className="flex justify-between items-start text-xs border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                      <div>
                        <span className="font-bold text-slate-800 block">{act.user}</span>
                        <span className="text-[10px] text-slate-500 font-medium block">{act.status} • <span className="italic">{act.log}</span></span>
                      </div>
                      <span className="text-[8px] text-slate-400 font-mono shrink-0 whitespace-nowrap">{act.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Patrocinios & Sponsors statistics panel */}
              <div className="border border-slate-100 p-4 rounded-xl shadow-3xs space-y-3">
                <h4 className="font-sans font-bold text-slate-800 text-xs flex items-center space-x-1.5 border-b border-slate-100 pb-2">
                  <Tv className="w-4 h-4 text-[#0B2545]" />
                  <span>Rendimiento de Patrocinadores Integrados</span>
                </h4>

                <div className="space-y-3">
                  {sponsors.map((sp) => (
                    <div key={sp.id} className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl bg-white p-1 rounded-md border border-slate-200">{sp.logoUrl}</span>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block leading-tight">{sp.name}</span>
                          <span className="text-[9px] text-[#D4AF37] block font-semibold">{sp.category}</span>
                        </div>
                      </div>
                      <div className="text-right text-[10px] font-mono leading-tight">
                        <span className="font-bold text-slate-800 block">CTR 8.4%</span>
                        <span className="text-slate-400 block text-[9.5px]">240 clicks / 2,800 vistas</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: USERS & MEMBERSHIPS MANAGER */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            
            {/* Search Filter tool for Users */}
            <div className="flex items-center space-x-2">
              <input 
                type="text" 
                placeholder="Buscar usuarios por nombre, email, país o tipo..."
                value={userSearchText}
                onChange={(e) => setUserSearchText(e.target.value)}
                className="w-full bg-slate-50 text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
              />
            </div>

            {/* Responsive Table list */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-3xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                    <th className="p-3">Nombre</th>
                    <th className="p-3">Contacto</th>
                    <th className="p-2">País</th>
                    <th className="p-2">Membresía</th>
                    <th className="p-2">Registro</th>
                    <th className="p-2 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {adminUsers.filter(u => {
                    let searchLower = userSearchText.toLowerCase();
                    return u.name.toLowerCase().includes(searchLower) ||
                           u.email.toLowerCase().includes(searchLower) ||
                           u.country.toLowerCase().includes(searchLower) ||
                           u.type.toLowerCase().includes(searchLower);
                  }).map((u) => (
                    <tr key={u.email} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-800">{u.name}</td>
                      <td className="p-3 text-slate-500">{u.email}</td>
                      <td className="p-2 text-slate-600 font-medium">{u.country}</td>
                      <td className="p-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          u.type === 'Premium' 
                            ? 'bg-amber-500/10 text-slate-900 border border-amber-300' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {u.type === 'Premium' ? '★ Premium' : 'Gratuito'}
                        </span>
                      </td>
                      <td className="p-2 text-slate-400 font-mono">{u.joinDate}</td>
                      <td className="p-2 text-center">
                        <button 
                          id={`btn-toggle-membership-admin-${u.email}`}
                          onClick={() => handleToggleUserPremium(u.email)}
                          className="px-2.5 py-1 bg-[#0B2545]/5 hover:bg-[#0B2545] hover:text-white rounded-lg text-[10px] font-bold text-[#0B2545] transition-all"
                        >
                          Conmutar Plan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-orange-50 border border-orange-200 p-3 rounded-xl flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-orange-650 mt-0.5 shrink-0" />
              <p className="text-[10px] text-slate-600 leading-normal">
                <strong>¿Sabías que?</strong> Los usuarios editados arriba actualizan dinámicamente las métricas de ingresos mensuales de la aplicación en vivo. Úsalo para probar simulaciones de conversión financiera de CorAM SaaS.
              </p>
            </div>

          </div>
        )}

        {/* TAB 3: CORARIOS TABLE-BASED MANAGER WITH ADDS */}
        {activeTab === 'corarios' && (
          <div className="space-y-4">
            
            {/* Search filter for corarios */}
            <div className="flex items-center space-x-2">
              <input 
                type="text" 
                placeholder="Buscar corarios por nombre de canto..."
                value={corarioSearchText}
                onChange={(e) => setCorarioSearchText(e.target.value)}
                className="w-full bg-slate-50 text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
              />
            </div>

            {/* List of Corarios with edit/remove capability */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-3xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                    <th className="p-3">Título del Canto</th>
                    <th className="p-3">Clasificación categoría</th>
                    <th className="p-2">Tonalidad</th>
                    <th className="p-2">Ritmo BPM</th>
                    <th className="p-2">Estado Premium</th>
                    <th className="p-2 text-center">Gestión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {corarios.filter(c => c.title.toLowerCase().includes(corarioSearchText.toLowerCase())).map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-800">{c.title}</td>
                      <td className="p-3 text-slate-600">{c.category}</td>
                      <td className="p-2 font-mono text-indigo-950 font-bold">{c.key}</td>
                      <td className="p-2 font-mono text-slate-400">{c.tempo || 'N/A'}</td>
                      <td className="p-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          c.isPremium 
                            ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                            : 'bg-green-50 text-green-700'
                        }`}>
                          {c.isPremium ? 'Premium Lock' : 'Gratuito'}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <button 
                          id={`btn-delete-corario-admin-${c.id}`}
                          onClick={() => {
                            handleDeleteCorario(c.id);
                          }}
                          className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                          title="Eliminar Coro"
                        >
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Inline interactive Add Corario modal simulation */}
            {showAddCorarioModal && (
              <div 
                id="add-corario-modal-overlay"
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              >
                <div 
                  id="add-corario-modal"
                  className="bg-white p-5 rounded-2xl w-full max-w-lg shadow-2xl relative space-y-4"
                >
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="font-sans font-black text-slate-900 text-md">Agregar Nuevo Canto al Corario</h3>
                    <button 
                      id="btn-close-modal-corario"
                      onClick={() => setShowAddCorarioModal(false)}
                      className="text-slate-400 hover:text-slate-600 font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleCreateCorario} className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">TÍTULO DEL CANTO</label>
                        <input 
                          type="text" 
                          required
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="e.g. Siento tu gloria"
                          className="w-full bg-slate-50 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">CATEGORÍA</label>
                        <select 
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value as any)}
                          className="w-full bg-slate-50 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden"
                        >
                          {['Adoración', 'Avivamiento', 'Evangelísticos', 'Pentecostales', 'Coros antiguos', 'Coros nuevos'].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">RITMO BPM</label>
                        <input 
                          type="number" 
                          value={newTempo}
                          onChange={(e) => setNewTempo(Number(e.target.value))}
                          placeholder="120"
                          className="w-full bg-slate-50 text-xs px-3 py-2 rounded-lg border border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">TONALIDAD BASE</label>
                        <input 
                          type="text" 
                          value={newKey}
                          onChange={(e) => setNewKey(e.target.value)}
                          placeholder="Am"
                          className="w-full bg-slate-50 text-xs px-3 py-2 rounded-lg border border-slate-200"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <label className="text-[10px] font-bold text-slate-500 flex items-center space-x-1.5 cursor-pointer pt-4">
                          <input 
                            type="checkbox" 
                            checked={newIsPremium}
                            onChange={(e) => setNewIsPremium(e.target.checked)}
                          />
                          <span>¿Es Premium?</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">LETRA COMPLETA (MARCA LOS ACORDES [ACORDES])</label>
                      <textarea 
                        required
                        rows={6}
                        value={newLyrics}
                        onChange={(e) => setNewLyrics(e.target.value)}
                        placeholder="[Intro]&#13;Am - F - G - Am&#13;&#13;[Estrofa]&#13;Am               F&#13;Siento tu gloria en este lugar..."
                        className="w-full bg-slate-50 text-xs px-3 py-2 rounded-lg border border-slate-200 font-mono"
                      ></textarea>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                      <button 
                        type="button" 
                        id="btn-cancel-create-corario"
                        onClick={() => setShowAddCorarioModal(false)}
                        className="px-3.5 py-2 hover:bg-slate-50 text-slate-500 text-xs font-bold rounded-xl"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        id="btn-confirm-create-corario"
                        className="px-4 py-2 bg-[#0B2545] text-white text-xs font-black rounded-xl hover:bg-slate-900 shadow-md"
                      >
                        Publicar Canto
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 4: COURSES MANAGEMENT MODIFIERS */}
        {activeTab === 'courses' && (
          <div className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => (
                <div key={course.id} className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs flex flex-col sm:flex-row bg-white hover:shadow-md transition-shadow duration-200">
                  <div className="w-full sm:w-32 h-32 sm:h-auto relative shrink-0">
                    <img 
                      src={course.imageUrl} 
                      alt={course.title} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {course.offer && (
                      <span className="absolute top-2 left-2 bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wide shadow-xs">
                        {course.offer}
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] bg-amber-500/10 text-amber-700 border border-amber-500/20 font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider">{course.instructor}</span>
                        <div className="flex items-center space-x-1.5">
                          <button 
                            onClick={() => handleOpenCourseModal(course)}
                            className="p-1 text-slate-500 hover:text-[#0B2545] rounded-md hover:bg-slate-50 transition-colors"
                            title="Editar Curso"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCourse(course.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                            title="Borrar Curso"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900 tracking-tight leading-tight mt-1.5">{course.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-normal">{course.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-2 font-mono text-[9px] text-slate-400">
                        <span>⏱ {course.duration}</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-bold">💵 {course.price || '$19.99'}</span>
                        {course.videoUrl && (
                          <>
                            <span>•</span>
                            <span className="text-rose-600 font-bold">🎬 Video Activo</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-3">
                      <span className={`text-[8px] font-black uppercase ${course.isPremium ? 'text-amber-600' : 'text-green-600'}`}>
                        {course.isPremium ? '★ Premium Lock' : '✓ Gratuito'}
                      </span>
                      <button 
                        id={`btn-toggle-course-premium-admin-${course.id}`}
                        onClick={() => handleToggleCourseType(course.id)}
                        className="text-[9px] text-[#0B2545] bg-[#0B2545]/5 hover:bg-[#0B2545] hover:text-white px-2.5 py-1 rounded-md font-extrabold transition-all"
                      >
                        Hacer {course.isPremium ? 'Gratuito' : 'Premium'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-100 p-3.5 rounded-xl flex items-start space-x-2">
              <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-[10px] text-slate-600 leading-normal">
                <strong>Consola Ministerial:</strong> Agrega o actualiza los cursos para Angie MZ (asigna videos, ofertas y planes lectivos clase por clase). Cada cambio se sincroniza en tiempo real de modo que si un suscriptor móvil abre la pestaña "Cursos", accederá al instante al nuevo material.
              </p>
            </div>

          </div>
        )}

        {/* TAB 5: ADS CAMPAIGNS AND SPONSORS */}
        {activeTab === 'ads' && (
          <div className="space-y-6">
            
            <div className="space-y-3">
              <h3 className="font-sans font-black text-slate-800 text-xs uppercase tracking-wider">Campañas de Publicidad Interna</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {adminAds.map((ad) => (
                  <div key={ad.id} className="border border-slate-100 p-4 rounded-xl bg-[#FAF9F6] shadow-3xs space-y-2 text-left relative group">
                    <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenAdModal(ad)}
                        className="bg-white p-1 text-slate-600 hover:text-[#0B2545] rounded-md shadow-xs border border-slate-200 transition-colors"
                        title="Editar Campaña"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleDeleteAd(ad.id)}
                        className="bg-white p-1 text-rose-600 hover:bg-rose-50 rounded-md shadow-xs border border-slate-200 transition-colors"
                        title="Borrar Campaña"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${
                      ad.status === 'Activa' 
                        ? 'bg-emerald-150 text-emerald-800' 
                        : ad.status === 'Programada'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {ad.status}
                    </span>
                    <h5 className="font-bold text-xs text-slate-800 tracking-tight leading-snug line-clamp-2 pr-10">{ad.title}</h5>
                    <div className="flex justify-between text-[10px] font-mono font-bold text-slate-500 border-t border-slate-200/50 pt-2">
                      <span>Vistas: {ad.views}</span>
                      <span>Clicks: {ad.clicks}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-slate-100 rounded-2xl p-4 bg-white space-y-3">
              <h3 className="font-sans font-black text-slate-800 text-xs uppercase tracking-wider">Listado de Patrocinadores Integrados</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {sponsors.map(sp => (
                  <div key={sp.id} className="p-3 border border-slate-150 rounded-xl flex items-center justify-between bg-slate-50/50 relative group">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{sp.logoUrl}</span>
                      <div>
                        <h6 className="text-[10.5px] font-bold text-slate-800 block leading-tight">{sp.name}</h6>
                        <span className="text-[9px] text-[#D4AF37] block font-bold">{sp.category}</span>
                        <p className="text-[9.5px] text-slate-500 mt-0.5 line-clamp-1">{sp.promoText}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <button 
                        onClick={() => handleOpenSponsorModal(sp)}
                        className="bg-white p-1.5 text-slate-650 hover:text-[#0B2545] rounded-md shadow-xs border border-slate-200"
                        title="Editar Sponsor"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteSponsor(sp.id)}
                        className="bg-white p-1.5 text-rose-600 hover:bg-rose-50 rounded-md shadow-xs border border-slate-200"
                        title="Borrar Sponsor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* NEW VISUAL PUBLICITY PERFORMANCE ANALYTICS SECTION */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/40 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-sans font-black text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span>Reporte Analítico de Conversión Publicitaria</span>
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Estadísticas estimadas en tiempo real de clicks e impresiones en la app móvil.</p>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 font-bold px-2.5 py-1 rounded-lg border border-emerald-100/50">
                  Eficiencia de Retorno: Alta
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {adminAds.map(ad => {
                  const ctr = ad.views > 0 ? ((ad.clicks / ad.views) * 100).toFixed(1) : '0.0';
                  const percentageWidth = Math.min(100, Math.round(Number(ctr) * 4)); // scale for nice UI bar filling

                  return (
                    <div key={ad.id} className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-3xs space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-mono font-bold text-slate-400 block shrink-0">CAMP-ID {ad.id.substring(0, 5)}</span>
                        <span className="text-[10px] font-black text-[#0B2545] bg-[#0B2545]/5 px-2 py-0.5 rounded-sm">
                          {ctr}% CTR
                        </span>
                      </div>
                      <h5 className="font-bold text-[11px] text-slate-800 line-clamp-1 leading-none">{ad.title}</h5>
                      
                      {/* Graphics Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-mono font-bold text-slate-500">
                          <span>Clicks ({ad.clicks})</span>
                          <span>{ad.views} Vistas</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                          <div 
                            style={{ width: `${percentageWidth}%` }}
                            className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/60 flex items-center justify-between text-[10px] text-slate-600">
                <span>🎯 <strong>Publicidad Inteligente:</strong> Las campañas activas se rotan automáticamente en los banners inferiores de la pantalla de inicio móvil, redirigiendo a los alumnos a patrocinadores o colectas.</span>
                <span className="font-bold text-[#0B2545] shrink-0 hover:underline cursor-pointer ml-4">Exportar PDF</span>
              </div>
            </div>

          </div>
        )}

        {/* TAB 6: ACCESS AND MONETIZATION CONTROL */}
        {activeTab === 'monetize' && (
          <div className="space-y-6">
            
            <div className="bg-[#0B2545]/5 border border-[#0B2545]/10 p-4.5 rounded-2xl flex items-start space-x-3 text-left">
              <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-sans font-black text-slate-900 text-sm">Organizador Financiero & Pasarelas de Pago</h3>
                <p className="text-slate-600 text-[11px] leading-relaxed mt-1">
                  En esta consola puedes definir cuáles de las 7 herramientas/secciones principales de CorAM serán de acceso <strong>Gratuito</strong> y cuáles requerirán suscripción o pago <strong>Premium</strong>. Los cambios se reflejarán inmediatamente en la simulación del smartphone, bloqueando o desbloqueando vistas y habilitando el Carrito de Compras.
                </p>
              </div>
            </div>

            <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-550/10 border-b border-slate-200 text-slate-700 font-extrabold">
                      <th className="p-4 uppercase tracking-wider text-[10px]">Herramienta / Sección</th>
                      <th className="p-4 uppercase tracking-wider text-[10px]">Restricción de Acceso</th>
                      <th className="p-4 uppercase tracking-wider text-[10px]">Esquema de Precios</th>
                      <th className="p-4 uppercase tracking-wider text-[10px] text-right">Acción de Configuración</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {monetizationSettings.map((setting) => (
                      <tr key={setting.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div className="font-extrabold text-slate-900">{setting.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Controlador ID: tools-key-{setting.id}</div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            setting.isPremium 
                              ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${setting.isPremium ? 'bg-rose-600' : 'bg-emerald-500'}`}></span>
                            <span>{setting.isPremium ? '🔒 Solo Premium (Pago)' : '🔓 Gratuito (Libre)'}</span>
                          </span>
                        </td>
                        <td className="p-4">
                          {setting.isPremium ? (
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-black text-slate-800 text-xs bg-slate-100 px-2.5 py-1 rounded-md">
                                {setting.price || '$19.99'}
                              </span>
                              <span className="text-[9px] text-slate-400 font-bold uppercase">Sujeto a Cobro</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-semibold italic">No aplica cobros ($0.00)</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end items-center space-x-3">
                            {setting.isPremium && (
                              <input 
                                type="text"
                                value={setting.price}
                                placeholder="Precio (ej: $15.00)"
                                onChange={(e) => {
                                  const newVal = e.target.value;
                                  if (setMonetizationSettings) {
                                    setMonetizationSettings(prev => prev.map(item => 
                                      item.id === setting.id ? { ...item, price: newVal } : item
                                    ));
                                  }
                                }}
                                className="bg-slate-50 text-[11px] px-2.5 py-1.5 font-mono font-bold rounded-lg border border-slate-200 focus:outline-hidden w-28 text-center"
                                title="Cambiar precio de venta"
                              />
                            )}

                            <button
                              onClick={() => {
                                if (setMonetizationSettings) {
                                  setMonetizationSettings(prev => prev.map(item => 
                                    item.id === setting.id 
                                      ? { 
                                          ...item, 
                                          isPremium: !item.isPremium,
                                          price: !item.isPremium ? (setting.price === 'Gratuito' ? '$19.99' : setting.price) : 'Gratuito'
                                        } 
                                      : item
                                  ));
                                }
                              }}
                              className={`text-[9px] font-black px-3.5 py-2 rounded-xl border transition-all ${
                                setting.isPremium 
                                  ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100' 
                                  : 'bg-emerald-50 border-emerald-250 text-emerald-800 hover:bg-emerald-100'
                              }`}
                            >
                              Definir como {setting.isPremium ? 'Gratuito' : 'Premium'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-200/70 p-4 rounded-xl bg-white space-y-2 [&>p:nth-of-type(2)]:hidden">
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  {DEMO_ADMIN_DATA_ENABLED
                    ? 'Demo admin: el Checkout Ministerial permite validar el flujo sin cobrar dinero real.'
                    : 'Produccion: el Checkout Ministerial debe confirmar pagos y membresias desde Stripe/Supabase, no desde el frontend.'}
                </p>
              </div>
              <div className="border border-slate-200/70 p-4 rounded-xl bg-amber-500/5 border-amber-500/20 space-y-2 flex flex-col justify-between">
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 flex items-center space-x-1">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Lote de Configuración Sugerido</span>
                  </h4>
                  <p className="text-[10px] text-slate-600 leading-normal mt-1">
                    Siguiendo los lineamientos de tu ministerio, hemos establecido de forma predeterminada que <strong>Corarios, Himnarios, Afinador, Teclado Piano y Calentamiento Vocal</strong> sean herramientas 100% libres, para que tus alumnos adoren sin barreras, mientras que los <strong>Cursos, Recursos descargables y Mentorías</strong> sean de pago.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (setMonetizationSettings) {
                      setMonetizationSettings([
                        { id: 'corarios', name: 'Corarios y Cadenas', isPremium: false, price: 'Gratuito' },
                        { id: 'himnarios', name: 'Himnarios Celestiales', isPremium: false, price: 'Gratuito' },
                        { id: 'courses', name: 'Cursos y Academia', isPremium: true, price: '$24.99' },
                        { id: 'resources', name: 'Recursos / PDF Descargables', isPremium: true, price: '$9.99' },
                        { id: 'mentorships', name: 'Mentorías 1-a-1', isPremium: true, price: '$49.99' },
                        { id: 'warmups', name: 'Calentamiento Vocal Diario', isPremium: false, price: 'Gratuito' },
                        { id: 'tuner_piano', name: 'Afinador y Teclado Piano', isPremium: false, price: 'Gratuito' },
                      ]);
                    }
                  }}
                  className="bg-[#0B2545] hover:bg-slate-900 text-white font-black text-[9.5px] px-3 py-2 rounded-lg transition-all mt-2 w-full text-center"
                >
                  Restablecer Combinación Predeterminada
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* INLINE COURSE MODAL */}
      {showCourseModal && (
        <div id="course-modal-overlay" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div id="course-modal" className="bg-white p-6 rounded-2xl w-full max-w-xl shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-sans font-black text-slate-900 text-md">
                {editingCourse ? 'Editar Curso Académico' : 'Publicar Nuevo Curso'}
              </h3>
              <button 
                onClick={() => setShowCourseModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-505 block mb-1 uppercase tracking-wider">Título del Curso</label>
                  <input 
                    type="text" 
                    required
                    value={courseFormTitle}
                    onChange={(e) => setCourseFormTitle(e.target.value)}
                    placeholder="e.g. Técnica Vocal Avanzada"
                    className="w-full bg-slate-50 text-xs px-3 py-2 rounded-lg border border-slate-205 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-505 block mb-1 uppercase tracking-wider">Instructor</label>
                  <input 
                    type="text" 
                    required
                    value={courseFormInstructor}
                    onChange={(e) => setCourseFormInstructor(e.target.value)}
                    placeholder="e.g. Angie MZ"
                    className="w-full bg-slate-50 text-xs px-3 py-2 rounded-lg border border-slate-205 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-505 block mb-1 uppercase tracking-wider">Duración / Clases</label>
                  <input 
                    type="text" 
                    required
                    value={courseFormDuration}
                    onChange={(e) => setCourseFormDuration(e.target.value)}
                    placeholder="e.g. 12 Clases • 8 horas"
                    className="w-full bg-slate-50 text-xs px-3 py-2 rounded-lg border border-slate-205"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-550 block mb-1 uppercase tracking-wider">Precio de Venta</label>
                  <input 
                    type="text" 
                    value={courseFormPrice}
                    onChange={(e) => setCourseFormPrice(e.target.value)}
                    placeholder="e.g. $19.99"
                    className="w-full bg-slate-50 text-xs px-3 py-2 rounded-lg border border-slate-205"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-550 block mb-1 uppercase tracking-wider">Oferta / Descuento</label>
                  <input 
                    type="text" 
                    value={courseFormOffer}
                    onChange={(e) => setCourseFormOffer(e.target.value)}
                    placeholder="e.g. 20% OFF"
                    className="w-full bg-slate-50 text-xs px-3 py-2 rounded-lg border border-slate-205"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-550 block mb-1 uppercase tracking-wider">Portada del curso</label>
                  <input 
                    type="text" 
                    value={courseFormImageUrl}
                    onChange={(e) => setCourseFormImageUrl(e.target.value)}
                    placeholder="URL o archivo subido a Supabase"
                    className="w-full bg-slate-50 text-xs px-3 py-2 rounded-lg border border-slate-205"
                  />
                  <label className={`mt-2 flex items-center justify-center gap-2 rounded-lg border border-slate-205 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-all ${
                    courseImageUploading ? 'cursor-wait text-slate-400' : 'cursor-pointer text-[#0B2545] hover:bg-slate-50'
                  }`}>
                    {courseImageUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageUp className="h-3.5 w-3.5" />}
                    <span>{courseImageUploading ? 'Subiendo portada...' : 'Subir imagen'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      disabled={courseImageUploading}
                      onChange={handleUploadCourseImage}
                    />
                  </label>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-550 block mb-1 uppercase tracking-wider">URL del Video de Introducción</label>
                  <input 
                    type="text" 
                    value={courseFormVideoUrl}
                    onChange={(e) => setCourseFormVideoUrl(e.target.value)}
                    placeholder="YouTube, Vimeo o archivo privado de Supabase"
                    className="w-full bg-slate-50 text-xs px-3 py-2 rounded-lg border border-slate-205"
                  />
                  <label className={`mt-2 flex items-center justify-center gap-2 rounded-lg border border-slate-205 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-all ${
                    courseVideoUploading ? 'cursor-wait text-slate-400' : 'cursor-pointer text-[#0B2545] hover:bg-slate-50'
                  }`}>
                    {courseVideoUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Video className="h-3.5 w-3.5" />}
                    <span>{courseVideoUploading ? 'Subiendo video...' : 'Subir video'}</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      className="hidden"
                      disabled={courseVideoUploading}
                      onChange={handleUploadCourseVideo}
                    />
                  </label>
                </div>
              </div>

              {courseMediaMessage && (
                <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[10.5px] font-bold text-slate-600">
                  <UploadCloud className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0B2545]" />
                  <span>{courseMediaMessage}</span>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-slate-550 block mb-1 uppercase tracking-wider">Descripción del Curso</label>
                <textarea 
                  required
                  rows={3}
                  value={courseFormDescription}
                  onChange={(e) => setCourseFormDescription(e.target.value)}
                  placeholder="Escribe un resumen atractivo de lo que aprenderán..."
                  className="w-full bg-slate-50 text-xs px-3 py-2 rounded-lg border border-slate-205"
                ></textarea>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-550 block mb-1 uppercase tracking-wider">
                  Plan de Estudio (Una lección por línea, formato: Título de Clase (Duración))
                </label>
                <textarea 
                  rows={4}
                  value={courseFormSyllabusTxt}
                  onChange={(e) => setCourseFormSyllabusTxt(e.target.value)}
                  placeholder="Clase 1: Introducción Teórica (30m)&#13;Clase 2: Ejercicio Respiratorio (45m)"
                  className="w-full bg-slate-50 text-xs px-3 py-2 rounded-lg border border-slate-205 font-mono"
                ></textarea>
              </div>

              <div className="flex justify-between items-center pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={courseFormIsPremium}
                    onChange={(e) => setCourseFormIsPremium(e.target.checked)}
                    className="rounded text-[#0B2545] focus:ring-[#0B2545]"
                  />
                  <span className="font-extrabold text-slate-700">Restringir a Miembros Premium lock</span>
                </label>

                <div className="flex space-x-2">
                  <button 
                    type="button" 
                    onClick={() => setShowCourseModal(false)}
                    className="px-3.5 py-2 hover:bg-slate-100 text-slate-500 font-bold rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={courseImageUploading || courseVideoUploading}
                    className="px-4 py-2 bg-[#0B2545] text-white font-black rounded-xl hover:bg-slate-900 shadow-md"
                  >
                    {courseImageUploading || courseVideoUploading ? 'Subiendo...' : 'Guardar Curso'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INLINE SPONSOR MODAL */}
      {showSponsorModal && (
        <div id="sponsor-modal-overlay" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div id="sponsor-modal" className="bg-white p-5 rounded-2xl w-full max-w-md shadow-2xl relative space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-sans font-black text-slate-900 text-md">
                {editingSponsor ? 'Editar Patrocinador' : 'Añadir Nuevo Patrocinador'}
              </h3>
              <button 
                onClick={() => setShowSponsorModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSponsor} className="space-y-3.5 text-xs text-left">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">NOMBRE COMERCIAL / MARCA</label>
                <input 
                  type="text" 
                  required
                  value={sponsorFormName}
                  onChange={(e) => setSponsorFormName(e.target.value)}
                  placeholder="e.g. Selah Instruments"
                  className="w-full bg-slate-50 text-xs px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">CATEGORÍA</label>
                  <input 
                    type="text" 
                    required
                    value={sponsorFormCategory}
                    onChange={(e) => setSponsorFormCategory(e.target.value)}
                    placeholder="e.g. Equipos de Audio"
                    className="w-full bg-slate-50 text-xs px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">LOGO (EMOJI O ICONO)</label>
                  <select 
                    value={sponsorFormLogoUrl}
                    onChange={(e) => setSponsorFormLogoUrl(e.target.value)}
                    className="w-full bg-slate-50 text-xs px-3 py-2 rounded-lg border border-slate-200"
                  >
                    {['🎹', '🎙ï¸', '🎸', '🥁', '🎵', '🎒', '🎪', '⛪'].map(emoji => (
                      <option key={emoji} value={emoji}>{emoji} Selector</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">TEXTO PROMOCIONAL / OFERTA</label>
                <textarea 
                  required
                  rows={3}
                  value={sponsorFormPromoText}
                  onChange={(e) => setSponsorFormPromoText(e.target.value)}
                  placeholder="Describe el beneficio para los alumnos..."
                  className="w-full bg-slate-50 text-xs px-3 py-2 rounded-lg border border-slate-200"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowSponsorModal(false)}
                  className="px-3.5 py-2 hover:bg-slate-50 text-slate-500 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-black rounded-xl hover:bg-amber-600 shadow-md"
                >
                  Guardar Patrocinador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INLINE AD CAMPAIGN MODAL */}
      {showAdModal && (
        <div id="ad-modal-overlay" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div id="ad-modal" className="bg-white p-5 rounded-2xl w-full max-w-md shadow-2xl relative space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-sans font-black text-slate-900 text-md">
                {editingAd ? 'Editar Campaña Publicitaria' : 'Lanzar Campaña Publicitaria'}
              </h3>
              <button 
                onClick={() => setShowAdModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAd} className="space-y-3.5 text-xs text-left">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">NÚCLEO O TÍTULO DE LA CAMPAÑA</label>
                <input 
                  type="text" 
                  required
                  value={adFormTitle}
                  onChange={(e) => setAdFormTitle(e.target.value)}
                  placeholder="e.g. Banner Gran Convención Pentecostal 2026"
                  className="w-full bg-slate-50 text-xs px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">ESTADO</label>
                  <select 
                    value={adFormStatus}
                    onChange={(e) => setAdFormStatus(e.target.value as any)}
                    className="w-full bg-slate-50 text-xs px-2 py-2 rounded-lg border border-slate-200"
                  >
                    {['Activa', 'Programada', 'Finalizada'].map(stat => (
                      <option key={stat} value={stat}>{stat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">VISTAS</label>
                  <input 
                    type="number" 
                    value={adFormViews}
                    onChange={(e) => setAdFormViews(Number(e.target.value))}
                    className="w-full bg-slate-50 text-xs px-2 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">CLICKS</label>
                  <input 
                    type="number" 
                    value={adFormClicks}
                    onChange={(e) => setAdFormClicks(Number(e.target.value))}
                    className="w-full bg-slate-50 text-xs px-2 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAdModal(false)}
                  className="px-3.5 py-2 hover:bg-slate-50 text-slate-500 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[#0B2545] text-white font-black rounded-xl hover:bg-slate-900 shadow-md"
                >
                  Publicar Campaña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
