package com.yorosis.yoroapps.vo;


import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPermissionVO {

	private UUID id;
	private String pageId;
	private String pageName;
	private String workflowKey;	
	private String workflowName;
	private Boolean launchAllowed;
	private Boolean createAllowed;
	private Boolean publishAllowed;	
	private Boolean readAllowed;
	
	private Boolean updateAllowed;
	private Boolean deleteAllowed;	
	private String createdBy;
	
	private Long version;
}
