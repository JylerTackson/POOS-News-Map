// lib/services/auth_service.dart

import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn.instance;
  final String _base = dotenv.env['API_BASE_URL'] ?? '';

  Future<bool> signInWithGoogle() async {
    // 1️⃣ On web, initialize with your OAuth client ID (required)
    if (kIsWeb) {
      final clientId = dotenv.env['GOOGLE_CLIENT_ID'];
      if (clientId == null || clientId.isEmpty) {
        throw Exception('Missing GOOGLE_CLIENT_ID in .env');
      }
      await _googleSignIn.initialize(clientId: clientId);
    }

    // 2️⃣ Kick off the new authenticate() flow and grab the returned account
    late GoogleSignInAccount googleUser;
    try {
      googleUser = await _googleSignIn.authenticate();
      // (authenticate() throws on cancel or error) :contentReference[oaicite:0]{index=0}
    } on GoogleSignInException {
      return false; // user aborted or error
    }

    // 3️⃣ From that account, grab the (now synchronous) tokens
    final googleAuth = googleUser.authentication;
    // (authentication is now sync) :contentReference[oaicite:1]{index=1}

    // 4️⃣ Build a Firebase credential & sign in
    final credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.getAccessToken(),
      idToken: googleAuth.idToken,
    );
    final userCred = await _auth.signInWithCredential(credential);

    // 5️⃣ Get the Firebase ID token to send to your backend
    final idToken = await userCred.user?.getIdToken();
    if (idToken == null) return false;

    // 6️⃣ Upsert on your backend
    final resp = await http.post(
      Uri.parse('$_base/api/users/mobile-signup'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $idToken',
      },
      body: jsonEncode({
        'email': userCred.user!.email,
        'firstName': userCred.user!.displayName?.split(' ').first ?? '',
        'lastName':
            userCred.user!.displayName?.split(' ').skip(1).join(' ') ?? '',
      }),
    );

    return resp.statusCode == 200;
  }

  Future<void> signOut() async {
    await _googleSignIn.signOut();
    await _auth.signOut();
  }
}
