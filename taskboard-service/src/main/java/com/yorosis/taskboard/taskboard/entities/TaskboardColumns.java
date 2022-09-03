// Generated with g9.

package com.yorosis.taskboard.taskboard.entities;

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
import lombok.EqualsAndHashCode.Exclude;
import lombok.NoArgsConstructor;

@Table(name = "taskboard_columns")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskboardColumns {

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id", unique = true, nullable = false, precision = 19)
	private UUID id;

	@Column(name = "column_name", nullable = false, length = 100)
	private String columnName;

	@Column(name = "column_order", nullable = false, precision = 10)
	private long columnOrder;

	@Column(name = "column_color", nullable = false, precision = 10)
	private String columnColor;

	@Column(name = "form_id", nullable = false, length = 100)
	private String formId;

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

	@Column(name = "layout_type")
	private String layoutType;

	@Column(name = "version", nullable = false, precision = 10)
	private long version;

	@Column(name = "is_column_background")
	private String isColumnBackground;
	
	@Column(name = "is_done_column")
	private String isDoneColumn;

	@Exclude
	@OneToMany(mappedBy = "taskboardColumns", cascade = CascadeType.ALL)
	private List<TaskboardColumnsSecurity> taskboardColumnsSecurity;

	@Exclude
	@OneToMany(mappedBy = "taskboardColumnId", cascade = CascadeType.ALL)
	private List<TaskboardSubStatus> taskboardSubStatus;

	@Exclude
	@ManyToOne(optional = false)
	@JoinColumn(name = "taskboard_id", nullable = false)
	private Taskboard taskboard;

}
