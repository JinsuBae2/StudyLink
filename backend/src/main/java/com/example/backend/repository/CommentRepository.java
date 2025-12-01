package com.example.backend.repository;

import com.example.backend.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    // 기존 메서드는 지우거나 둬도 되지만, 계층형 조회를 위해 아래 메서드를 사용합니다.
    // 부모가 없는(Null) 댓글들만 최신순으로 조회
    List<Comment> findAllByStudyGroupIdAndParentIsNullOrderByCreatedAtDesc(Long studyGroupId);
}