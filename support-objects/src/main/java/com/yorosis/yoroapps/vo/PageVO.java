package com.yorosis.yoroapps.vo;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PageVO {
	private UUID yorosisPageId;
	private String pageName;
	private String pageId;
	private String description;
	private String layoutType;
	private UUID applicationId;
	private String applicationName;

	private List<SectionVO> sections;

	private Boolean manageFlag;
	private Boolean isWorkflowForm;
	private Long version;
	private String qualifier;
	private String status;
	private String pageIdWithPrefix;

	private ResolvedSecurityForPageVO security;

	// The following three fields are for Action -> Save and call workflow or Don't
	// save but call workflow.
	// This would be used only when both workflowKey and workflowVersion is not null
	private boolean saveAndCallWorkflow;
	private String workflowKey;
	private String workflowVersion;
	private boolean exportAsPdf;
	private String foreignKey;

	private PrinterConfiguration printConfiguration;
	private PrintFieldListVO printFieldsList;
	private String taskId;
	private long count;
}
