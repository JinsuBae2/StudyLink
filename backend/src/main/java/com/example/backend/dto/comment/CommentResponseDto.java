package com.example.backend.dto.comment;

import com.example.backend.entity.Comment;
import lombok.Getter;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class CommentResponseDto {
    private Long id;
    private String content;
    private String authorNickname;
    private Long authorId;
    private LocalDateTime createdAt;
    private List<CommentResponseDto> children; // 👈 [추가] 대댓글 리스트

    public CommentResponseDto(Comment comment) {
        this.id = comment.getId();
        this.content = comment.getContent();
        this.authorNickname = comment.getAuthor().getNickname();
        this.authorId = comment.getAuthor().getId();
        this.createdAt = comment.getCreatedAt();
        // 자식 댓글들을 DTO로 변환하여 리스트에 담음
        this.children = comment.getChildren().stream()
                .map(CommentResponseDto::new)
                .collect(Collectors.toList());
    }
}