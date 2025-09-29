package com.example.backend.dto.user;

import lombok.Getter;

@Getter
public class LoginResposeDto {
    private final String accessToken;

    public LoginResposeDto(String accessToken) {
        this.accessToken = accessToken;
    }
}
