export interface FlutterTemplate {
  title: string;
  className: string;
  description: string;
  code: string;
}

export const flutterTemplates: Record<string, FlutterTemplate> = {
  splash: {
    title: '1. Splash Screen',
    className: 'CorAMSplashScreen',
    description: 'Pantalla de bienvenida inicial con logo animado y slogan del ministerio.',
    code: `import 'package:flutter/material.dart';

class CorAMSplashScreen extends StatefulWidget {
  const CorAMSplashScreen({super.key});

  @override
  State<CorAMSplashScreen> createState() => _CorAMSplashScreenState();
}

class _CorAMSplashScreenState extends State<CorAMSplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 2000),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeIn),
    );
    _scaleAnimation = Tween<double>(begin: 0.85, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.outBacked),
    );
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),
      body: Center(
        child: FadeTransition(
          opacity: _fadeAnimation,
          child: ScaleTransition(
            scale: _scaleAnimation,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Angie MZ Logo Frame
                Container(
                  width: 140,
                  height: 140,
                  decoration: BoxDecoration(
                    color: const Color(0xFF0B2545), // Azul Elegante
                    borderRadius: BorderRadius.circular(32),
                    border: Border.all(
                      color: const Color(0xFFD4AF37), // Dorado Premium
                      width: 2.5,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF0B2545).withOpacity(0.2),
                        blurRadius: 15,
                        offset: const Offset(0, 8),
                      )
                    ],
                  ),
                  child: const Center(
                    child: Text(
                      'CorAM',
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFFD4AF37),
                        letterSpacing: 1.5,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                const Text(
                  'CorAM',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF0B2545),
                    letterSpacing: 2,
                  ),
                ),
                const SizedBox(height: 8),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 40),
                  child: Text(
                    'Todo para el ministerio de alabanza en un solo lugar.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey,
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}`
  },
  onboarding: {
    title: '2. Onboarding Flow',
    className: 'CorAMOnboardingScreen',
    description: 'Flujo introductorio de tres tarjetas deslizables con indicadores circulares de página.',
    code: `import 'package:flutter/material.dart';

class CorAMOnboardingScreen extends StatefulWidget {
  const CorAMOnboardingScreen({super.key});

  @override
  State<CorAMOnboardingScreen> createState() => _CorAMOnboardingScreenState();
}

class _CorAMOnboardingScreenState extends State<CorAMOnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentIndex = 0;

  final List<Map<String, String>> _slides = [
    {
      'title': 'Descubre cientos de corarios',
      'desc': 'Accede a la letra de coros de avivamiento, adoración, cánticos antiguos y nuevos en un formato optimizado.',
      'icon': '📚'
    },
    {
      'title': 'Aprende con cursos y mentorías',
      'desc': 'Cursos estilo MasterClass orientados a directores de coro, coristas y músicos pentecostales.',
      'icon': '🎓'
    },
    {
      'title': 'Crece en tu ministerio',
      'desc': 'Obtén guías técnicas, melodías cifradas y recursos indispensables para dirigir un culto con excelencia.',
      'icon': '✨'
    }
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      backgroundColor: const Color(0xFFFAF9F6),
      body: SafeArea(
        child: Column(
          children: [
            Align(
              alignment: Alignment.topRight,
              child: TextButton(
                onPressed: () {},
                child: const Text('Saltar', style: TextStyle(color: Color(0xFF0B2545))),
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                itemCount: _slides.length,
                onPageChanged: (idx) => setState(() => _currentIndex = idx),
                itemBuilder: (context, index) {
                  final slide = _slides[index];
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          slide['icon']!,
                          style: const TextStyle(fontSize: 80),
                        ),
                        const SizedBox(height: 40),
                        Text(
                          slide['title']!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF0B2545),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          slide['desc']!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 15,
                            color: Colors.black54,
                            height: 1.5,
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                _slides.length,
                (index) => AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  margin: const EdgeInsets.all(4),
                  width: _currentIndex == index ? 24 : 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: _currentIndex == index ? const Color(0xFFD4AF37) : Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 40),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0B2545),
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 56),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                onPressed: () {
                  if (_currentIndex < _slides.length - 1) {
                    _pageController.nextPage(
                      duration: const Duration(milliseconds: 300),
                      curve: Curves.easeInOut,
                    );
                  } else {
                    // Navegar al Login
                  }
                },
                child: Text(_currentIndex == _slides.length - 1 ? '¡Comenzar!' : 'Siguiente'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}`
  },
  login: {
    title: '3. Auth Login',
    className: 'CorAMLoginScreen',
    description: 'Ingreso moderno con federados (Google y Apple) combinando accesos sin contraseña.',
    code: `import 'package:flutter/material.dart';

class CorAMLoginScreen extends StatelessWidget {
  const CorAMLoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF9F6),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 40),
              const Center(
                child: Text(
                  'CorAM',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF0B2545),
                    letterSpacing: 2,
                  ),
                ),
              ),
              const Center(
                child: Text(
                  'Inicia sesión para acceder a tu altar de adoración.',
                  style: TextStyle(color: Colors.grey, fontSize: 14),
                ),
              ),
              const SizedBox(height: 48),
              
              // Google Button
              _SocialButton(
                icon: Icons.android, // Reemplazar por logo de Google
                label: 'Continuar con Google',
                onPressed: () {},
                color: Colors.white,
                textColor: Colors.black87,
              ),
              const SizedBox(height: 12),
              
              // Apple Button
              _SocialButton(
                icon: Icons.apple,
                label: 'Continuar con Apple',
                onPressed: () {},
                color: Colors.black,
                textColor: Colors.white,
              ),
              const SizedBox(height: 24),
              
              const Row(
                children: [
                   Expanded(child: Divider()),
                   Padding(
                     padding: EdgeInsets.symmetric(horizontal: 16),
                     child: Text('o ingresa con correo', style: TextStyle(color: Colors.grey)),
                   ),
                   Expanded(child: Divider()),
                ],
              ),
              const SizedBox(height: 24),
              const TextField(
                decoration: InputDecoration(
                  labelText: 'Correo Electrónico',
                  border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.radius_circular_12)),
                  prefixIcon: Icon(Icons.email_outlined),
                ),
              ),
              const SizedBox(height: 16),
              const TextField(
                obscureText: true,
                decoration: InputDecoration(
                  labelText: 'Contraseña',
                  border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.radius_circular_12)),
                  prefixIcon: Icon(Icons.lock_outline),
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0B2545),
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 54),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () {},
                child: const Text('Iniciar Sesión'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SocialButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onPressed;
  final Color color;
  final Color textColor;

  const _SocialButton({
    required this.icon,
    required this.label,
    required this.onPressed,
    required this.color,
    required this.textColor,
  });

  @override
  Widget build(BuildContext context) {
    return OutlinedButton.styleFrom(
      backgroundColor: color,
      minimumSize: const Size(double.infinity, 54),
      side: const BorderSide(color: Colors.black12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ).build(
      onPressed: onPressed,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: textColor),
          const SizedBox(width: 12),
          Text(label, style: TextStyle(color: textColor, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}`
  },
  home: {
    title: '4. Dashboard Home',
    className: 'CorAMHomeScreen',
    description: 'Menú principal con banner de novedades, accesos rápidos en Grid y secciones de contenido destacado.',
    code: `import 'package:flutter/material.dart';

class CorAMHomeScreen extends StatelessWidget {
  const CorAMHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF9F6),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text('CorAM', style: TextStyle(color: Color(0xFF0B2545), fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none, color: Colors.black),
            onPressed: () {},
          ),
          const CircleAvatar(
            backgroundImage: NetworkImage('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150'),
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Proximas Actividades Banner
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0B2545), Color(0xFF1E40AF)],
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('¿Quieres sonar excelente?', style: TextStyle(color: Color(0xFFD4AF37), fontSize: 13, fontWeight: FontWeight.bold)),
                        SizedBox(height: 4),
                        Text('Descarga el Cancionero 2026', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                        SizedBox(height: 8),
                        Text('Acordes verificados por Angie MZ.', style: TextStyle(color: Colors.white60, fontSize: 12)),
                      ],
                    ),
                  ),
                  Icon(Icons.auto_awesome, color: Color(0xFFD4AF37), size: 48),
                ],
              ),
            ),
            const SizedBox(height: 24),
            // Accesos Rapídos
            const Text('Secciones claves', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0B2545))),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 3,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _QuickAccessCard(icon: Icons.my_library_music, title: 'Corarios', color: Colors.lightBlue.shade100),
                _QuickAccessCard(icon: Icons.menu_book, title: 'Cursos', color: Colors.orange.shade100),
                _QuickAccessCard(icon: Icons.contact_support, title: 'Mentorías', color: Colors.teal.shade100),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _QuickAccessCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final Color color;

  const _QuickAccessCard({required this.icon, required this.title, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        CircleAvatar(radius: 28, backgroundColor: color, child: Icon(icon, color: Colors.black87)),
        const SizedBox(height: 8),
        Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
      ],
    );
  }
}`
  },
  chorusesDetail: {
    title: '5 & 6. Chorus Lyrics and Chords Detail',
    className: 'CorAMChorusDetailScreen',
    description: 'Visor de cantos enriquecido con transpositor de acorde, tamaño de fuente y acción de descarga premium.',
    code: `import 'package:flutter/material.dart';

class CorAMChorusDetailScreen extends StatefulWidget {
  const CorAMChorusDetailScreen({super.key});

  @override
  State<CorAMChorusDetailScreen> createState() => _CorAMChorusDetailScreenState();
}

class _CorAMChorusDetailScreenState extends State<CorAMChorusDetailScreen> {
  int _transpositionOffset = 0;
  double _fontSize = 15;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF9F6),
      appBar: AppBar(
        title: const Text('Detalle de Coro'),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.bookmark_outline),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          // Toolbar Ajustes Cifrado
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Text('Tono: ', style: TextStyle(fontWeight: FontWeight.bold)),
                    IconButton(
                        icon: const Icon(Icons.remove_circle_outline),
                        onPressed: () => setState(() => _transpositionOffset--)),
                    Text('\${_transpositionOffset >= 0 ? '+' : ''}\$_transpositionOffset',
                        style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFD4AF37))),
                    IconButton(
                        icon: const Icon(Icons.add_circle_outline),
                        onPressed: () => setState(() => _transpositionOffset++)),
                  ],
                ),
                Row(
                  children: [
                    const Icon(Icons.text_fields),
                    Slider(
                      value: _fontSize,
                      min: 12,
                      max: 24,
                      onChanged: (v) => setState(() => _fontSize = v),
                    ),
                  ],
                )
              ],
            ),
          ),
          // Lyrics Scroller
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Card(
                elevation: 0,
                color: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Text(
                    '[Coro]\\nG\\nYo tengo un Dios muy, muy grande,\\nD                     G\\nMaravilloso, que siempre está conmigo.',
                    style: TextStyle(
                      fontFamily: 'monospace',
                      fontSize: _fontSize,
                      height: 1.6,
                      color: Colors.black87,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}`
  },
  courses: {
    title: '7 & 8. Courses & Detail Screen',
    className: 'CorAMCourseListScreen',
    description: 'Catálogo estilo Netflix para academia musical con indicador de avance y descripción completa de temario.',
    code: `import 'package:flutter/material.dart';

class CorAMCourseListScreen extends StatelessWidget {
  const CorAMCourseListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF9F6),
      appBar: AppBar(title: const Text('Academia CorAM')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Cursos Destacados', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          // Curso Card
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            clipBehavior: Clip.antiAlias,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Image.network(
                  'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?q=80&w=600',
                  height: 160,
                  fit: BoxFit.cover,
                ),
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Instructor: Angie MZ', style: TextStyle(color: Colors.orange, fontSize: 13, fontWeight: FontWeight.bold)),
                          Card(color: Colors.green, child: Padding(padding: EdgeInsets.all(4), child: Text('GRATIS', style: TextStyle(color: Colors.white, fontSize: 10))))
                        ],
                      ),
                      const SizedBox(height: 8),
                      const Text('Técnica Vocal y Unción en el Altar', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 12),
                      OutlinedButton(
                        style: OutlinedButton.styleFrom(minimumSize: const Size(double.infinity, 44)),
                        onPressed: () {},
                        child: const Text('Ver Temario e Inscribirse'),
                      )
                    ],
                  ),
                )
              ],
            ),
          )
        ],
      ),
    );
  }
}`
  }
};
