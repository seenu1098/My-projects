package com.yorosis.yoroflow.services;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.yorosis.yoroflow.entities.OrganizationPrefrences;
import com.yorosis.yoroflow.entities.ProcessInstance;
import com.yorosis.yoroflow.entities.ProcessInstanceTask;
import com.yorosis.yoroflow.entities.ProcessInstanceTaskNotes;
import com.yorosis.yoroflow.entities.User;
import com.yorosis.yoroflow.event.automation.service.EventsAutomationService;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.AllTaskListVO;
import com.yorosis.yoroflow.models.AllTaskVO;
import com.yorosis.yoroflow.models.AllTaskVO.AllTaskVOBuilder;
import com.yorosis.yoroflow.models.FieldHeaderVO;
import com.yorosis.yoroflow.models.FieldListVO;
import com.yorosis.yoroflow.models.FieldValuesVO;
import com.yorosis.yoroflow.models.FilterValueVO;
import com.yorosis.yoroflow.models.GroupVO;
import com.yorosis.yoroflow.models.LaunchedListVO;
import com.yorosis.yoroflow.models.NotificationsVO;
import com.yorosis.yoroflow.models.PaginationVO;
import com.yorosis.yoroflow.models.ProcessInstanceLaunchedListVo;
import com.yorosis.yoroflow.models.ProcessInstanceListVO;
import com.yorosis.yoroflow.models.ProcessInstanceUserTaskVO;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.models.RessignResponseTaskVO;
import com.yorosis.yoroflow.models.RessignTaskVO;
import com.yorosis.yoroflow.models.Status;
import com.yorosis.yoroflow.models.TableDataVO;
import com.yorosis.yoroflow.models.TaskBackgroundVo;
import com.yorosis.yoroflow.models.TaskNameListVO;
import com.yorosis.yoroflow.models.UsersVO;
import com.yorosis.yoroflow.models.YoroFlowException;
import com.yorosis.yoroflow.models.landingpage.WorkflowTaskVO;
import com.yorosis.yoroflow.models.landingpage.WorkflowVO;
import com.yorosis.yoroflow.repository.ErrorProcessInstanceRepository;
import com.yorosis.yoroflow.repository.NotificationsRepository;
import com.yorosis.yoroflow.repository.OrganizationPrefrencesRepository;
import com.yorosis.yoroflow.repository.ProcessInstanceRepo;
import com.yorosis.yoroflow.repository.ProcessInstanceTaskNotesRepository;
import com.yorosis.yoroflow.repository.ProcessInstanceTaskRepo;
import com.yorosis.yoroflow.repository.UsersRepository;
import com.yorosis.yoroflow.repository.WorkspaceRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import lombok.extern.slf4j.Slf4j;

@SuppressWarnings("deprecation")
@Service
@Slf4j
public class TaskListService {

	private static final String COMPLETED = "COMPLETED";
	private static final String IN_PROCESS = "IN PROCESS";
	private static final String TASKNAME = "Task Name";
	private static final String STARTDATE = "Created Date";
	private static final String DUEDATE = "Due Date";
	private static final String STATUS = "Status";
	private static final String ASSIGNTO = "assignedTo";
	private static final String ASSIGNTOUSERWORKFLOW = "assignedToUserWorkflow";
	private static final String ASSIGNTOGROUPWORKFLOW = "assignedToGroupWorkflow";
	private static final String UNASSIGNED = "unAssigned";

	@Autowired
	private ProcessInstanceTaskRepo processInstanceTaskRepo;

	@Autowired
	private ProcessInstanceRepo processInstanceRepo;

	@Autowired
	private ProcessInstanceTaskNotesRepository processInstanceTaskNotesRepository;

	@Autowired
	private UsersRepository userRepo;

	@Autowired
	private UserService userService;

	@Autowired
	private FlowEngineService flowEngineService;

	@Autowired
	private MessagingServiceClient messagingServiceClient;

	@Autowired
	private OrganizationPrefrencesRepository organizationPrefrencesRepository;

	@Autowired
	private ErrorProcessInstanceRepository errorProcessInstanceRepository;

	@Autowired
	private EventsAutomationService eventsAutomationService;

	@Autowired
	private NotificationsRepository notificationsRepository;

	@Autowired
	private WorkspaceRepository workspaceRepository;

	@Autowired
	private WorkflowActivityLogService workflowActivityLogService;

	private static final String APPROVAL_STATUS = "approvalStatus";
	private static final String APPROVED = "approved";
	private static final String REJECTED = "rejected";
	private static final String SENDBACK = "sendback";

	private boolean getBoolean(JsonNode propertyValue, String key, Boolean defaultValue) {
		if (propertyValue != null && propertyValue.has(key)) {
			return propertyValue.get(key).asBoolean();
		}

		return defaultValue;
	}

	private String getText(JsonNode propertyValue, String key, String defaultValue) {
		if (propertyValue != null && propertyValue.has(key)) {
			return propertyValue.get(key).asText();
		}

		return defaultValue;
	}

	private Boolean getBooleanFromText(JsonNode propertyValue, String key, Boolean defaultValue) {
		if (propertyValue != null && propertyValue.has(key)
				&& !StringUtils.equals(propertyValue.get(key).asText(), "null")) {
			return true;
		}

		return defaultValue;
	}

	private Long getLong(JsonNode propertyValue, String key, Long defaultValue) {
		if (propertyValue != null && propertyValue.has(key)) {
			return propertyValue.get(key).asLong();
		}
		return defaultValue;
	}

	private TaskBackgroundVo constructTaskBackgroundDTOtoVo(OrganizationPrefrences organizationPrefrence) {
		return TaskBackgroundVo.builder().defaultPageSize(organizationPrefrence.getDefaultPageSize())
				.approveTaskColor(organizationPrefrence.getApproveTaskColor())
				.completedTaskColor(organizationPrefrence.getCompletedTaskColor())
				.draftTaskColor(organizationPrefrence.getDraftTaskColor())
				.errorTaskColor(organizationPrefrence.getErrorTaskColor())
				.pendingTaskColor(organizationPrefrence.getPendingTaskColor())
				.rejectTaskColor(organizationPrefrence.getRejectTaskColor()).build();
	}

	private ProcessInstanceListVO constructTaskListDTOToVO(ProcessInstanceTask processInstanceTask,
			Map<String, Object> fieldValueMap, PaginationVO paginationVO) {
		String viewStatus = null;
		String taskBackground = null;
		List<FieldListVO> fieldValues = null;
		String totalTimeTaken = "";
		boolean hasError = false;

		JsonNode propertyValue = null;
		if (!processInstanceTask.getProcessDefinitionTask().getTaskProperties().isEmpty()) {
			propertyValue = processInstanceTask.getProcessDefinitionTask().getTaskProperties().get(0)
					.getPropertyValue();

			if (StringUtils.equalsAnyIgnoreCase(processInstanceTask.getStatus(), IN_PROCESS, "IN_PROCESS",
					"IN_PROGRESS")) {
				viewStatus = IN_PROCESS;
			} else if (StringUtils.equalsIgnoreCase(processInstanceTask.getStatus(), COMPLETED)) {
				viewStatus = COMPLETED;
			}

			fieldValues = getFieldValues(propertyValue, fieldValueMap, false);
		}

		if (fieldValues != null) {
			java.util.Collections.sort(fieldValues, (o1, o2) -> o1.getOrder() - o2.getOrder());
		}

		Long duration = null;
		if (processInstanceTask.getEndTime() != null) {
			duration = ChronoUnit.MINUTES.between(processInstanceTask.getProcessInstance().getStartTime(),
					processInstanceTask.getEndTime());
		}

		if (StringUtils.equalsAnyIgnoreCase(paginationVO.getTaskStatus(), "completed")
				|| StringUtils.equalsAnyIgnoreCase(paginationVO.getTaskStatus(), "running")) {
			totalTimeTaken = getTime(processInstanceTask.getProcessInstance());
		}

		String draft = "No";
		if (processInstanceTask.getData() != null) {
			draft = "Yes";
		}

		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> listGroupUUID = getGroupAsUUID(userVO);

		TaskBackgroundVo taskBackgroundVo = getTaskBackground();

		if (StringUtils.equalsAnyIgnoreCase(paginationVO.getTaskStatus(), "done")
				|| StringUtils.equalsAnyIgnoreCase(paginationVO.getTaskStatus(), "completed")) {
			if (StringUtils.equalsIgnoreCase(processInstanceTask.getProcessDefinitionTask().getTaskType(),
					"APPROVAL_TASK")) {
				String approvalStatus = getText(processInstanceTask.getData(), APPROVAL_STATUS, null);

				if (StringUtils.equalsIgnoreCase(approvalStatus, APPROVED)) {
					taskBackground = taskBackgroundVo.getApproveTaskColor();
				} else if (StringUtils.equalsIgnoreCase(approvalStatus, REJECTED)) {
					taskBackground = taskBackgroundVo.getRejectTaskColor();
				} else if (StringUtils.equalsIgnoreCase(approvalStatus, SENDBACK)) {
					taskBackground = taskBackgroundVo.getPendingTaskColor();
				}
			} else {
				taskBackground = taskBackgroundVo.getCompletedTaskColor();
			}
		} else if (StringUtils.equalsAnyIgnoreCase(paginationVO.getTaskStatus(), "draft")) {
			taskBackground = taskBackgroundVo.getDraftTaskColor();
		} else if (StringUtils.equalsAnyIgnoreCase(paginationVO.getTaskStatus(), "pendingUserTask")
				|| StringUtils.equalsAnyIgnoreCase(paginationVO.getTaskStatus(), "pendingGroupTask")
				|| StringUtils.equalsAnyIgnoreCase(paginationVO.getTaskStatus(), "running")) {
			if (StringUtils.equalsAnyIgnoreCase(draft, "No")) {
				taskBackground = taskBackgroundVo.getPendingTaskColor();
			} else {
				taskBackground = taskBackgroundVo.getDraftTaskColor();
			}
		}

		if (processInstanceTask != null && !CollectionUtils.isEmpty(errorProcessInstanceRepository
				.getListBasedonTenantIdAndActiveFlag(processInstanceTask.getProcessInstance().getProcessInstanceId(),
						YorosisContext.get().getTenantId()))) {
			hasError = true;
		}

		return ProcessInstanceListVO.builder().fieldValues(fieldValues).duration(duration).draft(draft)
				.taskStartDate(processInstanceTask.getProcessInstance().getStartTime())
				.processInstanceTaskId(processInstanceTask.getProcessInstanceTaskId()).userId(userVO.getUserId())
				.groupId(listGroupUUID.get(0)).taskName(processInstanceTask.getProcessDefinitionTask().getTaskName())
				.description(processInstanceTask.getDescription()).dueDate(processInstanceTask.getDueDate())
				.processInstanceId(processInstanceTask.getProcessInstance().getProcessInstanceId())
				.startTime(processInstanceTask.getStartTime()).endTime(processInstanceTask.getEndTime())
				.status(viewStatus).viewDetailsButtonName(getText(propertyValue, "launchButtonName", "View Details"))
				.cancelButtonName(getText(propertyValue, "cancelButtonName", null))
				.cancellableWorkflow(getBoolean(propertyValue, "isCancellableWorkflow", false))
				.enableSaveAsDraft(getBoolean(propertyValue, "enableSaveAsDraft", false))
				.message(getText(propertyValue, "message", null)).taskBackground(taskBackground)
				.totalTimeTaken(totalTimeTaken)
				.instanceStartDate(processInstanceTask.getProcessInstance().getStartTime()).hasError(hasError).build();
	}

