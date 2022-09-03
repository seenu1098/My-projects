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

@Table(name = "taskboard_sprint_settings")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskboardSprintSettings {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "sprint_settings_id", unique = true, nullable = false, precision = 19)
	private UUID sprintSettingId;

	@Column(name = "sprint_start_day", length = 100)
	private String sprintStartDay;

	@Column(name = "sprint_estimations", nullable = false, length = 60)
	private String sprintEstimations;

	@Column(name = "sprint_duration", nullable = false, length = 100)
	private Integer sprintDuration;
	
	@Column(name = "sprint_duration_type", nullable = false, length = 100)
	private String sprintDurationType;

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
	@JoinColumn(name = "taskboard_id", nullable = false)
	private Taskboard taskboard;
}
