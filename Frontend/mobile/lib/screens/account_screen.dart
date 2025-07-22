// lib/screens/account_screen.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:geocoding/geocoding.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:latlong2/latlong.dart';
import 'package:url_launcher/url_launcher.dart';

import 'article.dart';


class AccountScreen extends StatefulWidget {
  const AccountScreen({Key? key}) : super(key: key);
  @override
  State<AccountScreen> createState() => _AccountScreenState();
}

class _AccountScreenState extends State<AccountScreen> {
  // Profile controllers
  final _firstCtrl = TextEditingController();
  final _lastCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();

  // Password controllers
  final _oldCtrl = TextEditingController();
  final _newCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();

  bool _profileLoading = false;
  bool _passwordLoading = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final user = context.read<AuthService>().currentUser;
    if (user != null) {
      _firstCtrl.text = user.firstName;
      _lastCtrl.text = user.lastName;
      _emailCtrl.text = user.email;
    }
  }

  @override
  void dispose() {
    for (var c in [
      _firstCtrl,
      _lastCtrl,
      _emailCtrl,
      _oldCtrl,
      _newCtrl,
      _confirmCtrl,
    ]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _saveProfile() async {
    if (_profileLoading) return;
    final emailText = _emailCtrl.text.trim();
    // Basic email validation
    final emailRegex = RegExp(r'^[^@]+@[^@]+\.[^@]+$');
    if (!emailRegex.hasMatch(emailText)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid email address')),
      );
      return;
    }

    setState(() => _profileLoading = true);

    try {
      await context.read<AuthService>().updateProfile(
            firstName: _firstCtrl.text.trim(),
            lastName: _lastCtrl.text.trim(),
            email: emailText,
          );

      final user = context.read<AuthService>().currentUser!;
      _firstCtrl.text = user.firstName;
      _lastCtrl.text = user.lastName;
      _emailCtrl.text = user.email;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Profile updated successfully!')),
      );
    } catch (e) {
      final msg = e.toString().replaceFirst('Exception: ', '');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $msg')),
      );
    } finally {
      if (mounted) setState(() => _profileLoading = false);
    }
  }

  Future<void> _changePassword() async {
    if (_passwordLoading) return;
    final oldPass = _oldCtrl.text.trim();
    final newPass = _newCtrl.text;
    final confirm = _confirmCtrl.text;

    if (oldPass.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter current password')),
      );
      return;
    }

    final ok = await context.read<AuthService>().verifyOldPassword(oldPass);
    if (!ok) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Current password is incorrect')),
      );
      return;
    }

    // New must differ from old
    if (newPass == oldPass) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('New password must be different from current')),
      );
      return;
    }

    if (newPass.length < 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('New password must be ≥6 characters')),
      );
      return;
    }
    if (newPass != confirm) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('New passwords do not match')),
      );
      return;
    }

    setState(() => _passwordLoading = true);
    try {
      await context.read<AuthService>().changePassword(newPass);
      _oldCtrl.clear();
      _newCtrl.clear();
      _confirmCtrl.clear();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Password changed successfully!')),
      );
    } catch (e) {
      final msg = e.toString().replaceFirst('Exception: ', '');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $msg')),
      );
    } finally {
      if (mounted) setState(() => _passwordLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthService>().currentUser;

    return Scaffold(
      body: user == null
          ? const Center(child: Text('Please log in'))
          : AbsorbPointer(
              absorbing: _profileLoading || _passwordLoading,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text('Edit Profile',
                        style: TextStyle(
                            fontSize: 22, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _firstCtrl,
                      decoration: const InputDecoration(
                          labelText: 'First Name',
                          border: OutlineInputBorder()),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _lastCtrl,
                      decoration: const InputDecoration(
                          labelText: 'Last Name', border: OutlineInputBorder()),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _emailCtrl,
                      decoration: const InputDecoration(
                          labelText: 'Email', border: OutlineInputBorder()),
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: _profileLoading ? null : _saveProfile,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color.fromARGB(255, 16, 24, 40),
                        foregroundColor: Colors.white,
                        minimumSize: const Size.fromHeight(48),
                      ),
                      child: _profileLoading
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text('Save Profile'),
                    ),
                    const Divider(height: 40),
                    const Text('Change Password',
                        style: TextStyle(
                            fontSize: 22, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _oldCtrl,
                      decoration: const InputDecoration(
                          labelText: 'Current Password',
                          border: OutlineInputBorder()),
                      obscureText: true,
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _newCtrl,
                      decoration: const InputDecoration(
                          labelText: 'New Password',
                          border: OutlineInputBorder()),
                      obscureText: true,
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _confirmCtrl,
                      decoration: const InputDecoration(
                          labelText: 'Confirm New Password',
                          border: OutlineInputBorder()),
                      obscureText: true,
                    ),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: _passwordLoading ? null : _changePassword,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color.fromARGB(255, 16, 24, 40),
                        foregroundColor: Colors.white,
                        minimumSize: const Size.fromHeight(48),
                      ),
                      child: _passwordLoading
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text('Change Password'),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
