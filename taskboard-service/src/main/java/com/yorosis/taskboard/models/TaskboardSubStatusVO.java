package com.yorosis.taskboard.models;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskboardSubStatusVO {
	private UUID taskboardColumnId;
	private List<SubStatusVO> subStatus;
	private List<UUID> deletedIdList;
}
