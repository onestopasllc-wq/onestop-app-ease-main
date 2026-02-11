import 'dart:async';
import 'package:flutter/material.dart';
import 'package:onestop_mobile_app/theme/app_theme.dart';
import 'package:onestop_mobile_app/services/supabase_service.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class MainScaffold extends StatefulWidget {
  final Widget body;
  final int currentIndex;
  final String title;
  final List<Widget>? actions;
  final Widget? floatingActionButton;

  const MainScaffold({
    super.key,
    required this.body,
    required this.currentIndex,
    required this.title,
    this.actions,
    this.floatingActionButton,
  });

  @override
  State<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends State<MainScaffold> {
  User? _user;
  late final StreamSubscription<AuthState> _authSubscription;

  @override
  void initState() {
    super.initState();
    _user = SupabaseService.client.auth.currentUser;
    _authSubscription =
        SupabaseService.client.auth.onAuthStateChange.listen((data) {
      if (mounted) {
        setState(() {
          _user = data.session?.user;
        });
      }
    });
  }

  @override
  void dispose() {
    _authSubscription.cancel();
    super.dispose();
  }

  Future<void> _handleLogout() async {
    try {
      await SupabaseService.client.auth.signOut();
      if (mounted) {
        Navigator.pushReplacementNamed(context, '/');
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Logged out successfully')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error logging out: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isHome = widget.currentIndex == 0;
    return Scaffold(
      extendBodyBehindAppBar: isHome,
      appBar: AppBar(
        title: isHome ? null : Text(widget.title),
        elevation: 0,
        backgroundColor: isHome ? Colors.transparent : Colors.white,
        foregroundColor: isHome ? Colors.white : AppTheme.primaryBlue,
        actions: widget.actions,
      ),
      drawer: _buildDrawer(context),
      body: widget.body,
      bottomNavigationBar: _buildBottomNav(context),
      floatingActionButton: widget.floatingActionButton,
    );
  }

  Widget _buildDrawer(BuildContext context) {
    final bool isLoggedIn = _user != null;

    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          DrawerHeader(
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(
                bottom: BorderSide(color: Color(0xFFE2E8F0)),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SizedBox(
                  height: 100,
                  width: double.infinity,
                  child: Transform.scale(
                    scale: 1.4,
                    alignment: Alignment.centerLeft,
                    child: Image.asset(
                      'assets/logo_image.png',
                      fit: BoxFit.contain,
                      alignment: Alignment.centerLeft,
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  isLoggedIn ? (_user!.email ?? 'Welcome!') : 'OneStop App',
                  style: const TextStyle(
                      color: AppTheme.primaryBlue,
                      fontSize: 14,
                      fontWeight: FontWeight.bold),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          _buildDrawerItem(context, Icons.home, 'Home', '/', 0),
          if (isLoggedIn)
            _buildDrawerItem(context, Icons.dashboard_outlined, 'Dashboard',
                '/dashboard', 4),
          _buildDrawerItem(
              context, Icons.info_outline, 'About Us', '/about', 1),
          _buildDrawerItem(context, Icons.miscellaneous_services, 'Services',
              '/services', 2),
          _buildDrawerItem(
              context, Icons.home_work_outlined, 'Rentals', '/rentals', 3),
          _buildDrawerItem(
              context, Icons.work_outline, 'Legal Jobs', '/jobs', -1),
          _buildDrawerItem(context, Icons.car_repair_outlined, 'Dealerships',
              '/dealerships', -1),
          _buildDrawerItem(
              context, Icons.shield_outlined, 'Insurance', '/insurance', -1),
          _buildDrawerItem(context, Icons.medical_services_outlined,
              'Health Insurance', '/health-insurance', -1),
          const Divider(),
          _buildDrawerItem(
              context, Icons.star_outline, 'Testimonials', '/testimonials', -1),
          _buildDrawerItem(context, Icons.help_outline, 'FAQ', '/faq', -1),
          _buildDrawerItem(context, Icons.contact_support_outlined,
              'Contact Us', '/contact', -1),
          const Divider(),
          if (!isLoggedIn)
            _buildDrawerItem(context, Icons.login, 'Sign In', '/login', -1)
          else
            ListTile(
              leading: const Icon(Icons.logout, color: Colors.redAccent),
              title: const Text('Log Out',
                  style: TextStyle(color: Colors.redAccent)),
              onTap: () {
                Navigator.pop(context);
                _handleLogout();
              },
            ),
        ],
      ),
    );
  }

  Widget _buildDrawerItem(BuildContext context, IconData icon, String title,
      String route, int index) {
    final isSelected = index == widget.currentIndex && index != -1;
    return ListTile(
      leading: Icon(icon, color: isSelected ? AppTheme.secondaryTeal : null),
      title: Text(title,
          style: TextStyle(
              color: isSelected ? AppTheme.secondaryTeal : null,
              fontWeight: isSelected ? FontWeight.bold : null)),
      onTap: () {
        Navigator.pop(context);
        if (index == widget.currentIndex && index != -1) return;
        Navigator.pushReplacementNamed(context, route);
      },
    );
  }

  Widget _buildBottomNav(BuildContext context) {
    final bool isLoggedIn = _user != null;

    final List<BottomNavigationBarItem> navItems = [
      const BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
      const BottomNavigationBarItem(icon: Icon(Icons.info), label: 'About'),
      const BottomNavigationBarItem(
          icon: Icon(Icons.miscellaneous_services), label: 'Services'),
      const BottomNavigationBarItem(
          icon: Icon(Icons.home_work), label: 'Rentals'),
    ];

    if (isLoggedIn) {
      navItems.add(
        const BottomNavigationBarItem(
            icon: Icon(Icons.dashboard), label: 'Dashboard'),
      );
    }

    // Adjust currentIndex mapping if Dashboard is hidden
    int activeIndex = widget.currentIndex;
    if (activeIndex == 4 && !isLoggedIn) {
      activeIndex = 0; // Fallback if somehow on dashboard while logged out
    }

    return BottomNavigationBar(
      currentIndex:
          (activeIndex >= 0 && activeIndex < navItems.length) ? activeIndex : 0,
      selectedItemColor: AppTheme.secondaryTeal,
      unselectedItemColor: AppTheme.textMuted,
      type: BottomNavigationBarType.fixed,
      items: navItems,
      onTap: (index) {
        if (index == widget.currentIndex) return;
        String route = '/';
        switch (index) {
          case 0:
            route = '/';
            break;
          case 1:
            route = '/about';
            break;
          case 2:
            route = '/services';
            break;
          case 3:
            route = '/rentals';
            break;
          case 4:
            route = '/dashboard';
            break;
        }
        Navigator.pushReplacementNamed(context, route);
      },
    );
  }
}
