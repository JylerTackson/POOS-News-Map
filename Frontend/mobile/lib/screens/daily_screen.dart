import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:intl/intl.dart';

import 'article.dart';

class DailyScreen extends StatefulWidget {
  final String title;
  const DailyScreen({super.key, required this.title});

  @override
  State<DailyScreen> createState() => _DailyScreenState();
}

class _DailyScreenState extends State<DailyScreen> {
  List<Article> _articles = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    getArticles();
  }

  Future<void> getArticles() async {
    try {
      final url = Uri.parse('${dotenv.env['API_BASE_URL']}/api/news/daily');
      final response = await http.get(url);

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        setState(() {
          _articles = data.map((json) => Article.fromJson(json)).toList();
          _isLoading = false;
        });
      } else {
        throw Exception('Failed to load articles: ${response.statusCode}');
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // Title of the screen
      appBar: AppBar(
        backgroundColor: Colors.white,
        centerTitle: true,
        title: Text('Today\'s News'),
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator());
    } else if (_errorMessage != null) {
      return Center(
        child: Text(
          'Error: $_errorMessage',
          style: const TextStyle(color: Colors.red),
        ),
      );
    } else if (_articles.isEmpty) {
      return const Center(
        child: Text('No articles available for today.'),
      );
    } else {
      // List of news articles
      return GridView.builder(
        padding: const EdgeInsets.all(12.0),

        gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
        maxCrossAxisExtent: 500.0,
        mainAxisExtent: 350,
        crossAxisSpacing: 16.0,
        mainAxisSpacing: 16.0,
      ),

        itemCount: _articles.length,
        itemBuilder: (context, index) {
          final article = _articles[index];
          return Center(
            child: SizedBox(
              width: 400,
              height: 320,
              child: Padding(
                padding: const EdgeInsets.all(8.0),
                child: NewsCard(
                  headline: article.headline,
                  countryAbbreviation: article.country,
                  source: article.source,
                  summary: article.body,
                  date: DateFormat. yMMMd().format(article.date),
                ),
              ),
            ),
          );
        }
      );
    }
  }
}

class NewsCard extends StatelessWidget {
  final String headline;
  final String source;
  final String countryAbbreviation;
  final String summary;
  final String date;

  const NewsCard({
    super.key,
    required this.headline,
    required this.source,
    required this.countryAbbreviation,
    required this.summary,
    required this.date,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Colors.white,
      elevation: 2.0,
      margin: const EdgeInsets.only(bottom: 16.0),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Headline
            Text(
              headline,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
            ),
            const SizedBox(height: 4),

            // Source and Country
            Text(
              '$source • $countryAbbreviation',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 20),

            // Summary
            Text(
              summary,
              textAlign: TextAlign.center,
              overflow: TextOverflow.ellipsis,
              maxLines: 3,
              style: const TextStyle(
                fontSize: 16,
                color: Colors.black,
                height: 1.4,
              ),
            ),

            const Spacer(), // Push date/favorite button to bottom

            // Footer with Date and Like Icon
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  date,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.favorite_border, color: Colors.black),
                  onPressed: () {
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}