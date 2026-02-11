import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter/foundation.dart';
import 'package:onestop_mobile_app/models/dealership.dart';
import 'package:onestop_mobile_app/models/insurance_provider.dart';
import 'package:onestop_mobile_app/models/rental_listing.dart';
import 'package:onestop_mobile_app/models/testimonial.dart';
import 'package:onestop_mobile_app/models/service.dart';
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
      final response = await client
          .from('rental_listings')
          .select()
          // .eq('status', 'approved')
          .order('created_at', ascending: false);

      debugPrint('SupabaseService: Raw response for rentals: $response');
      final list = response as List;
      debugPrint('SupabaseService: Fetched ${list.length} rental listings');
      return list.map((m) => RentalListing.fromJson(m)).toList();
    } catch (e) {
      debugPrint('SupabaseService: Error fetching rental listings: $e');
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
        title: 'College Application Support',
        description:
            'Guide through admission process, essay review, and application submission.',
        icon: FontAwesomeIcons.graduationCap,
        features: [
          'Admission Counseling',
          'Essay Assistance',
          'Financial Aid Guidance'
        ],
      ),
      Service(
        title: 'Foreign Document Evaluation',
        description:
            'Credential evaluation services for international students and professionals.',
        icon: FontAwesomeIcons.globe,
        features: [
          'Transcript Analysis',
          'Translation Services',
          'Equivalency Reports'
        ],
      ),
      Service(
        title: 'Professional Licensing',
        description:
            'Support for professional certification and licensing applications.',
        icon: FontAwesomeIcons.userCheck,
        features: [
          'Requirements Analysis',
          'Documentation Prep',
          'Exam Registration'
        ],
      ),
      Service(
        title: 'Career Support',
        description:
            'Resume building, interview prep, and job search strategies.',
        icon: FontAwesomeIcons.briefcase,
        features: [
          'Resume Writing',
          'Mock Interviews',
          'Linkedln Optimization'
        ],
      ),
      Service(
        title: 'Health Insurance Support',
        description:
            'Guidance on health insurance applications and plan selection.',
        icon: FontAwesomeIcons.fileMedical,
        features: ['Plan Comparison', 'Application Help', 'Renewal Support'],
      ),
    ];
  }
}
