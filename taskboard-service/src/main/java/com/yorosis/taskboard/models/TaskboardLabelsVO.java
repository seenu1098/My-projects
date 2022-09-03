package com.yorosis.taskboard.models;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskboardLabelsVO {
	private UUID taskboardId;
	private List<LabelVO> labels;
}
