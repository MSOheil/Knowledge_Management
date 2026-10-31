package com.isfahan.km.service;

import com.example.base.exception.ResourceNotFoundException;
import com.isfahan.km.entity.KnowledgeAttachment;
import com.isfahan.km.entity.KnowledgeItem;
import com.isfahan.km.entity.KnowledgeItemStatus;
import com.isfahan.km.entity.KnowledgeNode;
import com.isfahan.km.repository.KnowledgeAttachmentRepository;
import com.isfahan.km.repository.KnowledgeItemRepository;
import com.isfahan.km.repository.KnowledgeNodeRepository;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class KnowledgeItemService {

    private final KnowledgeItemRepository itemRepository;
    private final KnowledgeNodeRepository nodeRepository;
    private final KnowledgeAttachmentRepository attachmentRepository;

    private static final String UPLOAD_DIR = "uploads/attachments";

    @Transactional(readOnly = true)
    public KnowledgeItem findById(UUID id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Knowledge item not found with ID: " + id));
    }

    @Transactional(readOnly = true)
    public Page<KnowledgeItem> findAll(Predicate predicate, Pageable pageable) {
        return itemRepository.findAll(predicate, pageable);
    }

    @Transactional
    public KnowledgeItem create(KnowledgeItem item, List<MultipartFile> files) {
        // Resolve knowledge node
        if (item.getNode() != null && item.getNode().getId() != null) {
            KnowledgeNode node = nodeRepository.findById(item.getNode().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Knowledge node not found with ID: " + item.getNode().getId()));
            item.setNode(node);
        }

        if (item.getStatus() == null) {
            item.setStatus(KnowledgeItemStatus.SUBMITTED);
        }

        KnowledgeItem savedItem = itemRepository.save(item);

        // Process file uploads if present
        if (files != null && !files.isEmpty()) {
            List<KnowledgeAttachment> attachments = new ArrayList<>();
            Path uploadPath = Paths.get(UPLOAD_DIR);

            try {
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                for (MultipartFile file : files) {
                    if (file.isEmpty()) continue;

                    String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
                    String uniqueFilename = UUID.randomUUID() + "_" + originalFilename;
                    Path destination = uploadPath.resolve(uniqueFilename);

                    Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

                    KnowledgeAttachment attachment = new KnowledgeAttachment();
                    attachment.setKnowledgeItem(savedItem);
                    attachment.setFileName(originalFilename);
                    attachment.setFilePath(destination.toString().replace(File.separator, "/"));
                    attachment.setFileType(file.getContentType());
                    attachment.setFileSize(file.getSize());

                    attachments.add(attachmentRepository.save(attachment));
                }

                savedItem.setAttachments(attachments);
            } catch (IOException e) {
                log.error("Failed to store attachment files", e);
            }
        }

        return savedItem;
    }

    @Transactional
    public void delete(UUID id) {
        KnowledgeItem item = findById(id);
        itemRepository.delete(item);
    }
}
