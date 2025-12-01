package com.example.backend.repository;

import com.example.backend.entity.StudyGroup;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.util.List;

public interface StudyGroupRepository extends JpaRepository<StudyGroup, Long> {
    List<StudyGroup> findAllByCreator(User creator);

    @Query("SELECT sg FROM StudyGroup sg LEFT JOIN FETCH sg.studyGroupTags") // 👈 이거 추가!
    List<StudyGroup> findAllWithTags();

    List<StudyGroup> findAllByRegion(String region);

    List<StudyGroup> findAllByRecruitmentDeadlineAfterOrderByRecruitmentDeadlineAsc(LocalDate date);

    @Query("SELECT sg from StudyGroup sg ORDER BY SIZE(sg.studyMembers) DESC ")
    List<StudyGroup> findAllOrderByPopularity(Pageable pageable);

    // 지역별 + 최신순
    List<StudyGroup> findAllByRegionOrderByIdDesc(String region);

    // 지역별 + 마감 임박순
    List<StudyGroup> findAllByRegionAndRecruitmentDeadlineAfterOrderByRecruitmentDeadlineAsc(String region, LocalDate date);

    // 지역별 + 인기순
    @Query("SELECT sg FROM StudyGroup sg WHERE sg.region = :region ORDER BY SIZE(sg.studyMembers) DESC")
    List<StudyGroup> findAllByRegionOrderByPopularity(@Param("region") String region, Pageable pageable);

    // 🌟 [추가] 모든 스터디 그룹과 관련된 태그, 멤버 정보 등 세부사항을 FETCH JOIN
    @Query("SELECT DISTINCT sg FROM StudyGroup sg " +
            "LEFT JOIN FETCH sg.studyGroupTags sgt " +
            "LEFT JOIN FETCH sgt.tag " +
            "LEFT JOIN FETCH sg.studyMembers sm " +
            "LEFT JOIN FETCH sm.user " +
            "LEFT JOIN FETCH sg.creator") // 스터디 생성자 정보도 함께 가져옴
    List<StudyGroup> findAllWithTagsAndDetails();
}
