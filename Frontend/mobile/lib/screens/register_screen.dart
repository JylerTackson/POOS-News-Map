import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class RegisterScreen extends StatefulWidget {
  final String title;
  const RegisterScreen({super.key, required this.title});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _firstNameCtrl = TextEditingController();
  final _lastNameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  bool isLoading = false;
  String message = '';

  Future<void> _register() async {
    final url = '${dotenv.env['API_BASE_URL']}/api/users/register';
    final body = jsonEncode({
      'firstName': _firstNameCtrl.text.trim(),
      'lastName': _lastNameCtrl.text.trim(),
      'email': _emailCtrl.text.trim(),
      'password': _passCtrl.text,
    });

    setState(() {
      isLoading = true;
      message = '';
    });
    try {
      final resp = await http.post(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json'},
        body: body,
      );
      if (resp.statusCode == 201) {
        setState(() => message = 'Registration successful!');
        Future.delayed(const Duration(seconds: 1), () {
          Navigator.pushReplacementNamed(context, '/login');
        });
      } else {
        final data = jsonDecode(resp.body);
        setState(() => message = data['Error'] ?? 'Registration failed.');
      }
    } catch (e) {
      setState(() => message = 'Error: $e');
    } finally {
      setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
          title: Text(widget.title), backgroundColor: Colors.greenAccent),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const Text('Register',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            _buildField(_firstNameCtrl, 'First Name', Icons.person),
            const SizedBox(height: 15),
            _buildField(_lastNameCtrl, 'Last Name', Icons.person),
            const SizedBox(height: 15),
            _buildField(_emailCtrl, 'Email', Icons.email,
                keyboardType: TextInputType.emailAddress),
            const SizedBox(height: 15),
            _buildField(_passCtrl, 'Password', Icons.lock, obscureText: true),
            const SizedBox(height: 25),
            ElevatedButton.icon(
              onPressed: isLoading ? null : _register,
              icon: isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2))
                  : const Icon(Icons.app_registration),
              label: Text(isLoading ? 'Registering…' : 'Register'),
              style: ElevatedButton.styleFrom(
                minimumSize: const Size.fromHeight(50),
                backgroundColor: Colors.greenAccent,
              ),
            ),
            TextButton(
              onPressed: () =>
                  Navigator.pushReplacementNamed(context, '/login'),
              child: const Text('Go to Login'),
            ),
            if (message.isNotEmpty) ...[
              const SizedBox(height: 20),
              Text(
                message,
                style: TextStyle(
                    color: message.contains('successful')
                        ? Colors.green
                        : Colors.red,
                    fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildField(
    TextEditingController ctrl,
    String label,
    IconData icon, {
    bool obscureText = false,
    TextInputType keyboardType = TextInputType.text,
  }) =>
      TextField(
        controller: ctrl,
        obscureText: obscureText,
        keyboardType: keyboardType,
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: Icon(icon),
          border: const OutlineInputBorder(),
          focusedBorder: const OutlineInputBorder(
            borderSide: BorderSide(color: Colors.greenAccent, width: 2),
          ),
        ),
      );
}
