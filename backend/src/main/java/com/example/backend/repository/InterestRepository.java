package com.example.backend.repository;

import com.example.backend.entity.Interest;
import com.example.backend.entity.StudyGroup;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface InterestRepository extends JpaRepository<Interest, Long> {
    // 이미 찜했는지 확인
    boolean existsByUserAndStudyGroup(User user, StudyGroup studyGroup);

    // 찜 삭제를 위해 조회
    Optional<Interest> findByUserAndStudyGroup(User user, StudyGroup studyGroup);

    // 내가 찜한 목록 조회 (최신순)
    List<Interest> findAllByUserOrderByCreatedAtDesc(User user);
}