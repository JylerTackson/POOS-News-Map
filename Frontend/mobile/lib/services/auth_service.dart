import 'dart:convert';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final String _base = dotenv.env['API_BASE_URL'] ?? '';

  /// Register via your own backend
  Future<bool> registerUser({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
  }) async {
    final resp = await http.post(
      Uri.parse('$_base/api/users/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'firstName': firstName,
        'lastName': lastName,
        'email': email,
        'password': password,
      }),
    );
    return resp.statusCode == 201;
  }

  /// Login via your own backend
  Future<bool> loginUser({
    required String email,
    required String password,
  }) async {
    final resp = await http.post(
      Uri.parse('$_base/api/users/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );
    return resp.statusCode == 201;
  }

  /// (Optional) Send SMS code via Firebase
  Future<void> sendPhoneCode({
    required String phoneNumber,
    required void Function(PhoneAuthCredential) onAutoVerified,
    required void Function(FirebaseAuthException) onFailed,
    required void Function() onCodeSent,
  }) async {
    await _auth.verifyPhoneNumber(
      phoneNumber: phoneNumber,
      timeout: const Duration(seconds: 60),
      verificationCompleted: onAutoVerified,
      verificationFailed: onFailed,
      codeSent: (verId, _) {
        _verificationId = verId;
        onCodeSent();
      },
      codeAutoRetrievalTimeout: (_) {},
    );
  }

  String? _verificationId;

  /// (Optional) Verify the SMS code the user typed
  Future<bool> verifyPhoneCode(String smsCode) async {
    final verId = _verificationId;
    if (verId == null) return false;

    final cred = PhoneAuthProvider.credential(
      verificationId: verId,
      smsCode: smsCode,
    );
    final userCred = await _auth.signInWithCredential(cred);
    final idToken = await userCred.user?.getIdToken();
    if (idToken == null) return false;

    // Upsert on your backend
    final resp = await http.post(
      Uri.parse('$_base/api/users/mobile-signup'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $idToken',
      },
      body: jsonEncode({
        'email': userCred.user!.phoneNumber,
        'firstName': userCred.user!.displayName ?? '',
        'lastName': '',
      }),
    );
    return resp.statusCode == 200;
  }

  /// Sign out
  Future<void> signOut() async {
    _verificationId = null;
    await _auth.signOut();
  }
}
