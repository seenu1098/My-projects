package com.yorosis.yoroapps.vo;

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
public class PermissionVO {
	private UUID id;
	private String tenantId;
	private UUID securityId;
	private String groupId;
	private Boolean createAllowed;
	private Boolean readAllowed;
	private Boolean updateAllowed;
	private Boolean deleteAllowed;
	private Boolean showAllowed;
	private String pageName;
	private Long version;
	private Boolean editAllowed;
	private Boolean launchAllowed;
	private String assigneeUser;
	private List<UUID> assigneeGroup;
}
