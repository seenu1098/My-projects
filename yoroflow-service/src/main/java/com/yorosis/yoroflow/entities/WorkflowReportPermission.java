package com.yorosis.yoroflow.entities;

import java.time.LocalDateTime;
import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.UpdateTimestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Table(name = "workflow_report_permission")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WorkflowReportPermission {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id", unique = true, nullable = false, precision = 19)
	private UUID id;

	@Column(name = "group_id")
	private UUID groupId;

//	@Column(name = "report_id")
//	private UUID reportId;

	@Column(name = "tenant_id")
	private String tenantId;

	@Column(name = "active_flag")
	private String activeFlag;

	@Column(name = "created_by")
	private String createdBy;

	@Column(name = "modified_by", nullable = false, length = 100)
	private String modifiedBy;

	@CreationTimestamp
	@Column(name = "created_on")
	private LocalDateTime createdDate;

	@UpdateTimestamp
	@Column(name = "modified_on")
	private LocalDateTime updatedDate;

	@ManyToOne
	@JoinColumn(name = "report_id")
	private WorkflowReport workflowReport;
}
