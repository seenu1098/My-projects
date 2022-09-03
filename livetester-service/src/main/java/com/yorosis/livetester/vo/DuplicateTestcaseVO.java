package com.yorosis.livetester.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DuplicateTestcaseVO {
	
	private long claimId;
	private String testCaseName;
	private TestcaseGroupVO[] testcaseGroups;
}
