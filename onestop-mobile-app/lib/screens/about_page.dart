import 'package:flutter/material.dart';
import 'package:onestop_mobile_app/theme/app_theme.dart';
import 'package:onestop_mobile_app/widgets/main_scaffold.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';

class AboutPage extends StatelessWidget {
  const AboutPage({super.key});

  @override
  Widget build(BuildContext context) {
    final values = [
      {
        'icon': Icons.verified_user_outlined,
        'title': 'Professionalism',
        'description':
            'We maintain the highest standards of professionalism in every interaction, ensuring accuracy and reliability.',
      },
      {
        'icon': Icons.people_outline,
        'title': 'Accessibility',
        'description':
            'We believe everyone deserves quality assistance. Our services are accessible and affordable.',
      },
      {
        'icon': Icons.track_changes_outlined,
        'title': 'Accuracy',
        'description':
            'Attention to detail is our priority. We ensure every application is thoroughly reviewed.',
      },
    ];

    return MainScaffold(
      currentIndex: 1,
      title: 'About Us',
      body: AnimationLimiter(
        child: SingleChildScrollView(
          child: Column(
            children: AnimationConfiguration.toStaggeredList(
              duration: const Duration(milliseconds: 500),
              childAnimationBuilder: (widget) => FadeInAnimation(
                child: SlideAnimation(
                  verticalOffset: 30.0,
                  child: widget,
                ),
              ),
              children: [
                _buildAboutHero(context),
                _buildMission(context),
                _buildFounder(context),
                _buildValues(context, values),
                _buildContactInfo(context),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAboutHero(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 80, horizontal: 24),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppTheme.primaryBlue, AppTheme.secondaryTeal],
        ),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.15),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: Colors.white.withOpacity(0.2)),
            ),
            child: const Text(
              'Est. 2024',
              style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'About OneStop',
            style: TextStyle(
              color: Colors.white,
              fontSize: MediaQuery.of(context).size.width < 380 ? 32 : 40,
              fontWeight: FontWeight.w900,
              letterSpacing: -1,
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Your trusted partner in navigating complex application processes',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.white70,
              fontSize: 18,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMission(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 60, horizontal: 32),
      child: Column(
        children: [
          const Icon(Icons.rocket_launch_rounded,
              color: AppTheme.secondaryTeal, size: 48),
          const SizedBox(height: 24),
          Text(
            'Empowering Success Through Simplified Applications',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.displayLarge?.copyWith(
                  fontSize: MediaQuery.of(context).size.width < 380 ? 24 : 28,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.primaryBlue,
                ),
          ),
          const SizedBox(height: 24),
          const Text(
            'At OneStop Application Services LLC, we believe that complex paperwork shouldn\'t stand between you and your dreams. Our mission is to provide professional, accessible, and accurate assistance.',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: AppTheme.textMuted,
              fontSize: 17,
              height: 1.6,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFounder(BuildContext context) {
    return Container(
      color: AppTheme.backgroundLight,
      padding: const EdgeInsets.symmetric(vertical: 80, horizontal: 32),
      child: Column(
        children: [
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(32),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.primaryBlue.withOpacity(0.2),
                  blurRadius: 40,
                  offset: const Offset(0, 20),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(32),
              child: Image.asset(
                'assets/img_dagi.jpg',
                width: 240,
                height: 280,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    width: 240,
                    height: 280,
                    color: AppTheme.primaryBlue.withOpacity(0.1),
                    child: const Icon(Icons.person,
                        size: 80, color: AppTheme.primaryBlue),
                  );
                },
              ),
            ),
          ),
          const SizedBox(height: 32),
          Text(
            'Dagim Mulatu',
            style: TextStyle(
              fontSize: MediaQuery.of(context).size.width < 380 ? 28 : 32,
              fontWeight: FontWeight.w900,
              color: AppTheme.primaryBlue,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'FOUNDER & CEO',
            style: TextStyle(
              color: AppTheme.secondaryTeal,
              fontWeight: FontWeight.w900,
              letterSpacing: 3.0,
              fontSize: 13,
            ),
          ),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: const Text(
              'Dagim founded OneStop with a clear vision: to remove barriers and make professional opportunities accessible to everyone through expert guidance and dedicated support.',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: AppTheme.textDark,
                height: 1.6,
                fontSize: 16,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildValues(BuildContext context, List<Map<String, dynamic>> values) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 80, horizontal: 32),
      child: Column(
        children: [
          const Text(
            'OUR VALUES',
            style: TextStyle(
              color: AppTheme.secondaryTeal,
              fontWeight: FontWeight.w900,
              letterSpacing: 2.0,
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            'What We Stand For',
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: AppTheme.primaryBlue,
            ),
          ),
          const SizedBox(height: 48),
          ...values.map((value) => Padding(
                padding: const EdgeInsets.only(bottom: 32),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppTheme.secondaryTeal.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Icon(value['icon'] as IconData,
                          color: AppTheme.secondaryTeal, size: 28),
                    ),
                    const SizedBox(width: 20),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            value['title'] as String,
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.primaryBlue,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            value['description'] as String,
                            style: const TextStyle(
                              color: AppTheme.textMuted,
                              height: 1.5,
                              fontSize: 15,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }

  Widget _buildContactInfo(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(24),
      padding: const EdgeInsets.symmetric(vertical: 60, horizontal: 32),
      decoration: BoxDecoration(
        color: AppTheme.primaryBlue,
        borderRadius: BorderRadius.circular(40),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppTheme.primaryBlue,
            AppTheme.primaryBlue.withOpacity(0.9),
          ],
        ),
      ),
      child: Column(
        children: [
          const Text(
            'Let\'s Start Your Journey',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Ready to simplify your application process? Get in touch today.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white70, fontSize: 16),
          ),
          const SizedBox(height: 40),
          _buildQuickAction(Icons.phone_rounded, '+1 (571) 660-4984'),
          const SizedBox(height: 12),
          _buildQuickAction(Icons.email_rounded, 'info@onestopasllc.com'),
        ],
      ),
    );
  }

  Widget _buildQuickAction(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: AppTheme.secondaryTeal, size: 20),
          const SizedBox(width: 12),
          Flexible(
            child: Text(
              label,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                fontSize: 14,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}
