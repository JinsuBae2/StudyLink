import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart'; // kakao_map_plugin이 사용하는 webview_flutter를 활용
import 'dart:convert';
import 'package:flutter/foundation.dart'; // kIsWeb 확인용

class KakaoPostalPage extends StatefulWidget {
  const KakaoPostalPage({super.key});

  @override
  State<KakaoPostalPage> createState() => _KakaoPostalPageState();
}

class _KakaoPostalPageState extends State<KakaoPostalPage> {
  late final WebViewController _controller;

  @override
  void initState() {
    super.initState();

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..addJavaScriptChannel(
        'KakaoPostcode', // JavaScript에서 호출할 채널 이름
        onMessageReceived: (JavaScriptMessage message) {
          // JavaScript에서 주소 데이터를 받으면 실행됨
          Map<String, dynamic> data = jsonDecode(message.message);
          // Navigator.pop(context, data); // 결과(Map)와 함께 이전 페이지로 돌아가기
          Navigator.pop(context, {
            'region': data['sido'] ?? data['sigungu'] ?? ''
          }); // 필요한 정보만 추출하여 반환
        },
      )
      ..loadHtmlString(kpostalHtml(kIsWeb)); // 아래에 정의된 HTML 코드를 로드
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('주소 검색')),
      body: WebViewWidget(controller: _controller),
    );
  }
}

// Daum 우편번호 서비스를 담을 HTML 페이지 (함수)
// 웹 환경에서는 iframe 내에서 자바스크립트 채널이 동작하지 않을 수 있으므로,
// 일반 웹 페이지를 직접 열도록 처리
String kpostalHtml(bool isWeb) => '''
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no"/>
  <title>Kakao 주소 검색</title>
  <style>
    body { margin: 0; padding: 0; overflow: hidden; }
    iframe { width: 100%; height: 100%; border: none; }
  </style>
</head>
<body>
  <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
  <script>
    function openPostcode() {
      new daum.Postcode({
        oncomplete: function(data) {
          // 주소 검색 완료 시 Flutter 앱으로 데이터 전달
          if (window.KakaoPostcode) { // Flutter WebviewChannel 확인
            window.KakaoPostcode.postMessage(JSON.stringify(data));
          } else { // 일반 웹 환경 (새 탭으로 열렸을 경우 등)
            window.opener.postMessage(JSON.stringify(data), '*');
            window.close();
          }
        }
      }).open(); // 우편번호 찾기 팝업 띄우기
    }

    // 페이지 로드 시 바로 검색창 띄우기
    window.onload = function() {
      openPostcode();
    };
  </script>
</body>
</html>
''';
