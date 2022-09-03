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

@Entity
@Table(name = "organization")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Organization {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id", unique = true, nullable = false, precision = 19)
	private UUID id;

	@Column(name = "org_name", nullable = false, length = 200)
	private String orgName;

	@Column(name = "allowed_domain_names", nullable = false, length = 300)
	private String allowedDomainNames;

	@Column(name = "subdomain_name", nullable = false, length = 100)
	private String subdomainName;

	// This would be the schema name as well
	@Column(name = "tenant_id", nullable = false, length = 60)
	private String tenantId;

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

	@Column(name = "theme_id")
	private String themeId;

	@Column(name = "logo")
	private String logo;

	@Column(name = "organization_url")
	private String organizationUrl;

	@Column(name = "background_image")
	private String backgroundImage;
	
	@Column(name = "enable_two_factor")
	private String enableTwofactor;

}
