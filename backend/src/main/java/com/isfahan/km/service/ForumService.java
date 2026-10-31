package com.isfahan.km.service;

import com.example.base.exception.BadRequestException;
import com.example.base.exception.ResourceNotFoundException;
import com.isfahan.km.entity.ForumAnswer;
import com.isfahan.km.entity.ForumQuestion;
import com.isfahan.km.entity.User;
import com.isfahan.km.predicate.ForumPredicateBuilder;
import com.isfahan.km.repository.ForumAnswerRepository;
import com.isfahan.km.repository.ForumQuestionRepository;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ForumService {

    private final ForumQuestionRepository questionRepository;
    private final ForumAnswerRepository answerRepository;

    @Transactional
    public ForumQuestion createQuestion(ForumQuestion question, User author) {
        if (question.getTitle() == null || question.getTitle().isBlank()) {
            throw new BadRequestException("عنوان پرسش الزامی است.");
        }
        if (question.getQuestionBody() == null || question.getQuestionBody().isBlank()) {
            throw new BadRequestException("متن پرسش الزامی است.");
        }

        question.setAuthor(author);
        question.setStatus("OPEN");
        return questionRepository.save(question);
    }

    @Transactional
    public ForumAnswer answerQuestion(UUID questionId, String answerBody, User author) {
        if (questionId == null) {
            throw new BadRequestException("شناسه پرسش الزامی است.");
        }
        if (answerBody == null || answerBody.isBlank()) {
            throw new BadRequestException("متن پاسخ الزامی است.");
        }

        ForumQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("پرسش مورد نظر یافت نشد."));

        ForumAnswer answer = new ForumAnswer();
        answer.setQuestion(question);
        answer.setAuthor(author);
        answer.setAnswerBody(answerBody.trim());
        answer.setIsAccepted(false);

        return answerRepository.save(answer);
    }

    @Transactional
    public ForumAnswer acceptAnswer(UUID answerId, User user) {
        ForumAnswer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new ResourceNotFoundException("پاسخ مورد نظر یافت نشد."));

        ForumQuestion question = answer.getQuestion();
        // Reset previously accepted answers if any
        List<ForumAnswer> allAnswers = answerRepository.findByQuestionIdOrderByCreatedAtAsc(question.getId());
        for (ForumAnswer a : allAnswers) {
            if (Boolean.TRUE.equals(a.getIsAccepted())) {
                a.setIsAccepted(false);
                answerRepository.save(a);
            }
        }

        answer.setIsAccepted(true);
        question.setStatus("RESOLVED");
        questionRepository.save(question);

        return answerRepository.save(answer);
    }

    public Page<ForumQuestion> getQuestions(Boolean isPublic, UUID assignedExpertId, UUID authorId, String status, String keyword, Pageable pageable) {
        Predicate predicate = ForumPredicateBuilder.build(isPublic, assignedExpertId, authorId, status, keyword);
        if (predicate != null) {
            return questionRepository.findAll(predicate, pageable);
        }
        return questionRepository.findAll(pageable);
    }

    public ForumQuestion getQuestionDetails(UUID questionId) {
        return questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("پرسش مورد نظر یافت نشد."));
    }
}
