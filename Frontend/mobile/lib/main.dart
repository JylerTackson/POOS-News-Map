// lib/main.dart
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_analytics/observer.dart'; // for navigator observer
import 'package:firebase_auth/firebase_auth.dart';

import 'screens/home_screen.dart';
import 'firebase_options.dart';

late final FirebaseAnalytics analytics;
late final FirebaseAnalyticsObserver observer;

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: '.env');

  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  // initialize analytics and the observer
  analytics = FirebaseAnalytics.instance;
  observer = FirebaseAnalyticsObserver(analytics: analytics);

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'News Map Today',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: const HomeScreen(title: 'News Map Today'),
      navigatorObservers: [observer], // attach the analytics observer
    );
  }
}
