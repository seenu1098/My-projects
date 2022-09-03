package com.yorosis.yoroapps.vo;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrintField {
	private String label;
	private String fieldName;
	private String fontSize;
	private Boolean isBold;
	private String alignment;
	private Long beforeSpace;
	private Long afterSpace;
	private boolean cutPaper;
	private String fieldType;
	private String value;
	private String repeatableSectionName;
	private boolean addNewLine;
	private long numberOfNewLines;
	private String timeFormat;
	private String dateFormat;
	private boolean horizontalLine;
	private List<ReplaceValueVO> replaceValue;
	private List<String> nonPrintedValues;
	private String matchType;
}
