import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class RegisterPage extends StatefulWidget
{
  const RegisterPage({super.key, required this.title});

  final String title;

  @override
  State<RegisterPage> createState() => _MyRegisterPageState();
}

class _MyRegisterPageState extends State<RegisterPage>
{
  @override
  Widget build(BuildContext context) 
  {
    return Scaffold
    (
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
            'Register',
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
                    child: TextFormField( // First Name Text Box
                      cursorColor: const Color.fromARGB(255, 63, 63, 63),
                      cursorWidth: 1.2,
                      decoration: InputDecoration(
                        labelText: 'First Name',
                        hintText: 'Enter First Name',
                        hintStyle: TextStyle(color: Colors.grey),
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
                    child: TextFormField( // Last Name Text Box
                      cursorColor: const Color.fromARGB(255, 63, 63, 63),
                      cursorWidth: 1.2,
                      decoration: InputDecoration(
                        labelText: 'Last Name',
                        hintText: 'Enter Last Name',
                        hintStyle: TextStyle(color: Colors.grey),
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
                    child: TextFormField( //Email Text Box
                      cursorColor: const Color.fromARGB(255, 63, 63, 63),
                      cursorWidth: 1.2,
                      keyboardType: TextInputType.emailAddress,
                      decoration: InputDecoration(
                        labelText: 'Email',
                        hintText: 'Enter Email Address',
                        hintStyle: TextStyle(color: Colors.grey),
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
                      cursorColor: const Color.fromARGB(255, 63, 63, 63),
                      cursorWidth: 1.2,
                      obscureText: true,
                      decoration: InputDecoration(
                        labelText: 'Password',
                        hintText: 'Enter password',
                        hintStyle: TextStyle(color: Colors.grey),
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

                Column(
                  children: [
                    ElevatedButton.icon( // Register Button
                      onPressed : () {},
                      icon : Icon(Icons.app_registration_rounded),
                      label : Text('Register'),
                      style : ElevatedButton.styleFrom(
                        minimumSize: Size(200, 50),
                        backgroundColor : Colors.greenAccent,
                        foregroundColor: Colors.white,
                      ),
                    ),
                    
                    SizedBox(height: 10),

                    ElevatedButton.icon(
                      onPressed: () {}, // Login Button
                      icon : Icon(Icons.login),
                      label: Text('Login'),
                      style: ElevatedButton.styleFrom(
                        minimumSize: Size(200, 50),
                        backgroundColor : Colors.greenAccent,
                        foregroundColor: Colors.white,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          )
        ],
      )
    );
  } 
}