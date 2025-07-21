import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';

class AccountPage extends StatefulWidget {
  const AccountPage({super.key});
  @override
  State<AccountPage> createState() => _AccountPageState();
}

class _AccountPageState extends State<AccountPage> {
  late final FirebaseAuth _auth;
  User? _user;
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _loading = false;
  String? _message;

  @override
  void initState() {
    super.initState();
    _auth = FirebaseAuth.instance;
    _auth.authStateChanges().listen((u) {
      setState(() {
        _user = u;
        if (u != null) _emailCtrl.text = u.email ?? '';
      });
    });
  }

  Future<void> _changeEmail() async {
    final newEmail = _emailCtrl.text.trim();
    if (newEmail.isEmpty) return;
    setState(() {
      _loading = true;
      _message = null;
    });
    try {
      await _user!.updateEmail(newEmail);
      await _user!.reload();
      _user = _auth.currentUser;
      _message = 'Email updated';
    } on FirebaseAuthException catch (e) {
      _message = e.message;
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _changePassword() async {
    final newPass = _passwordCtrl.text;
    if (newPass.length < 6) {
      setState(() => _message = 'Password must be ≥6 chars');
      return;
    }
    setState(() {
      _loading = true;
      _message = null;
    });
    try {
      await _user!.updatePassword(newPass);
      _message = 'Password updated';
      _passwordCtrl.clear();
    } on FirebaseAuthException catch (e) {
      _message = e.message;
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _signOut() => _auth.signOut();

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_user == null) {
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

    final theme = Theme.of(context).textTheme;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('Signed in as:', style: theme.titleMedium),
          const SizedBox(height: 4),
          Text(_user!.email ?? '',
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
            onPressed: _loading ? null : _changeEmail,
            child: _loading
                ? const CircularProgressIndicator()
                : const Text('Change Email'),
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
            onPressed: _loading ? null : _changePassword,
            child: _loading
                ? const CircularProgressIndicator()
                : const Text('Change Password'),
          ),
          if (_message != null) ...[
            const SizedBox(height: 16),
            Text(_message!, style: const TextStyle(color: Colors.red)),
          ],
          const SizedBox(height: 32),
          OutlinedButton.icon(
            onPressed: _signOut,
            icon: const Icon(Icons.logout),
            label: const Text('Sign Out'),
          ),
        ],
      ),
    );
  }
}
