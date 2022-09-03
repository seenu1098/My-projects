package com.yorosis.taskboard.taskboard.entities;

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

@Table(name = "notifications")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Notifications {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id", unique = true, nullable = false, precision = 19)
	private UUID id;

	@Column(name = "from_id")
	private UUID fromId;

	@Column(name = "to_id")
	private UUID toId;
	
	@Column(name = "group_id")
	private UUID groupId;

	@Column(name = "task_id")
	private UUID taskId;

	@Column(name = "message")
	private String message;

	@Column(name = "read_time")
	private Timestamp readTime;

	@Column(name = "created_by", nullable = false, length = 100)
	private String createdBy;

	@Column(name = "created_on", nullable = false)
	private Timestamp createdOn;

	@Column(name = "modified_by", nullable = false, length = 100)
	private String modifiedBy;

	@Column(name = "modified_on", nullable = false)
	private Timestamp modifiedOn;

	@Column(name = "tenant_id")
	private String tenantId;
	
	@Column(name = "type")
	private String type;
	
	@Column(name = "taskboard_id")
	private UUID taskboardId;
	
	@Column(name = "taskboard_task_id")
	private UUID taskboardTaskId;
}
