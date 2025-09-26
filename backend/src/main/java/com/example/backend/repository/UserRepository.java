package com.example.backend.repository;

import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    // email로 User를 조회할 때, 관련된 studyMembers 목록을 함께(JOIN FETCH) 가져오는 메소드
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.studyMembers LEFT JOIN FETCH u.userTags WHERE u.email = :email")
    Optional<User> findByEmailWithDetails(@Param("email") String email);
}
