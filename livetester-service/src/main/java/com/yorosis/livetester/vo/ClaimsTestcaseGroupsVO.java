package com.yorosis.livetester.vo;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimsTestcaseGroupsVO {
	private TestcaseGroupVO testGroupVo;
	private List<TestcaseVO> claimVO;
}
