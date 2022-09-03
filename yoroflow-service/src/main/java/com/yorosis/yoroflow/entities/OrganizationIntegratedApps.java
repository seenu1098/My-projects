package com.yorosis.yoroflow.entities;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import org.hibernate.annotations.GenericGenerator;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString.Exclude;

@Entity
@Table(name = "org_integrated_apps")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationIntegratedApps {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id")
	private UUID id;

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

	@Column(name = "app_name", nullable = false)
	private String appName;
	
	@Column(name="is_removed")
	private String isRemoved;

	@Column(name = "issuer")
	private String issuer;

	@Column(name = "authorization_endpoint")
	private String authorizationEndpoint;

	@Column(name = "redirect_url")
	private String redirectUrl;

	@Column(name = "token_endpoint")
	private String tokenEndpoint;

	@Column(name = "userinfo_endpoint")
	private String userInfoEndpoint;

	@Column(name = "client_id")
	private String clientId;

	@Column(name = "client_secret")
	private String clientSecret;

	@Column(name = "scopes_csv")
	private String scopesCsv;
	
	@Column(name="description")
	private String description;

	@Exclude
	@lombok.EqualsAndHashCode.Exclude
	@OneToMany(mappedBy = "organizationIntegratedApps", cascade = CascadeType.ALL)
	private List<OrganizationIntegratedAppsConfig> organizationIntegratedAppsConfig;
	
	@Exclude
	@lombok.EqualsAndHashCode.Exclude
	@OneToMany(mappedBy = "organizationIntegratedApps", cascade = CascadeType.ALL)
	private List<TaskboardApplicationConfig> taskboardApplicationConfigs;

}
