import 'dart:async'; // Import for StreamSubscription
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';

class AccountPage extends StatefulWidget {
  const AccountPage({super.key});
  @override
  State<AccountPage> createState() => _AccountPageState();
}

class _AccountPageState extends State<AccountPage> {
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _loading = false;
  String? _message;

  // You can keep the functions, but they will receive the user object as a parameter
  Future<void> _changeEmail(User user) async {
    final newEmail = _emailCtrl.text.trim();
    if (newEmail.isEmpty) return;
    setState(() {
      _loading = true;
      _message = null;
    });
    try {
      await user.updateEmail(newEmail);
      await user.reload(); // Reload user data
      _message = 'Email updated successfully!';
    } on FirebaseAuthException catch (e) {
      // Handle errors like 'requires-recent-login'
      _message = e.message;
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _changePassword(User user) async {
    final newPass = _passwordCtrl.text;
    if (newPass.length < 6) {
      setState(() => _message = 'Password must be at least 6 characters');
      return;
    }
    setState(() {
      _loading = true;
      _message = null;
    });
    try {
      await user.updatePassword(newPass);
      _message = 'Password updated successfully!';
      _passwordCtrl.clear();
    } on FirebaseAuthException catch (e) {
      _message = e.message;
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _signOut() => FirebaseAuth.instance.signOut();

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // 💡 Use StreamBuilder to listen to auth state changes
    return StreamBuilder<User?>(
      stream: FirebaseAuth.instance.authStateChanges(),
      builder: (context, snapshot) {
        // 1. Handle loading state
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        final user = snapshot.data;

        // 2. Handle signed-in state
        if (user != null) {
          // Set initial email value if controller is empty
          if (_emailCtrl.text.isEmpty) {
            _emailCtrl.text = user.email ?? '';
          }
          return _buildAccountInfo(context, user);
        }

        // 3. Handle signed-out state
        return _buildSignInPrompt(context);
      },
    );
  }

  // Helper widget for the Sign In prompt
  Widget _buildSignInPrompt(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Not signed in', style: TextStyle(fontSize: 18)),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => Navigator.pushNamed(context, '/login'),
              child: const Text('Login'),
            ),
            const SizedBox(height: 8),
            OutlinedButton(
              onPressed: () => Navigator.pushNamed(context, '/register'),
              child: const Text('Register'),
            ),
          ],
        ),
      ),
    );
  }

  // Helper widget for the main account info UI
  Widget _buildAccountInfo(BuildContext context, User user) {
    final theme = Theme.of(context).textTheme;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('Signed in as:', style: theme.titleMedium),
          const SizedBox(height: 4),
          Text(user.email ?? '',
              style:
                  const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 24),
          TextField(
            controller: _emailCtrl,
            decoration: const InputDecoration(
              labelText: 'New Email',
              prefixIcon: Icon(Icons.email),
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          ElevatedButton(
            onPressed: _loading ? null : () => _changeEmail(user),
            child: const Text('Change Email'),
          ),
          const SizedBox(height: 24),
          TextField(
            controller: _passwordCtrl,
            decoration: const InputDecoration(
              labelText: 'New Password',
              prefixIcon: Icon(Icons.lock),
              border: OutlineInputBorder(),
            ),
            obscureText: true,
          ),
          const SizedBox(height: 12),
          ElevatedButton(
            onPressed: _loading ? null : () => _changePassword(user),
            child: const Text('Change Password'),
          ),
          if (_message != null) ...[
            const SizedBox(height: 16),
            Text(_message!,
                style: TextStyle(
                    color: _message!.contains('successfully')
                        ? Colors.green
                        : Colors.red)),
          ],
          const SizedBox(height: 32),
          // Show loading indicator on the sign out button too
          _loading
              ? const Center(child: CircularProgressIndicator())
              : OutlinedButton.icon(
                  onPressed: _signOut,
                  icon: const Icon(Icons.logout),
                  label: const Text('Sign Out'),
                ),
        ],
      ),
    );
  }
}