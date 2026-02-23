class Testimonial {
  final String id;
  final String name;
  final String? location;
  final String? service;
  final String text;
  final double rating;
  final DateTime createdAt;

  Testimonial({
    required this.id,
    required this.name,
    this.location,
    this.service,
    required this.text,
    required this.rating,
    required this.createdAt,
  });

  factory Testimonial.fromJson(Map<String, dynamic> json) {
    return Testimonial(
      id: json['id'] as String,
      name: json['name'] as String,
      location: json['location'] as String?,
      service: json['service'] as String?,
      text: json['text'] as String,
      rating: (json['rating'] as num? ?? 5).toDouble(),
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }
}
