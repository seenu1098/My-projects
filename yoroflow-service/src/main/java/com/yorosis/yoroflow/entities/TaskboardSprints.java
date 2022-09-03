package com.yorosis.yoroflow.entities;

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

@Table(name = "taskboard_sprints")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskboardSprints {

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "sprints_id", unique = true, nullable = false, precision = 19)
	private UUID sprintId;

	@Column(name = "sprint_name", nullable = false, length = 60)
	private String sprintName;

	@Column(name = "sprint_seq_number")
	private Integer sprintSeqNumber;
	
	@Column(name = "sprint_status")
	private String sprintStatus;

	@Column(name = "sprint_total_original_points")
	private Integer sprintTotalOriginalPoints;
	
	@Column(name = "sprint_total_estimated_hours")
	private Double sprintTotalEstimatedHours;
	
	@Column(name = "sprint_total_worked_hours")
	private Double sprintTotalWorkedHours;

	@Column(name = "sprint_start_date", nullable = false)
	private Timestamp sprintStartDate;

	@Column(name = "sprint_end_date", nullable = false)
	private Timestamp sprintEndDate;

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
	@JoinColumn(name = "sprint_settings_id", nullable = false)
	private TaskboardSprintSettings taskboardSprintSettings;
}
