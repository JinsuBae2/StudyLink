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
                        .requestMatchers("/api/auth/**").permitAll() // /api/auth/ 하위 경로는 모두 허용
                        .requestMatchers(HttpMethod.GET, "/api/study-groups/**").permitAll() // 스터디 조회는 모두 허용
                        .requestMatchers("/api/members/me/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/study-groups").authenticated() // 스터디 생성
                        .requestMatchers("/api/study-groups/*/applications", "/api/study-groups/*/applications/**").authenticated() // 스터디 신청 및 관리
                        .requestMatchers("/api/study-groups/**").hasRole("USER") // 나머지 스터디 관련은 USER 롤 필요 (예시)
                        //  이 부분은 스터디 그룹 수정/삭제 등 그룹장만 가능한 기능도 포함할 수 있으니
                        //  보다 세분화된 권한 설정이 필요할 수 있습니다.
                        //  일단은 인증만 된 상태로 진행하겠습니다.

                        .anyRequest().authenticated() // 나머지 모든 요청은 인증만 되면 허용
                );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 👇 [수정] 특정 포트 대신, localhost의 모든 포트를 허용하도록 패턴 사용
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:*"));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}