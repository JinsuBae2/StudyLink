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
                        .requestMatchers("/api/auth/**").permitAll() // 1. /api/auth/ 하위 경로는 모두 허용
                        .requestMatchers(HttpMethod.GET, "/api/study-groups/**").permitAll() // 2. 스터디 조회는 모두 허용
                        .requestMatchers("/api/members/me/**").authenticated() // 3. 내 정보 조회는 인증 필요
                        .requestMatchers(HttpMethod.POST, "/api/study-groups").authenticated() // 4. 스터디 생성은 인증 필요
                        .requestMatchers("/api/study-groups/*/applications", "/api/study-groups/*/applications/**").authenticated() // 5. 스터디 신청 및 관리는 인증 필요
                        // .requestMatchers("/api/study-groups/**").hasRole("USER") // 👈 이 줄을 주석 처리하거나 삭제합니다.
                        // 스터디 수정/삭제 등은 개별적으로 인증이 필요하도록 Post, Put, Delete 요청에 대해서만 authenticated() 적용
                        .requestMatchers(HttpMethod.PUT, "/api/study-groups/**").authenticated() // 스터디 수정은 인증 필요
                        .requestMatchers(HttpMethod.DELETE, "/api/study-groups/**").authenticated() // 스터디 삭제는 인증 필요
                        .anyRequest().authenticated() // 7. 나머지 모든 요청은 인증만 되면 허용
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