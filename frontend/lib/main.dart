import 'package:flutter/material.dart';
import 'package:frontend/pages/splash_page.dart';
import 'package:kakao_map_plugin/kakao_map_plugin.dart'; // 👈 KakaoMapPlugin import

void main() {
  // KakaoMapPlugin 초기화 (발급받은 JavaScript 키 사용)
  AuthRepository.initialize(
      appKey:
          "a4bb0b216d0851156963fc74e5bfcad2"); // 👈 YOUR_JAVASCRIPT_KEY_HERE 를 발급받은 키로 교체!

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'StudyLink',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: const SplashPage(),
    );
  }
}
