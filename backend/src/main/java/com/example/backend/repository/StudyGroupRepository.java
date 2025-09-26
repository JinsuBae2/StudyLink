package com.example.backend.repository;

import com.example.backend.entity.StudyGroup;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface StudyGroupRepository extends JpaRepository<StudyGroup, Long> {
    List<StudyGroup> findAllByCreator(User creator);

    @Query("SELECT sg FROM StudyGroup sg LEFT JOIN FETCH sg.studyGroupTags") // 👈 이거 추가!
    List<StudyGroup> findAllWithTags();
}
