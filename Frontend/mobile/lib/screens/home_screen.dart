import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

class HomeScreen extends StatefulWidget 
{
  final String title;
  const HomeScreen({Key? key, required this.title}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  var selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    // A list of the pages to display
    final List<Widget> pages = <Widget>[
      MapPage(), // Represents your Home page
      Placeholder(), // Represents your Daily page
      Placeholder(), // Represents your Account page
    ];

    Widget page = pages[selectedIndex];

    return LayoutBuilder(builder: (context, constraints) {
      // Use BottomNavigationBar for narrow screens
      if (constraints.maxWidth < 600) {
        return Scaffold(
          body: page, // The selected page is the body
          bottomNavigationBar: BottomNavigationBar(
            items: const <BottomNavigationBarItem>[
              BottomNavigationBarItem(
                icon: Icon(Icons.home),
                label: 'Home',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.access_time),
                label: 'Daily',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.person),
                label: 'Account',
              ),
            ],
            currentIndex: selectedIndex,
            onTap: (value) {
              setState(() {
                selectedIndex = value;
              });
            },
          ),
        );
      }
      // Use NavigationRail for wider screens
      else {
        return Scaffold(
          body: Row(
            children: [
              SafeArea(
                child: NavigationRail(
                  extended: constraints.maxWidth >= 600,
                  destinations: [
                    NavigationRailDestination(
                      icon: Icon(Icons.home),
                      label: Text('Home'),
                    ),
                    NavigationRailDestination(
                      icon: Icon(Icons.access_time),
                      label: Text('Daily'),
                    ),
                    NavigationRailDestination(
                      icon: Icon(Icons.person),
                      label: Text('Account'),
                    ),
                  ],
                  selectedIndex: selectedIndex,
                  onDestinationSelected: (value) {
                    setState(() {
                      selectedIndex = value;
                    });
                  },
                ),
              ),
              Expanded(
                child: Container(
                  color: Theme.of(context).colorScheme.primaryContainer,
                  child: page, 
                ),
              ),
            ],
          ),
        );
      }
    });
  }
}

// Convert the widget to a StatefulWidget to manage state.
class MapPage extends StatefulWidget {
  const MapPage({super.key});

  @override
  State<MapPage> createState() => _MapPageState();
}

class _MapPageState extends State<MapPage> {
  // A nullable LatLng variable to store the marker's position.
  LatLng? _markerPosition;

  // This function is called when the user taps on the map.
  void _handleTap(dynamic tapPosition, LatLng point) {
    // Use setState to update the UI with the new marker position.
    setState(() {
      _markerPosition = point;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Newsmap'),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
      body: FlutterMap(
        options: MapOptions(
          center: LatLng(28.60257, -81.20009), // UCF Coordinates
          zoom: 13.0,
          maxZoom: 18.0,
          // The onTap callback receives the tap position and the LatLng coordinates.
          onTap: _handleTap,
        ),
        children: [
          // The TileLayer is the background map image. It should be first.
          TileLayer(
            urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            userAgentPackageName: 'com.example.app', // Replace with your app's package name
          ),
          // The MarkerLayer is drawn on top of the TileLayer.
          MarkerLayer(
            // The markers list is rebuilt every time setState is called.
            markers: [
              // Conditionally add a Marker to the list if _markerPosition is not null.
              if (_markerPosition != null)
                Marker(
                  // The point property is required and sets the marker's location.
                  point: _markerPosition!,
                  width: 40,
                  height: 40,
                  // The builder creates the marker's UI.
                  builder: (context) => const Icon(
                    Icons.location_pin,
                    color: Colors.blue,
                    size: 40.0,
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}