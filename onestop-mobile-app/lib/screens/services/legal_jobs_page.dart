import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:onestop_mobile_app/theme/app_theme.dart';
import 'package:onestop_mobile_app/widgets/main_scaffold.dart';
import 'package:onestop_mobile_app/models/job.dart';
import 'package:onestop_mobile_app/services/job_service.dart';
import 'package:url_launcher/url_launcher.dart';

class LegalJobsPage extends StatefulWidget {
  const LegalJobsPage({super.key});

  @override
  State<LegalJobsPage> createState() => _LegalJobsPageState();
}

class _LegalJobsPageState extends State<LegalJobsPage> {
  final TextEditingController _searchController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  bool _loading = true;
  String? _errorMessage;
  List<Job> _filteredJobs = [];
  int _currentPage = 1;

  @override
  void initState() {
    super.initState();
    _fetchJobs();
  }

  Future<void> _fetchJobs({String keyword = 'legal', int page = 1}) async {
    setState(() {
      _loading = true;
      _errorMessage = null;
      _currentPage = page;
    });

    try {
      final jobs = await JobService.fetchJobs(keyword: keyword, page: page);
      if (mounted) {
        setState(() {
          _filteredJobs = jobs;
          _loading = false;
          if (jobs.isEmpty && page == 1) {
            _errorMessage = 'No federal positions found for "$keyword".';
          }
        });
        // Scroll to top when page changes
        if (_scrollController.hasClients) {
          _scrollController.animateTo(0,
              duration: const Duration(milliseconds: 500),
              curve: Curves.easeInOut);
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage =
              'Failed to connect to USAJobs. Please check your internet.';
          _loading = false;
        });
      }
    }
  }

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not launch application link')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return MainScaffold(
      currentIndex: -1,
      title: 'Legal Careers',
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              AppTheme.primaryBlue.withOpacity(0.05),
              Colors.white,
            ],
          ),
        ),
        child: Column(
          children: [
            _buildHero(context),
            Expanded(
              child: _loading
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const CircularProgressIndicator(
                              color: AppTheme.secondaryTeal),
                          const SizedBox(height: 16),
                          Text('Searching live careers...',
                              style: TextStyle(
                                  color: Colors.grey[600],
                                  fontWeight: FontWeight.w500)),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: () => _fetchJobs(
                          page: 1,
                          keyword: _searchController.text.isEmpty
                              ? 'legal'
                              : _searchController.text),
                      child: SingleChildScrollView(
                        controller: _scrollController,
                        physics: const AlwaysScrollableScrollPhysics(),
                        child: Column(
                          children: [
                            if (_filteredJobs.isEmpty)
                              _buildEmptyState()
                            else
                              _buildJobList(),
                            if (_filteredJobs.isNotEmpty) _buildPaginationBar(),
                            const SizedBox(height: 40),
                          ],
                        ),
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHero(BuildContext context) {
    return Stack(
      children: [
        Container(
          width: double.infinity,
          padding:
              const EdgeInsets.only(top: 40, bottom: 60, left: 24, right: 24),
          decoration: const BoxDecoration(
            color: Colors.transparent,
          ),
          child: Column(
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: AppTheme.secondaryTeal.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(30),
                  border: Border.all(
                      color: AppTheme.secondaryTeal.withOpacity(0.2)),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    FaIcon(FontAwesomeIcons.briefcase,
                        size: 14, color: AppTheme.secondaryTeal),
                    SizedBox(width: 8),
                    Text('Career Opportunities',
                        style: TextStyle(
                            color: AppTheme.secondaryTeal,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                            letterSpacing: 1.2)),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              RichText(
                textAlign: TextAlign.center,
                text: const TextSpan(
                  style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primaryBlue,
                      height: 1.1),
                  children: [
                    TextSpan(text: 'Find Your Next '),
                    TextSpan(
                        text: 'Legal Job',
                        style: TextStyle(color: AppTheme.secondaryTeal)),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Browse thousands of legal positions for US citizens via USAJobs.gov',
                textAlign: TextAlign.center,
                style: TextStyle(color: AppTheme.textMuted, fontSize: 16),
              ),
            ],
          ),
        ),
        Positioned(
          bottom: 0,
          left: 24,
          right: 24,
          child: Container(
            height: 60,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(30),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: TextField(
              controller: _searchController,
              onSubmitted: (value) =>
                  _fetchJobs(keyword: value.isEmpty ? 'legal' : value, page: 1),
              style: const TextStyle(fontSize: 16),
              decoration: InputDecoration(
                hintText: 'Search roles (e.g. Attorney, Paralegal)...',
                hintStyle: TextStyle(color: Colors.grey[400]),
                prefixIcon: const Padding(
                  padding: EdgeInsets.only(left: 20, right: 12),
                  child: Icon(Icons.search, color: AppTheme.secondaryTeal),
                ),
                suffixIcon: Padding(
                  padding: const EdgeInsets.all(6.0),
                  child: ElevatedButton(
                    onPressed: () => _fetchJobs(
                        keyword: _searchController.text.isEmpty
                            ? 'legal'
                            : _searchController.text,
                        page: 1),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.secondaryTeal,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(25)),
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      elevation: 0,
                    ),
                    child: const Text('Search',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(vertical: 20),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildJobList() {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 40, 16, 16),
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _filteredJobs.length,
      itemBuilder: (context, index) {
        final job = _filteredJobs[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border(
                left: BorderSide(color: AppTheme.secondaryTeal, width: 4)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 15,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            job.title,
                            style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                height: 1.2,
                                color: AppTheme.primaryBlue),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: AppTheme.secondaryTeal.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            job.type,
                            style: const TextStyle(
                                color: AppTheme.secondaryTeal,
                                fontSize: 11,
                                fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        const Icon(Icons.business,
                            size: 16, color: Colors.grey),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            job.organization,
                            style: const TextStyle(
                                color: AppTheme.textMuted,
                                fontSize: 15,
                                fontWeight: FontWeight.w600),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    const Divider(),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        _buildInfoIcon(
                            Icons.location_on_outlined, job.location),
                        const SizedBox(width: 16),
                        _buildInfoIcon(Icons.calendar_today_outlined,
                            'Posted: ${job.postedDate}'),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        const Icon(Icons.monetization_on_outlined,
                            size: 18, color: AppTheme.secondaryTeal),
                        const SizedBox(width: 8),
                        Text(
                          job.salaryRange,
                          style: const TextStyle(
                            color: AppTheme.primaryBlue,
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    if (job.summary.isNotEmpty) ...[
                      Text(
                        job.summary,
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                            color: Colors.grey[600], height: 1.5, fontSize: 14),
                      ),
                      const SizedBox(height: 20),
                    ],
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () => _launchUrl(job.applyUri),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primaryBlue,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                          elevation: 2,
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text('Apply Now',
                                style: TextStyle(
                                    fontWeight: FontWeight.bold, fontSize: 16)),
                            const SizedBox(width: 8),
                            const Icon(Icons.arrow_forward, size: 18),
                          ],
                        ),
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

  Widget _buildInfoIcon(IconData icon, String text) {
    return Expanded(
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppTheme.secondaryTeal),
          const SizedBox(width: 6),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(color: AppTheme.textMuted, fontSize: 13),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaginationBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _buildPaginationButton(
            onPressed: _currentPage > 1
                ? () => _fetchJobs(
                    keyword: _searchController.text.isEmpty
                        ? 'legal'
                        : _searchController.text,
                    page: _currentPage - 1)
                : null,
            child: const Icon(Icons.chevron_left),
          ),
          const SizedBox(width: 8),
          // Show a few numbers around current
          for (int i = (_currentPage - 2).clamp(1, 100);
              i <= (_currentPage + 2).clamp(1, 100) && i < 100;
              i++)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: _buildPaginationButton(
                onPressed: () => _fetchJobs(
                    keyword: _searchController.text.isEmpty
                        ? 'legal'
                        : _searchController.text,
                    page: i),
                isActive: i == _currentPage,
                child: Text('$i',
                    style: const TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          const SizedBox(width: 8),
          _buildPaginationButton(
            onPressed: () => _fetchJobs(
                keyword: _searchController.text.isEmpty
                    ? 'legal'
                    : _searchController.text,
                page: _currentPage + 1),
            child: const Icon(Icons.chevron_right),
          ),
        ],
      ),
    );
  }

  Widget _buildPaginationButton(
      {required Widget child, VoidCallback? onPressed, bool isActive = false}) {
    return SizedBox(
      width: 44,
      height: 44,
      child: OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          padding: EdgeInsets.zero,
          backgroundColor: isActive ? AppTheme.secondaryTeal : Colors.white,
          foregroundColor: isActive ? Colors.white : AppTheme.primaryBlue,
          side: BorderSide(
              color: isActive ? AppTheme.secondaryTeal : Colors.grey[300]!),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        child: child,
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40.0),
        child: Column(
          children: [
            const SizedBox(height: 60),
            Icon(
              _errorMessage != null && _errorMessage!.contains('connect')
                  ? Icons.wifi_off_rounded
                  : Icons.search_off_rounded,
              size: 80,
              color: Colors.grey[200],
            ),
            const SizedBox(height: 24),
            Text(
              _errorMessage != null && _errorMessage!.contains('connect')
                  ? 'Connection Error'
                  : 'No jobs found',
              style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryBlue),
            ),
            const SizedBox(height: 12),
            Text(
              _errorMessage ??
                  'Try adjusting your search terms or filters to find more results.',
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppTheme.textMuted, fontSize: 16),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: 200,
              child: ElevatedButton(
                onPressed: () {
                  _searchController.clear();
                  _fetchJobs(keyword: 'legal', page: 1);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.secondaryTeal,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30)),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text('Reset Search',
                    style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }
}
