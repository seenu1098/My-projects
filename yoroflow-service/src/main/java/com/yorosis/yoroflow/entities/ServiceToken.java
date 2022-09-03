package com.yorosis.yoroflow.entities;

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

@Entity
@Table(name = "service_token")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceToken {

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id", unique = true, nullable = false, precision = 10)
	private UUID id;

	@Column(name = "api_name", unique = true, length = 100)
	private String apiName;

	@Column(name = "api_key", unique = true, length = 100)
	private String apiKey;

	@Column(name = "secret_key", length = 100)
	private String secretKey;

	@Column(name = "expires_on", length = 100)
	private Timestamp expiresOn;

	@Column(name = "created_by", nullable = false, length = 100)
	private String createdBy;

	@Column(name = "created_on", nullable = false)
	private Timestamp createdOn;

	@Column(name = "modified_by", nullable = false, length = 100)
	private String modifiedBy;

	@Column(name = "modified_on", nullable = false)
	private Timestamp modifiedOn;

	@Column(name = "active_flag", nullable = false, length = 1)
	private String activeFlag;

	@Column(name = "tenant_id", nullable = false, length = 60)
	private String tenantId;

	@Builder.Default
	@Column(name = "internal", nullable = false, length = 1)
	private String internal = "N";

	@ManyToOne
	@EqualsAndHashCode.Exclude
	@JoinColumn(name = "user_id", nullable = false)
	private User users;
}
