package com.yorosis.yoroapps.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabelTypeVO {
	private String labelName;
	private String labelOption;
	private Long labelSize;
	private String labelStyle;
	private String labelPosition;
}
