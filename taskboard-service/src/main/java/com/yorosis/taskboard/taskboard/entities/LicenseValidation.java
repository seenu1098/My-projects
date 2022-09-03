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

@Table(name = "license_validation")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LicenseValidation {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id", unique = true, nullable = false, precision = 19)
	private UUID id;

	@Column(name = "plan_name")
	private String planName;

	@Column(name = "feature_name")
	private String featureName;

	@Column(name = "is_allowed")
	private String isAllowed;

	@Column(name = "allowed_limit")
	private Long allowedLimit;

	@Column(name = "category")
	private String category;

	@Column(name = "tenant_id")
	private String tenantId;

	@Column(name = "created_by")
	private String createdBy;

	@Column(name = "created_on")
	private Timestamp createdOn;

	@Column(name = "modified_by")
	private String modifiedBy;

	@Column(name = "modified_on")
	private Timestamp modifiedOn;

	@Column(name = "active_flag")
	private String activeFlag;
}
