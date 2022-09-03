package com.yorosis.taskboard.taskboard.entities;

import java.io.Serializable;
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
@Table(name = "roles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Role implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "role_id")
	private UUID roleId;

	@Column(name = "created_by")
	private String createdBy;

	@Column(name = "created_on", nullable = false)
	private Timestamp createdOn;

	@Column(name = "role_desc")
	private String roleDesc;

	@Column(name = "role_name")
	private String roleName;

	@Column(name = "modified_by", nullable = false, length = 100)
	private String modifiedBy;

	@Column(name = "modified_on", nullable = false)
	private Timestamp modifiedOn;

	@Column(name = "tenant_id", length = 60)
	private String tenantId;

	@Column(name = "active_flag", nullable = false, length = 1)
	private String activeFlag;

}