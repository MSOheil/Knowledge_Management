package com.isfahan.km.repository;

import com.isfahan.km.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import java.util.Optional;
import java.util.UUID;

public interface RoleRepository extends JpaRepository<Role, UUID>, QuerydslPredicateExecutor<Role> {
    Optional<Role> findByName(String name);
}
