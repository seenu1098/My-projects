package com.yorosis.yoroflow.services;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.databind.JsonNode;
import com.yorosis.yoroflow.entities.ProcessDefinition;
import com.yorosis.yoroflow.entities.ProcessDefinitionTask;
import com.yorosis.yoroflow.entities.ProcessInstanceTask;
import com.yorosis.yoroflow.entities.Taskboard;
import com.yorosis.yoroflow.entities.TaskboardColumns;
import com.yorosis.yoroflow.entities.TaskboardSubStatus;
import com.yorosis.yoroflow.entities.TaskboardTask;
import com.yorosis.yoroflow.entities.TaskboardTaskAssignedUsers;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.FilterValueVO;
import com.yorosis.yoroflow.models.GroupVO;
import com.yorosis.yoroflow.models.PaginationVO;
import com.yorosis.yoroflow.models.UsersVO;
import com.yorosis.yoroflow.models.landingpage.AssignToVO;
import com.yorosis.yoroflow.models.landingpage.BoardNameVo;
import com.yorosis.yoroflow.models.landingpage.LandingPageCountVO;
import com.yorosis.yoroflow.models.landingpage.LandingPageGraphVo;
import com.yorosis.yoroflow.models.landingpage.LandingPageTaskBoardVO;
import com.yorosis.yoroflow.models.landingpage.LatestWorkflowVO;
import com.yorosis.yoroflow.models.landingpage.StatusVo;
import com.yorosis.yoroflow.models.landingpage.SubStatusVo;
import com.yorosis.yoroflow.models.landingpage.TaskBoardFilterDataVo;
import com.yorosis.yoroflow.models.landingpage.TaskboardTaskVo;
import com.yorosis.yoroflow.models.landingpage.WorkflowTaskVO;
import com.yorosis.yoroflow.models.landingpage.WorkflowVO;
import com.yorosis.yoroflow.repository.ProcessDefinitionRepo;
import com.yorosis.yoroflow.repository.ProcessInstanceTaskRepo;
import com.yorosis.yoroflow.repository.TaskboardRepository;
import com.yorosis.yoroflow.repository.TaskboardTaskRepository;
import com.yorosis.yoroflow.repository.WorkspaceRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class LandingPageService {

	@Autowired
	private ProcessInstanceTaskRepo processInstanceTaskRepo;

	@Autowired
	private TaskboardTaskRepository taskboardTaskRepository;

	@Autowired
	private UserService userService;

	@Autowired
	private TaskboardRepository taskboardRepository;

	@Autowired
	private ProcessDefinitionRepo processDefinitionRepo;
	
	@Autowired
	private WorkspaceRepository workspaceRepository;

	private static final String STARTDATE = "Created Date";
	private static final String DUEDATE = "Due Date";
	private static final String TASKNAME = "Task Name";
	private static final String TASKID = "task_id";
	private static final String BOARDNAME = "board_name";
	private static final String TASKNAMETASKBOARD = "task_name";
	private static final String CREATEDON = "created_on";
	private static final String DUEON = "due_date";
	private static final String SUBSTATUS = "sub_status";
	private static final String STATUS = "status";
	private static final String ASSIGNTO = "assignedTo";
	private static final String ASSIGNTOUSERWORKFLOW = "assignedToUserWorkflow";
	private static final String ASSIGNTOGROUPWORKFLOW = "assignedToGroupWorkflow";
	private static final String UNASSIGNED = "unAssigned";

	protected Pageable getPageable(PaginationVO vo, boolean hasFilter) {
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
		if (hasFilter && sort != null) {
			return PageRequest.of(0, 100000, sort);
		} else if (hasFilter) {
			return PageRequest.of(0, 100000);
		}

		if (sort != null) {
			return PageRequest.of(vo.getIndex(), pageSize, sort);
		}
		return PageRequest.of(vo.getIndex(), pageSize);
	}

	protected Pageable getPageableWithoutSort(PaginationVO vo, boolean hasFilter) {
		int pageSize = 10;
		if (vo.getSize() > 0) {
			pageSize = vo.getSize();
		}
		return PageRequest.of(vo.getIndex(), pageSize);
	}

	@Transactional
	public LandingPageCountVO getLandingPageCount(UUID workspaceId) {
		int workflow = 0;
		int workflowDue = 0;
		int taskBoardTask = 0;
		int taskBoardDue = 0;
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = getGroupAsUUID(userVO);
		LocalDateTime date = LocalDateTime.now().plus(2, ChronoUnit.YEARS);
		workflow = processInstanceTaskRepo.getProcessTasksCount(userGroupIdsList, userVO.getUserId(),
				YorosisContext.get().getTenantId(), date, workspaceId);
		workflowDue = processInstanceTaskRepo.getDueTasksCount(userGroupIdsList, userVO.getUserId(),
				YorosisContext.get().getTenantId(), LocalDateTime.now(), workspaceId);
		List<TaskboardTask> taskboardTaskList = taskboardTaskRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
				userVO.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES,
				workspaceId);
		for (TaskboardTask subTask : taskboardTaskList) {
			Timestamp timestamp = new Timestamp(System.currentTimeMillis());
			if (subTask.getDueDate() != null && subTask.getDueDate().before(timestamp)) {
				taskBoardDue++;
			}
			taskBoardTask++;
		}
		return LandingPageCountVO.builder().workflow(String.valueOf(workflow)).taskBoard(String.valueOf(taskBoardTask))
				.all(String.valueOf(taskBoardTask + workflow)).dueDate(String.valueOf(workflowDue + taskBoardDue))
				.build();
	}

	@Transactional
	public LandingPageGraphVo getGraphData(String filterType, UUID workspaceId) {
		LocalDate today = LocalDate.now();
		if (StringUtils.equals(filterType, "last60Days")) {
			return getGraphQuery(today.minusDays(60).atStartOfDay(), today.plusDays(1).atStartOfDay(), workspaceId);
		} else if (StringUtils.equals(filterType, "lastMonth")) {
			return getGraphQuery(today.minusMonths(1).withDayOfMonth(1).atStartOfDay(),
					today.withDayOfMonth(1).atStartOfDay(), workspaceId);
		} else if (StringUtils.equals(filterType, "thisMonth")) {
			return getGraphQuery(today.withDayOfMonth(1).atStartOfDay(), today.plusDays(1).atStartOfDay(), workspaceId);
		} else if (StringUtils.equals(filterType, "lastWeek")) {
			return getGraphQuery(today.minusWeeks(2).atStartOfDay(), today.minusWeeks(1).atStartOfDay(), workspaceId);
		} else if (StringUtils.equals(filterType, "thisWeek")) {
			return getGraphQuery(today.minusWeeks(1).atStartOfDay(), today.plusDays(1).atStartOfDay(), workspaceId);
		}
		return LandingPageGraphVo.builder().build();
	}

	private LandingPageGraphVo getGraphQuery(LocalDateTime startDate, LocalDateTime endDate, UUID workspaceId) {
		int workflowProcess = 0;
		int workflowCompleted = 0;
		int taskBoardTodoTask = 0;
		int taskBoardProcessTask = 0;
		int taskBoardDoneTask = 0;
		int workflowDue = 0;
		int taskboardTaskDue = 0;
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = getGroupAsUUID(userVO);
		workflowProcess = processInstanceTaskRepo.getProcessTasksCountBasedOnFilter(userGroupIdsList,
				userVO.getUserId(), YorosisContext.get().getTenantId(), startDate, endDate, workspaceId);
		workflowCompleted = processInstanceTaskRepo.getCompletedTasksCountBasedOnFilter(userGroupIdsList,
				userVO.getUserId(), YorosisContext.get().getTenantId(), startDate, endDate, workspaceId);
		workflowDue = processInstanceTaskRepo.getProcessDueTasksCountBasedOnFilter(userGroupIdsList, userVO.getUserId(),
				YorosisContext.get().getTenantId(), startDate, endDate, workspaceId);
		List<TaskboardTask> taskboardTaskList = taskboardTaskRepository
				.getTaskByTenantIdIgnoreCaseAndActiveFlagIgnoreCaseAndDate(userVO.getUserId(), userGroupIdsList,
						YorosisContext.get().getTenantId(), YorosisConstants.YES, Timestamp.valueOf(startDate),
						Timestamp.valueOf(endDate), workspaceId);
		for (TaskboardTask subTask : taskboardTaskList) {
			Timestamp timestamp = new Timestamp(System.currentTimeMillis());
			if (StringUtils.equals(subTask.getStatus(), "Todo")) {
				taskBoardTodoTask++;
			} else if (StringUtils.equals(subTask.getStatus(), "Done")) {
				taskBoardDoneTask++;
			} else {
				taskBoardProcessTask++;
			}
			if (subTask.getDueDate() != null && subTask.getDueDate().before(timestamp)) {
				taskboardTaskDue++;
			}
		}
		return LandingPageGraphVo.builder().workflowAll(String.valueOf(workflowProcess + workflowCompleted))
				.taskBoardAll(String.valueOf(taskBoardDoneTask + taskBoardProcessTask + taskBoardTodoTask))
				.dueAll(String.valueOf(taskboardTaskDue + workflowDue)).taskBoardTodo(String.valueOf(taskBoardTodoTask))
				.taskBoardProgress(String.valueOf(taskBoardProcessTask))
				.taskBoardDone(String.valueOf(taskBoardDoneTask)).workflowProcess(String.valueOf(workflowProcess))
				.workflowCompleted(String.valueOf(workflowCompleted)).workflowDueDate(String.valueOf(workflowDue))
				.taskBoardDueDate(String.valueOf(taskboardTaskDue)).build();
	}

	@Transactional
	public TaskboardTaskVo getDataForTaskBoardTask(PaginationVO vo, UUID workspaceId) {
		LocalDate today = LocalDate.now();
		if (StringUtils.equals(vo.getTaskStatus(), "all")) {
			return getTaskBoardTask(today.minusYears(10).atStartOfDay(), today.plusYears(10).atStartOfDay(), vo,
					workspaceId);
		} else if (StringUtils.equals(vo.getTaskStatus(), "pastDue")) {
			return getTaskBoardTask(today.minusYears(10).atStartOfDay(), LocalDateTime.now(), vo, workspaceId);
		} else if (StringUtils.equals(vo.getTaskStatus(), "dueToday")) {
			return getTaskBoardTask(today.atStartOfDay(), today.plusDays(1).atStartOfDay(), vo, workspaceId);
		} else if (StringUtils.equals(vo.getTaskStatus(), "dueTomorrow")) {
			return getTaskBoardTask(today.plusDays(1).atStartOfDay(), today.plusDays(2).atStartOfDay(), vo,
					workspaceId);
		} else if (StringUtils.equals(vo.getTaskStatus(), "dueInSevenDays")) {
			return getTaskBoardTask(today.atStartOfDay(), today.plusDays(7).atStartOfDay(), vo, workspaceId);
		}
		return TaskboardTaskVo.builder().build();
	}

	@Transactional
	public TaskBoardFilterDataVo getSubStatusListForDoneColumn(PaginationVO vo) {
		List<SubStatusVo> subStatusList = new ArrayList<>();
		List<StatusVo> statusList = new ArrayList<>();
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<TaskboardTask> taskboardTaskList = StringUtils.equals(vo.getFilterColumnName(), "deleted")
				? taskboardTaskRepository.getDeletedTaskWithoutFilterForSubStatus(vo.getTaskboardId(),
						YorosisContext.get().getTenantId(), YorosisConstants.NO)
				: taskboardTaskRepository.getDoneTaskWithoutFilter(vo.getFilterColumnName(), userVO.getUserId(),
						vo.getTaskboardId(), YorosisContext.get().getTenantId(), YorosisConstants.YES, null);
		getconstructStatusVo(taskboardTaskList, statusList, subStatusList);
		return TaskBoardFilterDataVo.builder().statusList(statusList).subStatusList(subStatusList).build();
	}

	@Transactional
	public TaskboardTaskVo getDoneTaskboardTask(PaginationVO vo) {
		List<TaskboardTask> taskboardTaskList = null;
		List<LandingPageTaskBoardVO> landingPageTaskBoardVO = new ArrayList<>();
		TaskboardTaskVo taskboardTaskTaskByFilter = TaskboardTaskVo.builder().build();
		List<String> subStatus = new ArrayList<>();
		List<String> status = new ArrayList<>();
		List<UUID> userList = new ArrayList<>();
		Boolean unassigned = false;
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = getGroupAsUUID(userVO);
		if (vo.getFilterValue() != null && vo.getFilterValue().length != 0) {
			Pageable pageable = getPageable(vo, true);
			for (FilterValueVO fValue : vo.getFilterValue()) {
				if (StringUtils.equals(fValue.getFilterIdColumn(), SUBSTATUS)) {
					subStatus.add(fValue.getFilterIdColumnValue());
				}
				if (StringUtils.equals(fValue.getFilterIdColumn(), STATUS)) {
					status.add(fValue.getFilterIdColumnValue());
				}
				if (StringUtils.equals(fValue.getFilterIdColumn(), ASSIGNTO)
						&& StringUtils.equals(fValue.getFilterIdColumnValue(), UNASSIGNED)) {
					unassigned = true;
				}
				if (StringUtils.equals(fValue.getFilterIdColumn(), ASSIGNTO)
						&& !StringUtils.equals(fValue.getFilterIdColumnValue(), UNASSIGNED)) {
					userList.add(UUID.fromString(fValue.getFilterIdColumnValue()));
				}

				if (!userList.isEmpty() && BooleanUtils.isFalse(unassigned)) {
					taskboardTaskList = StringUtils.equals(vo.getFilterColumnName(), "deleted")
							? taskboardTaskRepository.getDeletedTaskWithAssignedUser(vo.getTaskboardId(), userList,
									YorosisContext.get().getTenantId(), YorosisConstants.YES, pageable)
							: taskboardTaskRepository.getDoneTaskWithAssignedUser(vo.getFilterColumnName(),
									userVO.getUserId(), userGroupIdsList, vo.getTaskboardId(), userList,
									YorosisContext.get().getTenantId(), YorosisConstants.YES, pageable);
				} else if (!userList.isEmpty() && BooleanUtils.isTrue(unassigned)) {
					taskboardTaskList = StringUtils.equals(vo.getFilterColumnName(), "deleted")
							? taskboardTaskRepository.getDeletedTaskWithAssignedAndUnAssignedUser(vo.getTaskboardId(),
									userList, YorosisContext.get().getTenantId(), YorosisConstants.YES, pageable)
							: taskboardTaskRepository.getDoneTaskWithAssignedAndUnAssignedUser(vo.getFilterColumnName(),
									userVO.getUserId(), userGroupIdsList, vo.getTaskboardId(), userList,
									YorosisContext.get().getTenantId(), YorosisConstants.YES, pageable);
				} else if (userList.isEmpty() && BooleanUtils.isTrue(unassigned)) {
					taskboardTaskList = StringUtils.equals(vo.getFilterColumnName(), "deleted")
							? taskboardTaskRepository.getDeletedTaskWithUnAssignedUser(vo.getTaskboardId(),
									YorosisContext.get().getTenantId(), YorosisConstants.YES, pageable)
							: taskboardTaskRepository.getDoneTaskWithUnAssignedUser(vo.getFilterColumnName(),
									userVO.getUserId(), userGroupIdsList, vo.getTaskboardId(),
									YorosisContext.get().getTenantId(), YorosisConstants.YES, pageable);
				} else {
					taskboardTaskList = StringUtils.equals(vo.getFilterColumnName(), "deleted")
							? taskboardTaskRepository.getDeletedTaskWithoutFilter(vo.getTaskboardId(),
									YorosisContext.get().getTenantId(), pageable)
							: taskboardTaskRepository.getDoneTaskWithoutFilter(vo.getFilterColumnName(),
									userVO.getUserId(), vo.getTaskboardId(), YorosisContext.get().getTenantId(),
									YorosisConstants.YES, pageable);
				}
			}
			if (!status.isEmpty()) {
				taskboardTaskList = taskboardTaskList.stream().filter(f -> (status.contains(f.getStatus())))
						.collect(Collectors.toList());
			}
			if (!subStatus.isEmpty()) {
				taskboardTaskList = taskboardTaskList.stream().filter(f -> (subStatus.contains(f.getSubStatus())))
						.collect(Collectors.toList());
			}
			taskboardTaskTaskByFilter = getTaskboardTaskTaskByFilter(vo, taskboardTaskList, landingPageTaskBoardVO);

		} else {
			Pageable pageable = getPageable(vo, true);
			taskboardTaskList = StringUtils.equals(vo.getFilterColumnName(), "deleted")
					? taskboardTaskRepository.getDeletedTaskWithoutFilter(vo.getTaskboardId(),
							YorosisContext.get().getTenantId(), pageable)
					: taskboardTaskRepository.getDoneTaskWithoutFilter(vo.getFilterColumnName(), userVO.getUserId(),
							vo.getTaskboardId(), YorosisContext.get().getTenantId(), YorosisConstants.YES, pageable);
			if (taskboardTaskList != null && !taskboardTaskList.isEmpty()) {
				taskboardTaskTaskByFilter = getTaskboardTaskTaskByFilter(vo, taskboardTaskList, landingPageTaskBoardVO);
			}
		}

		return taskboardTaskTaskByFilter;
	}

	private TaskboardTaskVo getTaskBoardTask(LocalDateTime startDate, LocalDateTime endDate, PaginationVO vo,
			UUID workspaceId) {
		List<TaskboardTask> taskboardTaskList = new ArrayList<>();
		List<LandingPageTaskBoardVO> LandingPageTaskBoardVO = new ArrayList<>();
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = getGroupAsUUID(userVO);
		List<String> boardName = new ArrayList<>();
		List<String> status = new ArrayList<>();
		List<String> subStatus = new ArrayList<>();
		List<UUID> userList = new ArrayList<>();
		Boolean unassigned = false;
		if (vo.getFilterValue() != null && vo.getFilterValue().length != 0) {
			for (FilterValueVO fValue : vo.getFilterValue()) {
				if (StringUtils.equals(fValue.getFilterIdColumn(), BOARDNAME)) {
					boardName.add(fValue.getFilterIdColumnValue());
				}
				if (StringUtils.equals(fValue.getFilterIdColumn(), STATUS)) {
					status.add(fValue.getFilterIdColumnValue());
				}
				if (StringUtils.equals(fValue.getFilterIdColumn(), SUBSTATUS)) {
					subStatus.add(fValue.getFilterIdColumnValue());
				}
				if (StringUtils.equals(fValue.getFilterIdColumn(), ASSIGNTO)
						&& StringUtils.equals(fValue.getFilterIdColumnValue(), UNASSIGNED)) {
					unassigned = true;
				}
				if (StringUtils.equals(fValue.getFilterIdColumn(), ASSIGNTO)
						&& !StringUtils.equals(fValue.getFilterIdColumnValue(), UNASSIGNED)) {
					userList.add(UUID.fromString(fValue.getFilterIdColumnValue()));
				}
			}
			Pageable pageable = getPageable(vo, true);
			if (StringUtils.equals(vo.getTaskStatus(), "all")) {
				if (!userList.isEmpty() && BooleanUtils.isFalse(unassigned)) {
					taskboardTaskList = taskboardTaskRepository
							.getTaskBasedOnTenantIdIgnoreCaseAndActiveFlagIgnoreCaseWithUserFilter(userVO.getUserId(),
									userGroupIdsList, userList, YorosisContext.get().getTenantId(),
									YorosisConstants.YES, pageable, workspaceId);
				} else if (!userList.isEmpty() && BooleanUtils.isTrue(unassigned)) {
					taskboardTaskList = taskboardTaskRepository
							.getTaskBasedOnTenantIdIgnoreCaseAndActiveFlagIgnoreCaseUnAssignedAndUser(
									userVO.getUserId(), userGroupIdsList, userList, YorosisContext.get().getTenantId(),
									YorosisConstants.YES, pageable, workspaceId);
				} else if (userList.isEmpty() && BooleanUtils.isTrue(unassigned)) {
					taskboardTaskList = taskboardTaskRepository
							.getTaskBasedOnTenantIdIgnoreCaseAndActiveFlagIgnoreCaseUnassigned(userVO.getUserId(),
									userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES,
									pageable, workspaceId);
				} else {
					taskboardTaskList = taskboardTaskRepository
							.getByTenantIdIgnoreCaseAndActiveFlagIgnoreCaseWithPagination(userVO.getUserId(),
									userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES,
									pageable, workspaceId);
				}
			} else {
				if (!userList.isEmpty() && BooleanUtils.isFalse(unassigned)) {
					taskboardTaskList = taskboardTaskRepository
							.getTaskBasedOnDueDateTenantIdIgnoreCaseAndActiveFlagIgnoreCaseWithUserFilter(
									userVO.getUserId(), userGroupIdsList, userList, YorosisContext.get().getTenantId(),
									YorosisConstants.YES, Timestamp.valueOf(startDate), Timestamp.valueOf(endDate),
									pageable, workspaceId);
				} else if (!userList.isEmpty() && BooleanUtils.isTrue(unassigned)) {
					taskboardTaskList = taskboardTaskRepository
							.getTaskBasedOnDueDateTenantIdIgnoreCaseAndActiveFlagIgnoreCaseUnAssignedAndUser(
									userVO.getUserId(), userGroupIdsList, userList, YorosisContext.get().getTenantId(),
									YorosisConstants.YES, Timestamp.valueOf(startDate), Timestamp.valueOf(endDate),
									pageable, workspaceId);
				} else if (userList.isEmpty() && BooleanUtils.isTrue(unassigned)) {
					taskboardTaskList = taskboardTaskRepository
							.getTaskBasedOnDueDateTenantIdIgnoreCaseAndActiveFlagIgnoreCaseUnassigned(
									userVO.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(),
									YorosisConstants.YES, Timestamp.valueOf(startDate), Timestamp.valueOf(endDate),
									pageable, workspaceId);
				} else {
					taskboardTaskList = taskboardTaskRepository
							.getTaskBasedOnDueDateTenantIdIgnoreCaseAndActiveFlagIgnoreCase(userVO.getUserId(),
									userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES,
									Timestamp.valueOf(startDate), Timestamp.valueOf(endDate), pageable, workspaceId);
				}
			}
			if (!boardName.isEmpty()) {
				taskboardTaskList = taskboardTaskList.stream()
						.filter(f -> (boardName.contains(f.getTaskboard().getName()))).collect(Collectors.toList());
			}
			if (!status.isEmpty()) {
				taskboardTaskList = taskboardTaskList.stream().filter(f -> (status.contains(f.getStatus())))
						.collect(Collectors.toList());
			}
			if (!subStatus.isEmpty()) {
				taskboardTaskList = taskboardTaskList.stream().filter(f -> (subStatus.contains(f.getSubStatus())))
						.collect(Collectors.toList());
			}
			return getTaskboardTaskTaskByFilter(vo, taskboardTaskList, LandingPageTaskBoardVO);
		} else {
			Pageable pageable = getPageable(vo, false);
			int taskboardTaskCount = 0;
			if (StringUtils.equals(vo.getTaskStatus(), "all")) {
				taskboardTaskList = taskboardTaskRepository
						.getByTenantIdIgnoreCaseAndActiveFlagIgnoreCaseWithPagination(userVO.getUserId(),
								userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES, pageable,
								workspaceId);
				taskboardTaskCount = taskboardTaskRepository
						.getByTenantIdIgnoreCaseAndActiveFlagIgnoreCaseWithPaginationCount(userVO.getUserId(),
								userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES,
								workspaceId);
			} else {
				taskboardTaskList = taskboardTaskRepository
						.getTaskBasedOnDueDateTenantIdIgnoreCaseAndActiveFlagIgnoreCase(userVO.getUserId(),
								userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES,
								Timestamp.valueOf(startDate), Timestamp.valueOf(endDate), pageable, workspaceId);

				taskboardTaskCount = taskboardTaskRepository
						.getTaskBasedOnDueDateTenantIdIgnoreCaseAndActiveFlagIgnoreCaseCount(userVO.getUserId(),
								userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES,
								Timestamp.valueOf(startDate), Timestamp.valueOf(endDate), workspaceId);
			}
			for (TaskboardTask task : taskboardTaskList) {
				LandingPageTaskBoardVO.add(constructTaskVoToDto(task, vo));
			}
			return TaskboardTaskVo.builder().taskboardTaskVo(LandingPageTaskBoardVO)
					.totalRecords(String.valueOf(taskboardTaskCount)).build();
		}
	}

	@Transactional
	private LandingPageTaskBoardVO constructTaskVoToDto(TaskboardTask subTask, PaginationVO pagination) {
		List<String> assignUserTaskVOList = new ArrayList<>();
		int subTaskCount = 0;
		String statusColor = null;
		String subStatusColor = null;
		if (subTask.getTaskboardTaskAssignedUsers() != null) {
			assignUserTaskVOList = subTask.getTaskboardTaskAssignedUsers().stream()
					.filter(assignedUserTask -> assignedUserTask.getUserId() != null
							&& StringUtils.equals(assignedUserTask.getActiveFlag(), YorosisConstants.YES))
					.map(this::getUserName).collect(Collectors.toList());
		}
		subTaskCount = taskboardTaskRepository.getCountByParentTaskIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
				subTask.getId(), YorosisContext.get().getTenantId(),
				StringUtils.equals(pagination.getFilterColumnName(), "deleted") ? YorosisConstants.NO
						: YorosisConstants.YES);
		List<TaskboardColumns> taskboardColumn = subTask.getTaskboard().getTaskboardColumns().stream()
				.filter(f -> StringUtils.equals(f.getColumnName(), subTask.getStatus())).collect(Collectors.toList());
		if (taskboardColumn != null && !taskboardColumn.isEmpty())
			statusColor = taskboardColumn.get(0).getColumnColor();
		if (taskboardColumn != null && !taskboardColumn.isEmpty() && !StringUtils.isEmpty(subTask.getSubStatus())
				&& taskboardColumn.get(0).getTaskboardSubStatus() != null
				&& !taskboardColumn.get(0).getTaskboardSubStatus().isEmpty()) {
			List<TaskboardSubStatus> taskboardSubStatus = taskboardColumn.get(0).getTaskboardSubStatus().stream()
					.filter(f -> StringUtils.equals(f.getSubStatusName(), subTask.getSubStatus()))
					.collect(Collectors.toList());
			if (taskboardSubStatus != null && !taskboardSubStatus.isEmpty()) {
				subStatusColor = taskboardSubStatus.get(0).getSubStatusColor();
			}
		}
		return LandingPageTaskBoardVO.builder().taskboardKey(subTask.getTaskboard().getTaskboardKey())
				.workspaceId(subTask.getTaskboard().getWorkspaceId()).id(subTask.getId())
				.boardName(subTask.getTaskboard().getName())
				.status(StringUtils.equals(subTask.getStatus(), "Archived") ? subTask.getPreviousStatus()
						: subTask.getStatus())
				.dueDate(subTask.getDueDate() == null ? null : subTask.getDueDate().toLocalDateTime())
				.createdDate(subTask.getCreatedOn().toLocalDateTime()).taskName(subTask.getTaskName())
				.assignedTo(assignUserTaskVOList).subtasks(String.valueOf(subTaskCount))
				.taskboardId(subTask.getTaskboard().getId()).taskId(subTask.getTaskId())
				.commentsCount(String.valueOf(subTask.getTaskboardTaskComments().size()))
				.filesCount(String.valueOf(subTask.getTaskboardTaskFiles().size())).subStatus(subTask.getSubStatus())
				.subStatusColor(subStatusColor).statusColor(statusColor).build();
	}

	private String getUserName(TaskboardTaskAssignedUsers assignedUserTask) {
		String userName = "";
		if (assignedUserTask.getUserId() != null) {
			UsersVO userVo = userService.getUserInfo(assignedUserTask.getUserId(), YorosisContext.get().getTenantId());
			userName = userVo.getFirstName() + " " + userVo.getLastName();
		}
		return userName;
	}

	@Transactional
	public TaskboardTaskVo getTaskboardTaskTaskByFilter(PaginationVO pagination, List<TaskboardTask> listOfTasks,
			List<LandingPageTaskBoardVO> landingPageTaskBoardVO) {
		int pageNumber = pagination.getIndex();
		int pageSize = pagination.getSize() > 0 ? pagination.getSize() : 10;
		int skipRecords = pageNumber * pageSize;

		int taskboardTaskCount = 0;
		for (TaskboardTask task : listOfTasks) {
			if (doesMatchesFilterValueForTaskboard(task, pagination.getFilterValue())) {
				taskboardTaskCount++;
				if (taskboardTaskCount > skipRecords && taskboardTaskCount <= (skipRecords + pageSize)) {
					landingPageTaskBoardVO.add(constructTaskVoToDto(task, pagination));
				}
			}
		}
		return TaskboardTaskVo.builder().taskboardTaskVo(landingPageTaskBoardVO)
				.totalRecords(String.valueOf(taskboardTaskCount)).build();
	}

	@Transactional
	public WorkflowTaskVO getWorkflowData(PaginationVO vo, UUID workspaceId) {
		LocalDate today = LocalDate.now();
		List<WorkflowVO> landingPageWorkflowTaskVO = new ArrayList<>();
		if (StringUtils.equals(vo.getTaskStatus(), "all")) {
			return getWorkflowDetails(today.minusDays(60).atStartOfDay(), today.plusDays(1).atStartOfDay(), vo,
					landingPageWorkflowTaskVO, workspaceId);
		} else if (StringUtils.equals(vo.getTaskStatus(), "pastDue")) {
			return getWorkflowDetails(today.minusYears(10).atStartOfDay(), LocalDateTime.now(), vo,
					landingPageWorkflowTaskVO, workspaceId);
		} else if (StringUtils.equals(vo.getTaskStatus(), "dueToday")) {
			return getWorkflowDetails(today.atStartOfDay(), today.plusDays(1).atStartOfDay(), vo,
					landingPageWorkflowTaskVO, workspaceId);
		} else if (StringUtils.equals(vo.getTaskStatus(), "dueTomorrow")) {
			return getWorkflowDetails(today.plusDays(1).atStartOfDay(), today.plusDays(2).atStartOfDay(), vo,
					landingPageWorkflowTaskVO, workspaceId);
		} else if (StringUtils.equals(vo.getTaskStatus(), "dueInSevenDays")) {
			return getWorkflowDetails(today.atStartOfDay(), today.plusDays(7).atStartOfDay(), vo,
					landingPageWorkflowTaskVO, workspaceId);
		}
		return WorkflowTaskVO.builder().build();
	}

	private boolean checkUser(ProcessInstanceTask instanceTask, UsersVO userVO) {
		boolean isUser = false;
		JsonNode propertyValue = null;
		if (!instanceTask.getProcessDefinitionTask().getTaskProperties().isEmpty()) {
			propertyValue = instanceTask.getProcessDefinitionTask().getTaskProperties().get(0).getPropertyValue();
//			List<JsonNode> listAssigneeGroup = propertyValue.findValues("assigneeGroup");
//			landingPageWorkflowTaskVo.setAssignedToGroup(getGroupNameList(userVO, listAssigneeGroup, instanceTask));
			return allowUser(userVO, instanceTask, propertyValue.get("assigneeUser"));
		}
		return isUser;
	}

	private boolean checkGroup(ProcessInstanceTask instanceTask, boolean unassignedGroup, List<UUID> groupIdList) {
		boolean isGroup = false;
		JsonNode propertyValue = null;
		if (!instanceTask.getProcessDefinitionTask().getTaskProperties().isEmpty()) {
			propertyValue = instanceTask.getProcessDefinitionTask().getTaskProperties().get(0).getPropertyValue();
			List<JsonNode> listAssigneeGroup = propertyValue.findValues("assigneeGroup");
			if (!CollectionUtils.isEmpty(listAssigneeGroup) && instanceTask.getAssignedTo() == null) {
				for (JsonNode assigneeGroups : listAssigneeGroup) {
					for (JsonNode assigneeGroup : assigneeGroups) {
						if (assigneeGroup == null && unassignedGroup == true) {
							return true;
						}
						if (assigneeGroup != null) {
							if (!groupIdList.isEmpty()
									&& (groupIdList.contains(UUID.fromString(assigneeGroup.asText())))) {
								return true;
							}
						}

					}
				}
			}
		}
		return isGroup;
	}
	
	private List<UUID> getWorkspace(UUID workspaceId, UsersVO userVO, List<UUID> userGroupIdsList) {
		return workspaceRepository.getListBasedonTenantIdAndActiveFlag(
					YorosisContext.get().getTenantId(), YorosisConstants.YES, userVO.getUserId(), userGroupIdsList);
	}

	private WorkflowTaskVO getWorkflowDetails(LocalDateTime startDate, LocalDateTime endDate, PaginationVO vo,
			List<WorkflowVO> landingPageWorkflowTaskVO, UUID workspaceId) {
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = getGroupAsUUID(userVO);
		List<ProcessInstanceTask> processInstanceTask = new ArrayList<>();
		String userName = getName(userVO);
		List<UUID> groupList = new ArrayList<>();
		String unassignedUser = "";
		Boolean unassignedGroup = false;
		List<UUID> workspaceIdList = getWorkspace(workspaceId, userVO, userGroupIdsList);
		if (vo.getFilterValue() != null && vo.getFilterValue().length != 0) {
			Pageable pageable = getPageable(vo, true);
			for (FilterValueVO fValue : vo.getFilterValue()) {
				if (StringUtils.equals(fValue.getFilterIdColumn(), ASSIGNTOUSERWORKFLOW)
						&& !StringUtils.equals(fValue.getFilterIdColumnValue(), UNASSIGNED)) {
					unassignedUser = "Assigned";
				}
				if (StringUtils.equals(fValue.getFilterIdColumn(), ASSIGNTOUSERWORKFLOW)
						&& StringUtils.equals(fValue.getFilterIdColumnValue(), UNASSIGNED)) {
					unassignedUser = UNASSIGNED;
				}
				if (StringUtils.equals(fValue.getFilterIdColumn(), ASSIGNTOGROUPWORKFLOW)
						&& !StringUtils.equals(fValue.getFilterIdColumnValue(), UNASSIGNED)) {
					groupList.add(UUID.fromString(fValue.getFilterIdColumnValue()));
				}
				if (StringUtils.equals(fValue.getFilterIdColumn(), ASSIGNTOGROUPWORKFLOW)
						&& StringUtils.equals(fValue.getFilterIdColumnValue(), UNASSIGNED)) {
					unassignedGroup = true;
				}

			}
			if (StringUtils.equals(vo.getTaskStatus(), "all")) {
				processInstanceTask = processInstanceTaskRepo.getAllTasks(userVO.getUserId(), userGroupIdsList,
						YorosisContext.get().getTenantId(), LocalDateTime.now().plus(2, ChronoUnit.YEARS), workspaceIdList);
			} else {
				processInstanceTask = processInstanceTaskRepo.getProcessDueTasksBasedOnFilter(userGroupIdsList,
						userVO.getUserId(), YorosisContext.get().getTenantId(), startDate, endDate, workspaceId,
						pageable);

			}
			if (!groupList.isEmpty() && BooleanUtils.isTrue(unassignedGroup)) {
				processInstanceTask = processInstanceTask.stream()
						.filter(f -> (groupList.contains(f.getAssignedToGroup()) || f.getAssignedToGroup() == null)
								|| checkGroup(f, false, groupList))
						.collect(Collectors.toList());
			}
			if (!groupList.isEmpty() && BooleanUtils.isFalse(unassignedGroup)) {
				processInstanceTask = processInstanceTask.stream()
						.filter(f -> (groupList.contains(f.getAssignedToGroup())) || checkGroup(f, false, groupList))
						.collect(Collectors.toList());
			}
			if (groupList.isEmpty() && BooleanUtils.isTrue(unassignedGroup)) {
				processInstanceTask = processInstanceTask.stream()
						.filter(f -> f.getAssignedToGroup() == null || checkGroup(f, false, groupList))
						.collect(Collectors.toList());
			}
			if (StringUtils.equals(unassignedUser, UNASSIGNED)) {
				processInstanceTask = processInstanceTask.stream()
						.filter(f -> f.getAssignedTo() == null && !checkUser(f, userVO)).collect(Collectors.toList());
			}
			if (StringUtils.equals(unassignedUser, "Assigned")) {
				processInstanceTask = processInstanceTask.stream()
						.filter(f -> f.getAssignedTo() == userVO.getUserId() || checkUser(f, userVO))
						.collect(Collectors.toList());
			}
			return getWorkflowTaskByFilter(vo, processInstanceTask, landingPageWorkflowTaskVO, userVO, userName);
		} else {
			int processInstanceTaskCount = 0;
			Pageable pageable = getPageable(vo, false);
			if (StringUtils.equals(vo.getTaskStatus(), "all")) {
				processInstanceTask = processInstanceTaskRepo.getAllTasksWithPagination(userVO.getUserId(),
						userGroupIdsList, YorosisContext.get().getTenantId(),
						LocalDateTime.now().plus(2, ChronoUnit.YEARS), workspaceIdList, pageable);
				processInstanceTaskCount = processInstanceTaskRepo.getAllTasksWithPaginationCount(userVO.getUserId(),
						userGroupIdsList, YorosisContext.get().getTenantId(),
						LocalDateTime.now().plus(2, ChronoUnit.YEARS), workspaceIdList);
			} else {
				processInstanceTask = processInstanceTaskRepo.getProcessDueTasksBasedOnFilter(userGroupIdsList,
						userVO.getUserId(), YorosisContext.get().getTenantId(), startDate, endDate, workspaceId,
						pageable);
				processInstanceTaskCount = processInstanceTaskRepo.getProcessDueTasksBasedOnFilterCount(
						userGroupIdsList, userVO.getUserId(), YorosisContext.get().getTenantId(), startDate, endDate,
						workspaceId);
			}
			for (ProcessInstanceTask instanceTask : processInstanceTask) {
				landingPageWorkflowTaskVO.add(getWorkFlowTaskVo(userVO, instanceTask, userName));
			}
			return WorkflowTaskVO.builder().workflowTasksVo(landingPageWorkflowTaskVO)
					.totalRecords(String.valueOf(processInstanceTaskCount)).build();
		}
	}

	private WorkflowVO getWorkFlowTaskVo(UsersVO userVO, ProcessInstanceTask instanceTask, String userName) {
		WorkflowVO landingPageWorkflowTaskVo = WorkflowVO.builder()
				.taskName(instanceTask.getProcessDefinitionTask().getTaskName())
				.createdDate(instanceTask.getCreatedDate()).dueDate(instanceTask.getDueDate())
				.id(instanceTask.getProcessInstanceTaskId()).build();
		JsonNode propertyValue = null;
		if (!instanceTask.getProcessDefinitionTask().getTaskProperties().isEmpty()) {
			propertyValue = instanceTask.getProcessDefinitionTask().getTaskProperties().get(0).getPropertyValue();
			landingPageWorkflowTaskVo
					.setViewDetailsButtonName(getText(propertyValue, "launchButtonName", "View Details"));
			List<JsonNode> listAssigneeGroup = propertyValue.findValues("assigneeGroup");
			landingPageWorkflowTaskVo.setAssignedToGroup(getGroupNameList(userVO, listAssigneeGroup, instanceTask));
			landingPageWorkflowTaskVo.setAssignedTo(
					allowUser(userVO, instanceTask, propertyValue.get("assigneeUser")) ? userName : null);
		}
		return landingPageWorkflowTaskVo;
	}

	private String getName(UsersVO vo) {
		return (vo.getFirstName() + " " + vo.getLastName());
	}

	private boolean allowUser(UsersVO userVO, ProcessInstanceTask instanceTask, JsonNode assigneeUser) {
		return instanceTask.getAssignedTo() != null ? true
				: (instanceTask.getAssignedToGroup() == null && assigneeUser != null && !assigneeUser.isNull()
						&& !StringUtils.equals(assigneeUser.asText(), "")) ? true : false;
	}

	private List<String> getGroupNameList(UsersVO userVO, List<JsonNode> listAssigneeGroup,
			ProcessInstanceTask instanceTask) {
		List<String> groupList = new ArrayList<>();
		if (instanceTask.getAssignedToGroup() != null) {
			getGroupName(userVO.getGroupVOList(), instanceTask.getAssignedToGroup(), groupList);
		} else {
			if (!CollectionUtils.isEmpty(listAssigneeGroup) && instanceTask.getAssignedTo() == null) {
				for (JsonNode assigneeGroups : listAssigneeGroup) {
					for (JsonNode assigneeGroup : assigneeGroups) {
						if (assigneeGroup != null) {
							getGroupName(userVO.getGroupVOList(), UUID.fromString(assigneeGroup.asText()), groupList);
						}
					}
				}
			}
		}
		return groupList;
	}

	private void getGroupName(List<GroupVO> voList, UUID groupId, List<String> groupList) {
		for (GroupVO vo : voList) {
			if (StringUtils.equals(vo.getGroupId().toString(), groupId.toString())) {
				groupList.add((vo.getGroupName()));
			}
		}
	}

	@Transactional
	public List<LatestWorkflowVO> getLastLaunchWorkflow(UUID workspaceId) {
		List<LatestWorkflowVO> latestWorkflowList = new ArrayList<>();
		Set<ProcessDefinition> procDefList = processDefinitionRepo.getLatestLaunchedInstance(
				YorosisContext.get().getUserName(), YorosisContext.get().getTenantId(), workspaceId);
		if (procDefList.size() < 3) {
			UsersVO userVO = userService.getLoggedInUserDetails();
			List<UUID> userGroupIdsList = getGroupAsUUID(userVO);
			procDefList = processDefinitionRepo.getLatestCreatedWorkflow(YorosisContext.get().getTenantId(),
					userGroupIdsList, YorosisConstants.YES, workspaceId);
		}
		int i = 0;
		for (ProcessDefinition procDef : procDefList) {
			if (i < 3) {
				latestWorkflowList.add(constructWorkflowDTo(procDef));
				i++;
			}
		}
		return latestWorkflowList;
	}

	private LatestWorkflowVO constructWorkflowDTo(ProcessDefinition procDef) {
		JsonNode propertyValue = null;
		for (ProcessDefinitionTask processDefinitionTask : procDef.getProcessDefinitionTasks()) {
			if (StringUtils.equalsIgnoreCase(processDefinitionTask.getTaskType(), "START_TASK")) {
				if (!processDefinitionTask.getTaskProperties().isEmpty()) {
					propertyValue = processDefinitionTask.getTaskProperties().get(0).getPropertyValue();
				}
			}
		}
		return LatestWorkflowVO.builder()
				.launchButtonName(propertyValue != null && propertyValue.has("initialLaunchButton")
						? propertyValue.get("initialLaunchButton").asText()
						: "LAUNCH")
				.id(procDef.getProcessDefinitionId()).workflowKey(procDef.getKey())
				.workflowName(procDef.getProcessDefinitionName()).workflowVersion(procDef.getWorkflowVersion()).build();
	}

	public List<UUID> getGroupAsUUID(UsersVO userVO) {
		List<GroupVO> listGroupVO = userVO.getGroupVOList();

		if (listGroupVO.isEmpty()) {
			return java.util.Collections.emptyList();
		}

		return listGroupVO.stream().map(GroupVO::getGroupId).collect(Collectors.toList());
	}

	private String getText(JsonNode propertyValue, String key, String defaultValue) {
		if (propertyValue != null && propertyValue.has(key)) {
			return propertyValue.get(key).asText();
		}

		return defaultValue;
	}

	private WorkflowTaskVO getWorkflowTaskByFilter(PaginationVO pagination, List<ProcessInstanceTask> listOfTasks,
			List<WorkflowVO> landingPageWorkflowTaskVO, UsersVO userVO, String userName) {
		int pageNumber = pagination.getIndex();
		int pageSize = pagination.getSize() > 0 ? pagination.getSize() : 10;
		int skipRecords = pageNumber * pageSize;

		int processInstanceTaskCount = 0;
		for (ProcessInstanceTask task : listOfTasks) {
			if (doesMatchesFilterValueForWorkflow(task, pagination.getFilterValue())) {
				processInstanceTaskCount++;
				if (processInstanceTaskCount > skipRecords && processInstanceTaskCount <= (skipRecords + pageSize)) {
					landingPageWorkflowTaskVO.add(getWorkFlowTaskVo(userVO, task, userName));
				}
			}
		}
		return WorkflowTaskVO.builder().workflowTasksVo(landingPageWorkflowTaskVO)
				.totalRecords(String.valueOf(processInstanceTaskCount)).build();
	}

	private boolean doesMatchesFilterValueForWorkflow(ProcessInstanceTask filterField,
			FilterValueVO[] currentFilterList) {
		boolean isMatched = true;
		for (FilterValueVO filterValue : currentFilterList) {
			if (!StringUtils.isEmpty(filterValue.getFilterIdColumn())) {
				if (StringUtils.equalsAny(filterValue.getFilterIdColumn(), STARTDATE, TASKNAME, DUEDATE)) {
					if (StringUtils.equals(filterValue.getFilterIdColumn(), TASKNAME)) {
						String value = filterField.getProcessDefinitionTask().getTaskName();
						isMatched = FilterUtils.getValue(value, filterValue, isMatched);
					} else {
						LocalDateTime dateValue = null;
						DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
						if (StringUtils.equals(filterValue.getFilterIdColumn(), STARTDATE)) {
							dateValue = filterField.getCreatedDate();
							dateValue = LocalDateTime.parse(dateValue.toString().subSequence(0, 19), formatter);
						} else if (StringUtils.equals(filterValue.getFilterIdColumn(), DUEDATE)
								&& filterField.getDueDate() != null) {
							dateValue = filterField.getDueDate();
							dateValue = LocalDateTime.parse(dateValue.toString().subSequence(0, 19), formatter);
						} else {
							isMatched = false;
							break;
						}
						if (dateValue != null) {
							isMatched = FilterUtils.getDateValue(dateValue.toLocalDate(), filterValue, isMatched);
						}
					}
				}
			}
		}

		return isMatched;
	}

	private boolean doesMatchesFilterValueForTaskboard(TaskboardTask filterField, FilterValueVO[] currentFilterList) {
		boolean isMatched = true;
		for (FilterValueVO filterValue : currentFilterList) {
			if (!StringUtils.isEmpty(filterValue.getFilterIdColumn())) {
				if (StringUtils.equalsAny(filterValue.getFilterIdColumn(), DUEON, CREATEDON, TASKID,
						TASKNAMETASKBOARD)) {
					if (StringUtils.equals(filterValue.getFilterIdColumn(), TASKNAMETASKBOARD)) {
						String value = filterField.getTaskName();
						isMatched = FilterUtils.getValue(value, filterValue, isMatched);
					} else if (StringUtils.equals(filterValue.getFilterIdColumn(), BOARDNAME)) {
						String value = filterField.getTaskboard().getName();
						isMatched = FilterUtils.getValue(value, filterValue, isMatched);
					} else if (StringUtils.equals(filterValue.getFilterIdColumn(), TASKID)) {
						String value = filterField.getTaskId();
						isMatched = FilterUtils.getValue(value, filterValue, isMatched);
					} else if (StringUtils.equals(filterValue.getFilterIdColumn(), SUBSTATUS)) {
						String value = filterField.getSubStatus();
						isMatched = FilterUtils.getValue(value, filterValue, isMatched);
					} else if (StringUtils.equals(filterValue.getFilterIdColumn(), STATUS)) {
						String value = filterField.getStatus();
						isMatched = FilterUtils.getValue(value, filterValue, isMatched);
					} else if (StringUtils.equals(filterValue.getFilterIdColumn(), ASSIGNTO)) {
						List<AssignToVO> assignUserTaskVOList = new ArrayList<>();
						if (filterField.getTaskboardTaskAssignedUsers() != null) {
							assignUserTaskVOList = filterField.getTaskboardTaskAssignedUsers().stream()
									.filter(assignedUserTask -> assignedUserTask.getUserId() != null && StringUtils
											.equals(assignedUserTask.getActiveFlag(), YorosisConstants.YES))
									.map(this::checkUserName).collect(Collectors.toList());
						}
						isMatched = FilterUtils.getAssignTo(assignUserTaskVOList, filterValue, isMatched);
					} else {
						LocalDateTime dateValue = null;
						DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");
						if (StringUtils.equals(filterValue.getFilterIdColumn(), CREATEDON)) {
							dateValue = filterField.getCreatedOn().toLocalDateTime();
							if (dateValue.toString().length() < 20) {
								LocalDate localDate = dateValue.toLocalDate();
								dateValue = localDate.plusDays(1).atStartOfDay();
							}
							dateValue = LocalDateTime.parse(dateValue.toString().subSequence(0, 16), formatter);
						} else if (StringUtils.equals(filterValue.getFilterIdColumn(), DUEON)
								&& filterField.getDueDate() != null) {
							dateValue = filterField.getDueDate().toLocalDateTime();
							if (dateValue.toString().length() < 20) {
								LocalDate localDate = dateValue.toLocalDate();
								dateValue = localDate.plusDays(1).atStartOfDay();
							}
							dateValue = LocalDateTime.parse(dateValue.toString().subSequence(0, 16), formatter);
						} else {
							isMatched = false;
							break;
						}
						if (dateValue != null) {
							isMatched = FilterUtils.getDateValue(dateValue.toLocalDate(), filterValue, isMatched);
						}
					}
				}
			}
		}

		return isMatched;
	}

	private AssignToVO checkUserName(TaskboardTaskAssignedUsers assignedUserTask) {
		String userName = "";
		if (assignedUserTask.getUserId() != null) {
			UsersVO userVo = userService.getUserInfo(assignedUserTask.getUserId(), YorosisContext.get().getTenantId());
			userName = userVo.getFirstName() + " " + userVo.getLastName();
			return AssignToVO.builder().name(userName).firstName(userVo.getFirstName()).lastName(userVo.getLastName())
					.build();
		}
		return AssignToVO.builder().build();
	}

	@Transactional
	public TaskBoardFilterDataVo getBoardNameList(UUID workspaceId) {
		List<BoardNameVo> boardNameList = new ArrayList<>();
		List<StatusVo> statusList = new ArrayList<>();
		List<SubStatusVo> subStatusList = new ArrayList<>();
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = getGroupAsUUID(userVO);
		List<Taskboard> taskboardList = taskboardRepository
				.getTaskBoardListByTenantIdIgnoreCaseAndActiveFlagIgnoreCaseWithPermission(userVO.getUserId(),
						userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES, workspaceId);
		List<TaskboardTask> taskboardTaskList = taskboardTaskRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
				userVO.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES,
				workspaceId);
		getconstructStatusVo(taskboardTaskList, statusList, subStatusList);
		boardNameList = taskboardList.stream().map(this::constructBoardNameVo).collect(Collectors.toList());
		return TaskBoardFilterDataVo.builder().boardNameList(boardNameList).statusList(statusList)
				.subStatusList(subStatusList).build();
	}

	private BoardNameVo constructBoardNameVo(Taskboard taskboard) {
		return BoardNameVo.builder().boardName(taskboard.getName()).taskBoardId(taskboard.getId()).build();
	}

	private void getconstructStatusVo(List<TaskboardTask> taskboardTaskList, List<StatusVo> statusList,
			List<SubStatusVo> subStatusList) {
		List<String> statusUUIDList = new ArrayList<>();
		List<String> subStatusUUIDList = new ArrayList<>();
		for (TaskboardTask taskboardTask : taskboardTaskList) {
			String statusColor = null;
			String subStatusColor = null;
			List<TaskboardColumns> taskboardColumn = taskboardTask.getTaskboard().getTaskboardColumns().stream()
					.filter(f -> StringUtils.equals(f.getColumnName(), taskboardTask.getStatus()))
					.collect(Collectors.toList());
			if (!statusUUIDList.contains(taskboardTask.getStatus()) && taskboardColumn != null
					&& !taskboardColumn.isEmpty()) {
				statusColor = taskboardColumn.get(0).getColumnColor();
				statusList.add(StatusVo.builder().status(taskboardTask.getStatus()).color(statusColor).build());
				statusUUIDList.add(taskboardTask.getStatus());
			}
			if (!subStatusUUIDList.contains(taskboardTask.getSubStatus())
					&& !StringUtils.isEmpty(taskboardTask.getSubStatus())) {
				if (taskboardColumn != null && !taskboardColumn.isEmpty()
						&& !StringUtils.isEmpty(taskboardTask.getSubStatus())
						&& taskboardColumn.get(0).getTaskboardSubStatus() != null
						&& !taskboardColumn.get(0).getTaskboardSubStatus().isEmpty()) {
					List<TaskboardSubStatus> taskboardSubStatus = taskboardColumn.get(0).getTaskboardSubStatus()
							.stream()
							.filter(f -> StringUtils.equals(f.getSubStatusName(), taskboardTask.getSubStatus()))
							.collect(Collectors.toList());
					if (taskboardSubStatus != null && !taskboardSubStatus.isEmpty()) {
						subStatusColor = taskboardSubStatus.get(0).getSubStatusColor();
					}
				}
				subStatusList.add(
						SubStatusVo.builder().subStatus(taskboardTask.getSubStatus()).color(subStatusColor).build());
				subStatusUUIDList.add(taskboardTask.getSubStatus());
			}
		}
		Collections.sort(statusList, (p1, p2) -> p1.getStatus().compareToIgnoreCase(p2.getStatus()));
		Collections.sort(subStatusList, (p1, p2) -> p1.getSubStatus().compareToIgnoreCase(p2.getSubStatus()));
	}

	@Transactional
	public List<GroupVO> getUserGroupVo() {
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<GroupVO> listGroupVO = userVO.getGroupVOList();
		listGroupVO.sort(Comparator.comparing(GroupVO::getGroupName));
		return listGroupVO;
	}
}
