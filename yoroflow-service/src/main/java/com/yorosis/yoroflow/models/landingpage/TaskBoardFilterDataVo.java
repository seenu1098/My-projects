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
public class TaskBoardFilterDataVo {
	private List<StatusVo> statusList;
	private List<SubStatusVo> subStatusList;
	private List<BoardNameVo> boardNameList;
}
