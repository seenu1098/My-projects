package com.yorosis.yoroflow.entities;

import java.util.List;
import java.util.UUID;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import org.hibernate.annotations.GenericGenerator;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Table(name = "process_definitions")
@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = { "processDefinitionTasks", "processInstances", "processPermission" })
public class ProcessDefinition extends BaseEntity {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "process_definition_id")
	private UUID processDefinitionId;

	@Column(name = "process_definition_key")
	private String key;

	@Column(name = "created_by")
	private String createdBy;

	@Column(name = "process_definition_name")
	private String processDefinitionName;

	@Column(name = "updated_by")
	private String updatedBy;

	@Column(name = "start_task_key")
	private String startTaskKey;

	@Column(name = "workflow_structure")
	private String workflowStructure;

	@Column(name = "status")
	private String status;

	@Column(name = "user_name")
	private String userName;

	@Column(name = "workflow_version")
	private Long workflowVersion;

	@Column(name = "scheduler_expression")
	private String schedulerExpression;

	@Column(name = "start_type")
	private String startType;

	@Column(name = "upload_workflow")
	private String uploadWorkflow;

	@Column(name = "approve")
	private String approve;

	@Column(name = "install_workflow")
	private String install;

	// bi-directional many-to-one association to ProcessDefinitionTask
	@OneToMany(mappedBy = "processDefinition", cascade = CascadeType.ALL)
	private List<ProcessDefinitionTask> processDefinitionTasks;

	// bi-directional many-to-one association to ProcessInstance
	@OneToMany(mappedBy = "processDefinition")
	private List<ProcessInstance> processInstances;

	@OneToMany(mappedBy = "processDefinition", cascade = CascadeType.ALL)
	private List<ProcessDefPrmsn> processPermission;

	@OneToMany(mappedBy = "processDefinition")
	private List<EnvironmentVariable> environmentVariable;

	@Column(name = "tenant_id", length = 60)
	private String tenantId;

	@Column(name = "active_flag", length = 60)
	private String activeFlag;
	
	@Column(name = "workspace_id")
	private UUID workspaceId;

}