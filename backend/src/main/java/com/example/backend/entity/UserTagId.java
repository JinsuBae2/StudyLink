package com.example.backend.entity;

import java.io.Serializable;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@EqualsAndHashCode
public class UserTagId implements Serializable {
    private Long user; // UserTag의 user 필드명과 일치해야 함
    private Long tag;  // UserTag의 tag 필드명과 일치해야 함
}