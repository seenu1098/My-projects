package com.yorosis.yoroflow.models;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnvVariableVO {
	private UUID processDefinitionId;
	private List<EnvVariableRequestVO> envVariableRequestVOList;
	private List<UUID> deletedColumnIDList;
}