	private List<FieldListVO> getFieldValues(JsonNode propertyValue, Map<String, Object> fieldValueMap,
			boolean wildCardSearch) {
		List<FieldListVO> fieldValuesList = new ArrayList<>();

		if (propertyValue.has("showInTaskList")) {
			Iterator<Entry<String, JsonNode>> entryNodeIterator = propertyValue.get("showInTaskList").fields();

			if (entryNodeIterator.hasNext()) {
				while (entryNodeIterator.hasNext()) {
					Entry<String, JsonNode> fieldMappingEntry = entryNodeIterator.next();
					if (wildCardSearch) {
						if (fieldMappingEntry.getValue().has("enableWildCard")
								&& fieldMappingEntry.getValue().get("enableWildCard").asBoolean()) {
							fieldValuesList.add(getFieldVo(fieldMappingEntry, fieldValueMap));
						}
					} else {
						fieldValuesList.add(getFieldVo(fieldMappingEntry, fieldValueMap));
					}
				}
			}
		}

		return fieldValuesList;
	}

	private FieldListVO getFieldVo(Entry<String, JsonNode> fieldMappingEntry, Map<String, Object> fieldValueMap) {
		JsonNode field = fieldMappingEntry.getValue().get("name");
		FieldListVO fieldVo = FieldListVO.builder().fieldId(fieldMappingEntry.getValue().get("name").asText())
				.order(fieldMappingEntry.getValue().get("order").asInt())
				.datatype(WorkflowUtils.getFieldDataType(field)).build();

		if (fieldMappingEntry.getValue().has("dataType")) {
			fieldVo.setDatatype(fieldMappingEntry.getValue().get("dataType").asText());
		}

		Object value = fieldValueMap.get(fieldMappingEntry.getKey());
		if (value != null) {
			fieldVo.setFieldName(value.toString());
		}
		return fieldVo;
	}

	private ProcessInstanceLaunchedListVo constructLaunchedTaskListDTOToVO(ProcessInstance processInstance) {
		String status = null;
		if (StringUtils.equalsIgnoreCase(processInstance.getStatus(), "IN_PROCESS")) {
			status = IN_PROCESS;
		} else {
			status = processInstance.getStatus();
		}

		return ProcessInstanceLaunchedListVo.builder().endTime(processInstance.getEndTime()).assignedTo(null)
				.taskName(processInstance.getProcessDefinition().getProcessDefinitionName()).status(status)
				.formId(processInstance.getProcessDefinition().getProcessDefinitionTasks().get(0).getFormId())
				.startTime(processInstance.getStartTime()).build();
	}

	protected Pageable getPageableObject(PaginationVO vo) {
		Sort sort = null;
		int pageSize = 10;
		int pageIndex = vo.getIndex();

		if (vo.getSize() > 0) {
			pageSize = vo.getSize();
		}

		if (!StringUtils.equals(vo.getTaskStatus(), "launched") && vo.getFilterValue() != null
				&& vo.getFilterValue().length > 0) {
			pageIndex = 0;
			pageSize = 1000;
		}

		if (StringUtils.equals(vo.getDirection(), "asc")) {
			sort = Sort.by(new Sort.Order(Direction.ASC, vo.getColumnName()));
		} else if (StringUtils.equals(vo.getDirection(), "desc")) {
			sort = Sort.by(new Sort.Order(Direction.DESC, vo.getColumnName()));
		} else {
			sort = Sort.by(new Sort.Order(Direction.ASC, "p.startTime"));
		}

		return PageRequest.of(pageIndex, pageSize, sort);
	}

	private boolean isPendingUserTask(String status) {
		return StringUtils.equalsAnyIgnoreCase(status, "pendingUserTask", "dueDatePassedPendingUserTask");
	}

	private boolean isPendingGroupTask(String status) {
		return StringUtils.equalsAnyIgnoreCase(status, "pendingGroupTask", "dueDatePassedPendingGroupTask");
	}

	private boolean doesMatchesFilterValue(Map<String, Object> fieldValueMap, FilterValueVO[] currentFilterList,
			ProcessInstanceTask task) {
		if (currentFilterList == null || currentFilterList.length == 0) {
			return true;
		}

		boolean isMatched = true;
		for (FilterValueVO filterValue : currentFilterList) {
			String filterId = toTitleCase(filterValue.getFilterIdColumn());
			filterId = filterId.replaceAll(" ", "");
			filterId = filterId.substring(0, 1).toLowerCase() + filterId.substring(1);
			Object object = fieldValueMap.get(filterId);
			if (object == null) {
				isMatched = false;
				break;
			}
			if (StringUtils.equals(object.toString(), "null")
					|| !checkFiledValues(filterValue.getFilterIdColumn(), task, fieldValueMap, false)) {
				isMatched = false;
				break;
			}
			String value = object.toString();
			if (isMatched && (StringUtils.equalsIgnoreCase(filterValue.getFilterDataType(), "string")
					|| StringUtils.equalsIgnoreCase(filterValue.getFilterDataType(), "text"))) {
				isMatched = FilterUtils.getValue(value, filterValue, isMatched);
			} else if (isMatched && (StringUtils.equalsIgnoreCase(filterValue.getFilterDataType(), "integer")
					|| StringUtils.equalsIgnoreCase(filterValue.getFilterDataType(), "long"))) {
				isMatched = FilterUtils.getNumber(Long.parseLong(value), filterValue, isMatched);
			} else if (isMatched && (StringUtils.equalsIgnoreCase(filterValue.getFilterDataType(), "date"))) {
				DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
				LocalDate dateTimeFromFilter = LocalDate.parse(value.subSequence(0, 10), formatter);
				isMatched = FilterUtils.getDateValue(dateTimeFromFilter, filterValue, isMatched);
			} else if (isMatched && (StringUtils.equalsIgnoreCase(filterValue.getFilterDataType(), "float")
					|| StringUtils.equalsIgnoreCase(filterValue.getFilterDataType(), "double"))) {
				isMatched = FilterUtils.getFloat(Double.parseDouble(value), filterValue, isMatched);
			} else if (isMatched && (StringUtils.equalsIgnoreCase(filterValue.getFilterDataType(), "boolean"))) {
				isMatched = FilterUtils.getBoolean(Boolean.parseBoolean(value), filterValue, isMatched);
			}
		}

		return isMatched;
	}

	@Transactional
	public TableDataVO getTaskList(PaginationVO pagination, UUID workspaceId) throws JsonProcessingException {
		return getTasksList(pagination, false, getWorkspace(pagination, workspaceId));
	}

	private TableDataVO getTasksList(PaginationVO pagination, boolean wildCardSearch, List<UUID> workspaceIdList)
			throws JsonProcessingException {
		UsersVO userVO = userService.getLoggedInUserDetails();
		Pageable pageable = getPageableObject(pagination);

		boolean isNoFilter = (pagination.getFilterValue() == null || pagination.getFilterValue().length == 0);

		LocalDateTime date = LocalDateTime.now().plus(2, ChronoUnit.YEARS);
		if (StringUtils.equalsAnyIgnoreCase(pagination.getTaskStatus(), "dueDatePassedPendingUserTask",
				"dueDatePassedPendingGroupTask")) {
			date = LocalDate.now().atStartOfDay();
		}

		int totalCount = -1;
		List<UUID> userGroupIdsList = getGroupAsUUID(userVO);
		if (isPendingUserTask(pagination.getTaskStatus())) {
			if (isNoFilter) {
				totalCount = processInstanceTaskRepo.getPendingUserTasksCount(userVO.getUserId(),
						YorosisContext.get().getTenantId(), date, workspaceIdList);
			}

			List<ProcessInstanceTask> listOfTasks = processInstanceTaskRepo.getPendingUserTasks(userVO.getUserId(),
					YorosisContext.get().getTenantId(), date, workspaceIdList, pageable);

			return getTasks(pagination, listOfTasks, totalCount, wildCardSearch);
		}

		if (isPendingGroupTask(pagination.getTaskStatus())) {
			if (isNoFilter) {
				totalCount = processInstanceTaskRepo.getPendingGroupTasksCount(userGroupIdsList,
						YorosisContext.get().getTenantId(), date, workspaceIdList);
			}

			List<ProcessInstanceTask> listOfTasks = processInstanceTaskRepo.getPendingGroupTasks(userGroupIdsList,
					YorosisContext.get().getTenantId(), date, workspaceIdList, pageable);

			return getTasks(pagination, listOfTasks, totalCount, wildCardSearch);
		}

		if (StringUtils.equalsIgnoreCase(pagination.getTaskStatus(), "draft")) {

			if (isNoFilter) {
				totalCount = processInstanceTaskRepo.getDraftTaskCount(userVO.getUserId(), userGroupIdsList,
						YorosisContext.get().getTenantId(), date, workspaceIdList);
			}

			List<ProcessInstanceTask> listOfTasks = processInstanceTaskRepo.getDraftTask(userVO.getUserId(),
					userGroupIdsList, YorosisContext.get().getTenantId(), date, workspaceIdList, pageable);

			return getTasks(pagination, listOfTasks, totalCount, wildCardSearch);
		}

		if (StringUtils.equalsIgnoreCase(pagination.getTaskStatus(), "done")) {
			if (StringUtils.isBlank(pagination.getDirection()) || StringUtils.isBlank(pagination.getColumnName())) {
				pagination.setColumnName("p.createdDate");
				pagination.setDirection("desc");

				pageable = getPageableObject(pagination);
			}

			if (isNoFilter) {
				totalCount = processInstanceTaskRepo.getDoneListCount(userVO.getUserName(),
						YorosisContext.get().getTenantId(), workspaceIdList);
			}

			List<ProcessInstanceTask> listOfTasks = processInstanceTaskRepo.getDoneList(userVO.getUserName(),
					YorosisContext.get().getTenantId(), workspaceIdList, pageable);

			return getTasks(pagination, listOfTasks, totalCount, wildCardSearch);
		}

		return TableDataVO.builder().build();
	}

	private TableDataVO getTasks(PaginationVO pagination, List<ProcessInstanceTask> listOfTasks, int totalCount,
			boolean wildCardSearch) {
		List<ProcessInstanceListVO> taskList = new ArrayList<>();

		boolean isNoFilter = (pagination.getFilterValue() == null || pagination.getFilterValue().length == 0
				|| wildCardSearch);

		int pageNumber = pagination.getIndex();
		int pageSize = pagination.getSize() > 0 ? pagination.getSize() : 10;
		int skipRecords = isNoFilter ? 0 : pageNumber * pageSize;

		int matchCount = 0;
		for (ProcessInstanceTask task : listOfTasks) {
			Map<String, Object> fieldValueMap = flowEngineService.getInitialValues(task.getProcessInstanceTaskId(),
					false);
			if (wildCardSearch) {
				if (doesMatchesFilterValueForWildSearch(fieldValueMap, pagination.getFilterValue(), task)) {
					matchCount++;
					if (matchCount > skipRecords && matchCount <= (skipRecords + pageSize)) {
						taskList.add(constructTaskListDTOToVO(task, fieldValueMap, pagination));
					}
				}
			} else {

				if (doesMatchesFilterValue(fieldValueMap, pagination.getFilterValue(), task)) {
					matchCount++;
					if (matchCount > skipRecords && matchCount <= (skipRecords + pageSize)) {
						taskList.add(constructTaskListDTOToVO(task, fieldValueMap, pagination));
					}
				}
			}
		}

		if (totalCount <= 0) {
			totalCount = matchCount;
		}

		return TableDataVO.builder().data(taskList).totalRecords(String.valueOf(totalCount)).build();
	}

