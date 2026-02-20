import 'package:flutter/material.dart';
import 'package:onestop_mobile_app/theme/app_theme.dart';
import 'package:onestop_mobile_app/widgets/main_scaffold.dart';
import 'package:onestop_mobile_app/services/supabase_service.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  bool _loading = true;
  String _userName = 'User';
  Map<String, int> _stats = {
    'active': 0,
    'pending': 0,
    'views': 0,
  };

  @override
  void initState() {
    super.initState();
    _initializeSupabase();
  }

  Future<void> _initializeSupabase() async {
    try {
      await _fetchUserData();
    } catch (e) {
      debugPrint('Dashboard initialization error: $e');
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _fetchUserData() async {
    final client = SupabaseService.client;
    try {
      final user = client.auth.currentUser;
      if (user != null) {
        setState(() {
          _userName = user.userMetadata?['full_name'] ?? 'User';
        });

        // Fetch stats
        final activeRes = await client
            .from('rental_listings')
            .select()
            .eq('user_id', user.id)
            .eq('status', 'approved');

        final pendingRes = await client
            .from('rental_listings')
            .select()
            .eq('user_id', user.id)
            .eq('status', 'pending_approval');

        final viewsRes = await client
            .from('rental_listings')
            .select('views')
            .eq('user_id', user.id);

        int totalViews = 0;
        for (var item in viewsRes) {
          totalViews += (item['views'] as num?)?.toInt() ?? 0;
        }

        if (mounted) {
          setState(() {
            _stats = {
              'active': (activeRes as List).length,
              'pending': (pendingRes as List).length,
              'views': totalViews,
            };
            _loading = false;
          });
        }
      } else {
        if (mounted) setState(() => _loading = false);
      }
    } catch (e) {
      if (mounted) setState(() => _loading = false);
      debugPrint('Error fetching dashboard data: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return MainScaffold(
      currentIndex: 4,
      title: 'Dashboard',
      actions: [
        IconButton(
          onPressed: () => Navigator.pushNamed(context, '/settings'),
          icon: const Icon(Icons.settings_outlined),
        ),
      ],
      body: RefreshIndicator(
        onRefresh: _fetchUserData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(),
              const SizedBox(height: 32),
              _buildStatsGrid(),
              const SizedBox(height: 32),
              _buildQuickActions(),
              const SizedBox(height: 32),
              _buildRecentActivity(),
              const SizedBox(height: 32),
              _buildQuickTips(),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Hello, $_userName',
          style: const TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: AppTheme.primaryBlue),
        ),
        const SizedBox(height: 4),
        const Text(
          'Here\'s what\'s happening with your account today.',
          style: TextStyle(color: AppTheme.textMuted),
        ),
      ],
    );
  }

  Widget _buildStatsGrid() {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      mainAxisSpacing: 16,
      crossAxisSpacing: 16,
      childAspectRatio: MediaQuery.of(context).size.width < 380 ? 1.3 : 1.5,
      children: [
        _buildStatCard('Active Listings', _stats['active'].toString(),
            Icons.home, Colors.blue),
        _buildStatCard('Pending', _stats['pending'].toString(),
            Icons.hourglass_empty, Colors.orange),
        _buildStatCard('Total Views', _stats['views'].toString(),
            Icons.remove_red_eye, Colors.green),
        _buildStatCard('Reports', '0', Icons.bar_chart, Colors.purple),
      ],
    );
  }

  Widget _buildStatCard(
      String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.2)),
        boxShadow: [
          BoxShadow(
              color: color.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label,
                  style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: AppTheme.textMuted)),
              Icon(icon, size: 16, color: color),
            ],
          ),
          Text(
            _loading ? '...' : value,
            style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryBlue),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Quick Actions',
            style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryBlue)),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: _buildActionButton(
                'New Rental',
                Icons.add_circle_outline,
                AppTheme.secondaryTeal,
                () => Navigator.pushNamed(context, '/rentals/new'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildActionButton(
                'My Listings',
                Icons.list_alt,
                AppTheme.primaryBlue,
                () => Navigator.pushNamed(context, '/dashboard/listings'),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildActionButton(
      String label, IconData icon, Color color, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color),
            const SizedBox(height: 8),
            Text(label,
                style: TextStyle(color: color, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentActivity() {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Recent Activity',
                    style:
                        TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                Icon(Icons.notifications_none, color: AppTheme.textMuted),
              ],
            ),
            const SizedBox(height: 24),
            Center(
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                        color: Colors.grey[100], shape: BoxShape.circle),
                    child: const Icon(Icons.history, color: Colors.grey),
                  ),
                  const SizedBox(height: 12),
                  const Text('No recent activity',
                      style: TextStyle(color: AppTheme.textMuted)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickTips() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.primaryBlue.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.primaryBlue.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.lightbulb_outline, color: Colors.amber),
              SizedBox(width: 8),
              Text('Quick Tips',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 16),
          _buildTipItem('Upload high-quality photos to get 40% more views.'),
          const SizedBox(height: 8),
          _buildTipItem('Mention all amenities to attract the right tenants.'),
        ],
      ),
    );
  }

  Widget _buildTipItem(String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.only(top: 6.0),
          child: CircleAvatar(radius: 3, backgroundColor: AppTheme.primaryBlue),
        ),
        const SizedBox(width: 12),
        Expanded(
            child: Text(text,
                style:
                    const TextStyle(fontSize: 13, color: AppTheme.textMuted))),
      ],
    );
  }
}
