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

@Table(name = "taskboard_sprint_tasks")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskboardSprintTask {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "sprint_task_id", unique = true, nullable = false, precision = 19)
	private UUID sprintTaskId;
	
	@Column(name = "sprint_estimated_points")
	private Integer sprintEstimatedPoints;
	
	@Column(name = "sprint_estimated_hours")
	private Float sprintEstimatedHours;
	
	@Column(name = "sprint_total_hours_spent")
	private Float sprintTotalHoursSpent;

	@Column(name = "tenant_id", nullable = false, length = 60)
	private String tenantId;

	@Column(name = "created_by", nullable = false, length = 100)
	private String createdBy;

	@Column(name = "created_on", nullable = false)
	private Timestamp createdOn;

	@Column(name = "modified_by", length = 100)
	private String modifiedBy;

	@Column(name = "modified_on")
	private Timestamp modifiedOn;

	@Column(name = "active_flag", nullable = false, length = 1)
	private String activeFlag;

	@Exclude
	@ManyToOne(optional = false)
	@JoinColumn(name = "sprints_id", nullable = false)
	private TaskboardSprints taskboardSprint;

	@Exclude
	@ManyToOne(optional = false)
	@JoinColumn(name = "taskboard_task_id", nullable = false)
	private TaskboardTask taskboardTask;
}
