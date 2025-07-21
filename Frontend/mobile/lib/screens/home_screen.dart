// lib/screens/home_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

import 'daily_screen.dart';

class HomeScreen extends StatefulWidget {
  final String title;
  const HomeScreen({super.key, required this.title});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int selectedIndex = 0;

  // Login dialog state
  bool _loginShown = false;
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  bool _loggingIn = false;
  String _loginError = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _showLoginDialog();
    });
  }

  Future<void> _showLoginDialog() async {
    if (_loginShown) return;
    _loginShown = true;

    await showDialog(
      context: context,
      barrierDismissible: true,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          title: const Text('Please Log In'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: _emailCtrl,
                decoration: const InputDecoration(
                  labelText: 'Email',
                  prefixIcon: Icon(Icons.email),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _passCtrl,
                decoration: const InputDecoration(
                  labelText: 'Password',
                  prefixIcon: Icon(Icons.lock),
                ),
                obscureText: true,
              ),
              if (_loginError.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(_loginError, style: const TextStyle(color: Colors.red)),
              ],
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Close'),
            ),
            ElevatedButton(
              onPressed: _loggingIn
                  ? null
                  : () async {
                      setState(() {
                        _loggingIn = true;
                        _loginError = '';
                      });
                      final baseUrl = dotenv.env['API_BASE_URL']!;
                      final uri = Uri.parse('$baseUrl/api/users/login');
                      try {
                        final resp = await http.post(
                          uri,
                          headers: {'Content-Type': 'application/json'},
                          body: jsonEncode({
                            'email': _emailCtrl.text.trim(),
                            'password': _passCtrl.text.trim(),
                          }),
                        );
                        if (resp.statusCode == 200) {
                          Navigator.of(context).pop();
                        } else {
                          setState(() {
                            _loginError = jsonDecode(resp.body)['message'] ??
                                'Login failed';
                          });
                        }
                      } catch (e) {
                        setState(() {
                          _loginError = 'Error: $e';
                        });
                      } finally {
                        setState(() {
                          _loggingIn = false;
                        });
                      }
                    },
              child: _loggingIn
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text('Log In'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final pages = <Widget>[
      const MapPage(),
      const DailyScreen(title: 'Daily'),
      const Center(child: Text('Favorites')),
      const Center(child: Text('Account')),
    ];
    final current = pages[selectedIndex];

    return LayoutBuilder(builder: (context, constraints) {
      if (constraints.maxWidth < 600) {
        return Scaffold(
          body: current,
          bottomNavigationBar: BottomNavigationBar(
            type: BottomNavigationBarType.fixed,
            currentIndex: selectedIndex,
            onTap: (i) => setState(() => selectedIndex = i),
            items: const [
              BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
              BottomNavigationBarItem(
                  icon: Icon(Icons.access_time), label: 'Daily'),
              BottomNavigationBarItem(
                  icon: Icon(Icons.favorite), label: 'Favorites'),
              BottomNavigationBarItem(
                  icon: Icon(Icons.person), label: 'Account'),
            ],
          ),
        );
      }
      return Scaffold(
        body: Row(
          children: [
            SafeArea(
              child: NavigationRail(
                selectedIndex: selectedIndex,
                onDestinationSelected: (i) => setState(() => selectedIndex = i),
                labelType: NavigationRailLabelType.all,
                leading: IconButton(
                  icon: const Icon(Icons.menu),
                  onPressed: _showLoginDialog,
                ),
                destinations: const [
                  NavigationRailDestination(
                      icon: Icon(Icons.home), label: Text('Home')),
                  NavigationRailDestination(
                      icon: Icon(Icons.access_time), label: Text('Daily')),
                  NavigationRailDestination(
                      icon: Icon(Icons.favorite), label: Text('Favorites')),
                  NavigationRailDestination(
                      icon: Icon(Icons.person), label: Text('Account')),
                ],
              ),
            ),
            Expanded(child: current),
          ],
        ),
      );
    });
  }

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }
}

class MapPage extends StatefulWidget {
  const MapPage({Key? key}) : super(key: key);

  @override
  State<MapPage> createState() => _MapPageState();
}

class _MapPageState extends State<MapPage> {
  LatLng? _marker;

  void _onTap(TapPosition tap, LatLng latlng) {
    setState(() => _marker = latlng);
  }

  @override
  Widget build(BuildContext context) {
    return FlutterMap(
      options: MapOptions(
        initialCenter: LatLng(28.60257, -81.20009),
        initialZoom: 13,
        maxZoom: 18,
        onTap: _onTap,
      ),
      children: [
        TileLayer(
          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          userAgentPackageName: 'com.example.mobile',
        ),
        MarkerLayer(
          markers: _marker == null
              ? []
              : [
                  Marker(
                    point: _marker!,
                    width: 40,
                    height: 40,
                    child: const Icon(
                      Icons.location_pin,
                      size: 40,
                      color: Colors.blue,
                    ),
                  ),
                ],
        ),
      ],
    );
  }
}
