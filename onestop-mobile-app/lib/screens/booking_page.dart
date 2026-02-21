import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:onestop_mobile_app/theme/app_theme.dart';
import 'package:onestop_mobile_app/widgets/main_scaffold.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:onestop_mobile_app/services/stripe_service.dart';

const List<String> COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Democratic Republic of the Congo",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "East Timor",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kosovo",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe"
];

class BookingPage extends StatefulWidget {
  const BookingPage({super.key});

  @override
  State<BookingPage> createState() => _BookingPageState();
}

class _BookingPageState extends State<BookingPage> {
  SupabaseClient? _supabase;
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
  String? _selectedHowHeard;
  bool _consentChecked = false;

  // State for dynamic slots
  List<String> _availableSlots = [];
  bool _loadingSlots = false;
  List<Map<String, dynamic>> _workingHours = [];
  List<DateTime> _blockedDates = [];

  final List<String> _servicesList = [
    "Visa Form Preparation (Non-Legal)",
    "College & University Application Support",
    "Document Evaluation Application Support",
    "Exam & Licensing Board Application Support",
    "Career Readiness & Job Application Support",
    "Business License & Related Application Support",
    "Website Development",
    "Mobile Application Development",
    "Logo & Brand Identity Design",
  ];

  final List<String> _contactMethods = [
    "Email",
    "Phone",
    "Telegram",
    "WhatsApp"
  ];

