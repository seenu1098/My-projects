package com.yorosis.livetester.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BatchTestcaseResultVO {
	private long batchNumber;
	private String batchName;
	private String testCaseName;
	private String applicable;
	private String elementName;
	private String expectedValue;
	private String actualValue;
	private String status;
	private String pcn;
	private String tcn;
	private String generateEDI;
}
