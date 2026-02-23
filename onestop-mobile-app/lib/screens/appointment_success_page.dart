import 'dart:async';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:onestop_mobile_app/theme/app_theme.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:intl/intl.dart';
import 'package:onestop_mobile_app/widgets/main_scaffold.dart';

class AppointmentSuccessPage extends StatefulWidget {
  final String? sessionId;
  const AppointmentSuccessPage({super.key, this.sessionId});

  @override
  State<AppointmentSuccessPage> createState() => _AppointmentSuccessPageState();
}

class _AppointmentSuccessPageState extends State<AppointmentSuccessPage> {
  SupabaseClient? _supabase;
  bool _loading = true;
  String? _error;
  dynamic _appointment;
  Timer? _timer;
  int _attempts = 0;
  static const int _maxAttempts = 15;

  @override
  void initState() {
    super.initState();
    try {
      _supabase = Supabase.instance.client;
      if (widget.sessionId == null) {
        setState(() {
          _loading = false;
          _error = 'No session ID provided';
        });
      } else {
        _startPolling();
      }
    } catch (e) {
      debugPrint('Supabase not initialized: $e');
      setState(() {
        _loading = false;
        _error = 'Service unavailable. Please contact support.';
      });
    }
  }

  void _startPolling() {
    _fetchAppointment();
  }

  Future<void> _fetchAppointment() async {
    if (_supabase == null) return;
    try {
      final response = await _supabase!
          .from('appointments')
          .select('*')
          .or('stripe_session_id.eq.${widget.sessionId},stripe_payment_intent_id.eq.${widget.sessionId}')
          .maybeSingle();

      if (response != null) {
        if (mounted) {
          setState(() {
            _appointment = response;
            _loading = false;
          });
        }
        return;
      }

      _attempts++;
      if (_attempts < _maxAttempts) {
        _timer = Timer(const Duration(seconds: 1), _fetchAppointment);
      } else {
        if (mounted) {
          setState(() {
            _loading = false;
            _error =
                'Payment confirmed, but appointment is still being processed. Please check your email or contact support.';
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _loading = false;
          _error = 'An unexpected error occurred: $e';
        });
      }
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MainScaffold(
      currentIndex: -1,
      title: 'Success',
      body: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.white,
              AppTheme.primaryBlue.withOpacity(0.05),
            ],
          ),
        ),
        child: SafeArea(
          child: _loading
              ? _buildLoading()
              : (_error != null ? _buildError() : _buildSuccess()),
        ),
      ),
    );
  }

  Widget _buildLoading() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(
            width: 60,
            height: 60,
            child: CircularProgressIndicator(strokeWidth: 6),
          ),
          SizedBox(height: 32),
          Text(
            'Confirming Your Appointment',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 8),
          Text(
            'Processing your payment and creating your booking...',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppTheme.textMuted),
          ),
          SizedBox(height: 8),
          Text(
            'This may take a few seconds',
            style: TextStyle(fontSize: 12, color: AppTheme.textMuted),
          ),
        ],
      ),
    );
  }

  Widget _buildError() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const FaIcon(FontAwesomeIcons.circleExclamation,
            size: 60, color: Colors.orange),
        const SizedBox(height: 24),
        const Text(
          'Processing Delay',
          style: TextStyle(
              fontSize: 24, fontWeight: FontWeight.bold, color: Colors.orange),
        ),
        Padding(
          padding: const EdgeInsets.all(24.0),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.orange[50],
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.orange[100]!),
            ),
            child: Text(
              _error!,
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.orange[800]),
            ),
          ),
        ),
        const SizedBox(height: 16),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 40),
          child: Column(
            children: [
              ElevatedButton(
                onPressed: () {
                  setState(() {
                    _loading = true;
                    _attempts = 0;
                    _error = null;
                  });
                  _startPolling();
                },
                style: ElevatedButton.styleFrom(
                    minimumSize: const Size(double.infinity, 50)),
                child: const Text('Try Again'),
              ),
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: () => Navigator.pushReplacementNamed(context, '/'),
                style: OutlinedButton.styleFrom(
                    minimumSize: const Size(double.infinity, 50)),
                child: const Text('Return Home'),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSuccess() {
    final date = DateTime.parse(_appointment['appointment_date']);
    final formattedDate = DateFormat('EEEE, MMMM d, y').format(date);
    final services = _appointment['services'] as List;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          const SizedBox(height: 40),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.green[50],
              shape: BoxShape.circle,
            ),
            child: const FaIcon(FontAwesomeIcons.check,
                size: 40, color: Colors.green),
          ),
          const SizedBox(height: 24),
          const Text(
            'Payment Successful!',
            style: TextStyle(
                fontSize: 28, fontWeight: FontWeight.bold, color: Colors.green),
          ),
          const SizedBox(height: 8),
          const Text(
            'Your appointment has been confirmed',
            style: TextStyle(fontSize: 16, color: AppTheme.textMuted),
          ),
          const SizedBox(height: 32),
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Appointment Details',
                  style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primaryBlue),
                ),
                const SizedBox(height: 24),
                _buildDetailItem(Icons.calendar_today, 'Date', formattedDate),
                const SizedBox(height: 16),
                _buildDetailItem(Icons.access_time, 'Time',
                    '${_appointment['appointment_time']} (Eastern Time)'),
                const SizedBox(height: 16),
                _buildDetailItem(Icons.email_outlined, 'Confirmation Email',
                    'Sent to ${_appointment['email']}'),
              ],
            ),
          ),
          const SizedBox(height: 24),
          _buildServicesList(services),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.blue[50],
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.blue[100]!),
            ),
            child: Row(
              children: [
                Icon(Icons.info_outline, color: Colors.blue[700]),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'What\'s Next? You\'ll receive a confirmation email with all the details shortly.',
                    style: TextStyle(fontSize: 12, color: Colors.blue[800]),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: () => Navigator.pushReplacementNamed(context, '/'),
                  child: const Text('Home'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton(
                  onPressed: () => Navigator.pushNamed(context, '/appointment'),
                  child: const Text('Book Another'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildDetailItem(IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppTheme.primaryBlue.withOpacity(0.05),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: AppTheme.primaryBlue, size: 20),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label,
                  style: const TextStyle(
                      fontWeight: FontWeight.bold, fontSize: 14)),
              Text(value,
                  style:
                      const TextStyle(color: AppTheme.textMuted, fontSize: 13)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildServicesList(List services) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Selected Services',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        const SizedBox(height: 12),
        ...services.map((s) => Padding(
              padding: const EdgeInsets.only(bottom: 8.0),
              child: Row(
                children: [
                  const Icon(Icons.check_circle, color: Colors.green, size: 16),
                  const SizedBox(width: 8),
                  Text(s.toString(),
                      style: const TextStyle(color: AppTheme.textMuted)),
                ],
              ),
            )),
      ],
    );
  }
}
