package com.yorosis.yoroapps.entities;

import java.sql.Timestamp;
import java.util.Set;
import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import org.hibernate.annotations.GenericGenerator;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode.Exclude;
import lombok.NoArgsConstructor;

@Table(name = "application")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Application {

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id", unique = true, nullable = false, precision = 19)
	private UUID id;

	@Column(name = "tenant_id", nullable = false, length = 60)
	private String tenantId;

	@Column(name = "app_name", nullable = false, length = 200)
	private String appName;

	@Column(name = "description", nullable = false, length = 200)
	private String description;

	@Column(name = "application_id", nullable = false, length = 100)
	private String applicationId;

	@Column(name = "app_prefix", nullable = false, length = 4)
	private String appPrefix;

	@Column(name = "timezone", nullable = true, length = 100)
	private String timezone;

	@Column(name = "default_language", nullable = false, length = 50)
	private String defaultLanguge;

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

	@Column(name = "left_menu_id")
	private UUID leftMenuId;

	@Column(name = "right_menu_id")
	private UUID rightMenuId;

	@Column(name = "top_menu_id")
	private UUID topMenuId;

	@Column(name = "bottom_menu_id")
	private UUID bottomMenuId;

	@Column(name = "managed_flag")
	private String managedFlag;
	
	@Column(name = "workspace_id")
	private UUID workspaceId;

	@Exclude
	@OneToMany(mappedBy = "application")
	private Set<ApplicationPermissions> applicationPermissions;

}
