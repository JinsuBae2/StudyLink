package com.example.backend.entity;

import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@NoArgsConstructor
@EqualsAndHashCode
public class StudyGroupTagId implements Serializable {
    private Long studyGroup;
    private Long tag;
}
