class RentalListing {
  final String id;
  final String title;
  final String description;
  final String address;
  final String propertyType;
  final double price;
  final List<String> features;
  final String contactName;
  final String contactPhone;
  final String contactEmail;
  final List<String> images;
  final DateTime createdAt;

  RentalListing({
    required this.id,
    required this.title,
    required this.description,
    required this.address,
    required this.propertyType,
    required this.price,
    required this.features,
    required this.contactName,
    required this.contactPhone,
    required this.contactEmail,
    required this.images,
    required this.createdAt,
  });

  factory RentalListing.fromJson(Map<String, dynamic> json) {
    return RentalListing(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      address: json['address'] as String,
      propertyType: json['property_type'] as String,
      price: (json['price'] as num).toDouble(),
      features: List<String>.from(json['features'] ?? []),
      contactName: json['contact_name'] as String,
      contactPhone: json['contact_phone'] as String,
      contactEmail: json['contact_email'] as String,
      images: List<String>.from(json['images'] ?? []),
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }
}
