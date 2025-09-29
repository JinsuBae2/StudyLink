import 'package:flutter/material.dart';
import 'package:frontend/models/recommended_study_group.dart';
import 'package:frontend/models/study_group_base.dart';
import 'package:shared_preferences/shared_preferences.dart'; // 👈 추가
import '../models/study_group_list_item.dart';
import '../services/api_service.dart';
import 'login_page.dart'; // 👈 추가
import 'recommendation_page.dart'; // 👈 추천 스터디 섹션 추가를 위해 미리 import

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final ApiService _apiService = ApiService();

  // 로그인 상태 관련 변수
  bool _isLoggedIn = false;
  String? _userNickname; // TODO: 실제로는 JWT에서 닉네임 파싱하는 로직이 필요

  // 각 스터디 그룹 섹션의 데이터를 담을 Future 변수들
  late Future<List<RecommendedStudyGroup>>
      _recommendedGroupsFuture; // 👈 추가: 추천 스터디
  late Future<List<StudyGroupListItem>> _popularGroupsFuture;
  late Future<List<StudyGroupListItem>> _deadlineGroupsFuture;
  late Future<List<StudyGroupListItem>> _regionGroupsFuture;
  late Future<List<StudyGroupListItem>> _newStudyGroupsFuture;

  @override
  void initState() {
    super.initState();
    _checkLoginStatus(); // 로그인 상태 확인
    _loadAllStudyGroupSections(); // 각 섹션 데이터 로드
  }

  // 로그인 상태를 확인하고 UI를 업데이트하는 함수
  Future<void> _checkLoginStatus() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');

    if (!mounted) return; // 위젯이 마운트된 상태인지 확인

    setState(() {
      _isLoggedIn = (token != null && token.isNotEmpty);
      // TODO: 실제 앱에서는 토큰을 디코딩하여 닉네임을 파싱하는 로직이 필요
      _userNickname = "멍청년"; // 예시 닉네임
    });
    // 로그인 상태에 따라 추천 스터디도 다시 로드
    if (_isLoggedIn) {
      _recommendedGroupsFuture = _apiService.getRecommendedStudyGroups();
    }
  }

  // 모든 스터디 그룹 섹션의 데이터를 한 번에 로드하는 함수
  Future<void> _loadAllStudyGroupSections() async {
    // 모든 퓨처를 초기화 (await 없이 바로 호출)
    _popularGroupsFuture = _apiService.getStudyGroups(sort: 'popular');
    _deadlineGroupsFuture = _apiService.getStudyGroups(sort: 'deadline');
    _regionGroupsFuture =
        _apiService.getStudyGroups(region: '대구'); // TODO: 실제 지역 설정 필요
    _newStudyGroupsFuture = _apiService.getStudyGroups(sort: 'latest');

    // 로그인 상태 확인 후 추천 스터디 로드
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    if (token != null && token.isNotEmpty) {
      _recommendedGroupsFuture = _apiService.getRecommendedStudyGroups();
    }
    // 상태 변경을 트리거하여 FutureBuilder가 데이터를 다시 로드하도록 함
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('StudyLink'),
        actions: [
          IconButton(
              icon: const Icon(Icons.search),
              onPressed: () {
                // TODO: 검색 페이지로 이동
              }),
          if (_isLoggedIn) // 로그인 상태일 때
            Row(
              children: [
                Text('$_userNickname님',
                    style: const TextStyle(color: Colors.white)),
                IconButton(
                  icon: const Icon(Icons.person),
                  onPressed: () {
                    // TODO: 마이페이지로 이동
                  },
                ),
                TextButton(
                  onPressed: () async {
                    final prefs = await SharedPreferences.getInstance();
                    await prefs.remove('jwt_token'); // 토큰 삭제
                    _checkLoginStatus(); // 로그인 상태 다시 확인하여 UI 업데이트
                    _loadAllStudyGroupSections(); // 스터디 목록 다시 로드 (추천 제외)
                  },
                  child:
                      const Text('로그아웃', style: TextStyle(color: Colors.white)),
                ),
              ],
            )
          else // 로그아웃 상태일 때
            TextButton(
              onPressed: () async {
                // 로그인 페이지로 이동 후, 로그인 성공 시 _checkLoginStatus 호출
                final result = await Navigator.of(context).push(
                  MaterialPageRoute(builder: (context) => const LoginPage()),
                );
                if (result == true) {
                  _checkLoginStatus(); // 로그인 성공 시 로그인 상태 및 UI 업데이트
                  _loadAllStudyGroupSections(); // 스터디 목록 다시 로드 (추천 포함)
                }
              },
              child: const Text('로그인', style: TextStyle(color: Colors.white)),
            ),
          if (!_isLoggedIn) // 로그인 상태가 아닐 때만 회원가입 버튼 표시
            TextButton(
              onPressed: () {
                // TODO: 회원가입 페이지로 이동
              },
              child: const Text('회원가입', style: TextStyle(color: Colors.white)),
            ),
        ],
      ),
      body: RefreshIndicator(
        // 아래로 당겨서 새로고침 기능 추가
        onRefresh: () async {
          await _checkLoginStatus();
          await _loadAllStudyGroupSections();
        },
        child: ListView(
          children: [
            if (_isLoggedIn) // 로그인 상태일 때만 추천 스터디 섹션 표시
              _buildSectionTitle('🌟 회원님을 위한 맞춤 스터디'),
            if (_isLoggedIn)
              _buildStudyGroupSection<RecommendedStudyGroup>(
                  _recommendedGroupsFuture,
                  showMatchScore: true), // 추천 스터디는 유사도 점수 표시

            _buildSectionTitle('🔥 가장 인기있는 스터디'),
            _buildStudyGroupSection<StudyGroupListItem>(_popularGroupsFuture),

            _buildSectionTitle('⏰ 마감 임박 스터디'),
            _buildStudyGroupSection<StudyGroupListItem>(_deadlineGroupsFuture),

            _buildSectionTitle('📍 대구 지역 스터디'), // TODO: 지역 선택 기능 추가
            _buildStudyGroupSection<StudyGroupListItem>(_regionGroupsFuture),

            _buildSectionTitle('✨ 새로 등록된 스터디'),
            _buildStudyGroupSection<StudyGroupListItem>(_newStudyGroupsFuture),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: 스터디 생성 페이지로 이동 (로그인 여부 확인 후)
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  // 섹션 제목을 위한 헬퍼 위젯
  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Text(
        title,
        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
      ),
    );
  }

  // API 결과를 받아서 스터디 목록을 그려주는 위젯
  Widget _buildStudyGroupSection<T extends StudyGroupBase>(
      Future<List<T>> future,
      {bool showMatchScore = false}) {
    return FutureBuilder<List<T>>(
      future: future,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        } else if (snapshot.hasError) {
          return Center(child: Text('데이터를 불러올 수 없습니다: ${snapshot.error}'));
        } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
          return const Center(child: Text('해당 스터디가 없습니다.'));
        }

        final studyGroups = snapshot.data!;
        return SizedBox(
          height: 180, // 카드 높이에 맞춰 조절 (여유롭게)
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount:
                studyGroups.length > 5 ? 5 : studyGroups.length, // 5개 미리보기
            itemBuilder: (context, index) {
              final group = studyGroups[index];
              return Card(
                margin: const EdgeInsets.all(8.0),
                child: Container(
                  // 내부 컨테이너 추가하여 너비 제한 및 패딩 적용
                  width: 180, // 각 카드의 너비 지정
                  padding: const EdgeInsets.all(8.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(group.title,
                          style: const TextStyle(fontWeight: FontWeight.bold),
                          overflow: TextOverflow.ellipsis,
                          maxLines: 1),
                      const SizedBox(height: 4),
                      Text(group.topic,
                          overflow: TextOverflow.ellipsis, maxLines: 1),
                      const Spacer(),
                      if (showMatchScore && group is RecommendedStudyGroup)
                        Chip(
                          label: Text(
                            '유사도: ${group.matchScore.toStringAsFixed(1)}%',
                            style: const TextStyle(
                                color: Colors.white, fontSize: 12),
                          ),
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
