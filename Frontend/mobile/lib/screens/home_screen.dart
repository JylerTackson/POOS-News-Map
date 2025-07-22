// lib/screens/home_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

import 'daily_screen.dart';
import 'favorites_screen.dart';
import 'account_screen.dart';

class HomeScreen extends StatefulWidget {
  final String title;
  const HomeScreen({super.key, required this.title});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int selectedIndex = 0;

  final pages = const <Widget>[
    MapPage(),
    DailyScreen(title: 'Daily News'),
    FavoritesScreen(),
    AccountPage(),
  ];

  @override
  Widget build(BuildContext context) {
    final current = pages[selectedIndex];

    return LayoutBuilder(builder: (ctx, caps) {
      // Narrow: bottom nav
      if (caps.maxWidth < 600) {
        return Scaffold(
          body: current,
          bottomNavigationBar: BottomNavigationBar(
            selectedItemColor: Color.fromARGB(255, 20, 95, 156),
            type: BottomNavigationBarType.fixed,
              currentIndex: selectedIndex,
              onTap: (i) => setState(() => selectedIndex = i),
              items: const [
                BottomNavigationBarItem(
                  icon: Icon(Icons.home),
                  label: 'Home'
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.access_time),
                  label: 'Daily'
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.favorite),
                  label: 'Favorites',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.person),
                  label: 'Account',
                ),
              ],
            ),
        );
      }

      // Wide: rail
      return Scaffold(
        body: Row(
          children: [
            SafeArea(
              child: NavigationRail(
                indicatorColor: const Color.fromARGB(255, 203, 247, 255),

                selectedIconTheme: const IconThemeData(color: Color.fromARGB(255, 20, 95, 156)),
                selectedLabelTextStyle: const TextStyle(color: Color.fromARGB(255, 20, 95, 156)),
                unselectedIconTheme: const IconThemeData(color: Color.fromARGB(255, 105, 105, 105)),
                unselectedLabelTextStyle: const TextStyle(color: Color.fromARGB(255, 105, 105, 105)),

                selectedIndex: selectedIndex,

                onDestinationSelected: (i) => setState(() => selectedIndex = i),
                labelType: NavigationRailLabelType.all,
                destinations: const [
                  NavigationRailDestination(
                      icon: Icon(Icons.home),
                      label: Text('Map')),
                  NavigationRailDestination(
                      icon: Icon(Icons.access_time), 
                      label: Text('Daily')),
                  NavigationRailDestination(
                      icon: Icon(Icons.favorite), 
                      label: Text('Favorites')),
                  NavigationRailDestination(
                      icon: Icon(Icons.person), 
                      label: Text('Account')),
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
