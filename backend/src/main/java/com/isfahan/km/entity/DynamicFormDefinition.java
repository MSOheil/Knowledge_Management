package com.isfahan.km.entity;

import com.example.base.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "dynamic_form_definitions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DynamicFormDefinition extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "knowledge_type", nullable = false, unique = true, length = 50)
    private KnowledgeNodeType knowledgeType;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "form_schema_json", nullable = false, columnDefinition = "TEXT")
    private String formSchemaJson;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
