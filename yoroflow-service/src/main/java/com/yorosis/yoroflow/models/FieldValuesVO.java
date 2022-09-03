package com.yorosis.yoroflow.models;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class FieldValuesVO {
	private List<String> fieldHeadersList;
	private List<FieldHeaderVO> fieldHeaders;
	private List<Map<String, Object>> fieldValues;
}
