class CommunityService {
  final String id;
  final String name;
  final String category;
  final String description;
  final String? websiteUrl;
  final String? logoUrl;
  final String? contactName;
  final String? contactPhone;
  final String? contactEmail;
  final String? address;
  final bool isActive;
  final bool isFeatured;
  final int displayOrder;
  final DateTime createdAt;

  CommunityService({
    required this.id,
    required this.name,
    required this.category,
    required this.description,
    this.websiteUrl,
    this.logoUrl,
    this.contactName,
    this.contactPhone,
    this.contactEmail,
    this.address,
    required this.isActive,
    required this.isFeatured,
    required this.displayOrder,
    required this.createdAt,
  });

  factory CommunityService.fromJson(Map<String, dynamic> json) {
    return CommunityService(
      id: json['id'] as String,
      name: json['name'] as String,
      category: json['category'] as String,
      description: json['description'] as String,
      websiteUrl: json['website_url'] as String?,
      logoUrl: json['logo_url'] as String?,
      contactName: json['contact_name'] as String?,
      contactPhone: json['contact_phone'] as String?,
      contactEmail: json['contact_email'] as String?,
      address: json['address'] as String?,
      isActive: json['is_active'] as bool? ?? true,
      isFeatured: json['is_featured'] as bool? ?? false,
      displayOrder: json['display_order'] as int? ?? 0,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : DateTime.now(),
    );
  }
}
