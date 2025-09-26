package com.example.backend.service;

import com.example.backend.dto.user.UserLoginDto;
import com.example.backend.dto.user.UserSignupRequestDto;
import com.example.backend.entity.User;
import com.example.backend.jwt.JwtTokenProvider;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;


    // 회원가입
    public void signUp(UserSignupRequestDto requestDto) {
        String encodePassword = passwordEncoder.encode(requestDto.getPassword());

        User user = User.builder()
                .email(requestDto.getEmail())
                .password(encodePassword)
                .nickname(requestDto.getNickname())
                .studyStyle(requestDto.getStudyStyle())
                .birthDate(requestDto.getBirthDate())
                .career(requestDto.getCareer())
                .job(requestDto.getJob())
                .goal(requestDto.getGoal())
                .build();

        userRepository.save(user);
    }


    // 로그인
    public String login(UserLoginDto requestDto) {
        User user = userRepository.findByEmail(requestDto.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 이메일입니다."));

        if (!passwordEncoder.matches(requestDto.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("잘못된 비밀번호 입니다.");
        }

        return jwtTokenProvider.createToken(user.getEmail());
    }
}
