package com.yorosis.livetester.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ElementConfigVO {
	private Long id;

	private String label;
	private String fieldName;

	private String fieldType;
	private String controlType;
	private String json;
	private String mandatory;
	private String applicable;
	private String matchQuery;
	private String fallbackQuery1;
	private String fallbackQuery2;
}
