import 'package:flutter/material.dart';
import 'package:frontend/pages/kakaopostal_page.dart';
import '../services/api_service.dart';
import '../models/enums.dart'; // Career, StudyStyle Enum

class SignupPage extends StatefulWidget {
  const SignupPage({super.key});

  @override
  State<SignupPage> createState() => _SignupPageState();
}

class _SignupPageState extends State<SignupPage> {
  final _formKey = GlobalKey<FormState>();
  final ApiService _apiService = ApiService();

  // 각 입력 필드를 위한 컨트롤러
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _nicknameController = TextEditingController();
  final _birthDateController = TextEditingController();
  final _jobController = TextEditingController();
  final _goalController = TextEditingController();
  final _tagsController = TextEditingController();
  final _regionController = TextEditingController();

  // Dropdown 선택 값을 저장할 변수
  Career? _selectedCareer;
  StudyStyle? _selectedStudyStyle;

  String _errorMessage = '';

  // 주소 검색 버튼을 눌렀을 때 실행될 함수
  void _searchAddress(BuildContext context) async {
    final result = await Navigator.push<Map<String, dynamic>>(
      context,
      MaterialPageRoute(builder: (_) => const KakaoPostalPage()),
    );

    if (result != null) {
      setState(() {
        _regionController.text = result['sido'] ?? result['sigungu'] ?? '';
      });
    }
  }

  Future<void> _signup() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _errorMessage = '';
      });

      Map<String, dynamic> signupData = {
        'email': _emailController.text,
        'password': _passwordController.text,
        'nickname': _nicknameController.text,
        'birthDate': _birthDateController.text,
        'career': _selectedCareer?.name,
        'studyStyle': _selectedStudyStyle?.name,
        'job': _jobController.text,
        'goal': _goalController.text,
        'region': _regionController.text,
        'tags': _tagsController.text
            .split(',')
            .map((e) => e.trim())
            .where((e) => e.isNotEmpty)
            .toList(),
      };

      try {
        await _apiService.signup(signupData);

        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('회원가입 성공! 로그인 페이지로 이동합니다.')),
        );
        Navigator.of(context).pop();
      } catch (e) {
        setState(() {
          _errorMessage = e.toString().replaceFirst('Exception: ', '');
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('회원가입')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                  controller: _emailController,
                  decoration: const InputDecoration(labelText: '이메일'),
                  validator: (value) => value!.isEmpty ? '필수 항목입니다.' : null),
              const SizedBox(height: 12),
              TextFormField(
                  controller: _passwordController,
                  decoration: const InputDecoration(labelText: '비밀번호'),
                  obscureText: true,
                  validator: (value) => value!.isEmpty ? '필수 항목입니다.' : null),
              const SizedBox(height: 12),
              TextFormField(
                  controller: _nicknameController,
                  decoration: const InputDecoration(labelText: '닉네임'),
                  validator: (value) => value!.isEmpty ? '필수 항목입니다.' : null),
              const SizedBox(height: 12),
              TextFormField(
                  controller: _birthDateController,
                  decoration:
                      const InputDecoration(labelText: '생년월일 (YYYY-MM-DD)'),
                  validator: (value) => value!.isEmpty ? '필수 항목입니다.' : null),
              const SizedBox(height: 12),
              TextFormField(
                  controller: _jobController,
                  decoration: const InputDecoration(labelText: '직업')),
              const SizedBox(height: 12),
              TextFormField(
                  controller: _goalController,
                  decoration: const InputDecoration(labelText: '학습 목표'),
                  maxLines: 3),
              const SizedBox(height: 12),
              DropdownButtonFormField<Career>(
                initialValue: _selectedCareer,
                hint: const Text('경력 선택'),
                onChanged: (Career? newValue) {
                  setState(() {
                    _selectedCareer = newValue;
                  });
                },
                items: Career.values.map((Career career) {
                  return DropdownMenuItem<Career>(
                      value: career, child: Text(career.name));
                }).toList(),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<StudyStyle>(
                initialValue: _selectedStudyStyle,
                hint: const Text('선호 학습 스타일 선택'),
                onChanged: (StudyStyle? newValue) {
                  setState(() {
                    _selectedStudyStyle = newValue;
                  });
                },
                items: StudyStyle.values.map((StudyStyle style) {
                  return DropdownMenuItem<StudyStyle>(
                      value: style, child: Text(style.name));
                }).toList(),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                      child: TextFormField(
                          controller: _regionController,
                          decoration: const InputDecoration(labelText: '주소'),
                          readOnly: true)),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: () => _searchAddress(context),
                    child: const Text('주소 검색'),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TextFormField(
                  controller: _tagsController,
                  decoration:
                      const InputDecoration(labelText: '관심 태그 (쉼표로 구분)')),
              const SizedBox(height: 24),
              if (_errorMessage.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(bottom: 16.0),
                  child: Text(_errorMessage,
                      style: const TextStyle(color: Colors.red)),
                ),
              ElevatedButton(
                onPressed: _signup,
                style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16)),
                child: const Text('회원가입'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