	@Transactional
	public TableDataVO getTaskListCount(UUID workspaceId) {
		int totalDraftTaskCount = 0;
		int totalAssigendTaskCount = 0;
		int totalGroupTaskCount = 0;
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = getGroupAsUUID(userVO);
		List<UUID> workspaceIdList = new ArrayList<>();
		workspaceIdList.add(workspaceId);
		LocalDateTime date = LocalDateTime.now().plus(2, ChronoUnit.YEARS);
		totalDraftTaskCount = processInstanceTaskRepo.getDraftTaskCount(userVO.getUserId(), userGroupIdsList,
				YorosisContext.get().getTenantId(), date, workspaceIdList);
		totalAssigendTaskCount = processInstanceTaskRepo.getPendingUserTasksCount(userVO.getUserId(),
				YorosisContext.get().getTenantId(), date, workspaceIdList);
		totalGroupTaskCount = processInstanceTaskRepo.getPendingGroupTasksCount(userGroupIdsList,
				YorosisContext.get().getTenantId(), date, workspaceIdList);
		return TableDataVO.builder().draftRecordsCount(String.valueOf(totalDraftTaskCount))
				.assignedRecordsCount(String.valueOf(totalAssigendTaskCount))
				.groupRecordsCount(String.valueOf(totalGroupTaskCount)).build();

	}

	private List<UUID> getGroupAsUUID(UsersVO userVO) {
		List<GroupVO> listGroupVO = userVO.getGroupVOList();

		if (listGroupVO != null && listGroupVO.isEmpty()) {
			return Collections.emptyList();
		}

		return listGroupVO.stream().map(GroupVO::getGroupId).collect(Collectors.toList());
	}

	@Transactional
	public Set<FieldListVO> getFilterValues(PaginationVO pagination, UUID workspaceId) {
		List<ProcessInstanceTask> listOfTasks = new ArrayList<ProcessInstanceTask>();
		return getFilterValueList(pagination, false, listOfTasks, workspaceId);
	}

	private Set<FieldListVO> getFilterValueList(PaginationVO pagination, boolean wildSearch,
			List<ProcessInstanceTask> listOfTasks, UUID workspaceId) {
		Set<FieldListVO> filterList = new HashSet<FieldListVO>();
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = getGroupAsUUID(userVO);
		LocalDateTime date = LocalDateTime.now().plus(2, ChronoUnit.YEARS);

		if (isPendingUserTask(pagination.getTaskStatus())) {
			listOfTasks = processInstanceTaskRepo.getFilterValuesForPendingUserTasks(userVO.getUserId(),
					YorosisContext.get().getTenantId(), date, workspaceId);
		}

		if (isPendingGroupTask(pagination.getTaskStatus())) {

			listOfTasks = processInstanceTaskRepo.getFilterValuesForPendingGroupTasks(userGroupIdsList,
					YorosisContext.get().getTenantId(), date, workspaceId);
		}

		if (StringUtils.equalsIgnoreCase(pagination.getTaskStatus(), "draft")) {
			listOfTasks = processInstanceTaskRepo.getDraftTaskForFilter(userVO.getUserId(), userGroupIdsList,
					YorosisContext.get().getTenantId(), date, workspaceId);
		}

		if (StringUtils.equalsIgnoreCase(pagination.getTaskStatus(), "done")) {

			listOfTasks = processInstanceTaskRepo.getFilterValuesForDoneList(userVO.getUserName(),
					YorosisContext.get().getTenantId(), workspaceId);
		}

		for (ProcessInstanceTask task : listOfTasks) {
			Map<String, Object> fieldValueMap = flowEngineService.getInitialValues(task.getProcessInstanceTaskId(),
					false);
			if (!task.getProcessDefinitionTask().getTaskProperties().isEmpty()) {
				JsonNode propertyValue = task.getProcessDefinitionTask().getTaskProperties().get(0).getPropertyValue();
				filterList.addAll(getFieldValues(propertyValue, fieldValueMap, wildSearch));
			}
		}
		return filterList;
	}

	@Transactional
	public LaunchedListVO getLaunchedTaskList(PaginationVO pagination, UUID workspaceId) {
		// pagination.setFilterValue(null);
		Pageable pageable = getPageableObject(pagination);

		UsersVO usersVo = userService.getLoggedInUserDetails();
		if (pagination.getFilterValue().length != 0) {
			List<ProcessInstance> launchedListWithFilter = processInstanceRepo.getLaunchedListWithoutPagination(
					usersVo.getUserName(), YorosisContext.get().getTenantId(), workspaceId);

			return getLaunchedTasks(pagination, launchedListWithFilter);
		}

		List<ProcessInstance> launchedList = processInstanceRepo.getLaunchedList(usersVo.getUserName(),
				YorosisContext.get().getTenantId(), workspaceId, pageable);

		List<ProcessInstanceLaunchedListVo> launchedTaskList = new ArrayList<>();
		for (ProcessInstance instanceTask : launchedList) {
			launchedTaskList.add(constructLaunchedTaskListDTOToVO(instanceTask));
		}

		int count = processInstanceRepo.getLaunchedListCount(usersVo.getUserName(), YorosisContext.get().getTenantId(),
				workspaceId);
		return LaunchedListVO.builder().data(launchedTaskList).totalRecords(String.valueOf(count)).build();
	}

	private LaunchedListVO getLaunchedTasks(PaginationVO pagination, List<ProcessInstance> listOfTasks) {
		List<ProcessInstanceLaunchedListVo> list = new ArrayList<>();

		int pageNumber = pagination.getIndex();
		int pageSize = pagination.getSize() > 0 ? pagination.getSize() : 10;
		int skipRecords = pageNumber * pageSize;

		int matchCount = 0;
		for (ProcessInstance task : listOfTasks) {
			if (doesMatchesFilterValue(task, pagination.getFilterValue())) {
				matchCount++;
				if (matchCount > skipRecords && matchCount <= (skipRecords + pageSize)) {
					list.add(constructLaunchedTaskListDTOToVO(task));
				}
			}
		}

		return LaunchedListVO.builder().data(list).totalRecords(String.valueOf(matchCount)).build();
	}

