package com.yorosis.yoroflow.models.sprint;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class SaveSprintVo {
	private String response;
	private List<SprintsVO> sprintVoList;
}
