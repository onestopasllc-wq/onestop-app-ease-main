import 'package:flutter/material.dart';
import 'package:onestop_mobile_app/theme/app_theme.dart';
import 'package:onestop_mobile_app/widgets/main_scaffold.dart';
import 'package:onestop_mobile_app/services/supabase_service.dart';
import 'package:onestop_mobile_app/models/testimonial.dart';

class TestimonialsPage extends StatefulWidget {
  const TestimonialsPage({super.key});

  @override
  State<TestimonialsPage> createState() => _TestimonialsPageState();
}

class _TestimonialsPageState extends State<TestimonialsPage> {
  bool _loading = true;
  List<Testimonial> _testimonials = [];

  @override
  void initState() {
    super.initState();
    _fetchTestimonials();
  }

  Future<void> _fetchTestimonials() async {
    setState(() => _loading = true);
    final data = await SupabaseService.fetchTestimonials();
    if (mounted) {
      setState(() {
        _testimonials = data;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return MainScaffold(
      currentIndex: -1,
      title: 'Testimonials',
      body: SingleChildScrollView(
        child: Column(
          children: [
            _buildHero(context),
            _buildTestimonialsGrid(context),
            _buildStats(context),
          ],
        ),
      ),
    );
  }

  Widget _buildHero(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
            colors: [AppTheme.primaryBlue, AppTheme.secondaryTeal]),
      ),
      child: Column(
        children: [
          Text(
            'Success Stories',
            style: TextStyle(
                color: Colors.white,
                fontSize: MediaQuery.of(context).size.width < 380 ? 28 : 32,
                fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 16),
          Text(
            'Real people, real results. Read how we\'ve helped our clients.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white70, fontSize: 18),
          ),
        ],
      ),
    );
  }

  Widget _buildTestimonialsGrid(BuildContext context) {
    if (_loading) {
      return const Padding(
        padding: EdgeInsets.all(48.0),
        child: Center(child: CircularProgressIndicator()),
      );
    }

    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        children: [
          const Text('Testimonials',
              style: TextStyle(
                  color: AppTheme.secondaryTeal, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Text('What Our Clients Say',
              style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryBlue)),
          const SizedBox(height: 32),
          if (_testimonials.isEmpty && !_loading)
            const Text('No testimonials yet.',
                style: TextStyle(color: AppTheme.textMuted))
          else
            ..._testimonials.map((t) => _buildTestimonialCard(context, t)),
        ],
      ),
    );
  }

  Widget _buildTestimonialCard(BuildContext context, Testimonial t) {
    return Card(
      margin: const EdgeInsets.only(bottom: 24),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: List.generate(
                t.rating.toInt(),
                (index) => const Icon(Icons.star,
                    color: AppTheme.secondaryTeal, size: 20),
              ),
            ),
            const SizedBox(height: 12),
            if (t.service != null)
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.secondaryTeal.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(t.service!,
                    style: const TextStyle(
                        color: AppTheme.secondaryTeal,
                        fontSize: 12,
                        fontWeight: FontWeight.bold)),
              ),
            const SizedBox(height: 16),
            Text(
              '"${t.text}"',
              style: const TextStyle(
                  color: AppTheme.textMuted,
                  fontSize: 16,
                  fontStyle: FontStyle.italic,
                  height: 1.5),
            ),
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 16),
            Text(t.name,
                style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                    color: AppTheme.primaryBlue)),
            if (t.location != null)
              Text(t.location!,
                  style:
                      const TextStyle(color: AppTheme.textMuted, fontSize: 14)),
          ],
        ),
      ),
    );
  }

  Widget _buildStats(BuildContext context) {
    final stats = [
      {'number': '1000+', 'label': 'Happy Clients'},
      {'number': '95%', 'label': 'Success Rate'},
      {'number': '6', 'label': 'Service Areas'},
      {'number': '24/7', 'label': 'Support'},
    ];

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
      color: Colors.grey[50],
      child: Column(
        children: [
          const Text('Our Track Record',
              style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryBlue)),
          const SizedBox(height: 32),
          LayoutBuilder(
            builder: (context, constraints) {
              final isSmall = constraints.maxWidth < 350;
              return GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: isSmall ? 1 : 2,
                childAspectRatio: isSmall ? 3.0 : 1.5,
                children: stats
                    .map((s) => Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(s['number']!,
                                style: TextStyle(
                                    fontSize: isSmall ? 28 : 32,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.secondaryTeal)),
                            Text(s['label']!,
                                style: const TextStyle(
                                    color: AppTheme.textMuted,
                                    fontWeight: FontWeight.w500)),
                          ],
                        ))
                    .toList(),
              );
            },
          ),
        ],
      ),
    );
  }
}