	private boolean doesMatchesFilterValue(ProcessInstance filterField, FilterValueVO[] currentFilterList) {
		boolean isMatched = true;
		for (FilterValueVO filterValue : currentFilterList) {
			if (StringUtils.equalsAny(filterValue.getFilterIdColumn(), STARTDATE, STATUS, TASKNAME)) {
				String value = null;
				if (StringUtils.equals(filterValue.getFilterIdColumn(), TASKNAME)) {
					value = filterField.getProcessDefinition().getProcessDefinitionName();
				} else if (StringUtils.equals(filterValue.getFilterIdColumn(), STATUS)) {
					if (StringUtils.equalsIgnoreCase(filterField.getStatus(), "IN_PROCESS")) {
						value = IN_PROCESS;
					} else {
						value = filterField.getStatus();
					}
				}
				if (value != null) {
					isMatched = FilterUtils.getValue(value, filterValue, isMatched);
				}
				LocalDateTime dateValue = null;
				DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
				if (StringUtils.equals(filterValue.getFilterIdColumn(), STARTDATE)) {
					dateValue = filterField.getStartTime();
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

		return isMatched;
	}

	public ProcessInstanceUserTaskVO getTaskVo(ProcessInstanceTask processInstanceTask) {
		JsonNode propertyValue = null;
		if (!processInstanceTask.getProcessDefinitionTask().getTaskProperties().isEmpty()) {
			propertyValue = processInstanceTask.getProcessDefinitionTask().getTaskProperties().get(0)
					.getPropertyValue();
		}

		ProcessInstanceUserTaskVO processInstanceUserTaskVO = null;
		processInstanceUserTaskVO = ProcessInstanceUserTaskVO.builder()
				.taskType(processInstanceTask.getProcessDefinitionTask().getTaskType())
				.processInstanceTaskId(processInstanceTask.getProcessInstanceTaskId())
				.formId((processInstanceTask.getProcessDefinitionTask().getFormId()))
				.isApprovalForm(getBoolean(propertyValue, "isApprovalForm", false))
				.isSendBack(getBoolean(propertyValue, "isSendBack", false))
				.isReject(getBooleanFromText(propertyValue, "rejectedTask", false))
				.isCustomForm(getBoolean(propertyValue, "isCustomForm", false))
				.approveButtonName(getText(propertyValue, "approveButtonName", "Submit"))
				.processInstanceId(processInstanceTask.getProcessInstance().getProcessInstanceId())
				.version(getLong(propertyValue, "formVersion", 1L))
				.enableSaveAsDraft(getBoolean(propertyValue, "enableSaveAsDraft", false))
				.message(getText(propertyValue, "message", null))
				.isCancelWorkflow(getBoolean(propertyValue, "isCancellableWorkflow", false))
				.cancelButtonName(getText(propertyValue, "cancelButtonName", "Cancel"))
				.approveMessage(getText(propertyValue, "approveMessage", null))
				.rejectMessage(getText(propertyValue, "rejectMessage", null))
				.approvalButtonName(getText(propertyValue, "aproveButtonName", null))
				.rejectButtonName(getText(propertyValue, "rejectButtonName", null))
				.sendBackButtonName(getText(propertyValue, "sendBackButtonName", null))
				.printOnScreen(getBoolean(propertyValue, "printOnScreen", false))
				.enablePrinting(getBoolean(propertyValue, "enablePrinting", false))
				.taskName(getText(propertyValue, "name", null)).approveComment(processInstanceTask.getApproveComment())
				.sendBackComment(processInstanceTask.getSendBackComment())
				.rejectComment(processInstanceTask.getRejectComment()).build();
		if (StringUtils.equalsAnyIgnoreCase(processInstanceTask.getStatus(), IN_PROCESS, "IN_PROCESS", "IN_PROGRESS")) {
			processInstanceUserTaskVO.setStatus(IN_PROCESS);
		} else if (StringUtils.equalsIgnoreCase(processInstanceTask.getStatus(), COMPLETED)) {
			processInstanceUserTaskVO.setStatus(COMPLETED);
		}

		return processInstanceUserTaskVO;
	}

	@Transactional
	public ProcessInstanceUserTaskVO getTask(UUID processInstanceTaskId) {
		ProcessInstanceTask instanceTask = processInstanceTaskRepo.getOne(processInstanceTaskId);
		// Map<String, Object> fieldValueMap =
		// flowEngineService.getInitialValues(instanceTask.getProcessInstanceTaskId(),
		// false);

		return getTaskVo(instanceTask);
	}

	@Transactional
	public RessignResponseTaskVO reassignTask(RessignTaskVO ressignTaskVO) throws JsonProcessingException {
		if (ressignTaskVO != null && ressignTaskVO.getInstanceTaskId() != null) {

			User user = userRepo.findByUserNameAndTenantId(YorosisContext.get().getUserName(),
					YorosisContext.get().getTenantId());

			if (ressignTaskVO.getStatus() == null) {
				ProcessInstanceTask procInstanceTask = processInstanceTaskRepo
						.findByProcessInstanceTaskId(ressignTaskVO.getInstanceTaskId());
				if (procInstanceTask != null
						&& StringUtils.equals(procInstanceTask.getStatus(), Status.IN_PROCESS.toString())) {

					ProcessInstanceTask assignedToProcInstanceTask = ProcessInstanceTask.builder()
							.updatedBy(procInstanceTask.getUpdatedBy()).data(procInstanceTask.getData())
							.description(procInstanceTask.getDescription()).dueDate(procInstanceTask.getDueDate())
							.dueDateEventProcessedOn(procInstanceTask.getDueDateEventProcessedOn())
							.tenantId(YorosisContext.get().getTenantId())
							.targetStepKey(procInstanceTask.getTargetStepKey())
							.taskCompletionRemainderTime(procInstanceTask.getTaskCompletionRemainderTime())
							.createdBy(procInstanceTask.getCreatedBy())
							.processDefinitionTask(procInstanceTask.getProcessDefinitionTask())
							.processInstance(procInstanceTask.getProcessInstance()).build();
					if (ressignTaskVO.getAssignedToUser() != null) {
						workflowActivityLogService.saveAssignActivityLogForSave(procInstanceTask, "assignToUser",
								ressignTaskVO.getAssignedToUser().toString());
					}
					if (ressignTaskVO.getAssignedToGroup() != null) {
						workflowActivityLogService.saveAssignActivityLogForSave(procInstanceTask, "assignToGroup",
								ressignTaskVO.getAssignedToGroup().toString());
					}
					assignedToProcInstanceTask.setAssignedTo(ressignTaskVO.getAssignedToUser());
					assignedToProcInstanceTask.setAssignedToGroup(ressignTaskVO.getAssignedToGroup());
					assignedToProcInstanceTask.setStatus(Status.IN_PROCESS.toString());
					assignedToProcInstanceTask.setStartTime(LocalDateTime.now());
					assignedToProcInstanceTask.setReferredBy(user.getUserId());
					processInstanceTaskRepo.save(assignedToProcInstanceTask);
					procInstanceTask.setEndTime(LocalDateTime.now());
					procInstanceTask.setStatus(Status.COMPLETED.toString());
					processInstanceTaskRepo.save(procInstanceTask);

					if (saveTaskAssignedTaskNotifications(ressignTaskVO, assignedToProcInstanceTask,
							procInstanceTask.getProcessInstanceTaskId())) {
						saveAssignedToTaskNotes(procInstanceTask, assignedToProcInstanceTask,
								ressignTaskVO.getComments());
						return RessignResponseTaskVO.builder().reassigned(true)
								.reassignedInstanceTaskId(assignedToProcInstanceTask.getProcessInstanceTaskId())
								.build();
					} else {
						return RessignResponseTaskVO.builder().reassigned(true).response("Task assigned successfully")
								.build();
					}
				}
				return RessignResponseTaskVO.builder().reassigned(false).response("Task not assigned")
						.reassignedInstanceTaskId(procInstanceTask.getProcessInstanceTaskId()).build();

			} else {
				ProcessInstanceTask procInstanceTask = processInstanceTaskRepo
						.getProcessInstanceTask(ressignTaskVO.getInstanceTaskId(), YorosisContext.get().getTenantId());
				if (procInstanceTask != null) {
					procInstanceTask.setAssignedTo(ressignTaskVO.getAssignedToUser());
					procInstanceTask.setStatus(Status.IN_PROCESS.toString());
					procInstanceTask.setAssignedToGroup(null);
					processInstanceTaskRepo.save(procInstanceTask);
					if (StringUtils.equals(procInstanceTask.getAssignedTo().toString(), user.getUserId().toString())) {
						if (saveTaskAssignedTaskNotifications(ressignTaskVO, procInstanceTask,
								ressignTaskVO.getInstanceTaskId())) {
							return RessignResponseTaskVO.builder().response("Assigned User Successfully")
									.reassigned(true)
									.reassignedInstanceTaskId(procInstanceTask.getProcessInstanceTaskId()).build();
						} else {
							return RessignResponseTaskVO.builder().reassigned(true)
									.response("Task assigned successfully").build();
						}
					} else {
						return RessignResponseTaskVO.builder().reassigned(false)
								.response(String.format("This Task is assigned to %s", user.getUserName())).build();
					}
				} else {
					return RessignResponseTaskVO.builder().reassigned(false)
							.response(String.format("This Task is assigned to %s", user.getUserName())).build();
				}
			}

		}
		return RessignResponseTaskVO.builder().reassigned(false).response("Task not assigned").build();
	}

	private void saveAssignedToTaskNotes(ProcessInstanceTask procInstanceTask,
			ProcessInstanceTask assignedToProcInstanceTask, String comments) {
//		LocalDateTime timestamp = LocalDateTime.now();
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		for (ProcessInstanceTaskNotes note : procInstanceTask.getListTaskNotes()) {
			ProcessInstanceTaskNotes taskNotes = ProcessInstanceTaskNotes.builder()
					.addedBy(userRepo.findByUserNameAndTenantId(YorosisContext.get().getUserName(),
							YorosisContext.get().getTenantId()).getUserId())
					.notes(note.getNotes()).processInstanceTask(assignedToProcInstanceTask)
					.createdDate(note.getCreatedDate()).updatedDate(note.getUpdatedDate())
					.tenantId(YorosisContext.get().getTenantId()).updatedBy(YorosisContext.get().getUserName()).build();
			processInstanceTaskNotesRepository.save(taskNotes);
		}
		ProcessInstanceTaskNotes notes = ProcessInstanceTaskNotes.builder()
				.addedBy(userRepo.findByUserNameAndTenantId(YorosisContext.get().getUserName(),
						YorosisContext.get().getTenantId()).getUserId())
				.notes(comments).processInstanceTask(assignedToProcInstanceTask).createdDate((timestamp))
				.updatedDate(timestamp).tenantId(YorosisContext.get().getTenantId())
				.updatedBy(YorosisContext.get().getUserName()).build();
		processInstanceTaskNotesRepository.save(notes);
	}

	private Boolean saveTaskAssignedTaskNotifications(RessignTaskVO ressignTaskVO, ProcessInstanceTask procInstanceTask,
			UUID oldProcInstanceTaskId) {
		UUID fromId = userRepo
				.findByUserNameAndTenantId(YorosisContext.get().getUserName(), YorosisContext.get().getTenantId())
				.getUserId();
		if ((ressignTaskVO.getAssignedToUser() != null || ressignTaskVO.getAssignedToGroup() != null)
				&& notificationsRepository.checkNotifications(ressignTaskVO.getAssignedToUser(),
						ressignTaskVO.getAssignedToGroup(), fromId, oldProcInstanceTaskId,
						YorosisContext.get().getTenantId()) == null
				&& processInstanceTaskRepo.checkProcessInstanceCompletedTask(oldProcInstanceTaskId,
						YorosisContext.get().getTenantId()) == null) {
			NotificationsVO notificationsVO = NotificationsVO.builder().fromId(fromId)
					.toId(ressignTaskVO.getAssignedToUser()).groupId(ressignTaskVO.getAssignedToGroup())
					.type("workflow").message(procInstanceTask.getProcessDefinitionTask().getTaskName())
					.taskId(procInstanceTask.getProcessInstanceTaskId()).build();
			messagingServiceClient.saveNotifications(YorosisContext.get().getToken(), notificationsVO);
			eventsAutomationService.handleWorkflowTaskAssignMention(procInstanceTask, ressignTaskVO);
			return true;
		}
		return false;
	}

	public ResponseStringVO setAssignedTo(RessignTaskVO ressignTaskVO) throws YoroFlowException {
		ProcessInstanceTask procInstanceTask = processInstanceTaskRepo
				.findByProcessInstanceTaskId(ressignTaskVO.getInstanceTaskId());
		ressignTaskVO.getAssignedToUser();
		if (procInstanceTask != null) {
			if (procInstanceTask.getAssignedTo() != null
					&& !StringUtils.equals(procInstanceTask.getAssignedTo().toString(),
							ressignTaskVO.getAssignedToUser().toString())) {
				User user = userRepo.findByUserIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
						ressignTaskVO.getAssignedToUser(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
				return ResponseStringVO.builder()
						.response(String.format("This Task is assigned to %s", user.getUserName())).build();
			}

			procInstanceTask.setAssignedTo(ressignTaskVO.getAssignedToUser());
			processInstanceTaskRepo.save(procInstanceTask);
			return ResponseStringVO.builder().response("Assigned Successfully").build();
		}
		throw new YoroFlowException("Can't Assign User");
	}

	@Transactional
	public TaskBackgroundVo getTaskBackground() {
		OrganizationPrefrences orgPreferences = organizationPrefrencesRepository
				.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(YorosisContext.get().getTenantId(),
						YorosisConstants.YES);
		return constructTaskBackgroundDTOtoVo(orgPreferences);
	}

	private void setFilterForWildCardSearch(PaginationVO vo, List<ProcessInstanceTask> listOfTasks, UUID workspaceId) {
		Set<FieldListVO> wildFilterList = getFilterValueList(vo, true, listOfTasks, workspaceId);
		List<FilterValueVO> wildFilterValue = new ArrayList<>();
		for (FieldListVO fieldVO : wildFilterList) {
			wildFilterValue.add(
					FilterValueVO.builder().filterIdColumn(fieldVO.getFieldId()).filterIdColumnValue(vo.getWildSearch())
							.filterDataType(fieldVO.getDatatype()).operators("eq").build());
		}
		FilterValueVO[] array = new FilterValueVO[wildFilterValue.size()];
		vo.setFilterValue(wildFilterValue.toArray(array));
	}

	@Transactional
	public TableDataVO getListBasedOnWildCardSearch(PaginationVO vo, UUID workspaceId) throws JsonProcessingException {
		List<ProcessInstanceTask> listOfTasks = new ArrayList<>();
		setFilterForWildCardSearch(vo, listOfTasks, workspaceId);
		return getTasksList(vo, true, getWorkspace(vo, workspaceId));
	}

	private boolean doesMatchesFilterValueForWildSearch(Map<String, Object> fieldValueMap,
			FilterValueVO[] currentFilterList, ProcessInstanceTask task) {

		boolean isMatched = false;
		for (FilterValueVO filterValue : currentFilterList) {
			String filterId = toTitleCase(filterValue.getFilterIdColumn());
			filterId = filterId.replaceAll(" ", "");
			filterId = filterId.substring(0, 1).toLowerCase() + filterId.substring(1);
//			String filterId = filterValue.getFilterIdColumn().replaceAll("(.)([A-Z])", "$1 $2");
//			filterId = filterId.substring(0, 1).toUpperCase() + filterId.substring(1);
			Object object = fieldValueMap.get(filterId);
			if (object != null) {
				isMatched = checkFiledValues(filterValue.getFilterIdColumn(), task, fieldValueMap, true);
			}
			if (isMatched && object != null && !StringUtils.equals(object.toString(), "null")) {
				String value = object.toString();
				Object fValue = filterValue.getFilterIdColumnValue();
				isMatched = false;
				if ((StringUtils.equalsIgnoreCase(filterValue.getFilterDataType(), "string")
						|| StringUtils.equalsIgnoreCase(filterValue.getFilterDataType(), "text"))) {
					isMatched = StringUtils.equalsIgnoreCase(value, filterValue.getFilterIdColumnValue());
				} else if (!isMatched
						&& (StringUtils.equalsIgnoreCase(filterValue.getFilterDataType(), "integer")
								|| StringUtils.equalsIgnoreCase(filterValue.getFilterDataType(), "long"))
						&& (object instanceof Integer || object instanceof Long)
						&& (fValue instanceof Integer || fValue instanceof Long)) {
					isMatched = Long.parseLong(value) == Long.parseLong(filterValue.getFilterIdColumnValue());
				} else if (!isMatched
						&& (StringUtils.equalsIgnoreCase(filterValue.getFilterDataType(), "float")
								|| StringUtils.equalsIgnoreCase(filterValue.getFilterDataType(), "double"))
						&& (object instanceof Float || object instanceof Double)
						&& (fValue instanceof Float || fValue instanceof Double)) {
					isMatched = Double.parseDouble(value) == Double.parseDouble(filterValue.getFilterIdColumnValue());
				} else if (!isMatched && (StringUtils.equalsIgnoreCase(filterValue.getFilterDataType(), "boolean"))
						&& object instanceof Boolean && fValue instanceof Boolean) {
					isMatched = Boolean.parseBoolean(value);
				}
				if (isMatched) {
					return true;
				}
			}
		}
		return false;
	}

	private boolean checkFiledValues(String fieldName, ProcessInstanceTask task, Map<String, Object> fieldValueMap,
			boolean wildSearch) {
		if (!task.getProcessDefinitionTask().getTaskProperties().isEmpty()) {
			JsonNode propertyValue = task.getProcessDefinitionTask().getTaskProperties().get(0).getPropertyValue();
			if (propertyValue.has("showInTaskList")) {
				Iterator<Entry<String, JsonNode>> entryNodeIterator = propertyValue.get("showInTaskList").fields();
				if (entryNodeIterator.hasNext()) {
					while (entryNodeIterator.hasNext()) {
						Entry<String, JsonNode> fieldMappingEntry = entryNodeIterator.next();
						JsonNode field = fieldMappingEntry.getValue().get("name");
						if (!wildSearch) {
							if (StringUtils.equals(field.asText(), fieldName))
								return true;
						} else {

							if (fieldMappingEntry.getValue().has("enableWildCard")
									&& fieldMappingEntry.getValue().get("enableWildCard").asBoolean()) {
								if (StringUtils.equals(field.asText(), fieldName))
									return true;
							}
						}
					}
				}
			}
		}
		return false;
	}

	private String toTitleCase(String givenString) {
		String[] arr = givenString.split(" ");
		StringBuilder sb = new StringBuilder();

		for (int i = 0; i < arr.length; i++) {
			if (StringUtils.isNotBlank(arr[i])) {
				sb.append(Character.toUpperCase(arr[i].charAt(0))).append(arr[i].substring(1)).append(" ");
			}

		}
		return sb.toString().trim();
	}

	@Transactional
	public TableDataVO getProcessInstanceTaskListForRunningProcess(PaginationVO pagination, UUID workspaceId) {
		List<ProcessInstanceListVO> list = new ArrayList<>();
		String totalCount = "0";
		List<ProcessInstanceTask> procInstanceTaskList = new ArrayList<>();
		pagination.setTaskStatus("running");
		if (!StringUtils.isEmpty(pagination.getWildSearch())) {
			List<ProcessInstanceTask> taskList = getProcessInstanceRunningtaskListBasedOnSearch(pagination,
					workspaceId);
			setFilterForWildCardSearch(pagination, taskList, workspaceId);
			return getCompletedAndRunningWildCardSearchValues(pagination, taskList, list);
		}
		Pageable pageable = getPageableObject(pagination);
		if (!StringUtils.isEmpty(pagination.getDateSearch())) {
			LocalDate today = LocalDate.now();
			if (StringUtils.equals(pagination.getDateSearch(), "today")) {
				procInstanceTaskList = processInstanceTaskRepo.getRunningProcessTaskListBasedOnSearch(
						today.atStartOfDay(), today.plusDays(1).atStartOfDay(), pageable,
						YorosisContext.get().getTenantId(), workspaceId);
				totalCount = processInstanceTaskRepo.getRunningProcessTaskListBasedOnSearchCount(today.atStartOfDay(),
						today.plusDays(1).atStartOfDay(), YorosisContext.get().getTenantId(), workspaceId);
			} else if (StringUtils.equals(pagination.getDateSearch(), "yesterday")) {
				procInstanceTaskList = processInstanceTaskRepo.getRunningProcessTaskListBasedOnSearch(
						today.minusDays(1).atStartOfDay(), today.atStartOfDay(), pageable,
						YorosisContext.get().getTenantId(), workspaceId);
				totalCount = processInstanceTaskRepo.getRunningProcessTaskListBasedOnSearchCount(
						today.minusDays(1).atStartOfDay(), today.atStartOfDay(), YorosisContext.get().getTenantId(),
						workspaceId);
			} else if (StringUtils.equals(pagination.getDateSearch(), "lastWeek")) {
				procInstanceTaskList = processInstanceTaskRepo.getRunningProcessTaskListBasedOnSearch(
						today.minusDays(7).atStartOfDay(), today.atStartOfDay(), pageable,
						YorosisContext.get().getTenantId(), workspaceId);
				totalCount = processInstanceTaskRepo.getRunningProcessTaskListBasedOnSearchCount(
						today.minusDays(7).atStartOfDay(), today.atStartOfDay(), YorosisContext.get().getTenantId(),
						workspaceId);
			} else if (StringUtils.equals(pagination.getDateSearch(), "betweenDates")) {
				procInstanceTaskList = processInstanceTaskRepo.getRunningProcessTaskListBasedOnSearch(
						pagination.getStartDate(), pagination.getEndDate(), pageable,
						YorosisContext.get().getTenantId(), workspaceId);
				totalCount = processInstanceTaskRepo.getRunningProcessTaskListBasedOnSearchCount(
						pagination.getStartDate(), pagination.getEndDate(), YorosisContext.get().getTenantId(),
						workspaceId);
			}
		} else {
			totalCount = processInstanceTaskRepo.getRunningProcessTaskListCount(YorosisContext.get().getTenantId(),
					workspaceId);
			procInstanceTaskList = processInstanceTaskRepo.getRunningProcessTaskList(pageable,
					YorosisContext.get().getTenantId(), workspaceId);
		}
		for (ProcessInstanceTask processInstanceTask : procInstanceTaskList) {
			Map<String, Object> fieldValueMap = flowEngineService
					.getInitialValues(processInstanceTask.getProcessInstanceTaskId(), false);
			list.add(constructTaskListDTOToVO(processInstanceTask, fieldValueMap, pagination));
		}
		return TableDataVO.builder().data(list).totalRecords(totalCount).build();
	}

	@Transactional
	public TableDataVO getProcessInstanceTaskListForCompletedProcess(PaginationVO pagination, UUID workspaceId) {
		List<ProcessInstanceListVO> list = new ArrayList<>();
		List<ProcessInstance> processInstanceList = new ArrayList<>();
		String totalCount = "0";
		pagination.setTaskStatus("completed");
		if (!StringUtils.isEmpty(pagination.getWildSearch())) {
			List<ProcessInstanceTask> listOfTasks = getProcessInstanceCompletedtaskListBasedOnSearch(pagination,
					workspaceId);
			setFilterForWildCardSearch(pagination, listOfTasks, workspaceId);
			return getCompletedAndRunningWildCardSearchValues(pagination, listOfTasks, list);
		}
		Pageable pageable = getPageableObject(pagination);
		if (!StringUtils.isEmpty(pagination.getDateSearch())) {
			LocalDate today = LocalDate.now();
			if (StringUtils.equals(pagination.getDateSearch(), "today")) {
				processInstanceList = processInstanceRepo.getProcessInstanceCompletedListBasedOnSearch(
						today.atStartOfDay(), today.plusDays(1).atStartOfDay(), pageable, "COMPLETED",
						YorosisContext.get().getTenantId(), workspaceId);
				totalCount = processInstanceRepo.getProcessInstanceCompletedListBasedOnSearchCount(today.atStartOfDay(),
						today.plusDays(1).atStartOfDay(), "COMPLETED", YorosisContext.get().getTenantId(), workspaceId);
			} else if (StringUtils.equals(pagination.getDateSearch(), "yesterday")) {
				processInstanceList = processInstanceRepo.getProcessInstanceCompletedListBasedOnSearch(
						today.minusDays(1).atStartOfDay(), today.atStartOfDay(), pageable, "COMPLETED",
						YorosisContext.get().getTenantId(), workspaceId);
				totalCount = processInstanceRepo.getProcessInstanceCompletedListBasedOnSearchCount(
						today.minusDays(1).atStartOfDay(), today.atStartOfDay(), "COMPLETED",
						YorosisContext.get().getTenantId(), workspaceId);
			} else if (StringUtils.equals(pagination.getDateSearch(), "lastWeek")) {
				processInstanceList = processInstanceRepo.getProcessInstanceCompletedListBasedOnSearch(
						today.minusDays(7).atStartOfDay(), today.atStartOfDay(), pageable, "COMPLETED",
						YorosisContext.get().getTenantId(), workspaceId);
				totalCount = processInstanceRepo.getProcessInstanceCompletedListBasedOnSearchCount(
						today.minusDays(7).atStartOfDay(), today.atStartOfDay(), "COMPLETED",
						YorosisContext.get().getTenantId(), workspaceId);
			} else if (StringUtils.equals(pagination.getDateSearch(), "betweenDates")) {
				processInstanceList = processInstanceRepo.getProcessInstanceCompletedListBasedOnSearch(
						pagination.getStartDate(), pagination.getEndDate(), pageable, "COMPLETED",
						YorosisContext.get().getTenantId(), workspaceId);
				totalCount = processInstanceRepo.getProcessInstanceCompletedListBasedOnSearchCount(
						pagination.getStartDate(), pagination.getEndDate(), "COMPLETED",
						YorosisContext.get().getTenantId(), workspaceId);
			}
		} else {
			processInstanceList = processInstanceRepo.getProcessInstanceList(pageable, "COMPLETED",
					YorosisContext.get().getTenantId(), workspaceId);

			totalCount = processInstanceRepo.getProcessInstanceListCount("COMPLETED",
					YorosisContext.get().getTenantId(), workspaceId);
		}
		for (ProcessInstance processInstance : processInstanceList) {
			List<ProcessInstanceTask> taskList = processInstanceTaskRepo.getCompletedProcessTaskListByOrder(
					processInstance.getProcessInstanceId(), YorosisContext.get().getTenantId());
			if (!CollectionUtils.isEmpty(taskList)) {
				Map<String, Object> fieldValueMap = flowEngineService
						.getInitialValues(taskList.get(0).getProcessInstanceTaskId(), false);
				list.add(constructTaskListDTOToVO(taskList.get(0), fieldValueMap, pagination));
			}
		}
		return TableDataVO.builder().data(list).totalRecords(totalCount).build();
	}

	private TableDataVO getCompletedAndRunningWildCardSearchValues(PaginationVO pagination,
			List<ProcessInstanceTask> taskList, List<ProcessInstanceListVO> list) {
		boolean isNoFilter = (pagination.getFilterValue() == null || pagination.getFilterValue().length == 0);
		int pageNumber = pagination.getIndex();
		int pageSize = pagination.getSize() > 0 ? pagination.getSize() : 10;
		int skipRecords = isNoFilter ? 0 : pageNumber * pageSize;

		int matchCount = 0;
		for (ProcessInstanceTask processInstanceTask : taskList) {
			Map<String, Object> fieldValueMap = flowEngineService
					.getInitialValues(processInstanceTask.getProcessInstanceTaskId(), false);
			if (doesMatchesFilterValueForWildSearch(fieldValueMap, pagination.getFilterValue(), processInstanceTask)) {
				matchCount++;
				if (matchCount > skipRecords && matchCount <= (skipRecords + pageSize)) {
					list.add(constructTaskListDTOToVO(processInstanceTask, fieldValueMap, pagination));
				}
			}
		}
		return TableDataVO.builder().data(list).totalRecords(String.valueOf(matchCount)).build();
	}

	private List<ProcessInstanceTask> getProcessInstanceRunningtaskListBasedOnSearch(PaginationVO pagination,
			UUID workspaceId) {
		LocalDate today = LocalDate.now();
		if (StringUtils.equals(pagination.getDateSearch(), "today")) {
			return processInstanceTaskRepo.getRunningProcessTaskListBasedOnSearchWithoutPagination(today.atStartOfDay(),
					today.plusDays(1).atStartOfDay(), YorosisContext.get().getTenantId(), workspaceId);
		} else if (StringUtils.equals(pagination.getDateSearch(), "yesterday")) {
			return processInstanceTaskRepo.getRunningProcessTaskListBasedOnSearchWithoutPagination(
					today.minusDays(1).atStartOfDay(), today.atStartOfDay(), YorosisContext.get().getTenantId(),
					workspaceId);
		} else if (StringUtils.equals(pagination.getDateSearch(), "lastWeek")) {
			return processInstanceTaskRepo.getRunningProcessTaskListBasedOnSearchWithoutPagination(
					today.minusDays(7).atStartOfDay(), today.atStartOfDay(), YorosisContext.get().getTenantId(),
					workspaceId);
		} else if (StringUtils.equals(pagination.getDateSearch(), "betweenDates")) {
			return processInstanceTaskRepo.getRunningProcessTaskListBasedOnSearchWithoutPagination(
					pagination.getStartDate(), pagination.getEndDate(), YorosisContext.get().getTenantId(),
					workspaceId);
		} else {
			return processInstanceTaskRepo
					.getRunningProcessTaskListForWildCardSearch(YorosisContext.get().getTenantId(), workspaceId);
		}
	}

	private List<ProcessInstanceTask> getProcessInstanceCompletedtaskListBasedOnSearch(PaginationVO pagination,
			UUID workspaceId) {
		LocalDate today = LocalDate.now();
		List<ProcessInstanceTask> processInstanceTaskList = new ArrayList<ProcessInstanceTask>();
		List<ProcessInstance> processInstanceList = new ArrayList<ProcessInstance>();
		if (StringUtils.equals(pagination.getDateSearch(), "today")) {
			processInstanceList = processInstanceRepo.getProcessInstanceCompletedListBasedOnSearchWithoutPagination(
					today.atStartOfDay(), today.plusDays(1).atStartOfDay(), "COMPLETED",
					YorosisContext.get().getTenantId(), workspaceId);
		} else if (StringUtils.equals(pagination.getDateSearch(), "yesterday")) {
			processInstanceList = processInstanceRepo.getProcessInstanceCompletedListBasedOnSearchWithoutPagination(
					today.minusDays(1).atStartOfDay(), today.atStartOfDay(), "COMPLETED",
					YorosisContext.get().getTenantId(), workspaceId);
		} else if (StringUtils.equals(pagination.getDateSearch(), "lastWeek")) {
			processInstanceList = processInstanceRepo.getProcessInstanceCompletedListBasedOnSearchWithoutPagination(
					today.minusDays(7).atStartOfDay(), today.atStartOfDay(), "COMPLETED",
					YorosisContext.get().getTenantId(), workspaceId);
		} else if (StringUtils.equals(pagination.getDateSearch(), "betweenDates")) {
			processInstanceList = processInstanceRepo.getProcessInstanceCompletedListBasedOnSearchWithoutPagination(
					pagination.getStartDate(), pagination.getEndDate(), "COMPLETED", YorosisContext.get().getTenantId(),
					workspaceId);
		} else {
			processInstanceList = processInstanceRepo.getProcessInstanceListWithoutPagination("COMPLETED",
					YorosisContext.get().getTenantId(), workspaceId);
		}

		for (ProcessInstance processInstance : processInstanceList) {
			List<ProcessInstanceTask> taskList = processInstanceTaskRepo.getCompletedProcessTaskListByOrder(
					processInstance.getProcessInstanceId(), YorosisContext.get().getTenantId());
			if (!CollectionUtils.isEmpty(taskList)) {
				processInstanceTaskList.add(taskList.get(0));
			}
		}
		return processInstanceTaskList;
	}

	private String getTime(ProcessInstance processInstance) {
		Long totalTimeTaken = null;
		String time = null;
		LocalDateTime startTime = processInstance.getStartTime();
		LocalDateTime endTime = processInstance.getEndTime();
		if (endTime == null) {
			endTime = LocalDateTime.now();
		}

		if (startTime != null && endTime != null) {
			totalTimeTaken = ChronoUnit.MINUTES.between(startTime, endTime);
			if ((totalTimeTaken / 24 / 60) != 0) {
				time = totalTimeTaken / 24 / 60 + " " + "day" + " " + totalTimeTaken / 60 % 24 + " " + "hours" + " "
						+ totalTimeTaken % 60 + " " + "minutes";
			} else if ((totalTimeTaken / 60 % 24) != 0) {
				time = totalTimeTaken / 60 % 24 + " " + "hours" + " " + totalTimeTaken % 60 + " " + "minutes";
			} else {
				time = totalTimeTaken % 60 + " " + "minutes";
			}
		}
		return time;
	}
//	else if ((StringUtils.equalsIgnoreCase(filterValue.getFilterDataType(), "date"))) {
//	DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
//	LocalDate dateTimeFromFilter = LocalDate.parse(value.subSequence(0, 10), formatter);
//	isMatched = dateTimeFromFilter.minusDays(1L).isEqual(LocalDate
//			.parse(filterValue.getFilterIdColumnValue().subSequence(0, 10), formatter));
//} 

	public Set<TaskNameListVO> getAllTaskNames(List<UUID> workspaceIdList) {
		LocalDateTime date = LocalDateTime.now().plus(2, ChronoUnit.YEARS);
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = getGroupAsUUID(userVO);
		Set<String> userTaskNamesList = processInstanceTaskRepo.getAllUserTaskNames(userVO.getUserId(),
				YorosisContext.get().getTenantId(), date, workspaceIdList);
		Set<String> groupTaskNamesList = processInstanceTaskRepo.getAllGroupTaskNames(userGroupIdsList,
				YorosisContext.get().getTenantId(), date, workspaceIdList);

		Set<TaskNameListVO> taskNameListVO = new HashSet<>();

		for (String taskName : userTaskNamesList) {
			int groupCount = processInstanceTaskRepo.getPendingGroupTasksCountByTaskname(userGroupIdsList, taskName,
					YorosisContext.get().getTenantId(), date, workspaceIdList);
			int userCount = processInstanceTaskRepo.getPendingUserTasksCountByTaskname(userVO.getUserId(), taskName,
					YorosisContext.get().getTenantId(), date, workspaceIdList);

			TaskNameListVO vo = TaskNameListVO.builder().taskName(taskName).userCount(userCount).groupCount(groupCount)
					.taskType("user").build();
			taskNameListVO.add(vo);
		}

		for (String taskName : groupTaskNamesList) {
			int groupCount = processInstanceTaskRepo.getPendingGroupTasksCountByTaskname(userGroupIdsList, taskName,
					YorosisContext.get().getTenantId(), date, workspaceIdList);
			int userCount = processInstanceTaskRepo.getPendingUserTasksCountByTaskname(userVO.getUserId(), taskName,
					YorosisContext.get().getTenantId(), date, workspaceIdList);

			TaskNameListVO vo = TaskNameListVO.builder().taskName(taskName).userCount(userCount).groupCount(groupCount)
					.taskType("group").build();
			taskNameListVO.add(vo);
		}
		return taskNameListVO;
	}

	@Transactional
	public AllTaskVO getAllTaskList(PaginationVO pagination, UUID workspaceId) {
		return getAllTasksList(pagination, getWorkspace(pagination, workspaceId));
	}

	private List<UUID> getWorkspace(PaginationVO pagination, UUID workspaceId) {
		List<UUID> workspaceIdList = new ArrayList<>();
		if (BooleanUtils.isTrue(pagination.getAllWorkspace())) {
			UsersVO userVO = userService.getLoggedInUserDetails();
			List<UUID> userGroupIdsList = getGroupAsUUID(userVO);
			workspaceIdList = workspaceRepository.getListBasedonTenantIdAndActiveFlag(
					YorosisContext.get().getTenantId(), YorosisConstants.YES, userVO.getUserId(), userGroupIdsList);
		} else {
			workspaceIdList.add(workspaceId);
		}
		return workspaceIdList;
	}

	private Map<String, Object> getFieldVoForAllTask(Entry<String, JsonNode> fieldMappingEntry,
			Map<String, Object> fieldValueMap, List<FieldHeaderVO> fieldHeaderList, Map<String, Object> dataMap,
			List<String> fieldHeaderNameList) {
		if (fieldMappingEntry.getValue().get("name") != null && fieldMappingEntry.getValue().get("dataType") != null) {
			FieldHeaderVO fieldHeaderVO = FieldHeaderVO.builder()
					.headerName(fieldMappingEntry.getValue().get("name").asText())
					.dataType(fieldMappingEntry.getValue().get("dataType").asText()).build();
			fieldHeaderList.add(fieldHeaderVO);
			fieldHeaderNameList.add(fieldMappingEntry.getValue().get("name").asText());
		}
		Object value = fieldValueMap.get(fieldMappingEntry.getKey());
		if (value != null) {
			dataMap.put(fieldMappingEntry.getValue().get("name").asText(), value.toString());
		}
		return dataMap;
	}

	private FieldValuesVO getFieldValues(ProcessInstanceTask processInstanceTask, JsonNode propertyValue,
			Map<String, Object> fieldValueMap, String taskType) {
		Map<String, Object> fieldVo = null;
		List<Map<String, Object>> fieldValuesList = new ArrayList<>();
		List<FieldHeaderVO> fieldHeaderVoList = new ArrayList<>();
		List<String> fieldHeaderNameList = new ArrayList<>();
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> listGroupUUID = getGroupAsUUID(userVO);

		if (propertyValue.has("showInTaskList")) {
			Iterator<Entry<String, JsonNode>> entryNodeIterator = propertyValue.get("showInTaskList").fields();

			if (entryNodeIterator.hasNext()) {
				Map<String, Object> dataMap = new HashMap<>();

				RessignTaskVO build = RessignTaskVO.builder()
						.instanceTaskId(processInstanceTask.getProcessInstanceTaskId())
						.assignedToUser(userVO.getUserId()).assignedToGroup(listGroupUUID.get(0))
						.instanceId(processInstanceTask.getProcessInstance().getProcessInstanceId()).taskType(taskType)
						.build();
				dataMap.put("task", build);
				while (entryNodeIterator.hasNext()) {
					Entry<String, JsonNode> fieldMappingEntry = entryNodeIterator.next();
					fieldVo = getFieldVoForAllTask(fieldMappingEntry, fieldValueMap, fieldHeaderVoList, dataMap,
							fieldHeaderNameList);
				}
				fieldValuesList.add(fieldVo);
			} else {
				Map<String, Object> dataMap = new HashMap<>();

				RessignTaskVO build = RessignTaskVO.builder()
						.instanceTaskId(processInstanceTask.getProcessInstanceTaskId())
						.assignedToUser(userVO.getUserId()).assignedToGroup(listGroupUUID.get(0))
						.instanceId(processInstanceTask.getProcessInstance().getProcessInstanceId()).taskType(taskType)
						.build();
				dataMap.put("task", build);
				dataMap.put("test", "test");
				fieldValuesList.add(dataMap);
				fieldHeaderNameList.add("test");
				FieldHeaderVO fieldHeaderVO = FieldHeaderVO.builder().headerName("test").dataType("string").build();
				fieldHeaderVoList.add(fieldHeaderVO);
			}
		}
		fieldHeaderNameList.add("star");
		FieldHeaderVO fieldHeaderVO = FieldHeaderVO.builder().headerName("star").dataType("string").build();
		fieldHeaderVoList.add(fieldHeaderVO);
		return FieldValuesVO.builder().fieldHeadersList(fieldHeaderNameList).fieldHeaders(fieldHeaderVoList)
				.fieldValues(fieldValuesList).build();
	}

	private AllTaskListVO constructTaskListDTOToVOForAllTask(PaginationVO pagination,
			ProcessInstanceTask processInstanceTask, Map<String, Object> fieldValueMap, String taskType,
			boolean isNoFilter) {
		FieldValuesVO fieldValuesVO = null;
		JsonNode propertyValue = null;
		List<Map<String, Object>> fieldValues = new ArrayList<>();

		AllTaskListVO processInstanceListBuilder = AllTaskListVO.builder()
				.taskName(processInstanceTask.getProcessDefinitionTask().getTaskName()).build();

		if (!processInstanceTask.getProcessDefinitionTask().getTaskProperties().isEmpty()) {
			propertyValue = processInstanceTask.getProcessDefinitionTask().getTaskProperties().get(0)
					.getPropertyValue();

			processInstanceListBuilder
					.setViewDetailsButtonName(getText(propertyValue, "launchButtonName", "View Details"));
			processInstanceListBuilder.setCancelButtonName(getText(propertyValue, "cancelButtonName", null));
			processInstanceListBuilder
					.setCancellableWorkflow(getBoolean(propertyValue, "isCancellableWorkflow", false));

			fieldValuesVO = getFieldValues(processInstanceTask, propertyValue, fieldValueMap, taskType);

		}
		if (fieldValuesVO != null) {
			processInstanceListBuilder.setFieldHeaders(fieldValuesVO.getFieldHeaders());
			if (isNoFilter || isFilterSearch(fieldValueMap, pagination.getFilterValue(), processInstanceTask)) {
				processInstanceListBuilder.setFieldValues(fieldValuesVO.getFieldValues());
			} else {
				processInstanceListBuilder.setFieldValues(fieldValues);
			}
			processInstanceListBuilder.setFieldHeadersNameList(fieldValuesVO.getFieldHeadersList());
		}
		return processInstanceListBuilder;

	}

	private boolean isFilterSearch(Map<String, Object> fieldValueMap, FilterValueVO[] currentFilterList,
			ProcessInstanceTask task) {

		boolean isMatched = false;
		for (FilterValueVO filterValue : currentFilterList) {
			if (!StringUtils.isEmpty(filterValue.getFilterIdColumn())) {
				String filterId = toTitleCase(filterValue.getFilterIdColumn());
				filterId = filterId.replaceAll(" ", "");
				if (StringUtils.isNotBlank(filterId)) {
					filterId = filterId.substring(0, 1).toLowerCase() + filterId.substring(1);
					Object object = fieldValueMap.get(filterId);
					if (object != null) {
						isMatched = checkFiledValues(filterValue.getFilterIdColumn(), task, fieldValueMap, false);
					}
					if (isMatched && object != null && !StringUtils.equals(object.toString(), "null")) {
						String value = object.toString();
						if (StringUtils.equalsIgnoreCase(filterValue.getFilterDataType(), "string")
								|| StringUtils.equalsIgnoreCase(filterValue.getFilterDataType(), "text")) {
							isMatched = FilterUtils.getValue(value, filterValue, isMatched);
						} else if (StringUtils.equalsIgnoreCase(filterValue.getFilterDataType(), "integer")
								|| StringUtils.equalsIgnoreCase(filterValue.getFilterDataType(), "long")) {
							isMatched = FilterUtils.getNumber(Long.parseLong(value), filterValue, isMatched);
						} else if (StringUtils.equalsIgnoreCase(filterValue.getFilterDataType(), "date")) {
							DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
							LocalDate dateTimeFromFilter = LocalDate.parse(value.subSequence(0, 10), formatter);
							isMatched = FilterUtils.getDateValue(dateTimeFromFilter, filterValue, isMatched);
						} else if (StringUtils.equalsIgnoreCase(filterValue.getFilterDataType(), "float")
								|| StringUtils.equalsIgnoreCase(filterValue.getFilterDataType(), "double")) {
							isMatched = FilterUtils.getFloat(Double.parseDouble(value), filterValue, isMatched);
						} else if (StringUtils.equalsIgnoreCase(filterValue.getFilterDataType(), "boolean")) {
							isMatched = FilterUtils.getBoolean(Boolean.parseBoolean(value), filterValue, isMatched);
						}
						if (isMatched) {
							return true;
						}
					}
				}
			}
		}
		return false;
	}

	private List<AllTaskListVO> getList(PaginationVO pagination, Map<String, List<ProcessInstanceTask>> map,
			List<AllTaskListVO> taskList) {

		// TODO: check the below logic
		long startTime = 0;
		long stopTime = 0;
		long elapsedTime = 0;

		Map<String, List<AllTaskListVO>> updatedTaskList = new HashMap<>();
		boolean isNoFilter = (pagination.getFilterValue() == null || pagination.getFilterValue().length == 0);
		int pageNumber = pagination.getIndex();
		int pageSize = pagination.getSize() > 0 ? pagination.getSize() : 10;
		int skipRecords = isNoFilter ? 0 : pageNumber * pageSize;

		int matchCount = 0;
		for (Map.Entry<String, List<ProcessInstanceTask>> entry : map.entrySet()) {
			for (ProcessInstanceTask task : entry.getValue()) {

				startTime = System.currentTimeMillis();
//				log.info("getList with startTime {}", startTime );

				Map<String, Object> fieldValueMap = flowEngineService.getInitialValues(task.getProcessInstanceTaskId(),
						false);

				if (isNoFilter) {
					getTasks(pagination, task, fieldValueMap, entry.getKey(), taskList, updatedTaskList, isNoFilter);
				} else {
					if (!fieldValueMap.isEmpty()) {
						matchCount++;
						if (matchCount > skipRecords && matchCount <= (skipRecords + pageSize)) {
							getTasks(pagination, task, fieldValueMap, entry.getKey(), taskList, updatedTaskList,
									isNoFilter);
						}
					}
				}

				stopTime = System.currentTimeMillis();
				elapsedTime = stopTime - startTime;
				log.info("getList with elaspedTime ms {}", elapsedTime);
			}
		}

		return taskList;
	}

	private void getTasks(PaginationVO pagination, ProcessInstanceTask task, Map<String, Object> fieldValueMap,
			String key, List<AllTaskListVO> taskList, Map<String, List<AllTaskListVO>> updatedTaskList,
			boolean isNoFilter) {
		AllTaskListVO constructTaskListDTOToVO = constructTaskListDTOToVOForAllTask(pagination, task, fieldValueMap,
				key, isNoFilter);
		List<Map<String, Object>> fieldValues = constructTaskListDTOToVO.getFieldValues();
		if (!updatedTaskList.containsKey(task.getProcessDefinitionTask().getTaskName())) {
			taskList.add(constructTaskListDTOToVO);
			updatedTaskList.put(task.getProcessDefinitionTask().getTaskName(), taskList);
		} else {
			if (fieldValues != null && !fieldValues.isEmpty()) {
				List<AllTaskListVO> list = updatedTaskList.get(task.getProcessDefinitionTask().getTaskName());
				if (!list.isEmpty()) {
					list.forEach(action -> {
						if (action != null && action.getFieldValues() != null && StringUtils
								.equals(action.getTaskName(), task.getProcessDefinitionTask().getTaskName())) {
							action.getFieldValues().add(fieldValues.get(0));
						}
					});
				}
			}
		}

	}

	private List<TaskNameListVO> getTaskNamesList(List<ProcessInstanceTask> listOfTasks, List<UUID> workspaceIdList) {
		Map<String, List<TaskNameListVO>> updatedTaskList = new HashMap<>();
		LocalDateTime date = LocalDateTime.now().plus(2, ChronoUnit.YEARS);
		List<TaskNameListVO> taskNamesList = new ArrayList<>();
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = getGroupAsUUID(userVO);
		for (ProcessInstanceTask task : listOfTasks) {
			if (!updatedTaskList.containsKey(task.getProcessDefinitionTask().getTaskName())) {
				int groupCount = processInstanceTaskRepo.getPendingGroupTasksCountByTaskname(userGroupIdsList,
						task.getProcessDefinitionTask().getTaskName(), YorosisContext.get().getTenantId(), date,
						workspaceIdList);
				int userCount = processInstanceTaskRepo.getPendingUserTasksCountByTaskname(userVO.getUserId(),
						task.getProcessDefinitionTask().getTaskName(), YorosisContext.get().getTenantId(), date,
						workspaceIdList);

				TaskNameListVO build = TaskNameListVO.builder().taskName(task.getProcessDefinitionTask().getTaskName())
						.groupCount(groupCount).userCount(userCount).build();
				taskNamesList.add(build);
				updatedTaskList.put(task.getProcessDefinitionTask().getTaskName(), taskNamesList);
			}
		}

		return taskNamesList;
	}

	@Transactional
	public AllTaskVO getOnlyTaskCounts(UUID workspaceId, Boolean allWorkspace) {
		return getTaskNamesWithCountList(workspaceId, allWorkspace, true);
	}

	@Transactional
	public AllTaskVO getTaskNameWithCountList(UUID workspaceId, Boolean allWorkspace) {
		return getTaskNamesWithCountList(workspaceId, allWorkspace, false);
	}

	public AllTaskVO getTaskNamesWithCountList(UUID workspaceId, Boolean allWorkspace, Boolean count) {
		// TODO: check this get total assigned task

		long startTime = System.currentTimeMillis();
//		log.info("getTaskNamesWithCountList with startTime {}", startTime );

		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = getGroupAsUUID(userVO);
		LocalDateTime date = LocalDateTime.now().plus(2, ChronoUnit.YEARS);
		List<UUID> workspaceIdList = new ArrayList<>();
		if (BooleanUtils.isTrue(allWorkspace)) {
			workspaceIdList = workspaceRepository.getListBasedonTenantIdAndActiveFlag(
					YorosisContext.get().getTenantId(), YorosisConstants.YES, userVO.getUserId(), userGroupIdsList);
		} else {
			workspaceIdList.add(workspaceId);
		}
		int totalAssigendTaskCount = 0;
		int totalGroupTaskCount = 0;
		totalAssigendTaskCount = processInstanceTaskRepo.getPendingUserTasksCount(userVO.getUserId(),
				YorosisContext.get().getTenantId(), date, workspaceIdList);
		totalGroupTaskCount = processInstanceTaskRepo.getPendingGroupTasksCount(userGroupIdsList,
				YorosisContext.get().getTenantId(), date, workspaceIdList);
		List<ProcessInstanceTask> listOfTasks = new ArrayList<>();
		if (BooleanUtils.isFalse(count)) {
			listOfTasks = processInstanceTaskRepo.getAllTasks(userVO.getUserId(), userGroupIdsList,
					YorosisContext.get().getTenantId(), date, workspaceIdList);
		}
		long stopTime = System.currentTimeMillis();
		long elapsedTime = stopTime - startTime;
		log.info("getTaskNamesWithCountList with elaspedTime ms {}", elapsedTime);

		return AllTaskVO.builder().totalAssignedRecordsCount(String.valueOf(totalAssigendTaskCount))
				.totalGroupRecordsCount(String.valueOf(totalGroupTaskCount)).allTaskNamesWithCount(
						BooleanUtils.isFalse(count) ? getTaskNamesList(listOfTasks, workspaceIdList) : null)
				.build();
	}

	public String getName(UsersVO vo) {
		return (vo.getFirstName() + " " + vo.getLastName());
	}

	public String getUserName(UsersVO vo) {
		return vo.getUserName();
	}

	private void getGroupName(List<GroupVO> voList, UUID groupId, List<String> groupList) {
		for (GroupVO vo : voList) {
			if (StringUtils.equals(vo.getGroupId().toString(), groupId.toString())) {
				groupList.add((vo.getGroupName()));
			}
		}
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

	private boolean allowUser(ProcessInstanceTask instanceTask, JsonNode assigneeUser) {
		if (instanceTask.getAssignedTo() != null) {
			return true;
		}
		return (instanceTask.getAssignedToGroup() == null && assigneeUser != null && !assigneeUser.isNull()
				&& !StringUtils.equals(assigneeUser.asText(), ""));

	}

	public WorkflowVO getWorkFlowTaskVo(UsersVO userVO, ProcessInstanceTask instanceTask, String userName) {
		WorkflowVO workflowTaskVo = WorkflowVO.builder().taskName(instanceTask.getProcessDefinitionTask().getTaskName())
				.createdDate(instanceTask.getCreatedDate()).dueDate(instanceTask.getDueDate())
				.id(instanceTask.getProcessInstanceTaskId())
				.instanceId(instanceTask.getProcessInstance().getProcessInstanceId()).build();
		JsonNode propertyValue = null;
		if (!instanceTask.getProcessDefinitionTask().getTaskProperties().isEmpty()) {
			propertyValue = instanceTask.getProcessDefinitionTask().getTaskProperties().get(0).getPropertyValue();
			workflowTaskVo.setViewDetailsButtonName(getText(propertyValue, "launchButtonName", "View Details"));
			List<JsonNode> listAssigneeGroup = propertyValue.findValues("assigneeGroup");
			workflowTaskVo.setAssignedToGroup(getGroupNameList(userVO, listAssigneeGroup, instanceTask));
			workflowTaskVo.setAssignedTo(allowUser(instanceTask, propertyValue.get("assigneeUser")) ? userName : null);
			workflowTaskVo.setAssignToId(userVO.getUserId());
			workflowTaskVo.setCancelButtonName(getText(propertyValue, "cancelButtonName", null));
			workflowTaskVo.setCancellableWorkflow(getBoolean(propertyValue, "isCancellableWorkflow", false));
			workflowTaskVo.setWorkspaceName(workspaceRepository.getBasedonIdAndTenantIdAndActiveFlag(
					instanceTask.getProcessDefinitionTask().getProcessDefinition().getWorkspaceId(),
					YorosisContext.get().getTenantId(), YorosisConstants.YES).getWorkspaceName());

		}

		return workflowTaskVo;
	}

	private int getAllTasks(List<WorkflowVO> workflowTasksVo, PaginationVO pagination, UsersVO userVO,
			List<UUID> userGroupIdsList, LocalDateTime date, Pageable pageable, List<UUID> workspaceIdList) {
		String userName = getName(userVO);
		List<ProcessInstanceTask> processInstanceTask = new ArrayList<>();
		int processInstanceTaskCount = 0;
		if (StringUtils.equalsIgnoreCase(pagination.getTaskType(), "all")) {
			long startTime = System.currentTimeMillis();
			System.out.println("START TASKLIST --------------Get query startTime :​" + startTime);
			processInstanceTask = processInstanceTaskRepo.getAllTasksWithPagination(userVO.getUserId(),
					userGroupIdsList, YorosisContext.get().getTenantId(), date, workspaceIdList, pageable);
			processInstanceTaskCount = processInstanceTaskRepo.getAllTasksWithPaginationCount(userVO.getUserId(),
					userGroupIdsList, YorosisContext.get().getTenantId(), date, workspaceIdList);
			long stopTime = System.currentTimeMillis();
			long elapsedTime = stopTime - startTime;
			System.out.println("end TASKLIST --------------Get query elaspedTime ms  :​​" + elapsedTime);
		} else if (StringUtils.equalsIgnoreCase(pagination.getTaskType(), "user")) {
			processInstanceTask = processInstanceTaskRepo.getAllTasksWithPagination(userVO.getUserId(),
					Collections.emptyList(), YorosisContext.get().getTenantId(), date, workspaceIdList, pageable);
			processInstanceTaskCount = processInstanceTaskRepo.getAllTasksWithPaginationCount(userVO.getUserId(),
					Collections.emptyList(), YorosisContext.get().getTenantId(), date, workspaceIdList);
		} else if (StringUtils.equalsIgnoreCase(pagination.getTaskType(), "group")) {
			processInstanceTask = processInstanceTaskRepo.getAllTasksWithPagination(null, userGroupIdsList,
					YorosisContext.get().getTenantId(), date, workspaceIdList, pageable);
			processInstanceTaskCount = processInstanceTaskRepo.getAllTasksWithPaginationCount(null, userGroupIdsList,
					YorosisContext.get().getTenantId(), date, workspaceIdList);
		}

		if (!processInstanceTask.isEmpty()) {
//			for (ProcessInstanceTask instanceTask : processInstanceTask) {
//				workflowTasksVo.add(getWorkFlowTaskVo(userVO, instanceTask, userName));
//			}
			processInstanceTask.stream().filter(t -> workflowTasksVo.add(getWorkFlowTaskVo(userVO, t, userName)))
					.collect(Collectors.toList());
			log.info("count:{}", workflowTasksVo.size());
		}
		return processInstanceTaskCount;
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

	private boolean checkUser(ProcessInstanceTask instanceTask, UsersVO userVO) {
		boolean isUser = false;
		JsonNode propertyValue = null;
		if (!instanceTask.getProcessDefinitionTask().getTaskProperties().isEmpty()) {
			propertyValue = instanceTask.getProcessDefinitionTask().getTaskProperties().get(0).getPropertyValue();
			return allowUser(instanceTask, propertyValue.get("assigneeUser"));
		}
		return isUser;
	}

	private WorkflowTaskVO getAllTasksWithFilter(List<WorkflowVO> workflowTasksVo, PaginationVO pagination,
			UsersVO userVO, List<UUID> userGroupIdsList, LocalDateTime date, Pageable pageable,
			List<UUID> workspaceIdList) {
		String unassignedUser = "";
		Boolean unassignedGroup = false;
		List<ProcessInstanceTask> processInstanceTask = new ArrayList<>();
		List<UUID> groupList = new ArrayList<>();
		String userName = getName(userVO);
		for (FilterValueVO fValue : pagination.getFilterValue()) {
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
		if (StringUtils.equals(pagination.getTaskType(), "all")) {
			processInstanceTask = processInstanceTaskRepo.getAllTasks(userVO.getUserId(), userGroupIdsList,
					YorosisContext.get().getTenantId(), LocalDateTime.now().plus(2, ChronoUnit.YEARS), workspaceIdList);
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

		return getWorkflowTaskByFilter(pagination, processInstanceTask, workflowTasksVo, userVO, userName);

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

	public WorkflowTaskVO getWorkflowTaskByFilter(PaginationVO pagination, List<ProcessInstanceTask> listOfTasks,
			List<WorkflowVO> workflowTaskVO, UsersVO userVO, String userName) {
		int pageNumber = pagination.getIndex();
		int pageSize = pagination.getSize() > 0 ? pagination.getSize() : 10;
		int skipRecords = pageNumber * pageSize;

		int processInstanceTaskCount = 0;
		for (ProcessInstanceTask task : listOfTasks) {
			if (doesMatchesFilterValueForWorkflow(task, pagination.getFilterValue())) {
				processInstanceTaskCount++;
				if (processInstanceTaskCount > skipRecords && processInstanceTaskCount <= (skipRecords + pageSize)) {
					workflowTaskVO.add(getWorkFlowTaskVo(userVO, task, userName));
				}
			}
		}
		return WorkflowTaskVO.builder().workflowTasksVo(workflowTaskVO)
				.totalRecords(String.valueOf(processInstanceTaskCount)).build();
	}

	private AllTaskVO getAllTasksList(PaginationVO pagination, List<UUID> workspaceIdList) {
		long startTime = System.currentTimeMillis();
		log.info("START TASKLIST --------------Get All Task with startTime {​}​", startTime);

		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = getGroupAsUUID(userVO);
		LocalDateTime date = LocalDateTime.now().plus(2, ChronoUnit.YEARS);
		Pageable pageable = getPageableObject(pagination);
		List<AllTaskListVO> taskList = null;
		List<AllTaskListVO> allTaskList = new ArrayList<>();
		AllTaskVOBuilder allTaskVO = AllTaskVO.builder();
		if (StringUtils.equalsAnyIgnoreCase(pagination.getTaskStatus(), "dueDatePassedPendingUserTask",
				"dueDatePassedPendingGroupTask")) {
			date = LocalDate.now().atStartOfDay();
		}
		int totalAssigendTaskCount = 0;
		int totalGroupTaskCount = 0;
		int processInstanceTaskCount = 0;
		totalAssigendTaskCount = processInstanceTaskRepo.getPendingUserTasksCount(userVO.getUserId(),
				YorosisContext.get().getTenantId(), date, workspaceIdList);
		totalGroupTaskCount = processInstanceTaskRepo.getPendingGroupTasksCount(userGroupIdsList,
				YorosisContext.get().getTenantId(), date, workspaceIdList);

		List<WorkflowVO> workflowTasksVo = new ArrayList<>();
		Map<String, List<ProcessInstanceTask>> map = new HashMap<>();
		if (StringUtils.equalsIgnoreCase(pagination.getTaskName(), "all")) {
			if (pagination.getFilterValue() != null && pagination.getFilterValue().length != 0) {
				WorkflowTaskVO allTasksWithFilter = getAllTasksWithFilter(workflowTasksVo, pagination, userVO,
						userGroupIdsList, date, pageable, workspaceIdList);
				processInstanceTaskCount = Integer.parseInt(allTasksWithFilter.getTotalRecords());
				workflowTasksVo = allTasksWithFilter.getWorkflowTasksVo();
			} else {
				processInstanceTaskCount = getAllTasks(workflowTasksVo, pagination, userVO, userGroupIdsList, date,
						pageable, workspaceIdList);
			}
		} else {
			if (StringUtils.equalsIgnoreCase(pagination.getTaskType(), "all")) {
				List<ProcessInstanceTask> listOfAllUserTasks = processInstanceTaskRepo.getUserTasksByTaskType(
						userVO.getUserId(), pagination.getTaskName(), YorosisContext.get().getTenantId(), date,
						workspaceIdList, pageable);

				List<ProcessInstanceTask> listOfAllGroupTasks = processInstanceTaskRepo.getGroupTasksByTaskType(
						userGroupIdsList, pagination.getTaskName(), YorosisContext.get().getTenantId(), date,
						workspaceIdList, pageable);

				map.put("user_" + pagination.getTaskName(), listOfAllUserTasks);
				map.put("group_" + pagination.getTaskName(), listOfAllGroupTasks);
			} else if (StringUtils.equalsIgnoreCase(pagination.getTaskType(), "user")) {
				List<ProcessInstanceTask> listOfUserTasks = processInstanceTaskRepo.getUserTasksByTaskType(
						userVO.getUserId(), pagination.getTaskName(), YorosisContext.get().getTenantId(), date,
						workspaceIdList, pageable);

				map.put("user_" + pagination.getTaskName(), listOfUserTasks);
			} else if (StringUtils.equalsIgnoreCase(pagination.getTaskType(), "group")) {
				List<ProcessInstanceTask> listOfGroupTasks = processInstanceTaskRepo.getGroupTasksByTaskType(
						userGroupIdsList, pagination.getTaskName(), YorosisContext.get().getTenantId(), date,
						workspaceIdList, pageable);

				map.put("group_" + pagination.getTaskName(), listOfGroupTasks);

			}
			taskList = getList(pagination, map, allTaskList);
			if (!taskList.isEmpty() && taskList.get(0).getFieldValues() != null
					&& !taskList.get(0).getFieldValues().isEmpty()) {
				allTaskVO.taskCount(String.valueOf(taskList.get(0).getFieldValues().size()));
			} else {
				allTaskVO.taskCount(String.valueOf(0));
			}
		}
		allTaskVO.allTaskLists(taskList).totalAssignedRecordsCount(String.valueOf(totalAssigendTaskCount))
				.totalGroupRecordsCount(String.valueOf(totalGroupTaskCount)).taskType(pagination.getTaskType())
				.taskName(pagination.getTaskName()).filterIndex(pagination.getFilterIndex())
				.taskName(pagination.getTaskName()).workflowTasksVo(workflowTasksVo)
				.totalRecords(String.valueOf(processInstanceTaskCount));

		long stopTime = System.currentTimeMillis();
		long elapsedTime = stopTime - startTime;
		log.info("END TASKLIST --------------Get All Task with elaspedTime ms {}", elapsedTime);
		return allTaskVO.build();
	}
}
