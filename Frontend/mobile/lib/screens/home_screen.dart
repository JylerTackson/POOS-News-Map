// lib/screens/home_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'daily_screen.dart';
import 'favorites_screen.dart';
import 'account_screen.dart';
import 'login_screen.dart';

import '../services/auth_service.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

class HomeScreen extends StatefulWidget {
  final String title;
  const HomeScreen({super.key, required this.title});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    // Watch the AuthService to know if someone is logged in
    final user = context.watch<AuthService>().currentUser;

    // Build your pages array dynamically:
    final pages = <Widget>[
      const MapPage(),
      const DailyScreen(title: 'Daily News'),
      const FavoritesScreen(),
      // If not logged in, show LoginPage; else show AccountScreen
      if (user == null)
        const LoginPage(title: 'Please Log In')
      else
        const AccountScreen(),
    ];

    final current = pages[selectedIndex];

    return LayoutBuilder(builder: (ctx, caps) {
      if (caps.maxWidth < 600) {
        // Bottom navigation
        return Scaffold(
          body: current,
          bottomNavigationBar: BottomNavigationBar(
            selectedItemColor: const Color.fromARGB(255, 20, 95, 156),
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

      // Navigation rail for wide screens
      return Scaffold(
        body: Row(
          children: [
            SafeArea(
              child: NavigationRail(
                indicatorColor: const Color.fromARGB(255, 203, 247, 255),
                selectedIconTheme: const IconThemeData(
                    color: Color.fromARGB(255, 20, 95, 156)),
                selectedLabelTextStyle:
                    const TextStyle(color: Color.fromARGB(255, 20, 95, 156)),
                unselectedIconTheme: const IconThemeData(
                    color: Color.fromARGB(255, 105, 105, 105)),
                unselectedLabelTextStyle:
                    const TextStyle(color: Color.fromARGB(255, 105, 105, 105)),
                selectedIndex: selectedIndex,
                onDestinationSelected: (i) => setState(() => selectedIndex = i),
                labelType: NavigationRailLabelType.all,
                destinations: const [
                  NavigationRailDestination(
                      icon: Icon(Icons.home), label: Text('Map')),
                  NavigationRailDestination(
                      icon: Icon(Icons.access_time), label: Text('Daily')),
                  NavigationRailDestination(
                      icon: Icon(Icons.favorite), label: Text('Favorites')),
                  NavigationRailDestination(
                      icon: Icon(Icons.person), label: Text('Account')),
                ],
              ),
            ),
            const VerticalDivider(width: 1),
            Expanded(child: current),
          ],
        ),
      );
    });
  }
}

/// Your existing MapPage — no changes needed
class MapPage extends StatefulWidget {
  const MapPage({super.key});
  @override
  State<MapPage> createState() => _MapPageState();
}

class _MapPageState extends State<MapPage> {
  LatLng? _marker;
  void _onTap(_, LatLng pos) => setState(() => _marker = pos);

  @override
  Widget build(BuildContext context) {
    return FlutterMap(
      options: MapOptions(
        initialCenter: LatLng(28.60257, -81.20009),
        initialZoom: 13,
        onTap: _onTap,
      ),
      children: [
        TileLayer(
          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          userAgentPackageName: 'com.example.mobile',
        ),
        if (_marker != null)
          MarkerLayer(
            markers: [
              Marker(
                point: _marker!,
                width: 40,
                height: 40,
                child: Icon(Icons.location_pin, size: 40, color: Colors.blue),
              ),
            ],
          ),
      ],
    );
  }
}
