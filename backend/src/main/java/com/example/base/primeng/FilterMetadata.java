package com.example.base.primeng;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FilterMetadata {
    private Object value;
    private String matchMode;
    private String operator;
}
