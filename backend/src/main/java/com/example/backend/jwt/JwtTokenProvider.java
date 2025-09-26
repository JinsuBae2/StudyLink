package com.example.backend.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {
    @Value("${jwt.secret.key}")
    private String secretKeyString;

    private SecretKey secretKey;

    @jakarta.annotation.PostConstruct
    protected void init() {
        this.secretKey = Keys.hmacShaKeyFor(secretKeyString.getBytes(StandardCharsets.UTF_8));
    }


    // 토큰 발급
    public String createToken(String email) {
        Date now = new Date();
        long tokenValidityInMilliseconds = 3600000;

        return Jwts.builder()
                .subject(email)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + tokenValidityInMilliseconds))
                .signWith(secretKey)
                .compact();
    }

    // 1. HTTP Request 헤더에서 토큰 추출
    public String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7); // "Bearer " 뒷부분의 토큰 값만 반환
        }
        return null;
    }

    // 2. 토큰 유효성 + 만료일자 확인
    public boolean validateToken(String token) {
        try {
            Jws<Claims> claims = Jwts.parser()
                    .verifyWith(secretKey) // 비밀키로 유효성 검사
                    .build()
                    .parseSignedClaims(token);

            return !claims.getPayload().getExpiration().before(new Date()); // 만료 시간이 현재보다 이전인지 확인
        } catch (Exception e) {
            // 토큰이 유효하지 않은 경우
            return false;
        }
    }

    // 3. 토큰에서 사용자 정보(이메일) 추출
    public String getEmail(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject(); // 토큰 만들 때 .subject(email) 했던 그 이메일 값
    }
}
