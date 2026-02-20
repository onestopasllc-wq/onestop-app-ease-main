import 'package:flutter/material.dart';
import 'package:onestop_mobile_app/theme/app_theme.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:onestop_mobile_app/widgets/main_scaffold.dart';
import 'package:onestop_mobile_app/services/supabase_service.dart';
import 'package:onestop_mobile_app/models/dealership.dart';

class DealershipsPage extends StatefulWidget {
  const DealershipsPage({super.key});

  @override
  State<DealershipsPage> createState() => _DealershipsPageState();
}

class _DealershipsPageState extends State<DealershipsPage> {
  final TextEditingController _searchController = TextEditingController();
  List<Dealership> _allPartners = [];
  List<Dealership> _filteredPartners = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchDealerships();
  }

  Future<void> _fetchDealerships() async {
    setState(() => _isLoading = true);
    final data = await SupabaseService.fetchDealerships();
    if (mounted) {
      setState(() {
        _allPartners = data;
        _filteredPartners = data;
        _isLoading = false;
      });
    }
  }

  void _handleSearch(String query) {
    setState(() {
      _filteredPartners = _allPartners
          .where((p) =>
              p.name.toLowerCase().contains(query.toLowerCase()) ||
              p.description.toLowerCase().contains(query.toLowerCase()))
          .toList();
    });
  }

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (!await launchUrl(uri)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not launch website')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return MainScaffold(
      currentIndex: -1,
      title: 'Dealership Partners',
      body: Column(
        children: [
          _buildHero(),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredPartners.isEmpty
                    ? _buildEmptyState()
                    : _buildPartnerList(),
          ),
        ],
      ),
    );
  }

  Widget _buildHero() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppTheme.primaryBlue.withOpacity(0.05),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: AppTheme.secondaryTeal.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Text('Trusted Partners',
                style: TextStyle(
                    color: AppTheme.secondaryTeal,
                    fontWeight: FontWeight.bold,
                    fontSize: 12)),
          ),
          const SizedBox(height: 16),
          Text(
            'Find Your Perfect Ride',
            textAlign: TextAlign.center,
            style: TextStyle(
                fontSize: MediaQuery.of(context).size.width < 380 ? 24 : 28,
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryBlue),
          ),
          const SizedBox(height: 8),
          const Text(
            'Explore our curated list of premier car dealerships.',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppTheme.textMuted),
          ),
          const SizedBox(height: 24),
          TextField(
            controller: _searchController,
            onChanged: _handleSearch,
            decoration: InputDecoration(
              hintText: 'Search dealerships...',
              prefixIcon: const Icon(Icons.search),
              filled: true,
              fillColor: Colors.white,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPartnerList() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _filteredPartners.length,
      itemBuilder: (context, index) {
        final partner = _filteredPartners[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          clipBehavior: Clip.antiAlias,
          child: Column(
            children: [
              Container(
                height: 180,
                width: double.infinity,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      AppTheme.primaryBlue,
                      AppTheme.primaryBlue.withOpacity(0.8)
                    ],
                  ),
                ),
                child: Stack(
                  children: [
                    Center(
                      child: partner.logoUrl != null
                          ? Image.network(
                              partner.logoUrl!,
                              height: 140,
                              fit: BoxFit.contain,
                              errorBuilder: (context, error, stackTrace) =>
                                  Icon(Icons.directions_car,
                                      size: 80,
                                      color: Colors.white.withOpacity(0.2)),
                            )
                          : Icon(Icons.directions_car,
                              size: 80, color: Colors.white.withOpacity(0.2)),
                    ),
                    if (partner.isFeatured)
                      Positioned(
                        top: 12,
                        right: 12,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.orange,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text('FEATURED',
                              style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold)),
                        ),
                      ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(partner.name,
                        style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.primaryBlue),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis),
                    const SizedBox(height: 8),
                    Text(partner.description,
                        style: const TextStyle(color: AppTheme.textMuted)),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: () => _launchUrl(partner.websiteUrl),
                        icon: const Icon(Icons.launch, size: 16),
                        label: const Text('Visit Dealership'),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildEmptyState() {
    return const Center(
      child: Text('No dealerships found',
          style: TextStyle(color: AppTheme.textMuted)),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}
