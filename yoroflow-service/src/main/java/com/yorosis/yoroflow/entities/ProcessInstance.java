package com.yorosis.yoroflow.entities;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.NamedQuery;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import org.hibernate.annotations.GenericGenerator;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * The persistent class for the process_instance database table.
 * 
 */
@Entity
@Table(name = "process_instance")
@NamedQuery(name = "ProcessInstance.findAll", query = "SELECT p FROM ProcessInstance p")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessInstance extends BaseEntity {

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "process_instance_id")
	private UUID processInstanceId;

	@Column(name = "completed_by")
	private String completedBy;

	@Column(name = "created_by")
	private String createdBy;

	@Column(name = "created_date")
	private LocalDateTime createdDate;

	@Column(name = "end_time")
	private LocalDateTime endTime;

	@Column(name = "start_time")
	private LocalDateTime startTime;

	@Column(name = "started_by")
	private String startedBy;

	@Column(name = "status")
	private String status;

	@Column(name = "updated_by")
	private String updatedBy;

	@Column(name = "updated_date")
	private LocalDateTime updatedDate;

	@Column(name = "tenant_id", length = 60)
	private String tenantId;

	// bi-directional many-to-one association to ProcessDefinitionTask
	@ManyToOne
	@JoinColumn(name = "end_task")
	private ProcessDefinitionTask endTask;

	// bi-directional many-to-one association to ProcessDefinitionTask
	@ManyToOne
	@JoinColumn(name = "start_task")
	private ProcessDefinitionTask startTask;

	@Column(name = "initiated_by_task_id")
	private UUID initiatedProcessInstanceID;

	// bi-directional many-to-one association to ProcessDefinition
	@ManyToOne
	@JoinColumn(name = "process_definition_id")
	private ProcessDefinition processDefinition;

	// bi-directional many-to-one association to ProcessInstanceTask
	@OneToMany(mappedBy = "processInstance", cascade = { CascadeType.ALL })
	private List<ProcessInstanceTask> processInstanceTasks;

}