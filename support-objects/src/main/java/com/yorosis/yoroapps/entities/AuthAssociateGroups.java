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

@Table(name = "org_auth_associate_group")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthAssociateGroups {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "associate_id", unique = true, nullable = false, precision = 19)
	private UUID id;
	
	@Column(name = "group_id", nullable = false, precision = 19)
	private UUID groupId;

	@Column(name = "tenant_id", nullable = false, length = 60)
	private String tenantId;

	@Column(name = "created_by", nullable = false, length = 100)
	private String createdBy;

	@Column(name = "created_on", nullable = false)
	private Timestamp createdOn;

	@Column(name = "modified_by", length = 100)
	private String modifiedBy;

	@Column(name = "modified_on")
	private Timestamp modifiedOn;

	@Column(name = "active_flag", nullable = false, length = 1)
	private String activeFlag;
	
	@ManyToOne
	@JoinColumn(name = "id", nullable = false)
	private AuthMethods authMethods;
}
