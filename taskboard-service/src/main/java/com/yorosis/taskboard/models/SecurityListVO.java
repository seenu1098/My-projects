package com.yorosis.taskboard.models;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecurityListVO {
	private UUID id;
	private String groupId;
	private Boolean readAllowed;
	private Boolean updateAllowed;
	private Boolean deleteAllowed;
}
