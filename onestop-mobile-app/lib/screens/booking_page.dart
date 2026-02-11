import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:onestop_mobile_app/theme/app_theme.dart';
import 'package:onestop_mobile_app/widgets/main_scaffold.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:onestop_mobile_app/services/stripe_service.dart';

class BookingPage extends StatefulWidget {
  const BookingPage({super.key});

  @override
  State<BookingPage> createState() => _BookingPageState();
}

class _BookingPageState extends State<BookingPage> {
  int _currentStep = 0;
  bool _loading = false;
  final _formKey = GlobalKey<FormState>();

  // Form Controllers
  final _fullNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _stateController = TextEditingController();
  final _cityController = TextEditingController();
  final _descriptionController = TextEditingController();

  String? _selectedContactMethod;
  String? _selectedCountry;
  final List<String> _selectedServices = [];
  DateTime? _selectedDate;
  String? _selectedTimeSlot;

  // State for dynamic slots
  List<String> _availableSlots = [];
  bool _loadingSlots = false;

  final List<String> _servicesList = [
    "College & University Application Support",
    "Document Evaluation Application Support",
    "Exam & Licensing Board Application Support",
    "Career Readiness & Job Application Support",
  ];

  final List<String> _contactMethods = [
    "Email",
    "Phone",
    "Telegram",
    "WhatsApp"
  ];

