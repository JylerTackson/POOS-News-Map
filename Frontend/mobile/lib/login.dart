import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key, required this.title});

  final String title;

  @override
  State<LoginPage> createState() => _MyLoginPageState();
}

class _MyLoginPageState extends State<LoginPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: Text(widget.title),
          backgroundColor: Colors.greenAccent,
          foregroundColor: Colors.white,
        ),

        body: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(
              'Login',
              style: TextStyle(
                fontSize: 24,
                color: Colors.greenAccent,
                fontWeight: FontWeight.bold,
              ),
            ),

            SizedBox(height: 20),

            Form(
              child: Column(
                children: [

                  Center(
                    child: SizedBox(
                      width: 400,
                      child: TextFormField( // Email Text Box
                        keyboardType: TextInputType.emailAddress,
                        decoration: InputDecoration(
                          labelText: 'Email',
                          hintText: 'Enter email',
                          prefixIcon: Icon(Icons.email),
                          border: OutlineInputBorder(),
                          focusedBorder: OutlineInputBorder(
                            borderSide: BorderSide(color: Colors.greenAccent, width: 2.0),
                          ),
                          floatingLabelStyle : TextStyle(
                            color: Colors.greenAccent,
                          ),
                        ),
                      ),
                    ),
                  ),

                  SizedBox(height: 20),

                  Center(
                    child: SizedBox(
                      width: 400,
                      child: TextFormField( // Password Text Box
                        keyboardType: TextInputType.visiblePassword,
                        obscureText: true,
                        decoration: InputDecoration(
                          labelText: 'Password',
                          hintText: 'Enter password',
                          prefixIcon: Icon(Icons.lock),
                          border: OutlineInputBorder(),
                          focusedBorder: OutlineInputBorder(
                            borderSide: BorderSide(color: Colors.greenAccent, width: 2.0),
                          ),
                          floatingLabelStyle : TextStyle(
                            color: Colors.greenAccent,
                          ),
                        ),
                      ),
                    ),
                  ),

                  SizedBox(height: 20),

                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 100),
                    child: Column(
                      children: [

                        ElevatedButton( // Login Button
                          onPressed: () {},
                          style: ElevatedButton.styleFrom(
                            minimumSize: Size(200, 50), 
                            backgroundColor: Colors.greenAccent,
                            foregroundColor: Colors.white,
                          ),
                          child: Text('Login'),
                        ),

                        SizedBox(height: 10),

                        ElevatedButton( // Register Button
                          onPressed: () {
                            
                          },
                          style: ElevatedButton.styleFrom(
                            minimumSize: Size(200, 50),
                            backgroundColor: Colors.greenAccent,
                            foregroundColor: Colors.white,
                          ),
                          child: Text('Register'),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
  }
}