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
  bool _loading = false;
  String? _error;
  List<Article> _favorites = [];

  bool _hasFetched = false;

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

      // This is the corrected line
      if (resp.statusCode >= 200 && resp.statusCode < 300) {
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
    final bool? shouldRemove = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Remove from Favorites?'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              a.headline,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              a.source,
              style: const TextStyle(color: Colors.grey, fontSize: 12),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            // Style the button to indicate a destructive action
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Yes, Remove'),
          ),
        ],
      ),
    );
    if (shouldRemove == true) {
      _removeFavorite(a);
    }
  }

  Future<void> _removeFavorite(Article a) async {
    final auth = Provider.of<AuthService>(context, listen: false);
    final user = auth.currentUser;
    if (user?.id == null) return;

    // Don't set a global loading state here.
    // The UI will update optimistically below.

    try {
      final url = Uri.parse(
        '${dotenv.env['API_BASE_URL']}/api/users/${user!.id}/favorites',
      );
      final resp = await http.delete(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'headline': a.headline, 'source': a.source}),
      );

      if (resp.statusCode >= 200 && resp.statusCode < 300) {
        // Optimistically remove from the list and show a success message
        setState(() {
          _favorites.removeWhere(
              (x) => x.headline == a.headline && x.source == a.source);
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Removed from favorites.'),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        // Handle server error
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Error removing favorite: ${resp.statusCode}')),
        );
      }
    } catch (e) {
      // Handle client-side/network error
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
    // No finally block needed
  }

  @override
  Widget build(BuildContext context) {
    // Watch the auth service for changes
    return Consumer<AuthService>(
      builder: (context, auth, child) {
        final user = auth.currentUser;

        // If a user is logged in and we haven't fetched yet, fetch now.
        if (user != null && !_hasFetched) {
          // Use a post-frame callback to avoid calling setState during a build.
          WidgetsBinding.instance.addPostFrameCallback((_) {
            _fetchFavorites();
            setState(() {
              _hasFetched = true;
            });
          });
        }
        // If the user logs out, reset the state.
        else if (user == null && _hasFetched) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            setState(() {
              _favorites = [];
              _hasFetched = false;
              _error = null;
            });
          });
        }

        // --- UI Rendering ---

        if (user == null) {
          return Scaffold(
            appBar: AppBar(
                centerTitle: true,
                title: Text(widget.title, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold))),
            body: const Center(
              child: Text('Please login to view your favorite articles.'),
            ),
          );
        }

        return Scaffold(
          appBar: AppBar(
            centerTitle: true,
            title: Text(widget.title, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            backgroundColor: Colors.white,
            foregroundColor: Colors.black,
          ),
          body: _loading
              ? const Center(child: CircularProgressIndicator())
              : _error != null
                  ? Center(child: Text('Error: $_error', style: const TextStyle(color: Colors.red)))
                  : _favorites.isEmpty
                      ? const Center(child: Text("You haven't favorited any articles yet. Start exploring!"))
                      : GridView.builder(
                          // Your GridView and Card UI remains the same
                          padding: const EdgeInsets.all(12),
                          gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                            maxCrossAxisExtent: 500,
                            mainAxisExtent: 350,
                            crossAxisSpacing: 16,
                            mainAxisSpacing: 16,
                          ),
                          itemCount: _favorites.length,
                          itemBuilder: (ctx, i) {
                            final a = _favorites[i];
                            return Card(
                              elevation: 4,
                              clipBehavior: Clip.antiAlias,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              child: Padding(
                                padding: const EdgeInsets.all(16.0),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      a.headline,
                                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                      maxLines: 3,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      '${a.source} • ${a.country}',
                                      style: const TextStyle(color: Colors.grey, fontSize: 12),
                                    ),
                                    const SizedBox(height: 12),
                                    Expanded(
                                      child: Text(
                                        a.body,
                                        overflow: TextOverflow.ellipsis,
                                        maxLines: 4,
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(DateFormat.yMMMd().format(a.date), style: const TextStyle(fontSize: 12, color: Colors.grey)),
                                        IconButton(
                                          icon: const Icon(Icons.favorite, color: Colors.red),
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
      },
    );
  }
}
