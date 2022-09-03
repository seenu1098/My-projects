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
public class TaskboardColumnSecurityListVO {
	private UUID columnId;
	private String columnName;
	private List<SecurityListVO> columnPermissions;
}
