import 'package:flutter/material.dart';
import '../services/auth_service.dart';

class LoginScreen extends StatelessWidget {
  final _auth = AuthService();

  @override
  Widget build(BuildContext c) {
    return Scaffold(
      appBar: AppBar(title: Text('Login')),
      body: Center(
        child: ElevatedButton.icon(
          icon: Image.asset('assets/google_logo.png', height: 24),
          label: Text('Sign in with Google'),
          onPressed: () async {
            final ok = await _auth.signInWithGoogle();
            if (ok)
              Navigator.pushReplacementNamed(c, '/home');
            else
              ScaffoldMessenger.of(c)
                  .showSnackBar(SnackBar(content: Text('Sign‑in failed')));
          },
        ),
      ),
    );
  }
}
