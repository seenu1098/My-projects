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
public class PrintConfigurationVO {
	private String fontSize;
	private String font;
	private boolean isBold;
	private String alignment;
	private boolean enableHorizontalLine;
	private boolean addNewLine;
	private boolean enableRepeatableSection;
	private List<RepeatableSectionVO> repeatableFields;
}
