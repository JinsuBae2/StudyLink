import 'package:frontend/models/study_group_base.dart'; // 👈 import 추가

class RecommendedStudyGroup extends StudyGroupBase {
  final double matchScore;

  RecommendedStudyGroup({
    required super.id,
    required super.title,
    required super.topic,
    required super.creatorNickname,
    required super.recruitmentDeadline,
    required this.matchScore,
  });

  factory RecommendedStudyGroup.fromJson(Map<String, dynamic> json) {
    return RecommendedStudyGroup(
      id: json['id'] as int,
      title: json['title'] as String,
      topic: json['topic'] as String,
      creatorNickname: json['creatorNickname'] as String,
      recruitmentDeadline:
          json['recruitmentDeadLine'] as String, // 오타 수정: recruitmentDeadline
      matchScore: (json['matchScore'] as num).toDouble(), // num -> double 캐스팅
    );
  }
}
