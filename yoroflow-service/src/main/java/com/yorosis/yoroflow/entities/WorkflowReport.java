package com.yorosis.yoroflow.entities;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Table(name = "workflow_report")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(exclude = { "workflowReportPermission" })
public class WorkflowReport {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "report_id", unique = true, nullable = false, precision = 19)
	private UUID id;

	@Column(name = "report_type")
	private String reportType;

	@Column(name = "report_name")
	private String reportName;

	@Column(name = "workflow_name")
	private String workflowName;

	@Column(name = "workflow_key")
	private String workflowKey;

	@Column(name = "workflow_version")
	private int workflowVersion;

	@Column(name = "task_name")
	private String taskName;

	@Column(name = "enable_report")
	private String enableReport;

	@Column(name = "task_id")
	private UUID taskId;
	
	@Column(name = "workspace_id")
	private UUID workspaceId;

	@Column(name = "report_json")
	@Type(type = "json")
	private JsonNode reportJson;

	@Column(name = "tenant_id")
	private String tenantId;

	@Column(name = "active_flag")
	private String activeFlag;

	@Column(name = "created_by")
	private String createdBy;

	@Column(name = "modified_by", nullable = false, length = 100)
	private String modifiedBy;
	
	@Column(name = "latest_version")
	private String latestVersion;

	@CreationTimestamp
	@Column(name = "created_on")
	private LocalDateTime createdDate;

	@UpdateTimestamp
	@Column(name = "modified_on")
	private LocalDateTime updatedDate;

	@OneToMany(mappedBy = "workflowReport")
	private List<WorkflowReportPermission> workflowReportPermission;

}
