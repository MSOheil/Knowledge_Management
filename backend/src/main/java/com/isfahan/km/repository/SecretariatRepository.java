package com.isfahan.km.repository;

import com.isfahan.km.entity.Secretariat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import java.util.Optional;
import java.util.UUID;

public interface SecretariatRepository extends JpaRepository<Secretariat, UUID>, QuerydslPredicateExecutor<Secretariat> {
    Optional<Secretariat> findByCode(String code);
}

