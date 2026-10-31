package com.isfahan.km.service;

import com.example.base.exception.BadRequestException;
import com.example.base.exception.ResourceNotFoundException;
import com.isfahan.km.entity.ExpertProfile;
import com.isfahan.km.entity.User;
import com.isfahan.km.repository.ExpertProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExpertService {

    private final ExpertProfileRepository expertProfileRepository;

    public List<ExpertProfile> getVerifiedExperts() {
        return expertProfileRepository.findByIsVerifiedTrue();
    }

    public Page<ExpertProfile> getAllExperts(Pageable pageable) {
        return expertProfileRepository.findAll(pageable);
    }

    public ExpertProfile getByUserId(UUID userId) {
        return expertProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("پروفایل خبرگی کاربر یافت نشد."));
    }

    @Transactional
    public ExpertProfile registerOrUpdateProfile(ExpertProfile profile, User user) {
        if (user == null) {
            throw new BadRequestException("کاربر نامعتبر است.");
        }

        ExpertProfile existing = expertProfileRepository.findByUserId(user.getId()).orElse(null);
        if (existing != null) {
            existing.setExpertiseSummary(profile.getExpertiseSummary());
            existing.setResumeFilePath(profile.getResumeFilePath());
            existing.setDepartment(profile.getDepartment());
            return expertProfileRepository.save(existing);
        }

        profile.setUser(user);
        profile.setIsVerified(false); // verification required by KM admin
        return expertProfileRepository.save(profile);
    }

    @Transactional
    public ExpertProfile verifyExpert(UUID expertId, boolean isVerified) {
        ExpertProfile expert = expertProfileRepository.findById(expertId)
                .orElseThrow(() -> new ResourceNotFoundException("پروفایل خبره یافت نشد."));
        expert.setIsVerified(isVerified);
        return expertProfileRepository.save(expert);
    }
}
