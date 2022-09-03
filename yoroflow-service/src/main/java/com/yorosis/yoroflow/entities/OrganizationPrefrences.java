package com.yorosis.yoroflow.entities;

import java.sql.Timestamp;
import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Table(name = "organization_preferences")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrganizationPrefrences {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", unique = true, nullable = false, precision = 19)
	private UUID id;

	@Column(name = "default_page_size", nullable = false)
	private long defaultPageSize;

	@Column(name = "pending_task_color", nullable = false, length = 100)
	private String pendingTaskColor;

	@Column(name = "error_task_color", nullable = false, length = 100)
	private String errorTaskColor;

	@Column(name = "approve_task_color", nullable = false, length = 100)
	private String approveTaskColor;

	@Column(name = "completed_task_color", nullable = false, length = 100)
	private String completedTaskColor;

	@Column(name = "draft_task_color", nullable = false, length = 100)
	private String draftTaskColor;

	@Column(name = "tenant_id", nullable = false, length = 60)
	private String tenantId;

	@Column(name = "reject_task_color", nullable = false, length = 100)
	private String rejectTaskColor;

	@Column(name = "created_by", nullable = false, length = 100)
	private String createdBy;

	@Column(name = "created_on", nullable = false)
	private Timestamp createdOn;

	@Column(name = "modified_by", nullable = false, length = 100)
	private String modifiedBy;

	@Column(name = "modified_on", nullable = false)
	private Timestamp modifiedOn;

	@Column(name = "active_flag", nullable = false, length = 1)
	private String activeFlag;
}
