package com.example.backend.controller;

import com.example.backend.dto.studygroup.*;
// import com.example.backend.service.RecommendationService; // 👈 제거: 컨트롤러에서 직접 사용 안 함
import com.example.backend.service.StudyGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/study-groups")
@RequiredArgsConstructor
public class StudyGroupController {

    private final StudyGroupService studyGroupService;
    // private final RecommendationService recommendationService; // 👈 제거

    // 스터디 그룹 생성
    @PostMapping
    public ResponseEntity<StudyGroupDetailResponseDto> createStudyGroup(
            @RequestBody StudyGroupCreateRequestDto requestDto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        StudyGroupDetailResponseDto createdStudyGroup = studyGroupService.createStudyGroup(requestDto, userDetails);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdStudyGroup);
    }

    // 스터디 그룹 전체 조회
    @GetMapping
    public ResponseEntity<List<StudyGroupListResponseDto>> findAllStudyGroup(
            @RequestParam(value = "region", required = false) String region,
            @RequestParam(value = "sort", required = false, defaultValue = "latest") String sort,
            @RequestParam(value = "search", required = false) String search
    ) {
        List<StudyGroupListResponseDto> studyGroups = studyGroupService.findAllStudyGroup(region, sort, search);
        return ResponseEntity.ok(studyGroups);
    }

    // 스터디 그룹 단일 조회
    @GetMapping("/{id}")
    public ResponseEntity<StudyGroupDetailResponseDto> findStudyGroupById(@PathVariable Long id) {
        StudyGroupDetailResponseDto studyGroup = studyGroupService.findStudyGroupById(id);
        return ResponseEntity.ok(studyGroup);
    }

    // 스터디 그룹 수정
    @PutMapping("/{id}")
    public ResponseEntity<StudyGroupDetailResponseDto> updateStudyGroup(
            @PathVariable Long id,
            @RequestBody StudyGroupUpdateRequestDto requestDto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        StudyGroupDetailResponseDto updatedStudyGroup = studyGroupService.updateStudyGroup(id, requestDto, userDetails);
        return ResponseEntity.ok(updatedStudyGroup);
    }

    // 스터디 그룹 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteStudyGroup(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        studyGroupService.deleteStudyGroup(id, userDetails);
        return ResponseEntity.ok("스터디 그룹이 삭제되었습니다.");
    }

    // 스터디 그룹 추천 목록 (v1: 점수 기반 추천 알고리즘)
    // 현재 StudyGroupService.recommendStudyGroups가 최신 로직(v2 포함)을 사용하고 있으므로 v1 엔드포인트도 최신 로직을 반환하게 됩니다.
    @GetMapping("/recommendations")
    public ResponseEntity<List<RecommendedStudyGroupDto>> getRecommendedStudyGroups(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<RecommendedStudyGroupDto> recommendedGroups = studyGroupService.recommendStudyGroups(userDetails);
        return ResponseEntity.ok(recommendedGroups);
    }

    // 스터디 그룹 추천 목록 (v2: 콘텐츠 기반 추천 - v1과 동일한 로직 사용)
    @GetMapping("/recommendations/v2")
    public ResponseEntity<List<RecommendedStudyGroupDto>> getRecommendedStudyGroupV2(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // 👈 [수정] RecommendationService 직접 호출 대신 StudyGroupService 사용
        List<RecommendedStudyGroupDto> recommendedGroups = studyGroupService.recommendStudyGroups(userDetails);
        return ResponseEntity.ok(recommendedGroups);
    }
}