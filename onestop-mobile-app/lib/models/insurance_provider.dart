class InsuranceProvider {
  final String id;
  final String name;
  final String websiteUrl;
  final String? logoUrl;
  final String description;
  final int displayOrder;

  InsuranceProvider({
    required this.id,
    required this.name,
    required this.websiteUrl,
    this.logoUrl,
    required this.description,
    required this.displayOrder,
  });

  factory InsuranceProvider.fromJson(Map<String, dynamic> json) {
    return InsuranceProvider(
      id: json['id'] as String,
      name: json['name'] as String,
      websiteUrl: json['website_url'] as String,
      logoUrl: json['logo_url'] as String?,
      description: json['description'] as String,
      displayOrder: json['display_order'] as int? ?? 0,
    );
  }
}