  @override
  Widget build(BuildContext context) {
    return MainScaffold(
      currentIndex: -1,
      title: 'Book Appointment',
      body: Stack(
        children: [
          Form(
            key: _formKey,
            child: Stepper(
              type: StepperType.horizontal,
              currentStep: _currentStep,
              onStepContinue: () {
                if (_currentStep < 3) {
                  if (_formKey.currentState!.validate()) {
                    if (_currentStep == 1 && _selectedServices.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                            content:
                                Text('Please select at least one service')),
                      );
                      return;
                    }
                    if (_currentStep == 2 &&
                        (_selectedDate == null || _selectedTimeSlot == null)) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                            content:
                                Text('Please select a date and time slot')),
                      );
                      return;
                    }
                    setState(() => _currentStep += 1);
                  }
                } else {
                  _handleBooking();
                }
              },
              onStepCancel: () {
                if (_currentStep > 0) {
                  setState(() => _currentStep -= 1);
                }
              },
              steps: [
                Step(
                  title: const Text('Info'),
                  isActive: _currentStep >= 0,
                  content: _buildPersonalInfoStep(),
                ),
                Step(
                  title: const Text('Service'),
                  isActive: _currentStep >= 1,
                  content: _buildServicesStep(),
                ),
                Step(
                  title: const Text('Time'),
                  isActive: _currentStep >= 2,
                  content: _buildDateTimeStep(),
                ),
                Step(
                  title: const Text('Confirm'),
                  isActive: _currentStep >= 3,
                  content: _buildConfirmationStep(),
                ),
              ],
            ),
          ),
          if (_loading)
            Container(
              color: Colors.black26,
              child: const Center(
                child: CircularProgressIndicator(),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildPersonalInfoStep() {
    return Column(
      children: [
        TextFormField(
            controller: _fullNameController,
            decoration: const InputDecoration(labelText: 'Full Name *'),
            validator: (value) => value == null || value.isEmpty
                ? 'Please enter your name'
                : null),
        const SizedBox(height: 16),
        TextFormField(
            controller: _emailController,
            decoration: const InputDecoration(labelText: 'Email *'),
            keyboardType: TextInputType.emailAddress,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter your email';
              }
              if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$')
                  .hasMatch(value)) {
                return 'Please enter a valid email';
              }
              return null;
            }),
        const SizedBox(height: 16),
        TextFormField(
            controller: _phoneController,
            decoration: const InputDecoration(labelText: 'Phone'),
            keyboardType: TextInputType.phone),
        const SizedBox(height: 16),
        TextFormField(
            controller: _stateController,
            decoration: const InputDecoration(labelText: 'State *'),
            validator: (value) => value == null || value.isEmpty
                ? 'Please enter your state'
                : null),
        const SizedBox(height: 16),
        TextFormField(
            controller: _cityController,
            decoration: const InputDecoration(labelText: 'City *'),
            validator: (value) => value == null || value.isEmpty
                ? 'Please enter your city'
                : null),
        const SizedBox(height: 16),
        DropdownButtonFormField<String>(
          initialValue: _selectedContactMethod,
          items: _contactMethods
              .map((m) =>
                  DropdownMenuItem(value: m.toLowerCase(), child: Text(m)))
              .toList(),
          onChanged: (val) => setState(() => _selectedContactMethod = val),
          validator: (value) => value == null || value.isEmpty
              ? 'Please select a contact method'
              : null,
          decoration:
              const InputDecoration(labelText: 'Preferred Contact Method *'),
        ),
      ],
    );
  }

  Widget _buildServicesStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Select Services *',
            style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        ..._servicesList.map((s) => CheckboxListTile(
              title: Text(s),
              value: _selectedServices.contains(s),
              onChanged: (val) {
                setState(() {
                  if (val!) {
                    _selectedServices.add(s);
                  } else {
                    _selectedServices.remove(s);
                  }
                });
              },
            )),
        const SizedBox(height: 16),
        TextField(
          controller: _descriptionController,
          decoration: const InputDecoration(
              labelText: 'Additional Details', border: OutlineInputBorder()),
          maxLines: 3,
        ),
      ],
    );
  }

  Widget _buildDateTimeStep() {
    return Column(
      children: [
        ListTile(
          title: Text(_selectedDate == null
              ? 'Select Date'
              : DateFormat('EEEE, MMM d, yyyy').format(_selectedDate!)),
          trailing: const Icon(Icons.calendar_today),
          onTap: () async {
            final date = await showDatePicker(
              context: context,
              initialDate: DateTime.now().add(const Duration(days: 1)),
              firstDate: DateTime.now(),
              lastDate: DateTime.now().add(const Duration(days: 90)),
            );
            if (date != null) {
              setState(() {
                _selectedDate = date;
                _selectedTimeSlot = null;
              });
              _fetchSlots(date);
            }
          },
        ),
        const SizedBox(height: 16),
        if (_selectedDate != null) ...[
          const Text('Available Slots (EST)',
              style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          if (_loadingSlots)
            const Center(child: CircularProgressIndicator())
          else if (_availableSlots.isEmpty)
            const Text('No slots available for this day')
          else
            Wrap(
              spacing: 8,
              children: _availableSlots
                  .map((slot) => ChoiceChip(
                        label: Text(slot),
                        selected: _selectedTimeSlot == slot,
                        onSelected: (val) =>
                            setState(() => _selectedTimeSlot = slot),
                      ))
                  .toList(),
            ),
        ],
      ],
    );
  }

  Widget _buildConfirmationStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Summary',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const Divider(),
        Text('Name: ${_fullNameController.text}'),
        Text('Email: ${_emailController.text}'),
        Text('Services: ${_selectedServices.join(", ")}'),
        Text(
            'Date: ${_selectedDate != null ? DateFormat('MMM d, yyyy').format(_selectedDate!) : "Not selected"}'),
        Text('Time: ${_selectedTimeSlot ?? "Not selected"}'),
        const SizedBox(height: 24),
        const Text('Deposit Required: \$75',
            style: TextStyle(
                color: AppTheme.secondaryTeal,
                fontWeight: FontWeight.bold,
                fontSize: 18)),
      ],
    );
  }

  Future<void> _fetchSlots(DateTime date) async {
    setState(() => _loadingSlots = true);
    // Mocking slot fetch logic
    await Future.delayed(const Duration(seconds: 1));
    setState(() {
      _availableSlots = [
        "09:00 AM",
        "10:00 AM",
        "11:00 AM",
        "01:00 PM",
        "02:00 PM",
        "03:00 PM"
      ];
      _loadingSlots = false;
    });
  }

  void _handleBooking() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedServices.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select at least one service')),
      );
      return;
    }
    if (_selectedDate == null || _selectedTimeSlot == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a date and time slot')),
      );
      return;
    }

    setState(() => _loading = true);

    try {
      final bookingData = {
        'full_name': _fullNameController.text,
        'email': _emailController.text,
        'phone': _phoneController.text,
        'state': _stateController.text,
        'city': _cityController.text,
        'contact_method': _selectedContactMethod,
        'services': _selectedServices,
        'description': _descriptionController.text,
        'appointment_date': DateFormat('yyyy-MM-dd').format(_selectedDate!),
        'appointment_time': _selectedTimeSlot,
        'status': 'pending',
      };

      if (kIsWeb) {
        // --- WEB FALLBACK ---
        debugPrint('BookingPage: Running on Web, using checkout URL flow...');
        final checkoutData =
            await StripeService.createCheckoutSession(bookingData);

        if (checkoutData == null || checkoutData['url'] == null) {
          throw Exception('Failed to create checkout session');
        }

        final url = Uri.parse(checkoutData['url']);
        if (await canLaunchUrl(url)) {
          await launchUrl(url, mode: LaunchMode.externalApplication);
        } else {
          throw Exception('Could not launch payment URL');
        }
        return; // Web usually relies on the success_url redirect
      }

      // --- MOBILE FLOW ---
      // 1. Create Payment Intent
      final intentData = await StripeService.createPaymentIntent(bookingData);
      if (intentData == null) {
        throw Exception('Failed to initialize payment');
      }

      // 2. Present Payment Sheet
      final success = await StripeService.presentPaymentSheet(
        clientSecret: intentData['paymentIntent'],
        publishableKey: intentData['publishableKey'],
      );

      if (success) {
        // 3. Save to Supabase (Manual save because user prefers not to touch shared webhook)
        await Supabase.instance.client.from('appointments').insert({
          ...bookingData,
          'status': 'confirmed',
          'payment_status': 'paid',
          'stripe_payment_intent_id': intentData['paymentIntentId'],
        });

        if (mounted) {
          Navigator.pushReplacementNamed(
            context,
            '/appointment-success',
            arguments: {'session_id': intentData['paymentIntentId']},
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Payment cancelled or failed')),
          );
        }
      }
    } catch (e) {
      debugPrint('Booking Error: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _stateController.dispose();
    _cityController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }
}
