// lib/models/article.dart
class Article {
  final String headline, body, source, country;
  final DateTime date;

  Article({
    required this.headline,
    required this.body,
    required this.source,
    required this.country,
    required this.date,
  });

  factory Article.fromJson(Map<String, dynamic> json) {
    return Article(
      headline: json['headline'],
      body: json['body'],
      source: json['source'],
      country: json['country'],
      date: DateTime.parse(json['date'] as String),
    );
  }
}
