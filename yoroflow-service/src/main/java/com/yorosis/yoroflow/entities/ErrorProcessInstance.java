package com.yorosis.yoroflow.entities;

import java.sql.Timestamp;
import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Table(name = "process_instance_errors")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ErrorProcessInstance {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id")
	private UUID id;

	@Column(name = "process_definition_id", nullable = false)
	private UUID processDefId;

	@Column(name = "process_instance_id", nullable = false)
	private UUID processInstanceId;

	@Column(name = "process_instance_task_id", nullable = false)
	private UUID processInstanceTaskId;

	@Column(name = "error_description")
	private String errorDescription;

	@Column(name = "resolution_status")
	private String resolutionStatus;

	@Column(name = "tenant_id", nullable = false, length = 50)
	private String tenantId;

	@Column(name = "created_by", nullable = false, length = 50)
	private String createdBy;

	@CreationTimestamp
	@Column(name = "created_date", nullable = false)
	private Timestamp createdDate;

	@Column(name = "updated_by")
	private String updatedBy;

	@CreationTimestamp
	@Column(name = "updated_date")
	private Timestamp updatedDate;
}
