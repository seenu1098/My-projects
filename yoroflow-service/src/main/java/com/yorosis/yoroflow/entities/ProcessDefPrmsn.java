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

import org.hibernate.annotations.GenericGenerator;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * The persistent class for the process_definition_tasks database table.
 * 
 */
@Entity
@Table(name = "process_definition_permission")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessDefPrmsn extends BaseEntity {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "process_def_prmsn_id")
	private UUID processDefPrmsnId;

	@Column(name = "group_id")
	private UUID groupId;

	@Column(name = "update_allowed")
	private String updateAllowed;

	@Column(name = "read_allowed")
	private String readAllowed;

	@Column(name = "launch_allowed")
	private String launchAllowed;

	@Column(name = "publish_allowed")
	private String publishAllowed;

	@Column(name = "tenant_id", length = 60)
	private String tenantId;

	@Column(name = "created_date")
	private LocalDateTime createdDate;

	@Column(name = "updated_date")
	private LocalDateTime updatedDate;

	@Column(name = "updated_by")
	private String updatedBy;

	@Column(name = "created_by")
	private String createdBy;

	@Column(name = "active_flag", nullable = false, length = 1)
	private String activeFlag;
	// bi-directional many-to-one association to ProcessDefinition
	@ManyToOne
	@JoinColumn(name = "process_definition_id")
	private ProcessDefinition processDefinition;

}