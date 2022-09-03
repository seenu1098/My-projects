package com.yorosis.yoroapps.vo;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class PageFieldVO {
	private String fieldId;
	private String fieldName;
	private String datatype;
	private String dateFormat;
	private String required;
	private String unique;
	private Long fieldSize;
	private String controlType;
	private String pageFieldName;
	private String repeatableFieldName;
	private String repeatableFieldId;
	private List<PageFieldVO> childSections;
	
}
