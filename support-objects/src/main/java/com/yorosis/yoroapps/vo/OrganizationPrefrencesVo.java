package com.yorosis.yoroapps.vo;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrganizationPrefrencesVo {
	private String defaultPageSize;
	private String pendingTaskColor;
	private String completedTaskColor;
	private String errorTaskColor;
	private String draftTaskColor;
	private String approvedTaskColor;
	private String rejectTaskColor;
	private UUID organizationPrefrencesId;
	private String subdomainName;
}
