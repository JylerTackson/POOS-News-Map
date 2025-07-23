// lib/models/user_model.dart

import '../screens/article.dart';

class UserModel {
  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String? avatarUrl;
  final List<Article> savedArticles; // <-- Add this field

  UserModel({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    this.avatarUrl,
    this.savedArticles = const [], // <-- Initialize here
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    // Logic to parse savedArticles from the API response
    final articlesData = json['savedArticles'] as List<dynamic>? ?? [];
    final articles = articlesData
        .map((data) => Article.fromJson(data as Map<String, dynamic>))
        .toList();

    return UserModel(
      id: json['_id'] as String,
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      email: json['email'] as String,
      avatarUrl: json['avatarUrl'] as String?,
      savedArticles: articles, // <-- Assign the parsed articles
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'avatarUrl': avatarUrl,
      // Serialize the list of articles
      'savedArticles': savedArticles.map((a) => a.toJson()).toList(),
    };
  }

  UserModel copyWith({
    String? firstName,
    String? lastName,
    String? email,
    String? avatarUrl,
    List<Article>? savedArticles, // <-- Add to copyWith
  }) {
    return UserModel(
      id: id,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      email: email ?? this.email,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      savedArticles: savedArticles ?? this.savedArticles,
    );
  }
}
