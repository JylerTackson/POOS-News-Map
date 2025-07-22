// lib/models/article.dart
class Article {
  final String headline, body, source, country, url;
  final DateTime date;
  final bool favorite;

  Article({
    required this.headline,
    required this.body,
    required this.source,
    required this.country,
    required this.date,
    required this.url,
    this.favorite = false,
  });

  factory Article.fromJson(Map<String, dynamic> json) {
    return Article(
      headline: json['headline'],
      body: json['body'],
      source: json['source'],
      country: json['country'],
      date: DateTime.parse(json['date'] as String),
      url: json['url'],
      favorite: json['favorite'] ?? false,
    );
  }
}
