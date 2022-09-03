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
public class WorkspaceVO {
	private UUID workspaceId;
	private String workspaceName;
	private String workspaceKey;
	private String workspaceUniqueId;
	private boolean securedWorkspaceFlag;
	private String workspaceAvatar;
	private WorkspaceSecurityVo workspaceSecurityVO;
	private WorkflowNamesVO workflow;
	private TaskboardNamesVO taskboard;
	private YorDocsNamesVo yoroDocs;
	private Boolean defaultWorkspace;
	private Boolean managedWorkspace;
}
