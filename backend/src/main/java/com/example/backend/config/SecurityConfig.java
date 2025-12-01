package com.example.backend.config;

import com.example.backend.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .sessionManagement((session) -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .cors((cors) -> cors.configurationSource(corsConfigurationSource()));


        http
                .authorizeHttpRequests((auth) -> auth
                        // 1. 완전 공개 (로그인, 회원가입)
                        .requestMatchers("/api/auth/**").permitAll()

                        // 2. 조회 전용 (GET 요청은 모두 허용 - 스터디 목록, 상세, 댓글 조회 등)
                        // "/api/study-groups/**"는 하위 경로를 모두 포함하므로 댓글 조회(/comments)도 여기에 포함됩니다.
                        .requestMatchers(HttpMethod.GET, "/api/study-groups/**").permitAll()

                        // 3. 인증 필요 (나머지 모든 스터디 그룹 관련 요청)
                        // 위에서 GET은 이미 허용되었으므로, 여기 도달하는 /api/study-groups/** 요청은
                        // 자동으로 POST, PUT, DELETE 등이 됩니다. (스터디 생성/수정/삭제, 신청, 댓글 작성 등)
                        .requestMatchers("/api/members/me/**").authenticated()
                        .requestMatchers("/api/study-groups/**").authenticated()
                        .requestMatchers("/api/comments/**").authenticated() // 댓글 삭제 등

                        // 4. 나머지 모든 요청
                        .anyRequest().authenticated()
                );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 👇 [수정] 특정 포트 대신, localhost 모든 포트를 허용하도록 패턴 사용
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:*"));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}