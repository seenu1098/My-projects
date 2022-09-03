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
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Table(name = "application_permissions")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApplicationPermissions {

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(unique = true, nullable = false, precision = 19)
	private UUID id;

	@Column(name = "active_flag", nullable = false, length = 1)
	private String activeFlag;

	@Column(name = "create_allowed", nullable = false, length = 1)
	private String createAllowed;

	@Column(name = "created_by", nullable = false, length = 100)
	private String createdBy;

	@Column(name = "created_on", nullable = false)
	private Timestamp createdOn;

	@Column(name = "delete_allowed", nullable = false, length = 1)
	private String deleteAllowed;

	@Column(name = "modified_by", nullable = false, length = 100)
	private String modifiedBy;

	@Column(name = "modified_on", nullable = false)
	private Timestamp modifiedOn;

	@Column(name = "read_allowed", nullable = false, length = 1)
	private String readAllowed;

	@Column(name = "tenant_id", nullable = false, length = 60)
	private String tenantId;

	@Column(name = "update_allowed", nullable = false, length = 1)
	private String updateAllowed;

	@Column(name = "edit_allowed", nullable = false, length = 1)
	private String editAllowed;

	@Column(name = "launch_allowed", nullable = false, length = 1)
	private String launchAllowed;

	@ManyToOne(optional = false)
	@JoinColumn(name = "group_id", nullable = false)
	private YoroGroups yoroGroups;

	@EqualsAndHashCode.Exclude
	@ManyToOne(optional = false)
	@JoinColumn(name = "application_id", nullable = false)
	private Application application;

}
