package com.yorosis.taskboard.taskboard.entities;

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
import lombok.EqualsAndHashCode.Exclude;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "taskboard_apps_config")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskboardApplicationConfig {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id")
	private UUID id;

	@Column(name = "taskboard_id")
	private UUID taskboardId;

	@Column(name = "tenant_id", nullable = false)
	private String tenantId;

	@Column(name = "created_by", nullable = false)
	private String createdBy;

	@Column(name = "created_on", nullable = false)
	private Timestamp createdOn;

	@Column(name = "modified_by")
	private String modifiedBy;

	@Column(name = "modified_on", nullable = false)
	private Timestamp modifiedOn;

	@Column(name = "active_flag", nullable = false)
	private String activeFlag;

	@Column(name = "auth_type")
	private String authType;

	@Column(name = "auth_token")
	private String authToken;

	@Column(name = "api_key")
	private String apiKey;

	@Column(name = "api_secret")
	private String apiSecret;

	@Column(name = "client_id")
	private String clientId;

	@Column(name = "client_secret")
	private String clientSecret;

	@Column(name = "access_token")
	private String accessToken;

	@Column(name = "refresh_token")
	private String refreshToken;

	@Column(name = "expire_at")
	private Timestamp expireAt;

	@Column(name = "authorization_code")
	private String authorizationCode;

	@Column(name = "allowed_scopes_csv")
	private String allowedScopesCsv;

	@Exclude
	@ManyToOne(optional = true)
	@JoinColumn(name = "taskboard_apps_id")
	private TaskboardApplication taskboardApplication;

	@Exclude
	@ManyToOne(optional = false)
	@JoinColumn(name = "org_integrated_apps_id", nullable = false)
	private OrganizationIntegratedApps organizationIntegratedApps;
}
