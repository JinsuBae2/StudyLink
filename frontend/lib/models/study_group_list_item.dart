import 'package:frontend/models/study_group_base.dart'; // 👈 import 추가

class StudyGroupListItem extends StudyGroupBase {
  // 👈 상속 추가
  StudyGroupListItem({
    required super.id,
    required super.title,
    required super.topic,
    required super.creatorNickname,
    required super.recruitmentDeadline,
  });

  factory StudyGroupListItem.fromJson(Map<String, dynamic> json) {
    return StudyGroupListItem(
      id: json['id'] as int,
      title: json['title'] as String,
      topic: json['topic'] as String,
      creatorNickname: json['creatorNickname'] as String,
      recruitmentDeadline: json['recruitmentDeadline'] as String,
    );
  }
}
