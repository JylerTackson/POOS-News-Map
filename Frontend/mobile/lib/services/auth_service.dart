// lib/services/auth_service.dart

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../models/user_model.dart';
import '../screens/article.dart';

class AuthService extends ChangeNotifier {
  final _storage = const FlutterSecureStorage();
  UserModel? _currentUser;
  UserModel? get currentUser => _currentUser;

  final String _baseUrl = dotenv.env['API_BASE_URL'] ?? '';

  AuthService() {
    _rehydrate();
  }

  Future<void> _rehydrate() async {
    final userJson = await _storage.read(key: 'user');
    if (userJson != null) {
      try {
        final map = jsonDecode(userJson) as Map<String, dynamic>;
        _currentUser = UserModel.fromJson(map);
        notifyListeners();
      } catch (_) {}
    }
  }

  Future<void> _updateAndPersistUser(UserModel user) async {
    _currentUser = user;
    await _storage.write(key: 'user', value: jsonEncode(_currentUser!.toJson()));
    notifyListeners();
  }

  Future<void> addFavorite(Article article) async {
    if (_currentUser == null) throw Exception('You must be logged in.');

    // Add article to the local list
    final updatedArticles = List<Article>.from(_currentUser!.savedArticles)..add(article);
    await _updateAndPersistUser(_currentUser!.copyWith(savedArticles: updatedArticles));

    try {
      final uri = Uri.parse('$_baseUrl/api/users/${_currentUser!.id}/favorites');
      final resp = await http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(article.toJson()),
      );

      if (resp.statusCode != 200 && resp.statusCode != 201) {
        throw Exception('Server error: Failed to add favorite.');
      }
    } catch (e) {
      // If the API call fails, revert the change
      final revertedArticles = _currentUser!.savedArticles.where((a) => a.headline != article.headline || a.source != article.source).toList();
      await _updateAndPersistUser(_currentUser!.copyWith(savedArticles: revertedArticles));
      throw Exception('Failed to save favorite. Please try again.');
    }
  }

   Future<void> removeFavorite(Article article) async {
    if (_currentUser == null) throw Exception('You must be logged in.');
    
    // Remove article from the local list
    final updatedArticles = _currentUser!.savedArticles.where((a) => a.headline != article.headline || a.source != article.source).toList();
    await _updateAndPersistUser(_currentUser!.copyWith(savedArticles: updatedArticles));

    try {
      final uri = Uri.parse('$_baseUrl/api/users/${_currentUser!.id}/favorites');
      final resp = await http.delete(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'headline': article.headline, 'source': article.source}),
      );

      if (resp.statusCode != 200 && resp.statusCode != 204) {
        throw Exception('Server error: Failed to remove favorite.');
      }
    } catch (e) {
      // If the API call fails, revert the change by re-adding the article
      final revertedArticles = List<Article>.from(_currentUser!.savedArticles)..add(article);
      await _updateAndPersistUser(_currentUser!.copyWith(savedArticles: revertedArticles));
      throw Exception('Failed to remove favorite. Please try again.');
    }
  }

  Future<void> registerUser({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
  }) async {
    final uri = Uri.parse('$_baseUrl/api/users/register');
    final resp = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'firstName': firstName,
        'lastName': lastName,
        'email': email,
        'password': password,
      }),
    );
    if (resp.statusCode != 201) {
      String message = 'Registration failed';
      if (resp.body.isNotEmpty) {
        final err = jsonDecode(resp.body) as Map<String, dynamic>;
        message = err['Error'] ?? message;
      }
      throw Exception(message);
    }
  }

  Future<void> loginUser({
    required String email,
    required String password,
  }) async {
    final uri = Uri.parse('$_baseUrl/api/users/login');
    final resp = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    if (resp.statusCode == 200 || resp.statusCode == 201) {
      final data = jsonDecode(resp.body) as Map<String, dynamic>;
      print('LOGIN RESPONSE DATA: ${jsonEncode(data)}');
      if (data['Login'] == 'Success') {
        _currentUser = UserModel.fromJson(data);
        await _storage.write(
            key: 'user', value: jsonEncode(_currentUser!.toJson()));
        notifyListeners();
        return;
      }
      throw Exception(data['Error'] ?? 'Invalid credentials');
    } else {
      String message = 'Login failed';
      if (resp.body.isNotEmpty) {
        final err = jsonDecode(resp.body) as Map<String, dynamic>;
        message = err['Error'] ?? message;
      }
      throw Exception(message);
    }
  }

  Future<bool> verifyOldPassword(String oldPassword) async {
    final email = _currentUser?.email;
    if (email == null) return false;
    try {
      await loginUser(email: email, password: oldPassword);
      return true;
    } catch (_) {
      // restore session
      await _storage.write(
          key: 'user', value: jsonEncode(_currentUser!.toJson()));
      return false;
    }
  }

  Future<void> logout() async {
    _currentUser = null;
    await _storage.delete(key: 'user');
    notifyListeners();
  }

  Future<void> updateProfile({
    String? firstName,
    String? lastName,
    String? email,
  }) async {
    if (_currentUser == null) throw Exception('Not logged in');
    final uri = Uri.parse('$_baseUrl/api/users/update/${_currentUser!.id}');
    final body = <String, dynamic>{};
    if (firstName != null) body['firstName'] = firstName;
    if (lastName != null) body['lastName'] = lastName;
    if (email != null) body['email'] = email;

    final resp = await http.patch(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );

    if (resp.statusCode == 200) {
      final data = resp.body.isNotEmpty
          ? jsonDecode(resp.body) as Map<String, dynamic>
          : {'user': _currentUser!.toJson()};
      _currentUser = UserModel.fromJson(data['user']);
    } else if (resp.statusCode == 204) {
      _currentUser = _currentUser!.copyWith(
        firstName: firstName,
        lastName: lastName,
        email: email,
      );
    } else {
      String msg = 'Profile update failed';
      if (resp.body.isNotEmpty) {
        final err = jsonDecode(resp.body) as Map<String, dynamic>;
        msg = err['Error'] ?? msg;
      }
      throw Exception(msg);
    }

    await _storage.write(
        key: 'user', value: jsonEncode(_currentUser!.toJson()));
    notifyListeners();
  }

  Future<void> changePassword(String newPassword) async {
    if (_currentUser == null) throw Exception('Not logged in');
    final uri = Uri.parse('$_baseUrl/api/users/update/${_currentUser!.id}');
    final resp = await http.patch(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'password': newPassword}),
    );
    if (resp.statusCode != 200 && resp.statusCode != 204) {
      String msg = 'Password change failed';
      if (resp.body.isNotEmpty) {
        final err = jsonDecode(resp.body) as Map<String, dynamic>;
        msg = err['Error'] ?? msg;
      }
      throw Exception(msg);
    }
  }

  Future<void> forgotPassword(String email) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/api/users/forgot-password'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'email': email,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['ForgotPassword'] == 'Success') {
          return; // Success
        } else {
          throw Exception(data['Error'] ?? 'Failed to send temporary password');
        }
      } else {
        final data = jsonDecode(response.body);
        throw Exception(data['Error'] ?? 'Failed to send temporary password');
      }
    } catch (e) {
      throw Exception('Network error: ${e.toString()}');
    }
  }

  Future<void> deleteAccount() async {
    if (_currentUser == null) throw Exception('Not logged in');

    final uri = Uri.parse('$_baseUrl/api/users/delete/${_currentUser!.id}');
    final resp = await http.delete(
      uri,
      headers: {'Content-Type': 'application/json'},
    );

    if (resp.statusCode == 200 || resp.statusCode == 204) {
      // Account deleted successfully, clear user data
      _currentUser = null;
      await _storage.delete(key: 'user');
      notifyListeners();
    } else {
      String msg = 'Account deletion failed';
      if (resp.body.isNotEmpty) {
        try {
          final err = jsonDecode(resp.body) as Map<String, dynamic>;
          msg = err['Error'] ?? msg;
        } catch (_) {
          // If response body is not JSON, use default message
        }
      }
      throw Exception(msg);
    }
  }
}
