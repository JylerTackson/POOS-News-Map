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
      // Use '??' to provide a default if the value is null
      headline: json['headline'] ?? 'No Headline Available',
      body: json['body'] ?? 'No content.',
      source: json['source'] ?? 'Unknown Source',
      country: json['country'] ?? 'Unknown Country',
      url: json['url'] ?? '', // Default to an empty string for the URL

      // Safely parse the date, providing a fallback for nulls or errors
      date: json['date'] != null
          ? DateTime.tryParse(json['date'].toString()) ?? DateTime.now()
          : DateTime.now(),

      // This was already correct!
      favorite: json['favorite'] ?? false,
    );
  }
}
