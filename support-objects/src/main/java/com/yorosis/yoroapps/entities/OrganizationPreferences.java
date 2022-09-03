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

@Entity
@Table(name = "organization_preferences")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationPreferences {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id")
	private UUID id;
	
	@Column(name = "default_page_size")
	private Integer defaultPageSize;
	
	@Column(name = "pending_task_color")
	private String pendingTaskColor;

	@Column(name = "completed_task_color")
	private String completedTaskColor;
	
	@Column(name = "error_task_color")
	private String errorTaskColor;
	
	@Column(name = "draft_task_color")
	private String draftTaskColor;

	@Column(name = "approve_task_color")
	private String approvedTaskColor;
	
	@Column(name = "reject_task_color")
	private String rejectTaskColor;

	@Column(name = "tenant_id")
	private String tenantId;
	
	@Column(name = "active_flag")
	private String activeFlag;

	@Column(name = "created_by")
	private String createdBy;

	@Column(name = "created_on")
	private Timestamp createdDate;

	@Column(name = "modified_by", length = 100)
	private String modifiedBy;

	@Column(name = "modified_on")
	private Timestamp modifiedOn;
}
