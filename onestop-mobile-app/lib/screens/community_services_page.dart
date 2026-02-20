import 'package:flutter/material.dart';
import 'package:onestop_mobile_app/theme/app_theme.dart';
import 'package:onestop_mobile_app/widgets/main_scaffold.dart';
import 'package:onestop_mobile_app/services/supabase_service.dart';
import 'package:onestop_mobile_app/models/community_service.dart';
import 'package:url_launcher/url_launcher.dart';

class CommunityServicesPage extends StatefulWidget {
  const CommunityServicesPage({super.key});

  @override
  State<CommunityServicesPage> createState() => _CommunityServicesPageState();
}

class _CommunityServicesPageState extends State<CommunityServicesPage> {
  List<CommunityService> _services = [];
  List<CommunityService> _filteredServices = [];
  bool _loading = true;
  String _searchTerm = "";
  String _activeCategory = "All";

  final List<String> _categories = [
    "All",
    "Health Insurance Services",
    "Car Insurance",
    "Housing & Rentals",
    "Car Rental & Vehicle Sales",
    "Cafés & Restaurants",
    "Medical Centers & Clinics",
    "Habesha Stores",
    "Hotels & Lodging",
    "Tax Preparation & Accounting",
    "Finance & Business Services",
    "Childcare Services",
    "Transportation Services",
    "Tech Solutions",
    "Other Community Services",
    "Short term training"
  ];

  @override
  void initState() {
    super.initState();
    _fetchServices();
  }

