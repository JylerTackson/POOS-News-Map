import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart'; // Import url_launcher

import 'article.dart';

class DailyScreen extends StatefulWidget {
  final String title;
  const DailyScreen({super.key, required this.title});

  @override
  State<DailyScreen> createState() => _DailyScreenState();
}

class _DailyScreenState extends State<DailyScreen> {
  List<Article> _articles = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    try {
      final url = Uri.parse('${dotenv.env['API_BASE_URL']}/api/news/daily');
      final resp = await http.get(url);
      if (resp.statusCode == 200) {
        final data = jsonDecode(resp.body) as List;
        setState(
            () => _articles = data.map((e) => Article.fromJson(e)).toList());
      } else {
        throw 'Status ${resp.statusCode}';
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      setState(() => _loading = false);
    }
  }

  // Method to launch the URL
  Future<void> _launchURL(String url) async {
    final uri = Uri.parse(url);
    if (!await launchUrl(uri)) {
      // Show a snackbar if the URL can't be launched
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not launch $url')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
          centerTitle: true,
          title: Text(
            widget.title,
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
          ),
          backgroundColor: Colors.white,
          foregroundColor: Colors.black),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Text('Error: $_error',
                      style: const TextStyle(color: Colors.red)))
              : _articles.isEmpty
                  ? const Center(child: Text('No articles today.'))
                  : GridView.builder(
                      padding: const EdgeInsets.all(12),
                      gridDelegate:
                          const SliverGridDelegateWithMaxCrossAxisExtent(
                        maxCrossAxisExtent: 500,
                        mainAxisExtent: 350,
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                      ),
                      itemCount: _articles.length,
                      itemBuilder: (ctx, i) {
                        final a = _articles[i];
                        return SizedBox(
                          width: 400,
                          height: 320,
                          child: Card(
                            clipBehavior: Clip.antiAlias, // Recommended for InkWell
                            child: InkWell( // Wrap the content with InkWell
                              onTap: () => _launchURL(a.url), // Set the onTap action
                              child: Padding(
                                padding: const EdgeInsets.all(12),
                                child: Column(
                                  children: [
                                    Text(a.headline,
                                        style: const TextStyle(
                                            fontSize: 18,
                                            fontWeight: FontWeight.bold),
                                        textAlign: TextAlign.center),
                                    const SizedBox(height: 4),
                                    Text('${a.source} • ${a.country}',
                                        style: const TextStyle(
                                            color: Colors.grey)),
                                    const SizedBox(height: 12),
                                    Text(a.body,
                                        maxLines: 3,
                                        overflow: TextOverflow.ellipsis),
                                    const Spacer(),
                                    Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(DateFormat.yMMMd().format(a.date)),
                                        IconButton(
                                            icon: const Icon(
                                                Icons.favorite_border),
                                            onPressed: () {}),
                                      ],
                                    )
                                  ],
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
    );
  }
}