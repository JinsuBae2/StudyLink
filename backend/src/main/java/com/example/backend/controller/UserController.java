package com.example.backend.controller;

import com.example.backend.dto.Application.MemberApplicationResponseDto; // DTO 변경
import com.example.backend.dto.studygroup.MyCreatedStudyGroupResponseDto; // DTO 추가
import com.example.backend.dto.studygroup.MyParticipatingStudyGroupResponseDto; // DTO 추가
import com.example.backend.dto.user.UserProfileResponseDto; // DTO 추가
import com.example.backend.dto.user.UserProfileUpdateRequestDto;
import com.example.backend.service.ApplicationService;
import com.example.backend.service.StudyGroupService; // Service 추가
import com.example.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members/me") // 👈 [변경] 경로를 /api/members/me로 변경
@RequiredArgsConstructor
public class UserController {
    private final ApplicationService applicationService;
    private final UserService userService;
    private final StudyGroupService studyGroupService; // 👈 [추가] StudyGroupService 주입

    // 내 프로필 정보 조회 (기존 getMyInfo 대체)
    @GetMapping
    public ResponseEntity<UserProfileResponseDto> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        UserProfileResponseDto userProfile = userService.getMyProfile(userDetails);
        return ResponseEntity.ok(userProfile);
    }

    // 내 신청 현황 조회 (프론트엔드 MyApplication 타입과 매핑될 DTO 사용)
    @GetMapping("/applications")
    public ResponseEntity<List<MemberApplicationResponseDto>> getMyApplications(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<MemberApplicationResponseDto> myApplications = applicationService.getMyApplications(userDetails); // 👈 DTO 변경
        return ResponseEntity.ok(myApplications);
    }

    // 내가 참여 중인 스터디 그룹 목록 조회
    @GetMapping("/study-groups")
    public ResponseEntity<List<MyParticipatingStudyGroupResponseDto>> getMyParticipatingStudyGroups(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<MyParticipatingStudyGroupResponseDto> studyGroups = studyGroupService.getMyParticipatingStudyGroups(userDetails); // 👈 Service 호출
        return ResponseEntity.ok(studyGroups);
    }

    // 내가 생성한 스터디 그룹 목록 조회
    @GetMapping("/created-study-groups")
    public ResponseEntity<List<MyCreatedStudyGroupResponseDto>> getMyCreatedStudyGroups(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<MyCreatedStudyGroupResponseDto> createdGroups = studyGroupService.getMyCreatedStudyGroups(userDetails); // 👈 Service 호출
        return ResponseEntity.ok(createdGroups);
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