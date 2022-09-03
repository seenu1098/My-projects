package com.yorosis.taskboard.models;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class ReplaceColumnVO {
	private UUID columnId;
	private UUID taskboardId;
	private String oldColumnName;
	private String newColumnName;
}
