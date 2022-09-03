package com.yorosis.yoroflow.models;

import java.sql.Timestamp;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;
import com.yorosis.yoroflow.models.sprint.SprintsVO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskboardTaskVO {
	private UUID id;
	private UUID taskboardId;
	private String taskBoardName;
	private String taskType;
	private String taskName;
	private Timestamp startDate;
	private Timestamp dueDate;
	private String status;
	private UUID parentTaskId;
	private JsonNode taskData;
	private List<LabelVO> labels;
	private List<SubTaskVO> subTasks;
	private String createdBy;
	private Timestamp createdOn;
	private String modifiedBy;
	private Timestamp modifiedOn;
	private List<String> removedSubtasks;
	private List<TaskCommentsVO> taskComments;
	private AssignTaskVO assignTaskVO;
	private String taskId;
	private String description;
	private List<FilesVO> files;
	private int subTaskLength;
	private int filesList;
	private int commentsLength;
	private Long sequenceNo;
	private String subStatus;
	private String automationType;
	private String loggedInUserName;
	private String previousStatus;
	private String priority;
	private TaskDependenciesVO taskDependenciesVO;
	private UUID dependencyId;
	private Float estimateHours;
	private Integer originalPoints;
	private Float remainingHours;
	private UUID sprintTaskId;
	private SprintsVO sprintsVo;
	private String username;
	private String workspaceKey;


	public static final Comparator<TaskboardTaskVO> DisplayOrderComparator = new Comparator<TaskboardTaskVO>() {

		public int compare(TaskboardTaskVO s1, TaskboardTaskVO s2) {
			if (s1.getSequenceNo() != null && s2.getSequenceNo() != null) {
				int displayOrder1 = s1.getSequenceNo().intValue();
				int displayOrder2 = s2.getSequenceNo().intValue();
				return displayOrder1 - displayOrder2;
			}
			return 0;
		}
	};
}
