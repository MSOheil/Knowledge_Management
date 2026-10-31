package com.example.base.primeng;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SortMeta {
    private String field;
    private int order; // 1 for ASC, -1 for DESC
}
