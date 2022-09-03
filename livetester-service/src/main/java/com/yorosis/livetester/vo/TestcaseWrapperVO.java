package com.yorosis.livetester.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TestcaseWrapperVO {
	
	private Long id;
	private Long templateId;
	private String testCaseName;

	private TestcaseVO jsonData;
	private TestcaseGroupVO[] testcaseGroups;
	
}


