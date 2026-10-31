package com.isfahan.km.controller;

import com.example.base.annotation.JsonRequestFilter;
import com.example.base.annotation.JsonResponseFilter;
import com.example.base.validation.FieldRule;
import com.example.base.validation.RuleType;
import com.example.base.validation.ValidateModel;
import com.isfahan.km.entity.KnowledgeNode;
import com.isfahan.km.service.KnowledgeNodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/knowledge-tree")
@RequiredArgsConstructor
public class AdminKnowledgeTreeController {

    private final KnowledgeNodeService treeService;

    @GetMapping("/tree")
    @JsonResponseFilter(include = {
            "id", "title", "code", "nodeOrder", "isActive",
            "children.id", "children.title", "children.code", "children.nodeOrder", "children.isActive",
            "children.children.id", "children.children.title", "children.children.code", "children.children.nodeOrder", "children.children.isActive",
            "children.children.children.id", "children.children.children.title", "children.children.children.code", "children.children.children.nodeOrder", "children.children.children.isActive"
    })
    public List<KnowledgeNode> getTree() {
        return treeService.getTree();
    }

    @GetMapping("/{id}")
    @JsonResponseFilter(include = {
            "id", "title", "code", "description", "nodeOrder", "isActive",
            "parent.id", "parent.title", "createdAt", "updatedAt"
    })
    public KnowledgeNode getNode(@PathVariable UUID id) {
        return treeService.getById(id);
    }

    @PostMapping("/save")
    @ResponseStatus(HttpStatus.CREATED)
    @ValidateModel({
            @FieldRule(field = "title", rule = RuleType.NOT_BLANK, message = "Title is required"),
            @FieldRule(field = "title", rule = RuleType.SIZE, min = 2, max = 255, message = "Title must be between 2 and 255 characters")
    })
    @JsonRequestFilter(allow = {"id", "title", "code", "description", "nodeOrder", "isActive", "parent", "parent.id"})
    @JsonResponseFilter(include = {"id", "title", "code", "description", "nodeOrder", "isActive", "parent.id", "parent.title", "createdAt", "updatedAt"})
    public KnowledgeNode saveNode(@RequestBody KnowledgeNode node) {
        return treeService.save(node);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteNode(@PathVariable UUID id) {
        treeService.delete(id);
    }

    @GetMapping("/del/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delNode(@PathVariable UUID id) {
        treeService.delete(id);
    }
}
