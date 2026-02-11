class Job {
  final String id;
  final String title;
  final String organization;
  final String location;
  final String salaryRange;
  final String applyUri;
  final String type;
  final String postedDate;
  final String summary;

  Job({
    required this.id,
    required this.title,
    required this.organization,
    required this.location,
    required this.salaryRange,
    required this.applyUri,
    required this.type,
    required this.postedDate,
    required this.summary,
  });

  factory Job.fromUSAJobsJson(Map<String, dynamic> json) {
    final descriptor = json['MatchedObjectDescriptor'] as Map<String, dynamic>;

    // Extract Location
    String locationName = 'Remote';
    final locations = descriptor['PositionLocation'] as List?;
    if (locations != null && locations.isNotEmpty) {
      locationName = locations[0]['LocationName'] ?? 'Remote';
    }

    // Extract Salary
    String salary = 'Competitive';
    final remuneration = descriptor['PositionRemuneration'] as List?;
    if (remuneration != null && remuneration.isNotEmpty) {
      final rem = remuneration[0];
      final min = rem['MinimumRange'] ?? '0';
      final max = rem['MaximumRange'] ?? '0';
      final interval = rem['RateIntervalCode'] == 'PA' ? '/yr' : '/hr';
      salary = '\$$min - \$$max$interval';
    }

    // Extract Type
    String jobType = 'Full-time';
    final schedules = descriptor['PositionSchedule'] as List?;
    if (schedules != null && schedules.isNotEmpty) {
      jobType = schedules[0]['Name'] ?? 'Full-time';
    }

    // Extract Summary
    String jobSummary = '';
    final userArea = descriptor['UserArea'] as Map<String, dynamic>?;
    if (userArea != null) {
      final details = userArea['Details'] as Map<String, dynamic>?;
      if (details != null) {
        jobSummary = details['JobSummary'] ?? '';
      }
    }

    return Job(
      id: descriptor['PositionID'] ?? '',
      title: descriptor['PositionTitle'] ?? '',
      organization: descriptor['OrganizationName'] ?? '',
      location: locationName,
      salaryRange: salary,
      applyUri: descriptor['PositionURI'] ?? '',
      type: jobType,
      postedDate: descriptor['PublicationStartDate'] ?? '',
      summary: jobSummary,
    );
  }
}
