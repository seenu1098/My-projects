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

@Table(name = "org_azure_config")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrganizationAzureConfig {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "azure_config_id", unique = true, nullable = false, precision = 19)
	private UUID id;

	@Column(name = "azure_client_id", nullable = false, length = 60)
	private String azureClientId;

	@Column(name = "azure_secret_id", nullable = false, length = 60)
	private String azureSecretId;

	@Column(name = "azure_tenant_id", nullable = true, length = 60)
	private String azureTenantId;

	@Column(name = "azure_allowed_group", nullable = true, length = 300)
	private String azureAllowedGroup;

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
	@JoinColumn(name = "auth_method_id", nullable = false)
	private AuthMethods authMethods;
}
