package com.yorosis.livetester.vo;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class TestcaseGroupVO {
	private Long id;
	private String testcaseGroupName;
	private String description;
	List<TestcaseVO> claimVO;
}
