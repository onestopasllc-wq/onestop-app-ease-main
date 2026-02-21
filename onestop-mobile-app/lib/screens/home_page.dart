import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:onestop_mobile_app/theme/app_theme.dart';
import 'package:onestop_mobile_app/widgets/main_scaffold.dart';
import 'package:onestop_mobile_app/services/supabase_service.dart';
import 'package:onestop_mobile_app/models/testimonial.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage>
    with SingleTickerProviderStateMixin {
  final ScrollController _scrollController = ScrollController();
  AnimationController? _animationController;
  List<Testimonial> _featuredTestimonials = [];
  bool _loadingTestimonials = true;
  int _dealershipCount = 0;
  int _rentalCount = 0;
  int _insuranceCount = 0;
  int _communityCount = 0;
  double _scrollOffset = 0.0;
  bool _isTestimonialExpanded = false;

  @override
  void initState() {
    super.initState();
    _animationController ??= AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);

    _scrollController.addListener(() {
      if (mounted) {
        setState(() {
          _scrollOffset = _scrollController.offset;
        });
      }
    });

    _fetchHomeData();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _animationController?.dispose();
    super.dispose();
  }

  Future<void> _fetchHomeData() async {
    setState(() => _loadingTestimonials = true);
    final testimonials = await SupabaseService.fetchTestimonials();
    final dealerships = await SupabaseService.fetchDealerships();
    final rentals = await SupabaseService.fetchRentalListings();
    final insurance = await SupabaseService.fetchInsuranceProviders();
    final community = await SupabaseService.fetchCommunityServices();

    if (mounted) {
      setState(() {
        _featuredTestimonials = testimonials;
        _dealershipCount = dealerships.length;
        _rentalCount = rentals.length;
        _insuranceCount = insurance.length;
        _communityCount = community.length;
        _loadingTestimonials = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return MainScaffold(
      currentIndex: 0,
      title: 'Home',
      body: AnimationLimiter(
        child: SingleChildScrollView(
          controller: _scrollController,
          child: Column(
            children: AnimationConfiguration.toStaggeredList(
              duration: const Duration(milliseconds: 600),
              childAnimationBuilder: (widget) => FadeInAnimation(
                child: SlideAnimation(
                  verticalOffset: 50.0,
                  child: widget,
                ),
              ),
              children: [
                _buildHero(context),
                _buildAboutPreview(context),
                _buildTestimonialsSummary(context),
                _buildServicesOverview(context),
                _buildCTA(context),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHero(BuildContext context) {
    return Stack(
      children: [
        // Parallax Background
        Positioned(
          top: -_scrollOffset * 0.5,
          left: 0,
          right: 0,
          height: 700,
          child: Container(
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: AssetImage('assets/hero-image.png'),
                fit: BoxFit.cover,
              ),
            ),
          ),
        ),
        // Mesh Gradient Overlay
        Container(
          width: double.infinity,
          constraints: const BoxConstraints(minHeight: 650),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              stops: const [0.1, 0.4, 0.9],
              colors: [
                Colors.black.withOpacity(0.5),
                AppTheme.primaryBlue.withOpacity(0.7),
                AppTheme.primaryBlue.withOpacity(0.95),
              ],
            ),
          ),
          padding:
              const EdgeInsets.only(left: 24, right: 24, top: 120, bottom: 80),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(100),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(100),
                      border: Border.all(color: Colors.white.withOpacity(0.15)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.stars_rounded,
                            color: Colors.amber, size: 18),
                        const SizedBox(width: 8),
                        Text(
                          'Trusted by Thousands',
                          style: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: 1.0),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 32),
              if (_animationController != null)
                AnimatedBuilder(
                  animation: _animationController!,
                  builder: (context, child) {
                    return Transform.translate(
                      offset: Offset(0, 8 * _animationController!.value),
                      child: child,
                    );
                  },
                  child: Text(
                    'We Make\nApplying Easy! 🎓',
                    style: Theme.of(context).textTheme.displayLarge?.copyWith(
                          color: Colors.white,
                          fontSize: 48,
                          height: 1.0,
                        ),
                  ),
                )
              else
                Text(
                  'We Make\nApplying Easy! 🎓',
                  style: Theme.of(context).textTheme.displayLarge?.copyWith(
                        color: Colors.white,
                        fontSize: 48,
                        height: 1.0,
                      ),
                ),
              const SizedBox(height: 24),
              Text(
                'Simplifying every application with a touch of professional guidance and 20+ years of expertise.',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: Colors.white.withOpacity(0.9),
                      height: 1.6,
                      fontSize: 18,
                    ),
              ),
              const SizedBox(height: 56),
              Wrap(
                spacing: 16,
                runSpacing: 16,
                children: [
                  ElevatedButton(
                    onPressed: () =>
                        Navigator.pushNamed(context, '/appointment'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.secondaryTeal,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 40, vertical: 22),
                      elevation: 12,
                      shadowColor: AppTheme.secondaryTeal.withOpacity(0.5),
                    ),
                    child: const Text('Book Appointment'),
                  ),
                  OutlinedButton(
                    onPressed: () => Navigator.pushNamed(context, '/services'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: BorderSide(
                          color: Colors.white.withOpacity(0.3), width: 1.5),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 40, vertical: 22),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: const Text('Our Services'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAboutPreview(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 80, horizontal: 24),
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 48,
                height: 4,
                decoration: BoxDecoration(
                  color: AppTheme.secondaryTeal,
                  borderRadius: BorderRadius.circular(100),
                ),
              ),
              const SizedBox(width: 16),
              Text(
                'ABOUT US',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppTheme.secondaryTeal,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 2.0,
                    ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Text(
            'Your Trusted Path\nto Success',
            style: Theme.of(context).textTheme.headlineLarge,
          ),
          const SizedBox(height: 24),
          Text(
            'We provide dedicated professional assistance tailored to your unique application needs, ensuring every step is seamless.',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: AppTheme.textMuted,
                ),
          ),
          const SizedBox(height: 48),
          // Bento Grid for Stats
          Column(
            children: [
              // Main Feature Card (High Weight)
              _buildStatCard(
                  context, '1000+', 'Success Stories', Icons.people_alt_rounded,
                  isPrimary: true),
              const SizedBox(height: 16),
              // Secondary Stats Row
              IntrinsicHeight(
                child: Row(
                  children: [
                    Expanded(
                      child: _buildStatCard(context, _rentalCount.toString(),
                          'Rentals', Icons.home_work_rounded),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _buildStatCard(context, _insuranceCount.toString(),
                          'Insurance', Icons.verified_user_rounded),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              IntrinsicHeight(
                child: Row(
                  children: [
                    Expanded(
                      child: _buildStatCard(
                          context,
                          _dealershipCount.toString(),
                          'Dealers',
                          Icons.directions_car_rounded),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _buildStatCard(context, _communityCount.toString(),
                          'Community', Icons.people_rounded),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(
      BuildContext context, String value, String label, IconData icon,
      {bool isPrimary = false}) {
    return Container(
      padding: EdgeInsets.symmetric(vertical: isPrimary ? 32 : 24),
      decoration: BoxDecoration(
        color: isPrimary ? AppTheme.primaryBlue : AppTheme.backgroundLight,
        borderRadius: BorderRadius.circular(32),
        border: Border.all(
          color: isPrimary
              ? Colors.white.withOpacity(0.1)
              : const Color(0xFFE2E8F0).withOpacity(0.5),
        ),
        boxShadow: isPrimary
            ? [
                BoxShadow(
                  color: AppTheme.primaryBlue.withOpacity(0.2),
                  blurRadius: 24,
                  offset: const Offset(0, 8),
                )
              ]
            : [],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isPrimary
                  ? Colors.white.withOpacity(0.1)
                  : AppTheme.secondaryTeal.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              icon,
              color: isPrimary ? Colors.white : AppTheme.secondaryTeal,
              size: isPrimary ? 32 : 24,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            value,
            style: TextStyle(
              fontSize: isPrimary ? 36 : 24,
              fontWeight: FontWeight.w900,
              color: isPrimary ? Colors.white : AppTheme.primaryBlue,
              letterSpacing: -0.5,
            ),
          ),
          Text(
            label,
            style: TextStyle(
              color: isPrimary ? Colors.white70 : AppTheme.textMuted,
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTestimonialsSummary(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 100, horizontal: 24),
      decoration: BoxDecoration(
        color: AppTheme.primaryBlue.withOpacity(0.01),
        image: DecorationImage(
          image: const AssetImage('assets/hero-image.png'),
          fit: BoxFit.cover,
          opacity: 0.03,
          colorFilter: ColorFilter.mode(
              AppTheme.primaryBlue.withOpacity(0.1), BlendMode.dstATop),
        ),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.secondaryTeal.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.format_quote_rounded,
                size: 40, color: AppTheme.secondaryTeal),
          ),
          const SizedBox(height: 24),
          Text(
            'Client Voices',
            style: Theme.of(context).textTheme.headlineLarge,
          ),
          const SizedBox(height: 56),
          if (_loadingTestimonials)
            const Center(child: CircularProgressIndicator())
          else
            _buildTestimonialCard(
              context,
              _featuredTestimonials.isNotEmpty
                  ? _featuredTestimonials[0].text
                  : '"Exceptional support throughout my process. Highly recommended!"',
              _featuredTestimonials.isNotEmpty
                  ? _featuredTestimonials[0].name
                  : 'John Doe',
              _featuredTestimonials.isNotEmpty
                  ? (_featuredTestimonials[0].location ?? 'Client')
                  : 'Verified User',
            ),
          const SizedBox(height: 48),
          TextButton.icon(
            onPressed: () => Navigator.pushNamed(context, '/testimonials'),
            label: const Text('View All Stories',
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.5)),
            icon: const Icon(Icons.arrow_forward_rounded, size: 20),
            style: TextButton.styleFrom(
              foregroundColor: AppTheme.secondaryTeal,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTestimonialCard(
      BuildContext context, String text, String author, String location) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 48),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(40),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 40,
            offset: const Offset(0, 20),
          ),
        ],
        border: Border.all(color: const Color(0xFFE2E8F0).withOpacity(0.5)),
      ),
      child: Column(
        children: [
          AnimatedSize(
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeInOut,
            child: Column(
              children: [
                Text(
                  (!_isTestimonialExpanded && text.length > 150)
                      ? '${text.substring(0, 150)}...'
                      : text,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        fontStyle: FontStyle.italic,
                        color: AppTheme.textDark,
                        height: 1.6,
                      ),
                ),
                if (text.length > 150)
                  TextButton(
                    onPressed: () => setState(
                        () => _isTestimonialExpanded = !_isTestimonialExpanded),
                    child: Text(
                      _isTestimonialExpanded ? 'Read Less' : 'Read More',
                      style: const TextStyle(
                        color: AppTheme.secondaryTeal,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 32),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                      color: AppTheme.secondaryTeal.withOpacity(0.2), width: 2),
                ),
                child: const CircleAvatar(
                  backgroundColor: AppTheme.backgroundLight,
                  radius: 24,
                  child: Icon(Icons.person_outline_rounded,
                      color: AppTheme.secondaryTeal),
                ),
              ),
              const SizedBox(width: 16),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(author,
                      style: const TextStyle(
                          fontWeight: FontWeight.w900,
                          fontSize: 18,
                          color: AppTheme.primaryBlue)),
                  Text(location,
                      style: const TextStyle(
                          color: AppTheme.textMuted,
                          fontWeight: FontWeight.w600,
                          fontSize: 14)),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildServicesOverview(BuildContext context) {
    final services = [
      {'icon': FontAwesomeIcons.fileLines, 'title': 'Visa Help'},
      {'icon': FontAwesomeIcons.graduationCap, 'title': 'College Support'},
      {'icon': FontAwesomeIcons.globe, 'title': 'Documents'},
      {'icon': FontAwesomeIcons.userCheck, 'title': 'Licensing'},
      {'icon': FontAwesomeIcons.briefcase, 'title': 'Career'},
      {'icon': FontAwesomeIcons.building, 'title': 'Business'},
      {'icon': FontAwesomeIcons.laptopCode, 'title': 'Web Dev'},
      {'icon': FontAwesomeIcons.mobileScreenButton, 'title': 'App Dev'},
      {'icon': FontAwesomeIcons.palette, 'title': 'Branding'},
    ];

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 100, horizontal: 24),
      color: Colors.white,
      child: Column(
        children: [
          Text(
            'OUR SERVICES',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppTheme.secondaryTeal,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 2.0,
                ),
          ),
          const SizedBox(height: 24),
          Text(
            'Expertise at\nYour Service',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.headlineLarge,
          ),
          const SizedBox(height: 56),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: 1.0,
            ),
            itemCount: services.length,
            itemBuilder: (context, index) {
              return _buildServiceSmallCard(
                services[index]['icon'] as IconData,
                services[index]['title'] as String,
                context,
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildServiceSmallCard(
      IconData icon, String title, BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: const Color(0xFFE2E8F0).withOpacity(0.5)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: InkWell(
        onTap: () {
          if (title == 'Community') {
            Navigator.pushNamed(context, '/community-services');
          } else {
            Navigator.pushNamed(context, '/services');
          }
        },
        borderRadius: BorderRadius.circular(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.secondaryTeal.withOpacity(0.08),
                shape: BoxShape.circle,
              ),
              child: FaIcon(icon, color: AppTheme.secondaryTeal, size: 28),
            ),
            const SizedBox(height: 16),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(
                  fontWeight: FontWeight.w800,
                  fontSize: 16,
                  color: AppTheme.primaryBlue),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCTA(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(left: 24, right: 24, bottom: 48),
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 64),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppTheme.primaryBlue, Color(0xFF003060)],
        ),
        borderRadius: BorderRadius.circular(40),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primaryBlue.withOpacity(0.35),
            blurRadius: 32,
            offset: const Offset(0, 16),
          ),
        ],
      ),
      child: Column(
        children: [
          const Text(
            'Ready to Excel?',
            textAlign: TextAlign.center,
            style: TextStyle(
                color: Colors.white,
                fontSize: 36,
                fontWeight: FontWeight.w900,
                letterSpacing: -1.0),
          ),
          const SizedBox(height: 16),
          Text(
            'Let our 20+ years of expertise guide your journey today.',
            textAlign: TextAlign.center,
            style: TextStyle(
                color: Colors.white.withOpacity(0.7),
                fontSize: 18,
                height: 1.5),
          ),
          const SizedBox(height: 48),
          ElevatedButton(
            onPressed: () => Navigator.pushNamed(context, '/appointment'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: AppTheme.primaryBlue,
              padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 24),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
            ),
            child: const Text('Start Now',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
          ),
        ],
      ),
    );
  }
}
