package com.yorosis.yoroapps.entities;

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

@Table(name = "user_permission")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserPermission {

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(unique = true, nullable = false, precision = 19)
	private UUID id;

	@Column(name = "page_id", length = 60)
	private String pageId;

	@Column(name = "page_name", length = 60)
	private String pageName;

	@Column(name = "workflow_key", length = 60)
	private String workflowKey;

	@Column(name = "workflow_name", length = 60)
	private String workflowName;

	@Column(name = "launch_allowed", length = 1)
	private String launchAllowed;

	@Column(name = "create_allowed", length = 1)
	private String createAllowed;

	@Column(name = "publish_allowed", length = 1)
	private String publishAllowed;

	@Column(name = "read_allowed", length = 1)
	private String readAllowed;

	@Column(name = "update_allowed", length = 1)
	private String updateAllowed;

	@Column(name = "delete_allowed", length = 1)
	private String deleteAllowed;

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

	@Column(name = "version")
	private Long version;

	@ManyToOne(optional = false)
	@JoinColumn(name = "service_token_id", nullable = false)
	private ServiceToken serviceToken;
}
