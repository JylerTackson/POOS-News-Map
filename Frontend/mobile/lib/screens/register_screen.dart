import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class RegisterScreen extends StatefulWidget {
  final String title;
  const RegisterScreen({Key? key, required this.title}) : super(key: key);

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();

  final TextEditingController _firstNameController = TextEditingController();
  final TextEditingController _lastNameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  bool isLoading = false;
  String responseMessage = '';

  Future<void> registerUser() async {
    final url = '${dotenv.env['API_BASE_URL']}/api/users/route/register';
    final body = jsonEncode({
      "firstName": _firstNameController.text.trim(),
      "lastName": _lastNameController.text.trim(),
      "email": _emailController.text.trim(),
      "username": _usernameController.text.trim(),
      "password": _passwordController.text.trim(),
    });

    // Debug logging
    print('🔗 POST → $url');
    print('📦 PAYLOAD → $body');

    setState(() {
      isLoading = true;
      responseMessage = '';
    });

    try {
      final response = await http.post(
        Uri.parse(url),
        headers: {"Content-Type": "application/json"},
        body: body,
      );

      print('📥 STATUS → ${response.statusCode}');
      print('📄 BODY   → ${response.body}');

      if (response.statusCode == 201) {
        setState(() {
          responseMessage = "Registration successful!";
        });
        // Navigate to login after a short delay
        Future.delayed(const Duration(seconds: 1), () {
          Navigator.pushReplacementNamed(context, '/login');
        });
      } else {
        try {
          final data = jsonDecode(response.body);
          setState(() {
            responseMessage = data['message'] ?? 'Registration failed.';
          });
        } catch (_) {
          setState(() {
            responseMessage = 'Registration failed (invalid server response).';
          });
        }
      }
    } catch (e) {
      print('❌ ERROR → $e');
      setState(() {
        responseMessage = 'An error occurred: $e';
      });
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
        backgroundColor: Colors.greenAccent,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              const Text(
                'Register',
                style: TextStyle(
                  fontSize: 24,
                  color: Colors.greenAccent,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 20),

              _buildTextField(
                controller: _firstNameController,
                label: 'First Name',
                icon: Icons.person,
              ),
              const SizedBox(height: 15),

              _buildTextField(
                controller: _lastNameController,
                label: 'Last Name',
                icon: Icons.person,
              ),
              const SizedBox(height: 15),

              _buildTextField(
                controller: _emailController,
                label: 'Email',
                icon: Icons.email,
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 15),

              _buildTextField(
                controller: _usernameController,
                label: 'Username',
                icon: Icons.account_circle,
              ),
              const SizedBox(height: 15),

              _buildTextField(
                controller: _passwordController,
                label: 'Password',
                icon: Icons.lock,
                obscureText: true,
              ),
              const SizedBox(height: 25),

              ElevatedButton.icon(
                onPressed: isLoading ? null : registerUser,
                icon: isLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Icon(Icons.app_registration),
                label: Text(isLoading ? 'Registering...' : 'Register'),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size.fromHeight(50),
                  backgroundColor: Colors.greenAccent,
                  foregroundColor: Colors.white,
                ),
              ),

              TextButton(
                onPressed: () =>
                    Navigator.pushReplacementNamed(context, '/login'),
                child: const Text('Go to Login'),
              ),

              if (responseMessage.isNotEmpty) ...[
                const SizedBox(height: 20),
                Text(
                  responseMessage,
                  style: TextStyle(
                    color: responseMessage.contains('successful')
                        ? Colors.green
                        : Colors.red,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    bool obscureText = false,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return TextFormField(
      controller: controller,
      obscureText: obscureText,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon),
        border: const OutlineInputBorder(),
        focusedBorder: const OutlineInputBorder(
          borderSide: BorderSide(color: Colors.greenAccent, width: 2),
        ),
        floatingLabelStyle: const TextStyle(color: Colors.greenAccent),
      ),
    );
  }
}
