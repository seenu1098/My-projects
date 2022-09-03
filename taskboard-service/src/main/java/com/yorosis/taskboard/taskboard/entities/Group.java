package com.yorosis.taskboard.taskboard.entities;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

import javax.persistence.CascadeType;
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
import lombok.NoArgsConstructor;

@Table(name = "yoro_groups")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Group {

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id")
	private UUID groupId;

	@Column(name = "group_name")
	private String groupName;

	@Column(name = "description")
	private String groupDesc;

	@Column(name = "created_by")
	private String createdBy;

	@Column(name = "created_on")
	private Timestamp createdDate;

	@Column(name = "modified_by")
	private String updatedBy;

	@Column(name = "modified_on")
	private Timestamp updatedDate;

	@Column(name = "active_flag", nullable = false, length = 1)
	private String activeFlag;

	@Column(name = "tenant_id")
	private String tenantId;

	@Column(name = "managed_flag")
	private String managedFlag;

	@Column(name = "color")
	private String color;

	@OneToMany(mappedBy = "group", cascade = CascadeType.ALL)
	private List<UserGroup> userGroups;
}
