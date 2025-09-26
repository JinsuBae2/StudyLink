package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@EqualsAndHashCode(of = {"user", "tag"})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "user_tag")
@IdClass(UserTagId.class) // PK 역할을 할 클래스를 지정
public class UserTag {

    // --- 연관관계이자 복합 키 ---

    @Id // 복합 키의 일부
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Id // 복합 키의 일부
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tag_id")
    private Tag tag;


    // 생성자
    public UserTag(User user, Tag tag) {
        this.user = user;
        this.tag = tag;
    }


}