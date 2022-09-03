package com.yorosis.yoroflow.models;

import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;
import com.yorosis.yoroflow.models.sprint.SprintSettingsVo;
import com.yorosis.yoroflow.models.sprint.SprintsVO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskboardVO {
	private UUID id;
	private String name;
	private String description;
	private String generatedTaskId;
	private String taskName;
	private Boolean isColumnBackground;
	private List<TaskboardColumnsVO> taskboardColumns;
	private TaskboardTaskVO taskboardTask;
	private List<TaskboardTaskVO> taskboardTaskList;
	private TaskboardLabelsVO taskboardLabels;
	private List<String> removedColumnsIdList;
	private List<String> generatedTaskIdList;
	private Long parentTaskLength;
	private String taskboardKey;
	private ResolveSecurityForTaskboardVO taskboardSecurity;
	private Boolean isTaskBoardOwner;
	private List<TaskEntityVO> taskList;
	private List<TaskboardColumnMapVO> taskboardColumnMapVO;
	private String startColumn;
	private String formId;
	private Long version;
	private Boolean sprintEnabled;
	private List<SprintsVO> sprintsVoList;
	private SprintSettingsVo sprintSettingsVo;
	private String launchButtonName;
	private JsonNode fieldMapping;
	private Integer doneTaskLength;
}
