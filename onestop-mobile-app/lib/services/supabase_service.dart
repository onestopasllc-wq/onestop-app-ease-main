import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter/foundation.dart';
import 'package:onestop_mobile_app/models/dealership.dart';
import 'package:onestop_mobile_app/models/insurance_provider.dart';
import 'package:onestop_mobile_app/models/rental_listing.dart';
import 'package:onestop_mobile_app/models/testimonial.dart';
import 'package:onestop_mobile_app/models/service.dart';
import 'package:onestop_mobile_app/models/community_service.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class SupabaseService {
  static Future<void> initialize() async {
    try {
      debugPrint('SupabaseService: Initializing Supabase...');
      await Supabase.initialize(
        url: 'https://qhocfxggmhmrbyezmhsg.supabase.co',
        anonKey:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFob2NmeGdnbWhtcmJ5ZXptaHNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NzAyMjIsImV4cCI6MjA3ODU0NjIyMn0.dC3b_QaPHHyldNxSRFJDnJ_fXmlf1dja9dC7Y5tbxt0',
      );
      debugPrint('SupabaseService: Supabase initialized successfully');
    } catch (e) {
      debugPrint('SupabaseService: Supabase initialization failed: $e');
      rethrow;
    }
  }

  static SupabaseClient get client => Supabase.instance.client;

  // Fetch Dealerships
  static Future<List<Dealership>> fetchDealerships() async {
    try {
      debugPrint('SupabaseService: Fetching dealerships...');
      final response = await client
          .from('dealerships')
          .select()
          // .eq('is_active', true)
          .order('is_featured', ascending: false)
          .order('display_order', ascending: true);

      debugPrint('SupabaseService: Raw response for dealerships: $response');
      final list = response as List;
      debugPrint('SupabaseService: Fetched ${list.length} dealerships');
      return list.map((m) => Dealership.fromJson(m)).toList();
    } catch (e) {
      debugPrint('SupabaseService: Error fetching dealerships: $e');
      return [];
    }
  }

  // Fetch Insurance Providers
  static Future<List<InsuranceProvider>> fetchInsuranceProviders() async {
    try {
      debugPrint('SupabaseService: Fetching insurance providers...');
      final response = await client
          .from('insurance_providers')
          .select()
          // .eq('is_active', true)
          .order('display_order', ascending: true);

      debugPrint('SupabaseService: Raw response for insurance: $response');
      final list = response as List;
      debugPrint('SupabaseService: Fetched ${list.length} insurance providers');
      return list.map((m) => InsuranceProvider.fromJson(m)).toList();
    } catch (e) {
      debugPrint('SupabaseService: Error fetching insurance providers: $e');
      return [];
    }
  }

  // Fetch Health Insurance Providers
  static Future<List<InsuranceProvider>> fetchHealthInsuranceProviders() async {
    try {
      debugPrint('SupabaseService: Fetching health insurance providers...');
      final response = await client
          .from('health_insurance_providers')
          .select()
          // .eq('is_active', true)
          .order('display_order', ascending: true);

      debugPrint(
          'SupabaseService: Raw response for health insurance: $response');
      final list = response as List;
      debugPrint(
          'SupabaseService: Fetched ${list.length} health insurance providers');
      return list.map((m) => InsuranceProvider.fromJson(m)).toList();
    } catch (e) {
      debugPrint(
          'SupabaseService: Error fetching health insurance providers: $e');
      return [];
    }
  }

  // Fetch Rental Listings
  static Future<List<RentalListing>> fetchRentalListings() async {
    try {
      debugPrint('SupabaseService: Fetching rental listings...');

      // Fetch from both tables to match website logic
      final responses = await Future.wait([
        client
            .from('rental_listings')
            .select()
            .eq('status', 'approved')
            .order('created_at', ascending: false),
        client
            .from('admin_rentals')
            .select()
            .order('created_at', ascending: false),
      ]);

      final userRentals = responses[0] as List;
      final adminRentals = responses[1] as List;

      final combined = [...userRentals, ...adminRentals];

      // Sort by created_at descending
      combined.sort((a, b) {
        final aTime = DateTime.parse(a['created_at'] as String);
        final bTime = DateTime.parse(b['created_at'] as String);
        return bTime.compareTo(aTime);
      });

      debugPrint(
          'SupabaseService: Fetched ${combined.length} total rental listings');
      return combined.map((m) => RentalListing.fromJson(m)).toList();
    } catch (e) {
      debugPrint('SupabaseService: Error fetching rental listings: $e');
      return [];
    }
  }

  // Fetch Community Services
  static Future<List<CommunityService>> fetchCommunityServices() async {
    try {
      debugPrint('SupabaseService: Fetching community services...');
      final response = await client
          .from('community_services')
          .select()
          .eq('is_active', true)
          .order('is_featured', ascending: false)
          .order('display_order', ascending: true);

      debugPrint(
          'SupabaseService: Raw response for community services: $response');
      final list = response as List;
      debugPrint('SupabaseService: Fetched ${list.length} community services');
      return list.map((m) => CommunityService.fromJson(m)).toList();
    } catch (e) {
      debugPrint('SupabaseService: Error fetching community services: $e');
      return [];
    }
  }

  // Fetch Testimonials
  static Future<List<Testimonial>> fetchTestimonials() async {
    try {
      debugPrint('SupabaseService: Fetching testimonials...');
      final response = await client
          .from('testimonials')
          .select()
          .eq('is_active', true)
          .order('display_order', ascending: true);

      debugPrint('SupabaseService: Raw response for testimonials: $response');
      final list = response as List;
      debugPrint('SupabaseService: Fetched ${list.length} testimonials');
      return list.map((m) => Testimonial.fromJson(m)).toList();
    } catch (e) {
      debugPrint('SupabaseService: Error fetching testimonials: $e');
      return [];
    }
  }

  // Fetch Services
  static Future<List<Service>> fetchServices() async {
    // Note: This is currently hardcoded but structure is ready for Supabase
    return [
      Service(
        title: 'Visa Form Preparation (Non-Legal)',
        description:
            'Expert assistance with visa application forms and documentation.',
        icon: FontAwesomeIcons.fileLines,
        features: [
          'Complete visa application form assistance',
          'Document checklist and organization',
          'Application review and verification',
          'Submission guidance and tracking',
          'Interview preparation support',
        ],
      ),
      Service(
        title: 'College & University Application Support',
        description:
            'Comprehensive guidance through higher education admissions.',
        icon: FontAwesomeIcons.graduationCap,
        features: [
          'College selection and research assistance',
          'Application form completion support',
          'Essay review and feedback',
          'Transcript and document preparation',
          'Financial aid application guidance',
          'Deadline tracking and management',
        ],
      ),
      Service(
        title: 'Document Evaluation Application Support',
        description: 'Professional help with credential evaluation services.',
        icon: FontAwesomeIcons.globe,
        features: [
          'Credential evaluation agency selection',
          'Application form assistance',
          'Document translation coordination',
          'Authentication and verification support',
          'Progress tracking and follow-up',
        ],
      ),
      Service(
        title: 'Exam & Licensing Board Application Support',
        description:
            'Support for professional certification and licensing applications.',
        icon: FontAwesomeIcons.userCheck,
        features: [
          'Licensing board application assistance',
          'Exam registration support',
          'Eligibility requirement review',
          'Documentation preparation',
          'Application status monitoring',
          'Renewal and continuing education tracking',
        ],
      ),
      Service(
        title: 'Career Readiness & Job Application Support',
        description:
            'Strategic assistance for job seekers and career changers.',
        icon: FontAwesomeIcons.briefcase,
        features: [
          'Resume and CV optimization',
          'Cover letter development',
          'LinkedIn profile enhancement',
          'Job search strategy consultation',
          'ATS optimization',
          'Interview preparation coaching',
        ],
      ),
      Service(
        title: 'Business License & Related Application Support',
        description:
            'Complete support for business registration and licensing.',
        icon: FontAwesomeIcons.building,
        features: [
          'Business entity selection guidance',
          'License and permit identification',
          'Application form completion',
          'Regulatory compliance assistance',
          'Renewal and update support',
          'Multi-jurisdictional applications',
        ],
      ),
      Service(
        title: 'Website Development',
        description:
            'Professional, responsive, and high-performance web solutions.',
        icon: FontAwesomeIcons.laptopCode,
        features: [
          'Custom responsive web design',
          'E-commerce & CMS solutions',
          'Modern UI/UX implementation',
          'Performance & speed optimization',
          'SEO-friendly architecture',
          'Ongoing maintenance and support',
        ],
      ),
      Service(
        title: 'Mobile Application Development',
        description:
            'Innovative iOS and Android apps tailored to your business.',
        icon: FontAwesomeIcons.mobileScreenButton,
        features: [
          'Native iOS and Android development',
          'Cross-platform solutions (Flutter/React Native)',
          'User-centric mobile interface design',
          'App Store & Play Store deployment',
          'Push notifications & real-time features',
          'Third-party API integrations',
        ],
      ),
      Service(
        title: 'Logo & Brand Identity Design',
        description:
            'Professional and modern design to elevate your brand presence.',
        icon: FontAwesomeIcons.palette,
        features: [
          'Modern and minimalist logo concepts',
          'Complete brand identity development',
          'Vector-based high-resolution assets',
          'Typography & color palette selection',
          'Professional brand guidelines',
          'Social media & design assets',
        ],
      ),
    ];
  }
}
