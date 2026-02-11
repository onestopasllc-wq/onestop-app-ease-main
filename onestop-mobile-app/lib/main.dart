import 'package:flutter/material.dart';
import 'package:onestop_mobile_app/theme/app_theme.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:onestop_mobile_app/services/supabase_service.dart';
import 'package:onestop_mobile_app/screens/home_page.dart';
import 'package:onestop_mobile_app/screens/services_page.dart';
import 'package:onestop_mobile_app/screens/rentals_page.dart';
import 'package:onestop_mobile_app/screens/auth/login_page.dart';
import 'package:onestop_mobile_app/screens/auth/register_page.dart';
import 'package:onestop_mobile_app/screens/about_page.dart';
import 'package:onestop_mobile_app/screens/contact_page.dart';
import 'package:onestop_mobile_app/screens/faq_page.dart';
import 'package:onestop_mobile_app/screens/testimonials_page.dart';
import 'package:onestop_mobile_app/screens/booking_page.dart';
import 'package:onestop_mobile_app/screens/services/legal_jobs_page.dart';
import 'package:onestop_mobile_app/screens/services/dealerships_page.dart';
import 'package:onestop_mobile_app/screens/services/insurance_page.dart';
import 'package:onestop_mobile_app/screens/services/health_insurance_page.dart';
import 'package:onestop_mobile_app/screens/appointment_success_page.dart';
import 'package:onestop_mobile_app/screens/dashboard/dashboard_page.dart';
import 'package:onestop_mobile_app/screens/dashboard/user_listings_page.dart';
import 'package:onestop_mobile_app/screens/dashboard/profile_settings_page.dart';
import 'package:onestop_mobile_app/screens/dashboard/new_rental_page.dart';
import 'package:onestop_mobile_app/screens/splash_screen.dart';
import 'package:flutter/foundation.dart';

void main() async {
  try {
    WidgetsFlutterBinding.ensureInitialized();
    await SupabaseService.initialize();

    // Initialize Stripe (Mobile only)
    if (!kIsWeb) {
      Stripe.publishableKey =
          "pk_live_51SUvATLNM1n9o0HwI1vE7v4A9M9u1w7Q6q..."; // Replace with your actual publishable key
      await Stripe.instance.applySettings();
    }
  } catch (e) {
    debugPrint('Supabase initialization failed: $e');
  }

  runApp(const OneStopApp());
}

class OneStopApp extends StatelessWidget {
  const OneStopApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'OneStop Application Services',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      initialRoute: '/splash',
      routes: {
        '/splash': (context) => const SplashScreen(),
        '/': (context) => const HomePage(),
        '/services': (context) => const ServicesPage(),
        '/rentals': (context) => const RentalsPage(),
        '/login': (context) => const LoginPage(),
        '/register': (context) => const RegisterPage(),
        '/about': (context) => const AboutPage(),
        '/contact': (context) => const ContactPage(),
        '/faq': (context) => const FAQPage(),
        '/testimonials': (context) => const TestimonialsPage(),
        '/appointment': (context) => const BookingPage(),
        '/jobs': (context) => const LegalJobsPage(),
        '/dealerships': (context) => const DealershipsPage(),
        '/insurance': (context) => const InsurancePage(),
        '/health-insurance': (context) => const HealthInsurancePage(),
        '/appointment-success': (context) {
          final args = ModalRoute.of(context)!.settings.arguments
              as Map<String, dynamic>?;
          return AppointmentSuccessPage(sessionId: args?['session_id']);
        },
        '/dashboard': (context) => const DashboardPage(),
        '/dashboard/listings': (context) => const UserListingsPage(),
        '/settings': (context) => const ProfileSettingsPage(),
        '/rentals/new': (context) => const NewRentalPage(),
      },
    );
  }
}
