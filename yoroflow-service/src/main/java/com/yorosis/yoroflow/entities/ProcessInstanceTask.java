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
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Transient;

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;

import com.fasterxml.jackson.databind.JsonNode;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Table(name = "process_instance_tasks")
@Entity
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@TypeDef(name = "json", typeClass = JsonBinaryType.class)
@TypeDef(name = "jsonb", typeClass = JsonBinaryType.class)
public class ProcessInstanceTask extends BaseEntity {

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "process_instance_task_id")
	private UUID processInstanceTaskId;

	@Column(name = "assigned_to")
	private UUID assignedTo;

	@Column(name = "assigned_to_group")
	private UUID assignedToGroup;

	@Column(name = "referred_by")
	private UUID referredBy;

	@Column(name = "created_by")
	private String createdBy;

	@Column(name = "created_date")
	private LocalDateTime createdDate;

	@Column(name = "start_time")
	private LocalDateTime startTime;

	@Column(name = "end_time")
	private LocalDateTime endTime;

	@Column(name = "updated_by")
	private String updatedBy;

	@Column(name = "status")
	private String status;

	@Column(name = "description")
	private String description;

	@Column(name = "due_date")
	private LocalDateTime dueDate;

	@Column(name = "updated_date")
	private LocalDateTime updatedDate;

	@Column(name = "due_date_event_processed_on")
	private LocalDateTime dueDateEventProcessedOn;

	@Column(name = "task_completion_remainder")
	private LocalDateTime taskCompletionRemainderTime;

	@Column(name = "tenant_id", length = 60)
	private String tenantId;

	@Column(name = "data")
	@Type(type = "json")
	private JsonNode data;

	@Column(name = "task_data", columnDefinition = "jsonb")
	@Type(type = "jsonb")
	private JsonNode dataB;
	
	@Column(name = "sentback_comment", length = 500)
	private String sendBackComment;
	
	@Column(name = "approve_comment", length = 500)
	private String approveComment;
	
	@Column(name = "reject_comment", length = 500)
	private String rejectComment;

	@Column(name = "initiated_process_instance_id")
	private UUID initiatedProcessInstanceID;

	@Column(name = "initiated_process_instance_alias")
	private String initiatedProcessInstanceAlias;

	// bi-directional many-to-one association to ProcessInstance
	@ManyToOne
	@JoinColumn(name = "process_instance_id")
	private ProcessInstance processInstance;

	@ManyToOne
	@JoinColumn(name = "task_id")
	private ProcessDefinitionTask processDefinitionTask;

	@OneToMany(mappedBy = "processInstanceTask", cascade = { CascadeType.ALL })
	private List<ProcessInstanceTaskFile> listTaskFiles;

	@OneToMany(mappedBy = "processInstanceTask", cascade = { CascadeType.ALL })
	private List<ProcessInstanceTaskNotes> listTaskNotes;

	@Transient
	private String targetStepKey;

	@Column(name = "reminder_task")
	@Type(type = "json")
	private JsonNode remainderTask;

}