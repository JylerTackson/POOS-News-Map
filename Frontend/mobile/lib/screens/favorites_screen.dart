// lib/screens/favorites_screen.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:intl/intl.dart';

import '../services/auth_service.dart';
import 'article.dart';

class FavoritesScreen extends StatefulWidget {
  final String title;
  const FavoritesScreen({Key? key, required this.title}) : super(key: key);

  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  bool _loading = true;
  String? _error;
  List<Article> _favorites = [];

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _fetchFavorites();
  }

  Future<void> _fetchFavorites() async {
    final auth = Provider.of<AuthService>(context, listen: false);
    final user = auth.currentUser;
    if (user?.email == null) {
      setState(() => _loading = false);
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final url = Uri.parse(
        '${dotenv.env['API_BASE_URL']}/api/users/${user!.email}',
      );
      final resp = await http.get(url);

      if (resp.statusCode == 200) {
        final data = jsonDecode(resp.body) as Map<String, dynamic>;
        final List saved = data['savedArticles'] ?? [];
        setState(() {
          _favorites = saved.map((e) => Article.fromJson(e)).toList();
        });
      } else {
        setState(() => _error = 'Server error: ${resp.statusCode}');
      }
    } catch (e) {
      setState(() => _error = 'Fetch error: $e');
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _confirmRemove(Article a) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Remove from Favorites?'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(a.headline, maxLines: 2, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 8),
            Text(a.source, style: const TextStyle(color: Colors.grey)),
          ],
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel')),
          TextButton(
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Yes, Remove')),
        ],
      ),
    );
    if (ok == true) _removeFavorite(a);
  }

  Future<void> _removeFavorite(Article a) async {
    final auth = Provider.of<AuthService>(context, listen: false);
    final user = auth.currentUser;
    if (user?.id == null) return;

    setState(() => _loading = true);

    try {
      final url = Uri.parse(
        '${dotenv.env['API_BASE_URL']}/api/users/${user!.id}/favorites',
      );
      final resp = await http.delete(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'headline': a.headline,
          'source': a.source,
        }),
      );
      if (resp.statusCode == 200) {
        setState(() {
          _favorites.removeWhere(
              (x) => x.headline == a.headline && x.source == a.source);
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error removing: ${resp.statusCode}')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthService>(context);
    final user = auth.currentUser;

    if (user == null) {
      return Scaffold(
        appBar: AppBar(
          centerTitle: true,
          title: Text(
            widget.title,
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
          ),
        ),
        body: const Center(
          child: Text('Please login to view your favorite articles.'),
        ),
      );
    }

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
                      style: const TextStyle(color: Colors.red)),
                )
              : _favorites.isEmpty
                  ? const Center(
                      child: Text(
                          "You haven't favorited any articles yet. Start exploring!"),
                    )
                  : GridView.builder(
                      padding: const EdgeInsets.all(12),
                      gridDelegate:
                          const SliverGridDelegateWithMaxCrossAxisExtent(
                        maxCrossAxisExtent: 500,
                        mainAxisExtent: 350,
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                      ),
                      itemCount: _favorites.length,
                      itemBuilder: (ctx, i) {
                        final a = _favorites[i];
                        return Card(
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
                                    style: const TextStyle(color: Colors.grey)),
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
                                        Icons.favorite,
                                        color: Colors.red,
                                      ),
                                      onPressed: () => _confirmRemove(a),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
    );
  }
}
