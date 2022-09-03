package com.yorosis.taskboard.services;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yorosis.taskboard.models.AssignUserTaskVO;
import com.yorosis.taskboard.models.TaskboardTaskLabelVO;
import com.yorosis.taskboard.models.TaskboardTaskVO;
import com.yorosis.taskboard.models.activity.ActivityLogVo;
import com.yorosis.taskboard.models.activity.TaskboardActivityLogVo;
import com.yorosis.taskboard.repository.ActivityLogRepository;
import com.yorosis.taskboard.repository.TaskboardTaskLabelsRepository;
import com.yorosis.taskboard.repository.UsersRepository;
import com.yorosis.taskboard.taskboard.entities.ActivityLog;
import com.yorosis.taskboard.taskboard.entities.Taskboard;
import com.yorosis.taskboard.taskboard.entities.TaskboardTask;
import com.yorosis.taskboard.taskboard.entities.TaskboardTaskAssignedUsers;
import com.yorosis.taskboard.taskboard.entities.TaskboardTaskLabels;
import com.yorosis.taskboard.taskboard.entities.User;
import com.yorosis.yoroapps.automation.ActivityLogInfo;
import com.yorosis.yoroapps.grid.vo.PaginationVO;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class ActivityLogService {

	private static final String ACTIVITY_LABEL_ADDED = "tb_label_add";
	private static final String ACTIVITY_LABEL_REMOVED = "tb_label_remove";
	private static final String ACTIVITY_CREATE_TASK = "tb_create_task";
	private static final String ACTIVITY_ADDED_COMMENT = "tb_comment";
	private static final String ACTIVITY_ADD_DUE_DATE = "tb_added_due_date";
	private static final String ACTIVITY_ADD_START_DATE = "tb_added_start_date";
	private static final String ACTIVITY_ADDED_ASSIGNEE = "tb_added_assignee";
	private static final String ACTIVITY_REMOVED_ASSIGNEE = "tb_removed_assignee";
	private static final String ACTIVITY_UPDATED_TASK = "tb_updated_task";
	private static final String ACTIVITY_ADDED_PRIORITY = "tb_added_priority";
	private static final String ACTIVITY_CHANGED_STATUS = "tb_changed_status";
	private static final String ACTIVITY_CHANGED_SUB_STATUS = "tb_changed_sub_status";
	private static final String ACTIVITY_ADDED_DESCRIPTION = "tb_added_description";
	private static final String ACTIVITY_ADDED_SUB_TASK = "tb_added_sub_task";
	private static final String ACTIVITY_REMOVED_SUB_TASK = "tb_removed_sub_task";
	private static final String ACTIVITY_CHANGED_SUB_TASK_STATUS = "tb_changed_sub_task_status";
	private static final String ACTIVITY_ADDED_ATTACHMENT = "tb_added_attachment";
	private static final String ACTIVITY_ADDED_WAITING_ON = "tb_added_waiting_on";
	private static final String ACTIVITY_ADDED_BLOCKING = "tb_added_blocking";
	private static final String ACTIVITY_ADDED_RELATED_TASK = "tb_added_related_task";

	private static final String CREATE_TASK = "createTask";
	private static final String ADDED_COMMENT = "addedComment";
	private static final String ADD_DUE_DATE = "addedDueDate";
	private static final String ADD_START_DATE = "addedStartDate";
	private static final String ADDED_ASSIGNEE = "addedAssignUser";
	private static final String REMOVED_ASSIGNEE = "removeAssignUser";
	private static final String UPDATED_TASK = "updateTask";
	private static final String ADDED_PRIORITY = "addedPriority";
	private static final String CHANGED_STATUS = "changedStatus";
	private static final String CHANGED_SUB_STATUS = "changedSubStatus";
	private static final String ADDED_DESCRIPTION = "addedDescription";
	private static final String ADDED_SUB_TASK = "addedSubTask";
	private static final String ADDED_ATTACHMENT = "addedAttachment";

	private static final Map<String, String> mapActivityLog = populateActivityLogMap();

	private static HashMap<String, String> populateActivityLogMap() {
		HashMap<String, String> activityLogMap = new HashMap<>();
		activityLogMap.put(CREATE_TASK, ACTIVITY_CREATE_TASK);
		activityLogMap.put(ADDED_COMMENT, ACTIVITY_ADDED_COMMENT);
		activityLogMap.put(ADD_DUE_DATE, ACTIVITY_ADD_DUE_DATE);
		activityLogMap.put(ADD_START_DATE, ACTIVITY_ADD_START_DATE);
		activityLogMap.put(REMOVED_ASSIGNEE, ACTIVITY_REMOVED_ASSIGNEE);
		activityLogMap.put(ADDED_ASSIGNEE, ACTIVITY_ADDED_ASSIGNEE);
		activityLogMap.put(UPDATED_TASK, ACTIVITY_UPDATED_TASK);
		activityLogMap.put(ADDED_PRIORITY, ACTIVITY_ADDED_PRIORITY);
		activityLogMap.put(CHANGED_STATUS, ACTIVITY_CHANGED_STATUS);
		activityLogMap.put(CHANGED_SUB_STATUS, ACTIVITY_CHANGED_SUB_STATUS);
		activityLogMap.put(ADDED_DESCRIPTION, ACTIVITY_ADDED_DESCRIPTION);
		activityLogMap.put(ADDED_SUB_TASK, ACTIVITY_ADDED_SUB_TASK);
		activityLogMap.put("removedSubTask", ACTIVITY_REMOVED_SUB_TASK);
		activityLogMap.put("changedSubTaskStatus", ACTIVITY_CHANGED_SUB_TASK_STATUS);
		activityLogMap.put(ADDED_ATTACHMENT, ACTIVITY_ADDED_ATTACHMENT);
		activityLogMap.put("addedWaitingOn", ACTIVITY_ADDED_WAITING_ON);
		activityLogMap.put("addedBlocking", ACTIVITY_ADDED_BLOCKING);
		activityLogMap.put("addedRelatedTask", ACTIVITY_ADDED_RELATED_TASK);
		return activityLogMap;
	}

	@Autowired(required = false)
	private QueueService queueService;

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private ActivityLogRepository taskboardActivityLogRepository;

	@Autowired
	private UsersRepository usersRepository;

	@Autowired
	private TaskboardTaskLabelsRepository taskboardTaskLabelsRepository;

	private TaskboardActivityLogVo constructActivityLogDtotoVo(ActivityLog taskboardActiveLog) {
		return TaskboardActivityLogVo.builder().createdOn(taskboardActiveLog.getCreatedOn()).activityType(taskboardActiveLog.getActivityType())
				.userId(taskboardActiveLog.getActivityLogUserId()).activityData(taskboardActiveLog.getActivityData()).build();
	}

	private ActivityLogInfo constructActivityLogVotoDto(String type, Taskboard taskboard, UUID taskId, UUID userId, String activityData) {
		return ActivityLogInfo.builder().activityType(type).parentId(taskboard.getId()).tenantId(YorosisContext.get().getTenantId())
				.workspaceId(taskboard.getWorkspaceId()).childId(taskId).userId(userId).activityData(activityData).build();
	}

	@Transactional
	public UUID getUserId() {
		User user = usersRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(YorosisContext.get().getUserName(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (user != null) {
			return user.getUserId();
		}
		return null;
	}

	public void saveActivityLog(ActivityLogInfo activityLogInfo) throws JsonProcessingException {
		if (queueService == null) {
			log.warn("Queue Service is disabled. Need to fallback to database table!");
		} else {
			log.info("The Payload for activityLog {} >>>>>", mapper.writeValueAsString(activityLogInfo));
			queueService.publishToActivityQueue(activityLogInfo);
		}
	}

	@Transactional
	public void saveActivityLog(Taskboard taskboard, TaskboardTask taskboardTask, TaskboardTaskVO vo, String type) throws JsonProcessingException {
		String activityData = getType(vo, type, taskboardTask);
		UUID userId = getUserId();
		if (StringUtils.isNotBlank(activityData) && userId != null) {
			saveActivityLog(constructActivityLogVotoDto(mapActivityLog.get(type), taskboard, taskboardTask.getId(), userId, activityData));
//			processActivityLog(activityLogInfo);
		}
	}

	public void saveSubTaskActivityLog(Taskboard taskboard, TaskboardTask taskboardTask, String vo, String type) throws JsonProcessingException {
		if (StringUtils.isNotBlank(vo)) {
			saveActivityLog(taskboard, taskboardTask, vo, mapActivityLog.get(type));
		}
	}

	public void saveAssignedActivity(Taskboard taskboard, TaskboardTask taskboardTask, List<TaskboardTaskAssignedUsers> taskboardTaskAssignedUsers, String type)
			throws JsonProcessingException {
		List<UUID> uuidList = new ArrayList<>();
		if (taskboardTaskAssignedUsers != null && !taskboardTaskAssignedUsers.isEmpty()) {
			taskboardTaskAssignedUsers.stream().forEach(u -> uuidList.add(u.getUserId()));
		}
//		if (StringUtils.equals(type, REMOVED_ASSIGNEE)) {
//			return getRemovedAssignees(vo);
//		} else if (StringUtils.equals(type, ADDED_ASSIGNEE)) {
//			return getAssignedAssignees(vo);
//		}
		if (!uuidList.isEmpty()) {
			saveActivityLog(taskboard, taskboardTask, getUserNameList(uuidList, null), mapActivityLog.get(type));
		}
	}

	public void saveDependencyActivity(Taskboard taskboard, TaskboardTask taskboardTask, List<String> dependenctList, String type)
			throws JsonProcessingException {
		saveActivityLog(taskboard, taskboardTask, getDependenctData(dependenctList), mapActivityLog.get(type));
	}

	private String getDependenctData(List<String> dependenctList) {
		if (dependenctList != null && !dependenctList.isEmpty()) {
			StringBuilder name = new StringBuilder();
			dependenctList.stream().forEach(l -> {
				if (name.length() > 0) {
					name.append(", ");
				}
				name.append(l);
			});
			return name.toString();
		}
		return null;
	}

	public void saveLabelsActivity(Taskboard taskboard, TaskboardTask taskboardTask, TaskboardTaskLabelVO vo, String type) throws JsonProcessingException {
		if (StringUtils.equals(type, "removeLabels")) {
			saveActivityLog(taskboard, taskboardTask, getRemovedLabels(vo), ACTIVITY_LABEL_REMOVED);
		} else if (StringUtils.equals(type, "addLabels")) {
			saveActivityLog(taskboard, taskboardTask, getaddedLabelsString(vo), ACTIVITY_LABEL_ADDED);
		}
	}

	@Transactional
	public void saveLabelsActivityForRemove(Taskboard taskboard, UUID taskboardTaskId, String activityData, String type) throws JsonProcessingException {
		UUID userId = getUserId();
		if (StringUtils.isNotBlank(activityData) && userId != null) {
			saveActivityLog(constructActivityLogVotoDto(mapActivityLog.get(type), taskboard, taskboardTaskId, userId, activityData));
		}
	}

	@Transactional
	public void saveAttachmentsActivity(Taskboard taskboard, TaskboardTask taskboardTask, String fileName, String type) throws JsonProcessingException {
		if (StringUtils.equals(type, ADDED_ATTACHMENT)) {
			UUID userId = getUserId();
			if (StringUtils.isNotBlank(fileName) && userId != null) {
				saveActivityLog(constructActivityLogVotoDto(ACTIVITY_ADDED_ATTACHMENT, taskboard, taskboardTask.getId(), userId, fileName));
			}
		}
	}

	private String getaddedLabelsString(TaskboardTaskLabelVO vo) {
		if (vo != null && vo.getLabels() != null) {
			StringBuilder labelName = new StringBuilder();
			vo.getLabels().stream().forEach(l -> {
				if (labelName.length() > 0) {
					labelName.append(", ");
				}
				labelName.append(l.getLabelName());
			});
			return labelName.toString();
		}
		return null;
	}

	private String getRemovedLabels(TaskboardTaskLabelVO vo) {
		if (vo != null && vo.getRemovedIdList() != null) {
			List<UUID> uuidList = new ArrayList<>();
			for (UUID uuid : vo.getRemovedIdList()) {
				uuidList.add(uuid);
			}
			if (!uuidList.isEmpty()) {
				return getLabelString(uuidList);
			}
		}
		return null;
	}

	private String getLabelString(List<UUID> uuidList) {
		List<TaskboardTaskLabels> taskLabelList = taskboardTaskLabelsRepository.getTaskLabels(uuidList, YorosisContext.get().getTenantId(),
				YorosisConstants.YES);
		StringBuilder labelName = new StringBuilder();
		if (taskLabelList != null) {
			taskLabelList.stream().forEach(l -> {
				if (labelName.length() > 0) {
					labelName.append(", ");
				}
				labelName.append(l.getLabelName());
			});
		}
		return labelName.toString();
	}

	private void saveActivityLog(Taskboard taskboard, TaskboardTask taskboardTask, String activityData, String type) throws JsonProcessingException {
		UUID userId = getUserId();
		if (StringUtils.isNotBlank(activityData) && userId != null) {
			saveActivityLog(constructActivityLogVotoDto(type, taskboard, taskboardTask.getId(), userId, activityData));
		}
	}

	private String getType(TaskboardTaskVO vo, String type, TaskboardTask taskboardTask) {
		if (StringUtils.equals(type, CREATE_TASK)) {
			return "Task created";
		} else if (StringUtils.equals(type, UPDATED_TASK)) {
			return "Task updated";
		} else if (StringUtils.equals(type, ADDED_COMMENT)) {
			return "Comments added";
		} else if (StringUtils.equals(type, ADDED_PRIORITY)) {
			return vo.getPriority();
		} else if (StringUtils.equals(type, CHANGED_STATUS)) {
			return vo.getStatus();
		} else if (StringUtils.equals(type, CHANGED_SUB_STATUS)) {
			return vo.getSubStatus();
		} else if (StringUtils.equals(type, ADDED_DESCRIPTION)) {
			return vo.getDescription();
		} else if (StringUtils.equals(type, ADDED_SUB_TASK)) {
			return getSubTask(vo, taskboardTask);
		} else if (StringUtils.equals(type, ADD_START_DATE)) {
			return vo.getStartDate().toString();
		} else if (StringUtils.equals(type, ADD_DUE_DATE)) {
			return vo.getDueDate().toString();
		} else if (StringUtils.equals(type, REMOVED_ASSIGNEE)) {
			return getRemovedAssignees(vo);
		} else if (StringUtils.equals(type, ADDED_ASSIGNEE)) {
			return getAssignedAssignees(vo);
		}
		return null;
	}

	private String getSubTask(TaskboardTaskVO vo, TaskboardTask taskboardTask) {
		if (vo.getSubTasks() != null && !vo.getSubTasks().isEmpty() && taskboardTask != null && taskboardTask.getTaskboard() != null) {
			StringBuilder subTask = new StringBuilder();
			vo.getSubTasks().stream().forEach(u -> {
				if (subTask.length() > 0) {
					subTask.append(", ");
				}
				subTask.append(u.getTaskName());
			});
			return subTask.toString();
		}
		return null;
	}

	private String getAssignedAssignees(TaskboardTaskVO vo) {
		if (vo != null && vo.getAssignTaskVO() != null && vo.getAssignTaskVO().getAssigneeUserTaskList() != null
				&& !vo.getAssignTaskVO().getAssigneeUserTaskList().isEmpty()) {
			List<UUID> uuidList = new ArrayList<>();
			for (AssignUserTaskVO uuid : vo.getAssignTaskVO().getAssigneeUserTaskList()) {
				uuidList.add(uuid.getAssigneeUser());
			}
			if (!uuidList.isEmpty()) {
				return getUserNameList(uuidList, "assign");
			}

		}
		return null;
	}

	private String getRemovedAssignees(TaskboardTaskVO vo) {
		if (vo != null && vo.getAssignTaskVO() != null && vo.getAssignTaskVO().getRemovedAssigneeList() != null
				&& !vo.getAssignTaskVO().getRemovedAssigneeList().isEmpty()) {
			List<UUID> uuidList = new ArrayList<>();
			for (String uuid : vo.getAssignTaskVO().getRemovedAssigneeList()) {
				uuidList.add(UUID.fromString(uuid));
			}
			if (!uuidList.isEmpty()) {
				return getUserNameList(uuidList, "remove");
			}

		}
		return null;
	}

	private String getUserNameList(List<UUID> uuidList, String type) {
		log.debug("Type: {}", type);
		StringBuilder userName = new StringBuilder();
//		List<User> userList = usersRepository.findUsersByID(uuidList, YorosisContext.get().getTenantId());
		if (uuidList != null) {
			uuidList.stream().forEach(u -> {
				if (userName.length() > 0) {
					userName.append(",");
				}
				userName.append(u);
			});
		}
		return userName.toString();
	}

	protected Pageable getPageable(PaginationVO vo) {
		Sort sort = null;
		int pageSize = 10;
		if (vo.getSize() > 0) {
			pageSize = vo.getSize();
		}
		if (!StringUtils.isEmpty(vo.getColumnName())) {
			if (StringUtils.equals(vo.getDirection(), "desc")) {
				sort = Sort.by(new Sort.Order(Direction.DESC, vo.getColumnName()));
			} else {
				sort = Sort.by(new Sort.Order(Direction.ASC, vo.getColumnName()));
			}
		}

		if (sort != null) {
			return PageRequest.of(vo.getIndex(), pageSize, sort);
		}
		return PageRequest.of(vo.getIndex(), pageSize);
	}

	@Transactional
	public ActivityLogVo getAllActivityList(PaginationVO vo, UUID taskId, UUID taskboardId) {
		List<TaskboardActivityLogVo> taskboardActivityLogVoList = new ArrayList<>();
		Pageable pageable = getPageable(vo);
		List<ActivityLog> taskboardActiveLogList = taskboardActivityLogRepository.getTaskBoardTaskActivityLogList(YorosisContext.get().getTenantId(),
				YorosisConstants.YES, taskId, taskboardId, pageable);
		Long taskboardActiveLogListCount = taskboardActivityLogRepository.getTaskBoardTaskActivityLogListCount(YorosisContext.get().getTenantId(),
				YorosisConstants.YES, taskId, taskboardId);
		if (taskboardActiveLogList != null) {
			taskboardActivityLogVoList = taskboardActiveLogList.stream().map(this::constructActivityLogDtotoVo).collect(Collectors.toList());
		}
		return ActivityLogVo.builder().taskboardActivityLogVoList(taskboardActivityLogVoList).totalCount(taskboardActiveLogListCount).build();
	}

}
