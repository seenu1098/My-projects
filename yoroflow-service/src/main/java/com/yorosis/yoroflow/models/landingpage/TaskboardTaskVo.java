package com.yorosis.yoroflow.models.landingpage;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class TaskboardTaskVo {
	private List<LandingPageTaskBoardVO> taskboardTaskVo;
	private String totalRecords;
	private List<StatusVo> statusList;
}
