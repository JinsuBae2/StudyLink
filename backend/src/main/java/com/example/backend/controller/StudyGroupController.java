package com.example.backend.controller;

import com.example.backend.dto.studygroup.*;
import com.example.backend.service.StudyGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/study-group")
@RequiredArgsConstructor
public class StudyGroupController {

    private final StudyGroupService studyGroupService;

    // 스터디 그룹 생성
    @PostMapping
    public ResponseEntity<String> createStudyGroup(
            @RequestBody StudyGroupCreateRequestDto requestDto,
            @AuthenticationPrincipal UserDetails userDetails
            ) {
        studyGroupService.createStudyGroup(requestDto, userDetails);
        return ResponseEntity.ok("스터디 그룹이 생성되었습니다.");
    }

    // 스터디 그룹 전체 조회
    @GetMapping
    public ResponseEntity<List<StudyGroupListResponseDto>> findAllStudyGroup() {
        List<StudyGroupListResponseDto> studyGroups = studyGroupService.findAllStudyGroup();
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
    public ResponseEntity<String> updateStudyGroup(
            @PathVariable Long id,
            @RequestBody StudyGroupUpdateRequestDto requestDto,
            @AuthenticationPrincipal UserDetails userDetails
            ) {
        studyGroupService.updateStudyGroup(id, requestDto, userDetails);
        return ResponseEntity.ok("스터디 그룹 정보가 수정되었습니다.");
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
    @GetMapping("/recommendations")
    public ResponseEntity<List<RecommendedStudyGroupDto>> getRecommendedStudyGroups(
            @AuthenticationPrincipal UserDetails userDetails
            ) {
        List<RecommendedStudyGroupDto> recommendedGroups = studyGroupService.recommendStudyGroups(userDetails);
        return ResponseEntity.ok(recommendedGroups);
    }
}
