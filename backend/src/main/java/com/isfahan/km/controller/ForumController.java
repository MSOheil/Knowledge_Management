package com.isfahan.km.controller;

import com.example.base.annotation.JsonRequestFilter;
import com.example.base.annotation.JsonResponseFilter;
import com.example.base.primeng.PNTableModel;
import com.example.base.querydsl.CustomPredicatesJoinBuilderJPA;
import com.example.base.validation.FieldRule;
import com.example.base.validation.RuleType;
import com.example.base.validation.ValidateModel;
import com.isfahan.km.entity.ForumAnswer;
import com.isfahan.km.entity.ForumQuestion;
import com.isfahan.km.entity.User;
import com.isfahan.km.service.ForumService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/forum")
@RequiredArgsConstructor
public class ForumController {

    private final ForumService forumService;

    @PostMapping("/questions")
    @ValidateModel({
            @FieldRule(field = "title", rule = RuleType.NOT_BLANK, message = "Title is required"),
            @FieldRule(field = "questionBody", rule = RuleType.NOT_BLANK, message = "Question body is required")
    })
    @JsonRequestFilter(allow = {
            "title", "questionBody", "isPublic",
            "assignedExpert", "assignedExpert.id"
    })
    @JsonResponseFilter(include = {
            "id", "title", "questionBody", "isPublic", "status",
            "author.id", "author.fullName",
            "assignedExpert.id", "assignedExpert.fullName", "createdAt"
    })
    public ForumQuestion createQuestion(@RequestBody ForumQuestion question, @AuthenticationPrincipal User author) {
        return forumService.createQuestion(question, author);
    }

    @GetMapping("/questions")
    @JsonResponseFilter(include = {
            "id", "title", "isPublic", "status",
            "author.id", "author.fullName",
            "assignedExpert.id", "assignedExpert.fullName",
            "answers.id", "createdAt"
    })
    public Page<ForumQuestion> getQuestions(
            @RequestParam(required = false) Boolean isPublic,
            @RequestParam(required = false) UUID assignedExpertId,
            @RequestParam(required = false) UUID authorId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return forumService.getQuestions(isPublic, assignedExpertId, authorId, status, keyword, pageable);
    }

    @GetMapping("/questions/{id}")
    @JsonResponseFilter(include = {
            "id", "title", "questionBody", "isPublic", "status",
            "author.id", "author.fullName",
            "assignedExpert.id", "assignedExpert.fullName", "createdAt",
            "answers.id", "answers.answerBody", "answers.isAccepted", "answers.createdAt",
            "answers.author.id", "answers.author.fullName"
    })
    public ForumQuestion getQuestionDetails(@PathVariable UUID id) {
        return forumService.getQuestionDetails(id);
    }

    @PostMapping("/questions/{id}/answers")
    @ValidateModel({
            @FieldRule(field = "answerBody", rule = RuleType.NOT_BLANK, message = "Answer body is required")
    })
    @JsonRequestFilter(allow = {"answerBody"})
    @JsonResponseFilter(include = {
            "id", "answerBody", "isAccepted", "createdAt",
            "author.id", "author.fullName"
    })
    public ForumAnswer answerQuestion(@PathVariable UUID id, @RequestBody ForumAnswer answer, @AuthenticationPrincipal User author) {
        return forumService.answerQuestion(id, answer.getAnswerBody(), author);
    }

    @PostMapping("/answers/{id}/accept")
    @JsonResponseFilter(include = {"id", "answerBody", "isAccepted"})
    public ForumAnswer acceptAnswer(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        return forumService.acceptAnswer(id, user);
    }
}
