// lib/screens/marker_articles.dart

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:geocoding/geocoding.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:latlong2/latlong.dart';
import 'package:url_launcher/url_launcher.dart';

import '../services/auth_service.dart';
import 'article.dart';

const Map<String, String> countryNameToCode = {
  "United Arab Emirates": "ae",
  "Argentina": "ar",
  "Austria": "at",
  "Australia": "au",
  "Belgium": "be",
  "Bulgaria": "bg",
  "Brazil": "br",
  "Canada": "ca",
  "Switzerland": "ch",
  "China": "cn",
  "Colombia": "co",
  "Cuba": "cu",
  "Czech Republic": "cz",
  "Germany": "de",
  "Egypt": "eg",
  "France": "fr",
  "United Kingdom": "gb",
  "Great Britain": "gb",
  "Greece": "gr",
  "Hong Kong": "hk",
  "Hungary": "hu",
  "Indonesia": "id",
  "Ireland": "ie",
  "Israel": "il",
  "India": "in",
  "Italy": "it",
  "Japan": "jp",
  "South Korea": "kr",
  "Lithuania": "lt",
  "Latvia": "lv",
  "Morocco": "ma",
  "Mexico": "mx",
  "Malaysia": "my",
  "Nigeria": "ng",
  "Netherlands": "nl",
  "Norway": "no",
  "New Zealand": "nz",
  "Philippines": "ph",
  "Poland": "pl",
  "Portugal": "pt",
  "Romania": "ro",
  "Serbia": "rs",
  "Russia": "ru",
  "Saudi Arabia": "sa",
  "Sweden": "se",
  "Singapore": "sg",
  "Slovenia": "si",
  "Slovakia": "sk",
  "Thailand": "th",
  "Turkey": "tr",
  "Taiwan": "tw",
  "Ukraine": "ua",
  "United States": "us",
  "USA": "us",
  "Venezuela": "ve",
  "South Africa": "za"
};

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
      final placemarks = await placemarkFromCoordinates(
        widget.location.latitude,
        widget.location.longitude,
      );
      if (placemarks.isEmpty || placemarks.first.country == null) {
        throw 'Could not determine the country name.';
      }

      final countryName = placemarks.first.country!;
      setState(() => _countryName = countryName);

      final countryCode = countryNameToCode[countryName];
      if (countryCode == null) {
        throw 'News is not available for "$countryName".';
      }

      final baseUrl = dotenv.env['API_BASE_URL'];
      if (baseUrl == null) {
        throw 'API_BASE_URL is not set.';
      }

      final url = Uri.parse('$baseUrl/api/news/country/$countryCode');
      final response = await http.get(url);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final data = jsonDecode(response.body) as List;
        setState(() {
          _articles = data.map((json) => Article.fromJson(json)).toList();
        });
      } else {
        throw 'No articles found for $_countryName (Status: ${response.statusCode})';
      }
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _isLoading = false);
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
    return DraggableScrollableSheet(
      initialChildSize: 0.4,
      minChildSize: 0.2,
      maxChildSize: 0.9,
      expand: false,
      builder: (_, scrollController) {
        Widget content;
        if (_isLoading) {
          content = const Center(child: CircularProgressIndicator());
        } else if (_error != null) {
          content = Center(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                'Error: $_error',
                style: const TextStyle(color: Colors.red),
                textAlign: TextAlign.center,
              ),
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
              return Consumer<AuthService>(
                builder: (context, auth, _) {
                  final user = auth.currentUser;
                  final isFav = user != null &&
                      user.savedArticles.any((x) =>
                          x.headline == a.headline && x.source == a.source);

                  return Card(
                    margin:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    clipBehavior: Clip.antiAlias,
                    child: InkWell(
                      onTap: () => _launchURL(a.url),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              a.headline,
                              style: const TextStyle(
                                  fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              a.source,
                              style: const TextStyle(
                                  color: Colors.grey,
                                  fontStyle: FontStyle.italic),
                            ),
                            const SizedBox(height: 8),
                            Text(a.body,
                                maxLines: 2, overflow: TextOverflow.ellipsis),
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  DateFormat.yMMMd().format(a.date),
                                  style: const TextStyle(color: Colors.grey),
                                ),
                                IconButton(
                                  icon: Icon(
                                    isFav
                                        ? Icons.favorite
                                        : Icons.favorite_border,
                                    color: isFav ? Colors.red : null,
                                  ),
                                  onPressed: () async {
                                    if (user == null) {
                                      ScaffoldMessenger.of(context)
                                          .showSnackBar(const SnackBar(
                                        content: Text(
                                            'Please log in to manage favorites.'),
                                      ));
                                      return;
                                    }
                                    try {
                                      if (isFav) {
                                        await auth.removeFavorite(a);
                                        ScaffoldMessenger.of(context)
                                            .showSnackBar(const SnackBar(
                                          content:
                                              Text('Removed from favorites.'),
                                          backgroundColor: Colors.green,
                                        ));
                                      } else {
                                        await auth.addFavorite(a);
                                        ScaffoldMessenger.of(context)
                                            .showSnackBar(const SnackBar(
                                          content: Text('Added to favorites.'),
                                          backgroundColor: Colors.green,
                                        ));
                                      }
                                    } catch (e) {
                                      ScaffoldMessenger.of(context)
                                          .showSnackBar(SnackBar(
                                        content: Text(e.toString()),
                                      ));
                                    }
                                  },
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
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
