package com.isfahan.km.controller;

import com.example.base.annotation.JsonRequestFilter;
import com.example.base.annotation.JsonResponseFilter;
import com.example.base.validation.FieldRule;
import com.example.base.validation.RuleType;
import com.example.base.validation.ValidateModel;
import com.isfahan.km.entity.KnowledgeItem;
import com.isfahan.km.entity.KnowledgeItemStatus;
import com.isfahan.km.entity.KnowledgeNodeType;
import com.isfahan.km.predicate.KnowledgeItemPredicateBuilder;
import com.isfahan.km.service.KnowledgeItemService;
import com.isfahan.km.service.KnowledgeSimilarityService;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/knowledge")
@RequiredArgsConstructor
public class KnowledgeController {

    private final KnowledgeItemService itemService;
    private final KnowledgeSimilarityService similarityService;

    @PostMapping(value = "/create", consumes = {MediaType.APPLICATION_JSON_VALUE})
    @ResponseStatus(HttpStatus.CREATED)
    @ValidateModel({
            @FieldRule(field = "title", rule = RuleType.NOT_BLANK, message = "عنوان دانش الزامی است"),
            @FieldRule(field = "knowledgeType", rule = RuleType.NOT_NULL, message = "نوع دانش الزامی است")
    })
    @JsonRequestFilter(allow = {"title", "knowledgeType", "content", "summary", "node", "customFieldsJson", "targetAudience"})
    @JsonResponseFilter(include = {"id", "title", "knowledgeType", "status", "createdAt"})
    public KnowledgeItem createItem(@RequestBody KnowledgeItem item) {
        return itemService.create(item, null);
    }

    @PostMapping(value = "/create-with-files", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @ResponseStatus(HttpStatus.CREATED)
    @JsonResponseFilter(include = {"id", "title", "knowledgeType", "status", "createdAt"})
    public KnowledgeItem createItemWithFiles(
            @RequestPart("item") KnowledgeItem item,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        return itemService.create(item, files);
    }

    @PostMapping("/check-similarity")
    public List<KnowledgeSimilarityService.SimilarityMatch> checkSimilarity(@RequestBody Map<String, String> request) {
        String title = request.get("title");
        String content = request.get("content");
        String summary = request.get("summary");
        return similarityService.checkSimilarity(title, content, summary);
    }

    @GetMapping("/{id}")
    @JsonResponseFilter(include = {
            "id", "title", "summary", "knowledgeType", "content", "status",
            "customFieldsJson", "targetAudience", "node.id", "node.title",
            "attachments.id", "attachments.fileName", "attachments.fileType", "attachments.fileSize",
            "createdAt"
    })
    public KnowledgeItem getItem(@PathVariable UUID id) {
        return itemService.findById(id);
    }

    @GetMapping
    @JsonResponseFilter(include = {
            "content.id", "content.title", "content.summary", "content.knowledgeType",
            "content.status", "content.node.id", "content.node.title", "content.createdAt",
            "totalElements", "totalPages", "size", "number"
    })
    public Page<KnowledgeItem> searchItems(
            @RequestParam(required = false) KnowledgeNodeType type,
            @RequestParam(required = false) KnowledgeItemStatus status,
            @RequestParam(required = false) UUID nodeId,
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) String q,
            Pageable pageable) {
        Predicate predicate = KnowledgeItemPredicateBuilder.build(type, status, nodeId, userId, q);
        return itemService.findAll(predicate, pageable);
    }
}