  final Map<String, String> _howHeardOptions = {
    'google': 'Google Search',
    'social': 'Social Media',
    'referral': 'Friend/Family Referral',
    'telegram': 'Telegram',
    'other': 'Other',
  };

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
              type: MediaQuery.of(context).size.width < 400
                  ? StepperType.vertical
                  : StepperType.horizontal,
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
        const SizedBox(height: 16),
        DropdownButtonFormField<String>(
          value: _selectedCountry,
          items: COUNTRIES
              .map((c) => DropdownMenuItem(value: c, child: Text(c)))
              .toList(),
          onChanged: (val) => setState(() => _selectedCountry = val),
          validator: (value) => value == null || value.isEmpty
              ? 'Please select your country'
              : null,
          decoration: const InputDecoration(labelText: 'Country/Location *'),
          isExpanded: true,
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
              selectableDayPredicate: (date) {
                // Disable blocked dates
                if (_blockedDates.any((blocked) =>
                    blocked.year == date.year &&
                    blocked.month == date.month &&
                    blocked.day == date.day)) {
                  return false;
                }
                // Check if we have working hours for this day of week
                // date.weekday: 1 (Mon) to 7 (Sun)
                // working_hours.day_of_week: 0 (Sun) to 6 (Sat)
                final dayOfWeek = date.weekday % 7;
                return _workingHours
                    .any((wh) => wh['day_of_week'] == dayOfWeek);
              },
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
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.blue.withOpacity(0.05),
              border: Border.all(color: Colors.blue.withOpacity(0.2)),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                const Icon(Icons.info_outline, color: Colors.blue, size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'All appointment times are in USA Eastern Standard Time (EST).',
                    style: TextStyle(color: Colors.blue.shade900, fontSize: 13),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
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
        const SizedBox(height: 24),
        DropdownButtonFormField<String>(
          value: _selectedHowHeard,
          items: _howHeardOptions.entries
              .map((e) => DropdownMenuItem(value: e.key, child: Text(e.value)))
              .toList(),
          onChanged: (val) => setState(() => _selectedHowHeard = val),
          decoration:
              const InputDecoration(labelText: 'How Did You Hear About Us?'),
        ),
        const SizedBox(height: 16),
        CheckboxListTile(
          contentPadding: EdgeInsets.zero,
          title: const Text(
            'I consent to the collection and use of my information for appointment scheduling *',
            style: TextStyle(fontSize: 14),
          ),
          value: _consentChecked,
          onChanged: (val) => setState(() => _consentChecked = val ?? false),
          controlAffinity: ListTileControlAffinity.leading,
        ),
      ],
    );
  }

  Future<void> _fetchSlots(DateTime date) async {
    if (_supabase == null) return;
    setState(() => _loadingSlots = true);

    try {
      final dateStr = DateFormat('yyyy-MM-dd').format(date);
      final dayOfWeek = date.weekday % 7; // Sunday is 0

      // 1. Get working hours for this day
      final workingHour = _workingHours.firstWhere(
        (wh) => wh['day_of_week'] == dayOfWeek,
        orElse: () => {},
      );

      if (workingHour.isEmpty) {
        setState(() {
          _availableSlots = [];
          _loadingSlots = false;
        });
        return;
      }

      // 2. Generate slots
      final List<String> slots = [];
      final startTimeStr = workingHour['start_time'] as String;
      final endTimeStr = workingHour['end_time'] as String;
      final slotDuration =
          (workingHour['slot_duration'] as num?)?.toInt() ?? 60;

      DateTime currentTime = DateFormat('HH:mm:ss').parse(startTimeStr);
      final endTime = DateFormat('HH:mm:ss').parse(endTimeStr);

      while (currentTime.isBefore(endTime)) {
        slots.add(DateFormat('HH:mm').format(currentTime));
        currentTime = currentTime.add(Duration(minutes: slotDuration));
      }

      // 3. Fetch existing appointments
      final response = await _supabase!
          .from('appointments')
          .select('appointment_time')
          .eq('appointment_date', dateStr)
          .neq('status', 'cancelled');

      final List<String> bookedSlots = (response as List)
          .map((apt) => (apt['appointment_time'] as String).substring(0, 5))
          .toList();

      // 4. Filter available slots
      setState(() {
        _availableSlots =
            slots.where((slot) => !bookedSlots.contains(slot)).map((slot) {
          // Convert 24h to 12h for display
          final time = DateFormat('HH:mm').parse(slot);
          return DateFormat('hh:mm a').format(time);
        }).toList();
        _loadingSlots = false;
      });
    } catch (e) {
      debugPrint('Error fetching slots: $e');
      setState(() => _loadingSlots = false);
    }
  }

  Future<void> _fetchWorkingHours() async {
    if (_supabase == null) return;
    try {
      final response =
          await _supabase!.from('working_hours').select().eq('is_active', true);
      setState(() {
        _workingHours = List<Map<String, dynamic>>.from(response);
      });
    } catch (e) {
      debugPrint('Error fetching working hours: $e');
    }
  }

  Future<void> _fetchBlockedDates() async {
    if (_supabase == null) return;
    try {
      final response =
          await _supabase!.from('blocked_dates').select('blocked_date');
      setState(() {
        _blockedDates = (response as List)
            .map((d) => DateTime.parse(d['blocked_date'] as String))
            .toList();
      });
    } catch (e) {
      debugPrint('Error fetching blocked dates: $e');
    }
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
    if (!_consentChecked) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please agree to the consent checkbox')),
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
        'location': _selectedCountry,
        'contact_method': _selectedContactMethod,
        'services': _selectedServices,
        'description': _descriptionController.text,
        'appointment_date': DateFormat('yyyy-MM-dd').format(_selectedDate!),
        'appointment_time': _selectedTimeSlot,
        'how_heard': _selectedHowHeard,
        'status': 'pending',
      };

      // --- UNIFIED WEB CHECKOUT FLOW ---
      debugPrint('BookingPage: Initiating unified web checkout flow...');
      final checkoutData =
          await StripeService.createCheckoutSession(bookingData);

      if (checkoutData == null || checkoutData['url'] == null) {
        throw Exception('Failed to create checkout session');
      }

      final url = Uri.parse(checkoutData['url']);
      // Using default launchUrl settings which optimize for in-app browser tabs
      if (await canLaunchUrl(url)) {
        await launchUrl(
          url,
          mode: LaunchMode.inAppBrowserView, // Forces in-app experience
        );
      } else {
        throw Exception('Could not launch payment URL');
      }
    } catch (e) {
      debugPrint('Booking Error Detailed: $e');
      String errorMessage = e.toString();
      if (errorMessage.contains('stripe_exception')) {
        errorMessage = 'Stripe Error: ${errorMessage.split(':').last.trim()}';
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $errorMessage'),
            duration: const Duration(seconds: 5),
            action: SnackBarAction(
              label: 'Details',
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text('Booking Details'),
                    content: SingleChildScrollView(child: Text(e.toString())),
                    actions: [
                      TextButton(
                          onPressed: () => Navigator.pop(context),
                          child: const Text('Close'))
                    ],
                  ),
                );
              },
            ),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void initState() {
    super.initState();
    try {
      _supabase = Supabase.instance.client;
      _fetchWorkingHours();
      _fetchBlockedDates();
    } catch (e) {
      debugPrint('Supabase not initialized in BookingPage: $e');
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
