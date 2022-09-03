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

import org.apache.commons.lang3.builder.ToStringExclude;
import org.hibernate.annotations.GenericGenerator;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString.Exclude;

@Table(name = "yoro_groups_user")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserGroup {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id")
	private UUID userGroupId;

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

	@ToStringExclude
	@Exclude
	@ManyToOne
	@JoinColumn(name = "group_id")
	private Group group;

	@ToStringExclude
	@Exclude
	@ManyToOne
	@JoinColumn(name = "user_id")
	private User user;
}
