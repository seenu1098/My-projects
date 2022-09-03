package com.yorosis.yoroflow.entities;

import java.sql.Timestamp;
import java.util.List;
import java.util.Set;
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
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;

import com.fasterxml.jackson.databind.JsonNode;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.ToString.Exclude;
import lombok.NoArgsConstructor;

@Table(name = "taskboard_task")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@TypeDef(name = "jsonb", typeClass = JsonBinaryType.class)
public class TaskboardTask {

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id", unique = true, nullable = false, precision = 19)
	private UUID id;

	@Column(name = "start_date")
	private Timestamp startDate;

	@Column(name = "due_date")
	private Timestamp dueDate;

	@Column(name = "next_reminder_timestamp")
	private Timestamp nextReminderTimestamp;
	
	
	@Column(nullable = false, length = 100)
	private String status;

	@Column(name = "task_name")
	private String taskName;

	@Column(name = "task_type", nullable = false, length = 100)
	private String taskType;

	@Column(name = "parent_task_id")
	private UUID parentTaskId;

	@Column(name = "task_data")
	@Type(type = "jsonb")
	private JsonNode taskData;
	
	@Column(name = "launch_task_data")
	@Type(type = "jsonb")
	private JsonNode launchTaskData;

	@Column(name = "tenant_id", nullable = false, length = 60)
	private String tenantId;

	@Column(name = "task_id")
	private String taskId;
	
	@Column(name = "estimate_hours")
	private Float estimateHours;

	@Column(name = "original_points")
	private Integer originalPoints;

	@Column(name = "created_by", nullable = false, length = 100)
	private String createdBy;

	@Column(name = "created_on", nullable = false)
	private Timestamp createdOn;

	@Column(name = "modified_by", length = 100)
	private String modifiedBy;

	@Column(name = "modified_on", nullable = false)
	private Timestamp modifiedOn;

	@Column(name = "active_flag", nullable = false, length = 1)
	private String activeFlag;

	@Column(name = "description")
	private String description;

	@Column(name = "sequence_no")
	private Long sequenceNo;

	@Column(name = "sub_status")
	private String subStatus;

	@Column(name = "previous_status")
	private String previousStatus;

	@Column(name = "priority")
	private String priority;

	@Exclude
	@lombok.EqualsAndHashCode.Exclude
	@OneToMany(mappedBy = "taskboardTask", cascade = CascadeType.ALL)
	private Set<TaskboardTaskComments> taskboardTaskComments;

	@Exclude
	@lombok.EqualsAndHashCode.Exclude
	@OneToMany(mappedBy = "taskboardTask", cascade = CascadeType.ALL)
	private Set<TaskboardTaskAssignedUsers> taskboardTaskAssignedUsers;

	@Exclude
	@lombok.EqualsAndHashCode.Exclude
	@OneToMany(mappedBy = "taskboardTask", cascade = CascadeType.ALL)
	private Set<TaskboardTaskFiles> taskboardTaskFiles;

	@Exclude
	@lombok.EqualsAndHashCode.Exclude
	@OneToMany(mappedBy = "taskboardTask", cascade = CascadeType.ALL)
	private Set<TaskboardTaskLabels> taskboardTaskLabels;

	@Exclude
	@ManyToOne(optional = false)
	@JoinColumn(name = "taskboard_id", nullable = false)
	private Taskboard taskboard;

	@Exclude
	@lombok.EqualsAndHashCode.Exclude
	@OneToMany(mappedBy = "taskboardTask", cascade = CascadeType.ALL)
	private List<TaskboardTaskDependencies> taskboardTaskDependencies;
}