  Future<void> _fetchServices() async {
    setState(() => _loading = true);
    try {
      final services = await SupabaseService.fetchCommunityServices();
      setState(() {
        _services = services;
        _applyFilters();
        _loading = false;
      });
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading services: $e')),
        );
      }
    }
  }

  void _applyFilters() {
    setState(() {
      _filteredServices = _services.where((service) {
        final matchesSearch =
            service.name.toLowerCase().contains(_searchTerm.toLowerCase()) ||
                service.description
                    .toLowerCase()
                    .contains(_searchTerm.toLowerCase());
        final matchesCategory =
            _activeCategory == "All" || service.category == _activeCategory;
        return matchesSearch && matchesCategory;
      }).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return MainScaffold(
      currentIndex: 1, // Services tab
      title: 'Community Services',
      body: RefreshIndicator(
        onRefresh: _fetchServices,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHero(),
              _buildSearchAndFilters(),
              _buildServicesList(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHero() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.only(top: 40, bottom: 60, left: 24, right: 24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppTheme.primaryBlue,
            AppTheme.primaryBlue.withOpacity(0.8),
          ],
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.15),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white.withOpacity(0.2)),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.stars, color: Colors.amber, size: 16),
                SizedBox(width: 8),
                Text(
                  'Community Directory',
                  style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 12),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Explore Local\nServices & Businesses',
            style: TextStyle(
              fontSize: MediaQuery.of(context).size.width < 380 ? 28 : 32,
              fontWeight: FontWeight.bold,
              color: Colors.white,
              height: 1.1,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Find trusted community providers, Ethiopian businesses, and essential local services all in one place.',
            style: TextStyle(
              color: Colors.white.withOpacity(0.8),
              fontSize: 16,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchAndFilters() {
    return Transform.translate(
      offset: const Offset(0, -30),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Column(
          children: [
            // Search Bar
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: TextField(
                onChanged: (value) {
                  _searchTerm = value;
                  _applyFilters();
                },
                decoration: InputDecoration(
                  hintText: 'Search for services or businesses...',
                  prefixIcon:
                      const Icon(Icons.search, color: AppTheme.primaryBlue),
                  border: InputBorder.none,
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
                ),
              ),
            ),
            const SizedBox(height: 20),
            // Category Chips
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              child: Row(
                children: _categories.map((category) {
                  final isSelected = _activeCategory == category;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: FilterChip(
                      selected: isSelected,
                      label: Text(category),
                      onSelected: (selected) {
                        setState(() {
                          _activeCategory = category;
                          _applyFilters();
                        });
                      },
                      backgroundColor: Colors.white,
                      selectedColor: AppTheme.primaryBlue,
                      labelStyle: TextStyle(
                        color: isSelected ? Colors.white : AppTheme.primaryBlue,
                        fontWeight:
                            isSelected ? FontWeight.bold : FontWeight.normal,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: BorderSide(
                          color: isSelected
                              ? AppTheme.primaryBlue
                              : AppTheme.primaryBlue.withOpacity(0.2),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildServicesList() {
    if (_loading) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.symmetric(vertical: 40),
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (_filteredServices.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 60, horizontal: 40),
          child: Column(
            children: [
              Icon(Icons.search_off, size: 64, color: Colors.grey.shade300),
              const SizedBox(height: 16),
              const Text(
                'No services found',
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textMuted),
              ),
              const SizedBox(height: 8),
              const Text(
                'Try adjusting your search or category filter.',
                textAlign: TextAlign.center,
                style: TextStyle(color: AppTheme.textMuted),
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.only(left: 16, right: 16, bottom: 40),
      itemCount: _filteredServices.length,
      itemBuilder: (context, index) {
        return _buildServiceCard(_filteredServices[index]);
      },
    );
  }

  Widget _buildServiceCard(CommunityService service) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey.shade100),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header with Logo
            Container(
              height: 100,
              width: double.infinity,
              color: AppTheme.primaryBlue.withOpacity(0.03),
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.05),
                          blurRadius: 10,
                        ),
                      ],
                    ),
                    child: service.logoUrl != null
                        ? Image.network(service.logoUrl!, fit: BoxFit.contain)
                        : const Icon(Icons.business,
                            color: AppTheme.primaryBlue, size: 30),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          service.name,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.primaryBlue,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppTheme.secondaryTeal.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            service.category,
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.secondaryTeal,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (service.isFeatured)
                    const Icon(Icons.star, color: Colors.amber, size: 24),
                ],
              ),
            ),
            // Description
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    service.description,
                    style: TextStyle(
                        color: Colors.grey.shade600, fontSize: 14, height: 1.5),
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 20),
                  // Contact Info
                  if (service.address != null)
                    _buildContactRow(
                        Icons.location_on_outlined, service.address!),
                  if (service.contactPhone != null)
                    _buildContactRow(
                        Icons.phone_outlined, service.contactPhone!),
                  const SizedBox(height: 24),
                  // Actions
                  Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: [
                      if (service.websiteUrl != null)
                        SizedBox(
                          width: MediaQuery.of(context).size.width < 380
                              ? double.infinity
                              : null,
                          child: ElevatedButton.icon(
                            onPressed: () => _launchURL(service.websiteUrl!),
                            icon: const Icon(Icons.language, size: 18),
                            label: const Text('Visit Website'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.primaryBlue,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12)),
                            ),
                          ),
                        ),
                      SizedBox(
                        width: MediaQuery.of(context).size.width < 380
                            ? double.infinity
                            : null,
                        child: OutlinedButton.icon(
                          onPressed: () {
                            // Show full details dialog
                            _showDetails(context, service);
                          },
                          icon: const Icon(Icons.info_outline, size: 18),
                          label: const Text('View Full Info'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppTheme.primaryBlue,
                            side: const BorderSide(color: AppTheme.primaryBlue),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContactRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(icon, size: 14, color: AppTheme.textMuted),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(color: AppTheme.textMuted, fontSize: 13),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _launchURL(String url) async {
    final uri = Uri.parse(url.startsWith('http') ? url : 'https://$url');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  void _showDetails(BuildContext context, CommunityService service) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        maxChildSize: 0.9,
        minChildSize: 0.5,
        builder: (_, controller) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
          ),
          child: ListView(
            controller: controller,
            padding: const EdgeInsets.all(24),
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                      color: Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(2)),
                ),
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  if (service.logoUrl != null)
                    Image.network(service.logoUrl!,
                        width: 80, height: 80, fit: BoxFit.contain)
                  else
                    const Icon(Icons.business,
                        color: AppTheme.primaryBlue, size: 60),
                  const SizedBox(width: 20),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(service.name,
                            style: const TextStyle(
                                fontSize: 24, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Text(service.category,
                            style: const TextStyle(
                                color: AppTheme.secondaryTeal,
                                fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),
              const Text('About',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              Text(service.description,
                  style: TextStyle(
                      color: Colors.grey.shade600, fontSize: 16, height: 1.6)),
              const SizedBox(height: 32),
              const Text('Contact Information',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              if (service.address != null)
                _buildInfoTile(Icons.location_on, 'Address', service.address!),
              if (service.contactPhone != null)
                _buildInfoTile(Icons.phone, 'Phone', service.contactPhone!),
              if (service.contactEmail != null)
                _buildInfoTile(Icons.email, 'Email', service.contactEmail!),
              if (service.contactName != null)
                _buildInfoTile(
                    Icons.person, 'Contact Person', service.contactName!),
              const SizedBox(height: 40),
              if (service.websiteUrl != null)
                ElevatedButton(
                  onPressed: () => _launchURL(service.websiteUrl!),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Text('Visit Website'),
                ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoTile(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            backgroundColor: AppTheme.primaryBlue.withOpacity(0.05),
            radius: 18,
            child: Icon(icon, color: AppTheme.primaryBlue, size: 18),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: TextStyle(
                        color: Colors.grey.shade400,
                        fontSize: 12,
                        fontWeight: FontWeight.bold)),
                const SizedBox(height: 2),
                Text(value,
                    style: const TextStyle(
                        fontSize: 15, fontWeight: FontWeight.w500)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
