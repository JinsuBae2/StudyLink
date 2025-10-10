import 'package:flutter/material.dart';
import 'package:frontend/pages/signup_page.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../constants.dart'; // constants.dart 파일을 import

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  String _errorMessage = '';

  Future<void> _login() async {
    setState(() {
      _errorMessage = ''; // 에러 메시지 초기화
    });

    final String email = _emailController.text;
    final String password = _passwordController.text;

    if (email.isEmpty || password.isEmpty) {
      setState(() {
        _errorMessage = '이메일과 비밀번호를 입력해주세요.';
      });
      return;
    }

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/login'), // 로그인 API URL
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: jsonEncode(<String, String>{
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData =
            jsonDecode(utf8.decode(response.bodyBytes));
        final String token = responseData['accessToken'];

        // 로그인 성공! (TODO: 실제 앱에서는 token을 SharedPreferences 등에 저장해야 함)
        print('로그인 성공! 토큰: $token');
        // Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => const HomePage())); // 홈 페이지로 이동
        _showSuccessDialog('로그인 성공!');
      } else if (response.statusCode == 400) {
        final Map<String, dynamic> errorData =
            jsonDecode(utf8.decode(response.bodyBytes));
        setState(() {
          _errorMessage = errorData['message'] ?? '이메일 또는 비밀번호가 올바르지 않습니다.';
        });
      } else {
        setState(() {
          _errorMessage = '로그인 실패: ${utf8.decode(response.bodyBytes)}';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = '네트워크 오류: $e';
      });
    }
  }

  void _showSuccessDialog(String message) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text("알림"),
          content: Text(message),
          actions: <Widget>[
            TextButton(
              child: const Text("확인"),
              onPressed: () {
                Navigator.of(context).pop(); // 다이얼로그 닫기
              },
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('로그인'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(
                labelText: '이메일',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 16.0),
            TextField(
              controller: _passwordController,
              decoration: const InputDecoration(
                labelText: '비밀번호',
                border: OutlineInputBorder(),
              ),
              obscureText: true, // 비밀번호 숨김
            ),
            const SizedBox(height: 16.0),
            if (_errorMessage.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(bottom: 16.0),
                child: Text(
                  _errorMessage,
                  style: const TextStyle(color: Colors.red),
                ),
              ),
            ElevatedButton(
              onPressed: _login,
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(double.infinity, 50), // 버튼 너비를 최대로
              ),
              child: const Text('로그인', style: TextStyle(fontSize: 18)),
            ),
            const SizedBox(height: 16.0),
            TextButton(
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (context) => const SignupPage()),
                );
              },
              child: const Text('아직 회원이 아니신가요? 회원가입'),
            ),
          ],
        ),
      ),
    );
  }
}
