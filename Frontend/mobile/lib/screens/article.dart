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
      headline: json['headline'] ?? 'No Headline Available',
      body: json['body'] ?? 'No content.',
      source: json['source'] ?? 'Unknown Source',
      country: json['country'] ?? 'Unknown Country',
      url: json['url'] ?? '',
      date: json['date'] != null
          ? DateTime.tryParse(json['date'].toString()) ?? DateTime.now()
          : DateTime.now(),
      favorite: json['favorite'] ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
    'headline': headline,
    'body': body,
    'source': source,
    'country': country,
    'date': date.toIso8601String(),
    'url': url,
    'favorite': favorite,
  };

  Article copyWith({bool? favorite}) {
    return Article(
      headline: headline,
      body: body,
      source: source,
      country: country,
      date: date,
      url: url,
      favorite: favorite ?? this.favorite,
    );
  }
}