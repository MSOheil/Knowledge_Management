package com.isfahan.km.controller;

import com.example.base.annotation.JsonRequestFilter;
import com.example.base.annotation.JsonResponseFilter;
import com.example.base.exception.ResourceNotFoundException;
import com.example.base.primeng.PNTableModel;
import com.example.base.querydsl.CustomPredicatesJoinBuilderJPA;
import com.example.base.validation.FieldRule;
import com.example.base.validation.RuleType;
import com.example.base.validation.ValidateModel;
import com.isfahan.km.entity.Secretariat;
import com.isfahan.km.repository.SecretariatRepository;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/secretariats")
@RequiredArgsConstructor
public class AdminSecretariatController {

    private final SecretariatRepository secretariatRepository;

    @PostMapping("/getListTable")
    @JsonResponseFilter(include = {
            "totalElements", "totalPages", "size", "number", "first", "last", "empty", "numberOfElements",
            "content.id", "content.name", "content.code", "content.description", "content.isActive", "content.createdAt", "content.updatedAt",
            "id", "name", "code", "description", "isActive", "createdAt", "updatedAt"
    })
    public Page<Secretariat> getListTable(@RequestBody PNTableModel event) {
        CustomPredicatesJoinBuilderJPA<Secretariat> joinBuilder = new CustomPredicatesJoinBuilderJPA<>(Secretariat.class);
        Predicate predicate = joinBuilder.buildPredicate(event).getValue();
        Pageable pageable = joinBuilder.resolvePageable(event);

        if (predicate != null) {
            return secretariatRepository.findAll(predicate, pageable);
        }
        return secretariatRepository.findAll(pageable);
    }

    @GetMapping("/getList")
    @JsonResponseFilter(include = {"id", "name", "code", "isActive"})
    public List<Secretariat> getList() {
        return secretariatRepository.findAll();
    }

    @GetMapping("/{id}")
    @JsonResponseFilter(include = {"id", "name", "code", "description", "isActive", "createdAt"})
    public Secretariat getById(@PathVariable UUID id) {
        return secretariatRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("دبیرخانه مورد نظر یافت نشد."));
    }

    @PostMapping("/save")
    @ValidateModel({
            @FieldRule(field = "name", rule = RuleType.NOT_BLANK, message = "نام دبیرخانه الزامی است")
    })
    @JsonRequestFilter(allow = {"id", "name", "code", "description", "isActive"})
    @JsonResponseFilter(include = {"id", "name", "code", "description", "isActive", "createdAt", "updatedAt"})
    public Secretariat save(@RequestBody Secretariat secretariat) {
        return secretariatRepository.save(secretariat);
    }
}

