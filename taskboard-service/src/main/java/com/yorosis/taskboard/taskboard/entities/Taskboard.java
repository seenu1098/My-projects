package com.yorosis.taskboard.taskboard.entities;

import java.sql.Timestamp;
import java.util.Comparator;
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
import org.hibernate.annotations.Type;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString.Exclude;

@Table(name = "taskboard")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Taskboard {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id", unique = true, nullable = false, precision = 19)
	private UUID id;

	@Column(nullable = false, length = 100)
	private String name;

	@Column(name = "description")
	private String description;

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

	@Column(name = "generated_task_id")
	private String generatedTaskId;

	@Column(name = "task_name")
	private String taskName;

	@Column(name = "taskboard_key")
	private String taskboardKey;

	@Column(name = "is_column_background")
	private String isColumnBackground;

	@Column(name = "workspace_id")
	private UUID workspaceId;

	@Column(name = "sprint_enabled")
	private String sprintEnabled;

	@Column(name = "launch_button_name")
	private String launchButtonName;
	
	@Column(name = "initial_map_data")
	@Type(type = "jsonb")
	private JsonNode initialMapData;

	@Exclude
	@lombok.EqualsAndHashCode.Exclude
	@OneToMany(mappedBy = "taskboard", cascade = CascadeType.ALL)
	private List<TaskboardColumns> taskboardColumns;

	@Exclude
	@lombok.EqualsAndHashCode.Exclude
	@OneToMany(mappedBy = "taskboard", cascade = CascadeType.ALL)
	private List<TaskboardTask> taskboardTask;

	@Exclude
	@lombok.EqualsAndHashCode.Exclude
	@OneToMany(mappedBy = "taskboard", cascade = CascadeType.ALL)
	private List<TaskboardSecurity> taskboardSecurity;

	@Exclude
	@lombok.EqualsAndHashCode.Exclude
	@OneToMany(mappedBy = "taskboard", cascade = CascadeType.ALL)
	private List<TaskboardLabels> taskboardLabels;

	@Exclude
	@lombok.EqualsAndHashCode.Exclude
	@OneToMany(mappedBy = "taskboard", cascade = CascadeType.ALL)
	private List<TaskboardApplication> appConfig;

	public static final Comparator<TaskboardColumns> DisplayOrderComparator = new Comparator<TaskboardColumns>() {
		@Override
		public int compare(TaskboardColumns o1, TaskboardColumns o2) {
			int displayOrder1 = (int) o1.getColumnOrder();
			int displayOrder2 = (int) o2.getColumnOrder();
			return displayOrder1 - displayOrder2;
		}
	};
}
