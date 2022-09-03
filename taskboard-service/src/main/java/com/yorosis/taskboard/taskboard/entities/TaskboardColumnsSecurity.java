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

@Table(name = "taskboard_columns_security")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskboardColumnsSecurity {

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id", unique = true, nullable = false, precision = 19)
	private UUID id;

	@Column(name = "group_id")
	private UUID groupId;

	@Column(name = "user_id")
	private UUID userId;

	@Column(nullable = false, length = 1)
	private String read;

	@Column(nullable = false, length = 1)
	private String update;

	@Column(nullable = false, length = 1)
	private String delete;

	@Column(nullable = false, length = 1)
	private String launch;

	@Column(name = "tenant_id", nullable = false, length = 60)
	private String tenantId;

	@Column(name = "created_by", nullable = false, length = 100)
	private String createdBy;

	@Column(name = "created_on", nullable = false)
	private Timestamp createdOn;

	@Column(name = "modified_by", length = 100)
	private String modifiedBy;

	@Column(name = "modified_on", nullable = false)
	private Timestamp modifiedOn;

	@Column(name = "active_flag", nullable = false, length = 1)
	private String activeFlag;

	@Exclude
	@ManyToOne(optional = false)
	@JoinColumn(name = "taskboard_column_id", nullable = false)
	private TaskboardColumns taskboardColumns;
}
