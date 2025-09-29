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
}
