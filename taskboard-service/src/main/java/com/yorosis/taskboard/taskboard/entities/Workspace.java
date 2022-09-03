package com.yorosis.taskboard.taskboard.entities;

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

@Table(name = "yoro_workspace")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Workspace {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "workspace_id", unique = true, nullable = false, precision = 19)
	private UUID id;
	
	@Column(name = "workspace_name", nullable = false, length = 100)
	private String workspaceName;
	
	@Column(name = "workspace_key", nullable = false, length = 100)
	private String workspaceKey;
	
	@Column(name = "workspace_unique_key")
	private String workspaceUniqueId;
	
	@Column(name = "secured_workspace_flag", nullable = false, length = 1)
	private String securedWorkspaceFlag;
	
	@Column(name = "workspace_avatar", length = 100)
	private String workspaceAvatar;

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
	
	@Column(name = "default_workspace", length = 1)
	private String defaultWorkspace;
	
	@Column(name = "archive_workspace", length = 1)
	private String archiveWorkspace;
	
	@Column(name = "managed_workspace", length = 1)
	private String managedWorkspace;
}

