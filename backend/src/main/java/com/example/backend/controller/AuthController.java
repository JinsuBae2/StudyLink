package com.example.backend.controller;

import com.example.backend.dto.user.LoginResposeDto;
import com.example.backend.dto.user.UserLoginDto;
import com.example.backend.dto.user.UserSignupRequestDto;
import com.example.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<String> signUp(@RequestBody UserSignupRequestDto requestDto) {
        userService.signUp(requestDto);
        return ResponseEntity.ok("회원가입이 완료되었습니다.");
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<LoginResposeDto> login(@RequestBody UserLoginDto userLoginDto) {
        String token = userService.login(userLoginDto);
        return ResponseEntity.ok(new LoginResposeDto(token));
    }
}
