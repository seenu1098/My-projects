package com.yorosis.livetester.vo;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrintTestResultsVO {
	private Long[] batchTestcaseId;
	
	@JsonProperty
	private boolean pIICheckbox;
	private String pdfOption;
}
