import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'dart:convert';

class KpostalPage extends StatefulWidget {
  const KpostalPage({super.key});

  @override
  State<KpostalPage> createState() => _KpostalPageState();
}

class _KpostalPageState extends State<KpostalPage> {
  late final WebViewController _controller;

  @override
  void initState() {
    super.initState();

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..addJavaScriptChannel(
        'Kpostal', // 자바스크립트에서 호출할 채널 이름
        onMessageReceived: (JavaScriptMessage message) {
          // 자바스크립트에서 주소 데이터를 받으면 실행됨
          Map<String, dynamic> data = jsonDecode(message.message);
          Navigator.pop(context, data); // 결과(Map)와 함께 이전 페이지로 돌아가기
        },
      )
      ..loadHtmlString(kpostalHtml); // 아래에 정의된 HTML 코드를 로드
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('주소 검색')),
      body: WebViewWidget(controller: _controller),
    );
  }
}

// Daum 우편번호 서비스를 담을 HTML 페이지 (상수)
const String kpostalHtml = '''
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no"/>
  <title>Kakao 주소 검색</title>
</head>
<body>
  <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js?appkey=a4bb0b216d0851156963fc74e5bfcad2"></script>
  <script>
    new daum.Postcode({
      oncomplete: function(data) {
        Kpostal.postMessage(JSON.stringify(data));
      }
    }).embed();
  </script>
</body>
</html>
''';
