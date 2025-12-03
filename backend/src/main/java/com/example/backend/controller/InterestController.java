package com.example.backend.controller;

import com.example.backend.dto.studygroup.StudyGroupListResponseDto;
import com.example.backend.service.InterestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class InterestController {

    private final InterestService interestService;

    // 관심 스터디 토글 (POST /api/study-groups/{id}/interest)
    @PostMapping("/study-groups/{studyGroupId}/interest")
    public ResponseEntity<Map<String, Boolean>> toggleInterest(
            @PathVariable Long studyGroupId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        boolean isInterested = interestService.toggleInterest(studyGroupId, userDetails);
        // 현재 찜 상태를 반환 (true: 찜함, false: 취소함)
        return ResponseEntity.ok(Map.of("isInterested", isInterested));
    }

    // 내 관심 스터디 목록 조회 (GET /api/members/me/interests)
    @GetMapping("/members/me/interests")
    public ResponseEntity<List<StudyGroupListResponseDto>> getMyInterests(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(interestService.getMyInterests(userDetails));
    }
}