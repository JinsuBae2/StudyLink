import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/study_group_base.dart';
import '../models/recommended_study_group.dart';
import '../models/study_group_list_item.dart';
import '../services/api_service.dart';
import 'login_page.dart';
import 'signup_page.dart'; // 회원가입 페이지 import

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final ApiService _apiService = ApiService();

  // 로그인 상태 관련 변수
  bool _isLoggedIn = false;
  String? _userNickname;

  // 각 섹션 데이터를 담을 Future 변수들
  late Future<List<StudyGroupBase>> _recommendedGroupsFuture;
  late Future<List<StudyGroupBase>> _popularGroupsFuture;
  late Future<List<StudyGroupBase>> _deadlineGroupsFuture;
  late Future<List<StudyGroupBase>> _regionGroupsFuture;
  late Future<List<StudyGroupBase>> _newStudyGroupsFuture;

  @override
  void initState() {
    super.initState();
    _initialize();
  }

  Future<void> _initialize() async {
    await _checkLoginStatus();
    _loadAllStudyGroupSections();
  }

  Future<void> _checkLoginStatus() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');

    if (!mounted) return;

    setState(() {
      _isLoggedIn = (token != null && token.isNotEmpty);
      _userNickname = "사용자"; // TODO: 실제 토큰에서 닉네임 파싱
    });
  }

  void _loadAllStudyGroupSections() {
    setState(() {
      if (_isLoggedIn) {
        _recommendedGroupsFuture = _apiService.getRecommendedStudyGroups();
      } else {
        _recommendedGroupsFuture = Future.value([]); // 로그아웃 상태면 빈 리스트
      }
      _popularGroupsFuture = _apiService.getStudyGroups(sort: 'popular');
      _deadlineGroupsFuture = _apiService.getStudyGroups(sort: 'deadline');
      _regionGroupsFuture = _apiService.getStudyGroups(region: '대구');
      _newStudyGroupsFuture = _apiService.getStudyGroups(sort: 'latest');
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('StudyLink'),
        actions: _buildAppBarActions(), // AppBar 버튼들을 별도 메소드로 분리
      ),
      body: RefreshIndicator(
        onRefresh: _initialize,
        child: ListView(
          children: [
            if (_isLoggedIn) ...[
              _buildSectionTitle('🌟 회원님을 위한 맞춤 스터디'),
              _buildStudyGroupSection(_recommendedGroupsFuture,
                  showMatchScore: true),
            ],
            _buildSectionTitle('🔥 가장 인기있는 스터디'),
            _buildStudyGroupSection(_popularGroupsFuture),
            _buildSectionTitle('⏰ 마감 임박 스터디'),
            _buildStudyGroupSection(_deadlineGroupsFuture),
            _buildSectionTitle('📍 대구 지역 스터디'),
            _buildStudyGroupSection(_regionGroupsFuture),
            _buildSectionTitle('✨ 새로 등록된 스터디'),
            _buildStudyGroupSection(_newStudyGroupsFuture),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: 스터디 생성 페이지로 이동
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  // 로그인 상태에 따라 다른 AppBar 버튼 목록을 반환
  List<Widget> _buildAppBarActions() {
    if (_isLoggedIn) {
      return [
        Center(
            child: Text('${_userNickname ?? '사용자'}님',
                style: const TextStyle(fontSize: 16))),
        IconButton(
            icon: const Icon(Icons.person), onPressed: () {/* TODO: 마이페이지 */}),
        TextButton(
          onPressed: () async {
            final prefs = await SharedPreferences.getInstance();
            await prefs.remove('jwt_token');
            _initialize(); // 상태를 다시 확인하고 UI 새로고침
          },
          child: const Text('로그아웃', style: TextStyle(color: Colors.white)),
        ),
      ];
    } else {
      return [
        TextButton(
          onPressed: () async {
            final result = await Navigator.of(context).push(
              MaterialPageRoute(builder: (context) => const LoginPage()),
            );
            if (result == true) {
              _initialize(); // 로그인 성공 시 상태 다시 확인
            }
          },
          child: const Text('로그인', style: TextStyle(color: Colors.white)),
        ),
        TextButton(
          onPressed: () {
            Navigator.of(context).push(
              MaterialPageRoute(builder: (context) => const SignupPage()),
            );
          },
          child: const Text('회원가입', style: TextStyle(color: Colors.white)),
        ),
      ];
    }
  }

  // (이하 _buildSectionTitle, _buildStudyGroupSection 위젯은 이전과 동일)
  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Text(
        title,
        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildStudyGroupSection(Future<List<StudyGroupBase>> future,
      {bool showMatchScore = false}) {
    return FutureBuilder<List<StudyGroupBase>>(
      future: future,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const SizedBox(
              height: 180, child: Center(child: CircularProgressIndicator()));
        } else if (snapshot.hasError) {
          return const SizedBox(
              height: 180, child: Center(child: Text('데이터를 불러올 수 없습니다.')));
        } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
          return const SizedBox(
              height: 180, child: Center(child: Text('해당 스터디가 없습니다.')));
        }

        final studyGroups = snapshot.data!;
        return SizedBox(
          height: 180,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: studyGroups.length > 5 ? 5 : studyGroups.length,
            itemBuilder: (context, index) {
              final group = studyGroups[index];
              return Card(
                margin: const EdgeInsets.all(8.0),
                child: Container(
                  width: 180,
                  padding: const EdgeInsets.all(8.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(group.title,
                          style: const TextStyle(fontWeight: FontWeight.bold),
                          overflow: TextOverflow.ellipsis),
                      const SizedBox(height: 4),
                      Text(group.topic, overflow: TextOverflow.ellipsis),
                      const Spacer(),
                      if (showMatchScore && group is RecommendedStudyGroup)
                        Chip(
                          label: Text(
                              '유사도: ${group.matchScore.toStringAsFixed(1)}%',
                              style: const TextStyle(
                                  color: Colors.white, fontSize: 12)),
                          backgroundColor: Colors.blueAccent,
                          padding: EdgeInsets.zero,
                          materialTapTargetSize:
                              MaterialTapTargetSize.shrinkWrap,
                        ),
                      const SizedBox(height: 4),
                      Text('리더: ${group.creatorNickname}',
                          style: const TextStyle(fontSize: 12)),
                      Text('마감: ${group.recruitmentDeadline}',
                          style: const TextStyle(fontSize: 12)),
                    ],
                  ),
                ),
              );
            },
          ),
        );
      },
    );
  }
}
