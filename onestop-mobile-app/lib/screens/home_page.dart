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
          height: 600,
          child: Container(
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: AssetImage('assets/hero-image.png'),
                fit: BoxFit.cover,
              ),
            ),
          ),
        ),
        // Overlay for readability
        Container(
          width: double.infinity,
          constraints: const BoxConstraints(minHeight: 550),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Colors.black.withOpacity(0.3),
                AppTheme.primaryBlue.withOpacity(0.8),
              ],
            ),
          ),
          padding:
              const EdgeInsets.only(left: 24, right: 24, top: 100, bottom: 60),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white.withOpacity(0.2)),
                    ),
                    child: const Text(
                      'Trusted by Thousands',
                      style: TextStyle(
                          color: Colors.white, fontWeight: FontWeight.bold),
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
                      offset: Offset(0, 5 * _animationController!.value),
                      child: child,
                    );
                  },
                  child: Text(
                    'We Make Applying Easy! 🎓',
                    style: Theme.of(context).textTheme.displayLarge?.copyWith(
                      color: Colors.white,
                      fontSize: 42,
                      height: 1.1,
                      shadows: [
                        Shadow(
                          color: Colors.black.withOpacity(0.5),
                          offset: const Offset(0, 4),
                          blurRadius: 10,
                        ),
                      ],
                    ),
                  ),
                )
              else
                Text(
                  'We Make Applying Easy! 🎓',
                  style: Theme.of(context).textTheme.displayLarge?.copyWith(
                        color: Colors.white,
                        fontSize:
                            MediaQuery.of(context).size.width < 400 ? 32 : 42,
                        height: 1.1,
                      ),
                ),
              const SizedBox(height: 20),
              Text(
                'Simplifying every application with a touch of professional guidance and expertise.',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.9),
                  fontSize: 20,
                  fontWeight: FontWeight.w300,
                  shadows: [
                    Shadow(
                      color: Colors.black.withOpacity(0.3),
                      offset: const Offset(0, 2),
                      blurRadius: 4,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 48),
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
                          horizontal: 32, vertical: 20),
                      elevation: 8,
                      shadowColor: AppTheme.secondaryTeal.withOpacity(0.4),
                    ),
                    child: const Text('Book Appointment'),
                  ),
                  OutlinedButton(
                    onPressed: () => Navigator.pushNamed(context, '/services'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: const BorderSide(color: Colors.white, width: 2),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 32, vertical: 20),
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
      padding: const EdgeInsets.symmetric(vertical: 60, horizontal: 24),
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppTheme.secondaryTeal,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(width: 12),
              const Text(
                'ABOUT US',
                style: TextStyle(
                  color: AppTheme.secondaryTeal,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 2.0,
                  fontSize: 14,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Text(
            'Your Trusted Path to Success',
            style: Theme.of(context).textTheme.displayLarge?.copyWith(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  letterSpacing: -0.5,
                ),
          ),
          const SizedBox(height: 20),
          const Text(
            'We provide dedicated professional assistance tailored to your unique application needs, ensuring every step is seamless.',
            style: TextStyle(
              color: AppTheme.textMuted,
              fontSize: 18,
              height: 1.6,
            ),
          ),
          const SizedBox(height: 40),
          LayoutBuilder(
            builder: (context, constraints) {
              return GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: constraints.maxWidth > 500 ? 4 : 2,
                mainAxisSpacing: 20,
                crossAxisSpacing: 20,
                childAspectRatio: 1.1,
                children: [
                  _buildStatCard(context, '1000+', 'Happy Clients',
                      Icons.people_alt_rounded),
                  _buildStatCard(context, _insuranceCount.toString(),
                      'Insurance', Icons.verified_user_rounded),
                  _buildStatCard(context, _dealershipCount.toString(),
                      'Dealers', Icons.directions_car_rounded),
                  _buildStatCard(context, _rentalCount.toString(), 'Rentals',
                      Icons.home_work_rounded),
                  _buildStatCard(context, _communityCount.toString(),
                      'Community', Icons.people_rounded),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(
      BuildContext context, String value, String label, IconData icon) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.backgroundLight,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: AppTheme.secondaryTeal.withOpacity(0.5), size: 32),
          const SizedBox(height: 12),
          Text(
            value,
            style: const TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w900,
              color: AppTheme.primaryBlue,
            ),
          ),
          Text(
            label,
            style: const TextStyle(
              color: AppTheme.textMuted,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTestimonialsSummary(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 80, horizontal: 24),
      decoration: BoxDecoration(
        color: AppTheme.primaryBlue.withOpacity(0.02),
        image: DecorationImage(
          image: const AssetImage('assets/hero-image.png'),
          fit: BoxFit.cover,
          opacity: 0.05,
          colorFilter: ColorFilter.mode(
              AppTheme.primaryBlue.withOpacity(0.1), BlendMode.dstATop),
        ),
      ),
      child: Column(
        children: [
          const Icon(Icons.format_quote_rounded,
              size: 64, color: AppTheme.secondaryTeal),
          const SizedBox(height: 16),
          const Text(
            'Client Voices',
            style: TextStyle(
              fontSize: 36,
              fontWeight: FontWeight.bold,
              color: AppTheme.primaryBlue,
            ),
          ),
          const SizedBox(height: 48),
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
          const SizedBox(height: 40),
          TextButton.icon(
            onPressed: () => Navigator.pushNamed(context, '/testimonials'),
            label: const Text('View All Stories',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            icon: const Icon(Icons.arrow_forward_rounded),
            style:
                TextButton.styleFrom(foregroundColor: AppTheme.secondaryTeal),
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
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 40,
            offset: const Offset(0, 20),
          ),
        ],
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
                  style: const TextStyle(
                    fontSize: 20,
                    fontStyle: FontStyle.italic,
                    height: 1.6,
                    color: AppTheme.textDark,
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
                        fontWeight: FontWeight.bold,
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
              const CircleAvatar(
                backgroundColor: AppTheme.secondaryTeal,
                child: Icon(Icons.person, color: Colors.white),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(author,
                        style: const TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 18),
                        overflow: TextOverflow.ellipsis),
                    Text(location,
                        style: const TextStyle(color: AppTheme.textMuted),
                        overflow: TextOverflow.ellipsis),
                  ],
                ),
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
    ];

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 80, horizontal: 24),
      color: Colors.white,
      child: Column(
        children: [
          const Text(
            'OUR SERVICES',
            style: TextStyle(
              color: AppTheme.secondaryTeal,
              fontWeight: FontWeight.w900,
              letterSpacing: 2.0,
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Expertise at Your Service',
            style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryBlue),
          ),
          const SizedBox(height: 48),
          LayoutBuilder(
            builder: (context, constraints) {
              return GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: constraints.maxWidth < 350 ? 2 : 3,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: constraints.maxWidth < 350 ? 0.8 : 0.9,
                ),
                itemCount: services.length,
                itemBuilder: (context, index) {
                  return _buildServiceSmallCard(
                    services[index]['icon'] as IconData,
                    services[index]['title'] as String,
                    context,
                  );
                },
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildServiceSmallCard(
      IconData icon, String title, BuildContext context) {
    return InkWell(
      onTap: () {
        if (title == 'Community') {
          Navigator.pushNamed(context, '/community-services');
        } else {
          Navigator.pushNamed(context, '/services');
        }
      },
      borderRadius: BorderRadius.circular(24),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppTheme.backgroundLight,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: Colors.grey.shade100),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.secondaryTeal.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: FaIcon(icon, color: AppTheme.secondaryTeal, size: 24),
            ),
            const SizedBox(height: 16),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  color: AppTheme.primaryBlue),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCTA(BuildContext context) {
    final isSmall = MediaQuery.of(context).size.width < 400;
    return Container(
      margin: EdgeInsets.all(isSmall ? 16 : 24),
      padding: EdgeInsets.all(isSmall ? 24 : 48),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppTheme.primaryBlue, Color(0xFF003060)],
        ),
        borderRadius: BorderRadius.circular(isSmall ? 24 : 40),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primaryBlue.withOpacity(0.3),
            blurRadius: 30,
            offset: const Offset(0, 15),
          ),
        ],
      ),
      child: Column(
        children: [
          Text(
            'Ready to Excel?',
            textAlign: TextAlign.center,
            style: TextStyle(
                color: Colors.white,
                fontSize: isSmall ? 28 : 36,
                fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          Text(
            'Let our 20+ years of expertise guide your journey today.',
            textAlign: TextAlign.center,
            style: TextStyle(
                color: Colors.white.withOpacity(0.8),
                fontSize: isSmall ? 16 : 18),
          ),
          const SizedBox(height: 40),
          ElevatedButton(
            onPressed: () => Navigator.pushNamed(context, '/appointment'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: AppTheme.primaryBlue,
              padding: EdgeInsets.symmetric(
                  horizontal: isSmall ? 32 : 48, vertical: isSmall ? 16 : 24),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(isSmall ? 12 : 20)),
            ),
            child: Text('Start Now',
                style: TextStyle(fontSize: isSmall ? 16 : 18)),
          ),
        ],
      ),
    );
  }
}
