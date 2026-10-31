package com.example.base.primeng;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PNTableModel {

    private int first = 0;
    private int rows = 10;
    private String sortField;
    private int sortOrder = 1; // 1 for ASC, -1 for DESC
    private List<SortMeta> multiSortMeta;
    private Map<String, Object> filters;
    private String globalFilter;

    public Pageable toPageable() {
        int page = rows > 0 ? first / rows : 0;
        int size = rows > 0 ? rows : 10;

        if (StringUtils.hasText(sortField)) {
            Sort.Direction direction = sortOrder == -1 ? Sort.Direction.DESC : Sort.Direction.ASC;
            return PageRequest.of(page, size, Sort.by(direction, sortField));
        }

        return PageRequest.of(page, size);
    }
}
