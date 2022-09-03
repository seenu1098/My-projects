package com.yorosis.yoroflow.creation.table.vo;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableSecurityVO {
	private UUID groupId;
	private Boolean readAllowed;
	private Boolean updateAllowed;
	private Boolean deleteAllowed;
}
