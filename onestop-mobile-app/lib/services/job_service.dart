import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';
import 'package:onestop_mobile_app/models/job.dart';

class JobService {
  // Discovered from the website's .env file
  static const String _apiKey = 'Iyy2ZDZO/dFXTAgTKBqt8pBJKt5uo3K6PbnOFA/alHI=';
  static const String _userAgent = 'onestopasllc@gmail.com';
  static const String _baseUrl = 'https://data.usajobs.gov/api/search';

  static Future<List<Job>> fetchJobs(
      {String keyword = 'legal', String location = '', int page = 1}) async {
    try {
      final queryParams = {
        'Keyword': keyword,
        'ResultsPerPage': '10',
        'Page': (page - 1).toString(), // USAJobs is 0-indexed for pages
      };

      if (location.isNotEmpty) {
        queryParams['LocationName'] = location;
      }

      final uri = Uri.parse(_baseUrl).replace(queryParameters: queryParams);
      debugPrint('Fetching jobs from: $uri');

      final response = await http.get(
        uri,
        headers: {
          'User-Agent': _userAgent,
          'Authorization-Key': _apiKey,
        },
      );

      debugPrint('USAJobs Response Status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data == null || data['SearchResult'] == null) {
          debugPrint('USAJobs: Invalid data structure');
          return [];
        }

        final searchResult = data['SearchResult'] as Map<String, dynamic>;
        final items = searchResult['SearchResultItems'] as List?;

        if (items == null || items.isEmpty) {
          debugPrint('USAJobs: No items found');
          return [];
        }

        return items.map((item) => Job.fromUSAJobsJson(item)).toList();
      } else {
        debugPrint(
            'USAJobs API Error: ${response.statusCode} - ${response.body}');
        return [];
      }
    } catch (e, stack) {
      debugPrint('Error fetching jobs: $e');
      debugPrint('Stack trace: $stack');
      return [];
    }
  }
}
