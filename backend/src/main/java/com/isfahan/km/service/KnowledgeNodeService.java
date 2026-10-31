package com.isfahan.km.service;

import com.example.base.exception.ResourceNotFoundException;
import com.isfahan.km.entity.KnowledgeNode;
import com.isfahan.km.predicate.KnowledgeNodePredicateBuilder;
import com.isfahan.km.repository.KnowledgeNodeRepository;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class KnowledgeNodeService {

    private final KnowledgeNodeRepository nodeRepository;

    @Transactional(readOnly = true)
    public List<KnowledgeNode> getTree() {
        Predicate rootsPredicate = KnowledgeNodePredicateBuilder.roots();
        Sort sort = Sort.by(Sort.Direction.ASC, "nodeOrder").and(Sort.by(Sort.Direction.ASC, "title"));
        
        Iterable<KnowledgeNode> rootsIterable = nodeRepository.findAll(rootsPredicate, sort);
        List<KnowledgeNode> roots = new ArrayList<>();
        rootsIterable.forEach(roots::add);

        // Warm up and sort child nodes recursively
        roots.forEach(this::initializeChildrenRecursively);
        return roots;
    }

    private void initializeChildrenRecursively(KnowledgeNode node) {
        if (node.getChildren() != null) {
            node.getChildren().sort((a, b) -> {
                int orderComp = Integer.compare(
                        a.getNodeOrder() != null ? a.getNodeOrder() : 0,
                        b.getNodeOrder() != null ? b.getNodeOrder() : 0
                );
                if (orderComp != 0) return orderComp;
                return (a.getTitle() != null ? a.getTitle() : "").compareTo(b.getTitle() != null ? b.getTitle() : "");
            });
            node.getChildren().forEach(this::initializeChildrenRecursively);
        }
    }

    @Transactional(readOnly = true)
    public KnowledgeNode getById(UUID id) {
        return nodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Knowledge node not found with ID: " + id));
    }

    @Transactional
    public KnowledgeNode save(KnowledgeNode node) {
        KnowledgeNode parent = null;
        if (node.getParent() != null && node.getParent().getId() != null) {
            parent = getById(node.getParent().getId());
        }

        if (node.getId() != null) {
            KnowledgeNode existing = getById(node.getId());
            existing.setTitle(node.getTitle());
            existing.setCode(node.getCode());
            existing.setDescription(node.getDescription());
            if (node.getNodeOrder() != null) {
                existing.setNodeOrder(node.getNodeOrder());
            }
            if (node.getIsActive() != null) {
                existing.setIsActive(node.getIsActive());
            }
            existing.setParent(parent);
            return nodeRepository.save(existing);
        }

        node.setParent(parent);
        if (node.getNodeOrder() == null) {
            node.setNodeOrder(0);
        }
        if (node.getIsActive() == null) {
            node.setIsActive(true);
        }

        return nodeRepository.save(node);
    }

    @Transactional
    public void delete(UUID id) {
        KnowledgeNode node = getById(id);
        nodeRepository.delete(node);
    }
}
