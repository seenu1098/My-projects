package com.yorosis.taskboard.services;

import java.io.IOException;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yorosis.taskboard.models.AssignTaskVO;
import com.yorosis.taskboard.models.AssignUserTaskVO;
import com.yorosis.taskboard.models.FilterDateVO;
import com.yorosis.taskboard.models.GroupVO;
import com.yorosis.taskboard.models.LabelVO;
import com.yorosis.taskboard.models.ResolveSecurityForTaskboardVO;
import com.yorosis.taskboard.models.ResolveSecurityForTaskboardVO.ResolveSecurityForTaskboardVOBuilder;
import com.yorosis.taskboard.models.SecurityListVO;
import com.yorosis.taskboard.models.SubStatusVO;
import com.yorosis.taskboard.models.SubTaskVO;
import com.yorosis.taskboard.models.SubTaskVO.SubTaskVOBuilder;
import com.yorosis.taskboard.models.TaskEntityVO;
import com.yorosis.taskboard.models.TaskGroupByVO;
import com.yorosis.taskboard.models.TaskboardColumnMapVO;
import com.yorosis.taskboard.models.TaskboardColumnsVO;
import com.yorosis.taskboard.models.TaskboardEntityVO;
import com.yorosis.taskboard.models.TaskboardLabelsVO;
import com.yorosis.taskboard.models.TaskboardTaskVO;
import com.yorosis.taskboard.models.TaskboardTaskVO.TaskboardTaskVOBuilder;
import com.yorosis.taskboard.models.TaskboardVO;
import com.yorosis.taskboard.models.TaskboardVO.TaskboardVOBuilder;
import com.yorosis.taskboard.models.UserFieldVO;
import com.yorosis.taskboard.models.UsersVO;
import com.yorosis.taskboard.repository.GridViewRepository;
import com.yorosis.taskboard.repository.GroupRepository;
import com.yorosis.taskboard.repository.TaskboardColumnsRepository;
import com.yorosis.taskboard.repository.TaskboardRepository;
import com.yorosis.taskboard.repository.TaskboardTaskRepository;
import com.yorosis.taskboard.repository.UserGroupRepository;
import com.yorosis.taskboard.repository.UsersRepository;
import com.yorosis.taskboard.taskboard.entities.Group;
import com.yorosis.taskboard.taskboard.entities.Taskboard;
import com.yorosis.taskboard.taskboard.entities.TaskboardColumns;
import com.yorosis.taskboard.taskboard.entities.TaskboardColumnsSecurity;
import com.yorosis.taskboard.taskboard.entities.TaskboardSecurity;
import com.yorosis.taskboard.taskboard.entities.User;
import com.yorosis.taskboard.taskboard.entities.UserGroup;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class GridViewService {

	@Autowired
	private UsersRepository userRepository;

	@Autowired
	private TaskboardRepository taskboardRepository;

	@Autowired
	private TaskboardColumnsRepository taskboardColumnsRepository;

	@Autowired
	private GroupRepository groupRepository;

	@Autowired
	private UserGroupRepository userGroupRepository;

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private TaskboardTaskRepository taskboardTaskRepository;

	@Autowired
	private GridViewRepository gridViewRepository;

	private static final String STATUS = "status";
	private static final String ASSIGNEE = "assignee";
	private static final String PRIORITY = "priority";
	private static final String HIGH = "High";
	private static final String URGENT = "Urgent";
	private static final String MEDIUM = "Medium";
	private static final String LOW = "Low";
	private static final String NO_PRIORITY = "No Priority";
	private static final String URGENT_COLOR = "red";
	private static final String HIGH_COLOR = "orange";
	private static final String MEDIUM_COLOR = "yellow";
	private static final String LOW_COLOR = "#37bdff";
	private static final String NO_PRIORITY_COLOR = "#808080";
	private static final String WHITE = "white";
	private static final String UNASSIGNED = "Unassigned";
	private static final String BLACK = "black";
	private static final String PARENT_TASK = "parentTask";
	private static final String CREATED_DATE = "createdDate";
	private static final String START_DATE = "startDate";
	private static final String DUE_DATE = "dueDate";
	private static final String ALL = "all";

	private UsersVO constructDTOToVO(User user) {
		List<GroupVO> groupVOList = new ArrayList<>();

		if (user.getUserGroups() != null) {
			for (UserGroup group : user.getUserGroups()) {
				groupVOList.add(GroupVO.builder().groupId(group.getGroup().getGroupId()).groupName(group.getGroup().getGroupName())
						.groupDesc(group.getGroup().getGroupDesc()).build());
			}
		}

		return UsersVO.builder().userId(user.getUserId()).firstName(user.getFirstName()).lastName(user.getLastName()).userName(user.getUserName())
				.emailId(user.getEmailId()).contactEmailId(user.getContactEmailId()).groupVOList(groupVOList).build();
	}

	private SecurityListVO constructTaskboardColumnsSecurityDTOToVO(TaskboardColumnsSecurity taskboardColumnsSecurity) {
		String groupName = "";
		Group group = groupRepository.findByGroupIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCaseAndManagedFlagIgnoreCase(taskboardColumnsSecurity.getGroupId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES, YorosisConstants.NO);
		if (group != null) {
			groupName = group.getGroupName();
		}
		return SecurityListVO.builder().readAllowed(charToBoolean(taskboardColumnsSecurity.getRead()))
				.updateAllowed(charToBoolean(taskboardColumnsSecurity.getUpdate())).deleteAllowed(charToBoolean(taskboardColumnsSecurity.getDelete()))
				.id(taskboardColumnsSecurity.getId()).groupId(groupName).build();

	}

	private void resolveUserGroup(SecurityListVO securityListVO, ResolveSecurityForTaskboardVOBuilder builder, boolean override) {

		if (BooleanUtils.isTrue(securityListVO.getDeleteAllowed())) {
			builder.delete(true);
		} else if (override) {
			builder.delete(false);
		}

		if (BooleanUtils.isTrue(securityListVO.getReadAllowed())) {
			builder.read(true);
		} else if (override) {
			builder.read(false);
		}

		if (BooleanUtils.isTrue(securityListVO.getUpdateAllowed())) {
			builder.update(true);
		} else if (override) {
			builder.update(false);
		}
	}

	private void resolveGroups(SecurityListVO securityListVO, ResolveSecurityForTaskboardVOBuilder builder, boolean override) {
		Group yoroGroups = groupRepository.findByGroupNameAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(securityListVO.getGroupId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);

		if (yoroGroups != null) {
			List<UserGroup> filteredList = userGroupRepository.getGroupIdAndUsernameAndTenantIdAndActiveFlagIgnoreCase(yoroGroups.getGroupId(),
					YorosisContext.get().getUserName(), YorosisContext.get().getTenantId(), YorosisConstants.YES, PageRequest.of(0, 2));

			if (!filteredList.isEmpty()) {
				resolveUserGroup(securityListVO, builder, override);
			}
		}
	}

	@Transactional
	public ResolveSecurityForTaskboardVO getResolvedTaskboardColumnSecurity(UUID columnId) {
		ResolveSecurityForTaskboardVOBuilder builder = ResolveSecurityForTaskboardVO.builder().read(false).update(false).delete(false);
		List<SecurityListVO> columnSecurityListVO = null;
		TaskboardColumns taskboardColumns = taskboardColumnsRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(columnId,
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskboardColumns != null && taskboardColumns.getTaskboardColumnsSecurity() != null && !taskboardColumns.getTaskboardColumnsSecurity().isEmpty()) {
			columnSecurityListVO = taskboardColumns.getTaskboardColumnsSecurity().stream()
					.filter(security -> StringUtils.equals(security.getActiveFlag(), YorosisConstants.YES) && security.getGroupId() != null)
					.map(this::constructTaskboardColumnsSecurityDTOToVO).collect(Collectors.toList());

			for (SecurityListVO listVO : columnSecurityListVO) {
				resolveGroups(listVO, builder, true);
			}
		}
		return builder.build();
	}

	private List<SubStatusVO> hasSubstatus(UUID columnId, List<TaskboardEntityVO> taskboardEntityVoList) {
		List<SubStatusVO> subStatusList = new ArrayList<>();
		List<UUID> uuidList = new ArrayList<>();
		taskboardEntityVoList.stream().filter(t -> StringUtils.equals(t.getTaskboardColumnId(), columnId.toString())).forEach(t -> {
			if (t.getSubStatusId() != null) {
				UUID subStatusId = UUID.fromString(t.getSubStatusId());
				if (!uuidList.contains(subStatusId) && t.getSubStatusColumnId() != null && StringUtils.equals(t.getSubStatusColumnId(), columnId.toString())) {
					subStatusList.add(SubStatusVO.builder().name(t.getSubStatusName()).color(t.getSubStatusColor()).id(subStatusId)
							.columnOrder(t.getColumnOrder()).previousName(t.getSubStatusName()).build());
					uuidList.add(subStatusId);
				}
			}
		});
		return subStatusList;
	}

	private List<TaskboardColumnsVO> constructTaskboardColumnsListDtoToVo(List<TaskboardEntityVO> taskboardEntityVoList, boolean isTaskboardOwner) {
		List<UUID> uuidList = new ArrayList<>();
		List<TaskboardColumnsVO> taskboardColumns = new ArrayList<>();
		for (TaskboardEntityVO vo : taskboardEntityVoList) {
			UUID columnId = UUID.fromString(vo.getTaskboardColumnId());
			if (!uuidList.contains(columnId)) {
				taskboardColumns
						.add(TaskboardColumnsVO.builder().columnName(vo.getColumnName()).columnOrder(vo.getColumnOrder()).formId(vo.getFormId()).id(columnId)
								.version(vo.getVersion()).columnColor(vo.getColumnColor()).layoutType(vo.getLayoutType())
								.taskboardColumnSecurity(BooleanUtils.isTrue(isTaskboardOwner)
										? ResolveSecurityForTaskboardVO.builder().read(true).delete(true).update(true).build()
										: getResolvedTaskboardColumnSecurity(columnId))
								.isColumnBackground(charToBoolean(vo.getIsColumnBackground())).subStatus(hasSubstatus(columnId, taskboardEntityVoList))
								.isDoneColumn(charToBoolean(vo.getIsDoneColumn())).build());
				uuidList.add(columnId);
			}
		}
		return taskboardColumns;
	}

	private List<UUID> getGroupAsUUID(UsersVO userVO) {
		List<GroupVO> listGroupVO = userVO.getGroupVOList();
		if (listGroupVO.isEmpty()) {
			return java.util.Collections.emptyList();
		}

		return listGroupVO.stream().map(GroupVO::getGroupId).collect(Collectors.toList());
	}

	private List<UUID> hasTaskOwners(List<TaskboardEntityVO> taskboardEntityVoList) {
		List<UUID> uuidList = new ArrayList<>();
		taskboardEntityVoList.stream().forEach(t -> {
			if (t.getUserId() != null) {
				UUID id = UUID.fromString(t.getUserId());
				if (!uuidList.contains(id)) {
					uuidList.add(id);
				}
			}
		});
		return uuidList;
	}

	private boolean charToBoolean(String value) {
		return StringUtils.equalsIgnoreCase(YorosisConstants.YES, value);
	}

	private List<LabelVO> hasTaskboardLabels(List<TaskboardEntityVO> taskboardEntityVoList) {
		List<UUID> uuidList = new ArrayList<>();
		List<LabelVO> labels = new ArrayList<>();
		taskboardEntityVoList.stream().forEach(t -> {
			if (t.getTaskboardLabelId() != null) {
				UUID labelId = UUID.fromString(t.getTaskboardLabelId());
				if (!uuidList.contains(labelId)) {
					labels.add(LabelVO.builder().taskboardLabelId(labelId).labelName(t.getLabelName()).labelcolor(t.getLabelColor()).build());
					uuidList.add(labelId);
				}
			}
		});
		return labels;
	}

	private TaskboardVO setTaskboardVO(UUID taskboardId, UsersVO userVo) throws JsonProcessingException {
		List<TaskboardEntityVO> taskboardEntityVoList = taskboardRepository.getTaskboardInfo(taskboardId, YorosisContext.get().getTenantId(),
				YorosisConstants.YES);
		List<UUID> uuidList = new ArrayList<>();
		TaskboardVOBuilder taskboardVO = TaskboardVO.builder();
		List<UUID> taskboardOwnerList = hasTaskOwners(taskboardEntityVoList);
		for (TaskboardEntityVO vo : taskboardEntityVoList) {
			if (!uuidList.contains(taskboardId)) {
				taskboardVO.isTaskBoardOwner(false);
				if (!taskboardOwnerList.isEmpty()) {
					taskboardVO.isTaskBoardOwner(
							taskboardOwnerList.stream().anyMatch(i -> i != null && StringUtils.equals(i.toString(), userVo.getUserId().toString())));
				}
				taskboardVO.id(taskboardId).name(vo.getTaskboardName()).description(vo.getTaskboardDescription()).generatedTaskId(vo.getGeneratedTaskId())
						.taskName(vo.getTaskName()).taskboardKey(vo.getTaskboardKey()).sprintEnabled(charToBoolean(vo.getSprintEnabled()))
						.isColumnBackground(charToBoolean(vo.getIsColumnBackground()))
						.taskboardLabels(TaskboardLabelsVO.builder().taskboardId(UUID.fromString(vo.getTaskboardId()))
								.labels(hasTaskboardLabels(taskboardEntityVoList)).build())
						.taskboardColumns(constructTaskboardColumnsListDtoToVo(taskboardEntityVoList, taskboardVO.build().getIsTaskBoardOwner()))
						.launchButtonName(vo.getLaunchButtonName())
						.fieldMapping(vo.getInitialMapData() != null ? mapper.readTree(vo.getInitialMapData()) : null).build();
				uuidList.add(taskboardId);
			}
		}
		return taskboardVO.build();

	}

	private AssignTaskVO setAssignTask(TaskEntityVO taskEntityVO, List<TaskEntityVO> taskList) {
		List<AssignUserTaskVO> assignUserTaskVOList = new ArrayList<>();
		List<UUID> uuidList = new ArrayList<>();
		AssignTaskVO assignTaskVO = null;
		taskList.stream().filter(t -> StringUtils.equals(t.getId(), taskEntityVO.getId())).collect(Collectors.toList()).forEach(t -> {
			if (t.getAssignedId() != null && t.getUserId() != null && !uuidList.contains(UUID.fromString(t.getAssignedId()))) {
				uuidList.add(UUID.fromString(t.getAssignedId()));
				assignUserTaskVOList
						.add(AssignUserTaskVO.builder().id(UUID.fromString(t.getAssignedId())).assigneeUser(UUID.fromString(t.getUserId())).build());
			}
		});

		if (!assignUserTaskVOList.isEmpty()) {
			assignTaskVO = AssignTaskVO.builder().assigneeUserTaskList(assignUserTaskVOList).taskId(UUID.fromString(taskEntityVO.getId())).build();
		}

		return assignTaskVO;
	}

	private int getCommentsLength(TaskEntityVO taskEntityVO, List<TaskEntityVO> taskList) {
		AtomicInteger count = new AtomicInteger(0);
		List<UUID> uuidList = new ArrayList<>();
		taskList.stream().filter(t -> t.getCommentsTaskId() != null && StringUtils.equals(t.getCommentsTaskId(), taskEntityVO.getId()))
				.collect(Collectors.toList()).forEach(t -> {
					if (t.getCommentId() != null && !uuidList.contains(UUID.fromString(t.getCommentId()))) {
						count.incrementAndGet();
						uuidList.add(UUID.fromString(t.getCommentId()));
					}
				});
		return count.intValue();
	}

	private int getAttachmentsLength(TaskEntityVO taskEntityVO, List<TaskEntityVO> taskList) {
		AtomicInteger count = new AtomicInteger(0);
		List<UUID> uuidList = new ArrayList<>();
		taskList.stream().filter(t -> t.getFilesTaskId() != null && StringUtils.equals(t.getFilesTaskId(), taskEntityVO.getId())).collect(Collectors.toList())
				.forEach(t -> {
					if (t.getFilesId() != null && !uuidList.contains(UUID.fromString(t.getFilesId()))) {
						count.incrementAndGet();
						uuidList.add(UUID.fromString(t.getFilesId()));
					}
				});
		return count.intValue();
	}

	private List<LabelVO> getLabelsList(TaskEntityVO taskEntityVO, List<TaskEntityVO> taskList) {
		List<LabelVO> labelsList = new ArrayList<>();
		List<UUID> uuidList = new ArrayList<>();
		taskList.stream().filter(t -> StringUtils.equals(t.getId(), taskEntityVO.getId())).collect(Collectors.toList()).forEach(t -> {
			if (t.getLabelId() != null && t.getLabelName() != null && t.getLabelColor() != null && t.getTaskLabelId() != null
					&& !uuidList.contains(UUID.fromString(t.getTaskLabelId()))) {
				uuidList.add(UUID.fromString(t.getTaskLabelId()));
				labelsList.add(LabelVO.builder().taskboardLabelId(UUID.fromString(t.getLabelId())).labelName(t.getLabelName()).labelcolor(t.getLabelColor())
						.taskboardTaskLabelId(UUID.fromString(t.getTaskLabelId())).build());
			}
		});
		return labelsList;
	}

	private String getUsername(TaskEntityVO taskEntityVO, List<TaskEntityVO> taskList) {
		List<String> usernameList = new ArrayList<>();
		List<AssignUserTaskVO> assignUserTaskVOList = new ArrayList<>();
		List<UUID> uuidList = new ArrayList<>();
		taskList.stream().filter(t -> StringUtils.equals(t.getId(), taskEntityVO.getId())).collect(Collectors.toList()).forEach(t -> {
			if (t.getAssignedId() != null && t.getUserId() != null && !uuidList.contains(UUID.fromString(t.getAssignedId()))) {
				uuidList.add(UUID.fromString(t.getAssignedId()));
				assignUserTaskVOList.add(AssignUserTaskVO.builder().id(UUID.fromString(t.getAssignedId())).assigneeUser(UUID.fromString(t.getUserId()))
						.username(t.getFirstName() + " " + t.getLastName()).build());
			}
		});

		assignUserTaskVOList.stream().forEach(t -> {
			usernameList.add(t.getUsername());
		});

		return usernameList.isEmpty() ? "" : usernameList.stream().sorted().map(Object::toString).collect(Collectors.joining(", "));
	}

	private TaskboardTaskVO contructTaskDtoToVo(TaskEntityVO taskEntityVO, List<TaskEntityVO> taskList, String userName) throws IOException {
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		if (taskEntityVO != null) {
			TaskboardTaskVOBuilder taskboardTaskVOBuilder = TaskboardTaskVO.builder();
			if (taskEntityVO.getParentTaskId() != null) {
				taskboardTaskVOBuilder.parentTaskId(UUID.fromString(taskEntityVO.getParentTaskId()));
			}

			if (taskEntityVO.getTaskData() != null) {
				taskboardTaskVOBuilder.taskData(mapper.readTree(taskEntityVO.getTaskData()));
			}

			return taskboardTaskVOBuilder.id(UUID.fromString(taskEntityVO.getId())).startDate(taskEntityVO.getStartDate()).dueDate(taskEntityVO.getDueDate())
					.taskboardId(UUID.fromString(taskEntityVO.getTaskboardId())).status(taskEntityVO.getStatus()).taskName(taskEntityVO.getTaskName())
					.taskType(taskEntityVO.getTaskType()).taskId(taskEntityVO.getTaskId()).assignTaskVO(setAssignTask(taskEntityVO, taskList))
					.description(taskEntityVO.getDescription()).sequenceNo(taskEntityVO.getSequenceNo()).subStatus(taskEntityVO.getSubStatus())
					.loggedInUserName(userName).previousStatus(taskEntityVO.getPreviousStatus()).priority(taskEntityVO.getPriority())
					.commentsLength(getCommentsLength(taskEntityVO, taskList)).filesList(getAttachmentsLength(taskEntityVO, taskList))
					.labels(getLabelsList(taskEntityVO, taskList)).username(getUsername(taskEntityVO, taskList)).build();
		} else {
			return TaskboardTaskVO.builder().build();
		}
	}

	private SubTaskVO constructSubTaskDtoToVo(TaskEntityVO task, List<TaskEntityVO> taskList) {
		SubTaskVOBuilder subTaskVOBuilder = SubTaskVO.builder();

		return subTaskVOBuilder.id(UUID.fromString(task.getId())).status(task.getStatus()).taskName(task.getTaskName()).taskType(task.getTaskType())
				.assignTaskVO(setAssignTask(task, taskList)).createdBy(task.getCreatedBy()).modifiedBy(task.getModifiedBy()).startDate(task.getStartDate())
				.dueDate(task.getDueDate()).createdOn(task.getCreatedOn()).modifiedOn(task.getModifiedOn()).build();
	}

	private List<SubTaskVO> hasSubTask(List<TaskEntityVO> taskList, UUID parentTaskId, List<TaskboardTaskVO> taskboardTaskList, String userName) {
		List<SubTaskVO> subTaskList = new ArrayList<>();
		List<UUID> uuidList = new ArrayList<>();
		taskList.stream().filter(task -> task.getParentTaskId() != null && StringUtils.equals(task.getParentTaskId(), parentTaskId.toString())).distinct()
				.map(t -> {
					try {
						UUID id = UUID.fromString(t.getId());
						if (!uuidList.contains(id)) {
							subTaskList.add(constructSubTaskDtoToVo(t, taskList));
							uuidList.add(id);
						}
						return contructTaskDtoToVo(t, taskList, userName);
					} catch (IOException e) {
						log.info("invalid data");
					}
					return null;
				}).distinct().forEach(param -> taskboardTaskList.add(param));
		return subTaskList;
	}

	private SecurityListVO constructTaskboardSecurityDTOToVO(TaskboardSecurity taskboardSecurity) {
		String groupName = "";
		Group group = groupRepository.findByGroupIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCaseAndManagedFlagIgnoreCase(taskboardSecurity.getGroupId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES, YorosisConstants.NO);
		if (group != null) {
			groupName = group.getGroupName();
		}
		return SecurityListVO.builder().readAllowed(charToBoolean(taskboardSecurity.getRead())).updateAllowed(charToBoolean(taskboardSecurity.getUpdate()))
				.deleteAllowed(charToBoolean(taskboardSecurity.getDelete())).id(taskboardSecurity.getId()).groupId(groupName).build();

	}

	@Transactional
	public ResolveSecurityForTaskboardVO getResolvedTaskboardSecurity(UUID taskboardId) {
		ResolveSecurityForTaskboardVOBuilder builder = ResolveSecurityForTaskboardVO.builder().read(false).update(false).delete(false);
		List<SecurityListVO> securityListVO = null;
		Taskboard taskboard = taskboardRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(taskboardId, YorosisContext.get().getTenantId(),
				YorosisConstants.YES);

		if (taskboard != null && taskboard.getTaskboardSecurity() != null && !taskboard.getTaskboardSecurity().isEmpty()) {
			securityListVO = taskboard.getTaskboardSecurity().stream()
					.filter(security -> StringUtils.equals(security.getActiveFlag(), YorosisConstants.YES) && security.getGroupId() != null)
					.map(this::constructTaskboardSecurityDTOToVO).collect(Collectors.toList());

			for (SecurityListVO listVO : securityListVO) {
				resolveGroups(listVO, builder, true);
			}
		}
		return builder.build();
	}

	private List<TaskboardColumnMapVO> setColumnMapVO(List<TaskboardColumnsVO> columnsList, List<TaskEntityVO> taskList, int startIndex, int endIndex,
			String username, String status, TaskGroupByVO taskGroupByVO) throws IOException {
		List<TaskboardColumnMapVO> taskboardColumnMapVOList = new ArrayList<>();
		List<TaskboardColumnsVO> list = columnsList.stream().filter(t -> StringUtils.equals(t.getColumnName(), taskGroupByVO.getColumnName()))
				.collect(Collectors.toList());

		if (!list.isEmpty()) {
			List<TaskboardTaskVO> setTaskboardTaskList = setTaskboardTaskList(list.get(0), taskList, status, startIndex, endIndex, username, taskGroupByVO);
			log.info("setTaskboardTaskList:{}", setTaskboardTaskList.size());
			taskboardColumnMapVOList.add(TaskboardColumnMapVO.builder().taskboardColumnsVO(list.get(0)).taskboardTaskVOList(setTaskboardTaskList).build());

			return taskboardColumnMapVOList;
		}
		return taskboardColumnMapVOList;
	}

	private List<TaskboardColumnMapVO> getAssigneeOrPriorityCount(List<TaskboardColumnsVO> columnsList, List<TaskEntityVO> taskList, String username,
			String status, TaskGroupByVO taskGroupByVO) throws IOException {
		List<TaskboardColumnMapVO> taskboardColumnMapVOList = new ArrayList<>();
		for (TaskboardColumnsVO taskboardColumnsVO : columnsList) {
			if (StringUtils.equals(status, ASSIGNEE) || StringUtils.equals(status, PRIORITY)) {
				taskboardColumnsVO.setTaskCount(getCount(taskboardColumnsVO, taskList, status, username, taskGroupByVO));
			}

			taskboardColumnMapVOList.add(TaskboardColumnMapVO.builder().taskboardColumnsVO(taskboardColumnsVO).build());
		}
		return taskboardColumnMapVOList;
	}

	private List<TaskboardTaskVO> setTaskboardTaskList(TaskboardColumnsVO taskboardColumnsVO, List<TaskEntityVO> taskList, String status, int startIndex,
			int endIndex, String username, TaskGroupByVO taskGroupByVO) throws IOException {
		List<TaskboardTaskVO> taskboardTaskList = new ArrayList<>();
		List<UUID> uuidList = new ArrayList<>();
		int matchCount = 0;
		for (TaskEntityVO taskEntityVO : taskList) {

			String columnName = null;
			if (StringUtils.equals(status, PRIORITY)) {
				if (StringUtils.isNotBlank(taskEntityVO.getPriority())) {
					columnName = taskEntityVO.getPriority();
				} else {
					columnName = NO_PRIORITY;
				}
			} else if (StringUtils.equals(status, ASSIGNEE)) {
				String assigneeName = getUsername(taskEntityVO, taskList);
				columnName = StringUtils.isNotBlank(assigneeName) ? assigneeName : UNASSIGNED;
			} else if (StringUtils.equals(status, STATUS)) {
				columnName = taskEntityVO.getColumnName();
			}
			UUID id = UUID.fromString(taskEntityVO.getId());
			if (StringUtils.equals(columnName, taskboardColumnsVO.getColumnName()) && StringUtils.equals(taskEntityVO.getTaskType(), PARENT_TASK)
					&& !uuidList.contains(id)) {
				uuidList.add(id);

				if (!taskGroupByVO.getAssignedUserIdList().isEmpty() || !taskGroupByVO.getTaskboardPriorityList().isEmpty()
						|| !taskGroupByVO.getTaskboardLabelIdList().isEmpty() || BooleanUtils.isTrue(taskGroupByVO.getIsNoLabel())
						|| BooleanUtils.isTrue(taskGroupByVO.getIsNoPriority()) || BooleanUtils.isTrue(taskGroupByVO.getIsUnAssignedUser())) {
					List<TaskboardTaskVO> tempList = new ArrayList<>();
					TaskboardTaskVO contructTaskDtoToVo = contructTaskDtoToVo(taskEntityVO, taskList, username);
					tempList.add(contructTaskDtoToVo);
					List<TaskboardTaskVO> applyFilters = applyFilter(status, taskGroupByVO, tempList);
					if (!applyFilters.isEmpty()) {
						matchCount++;
						if (matchCount > startIndex && matchCount <= endIndex) {
							log.info(taskEntityVO.getTaskId());
							taskboardTaskList.add(contructTaskDtoToVo);
							List<SubTaskVO> subTaskList = hasSubTask(taskList, id, taskboardTaskList, username);
							List<TaskboardTaskVO> parentTaskList = taskboardTaskList.stream()
									.filter(t -> StringUtils.equals(t.getId().toString(), taskEntityVO.getId())).collect(Collectors.toList());
							if (parentTaskList != null && !parentTaskList.isEmpty()) {
								parentTaskList.get(0).setSubTaskLength(subTaskList.size());
								parentTaskList.get(0).setSubTasks(subTaskList);
							}

							Collections.sort(taskboardTaskList, (TaskboardTaskVO s1, TaskboardTaskVO s2) -> {
								if (s1.getSequenceNo() != null && s2.getSequenceNo() != null) {
									int displayOrder1 = s1.getSequenceNo().intValue();
									int displayOrder2 = s2.getSequenceNo().intValue();
									return displayOrder1 - displayOrder2;
								}
								return 0;
							});
						}
					}
				} else {
					matchCount++;
					if (matchCount > startIndex && matchCount <= endIndex) {
						log.info(taskEntityVO.getTaskId());
						taskboardTaskList.add(contructTaskDtoToVo(taskEntityVO, taskList, username));
						List<SubTaskVO> subTaskList = hasSubTask(taskList, id, taskboardTaskList, username);
						List<TaskboardTaskVO> parentTaskList = taskboardTaskList.stream()
								.filter(t -> StringUtils.equals(t.getId().toString(), taskEntityVO.getId())).collect(Collectors.toList());
						if (parentTaskList != null && !parentTaskList.isEmpty()) {
							parentTaskList.get(0).setSubTaskLength(subTaskList.size());
							parentTaskList.get(0).setSubTasks(subTaskList);
						}

						Collections.sort(taskboardTaskList, (TaskboardTaskVO s1, TaskboardTaskVO s2) -> {
							if (s1.getSequenceNo() != null && s2.getSequenceNo() != null) {
								int displayOrder1 = s1.getSequenceNo().intValue();
								int displayOrder2 = s2.getSequenceNo().intValue();
								return displayOrder1 - displayOrder2;
							}
							return 0;
						});
					}
				}

			}
		}
		return taskboardTaskList;
	}

	private List<TaskboardTaskVO> applyFilter(String status, TaskGroupByVO taskGroupByVO, List<TaskboardTaskVO> taskboardTaskList) {

		if ((StringUtils.equals(status, ASSIGNEE) || StringUtils.equals(status, STATUS)) && !taskGroupByVO.getTaskboardPriorityList().isEmpty()) {
			taskboardTaskList = taskboardTaskList.stream()
					.filter(i -> BooleanUtils.isFalse(taskGroupByVO.getIsNoPriority()) ? taskGroupByVO.getTaskboardPriorityList().contains(i.getPriority())
							: (taskGroupByVO.getTaskboardPriorityList().contains(i.getPriority()) || StringUtils.isBlank(i.getPriority())))
					.collect(Collectors.toList());
		} else if ((StringUtils.equals(status, ASSIGNEE) || StringUtils.equals(status, STATUS)) && taskGroupByVO.getTaskboardPriorityList().isEmpty()
				&& BooleanUtils.isTrue(taskGroupByVO.getIsNoPriority())) {
			taskboardTaskList = taskboardTaskList.stream().filter(t -> StringUtils.isBlank(t.getPriority())).collect(Collectors.toList());
		}

		if ((StringUtils.equals(status, PRIORITY) || StringUtils.equals(status, STATUS)) && !taskGroupByVO.getAssignedUserIdList().isEmpty()) {

			if (BooleanUtils.isTrue(taskGroupByVO.getIsUnAssignedUser())) {
				taskboardTaskList = taskboardTaskList
						.stream().filter(
								t -> (t.getAssignTaskVO() == null) || (t.getAssignTaskVO() != null && t.getAssignTaskVO().getAssigneeUserTaskList() != null
										&& !t.getAssignTaskVO().getAssigneeUserTaskList().isEmpty()
										&& t.getAssignTaskVO().getAssigneeUserTaskList().stream()
												.anyMatch(a -> taskGroupByVO.getAssignedUserIdList().contains(a.getAssigneeUser()))))
						.collect(Collectors.toList());
			} else {
				taskboardTaskList = taskboardTaskList
						.stream().filter(
								t -> t.getAssignTaskVO() != null && t.getAssignTaskVO().getAssigneeUserTaskList() != null
										&& !t.getAssignTaskVO().getAssigneeUserTaskList().isEmpty()
										&& t.getAssignTaskVO().getAssigneeUserTaskList().stream()
												.anyMatch(a -> taskGroupByVO.getAssignedUserIdList().contains(a.getAssigneeUser())))
						.collect(Collectors.toList());
			}
		} else if ((StringUtils.equals(status, PRIORITY) || StringUtils.equals(status, STATUS)) && taskGroupByVO.getAssignedUserIdList().isEmpty()
				&& BooleanUtils.isTrue(taskGroupByVO.getIsUnAssignedUser())) {
			taskboardTaskList = taskboardTaskList.stream().filter(t -> (t.getAssignTaskVO() == null)).collect(Collectors.toList());
		}
		if (!taskGroupByVO.getTaskboardLabelIdList().isEmpty()) {
			if (BooleanUtils.isTrue(taskGroupByVO.getIsNoLabel())) {
				taskboardTaskList = taskboardTaskList.stream()
						.filter(t -> (t.getLabels() == null || t.getLabels().isEmpty()) || (t.getLabels() != null && !t.getLabels().isEmpty()
								&& t.getLabels().stream().anyMatch(a -> taskGroupByVO.getTaskboardLabelIdList().contains(a.getTaskboardLabelId()))))
						.collect(Collectors.toList());
			} else {
				taskboardTaskList = taskboardTaskList.stream()
						.filter(t -> t.getLabels() != null && !t.getLabels().isEmpty()
								&& t.getLabels().stream().anyMatch(a -> taskGroupByVO.getTaskboardLabelIdList().contains(a.getTaskboardLabelId())))
						.collect(Collectors.toList());
			}
		} else if (taskGroupByVO.getTaskboardLabelIdList().isEmpty() && BooleanUtils.isTrue(taskGroupByVO.getIsNoLabel())) {
			taskboardTaskList = taskboardTaskList.stream().filter(t -> (t.getLabels() == null || t.getLabels().isEmpty())).collect(Collectors.toList());
		}

		return taskboardTaskList;
	}

	private boolean filterSearchTaskId(String taskId, TaskEntityVO taskboardTask) {
		return (StringUtils.isEmpty(taskId) || StringUtils.containsIgnoreCase(taskboardTask.getTaskId(), taskId));
	}

	private List<UserFieldVO> getUserField(TaskEntityVO taskEntityVO, List<TaskEntityVO> taskList) {
		List<UserFieldVO> userFieldVOList = new ArrayList<>();
		List<AssignUserTaskVO> assignUserTaskVOList = new ArrayList<>();
		List<UUID> uuidList = new ArrayList<>();
		taskList.stream().filter(t -> StringUtils.equals(t.getId(), taskEntityVO.getId())).collect(Collectors.toList()).forEach(t -> {
			if (t.getAssignedId() != null && t.getUserId() != null && !uuidList.contains(UUID.fromString(t.getAssignedId()))) {
				uuidList.add(UUID.fromString(t.getAssignedId()));
				assignUserTaskVOList.add(AssignUserTaskVO.builder().id(UUID.fromString(t.getAssignedId())).assigneeUser(UUID.fromString(t.getUserId()))
						.username(t.getFirstName() + " " + t.getLastName()).color(t.getColor()).build());
			}
		});

		assignUserTaskVOList.stream().forEach(t -> {
			userFieldVOList.add(UserFieldVO.builder().id(t.getAssigneeUser()).name(t.getUsername()).color(t.getColor()).build());
		});

		return userFieldVOList;
	}

	@Transactional
	public TaskboardVO getAssigneeCombinations(TaskGroupByVO taskGroupByVO) {
		User user = userRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(YorosisContext.get().getUserName(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		UsersVO userVo = constructDTOToVO(user);
		List<TaskEntityVO> taskList = null;
		List<UUID> userGroupIdsList = getGroupAsUUID(userVo);
		Map<String, TaskboardColumnsVO> assigneeMap = new LinkedHashMap<>();
		List<TaskboardColumnsVO> assigneeColumnsList = new ArrayList<>();

		if (taskGroupByVO.getSprintId() == null) {
			taskList = taskboardTaskRepository.getTaskboardTaskListByAssignee(taskGroupByVO.getId(), userVo.getUserId(), userGroupIdsList,
					YorosisContext.get().getTenantId(), YorosisConstants.YES);
		} else {
			taskList = taskboardTaskRepository.getTaskboardTaskListByAssigneeForSprint(taskGroupByVO.getId(), taskGroupByVO.getSprintId(), userVo.getUserId(),
					userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES);
		}

		assigneeMap.put(UNASSIGNED, TaskboardColumnsVO.builder().columnName(UNASSIGNED).columnColor(WHITE).columnOrder(1L).build());

		assigneeColumnsList.add(assigneeMap.get(UNASSIGNED));

		for (TaskEntityVO taskEntityVO : taskList) {
			String assigneeUsers = getUsername(taskEntityVO, taskList);
			if (StringUtils.isNotBlank(assigneeUsers) && !assigneeMap.containsKey(assigneeUsers)) {

				assigneeMap.put(assigneeUsers, TaskboardColumnsVO.builder().columnName(assigneeUsers).build());
				log.info("assigneeUsers:{}", assigneeUsers);
				assigneeColumnsList.add(assigneeMap.get(assigneeUsers));
			}
		}
		return TaskboardVO.builder().taskboardColumns(assigneeColumnsList).build();
	}

	public FilterDateVO getStartAndEndDate(TaskGroupByVO vo) {
		LocalDate today = LocalDate.now();
		log.info("filterType:{}", vo.getFilterType());
		if (StringUtils.equals(vo.getFilterType(), "today")) {
			return FilterDateVO.builder().startDate(today.atStartOfDay()).endDate(today.plusDays(1).atStartOfDay()).build();
		} else if (StringUtils.equals(vo.getFilterType(), "yesterday")) {
			return FilterDateVO.builder().startDate(today.minusDays(1).atStartOfDay()).endDate(today.atStartOfDay()).build();
		} else if (StringUtils.equals(vo.getFilterType(), "lastWeek")) {
			return FilterDateVO.builder().startDate(today.minusDays(7).atStartOfDay()).endDate(today.plusDays(1).atStartOfDay()).build();
		} else if (StringUtils.equals(vo.getFilterType(), "lastMonth")) {
			return FilterDateVO.builder().startDate(today.minusMonths(1).atStartOfDay()).endDate(today.plusDays(1).atStartOfDay()).build();
		} else if (StringUtils.equals(vo.getFilterType(), "last2Month")) {
			return FilterDateVO.builder().startDate(today.minusDays(60).atStartOfDay()).endDate(today.plusDays(1).atStartOfDay()).build();
		} else if (StringUtils.equals(vo.getFilterType(), "betweenDates")) {
			return FilterDateVO.builder().startDate(vo.getStartDate()).endDate(vo.getEndDate()).build();
		} else if (StringUtils.equals(vo.getFilterType(), "all")) {
			return FilterDateVO.builder().startDate(null).endDate(null).build();
		}

		return FilterDateVO.builder().build();
	}

	@Transactional
	public TaskboardVO getGroupByTask(TaskGroupByVO taskGroupByVO) throws IOException {
		List<TaskboardColumnsVO> taskboardColumnsList = null;
		long startTime = System.currentTimeMillis();
		log.info("START TASKBOARD --------------Get All Task with startTime {​}​", startTime);

		User user = userRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(YorosisContext.get().getUserName(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		List<TaskEntityVO> taskList = null;
		Integer index = taskGroupByVO.getIndex();
		if (user != null) {
			UsersVO userVo = constructDTOToVO(user);
			List<UUID> userGroupIdsList = getGroupAsUUID(userVo);
			String username = user.getFirstName() + " " + user.getLastName();
			TaskboardVO taskboardVO = setTaskboardVO(taskGroupByVO.getId(), userVo);
			taskboardColumnsList = taskboardVO.getTaskboardColumns().stream().sorted(Comparator.comparing(TaskboardColumnsVO::getColumnOrder))
					.collect(Collectors.toList());
			int startIndex = 0;
			int endIndex = 20;
			if (index != null && index > 0) {
				startIndex = index * 20;
				endIndex = startIndex + 20;
			}
//			if (StringUtils.equals(taskGroupByVO.getGroupBy(), STATUS) && (index == null || index == 0)) {
//				getTotalCount(taskGroupByVO.getId(), userVo, taskboardColumnsList, null, taskGroupByVO.getSprintId());
//			}

			FilterDateVO filterDateVO = getStartAndEndDate(taskGroupByVO);

			if (StringUtils.equals(taskGroupByVO.getGroupBy(), STATUS)) {

				if (taskGroupByVO.getSprintId() == null) {
					if (!StringUtils.equals(taskGroupByVO.getFilterType(), ALL)) {
						if (StringUtils.equals(taskGroupByVO.getFilterBy(), CREATED_DATE)) {
							taskList = gridViewRepository.getTaskboardTaskListByStatusWithCreatedDateFilter(taskGroupByVO.getId(), userVo.getUserId(),
									userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES, taskGroupByVO.getColumnName(),
									Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()));
						} else if (StringUtils.equals(taskGroupByVO.getFilterBy(), START_DATE)) {
							taskList = gridViewRepository.getTaskboardTaskListByStatusWithStartDateFilter(taskGroupByVO.getId(), userVo.getUserId(),
									userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES, taskGroupByVO.getColumnName(),
									Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()));
						} else if (StringUtils.equals(taskGroupByVO.getFilterBy(), DUE_DATE)) {
							taskList = gridViewRepository.getTaskboardTaskListByStatusWithDueDateFilter(taskGroupByVO.getId(), userVo.getUserId(),
									userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES, taskGroupByVO.getColumnName(),
									Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()));
						} else {
							taskList = taskboardTaskRepository.getTaskboardTaskListByStatus(taskGroupByVO.getId(), userVo.getUserId(), userGroupIdsList,
									YorosisContext.get().getTenantId(), YorosisConstants.YES, taskGroupByVO.getColumnName());
						}
					} else {
						taskList = taskboardTaskRepository.getTaskboardTaskListByStatus(taskGroupByVO.getId(), userVo.getUserId(), userGroupIdsList,
								YorosisContext.get().getTenantId(), YorosisConstants.YES, taskGroupByVO.getColumnName());
					}
				} else {
					if (!StringUtils.equals(taskGroupByVO.getFilterType(), ALL)) {
						if (StringUtils.equals(taskGroupByVO.getFilterBy(), CREATED_DATE)) {
							taskList = gridViewRepository.getTaskboardTaskListByStatusForSprintWithCreatedDateFilter(taskGroupByVO.getId(),
									taskGroupByVO.getSprintId(), userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES,
									taskGroupByVO.getColumnName(), Timestamp.valueOf(filterDateVO.getStartDate()),
									Timestamp.valueOf(filterDateVO.getEndDate()));
						} else if (StringUtils.equals(taskGroupByVO.getFilterBy(), START_DATE)) {
							taskList = gridViewRepository.getTaskboardTaskListByStatusForSprintWithStartDateFilter(taskGroupByVO.getId(),
									taskGroupByVO.getSprintId(), userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES,
									taskGroupByVO.getColumnName(), Timestamp.valueOf(filterDateVO.getStartDate()),
									Timestamp.valueOf(filterDateVO.getEndDate()));
						} else if (StringUtils.equals(taskGroupByVO.getFilterBy(), DUE_DATE)) {
							taskList = gridViewRepository.getTaskboardTaskListByStatusForSprintWithDueDateFilter(taskGroupByVO.getId(),
									taskGroupByVO.getSprintId(), userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES,
									taskGroupByVO.getColumnName(), Timestamp.valueOf(filterDateVO.getStartDate()),
									Timestamp.valueOf(filterDateVO.getEndDate()));
						} else {
							taskList = taskboardTaskRepository.getTaskboardTaskListByStatusForSprint(taskGroupByVO.getId(), taskGroupByVO.getSprintId(),
									userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES,
									taskGroupByVO.getColumnName());
						}
					} else {
						taskList = taskboardTaskRepository.getTaskboardTaskListByStatusForSprint(taskGroupByVO.getId(), taskGroupByVO.getSprintId(),
								userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES, taskGroupByVO.getColumnName());
					}
				}
				log.info("taskList:{}", taskList.size());

				if (taskList != null && StringUtils.isNotBlank(taskGroupByVO.getSearchByTaskId())) {
					taskList = taskList.stream().filter(f -> (filterSearchTaskId(taskGroupByVO.getSearchByTaskId(), f))).collect(Collectors.toList());
				}

				taskboardVO.setTaskboardColumnMapVO(setColumnMapVO(taskboardColumnsList, taskList, startIndex, endIndex, username, STATUS, taskGroupByVO));

			} else if (StringUtils.equals(taskGroupByVO.getGroupBy(), PRIORITY)) {

				List<TaskboardColumnsVO> priorityColumnsList = new ArrayList<>();

				priorityColumnsList.add(TaskboardColumnsVO.builder().columnName(NO_PRIORITY).columnColor(NO_PRIORITY_COLOR).columnOrder(1L).build());
				priorityColumnsList.add(TaskboardColumnsVO.builder().columnName(URGENT).columnColor(URGENT_COLOR).columnOrder(2L).build());
				priorityColumnsList.add(TaskboardColumnsVO.builder().columnName(HIGH).columnColor(HIGH_COLOR).columnOrder(3L).build());
				priorityColumnsList.add(TaskboardColumnsVO.builder().columnName(MEDIUM).columnColor(MEDIUM_COLOR).columnOrder(4L).build());
				priorityColumnsList.add(TaskboardColumnsVO.builder().columnName(LOW).columnColor(LOW_COLOR).columnOrder(5L).build());
				if (taskGroupByVO.getSprintId() == null) {
					if (!StringUtils.equals(taskGroupByVO.getFilterType(), ALL)) {
						if (StringUtils.equals(taskGroupByVO.getFilterBy(), CREATED_DATE)) {
							taskList = StringUtils.equals(taskGroupByVO.getColumnName(), NO_PRIORITY)
									? gridViewRepository.getTaskboardTaskListByNoPriorityWithCreatedDateFilter(taskGroupByVO.getId(), userVo.getUserId(),
											userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES,
											Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()))
									: gridViewRepository.getTaskboardTaskListByPriorityWithCreatedDateFilter(taskGroupByVO.getId(), userVo.getUserId(),
											userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES, taskGroupByVO.getColumnName(),
											Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()));
						} else if (StringUtils.equals(taskGroupByVO.getFilterBy(), START_DATE)) {
							taskList = StringUtils.equals(taskGroupByVO.getColumnName(), NO_PRIORITY)
									? gridViewRepository.getTaskboardTaskListByNoPriorityWithStartDateFilter(taskGroupByVO.getId(), userVo.getUserId(),
											userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES,
											Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()))
									: gridViewRepository.getTaskboardTaskListByPriorityWithStartDateFilter(taskGroupByVO.getId(), userVo.getUserId(),
											userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES, taskGroupByVO.getColumnName(),
											Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()));
						} else if (StringUtils.equals(taskGroupByVO.getFilterBy(), DUE_DATE)) {
							taskList = StringUtils.equals(taskGroupByVO.getColumnName(), NO_PRIORITY)
									? gridViewRepository.getTaskboardTaskListByNoPriorityWithDueDateFilter(taskGroupByVO.getId(), userVo.getUserId(),
											userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES,
											Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()))
									: gridViewRepository.getTaskboardTaskListByPriorityWithDueDateFilter(taskGroupByVO.getId(), userVo.getUserId(),
											userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES, taskGroupByVO.getColumnName(),
											Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()));
						} else {
							taskList = StringUtils.equals(taskGroupByVO.getColumnName(), NO_PRIORITY)
									? taskboardTaskRepository.getTaskboardTaskListByNoPriority(taskGroupByVO.getId(), userVo.getUserId(), userGroupIdsList,
											YorosisContext.get().getTenantId(), YorosisConstants.YES)
									: taskboardTaskRepository.getTaskboardTaskListByPriority(taskGroupByVO.getId(), userVo.getUserId(), userGroupIdsList,
											YorosisContext.get().getTenantId(), YorosisConstants.YES, taskGroupByVO.getColumnName());
						}
					} else {
						taskList = StringUtils.equals(taskGroupByVO.getColumnName(), NO_PRIORITY)
								? taskboardTaskRepository.getTaskboardTaskListByNoPriority(taskGroupByVO.getId(), userVo.getUserId(), userGroupIdsList,
										YorosisContext.get().getTenantId(), YorosisConstants.YES)
								: taskboardTaskRepository.getTaskboardTaskListByPriority(taskGroupByVO.getId(), userVo.getUserId(), userGroupIdsList,
										YorosisContext.get().getTenantId(), YorosisConstants.YES, taskGroupByVO.getColumnName());
					}
				} else {
					if (!StringUtils.equals(taskGroupByVO.getFilterType(), ALL)) {
						if (StringUtils.equals(taskGroupByVO.getFilterBy(), CREATED_DATE)) {
							taskList = StringUtils.equals(taskGroupByVO.getColumnName(), NO_PRIORITY)
									? gridViewRepository.getTaskboardTaskListByNoPriorityForSprintWithCreatedDateFilter(taskGroupByVO.getId(),
											taskGroupByVO.getSprintId(), userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(),
											YorosisConstants.YES, Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()))
									: gridViewRepository.getTaskboardTaskListByPriorityForSprintWithCreatedDateFilter(taskGroupByVO.getId(),
											taskGroupByVO.getSprintId(), userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(),
											YorosisConstants.YES, taskGroupByVO.getColumnName(), Timestamp.valueOf(filterDateVO.getStartDate()),
											Timestamp.valueOf(filterDateVO.getEndDate()));
						} else if (StringUtils.equals(taskGroupByVO.getFilterBy(), START_DATE)) {
							taskList = StringUtils.equals(taskGroupByVO.getColumnName(), NO_PRIORITY)
									? gridViewRepository.getTaskboardTaskListByNoPriorityForSprintWithStartDateFilter(taskGroupByVO.getId(),
											taskGroupByVO.getSprintId(), userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(),
											YorosisConstants.YES, Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()))
									: gridViewRepository.getTaskboardTaskListByPriorityForSprintWithStartDateFilter(taskGroupByVO.getId(),
											taskGroupByVO.getSprintId(), userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(),
											YorosisConstants.YES, taskGroupByVO.getColumnName(), Timestamp.valueOf(filterDateVO.getStartDate()),
											Timestamp.valueOf(filterDateVO.getEndDate()));
						} else if (StringUtils.equals(taskGroupByVO.getFilterBy(), DUE_DATE)) {
							taskList = StringUtils.equals(taskGroupByVO.getColumnName(), NO_PRIORITY)
									? gridViewRepository.getTaskboardTaskListByNoPriorityForSprintWithDueDateFilter(taskGroupByVO.getId(),
											taskGroupByVO.getSprintId(), userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(),
											YorosisConstants.YES, Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()))
									: gridViewRepository.getTaskboardTaskListByPriorityForSprintWithDueDateFilter(taskGroupByVO.getId(),
											taskGroupByVO.getSprintId(), userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(),
											YorosisConstants.YES, taskGroupByVO.getColumnName(), Timestamp.valueOf(filterDateVO.getStartDate()),
											Timestamp.valueOf(filterDateVO.getEndDate()));
						} else {
							taskList = StringUtils.equals(taskGroupByVO.getColumnName(), NO_PRIORITY)
									? taskboardTaskRepository.getTaskboardTaskListByNoPriorityForSprint(taskGroupByVO.getId(), taskGroupByVO.getSprintId(),
											userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES)
									: taskboardTaskRepository.getTaskboardTaskListByPriorityForSprint(taskGroupByVO.getId(), taskGroupByVO.getSprintId(),
											userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES,
											taskGroupByVO.getColumnName());
						}
					} else {
						taskList = StringUtils.equals(taskGroupByVO.getColumnName(), NO_PRIORITY)
								? taskboardTaskRepository.getTaskboardTaskListByNoPriorityForSprint(taskGroupByVO.getId(), taskGroupByVO.getSprintId(),
										userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES)
								: taskboardTaskRepository.getTaskboardTaskListByPriorityForSprint(taskGroupByVO.getId(), taskGroupByVO.getSprintId(),
										userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES,
										taskGroupByVO.getColumnName());
					}
				}

				if (taskList != null && StringUtils.isNotBlank(taskGroupByVO.getSearchByTaskId())) {
					taskList = taskList.stream().filter(f -> (filterSearchTaskId(taskGroupByVO.getSearchByTaskId(), f))).collect(Collectors.toList());
				}
				log.info("taskList:{}", taskList != null ? taskList.size() : "null");

				taskboardVO.setTaskboardColumnMapVO(setColumnMapVO(priorityColumnsList, taskList, startIndex, endIndex, username, PRIORITY, taskGroupByVO));

			} else if (StringUtils.equals(taskGroupByVO.getGroupBy(), ASSIGNEE)) {

				if (taskGroupByVO.getSprintId() == null) {
					if (!StringUtils.equals(taskGroupByVO.getFilterType(), ALL)) {
						if (StringUtils.equals(taskGroupByVO.getFilterBy(), CREATED_DATE)) {
							taskList = gridViewRepository.getTaskboardTaskListByAssigneeWithCreatedDateFilter(taskGroupByVO.getId(), userVo.getUserId(),
									userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES, Timestamp.valueOf(filterDateVO.getStartDate()),
									Timestamp.valueOf(filterDateVO.getEndDate()));
						} else if (StringUtils.equals(taskGroupByVO.getFilterBy(), START_DATE)) {
							taskList = gridViewRepository.getTaskboardTaskListByAssigneeWithStartDateFilter(taskGroupByVO.getId(), userVo.getUserId(),
									userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES, Timestamp.valueOf(filterDateVO.getStartDate()),
									Timestamp.valueOf(filterDateVO.getEndDate()));
						} else if (StringUtils.equals(taskGroupByVO.getFilterBy(), DUE_DATE)) {
							taskList = gridViewRepository.getTaskboardTaskListByAssigneeWithDueDateFilter(taskGroupByVO.getId(), userVo.getUserId(),
									userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES, Timestamp.valueOf(filterDateVO.getStartDate()),
									Timestamp.valueOf(filterDateVO.getEndDate()));
						} else {
							taskList = taskboardTaskRepository.getTaskboardTaskListByAssignee(taskGroupByVO.getId(), userVo.getUserId(), userGroupIdsList,
									YorosisContext.get().getTenantId(), YorosisConstants.YES);

						}
					} else {
						taskList = taskboardTaskRepository.getTaskboardTaskListByAssignee(taskGroupByVO.getId(), userVo.getUserId(), userGroupIdsList,
								YorosisContext.get().getTenantId(), YorosisConstants.YES);

					}
				} else {
					if (!StringUtils.equals(taskGroupByVO.getFilterType(), ALL)) {
						if (StringUtils.equals(taskGroupByVO.getFilterBy(), CREATED_DATE)) {
							taskList = gridViewRepository.getTaskboardTaskListByAssigneeForSprintWithCreatedDateFilter(taskGroupByVO.getId(),
									taskGroupByVO.getSprintId(), userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES,
									Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()));
						} else if (StringUtils.equals(taskGroupByVO.getFilterBy(), START_DATE)) {
							taskList = gridViewRepository.getTaskboardTaskListByAssigneeForSprintWithStartDateFilter(taskGroupByVO.getId(),
									taskGroupByVO.getSprintId(), userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES,
									Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()));
						} else if (StringUtils.equals(taskGroupByVO.getFilterBy(), DUE_DATE)) {
							taskList = gridViewRepository.getTaskboardTaskListByAssigneeForSprintWithDueDateFilter(taskGroupByVO.getId(),
									taskGroupByVO.getSprintId(), userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES,
									Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()));
						} else {
							taskList = taskboardTaskRepository.getTaskboardTaskListByAssigneeForSprint(taskGroupByVO.getId(), taskGroupByVO.getSprintId(),
									userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES);
						}
					} else {
						taskList = taskboardTaskRepository.getTaskboardTaskListByAssigneeForSprint(taskGroupByVO.getId(), taskGroupByVO.getSprintId(),
								userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES);
					}
				}

				if (taskList != null && StringUtils.isNotBlank(taskGroupByVO.getSearchByTaskId())) {
					taskList = taskList.stream().filter(f -> (filterSearchTaskId(taskGroupByVO.getSearchByTaskId(), f))).collect(Collectors.toList());
				}

				Map<String, TaskboardColumnsVO> assigneeMap = new LinkedHashMap<>();
				List<TaskboardColumnsVO> assigneeColumnsList = new ArrayList<>();

				List<UserFieldVO> userFieldVOList = new ArrayList<>();

				if (StringUtils.equals(taskGroupByVO.getColumnName(), UNASSIGNED)) {
					userFieldVOList.add(UserFieldVO.builder().name(UNASSIGNED).color(BLACK).build());

					assigneeMap.put(UNASSIGNED,
							TaskboardColumnsVO.builder().columnName(UNASSIGNED).columnColor(WHITE).columnOrder(1L).userFieldList(userFieldVOList).build());

					assigneeColumnsList.add(assigneeMap.get(UNASSIGNED));
				}

				Long i = 2L;

				if (!StringUtils.equals(taskGroupByVO.getColumnName(), UNASSIGNED)) {
					for (TaskEntityVO taskEntityVO : taskList) {
						String assigneeUsers = getUsername(taskEntityVO, taskList);
						if (assigneeUsers != null && StringUtils.isNotBlank(assigneeUsers) && !assigneeMap.containsKey(assigneeUsers)
								&& StringUtils.equals(assigneeUsers, taskGroupByVO.getColumnName())) {
							i++;
							assigneeMap.put(assigneeUsers, TaskboardColumnsVO.builder().columnName(assigneeUsers)
									.userFieldList(getUserField(taskEntityVO, taskList)).columnOrder(i).build());

							log.info("assigneeUsers:{}", assigneeUsers);
							assigneeColumnsList.add(assigneeMap.get(assigneeUsers));
							break;
						}
					}
				}

				log.info("assigneeColumnsList:{}", assigneeColumnsList);
				log.info("assigneeIndex:{}", taskGroupByVO.getAssigneeIndex());
				log.info("assigneeColumnsListSize:{}", assigneeColumnsList.size());

				taskboardVO.setTaskboardColumnMapVO(BooleanUtils.isTrue(taskGroupByVO.getIsForCount())
						? getAssigneeOrPriorityCount(assigneeColumnsList, taskList, username, ASSIGNEE, taskGroupByVO)
						: setColumnMapVO(assigneeColumnsList, taskList, startIndex, endIndex, username, ASSIGNEE, taskGroupByVO));
			}

			if (index == 0) {
				taskboardVO.setTaskboardColumns(taskboardColumnsList);

				taskboardVO.setTaskboardSecurity(BooleanUtils.isTrue(taskboardVO.getIsTaskBoardOwner())
						? ResolveSecurityForTaskboardVO.builder().read(true).update(true).delete(true).build()
						: getResolvedTaskboardSecurity(taskGroupByVO.getId()));
			}

			return taskboardVO;
		}
		return null;
	}

	private int getCount(TaskboardColumnsVO taskboardColumnsVO, List<TaskEntityVO> taskList, String status, String username, TaskGroupByVO taskGroupByVO)
			throws IOException {
		List<TaskboardTaskVO> taskboardTaskList = new ArrayList<>();
		List<UUID> uuidList = new ArrayList<>();
		for (TaskEntityVO taskEntityVO : taskList) {

			String columnName = null;
			if (StringUtils.equals(status, ASSIGNEE)) {
				String assigneeName = getUsername(taskEntityVO, taskList);
				columnName = StringUtils.isNotBlank(assigneeName) ? assigneeName : UNASSIGNED;
			} else if (StringUtils.equals(status, PRIORITY)) {
				if (StringUtils.isNotBlank(taskEntityVO.getPriority())) {
					columnName = taskEntityVO.getPriority();
				} else {
					columnName = NO_PRIORITY;
				}
			}
			UUID id = UUID.fromString(taskEntityVO.getId());
			if (StringUtils.equals(columnName, taskboardColumnsVO.getColumnName()) && StringUtils.equals(taskEntityVO.getTaskType(), PARENT_TASK)
					&& !uuidList.contains(id)) {
				uuidList.add(id);
				taskboardTaskList.add(contructTaskDtoToVo(taskEntityVO, taskList, username));
				List<SubTaskVO> subTaskList = hasSubTask(taskList, id, taskboardTaskList, username);
				List<TaskboardTaskVO> parentTaskList = taskboardTaskList.stream().filter(t -> StringUtils.equals(t.getId().toString(), taskEntityVO.getId()))
						.collect(Collectors.toList());
				if (parentTaskList != null && !parentTaskList.isEmpty()) {
					parentTaskList.get(0).setSubTaskLength(subTaskList.size());
					parentTaskList.get(0).setSubTasks(subTaskList);
				}
				Collections.sort(taskboardTaskList, TaskboardTaskVO.DisplayOrderComparator);
			}
		}

		taskboardTaskList = applyFilter(status, taskGroupByVO, taskboardTaskList);
		return taskboardTaskList.size();
	}
}
