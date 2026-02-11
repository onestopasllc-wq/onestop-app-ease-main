import 'package:flutter/material.dart';
import 'package:onestop_mobile_app/theme/app_theme.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:onestop_mobile_app/widgets/main_scaffold.dart';

class ContactPage extends StatefulWidget {
  const ContactPage({super.key});

  @override
  State<ContactPage> createState() => _ContactPageState();
}

class _ContactPageState extends State<ContactPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _messageController = TextEditingController();
  bool _isSubmitting = false;

  void _submitForm() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isSubmitting = true);

      // Simulate API call
      await Future.delayed(const Duration(seconds: 2));

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Message Sent! We\'ll get back to you soon.')),
        );
        _nameController.clear();
        _emailController.clear();
        _messageController.clear();
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return MainScaffold(
      currentIndex: -1,
      title: 'Contact Us',
      body: SingleChildScrollView(
        child: Column(
          children: [
            _buildContactHero(context),
            _buildContactContent(context),
            _buildSocialLinks(context),
          ],
        ),
      ),
    );
  }

  Widget _buildContactHero(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
            colors: [AppTheme.primaryBlue, AppTheme.secondaryTeal]),
      ),
      child: const Column(
        children: [
          Text(
            'Get In Touch',
            style: TextStyle(
                color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 16),
          Text(
            'Have questions? We\'re here to help you every step of the way.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white70, fontSize: 18),
          ),
        ],
      ),
    );
  }

  Widget _buildContactContent(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Send Us a Message',
              style: TextStyle(
                  color: AppTheme.secondaryTeal, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Text('Quick Contact Form',
              style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryBlue)),
          const SizedBox(height: 24),
          Form(
            key: _formKey,
            child: Column(
              children: [
                TextFormField(
                  controller: _nameController,
                  decoration: const InputDecoration(
                      labelText: 'Full Name *', border: OutlineInputBorder()),
                  validator: (value) =>
                      value!.isEmpty ? 'Please enter your name' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _emailController,
                  decoration: const InputDecoration(
                      labelText: 'Email Address *',
                      border: OutlineInputBorder()),
                  keyboardType: TextInputType.emailAddress,
                  validator: (value) =>
                      value!.isEmpty ? 'Please enter your email' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _messageController,
                  decoration: const InputDecoration(
                      labelText: 'Message *', border: OutlineInputBorder()),
                  maxLines: 4,
                  validator: (value) =>
                      value!.isEmpty ? 'Please enter your message' : null,
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isSubmitting ? null : _submitForm,
                    style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16)),
                    child: _isSubmitting
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Text('Send Message'),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 48),
          const Text('Reach Us Directly',
              style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryBlue)),
          const SizedBox(height: 24),
          _buildContactCard(Icons.phone, 'Phone', '+1 (571) 660-4984',
              sub: 'Mon - Fri, 9 AM - 6 PM EST'),
          _buildContactCard(Icons.email, 'Email', 'info@onestopasllc.com',
              sub: 'We typically respond within 24 hours'),
          _buildContactCard(FontAwesomeIcons.telegram, 'Telegram',
              '@OneStop_Application_Services_LLC'),
        ],
      ),
    );
  }

  Widget _buildContactCard(IconData icon, String title, String value,
      {String? sub}) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: ListTile(
        leading: Icon(icon, color: AppTheme.secondaryTeal),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(value),
            if (sub != null)
              Text(sub,
                  style:
                      const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
          ],
        ),
      ),
    );
  }

  Widget _buildSocialLinks(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(32),
      color: Colors.grey[50],
      child: Column(
        children: [
          const Text('Stay Connected',
              style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryBlue)),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(
                  icon: const FaIcon(FontAwesomeIcons.facebook,
                      color: Color(0xFF1877F2)),
                  onPressed: () {}),
              IconButton(
                  icon: const FaIcon(FontAwesomeIcons.instagram,
                      color: Color(0xFFE4405F)),
                  onPressed: () {}),
              IconButton(
                  icon: const FaIcon(FontAwesomeIcons.whatsapp,
                      color: Color(0xFF25D366)),
                  onPressed: () {}),
              IconButton(
                  icon: const FaIcon(FontAwesomeIcons.youtube,
                      color: Color(0xFFFF0000)),
                  onPressed: () {}),
              IconButton(
                  icon: const FaIcon(FontAwesomeIcons.tiktok,
                      color: Colors.black),
                  onPressed: () {}),
            ],
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _messageController.dispose();
    super.dispose();
  }
}
