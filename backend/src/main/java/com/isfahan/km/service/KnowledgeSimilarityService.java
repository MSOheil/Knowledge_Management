package com.isfahan.km.service;

import com.isfahan.km.entity.KnowledgeItem;
import com.isfahan.km.entity.KnowledgeNodeType;
import com.isfahan.km.repository.KnowledgeItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class KnowledgeSimilarityService {

    private final KnowledgeItemRepository itemRepository;

    public record SimilarityMatch(
            UUID id,
            String title,
            KnowledgeNodeType knowledgeType,
            String summary,
            double similarityPercentage,
            String matchReason
    ) {}

    @Transactional(readOnly = true)
    public List<SimilarityMatch> checkSimilarity(String title, String content, String summary) {
        if (title == null || title.trim().isEmpty()) {
            return Collections.emptyList();
        }

        List<KnowledgeItem> allItems = itemRepository.findAll();
        List<SimilarityMatch> matches = new ArrayList<>();

        String cleanNewTitle = normalizeText(title);
        String combinedNewContent = normalizeText((summary != null ? summary : "") + " " + (content != null ? content : ""));

        for (KnowledgeItem item : allItems) {
            String existingTitle = normalizeText(item.getTitle());
            String existingContent = normalizeText((item.getSummary() != null ? item.getSummary() : "") + " " + (item.getContent() != null ? item.getContent() : ""));

            // Title Dice Trigram similarity
            double titleSimilarity = calculateTrigramSimilarity(cleanNewTitle, existingTitle);

            // Token Jaccard similarity across content/summary
            double contentSimilarity = calculateTokenJaccardSimilarity(combinedNewContent, existingContent);

            // Weighted overall similarity: 65% Title, 35% Content
            double overallScore = (titleSimilarity * 0.65) + (contentSimilarity * 0.35);

            // If overall score is >= 30% or title similarity is >= 50%
            if (overallScore >= 0.30 || titleSimilarity >= 0.50) {
                double percentage = Math.round(overallScore * 1000.0) / 10.0;
                String reason = titleSimilarity >= 0.60
                        ? "شباهت بسیار بالا در عنوان (" + Math.round(titleSimilarity * 100) + "٪)"
                        : "هم‌پوشانی واژگان و مفاهیم در محتوا و خلاصه";

                matches.add(new SimilarityMatch(
                        item.getId(),
                        item.getTitle(),
                        item.getKnowledgeType(),
                        item.getSummary(),
                        percentage,
                        reason
                ));
            }
        }

        matches.sort((a, b) -> Double.compare(b.similarityPercentage(), a.similarityPercentage()));
        return matches.stream().limit(5).collect(Collectors.toList());
    }

    private String normalizeText(String input) {
        if (input == null) return "";
        return input.toLowerCase()
                .replaceAll("[ي]", "ی")
                .replaceAll("[ك]", "ک")
                .replaceAll("[\\p{Punct}\\s]+", " ")
                .trim();
    }

    private double calculateTrigramSimilarity(String s1, String s2) {
        if (s1.equals(s2)) return 1.0;
        if (s1.length() < 3 || s2.length() < 3) {
            return s1.contains(s2) || s2.contains(s1) ? 0.7 : 0.0;
        }

        Set<String> nGrams1 = extractTrigrams(s1);
        Set<String> nGrams2 = extractTrigrams(s2);

        int intersection = 0;
        for (String gram : nGrams1) {
            if (nGrams2.contains(gram)) {
                intersection++;
            }
        }

        return (2.0 * intersection) / (nGrams1.size() + nGrams2.size());
    }

    private Set<String> extractTrigrams(String text) {
        Set<String> trigrams = new HashSet<>();
        for (int i = 0; i < text.length() - 2; i++) {
            trigrams.add(text.substring(i, i + 3));
        }
        return trigrams;
    }

    private double calculateTokenJaccardSimilarity(String t1, String t2) {
        if (t1.isEmpty() || t2.isEmpty()) return 0.0;

        Set<String> set1 = new HashSet<>(Arrays.asList(t1.split(" ")));
        Set<String> set2 = new HashSet<>(Arrays.asList(t2.split(" ")));

        Set<String> intersection = new HashSet<>(set1);
        intersection.retainAll(set2);

        Set<String> union = new HashSet<>(set1);
        union.addAll(set2);

        return union.isEmpty() ? 0.0 : (double) intersection.size() / union.size();
    }
}
