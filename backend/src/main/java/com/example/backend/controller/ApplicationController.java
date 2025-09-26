package com.example.backend.controller;

import com.example.backend.dto.Application.ApplicationRequestDto;
import com.example.backend.dto.Application.ApplicationResponseDto;
import com.example.backend.dto.Application.ApplicationProcessRequestDto;
import com.example.backend.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/study-groups/{groupId}/applications")
@RequiredArgsConstructor
public class ApplicationController {
    private final ApplicationService applicationService;


    // 사용자 -> 스터디 그룹 신청
    @PostMapping
    public ResponseEntity<String> applyToStudyGroup(
            @PathVariable Long groupId,
            @RequestBody ApplicationRequestDto requestDto,
            @AuthenticationPrincipal UserDetails userDetails
            ) {
        applicationService.applyToStudyGroup(groupId, requestDto, userDetails);
        return ResponseEntity.ok("스터디 그룹에 성공적으로 신청되었습니다.");
    }

    // 그룹장 -> 신청 조회
    @GetMapping
    public ResponseEntity<List<ApplicationResponseDto>> getApplications(
            @PathVariable Long groupId,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<ApplicationResponseDto> applications = applicationService.getApplicationsForStudyGroup(groupId, userDetails);
        return ResponseEntity.ok(applications);
    }

    // 그룹장 -> 신청 처리
    @PostMapping("/{applicationId}/process")
    public ResponseEntity<String> processApplication(
            @PathVariable Long groupId,
            @PathVariable Long applicationId,
            @RequestBody ApplicationProcessRequestDto requestDto,
            @AuthenticationPrincipal UserDetails userDetails
            ) {
        applicationService.processApplication(groupId, applicationId, requestDto, userDetails);
        return ResponseEntity.ok("신청이 성공적으로 처리되었습니다.");
    }
}
