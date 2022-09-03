
package com.yorosis.yoroflow.models;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PermissionVO {
	private UUID id;
	private String tenantId;
	private UUID securityId;
	private UUID groupId;
	private String groupName;
	private Boolean createAllowed;
	private Boolean readAllowed;
	private Boolean updateAllowed;
	private Boolean deleteAllowed;
	private Boolean launchAllowed;
	private Boolean publishAllowed;
}
