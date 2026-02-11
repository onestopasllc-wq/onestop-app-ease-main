import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:onestop_mobile_app/theme/app_theme.dart';
import 'package:onestop_mobile_app/widgets/main_scaffold.dart';
import 'package:flutter/widget_previews.dart';
import 'package:onestop_mobile_app/services/supabase_service.dart';
import 'package:onestop_mobile_app/models/rental_listing.dart';

class RentalsPage extends StatefulWidget {
  @Preview(name: 'Rentals Page')
  const RentalsPage({super.key});

  @override
  State<RentalsPage> createState() => _RentalsPageState();
}

class _RentalsPageState extends State<RentalsPage> {
  List<RentalListing> _rentals = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchRentals();
  }

  Future<void> _fetchRentals() async {
    setState(() => _loading = true);
    try {
      final response = await SupabaseService.fetchRentalListings();

      if (mounted) {
        setState(() {
          _rentals = response;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading rentals: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return MainScaffold(
      currentIndex: 3,
      title: 'Home Rentals',
      actions: [
        IconButton(
          onPressed: () {
            if (SupabaseService.client.auth.currentUser == null) {
              Navigator.pushNamed(context, '/login');
            } else {
              Navigator.pushNamed(context, '/dashboard');
            }
          },
          icon: const Icon(Icons.add_circle_outline),
          tooltip: 'Post a Rental',
        ),
      ],
      body: RefreshIndicator(
        onRefresh: _fetchRentals,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            children: [
              _buildRentalsHero(context),
              _buildRentalsList(),
              _buildBenefitsSection(),
              _buildCTASection(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRentalsHero(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
      decoration: BoxDecoration(
        color: AppTheme.primaryBlue.withOpacity(0.05),
      ),
      child: Column(
        children: [
          const FaIcon(FontAwesomeIcons.houseUser,
              size: 60, color: AppTheme.secondaryTeal),
          const SizedBox(height: 24),
          const Text(
            'Find Your Next Home',
            textAlign: TextAlign.center,
            style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryBlue),
          ),
          const SizedBox(height: 16),
          const Text(
            'Explore verified rental listings or post your own ad.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 18, color: AppTheme.textMuted),
          ),
          const SizedBox(height: 32),
          ElevatedButton.icon(
            onPressed: () {
              if (SupabaseService.client.auth.currentUser == null) {
                Navigator.pushNamed(context, '/login');
              } else {
                Navigator.pushNamed(context, '/dashboard');
              }
            },
            icon: const Icon(Icons.add),
            label: const Text('Post a Rental (\$25)'),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRentalsList() {
    if (_loading) {
      return const Padding(
        padding: EdgeInsets.all(40.0),
        child: Center(child: CircularProgressIndicator()),
      );
    }

    if (_rentals.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(40),
        child: const Column(
          children: [
            Icon(Icons.home_outlined, size: 48, color: Colors.grey),
            SizedBox(height: 16),
            Text('No active rentals found',
                style: TextStyle(color: AppTheme.textMuted)),
          ],
        ),
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.all(16),
      itemCount: _rentals.length,
      itemBuilder: (context, index) {
        final rental = _rentals[index];
        final imageUrl = rental.images.isNotEmpty ? rental.images[0] : null;

        return Card(
          margin: const EdgeInsets.only(bottom: 24),
          clipBehavior: Clip.antiAlias,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Stack(
                children: [
                  AspectRatio(
                    aspectRatio: 4 / 3,
                    child: imageUrl != null
                        ? Image.network(imageUrl, fit: BoxFit.cover)
                        : Container(
                            color: Colors.grey[200],
                            child: const Icon(Icons.home,
                                size: 100, color: Colors.grey)),
                  ),
                  Positioned(
                    top: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.9),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '\$${rental.price.toStringAsFixed(0)}/mo',
                        style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: AppTheme.primaryBlue),
                      ),
                    ),
                  ),
                ],
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppTheme.primaryBlue.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(rental.propertyType,
                              style: const TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.primaryBlue)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(rental.title,
                        style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.primaryBlue)),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.location_on_outlined,
                            size: 14, color: AppTheme.textMuted),
                        const SizedBox(width: 4),
                        Expanded(
                            child: Text(rental.address,
                                style: const TextStyle(
                                    color: AppTheme.textMuted, fontSize: 13))),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(rental.description,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                            color: AppTheme.textMuted, fontSize: 14)),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('By ${rental.contactName}',
                            style: const TextStyle(
                                fontSize: 12, fontWeight: FontWeight.w600)),
                        TextButton(
                          onPressed: () {
                            // TODO: Show details
                          },
                          child: const Text('View Details'),
                        ),
                      ],
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

  Widget _buildBenefitsSection() {
    final benefits = [
      {
        'icon': Icons.verified,
        'title': 'Verified Listings',
        'desc': 'Safe and secure housing options.'
      },
      {
        'icon': Icons.support_agent,
        'title': 'Dedicated Support',
        'desc': 'Expert help at every step.'
      },
    ];

    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Why Rent With Us?',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          const SizedBox(height: 24),
          ...benefits.map((benefit) => Padding(
                padding: const EdgeInsets.only(bottom: 20),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    CircleAvatar(
                      backgroundColor: AppTheme.secondaryTeal.withOpacity(0.1),
                      child: Icon(benefit['icon'] as IconData,
                          color: AppTheme.secondaryTeal),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(benefit['title'] as String,
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold, fontSize: 16)),
                          Text(benefit['desc'] as String,
                              style:
                                  const TextStyle(color: AppTheme.textMuted)),
                        ],
                      ),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }

  Widget _buildCTASection() {
    return Container(
      margin: const EdgeInsets.all(24),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
            colors: [AppTheme.primaryBlue, Colors.blueAccent]),
        borderRadius: BorderRadius.circular(16),
      ),
      child: const Column(
        children: [
          Text(
            'Ready to find your home?',
            style: TextStyle(
                color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 12),
          Text(
            'Our team is here to help you navigate the housing market.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white70),
          ),
        ],
      ),
    );
  }
}
