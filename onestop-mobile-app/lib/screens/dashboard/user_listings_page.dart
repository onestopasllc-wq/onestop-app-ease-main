import 'package:flutter/material.dart';
import 'package:onestop_mobile_app/theme/app_theme.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:intl/intl.dart';
import 'package:onestop_mobile_app/widgets/main_scaffold.dart';

class UserListingsPage extends StatefulWidget {
  const UserListingsPage({super.key});

  @override
  State<UserListingsPage> createState() => _UserListingsPageState();
}

class _UserListingsPageState extends State<UserListingsPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  SupabaseClient? _supabase;
  bool _loading = true;
  List<dynamic> _allListings = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    try {
      _supabase = Supabase.instance.client;
      _fetchListings();
    } catch (e) {
      debugPrint('Supabase not initialized in UserListingsPage: $e');
      setState(() => _loading = false);
    }
  }

  Future<void> _fetchListings() async {
    if (_supabase == null) return;
    try {
      final user = _supabase!.auth.currentUser;
      if (user != null) {
        final response = await _supabase!
            .from('rental_listings')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', ascending: false);

        if (mounted) {
          setState(() {
            _allListings = response as List<dynamic>;
            _loading = false;
          });
        }
      }
    } catch (e) {
      if (mounted) setState(() => _loading = false);
      debugPrint('Error fetching listings: $e');
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MainScaffold(
      currentIndex: -1,
      title: 'My Listings',
      body: Column(
        children: [
          TabBar(
            controller: _tabController,
            labelColor: AppTheme.primaryBlue,
            unselectedLabelColor: AppTheme.textMuted,
            indicatorColor: AppTheme.secondaryTeal,
            tabs: const [
              Tab(text: 'All'),
              Tab(text: 'Approved'),
              Tab(text: 'Pending'),
            ],
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : TabBarView(
                    controller: _tabController,
                    children: [
                      _buildList(_allListings),
                      _buildList(_allListings
                          .where((l) => l['status'] == 'approved')
                          .toList()),
                      _buildList(_allListings
                          .where((l) => l['status'] == 'pending_approval')
                          .toList()),
                    ],
                  ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.pushNamed(context, '/rentals/new'),
        backgroundColor: AppTheme.secondaryTeal,
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildList(List<dynamic> listings) {
    if (listings.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.home_work_outlined, size: 64, color: Colors.grey[300]),
            const SizedBox(height: 16),
            const Text('No listings found',
                style: TextStyle(color: AppTheme.textMuted)),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => Navigator.pushNamed(context, '/rentals/new'),
              child: const Text('Post Your First Rental'),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _fetchListings,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: listings.length,
        itemBuilder: (context, index) {
          final listing = listings[index];
          final images = listing['images'] as List?;
          final imageUrl =
              (images != null && images.isNotEmpty) ? images[0] : null;

          return _buildListingCard(listing, imageUrl);
        },
      ),
    );
  }

  Widget _buildListingCard(dynamic listing, String? imageUrl) {
    final status = listing['status'] ?? 'pending';
    final date = DateTime.parse(listing['created_at']);
    final formattedDate = DateFormat('MMM d, y').format(date);

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: () {
          // TODO: Open details/edit
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  color: Colors.grey[200],
                  image: imageUrl != null
                      ? DecorationImage(
                          image: NetworkImage(imageUrl), fit: BoxFit.cover)
                      : null,
                ),
                child: imageUrl == null
                    ? const Icon(Icons.image_outlined, color: Colors.grey)
                    : null,
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Wrap(
                      alignment: WrapAlignment.spaceBetween,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      spacing: 8,
                      children: [
                        _buildStatusBadge(status),
                        Text(formattedDate,
                            style: const TextStyle(
                                fontSize: 12, color: AppTheme.textMuted)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      listing['title'],
                      style: const TextStyle(
                          fontWeight: FontWeight.bold, fontSize: 16),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '\$${listing['price']}/mo',
                      style: const TextStyle(
                          color: AppTheme.secondaryTeal,
                          fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.remove_red_eye_outlined,
                            size: 14, color: AppTheme.textMuted),
                        const SizedBox(width: 4),
                        Text('${listing['views'] ?? 0} views',
                            style: const TextStyle(
                                fontSize: 12, color: AppTheme.textMuted)),
                        const Spacer(),
                        const Icon(Icons.more_vert,
                            size: 18, color: AppTheme.textMuted),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    String label;
    switch (status) {
      case 'approved':
        color = Colors.green;
        label = 'Approved';
        break;
      case 'pending_approval':
        color = Colors.orange;
        label = 'Pending';
        break;
      case 'rejected':
        color = Colors.red;
        label = 'Rejected';
        break;
      default:
        color = Colors.grey;
        label = status;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        label,
        style:
            TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold),
      ),
    );
  }
}
