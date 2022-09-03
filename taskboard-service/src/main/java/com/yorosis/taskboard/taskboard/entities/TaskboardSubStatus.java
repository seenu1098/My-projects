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

@Table(name = "taskboard_sub_status")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskboardSubStatus {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id", unique = true, nullable = false, precision = 19)
	private UUID id;

	@Column(name = "sub_status_name", nullable = false)
	private String subStatusName;

	@Column(name = "sub_status_color", nullable = false)
	private String subStatusColor;

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

	@Column(name = "column_order")
	private Long columnOrder;

	@Exclude
	@ManyToOne(optional = false)
	@JoinColumn(name = "taskboard_column_id", nullable = false)
	private TaskboardColumns taskboardColumnId;
}
