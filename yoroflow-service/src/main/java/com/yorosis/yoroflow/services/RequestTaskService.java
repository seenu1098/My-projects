package com.yorosis.yoroflow.services;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
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

import com.yorosis.yoroflow.entities.ProcessInstance;
import com.yorosis.yoroflow.entities.ProcessInstanceTask;
import com.yorosis.yoroflow.entities.TaskboardColumns;
import com.yorosis.yoroflow.entities.TaskboardTask;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.AllTaskVO;
import com.yorosis.yoroflow.models.FilterValueVO;
import com.yorosis.yoroflow.models.GroupVO;
import com.yorosis.yoroflow.models.PaginationVO;
import com.yorosis.yoroflow.models.UsersVO;
import com.yorosis.yoroflow.models.landingpage.WorkflowVO;
import com.yorosis.yoroflow.models.taskboard.LaunchTaskListVo;
import com.yorosis.yoroflow.models.taskboard.LaunchTaskboardTaskVo;
import com.yorosis.yoroflow.repository.ProcessInstanceRepo;
import com.yorosis.yoroflow.repository.ProcessInstanceTaskRepo;
import com.yorosis.yoroflow.repository.TaskboardTaskRepository;
import com.yorosis.yoroflow.repository.WorkspaceRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class RequestTaskService {

	@Autowired
	private TaskListService taskListService;

	@Autowired
	private UserService userService;

	@Autowired
	private ProcessInstanceTaskRepo processInstanceTaskRepo;

	@Autowired
	private ProcessInstanceRepo processInstanceRepo;

	@Autowired
	private TaskboardTaskRepository taskboardTaskRepository;

	@Autowired
	private WorkspaceRepository workspaceRepository;

	private static final String REQUEST_NAME = "reqName";
	private static final String SUBMITTED_DATE = "submittedDate";
	private static final String ENDDATE = "End Date";
	private static final String STARTBY = "Initiated By";
	private static final String ENDBY = "End By";
	private static final String TOTALTIMETAKEN = "Total Time Taken";

	protected Pageable getPageable(PaginationVO vo, boolean hasFilter, String type, int sortCount) {
		Sort sort = null;
		int pageSize = 10;
		if (vo.getSize() > 0) {
			pageSize = vo.getSize();
		}
		if (!StringUtils.isEmpty(vo.getColumnName())) {
			String columnName = getColumnName(vo, type);
			if (StringUtils.isNotEmpty(columnName)) {
				if (StringUtils.equals(vo.getDirection(), "desc")) {
					sort = Sort.by(new Sort.Order(Direction.DESC, columnName));
				} else {
					sort = Sort.by(new Sort.Order(Direction.ASC, columnName));
				}
			}
		}
		if (hasFilter && sort != null) {
			return PageRequest.of(sortCount, 200, sort);
		} else if (hasFilter) {
			return PageRequest.of(sortCount, 200);
		}
		if (sort != null) {
			return PageRequest.of(vo.getIndex(), pageSize, sort);
		}
		return PageRequest.of(vo.getIndex(), pageSize);
	}

	private String getColumnName(PaginationVO vo, String type) {
		String columName = null;
		if (StringUtils.equals(type, "workflow")) {
			if (StringUtils.equals(vo.getColumnName(), "status")) {
				return "status";
			} else if (StringUtils.equals(vo.getColumnName(), "submittedDate")) {
				return "createdDate";
			}
		}
		if (StringUtils.equals(type, "taskboard")) {
			if (StringUtils.equals(vo.getColumnName(), "submittedDate")) {
				return "createdOn";
			} else if (StringUtils.equals(vo.getColumnName(), "status")) {
				return "status";
			} else if (StringUtils.equals(vo.getColumnName(), "reqName")) {
				return "taskName";
			}
		}
		return columName;
	}

	@Transactional
	public AllTaskVO getSubmittedTasksList(PaginationVO pagination, UUID workspaceId) {
		UsersVO userVO = userService.getLoggedInUserDetails();
		String userName = taskListService.getUserName(userVO);
		String user = taskListService.getName(userVO);
		Pageable pageable = taskListService.getPageableObject(pagination);
		List<ProcessInstanceTask> processInstanceTask = processInstanceTaskRepo.getSubmittedTasks(workspaceId, userName,
				YorosisContext.get().getTenantId(), pageable);
		Long submittedTasksCount = processInstanceTaskRepo.getSubmittedTasksCount(workspaceId, userName,
				YorosisContext.get().getTenantId());
		List<WorkflowVO> workflowTasksVo = new ArrayList<>();
//		for (ProcessInstance instance : launchedList) {
//			if (StringUtils.equals(instance.getStatus(), "COMPLETED")) {
//				for (ProcessInstanceTask instanceTask : instance.getProcessInstanceTasks()) {
//					if (StringUtils.equals(instanceTask.getProcessDefinitionTask().getTaskType(), "START_TASK")) {
//						processInstanceTask.add(instanceTask);
//					}
//				}
//
//			}
//			else if (StringUtils.equals(instance.getStatus(), "IN_PROCESS")) {
//				for (ProcessInstanceTask instanceTask : instance.getProcessInstanceTasks()) {
//					if (StringUtils.equals(instanceTask.getStatus(), "IN_PROCESS")) {
//						processInstanceTask.add(instanceTask);
//					}
//				}
//			}
//
//		}

		if (!processInstanceTask.isEmpty()) {
			processInstanceTask.stream()
					.forEach(t -> workflowTasksVo.add(taskListService.getWorkFlowTaskVo(userVO, t, user)));
		}

		return AllTaskVO.builder().workflowTasksVo(workflowTasksVo).totalRecords(String.valueOf(submittedTasksCount))
				.build();

	}

	private List<UUID> getGroupAsUUID(UsersVO userVO) {
		List<GroupVO> listGroupVO = userVO.getGroupVOList();

		if (listGroupVO != null && listGroupVO.isEmpty()) {
			return Collections.emptyList();
		}

		return listGroupVO.stream().map(GroupVO::getGroupId).collect(Collectors.toList());
	}

	private List<UUID> getWorkspace(PaginationVO pagination, UUID workspaceId, UsersVO userVO) {
		List<UUID> workspaceIdList = new ArrayList<>();
		if (BooleanUtils.isTrue(pagination.getAllWorkspace())) {
			List<UUID> userGroupIdsList = getGroupAsUUID(userVO);
			workspaceIdList = workspaceRepository.getListBasedonTenantIdAndActiveFlag(
					YorosisContext.get().getTenantId(), YorosisConstants.YES, userVO.getUserId(), userGroupIdsList);
		} else {
			workspaceIdList.add(workspaceId);
		}
		return workspaceIdList;
	}

	@Transactional
	public LaunchTaskboardTaskVo getMySubmittedTasksList(PaginationVO pagination, UUID workspaceId) {
		Integer count = 0;
		List<LaunchTaskListVo> taskListVo = new ArrayList<>();
		List<LaunchTaskListVo> processTaskListVo = new ArrayList<>();
		List<LaunchTaskListVo> taskboardTaskListVo = new ArrayList<>();
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> workspaceIdList = getWorkspace(pagination, workspaceId, userVO);
		if (pagination.getFilterValue().length != 0) {
			return getTasks(pagination, workspaceIdList, userVO);
		} else {
			if (pagination.getIndex() > 0) {
				pagination.setIndex(pagination.getIndex() / 2);
				pagination.setSize(pagination.getSize());
			}
			Pageable pageable = getPageable(pagination, false, "workflow", 0);
			List<ProcessInstance> processInstanceList = processInstanceRepo.getLaunchedListForMyRequest(
					YorosisContext.get().getUserName(), YorosisContext.get().getTenantId(), workspaceIdList, pageable);
			pageable = getPageable(pagination, false, "taskboard", 0);
			List<TaskboardTask> taskboardTaskList = taskboardTaskRepository.getTaskboardTasksForLaunch(
					userVO.getFirstName() + " " + userVO.getLastName(), workspaceIdList,
					YorosisContext.get().getTenantId(), YorosisConstants.YES, pageable);
			count = processInstanceRepo.getLaunchedListCountForMyRequest(YorosisContext.get().getUserName(),
					YorosisContext.get().getTenantId(), workspaceIdList);
			if (processInstanceList != null && !processInstanceList.isEmpty()) {
				int limit = pagination.getSize();
				if (taskboardTaskList != null && !taskboardTaskList.isEmpty()) {
					limit = taskboardTaskList.size() > (pagination.getSize() / 2) ? (pagination.getSize() / 2)
							: pagination.getSize() - taskboardTaskList.size();
				}
				processTaskListVo = processInstanceList.stream().limit(limit).map(this::constructProcessTaskTaskVo)
						.collect(Collectors.toList());
				taskListVo.addAll(processTaskListVo);
			}
			count = count + taskboardTaskRepository.getTaskboardTasksForLaunchCount(
					userVO.getFirstName() + " " + userVO.getLastName(), workspaceIdList,
					YorosisContext.get().getTenantId(), YorosisConstants.YES);
			if (taskboardTaskList != null && !taskboardTaskList.isEmpty()) {
				int limit = pagination.getSize();
				if (processTaskListVo != null && !processTaskListVo.isEmpty()) {
					limit = pagination.getSize() - processTaskListVo.size();
				}
				taskboardTaskListVo = taskboardTaskList.stream().limit(limit).map(this::constructTaskboardTaskVo)
						.collect(Collectors.toList());
				taskListVo.addAll(taskboardTaskListVo);
			}
		}
		return LaunchTaskboardTaskVo.builder().totalRecords(count).taskVOList(taskListVo).build();
	}

	public LaunchTaskboardTaskVo getTasks(PaginationVO pagination, List<UUID> workspaceIdList, UsersVO userVO) {
		List<LaunchTaskListVo> taskListVo = new ArrayList<>();
		List<LaunchTaskListVo> taskboardTaskListVo = new ArrayList<>();
		List<LaunchTaskListVo> processTaskListVo = new ArrayList<>();
		int pageNumber = pagination.getIndex();
		int pageSize = pagination.getSize() > 0 ? pagination.getSize() : 10;
		int skipRecords = pageNumber * pageSize;

		int count = 0;
		int i = 0;
		do {
			Pageable pageable = getPageable(pagination, true, "workflow", i);
			List<ProcessInstance> processInstanceList = processInstanceRepo.getLaunchedListForMyRequest(
					YorosisContext.get().getUserName(), YorosisContext.get().getTenantId(), workspaceIdList, pageable);
			pageable = getPageable(pagination, true, "taskboard", i);
			List<TaskboardTask> taskboardTaskList = taskboardTaskRepository.getTaskboardTasksForLaunch(
					userVO.getFirstName() + " " + userVO.getLastName(), workspaceIdList,
					YorosisContext.get().getTenantId(), YorosisConstants.YES, pageable);
			if (taskboardTaskList != null && !taskboardTaskList.isEmpty()) {
				int matchCount = 0;
				for (TaskboardTask task : taskboardTaskList) {
					if (doesMatchesFilterValueForTaskboard(task, pagination.getFilterValue())) {
						matchCount++;
						if (matchCount > skipRecords && matchCount <= (skipRecords + pageSize)) {
							taskboardTaskListVo.add(constructTaskboardTaskVo(task));
						}
					}
				}
				count = matchCount;
			}
			if (processInstanceList != null && !processInstanceList.isEmpty()) {
				int matchCount = 0;
				int limit = pageSize;
				if (taskboardTaskListVo != null && !taskboardTaskListVo.isEmpty()) {
					limit = (taskboardTaskListVo.size() > pageSize / 2) ? pageSize / 2
							: pageSize - taskboardTaskListVo.size();
				}
				for (ProcessInstance task : processInstanceList) {
					if (doesMatchesFilterValueForProcess(task, pagination.getFilterValue())) {
						matchCount++;
						if (matchCount > skipRecords && matchCount <= (skipRecords + limit)) {
							processTaskListVo.add(constructProcessTaskTaskVo(task));
						}
					}
				}
				if (processTaskListVo != null && !processTaskListVo.isEmpty()) {
					if (taskboardTaskListVo != null && !taskboardTaskListVo.isEmpty()) {
						taskListVo = taskboardTaskListVo.stream().limit(pageSize - processTaskListVo.size())
								.collect(Collectors.toList());
					}
					taskListVo.addAll(processTaskListVo);
				} else {
					taskListVo = taskboardTaskListVo;
				}
				count = count + matchCount;
			}
			i++;
		} while (taskListVo.size() < pageSize);
		return LaunchTaskboardTaskVo.builder().taskVOList(taskListVo).totalRecords(count).build();
	}

	public LaunchTaskboardTaskVo getTaskboardTasks(PaginationVO pagination, List<TaskboardTask> taskboardTaskList,
			List<LaunchTaskListVo> taskboardTaskListVo) {

		int pageNumber = pagination.getIndex();
		int pageSize = pagination.getSize() > 0 ? pagination.getSize() : 10;
		int skipRecords = pageNumber * pageSize;

		int matchCount = 0;
		for (TaskboardTask task : taskboardTaskList) {
			if (doesMatchesFilterValueForTaskboard(task, pagination.getFilterValue())) {
				matchCount++;
				if (matchCount > skipRecords && matchCount <= (skipRecords + pageSize)) {
					taskboardTaskListVo.add(constructTaskboardTaskVo(task));
				}
			}
		}

		return LaunchTaskboardTaskVo.builder().taskVOList(taskboardTaskListVo).totalRecords(matchCount).build();
	}

	private boolean doesMatchesFilterValueForTaskboard(TaskboardTask filterField, FilterValueVO[] currentFilterList) {
		boolean isMatched = true;
		for (FilterValueVO filterValue : currentFilterList) {
			if (!StringUtils.isEmpty(filterValue.getFilterIdColumn())) {
				if (StringUtils.equalsAny(filterValue.getFilterIdColumn(), SUBMITTED_DATE, ENDDATE, REQUEST_NAME,
						TOTALTIMETAKEN, STARTBY, ENDBY)) {
					if (StringUtils.equals(filterValue.getFilterIdColumn(), REQUEST_NAME)) {
						String value = filterField.getTaskName();
						isMatched = FilterUtils.getValue(value, filterValue, isMatched);
					}
					if (StringUtils.equals(filterValue.getFilterIdColumn(), STARTBY)) {
						String value = filterField.getCreatedBy();
						isMatched = FilterUtils.getValue(value, filterValue, isMatched);
					}
					LocalDateTime dateValue = null;
					DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
					if (StringUtils.equals(filterValue.getFilterIdColumn(), SUBMITTED_DATE)) {
						dateValue = filterField.getCreatedOn().toLocalDateTime();
						dateValue = LocalDateTime.parse(dateValue.toString().subSequence(0, 19), formatter);
					}
					if (dateValue != null) {
						isMatched = FilterUtils.getDateValue(dateValue.toLocalDate(), filterValue, isMatched);
					}
				} else {
					isMatched = false;
					break;
				}
			}
		}

		return isMatched;
	}

	public LaunchTaskboardTaskVo getProcessTasks(PaginationVO pagination, List<ProcessInstance> listOfTasks,
			List<LaunchTaskListVo> processTaskListVo) {

		int pageNumber = pagination.getIndex();
		int pageSize = pagination.getSize() > 0 ? pagination.getSize() : 10;
		int skipRecords = pageNumber * pageSize;

		int matchCount = 0;
		for (ProcessInstance task : listOfTasks) {
			if (doesMatchesFilterValueForProcess(task, pagination.getFilterValue())) {
				matchCount++;
				if (matchCount > skipRecords && matchCount <= (skipRecords + pageSize)) {
					processTaskListVo.add(constructProcessTaskTaskVo(task));
				}
			}
		}

		return LaunchTaskboardTaskVo.builder().taskVOList(processTaskListVo).totalRecords(matchCount).build();
	}

	private boolean doesMatchesFilterValueForProcess(ProcessInstance filterField, FilterValueVO[] currentFilterList) {
		boolean isMatched = true;
		for (FilterValueVO filterValue : currentFilterList) {
			if (!StringUtils.isEmpty(filterValue.getFilterIdColumn())) {
				if (StringUtils.equalsAny(filterValue.getFilterIdColumn(), SUBMITTED_DATE, ENDDATE, REQUEST_NAME,
						TOTALTIMETAKEN, STARTBY, ENDBY)) {
					if (StringUtils.equals(filterValue.getFilterIdColumn(), REQUEST_NAME)) {
						List<ProcessInstanceTask> reqNameList = filterField.getProcessInstanceTasks().stream().filter(
								i -> StringUtils.equals(i.getProcessDefinitionTask().getTaskType(), "START_TASK"))
								.collect(Collectors.toList());
						String value = reqNameList.get(0).getProcessDefinitionTask().getTaskName();
						isMatched = FilterUtils.getValue(value, filterValue, isMatched);
					}
					if (StringUtils.equals(filterValue.getFilterIdColumn(), STARTBY)) {
						String value = filterField.getCreatedBy();
						isMatched = FilterUtils.getValue(value, filterValue, isMatched);
					}
					if (StringUtils.equals(filterValue.getFilterIdColumn(), ENDBY)) {
						String value = filterField.getUpdatedBy();
						isMatched = FilterUtils.getValue(value, filterValue, isMatched);
					}
					LocalDateTime dateValue = null;
					DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
					if (StringUtils.equals(filterValue.getFilterIdColumn(), SUBMITTED_DATE)) {
						dateValue = filterField.getStartTime();
						dateValue = LocalDateTime.parse(dateValue.toString().subSequence(0, 19), formatter);
					} else if (StringUtils.equals(filterValue.getFilterIdColumn(), ENDDATE)) {
						dateValue = filterField.getEndTime();
						dateValue = LocalDateTime.parse(dateValue.toString().subSequence(0, 19), formatter);
					}
					if (dateValue != null) {
						isMatched = FilterUtils.getDateValue(dateValue.toLocalDate(), filterValue, isMatched);
					}
					if (StringUtils.equals(filterValue.getFilterIdColumn(), TOTALTIMETAKEN)) {
						isMatched = FilterUtils.getTotalTimeFilter(filterField.getStartTime(), filterField.getEndTime(),
								filterValue, isMatched);
					}
				} else {
					isMatched = false;
					break;
				}
			}
		}

		return isMatched;
	}

	private LaunchTaskListVo constructTaskboardTaskVo(TaskboardTask taskboardTask) {
		TaskboardColumns taskboardColumns = taskboardTask.getTaskboard().getTaskboardColumns().stream()
				.filter(c -> StringUtils.equals(String.valueOf(c.getColumnOrder()), "0")).collect(Collectors.toList())
				.get(0);
		return LaunchTaskListVo.builder().taskboardId(taskboardTask.getTaskboard().getId())
				.reqName(taskboardTask.getTaskName()).status(taskboardTask.getStatus())
				.jsonData(taskboardTask.getLaunchTaskData())
				.submittedDate(taskboardTask.getCreatedOn().toLocalDateTime()).taskboardTaskId(taskboardTask.getId())
				.assignedToTeam(setAssignTaskTeam(taskboardTask)).assignedToUser(setAssignTaskUser(taskboardTask))
				.formId(taskboardColumns.getFormId()).version(taskboardColumns.getVersion()).build();
	}

	private List<UUID> setAssignTaskTeam(TaskboardTask task) {
		List<UUID> assignGroupTaskVOList = new ArrayList<>();
		if (task != null && !task.getTaskboardTaskAssignedUsers().isEmpty()) {
			task.getTaskboardTaskAssignedUsers().stream().filter(assignedTask -> assignedTask.getGroupId() != null
					&& StringUtils.equals(assignedTask.getActiveFlag(), YorosisConstants.YES)).forEach(t -> {
						assignGroupTaskVOList.add(t.getGroupId());
					});
		}
		return assignGroupTaskVOList;
	}

	private List<UUID> setAssignTaskUser(TaskboardTask task) {
		List<UUID> assignUserTaskVOList = new ArrayList<>();
		if (task != null && !task.getTaskboardTaskAssignedUsers().isEmpty()) {
			task.getTaskboardTaskAssignedUsers().stream()
					.filter(assignedUserTask -> assignedUserTask.getUserId() != null
							&& StringUtils.equals(assignedUserTask.getActiveFlag(), YorosisConstants.YES))
					.forEach(u -> {
						assignUserTaskVOList.add(u.getUserId());
					});
		}
		return assignUserTaskVOList;
	}

	private LaunchTaskListVo constructProcessTaskTaskVo(ProcessInstance processInstance) {
		String status = "Completed";
		List<UUID> assignUserTaskVOList = new ArrayList<>();
		List<UUID> assignGroupTaskVOList = new ArrayList<>();
		List<ProcessInstanceTask> reqNameList = processInstance.getProcessInstanceTasks().stream()
				.filter(i -> StringUtils.equals(i.getProcessDefinitionTask().getTaskType(), "START_TASK"))
				.collect(Collectors.toList());
		List<ProcessInstanceTask> statusList = processInstance.getProcessInstanceTasks().stream()
				.filter(i -> StringUtils.equals(i.getStatus(), "IN_PROCESS")
						&& !StringUtils.equals(i.getProcessDefinitionTask().getTaskType(), "SEQ_FLOW"))
				.collect(Collectors.toList());
		if (statusList != null && !statusList.isEmpty()) {
			status = statusList.get(0).getProcessDefinitionTask().getTaskName();
			assignUserTaskVOList.add(statusList.get(0).getAssignedTo());
			assignGroupTaskVOList.add(statusList.get(0).getAssignedToGroup());
		}
		return LaunchTaskListVo.builder().reqName(reqNameList.get(0).getProcessDefinitionTask().getTaskName())
				.status(status).submittedDate(processInstance.getCreatedDate())
				.instanceId(processInstance.getProcessInstanceId()).jsonData(reqNameList.get(0).getData())
				.taskId(reqNameList.get(0).getProcessInstanceTaskId()).assignedToTeam(assignGroupTaskVOList)
				.assignedToUser(assignUserTaskVOList).build();
	}

}
