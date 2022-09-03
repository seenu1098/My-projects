package com.yorosis.yoroapps.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnableRowLevelComputationVO {
	private Boolean option;
	private String computationFieldName;
	private String computationLabelName;
	private String operatorType;
	private Long rowWidth;
}
