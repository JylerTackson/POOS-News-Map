import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_analytics/observer.dart';

import 'firebase_options.dart';
import 'screens/home_screen.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/account_screen.dart';

late final FirebaseAnalytics analytics;
late final FirebaseAnalyticsObserver observer;

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: '.env');

  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

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
      initialRoute: '/home',
      routes: {
        '/home': (_) => const HomeScreen(title: 'News Map Today'),
        '/login': (_) => const LoginPage(title: 'Login'),
        '/register': (_) => const RegisterScreen(title: 'Register'),
        '/account': (_) => const AccountPage(),
      },
      navigatorObservers: [observer],
    );
  }
}
