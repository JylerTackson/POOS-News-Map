// lib/screens/login_screen.dart
import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import 'home_screen.dart';

class LoginPage extends StatefulWidget {
  final String title;
  const LoginPage({super.key, required this.title});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _loading = false;

  Future<void> _login() async {
    setState(() => _loading = true);

    final success = await AuthService().loginUser(
      email: _emailCtrl.text.trim(),
      password: _passwordCtrl.text,
    );

    // After an async gap, always check if the widget is still mounted.
    if (!mounted) return;

    if (success) {
      // On success, navigate immediately. No need to call setState or show a SnackBar
      // because this widget is about to be disposed.
      Navigator.pushReplacementNamed(context, '/home');
    } else {
      // On failure, stop the loading indicator and show an error message.
      setState(() => _loading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Login failed')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
          title: Text(widget.title), backgroundColor: Colors.greenAccent),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          const Text('Login',
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
          const SizedBox(height: 24),
          TextField(
            controller: _emailCtrl,
            decoration: const InputDecoration(
                labelText: 'Email', prefixIcon: Icon(Icons.email)),
            keyboardType: TextInputType.emailAddress,
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _passwordCtrl,
            decoration: const InputDecoration(
                labelText: 'Password', prefixIcon: Icon(Icons.lock)),
            obscureText: true,
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _loading ? null : _login,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.greenAccent,
                minimumSize: const Size.fromHeight(48),
              ),
              child: _loading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('Login'),
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
          ),
          const SizedBox(height: 12),
          TextButton(
            onPressed: () =>
                Navigator.pushReplacementNamed(context, '/register'),
            child: const Text('Don’t have an account? Register'),
          ),
        ]),
      ),
    );
  }
}
