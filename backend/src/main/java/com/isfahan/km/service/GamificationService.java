package com.isfahan.km.service;

import com.isfahan.km.entity.KnowledgeTranscript;
import com.isfahan.km.entity.User;
import com.isfahan.km.entity.UserGamificationProfile;
import com.isfahan.km.repository.KnowledgeTranscriptRepository;
import com.isfahan.km.repository.UserGamificationProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GamificationService {

    private final KnowledgeTranscriptRepository transcriptRepository;
    private final UserGamificationProfileRepository profileRepository;

    @Transactional
    public KnowledgeTranscript awardPoints(User user, String activityType, int points, UUID referenceId, String description) {
        if (user == null || user.getId() == null) return null;

        KnowledgeTranscript transcript = new KnowledgeTranscript();
        transcript.setUser(user);
        transcript.setActivityType(activityType);
        transcript.setPoints(points);
        transcript.setReferenceId(referenceId);
        transcript.setDescription(description);
        KnowledgeTranscript savedTranscript = transcriptRepository.save(transcript);

        // Update User Gamification Profile
        UserGamificationProfile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    UserGamificationProfile p = new UserGamificationProfile();
                    p.setUser(user);
                    p.setTotalPoints(0);
                    p.setKnowledgeContributorLevel("NOVICE");
                    p.setHasBlueBadge(false);
                    p.setBonusAmountEligible(0L);
                    p.setCertificateEligible(false);
                    return p;
                });

        int newTotal = profile.getTotalPoints() + points;
        profile.setTotalPoints(newTotal);

        // Badge & Contributor Level Thresholds (>= 10 points grants Blue Badge)
        if (newTotal >= 10) {
            profile.setHasBlueBadge(true);
            profile.setKnowledgeContributorLevel("DEVELOPER");
            profile.setCertificateEligible(true);
        } else if (newTotal >= 5) {
            profile.setKnowledgeContributorLevel("CONTRIBUTOR");
        } else {
            profile.setKnowledgeContributorLevel("NOVICE");
        }

        // Calculate eligible bonus amount (500,000 Rials per point)
        profile.setBonusAmountEligible((long) newTotal * 500_000L);

        profileRepository.save(profile);
        return savedTranscript;
    }

    public UserGamificationProfile getProfileByUserId(UUID userId) {
        return profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserGamificationProfile p = new UserGamificationProfile();
                    p.setTotalPoints(0);
                    p.setKnowledgeContributorLevel("NOVICE");
                    p.setHasBlueBadge(false);
                    return p;
                });
    }

    public List<KnowledgeTranscript> getUserTranscripts(UUID userId) {
        return transcriptRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Page<UserGamificationProfile> getAllProfiles(Pageable pageable) {
        return profileRepository.findAll(pageable);
    }
}
