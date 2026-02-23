import 'package:flutter/material.dart';

class Service {
  final String title;
  final String description;
  final IconData icon;
  final List<String> features;

  Service({
    required this.title,
    required this.description,
    required this.icon,
    required this.features,
  });
}
