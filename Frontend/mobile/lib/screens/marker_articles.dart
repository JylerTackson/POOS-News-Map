import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:geocoding/geocoding.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:latlong2/latlong.dart';
import 'package:url_launcher/url_launcher.dart';

import 'article.dart';

class MapArticleSheet extends StatefulWidget {
  final LatLng location;

  const MapArticleSheet({super.key, required this.location});

  @override
  State<MapArticleSheet> createState() => _MapArticleSheetState();
}

class _MapArticleSheetState extends State<MapArticleSheet> {
  String? _countryName;
  List<Article> _articles = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchDataForLocation();
  }

  /// Fetches the country name from coordinates and then news for that country.
  Future<void> _fetchDataForLocation() async {
    try {
      // Step 1: Reverse geocode the coordinates to get a placemark.
      final placemarks = await placemarkFromCoordinates(
        widget.location.latitude,
        widget.location.longitude,
      );

      if (placemarks.isEmpty || placemarks.first.country == null) {
        throw 'Could not determine the country for this location.';
      }
      final country = placemarks.first.country!;
      setState(() {
        _countryName = country;
      });

      // Step 2: Fetch news articles for the determined country.
      // Note: This assumes you have an API endpoint that accepts a country name.
      final url = Uri.parse('${dotenv.env['API_BASE_URL']}/api/news/by-country/$country');
      final response = await http.get(url);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as List;
        setState(() {
          _articles = data.map((json) => Article.fromJson(json)).toList();
        });
      } else {
         throw 'No articles found for $country (Status: ${response.statusCode})';
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  /// Launches the article URL in a browser.
  Future<void> _launchURL(String url) async {
    final uri = Uri.parse(url);
    if (!await launchUrl(uri)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not launch $url')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // This makes the sheet resizable.
    return DraggableScrollableSheet(
      initialChildSize: 0.4, // Start at 40% of screen height
      minChildSize: 0.2,   // Can be dragged down to 20%
      maxChildSize: 0.9,   // Can be dragged up to 90%
      expand: false,
      builder: (_, scrollController) {
        Widget content;
        if (_isLoading) {
          content = const Center(child: CircularProgressIndicator());
        } else if (_error != null) {
          content = Center(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text('Error: $_error', style: const TextStyle(color: Colors.red), textAlign: TextAlign.center),
            ),
          );
        } else if (_articles.isEmpty) {
          content = Center(child: Text('No articles found for $_countryName.'));
        } else {
          content = ListView.builder(
            controller: scrollController,
            itemCount: _articles.length,
            itemBuilder: (ctx, i) {
              final a = _articles[i];
              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                clipBehavior: Clip.antiAlias,
                child: InkWell(
                  onTap: () => _launchURL(a.url),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(a.headline, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text(a.source, style: const TextStyle(color: Colors.grey, fontStyle: FontStyle.italic)),
                        const SizedBox(height: 8),
                        Text(a.body, maxLines: 2, overflow: TextOverflow.ellipsis),
                        const SizedBox(height: 8),
                        Align(
                          alignment: Alignment.centerRight,
                          child: Text(DateFormat.yMMMd().format(a.date)),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          );
        }

        return Container(
          decoration: BoxDecoration(
            color: Theme.of(context).scaffoldBackgroundColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            boxShadow: [
              BoxShadow(
                blurRadius: 10,
                color: Colors.black.withOpacity(0.2),
              ),
            ],
          ),
          child: Column(
            children: [
              // Draggable handle
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 8.0),
                child: Container(
                  width: 40,
                  height: 5,
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
              if (_countryName != null && _articles.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                  child: Text(
                    'News from $_countryName',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                ),
              Expanded(child: content),
            ],
          ),
        );
      },
    );
  }
}
