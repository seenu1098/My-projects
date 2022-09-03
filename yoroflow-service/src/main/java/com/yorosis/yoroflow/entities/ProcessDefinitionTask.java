package com.yorosis.yoroflow.entities;

import java.util.List;
import java.util.UUID;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import org.hibernate.annotations.GenericGenerator;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * The persistent class for the process_definition_tasks database table.
 * 
 */
@Entity
@Table(name = "process_definition_tasks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = { "processDefinition", "taskProperties" })
@ToString(exclude = { "processDefinition", "taskProperties" })
public class ProcessDefinitionTask extends BaseEntity {

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "task_id")
	private UUID taskId;

	@Column(name = "assigned_to")
	private String assignedTo;

	@Column(name = "assigned_to_type")
	private String assignedToType;

	@Column(name = "form_id")
	private String formId;

	@Column(name = "parent_step_key")
	private String parentStepKey;

	@Column(name = "status")
	private String status;

	@Column(name = "task_step_key")
	private String taskStepKey;

	@Column(name = "target_step_key")
	private String targetStepKey;

	@Column(name = "task_name")
	private String taskName;

	@Column(name = "task_type")
	private String taskType;

	@Column(name = "tenant_id", length = 60)
	private String tenantId;

	@Column(name = "scheduler_expression")
	private String schedulerExpression;

	// bi-directional many-to-one association to ProcessDefinition
	@ManyToOne
	@JoinColumn(name = "process_definition_id")
	private ProcessDefinition processDefinition;

	// bi-directional many-to-one association to TaskProperty
	@OneToMany(mappedBy = "processDefinitionTask", cascade = CascadeType.ALL)
	private List<ProcessDefTaskProperty> taskProperties;

	@OneToMany(mappedBy = "processDefinitionTask", cascade = { CascadeType.ALL })
	private List<ProcessDefTaskPrmsn> listProcessDefTaskPrms;

}