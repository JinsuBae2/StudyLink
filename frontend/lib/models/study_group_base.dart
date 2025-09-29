abstract class StudyGroupBase {
  final int id;
  final String title;
  final String topic;
  final String creatorNickname;
  final String recruitmentDeadline;

  StudyGroupBase({
    required this.id,
    required this.title,
    required this.topic,
    required this.creatorNickname,
    required this.recruitmentDeadline,
  });
}
