package com.example.backend.controller;

import com.example.backend.dto.comment.CommentRequestDto;
import com.example.backend.dto.comment.CommentResponseDto;
import com.example.backend.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/api/study-groups/{studyGroupId}/comments")
    public ResponseEntity<CommentResponseDto> createComment(
            @PathVariable Long studyGroupId,
            @RequestBody CommentRequestDto requestDto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(commentService.createComment(studyGroupId, requestDto, userDetails));
    }

    @GetMapping("/api/study-groups/{studyGroupId}/comments")
    public ResponseEntity<List<CommentResponseDto>> getComments(@PathVariable Long studyGroupId) {
        return ResponseEntity.ok(commentService.getComments(studyGroupId));
    }

    @DeleteMapping("/api/comments/{commentId}")
    public ResponseEntity<String> deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        commentService.deleteComment(commentId, userDetails);
        return ResponseEntity.ok("댓글이 삭제되었습니다.");
    }
}