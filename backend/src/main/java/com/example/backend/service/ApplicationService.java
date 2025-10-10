package com.example.backend.service;

import com.example.backend.dto.Application.ApplicationRequestDto;
import com.example.backend.dto.Application.ApplicationResponseDto;
import com.example.backend.dto.Application.ApplicationProcessRequestDto;
import com.example.backend.dto.Application.MemberApplicationResponseDto;
import com.example.backend.entity.*;
import com.example.backend.repository.ApplicationRepository;
import com.example.backend.repository.StudyGroupRepository;
import com.example.backend.repository.StudyMemberRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final StudyGroupRepository studyGroupRepository;
    private final StudyMemberRepository studyMemberRepository;


    // 사용자 -> 스터디 신청
    @Transactional
    public void applyToStudyGroup(Long groupId, ApplicationRequestDto requestDto, UserDetails userDetails) {
        User applicant = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        StudyGroup studyGroup = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("스터디 그룹을 찾을 수 없습니다."));

        if (studyGroup.getCreator().getId().equals(applicant.getId())) {
            throw new IllegalArgumentException("자신이 생성한 스터디 그룹에는 신청할 수 없습니다.");
        }

        Application application = Application.builder()
                .applicant(applicant)
                .studyGroup(studyGroup)
                .message(requestDto.getMessage())
                .build();

        applicationRepository.save(application);
    }

    // 그룹장 -> 신청 목록 확인
    @Transactional(readOnly = true)
    public List<ApplicationResponseDto> getApplicationsForStudyGroup(Long groupId, UserDetails userDetails) {
        StudyGroup studyGroup = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("스터디 그룹을 찾을 수 없습니다."));

        if (!studyGroup.getCreator().getEmail().equals(userDetails.getUsername())){
            throw new IllegalArgumentException("신청 목록을 조회할 권한이 없습니다");
        }

        return applicationRepository.findAllByStudyGroupId(groupId).stream()
                .map(ApplicationResponseDto::new)
                .collect(Collectors.toList());
    }

    // 그룹장 -> 신청 처리
    @Transactional
    public void processApplication(Long groupId, Long applicationId, ApplicationProcessRequestDto requestDto, UserDetails userDetails) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("해당 신청을 찾을 수 없습니다."));

        StudyGroup studyGroup = application.getStudyGroup();

        if (!studyGroup.getCreator().getEmail().equals(userDetails.getUsername())) {
            throw new IllegalArgumentException("신청을 처리할 권한이 없습니다.");
        }

        ApplicationStatus newStatus = requestDto.getStatus();

        if (newStatus == ApplicationStatus.ACCEPTED) {
            application.updateStatus(ApplicationStatus.ACCEPTED);

            StudyMember newMember = StudyMember.builder()
                    .user(application.getApplicant())
                    .studyGroup(studyGroup)
                    .role("MEMBER")
                    .build();
            studyMemberRepository.save(newMember);
        } else if (newStatus == ApplicationStatus.REJECTED) {
            application.updateStatus(ApplicationStatus.REJECTED);
        }
    }

    @Transactional(readOnly = true)
    public List<MemberApplicationResponseDto> getMyApplications(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        // ApplicationRepository에 findByApplicant 메소드가 필요함
        List<Application> applications = applicationRepository.findAllByApplicantId(user.getId());

        return applications.stream()
                .map(MemberApplicationResponseDto::new)
                .collect(Collectors.toList());
    }
}
