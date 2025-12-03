package com.example.backend.service;

import com.example.backend.dto.studygroup.StudyGroupListResponseDto;
import com.example.backend.entity.Interest;
import com.example.backend.entity.StudyGroup;
import com.example.backend.entity.User;
import com.example.backend.repository.InterestRepository;
import com.example.backend.repository.StudyGroupRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class InterestService {

    private final InterestRepository interestRepository;
    private final UserRepository userRepository;
    private final StudyGroupRepository studyGroupRepository;

    // 관심 스터디 토글 (있으면 삭제, 없으면 추가)
    public boolean toggleInterest(Long studyGroupId, UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        StudyGroup studyGroup = studyGroupRepository.findById(studyGroupId)
                .orElseThrow(() -> new IllegalArgumentException("스터디 그룹을 찾을 수 없습니다."));

        // 이미 찜했다면 삭제 (취소)
        if (interestRepository.existsByUserAndStudyGroup(user, studyGroup)) {
            Interest interest = interestRepository.findByUserAndStudyGroup(user, studyGroup)
                    .orElseThrow();
            interestRepository.delete(interest);
            return false; // 찜 취소됨
        } else {
            // 찜하지 않았다면 추가
            Interest interest = Interest.builder()
                    .user(user)
                    .studyGroup(studyGroup)
                    .build();
            interestRepository.save(interest);
            return true; // 찜 완료됨
        }
    }

    // 내 관심 스터디 목록 조회
    @Transactional(readOnly = true)
    public List<StudyGroupListResponseDto> getMyInterests(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        return interestRepository.findAllByUserOrderByCreatedAtDesc(user).stream()
                .map(Interest::getStudyGroup) // Interest에서 StudyGroup을 꺼냄
                .map(StudyGroupListResponseDto::new) // DTO로 변환
                .collect(Collectors.toList());
    }
}