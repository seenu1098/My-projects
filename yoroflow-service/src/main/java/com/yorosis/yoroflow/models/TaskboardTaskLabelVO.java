package com.yorosis.yoroflow.models;

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
public class TaskboardTaskLabelVO {
	public UUID id;
	public List<LabelVO> labels;
	public List<UUID> removedIdList;
}
