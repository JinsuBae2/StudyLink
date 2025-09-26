package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@EqualsAndHashCode(of = {"user", "tag"})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@IdClass(StudyGroupTagId.class)
public class StudyGroupTag {
    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_group_id")
    private StudyGroup studyGroup;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tag_id")
    private Tag tag;

    public StudyGroupTag(StudyGroup studyGroup, Tag tag) {
        this.studyGroup = studyGroup;
        this.tag = tag;
    }
}
