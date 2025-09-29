import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../constants.dart';
import '../models/recommended_study_group.dart';

class RecommendationPage extends StatefulWidget {
  const RecommendationPage({super.key});

  @override
  State<RecommendationPage> createState() => _RecommendationPageState();
}

class _RecommendationPageState extends State<RecommendationPage> {
  late Future<List<RecommendedStudyGroup>> _recommendationsFuture;

  @override
  void initState() {
    super.initState();
    _recommendationsFuture = _fetchRecommendations();
  }

  Future<List<RecommendedStudyGroup>> _fetchRecommendations() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');

    if (token == null) {
      throw Exception('토큰이 없습니다. 로그인이 필요합니다.');
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('맞춤 스터디 추천'),
      ),
      body: FutureBuilder<List<RecommendedStudyGroup>>(
        future: _recommendationsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('오류: ${snapshot.error}'));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('추천할 스터디 그룹이 없습니다.'));
          }

          final recommendations = snapshot.data!;
          return ListView.builder(
            itemCount: recommendations.length,
            itemBuilder: (context, index) {
              final group = recommendations[index];
              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: ListTile(
                  title: Text(group.title),
                  subtitle: Text(group.topic),
                  trailing: Chip(
                    label: Text(
                      '유사도: ${group.matchScore.toStringAsFixed(1)}%',
                      style: const TextStyle(color: Colors.white),
                    ),
                    backgroundColor: Colors.blue,
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
