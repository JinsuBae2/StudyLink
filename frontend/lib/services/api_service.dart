import 'dart:convert';
import 'package:frontend/models/recommended_study_group.dart';
import 'package:frontend/models/study_group_list_item.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../constants.dart';
import '../models/study_group_list_item.dart'; // 곧 만들 데이터 모델

class ApiService {
  // 스터디 그룹 목록을 불러오는 메소드
  Future<List<StudyGroupListItem>> getStudyGroups(
      {String? region, String sort = 'latest'}) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');

    // URL에 쿼리 파라미터 추가
    var uri = Uri.parse('$baseUrl/api/study-groups?sort=$sort');
    if (region != null) {
      uri = uri.replace(queryParameters: {'sort': sort, 'region': region});
    }

    final response = await http.get(
      uri,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(utf8.decode(response.bodyBytes));
      return data.map((json) => StudyGroupListItem.fromJson(json)).toList();
    } else {
      throw Exception('스터디 목록을 불러오는데 실패했습니다.');
    }
  }

  Future<List<RecommendedStudyGroup>> getRecommendedStudyGroups() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');

    if (token == null || token.isEmpty) {
      throw Exception('추천 스터디는 로그인이 필요합니다.');
    }

    final response = await http.get(
      Uri.parse('$baseUrl/api/study-groups/recommendations/v2'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(utf8.decode(response.bodyBytes));
      return data.map((json) => RecommendedStudyGroup.fromJson(json)).toList();
    } else {
      throw Exception('추천 목록을 불러오는데 실패했습니다: ${response.body}');
    }
  }

  // 회원가입을 요청하는 메소드
  Future<void> signup(Map<String, dynamic> signupData) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/signup'),
      headers: {'Content-Type': 'application/json; charset=UTF-8'},
      body: jsonEncode(signupData),
    );

    if (response.statusCode != 200 && response.statusCode != 201) {
      // 회원가입 실패 시 에러 처리 (GlobalExceptionHandler가 보낸 JSON 파싱)
      final errorData = jsonDecode(utf8.decode(response.bodyBytes));
      throw Exception('회원가입 실패: ${errorData['message']}');
    }
    // 성공 시에는 별도의 데이터를 반환하지 않음
  }
}
