import 'package:flutter/material.dart';
import 'package:onestop_mobile_app/theme/app_theme.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:async';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  late AnimationController _mainController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;

  late AnimationController _shimmerController;
  late Animation<double> _shimmerAnimation;

  @override
  void initState() {
    super.initState();

    // Main entrance animation (Scale & Fade)
    _mainController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );

    _scaleAnimation = TweenSequence<double>([
      TweenSequenceItem(
          tween: Tween(begin: 0.8, end: 1.1)
              .chain(CurveTween(curve: Curves.easeOutBack)),
          weight: 70),
      TweenSequenceItem(
          tween: Tween(begin: 1.1, end: 1.0)
              .chain(CurveTween(curve: Curves.easeInOut)),
          weight: 30),
    ]).animate(_mainController);

    _fadeAnimation = CurvedAnimation(
      parent: _mainController,
      curve: const Interval(0.0, 0.6, curve: Curves.easeIn),
    );

    // Shimmer effect animation
    _shimmerController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    );

    _shimmerAnimation = Tween<double>(begin: -2.0, end: 2.0).animate(
      CurvedAnimation(parent: _shimmerController, curve: Curves.easeInOutSine),
    );

    _startSequence();
  }

  void _startSequence() async {
    // Start main animation
    _mainController.forward();

    // Start shimmer slightly after
    await Future.delayed(const Duration(milliseconds: 800));
    if (mounted) _shimmerController.repeat();

    // Transition to Home after total 3 seconds
    await Future.delayed(const Duration(milliseconds: 3000));
    if (mounted) {
      Navigator.of(context).pushReplacementNamed('/');
    }
  }

  @override
  void dispose() {
    _mainController.dispose();
    _shimmerController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        fit: StackFit.expand,
        children: [
          // 1. Luxury Light Gradient Background (High Contrast for BG-removed logos)
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xFFF8FAFC), // Light Slate
                  Color(0xFFFFFFFF), // White
                  Color(0xFFF1F5F9), // Slate 100
                ],
              ),
            ),
          ),

          // 2. Sophisticated Light Particles
          ...List.generate(3, (index) {
            return AnimatedBuilder(
              animation: _shimmerController,
              builder: (context, child) {
                return Positioned(
                  top: (index * 200) - (20 * _shimmerAnimation.value),
                  right: (index * 50) + (10 * _shimmerAnimation.value),
                  child: Container(
                    width: 300,
                    height: 300,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppTheme.secondaryTeal.withOpacity(0.03),
                    ),
                  ),
                );
              },
            );
          }),

          // 3. Central Brand Reveal
          Center(
            child: AnimatedBuilder(
              animation:
                  Listenable.merge([_mainController, _shimmerController]),
              builder: (context, child) {
                return FadeTransition(
                  opacity: _fadeAnimation,
                  child: ScaleTransition(
                    scale: _scaleAnimation,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Logo with Dynamic Shimmer
                        ShaderMask(
                          shaderCallback: (bounds) {
                            return LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              stops: [
                                _shimmerAnimation.value - 0.4,
                                _shimmerAnimation.value,
                                _shimmerAnimation.value + 0.4,
                              ],
                              colors: [
                                Colors.grey.withOpacity(0.05),
                                Colors.grey.withOpacity(0.4),
                                Colors.grey.withOpacity(0.05),
                              ],
                            ).createShader(bounds);
                          },
                          blendMode: BlendMode.srcATop,
                          child: Image.asset(
                            'assets/logo_image.png',
                            height: 120,
                            fit: BoxFit.contain,
                          ),
                        ),
                        const SizedBox(height: 50),

                        // Premium Tagline
                        Text(
                          'YOUR COMPLETE SERVICE PORTAL',
                          style: GoogleFonts.outfit(
                            color: AppTheme.textDark.withOpacity(0.8),
                            letterSpacing: 4.5,
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 30),

                        // Discrete Minimalist Loader
                        SizedBox(
                          width: 40,
                          child: LinearProgressIndicator(
                            backgroundColor:
                                AppTheme.primaryBlue.withOpacity(0.05),
                            color: AppTheme.secondaryTeal.withOpacity(0.6),
                            minHeight: 1,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          // 4. Formal Brand Footer
          Positioned(
            bottom: 50,
            left: 0,
            right: 0,
            child: Center(
              child: Text(
                'ONE STOP APPLICATION SERVICES LLC',
                style: GoogleFonts.outfit(
                  color: AppTheme.textDark.withOpacity(0.15),
                  fontSize: 9,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 2,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
