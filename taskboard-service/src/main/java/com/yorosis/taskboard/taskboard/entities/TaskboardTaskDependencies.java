package com.yorosis.taskboard.taskboard.entities;

import java.sql.Timestamp;
import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.hibernate.annotations.GenericGenerator;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString.Exclude;

@Table(name = "taskboard_task_dependencies")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskboardTaskDependencies {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id", unique = true, nullable = false, precision = 19)
	private UUID id;

	@Column(name = "tenant_id", nullable = false)
	private String tenantId;

	@Column(name = "created_by", nullable = false)
	private String createdBy;

	@Column(name = "created_on", nullable = false)
	private Timestamp createdOn;

	@Column(name = "modified_by")
	private String modifiedBy;

	@Column(name = "modified_on", nullable = false)
	private Timestamp modifiedOn;

	@Column(name = "active_flag", nullable = false)
	private String activeFlag;

	@Exclude
	@ManyToOne(optional = false)
	@JoinColumn(name = "taskboard_task_id", nullable = false)
	private TaskboardTask taskboardTask;

	@Exclude
	@ManyToOne(optional = true)
	@JoinColumn(name = "waiting_on")
	private TaskboardTask waitingOn;

	@Exclude
	@ManyToOne(optional = true)
	@JoinColumn(name = "blocking")
	private TaskboardTask blocking;

	@Exclude
	@ManyToOne(optional = true)
	@JoinColumn(name = "related_tasks")
	private TaskboardTask relatedTask;
}
