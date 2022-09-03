package com.yorosis.yoroapps.entities;

import java.sql.Timestamp;
import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

import org.hibernate.annotations.GenericGenerator;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Table(name = "activity_log")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ActivityLog {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "activity_log_id", unique = true, nullable = false, precision = 19)
	private UUID activityLogId;

	@Column(name = "parent_id", nullable = false)
	private UUID parentId;

	@Column(name = "child_id")
	private UUID childId;

	@Column(name = "activity_type", length = 50)
	private String activityType;

	@Column(name = "activity_data", length = 1000)
	private String activityData;

	@Column(name = "workspace_id")
	private UUID workspaceId;

	@Column(name = "activity_log_user_id")
	private UUID activityLogUserId;

	@Column(name = "tenant_id", nullable = false, length = 60)
	private String tenantId;

	@Column(name = "created_by", nullable = false, length = 100)
	private String createdBy;

	@Column(name = "created_on", nullable = false)
	private Timestamp createdOn;

	@Column(name = "active_flag", nullable = false, length = 1)
	private String activeFlag;
}
