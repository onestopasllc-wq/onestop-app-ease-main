import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:onestop_mobile_app/theme/app_theme.dart';
import 'package:onestop_mobile_app/models/service.dart';
import 'package:onestop_mobile_app/widgets/main_scaffold.dart';
import 'package:flutter/widget_previews.dart';

import 'package:onestop_mobile_app/services/supabase_service.dart';

class ServicesPage extends StatefulWidget {
  @Preview(
    name: 'Services Page',
    size: Size(375, 812),
  )
  const ServicesPage({super.key});

  @override
  State<ServicesPage> createState() => _ServicesPageState();
}

class _ServicesPageState extends State<ServicesPage> {
  List<Service> _services = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchServices();
  }

  Future<void> _fetchServices() async {
    final data = await SupabaseService.fetchServices();
    if (mounted) {
      setState(() {
        _services = data;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return MainScaffold(
      currentIndex: 2,
      title: 'Our Services',
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _services.length,
              itemBuilder: (context, index) {
                final service = _services[index];
                return Card(
                  elevation: 2,
                  margin: const EdgeInsets.only(bottom: 16),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                  child: ExpansionTile(
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppTheme.secondaryTeal.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: FaIcon(service.icon,
                          color: AppTheme.secondaryTeal, size: 24),
                    ),
                    title: Text(
                      service.title,
                      style: const TextStyle(
                          fontWeight: FontWeight.bold, fontSize: 18),
                    ),
                    subtitle: Text(
                      service.description,
                      style: const TextStyle(color: AppTheme.textMuted),
                    ),
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Include Features:',
                              style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.primaryBlue),
                            ),
                            const SizedBox(height: 8),
                            ...service.features.map((feature) => Padding(
                                  padding:
                                      const EdgeInsets.symmetric(vertical: 4),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.check_circle,
                                          color: AppTheme.secondaryTeal,
                                          size: 16),
                                      const SizedBox(width: 8),
                                      Expanded(child: Text(feature)),
                                    ],
                                  ),
                                )),
                            const SizedBox(height: 16),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: () {
                                  Navigator.pushNamed(context, '/appointment');
                                },
                                child: const Text('Inquire Now'),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }
}
