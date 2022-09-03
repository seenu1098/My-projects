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

@Table(name = "yoro_workspace_security")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WorkspaceSecurity {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "workspace_security_id", unique = true, nullable = false, precision = 19)
	private UUID id;

	@Column(name = "active_flag", nullable = false, length = 1)
	private String activeFlag;

	@Column(name = "created_by", nullable = false, length = 100)
	private String createdBy;

	@Column(name = "created_on", nullable = false)
	private Timestamp createdOn;

	@Column(name = "modified_by", nullable = false, length = 100)
	private String modifiedBy;

	@Column(name = "modified_on", nullable = false)
	private Timestamp modifiedOn;

	@Column(name = "tenant_id", nullable = false, length = 60)
	private String tenantId;

	@ManyToOne(optional = true)
	@JoinColumn(name = "group_id")
	private Group yoroGroups;

	@ManyToOne(optional = false)
	@JoinColumn(name = "workspace_id", nullable = false)
	private Workspace workspace;

	@ManyToOne(optional = true)
	@JoinColumn(name = "owner_id")
	private User users;
}
