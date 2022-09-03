package com.yorosis.yoroapps.entities;

import java.sql.Timestamp;
import java.util.Set;
import java.util.UUID;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import org.hibernate.annotations.GenericGenerator;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString.Exclude;

@Table(name = "yoro_groups")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class YoroGroups {

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id",unique = true, nullable = false, precision = 19)
	private UUID id;

	@Column(name = "group_name", nullable = false, length = 100)
	private String groupName;

	@Column(nullable = false)
	private String description;

	@Column(name = "tenant_id", nullable = false, length = 60)
	private String tenantId;

	@Column(name = "active_flag", nullable = false, length = 1)
	private String activeFlag;

	@Column(name = "created_by", nullable = false, length = 100)
	private String createdBy;

	@Column(name = "created_on", nullable = false)
	private Timestamp createdOn;

	@Column(name = "modified_by", nullable = false, length = 100)
	private String modifiedBy;

	@Column(name = "modified_on", nullable = false)
	private Timestamp modifiedOn;

	@Column(name = "managed_flag")
	private String managedFlag;
	
	@Column(name="color")
	private String color;

	@Exclude
	@lombok.EqualsAndHashCode.Exclude
	@OneToMany(mappedBy = "yoroGroups")
	private Set<PagePermissions> pagePermissions;

	@Exclude
	@lombok.EqualsAndHashCode.Exclude
	@OneToMany(mappedBy = "yoroGroups")
	private Set<ApplicationPermissions> applicationPermissions;

	@Exclude
	@lombok.EqualsAndHashCode.Exclude
	@OneToMany(mappedBy = "yoroGroups")
	private Set<CustomPagePermissions> customPagePermissions;

	@Exclude
	@lombok.EqualsAndHashCode.Exclude
	@OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "yoroGroups")
	private Set<YoroGroupsUsers> groupUsers;
}
