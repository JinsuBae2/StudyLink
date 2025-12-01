package com.example.backend.repository;

import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    // 🌟 [추가] userTags, studyMemberships, createdStudyGroups를 FETCH JOIN하여 한 번에 가져오는 쿼리
    @Query("SELECT DISTINCT u FROM User u " + // DISTINCT 추가 권장
            "LEFT JOIN FETCH u.userTags ut " +
            "LEFT JOIN FETCH ut.tag " +
            "LEFT JOIN FETCH u.studyMemberships sm " +
            "LEFT JOIN FETCH sm.studyGroup " +
            "LEFT JOIN FETCH u.createdStudyGroups csg " +
            "WHERE u.email = :email")
    Optional<User> findByEmailWithDetails(@Param("email") String email);
}
