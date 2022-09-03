package com.yorosis.yoroapps.entities;

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

@Table(name = "auth_two_factor_methods")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TwoFactorAuthMethods {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(unique = true, nullable = false, precision = 19)
	private UUID id;

	@Column(name = "method_name", nullable = false, length = 100)
	private String methodName;

	@Column(name = "active_flag", nullable = false, length = 1)
	private String activeFlag;

	@Column(name = "created_by", nullable = false, length = 100)
	private String createdBy;

	@Column(name = "created_on", nullable = false)
	private Timestamp createdOn;

	@Column(name = "updated_by", nullable = false, length = 100)
	private String updatedBy;

	@Column(name = "updated_on", nullable = false)
	private Timestamp updatedOn;

	@Column(name = "tenant_id", nullable = false, length = 60)
	private String tenantId;
}
