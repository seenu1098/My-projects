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

@Table(name = "user_otp_recovery_codes")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserOTPRecoveryCodes {

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(unique = true, nullable = false, precision = 19)
	private UUID id;
	
	@Column(name = "user_id")
	private UUID userId;

	@Column(name = "recovery_code", nullable = false, length = 60)
	private String recoveryCodes;
	
	@Column(name = "active_flag", nullable = false, length = 1)
	private String activeFlag;

	@Column(name = "created_by", nullable = false, length = 100)
	private String createdBy;

	@Column(name = "created_on", nullable = false)
	private Timestamp createdOn;
	
	@Column(name = "tenant_id", nullable = false, length = 60)
	private String tenantId;
}
