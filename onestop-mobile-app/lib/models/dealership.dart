class Dealership {
  final String id;
  final String name;
  final String websiteUrl;
  final String? logoUrl;
  final String description;
  final bool isFeatured;
  final int displayOrder;

  Dealership({
    required this.id,
    required this.name,
    required this.websiteUrl,
    this.logoUrl,
    required this.description,
    required this.isFeatured,
    required this.displayOrder,
  });

  factory Dealership.fromJson(Map<String, dynamic> json) {
    return Dealership(
      id: json['id'] as String,
      name: json['name'] as String,
      websiteUrl: json['website_url'] as String,
      logoUrl: json['logo_url'] as String?,
      description: json['description'] as String,
      isFeatured: json['is_featured'] as bool? ?? false,
      displayOrder: json['display_order'] as int? ?? 0,
    );
  }
}
