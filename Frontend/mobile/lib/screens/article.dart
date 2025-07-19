class Article {
  final String country;
  final String headline;
  final String body;
  final DateTime date;
  final String source;

  Article({
    required this.country,
    required this.headline,
    required this.body,
    required this.date,
    required this.source,
  });

  // Factory constructor to create an Article from JSON
  factory Article.fromJson(Map<String, dynamic> json) {
    return Article(
      country: json['country'] ?? 'Unknown',
      headline: json['headline'] ?? 'No Headline',
      body: json['body'] ?? 'No content available.',
      date: DateTime.parse(json['date']), // Assumes date is in ISO 8601 format
      source: json['source'] ?? 'Unknown Source'
    );
  }
}