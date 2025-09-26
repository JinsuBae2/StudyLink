package com.example.backend.controller;

import com.example.backend.dto.Application.ApplicationResponseDto;
import com.example.backend.dto.user.UserProfileUpdateRequestDto;
import com.example.backend.service.ApplicationService;
import com.example.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class UserController {
    private final ApplicationService applicationService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<String> getMyInfo(@AuthenticationPrincipal UserDetails userDetails) {
        String userEmail = userDetails.getUsername();
        return ResponseEntity.ok("인증 성공! 당신의 이메일은 " + userEmail + " 입니다.");
    }

    // 내 신청 현황 조회
    @GetMapping("/applications")
    public ResponseEntity<List<ApplicationResponseDto>> getMyApplications(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<ApplicationResponseDto> myApplications = applicationService.getMyApplications(userDetails);
        return ResponseEntity.ok(myApplications);
    }

    // 사용자 프로필 수정
    @PutMapping
    public ResponseEntity<String> updateUserProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UserProfileUpdateRequestDto requestDto
            ) {
        userService.updateUserProfile(userDetails, requestDto);
        return ResponseEntity.ok("프로필이 성공적으로 수정되었습니다.");
    }
}
