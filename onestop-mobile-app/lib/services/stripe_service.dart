import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:onestop_mobile_app/services/supabase_service.dart';

class StripeService {
  static Future<void> init() async {
    // Initialization handled in main.dart
  }

  /// Mobile only: Create a Payment Intent
  static Future<Map<String, dynamic>?> createPaymentIntent(
      Map<String, dynamic> bookingData) async {
    try {
      debugPrint('StripeService: Calling create-payment-intent...');
      final response = await SupabaseService.client.functions.invoke(
        'create-payment-intent',
        body: {'bookingData': bookingData},
      );

      debugPrint('StripeService: Response status: ${response.status}');
      if (response.status != 200) {
        throw Exception('Server error (${response.status}): ${response.data}');
      }

      return response.data as Map<String, dynamic>;
    } catch (e) {
      debugPrint('StripeService: Error creating payment intent: $e');
      return null;
    }
  }

  /// Web fallback: Create a Checkout Session
  static Future<Map<String, dynamic>?> createCheckoutSession(
      Map<String, dynamic> bookingData) async {
    try {
      debugPrint('StripeService: Calling create-checkout (Web mode)...');
      final response = await SupabaseService.client.functions.invoke(
        'create-checkout',
        body: {'bookingData': bookingData},
      );

      debugPrint('StripeService: Response status: ${response.status}');
      if (response.status != 200) {
        throw Exception('Server error (${response.status}): ${response.data}');
      }

      return response.data as Map<String, dynamic>;
    } catch (e) {
      debugPrint('StripeService: Error creating checkout session: $e');
      return null;
    }
  }

  /// Mobile only: Present Payment Sheet
  static Future<bool> presentPaymentSheet({
    required String clientSecret,
    String? publishableKey,
  }) async {
    if (kIsWeb) {
      debugPrint(
          'StripeService: presentPaymentSheet is not supported on Web. Use createCheckoutSession instead.');
      return false;
    }

    try {
      if (publishableKey != null && publishableKey.isNotEmpty) {
        debugPrint('StripeService: Setting publishable key from server...');
        Stripe.publishableKey = publishableKey;
        await Stripe.instance.applySettings();
      }

      await Stripe.instance.initPaymentSheet(
        paymentSheetParameters: SetupPaymentSheetParameters(
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: 'OneStop Application Services',
          style: ThemeMode.light,
        ),
      );

      await Stripe.instance.presentPaymentSheet();
      debugPrint('StripeService: Payment sheet presented successfully');
      return true;
    } catch (e) {
      if (e is StripeException) {
        debugPrint('Stripe Error: ${e.error.localizedMessage}');
      } else {
        debugPrint('Error presenting payment sheet: $e');
      }
      return false;
    }
  }
}
