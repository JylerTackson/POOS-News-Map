// lib/main.dart
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:news_map_mobile/screens/register_screen.dart';

import 'firebase_options.dart';
import 'screens/home_screen.dart';
import 'screens/account_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: '.env');
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'News Map Today',
      theme: ThemeData(primarySwatch: Colors.green),
      // Start here:
      home: const HomeScreen(title: 'News Map Today'),
      routes: {
        // Only keep the screens you need as named routes:
        '/account': (_) => const AccountPage(),
        '/register': (_) => const RegisterPage(title: 'Register'),
        // If you still need a full‐screen login/register you can keep them,
        // but they will no longer be your entry point.
      },
      debugShowCheckedModeBanner: false,
    );
  }
}
