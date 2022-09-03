package com.yorosis.taskboard.services;

import java.io.IOException;
import java.math.BigInteger;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.CreationHelper;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.streaming.SXSSFSheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.owasp.html.HtmlPolicyBuilder;
import org.owasp.html.PolicyFactory;
import org.owasp.html.Sanitizers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.yorosis.taskboard.event.automation.service.EventsAutomationService;
import com.yorosis.taskboard.exceptions.YoroFlowException;
import com.yorosis.taskboard.models.AssignGroupTaskVO;
import com.yorosis.taskboard.models.AssignTaskVO;
import com.yorosis.taskboard.models.AssignUserTaskVO;
import com.yorosis.taskboard.models.EventAutomationVO;
import com.yorosis.taskboard.models.FieldVO;
import com.yorosis.taskboard.models.FileUploadVO;
import com.yorosis.taskboard.models.FilesVO;
import com.yorosis.taskboard.models.FilterDateVO;
import com.yorosis.taskboard.models.GroupVO;
import com.yorosis.taskboard.models.LabelVO;
import com.yorosis.taskboard.models.NestedCommentsVO;
import com.yorosis.taskboard.models.NotificationsVO;
import com.yorosis.taskboard.models.PageFieldVo;
import com.yorosis.taskboard.models.ReplaceColumnVO;
import com.yorosis.taskboard.models.ReportGenerationVo;
import com.yorosis.taskboard.models.ReportHeadersVo;
import com.yorosis.taskboard.models.ResolveSecurityForTaskboardVO;
import com.yorosis.taskboard.models.ResolveSecurityForTaskboardVO.ResolveSecurityForTaskboardVOBuilder;
import com.yorosis.taskboard.models.ResponseStringVO;
import com.yorosis.taskboard.models.SecurityListVO;
import com.yorosis.taskboard.models.SubStatusVO;
import com.yorosis.taskboard.models.SubTaskCountVo;
import com.yorosis.taskboard.models.SubTaskVO;
import com.yorosis.taskboard.models.SubTaskVO.SubTaskVOBuilder;
import com.yorosis.taskboard.models.Subtask;
import com.yorosis.taskboard.models.TaskCommentsVO;
import com.yorosis.taskboard.models.TaskCountVo;
import com.yorosis.taskboard.models.TaskDependenciesVO;
import com.yorosis.taskboard.models.TaskEntityVO;
import com.yorosis.taskboard.models.TaskGroupByVO;
import com.yorosis.taskboard.models.TaskSequenceNumberVO;
import com.yorosis.taskboard.models.TaskSequenceVO;
import com.yorosis.taskboard.models.TaskboardColumnMapVO;
import com.yorosis.taskboard.models.TaskboardColumnSecurityListVO;
import com.yorosis.taskboard.models.TaskboardColumnsVO;
import com.yorosis.taskboard.models.TaskboardEntityVO;
import com.yorosis.taskboard.models.TaskboardExcelVO;
import com.yorosis.taskboard.models.TaskboardLabelsVO;
import com.yorosis.taskboard.models.TaskboardSecurityVO;
import com.yorosis.taskboard.models.TaskboardTaskFilesVO;
import com.yorosis.taskboard.models.TaskboardTaskLabelVO;
import com.yorosis.taskboard.models.TaskboardTaskVO;
import com.yorosis.taskboard.models.TaskboardTaskVO.TaskboardTaskVOBuilder;
import com.yorosis.taskboard.models.TaskboardVO;
import com.yorosis.taskboard.models.TaskboardVO.TaskboardVOBuilder;
import com.yorosis.taskboard.models.UserCustomAttributeVO;
import com.yorosis.taskboard.models.UserFieldVO;
import com.yorosis.taskboard.models.UserTasks;
import com.yorosis.taskboard.models.UsersVO;
import com.yorosis.taskboard.models.YoroDataType;
import com.yorosis.taskboard.models.sprint.SprintSettingsVo;
import com.yorosis.taskboard.repository.EventAutomationRepository;
import com.yorosis.taskboard.repository.GridViewRepository;
import com.yorosis.taskboard.repository.GroupRepository;
import com.yorosis.taskboard.repository.NotificationsRepository;
import com.yorosis.taskboard.repository.TaskboardColumnsRepository;
import com.yorosis.taskboard.repository.TaskboardColumnsSecurityRepository;
import com.yorosis.taskboard.repository.TaskboardLabelsRepository;
import com.yorosis.taskboard.repository.TaskboardRepository;
import com.yorosis.taskboard.repository.TaskboardSecurityRepository;
import com.yorosis.taskboard.repository.TaskboardSprintSettingsRepository;
import com.yorosis.taskboard.repository.TaskboardSubStatusRepository;
import com.yorosis.taskboard.repository.TaskboardTaskAssignedUsersRepository;
import com.yorosis.taskboard.repository.TaskboardTaskCommentsRepository;
import com.yorosis.taskboard.repository.TaskboardTaskDependenciesRepository;
import com.yorosis.taskboard.repository.TaskboardTaskFilesRepository;
import com.yorosis.taskboard.repository.TaskboardTaskLabelsRepository;
import com.yorosis.taskboard.repository.TaskboardTaskRepository;
import com.yorosis.taskboard.repository.UserGroupRepository;
import com.yorosis.taskboard.repository.UsersRepository;
import com.yorosis.taskboard.services.clients.MessagingServiceClient;
import com.yorosis.taskboard.services.clients.YoroappsServiceClient;
import com.yorosis.taskboard.services.variables.SystemVariableService;
import com.yorosis.taskboard.taskboard.entities.EventAutomation;
import com.yorosis.taskboard.taskboard.entities.Group;
import com.yorosis.taskboard.taskboard.entities.Notifications;
import com.yorosis.taskboard.taskboard.entities.Taskboard;
import com.yorosis.taskboard.taskboard.entities.TaskboardColumns;
import com.yorosis.taskboard.taskboard.entities.TaskboardColumnsSecurity;
import com.yorosis.taskboard.taskboard.entities.TaskboardLabels;
import com.yorosis.taskboard.taskboard.entities.TaskboardSecurity;
import com.yorosis.taskboard.taskboard.entities.TaskboardSprintSettings;
import com.yorosis.taskboard.taskboard.entities.TaskboardSubStatus;
import com.yorosis.taskboard.taskboard.entities.TaskboardTask;
import com.yorosis.taskboard.taskboard.entities.TaskboardTaskAssignedUsers;
import com.yorosis.taskboard.taskboard.entities.TaskboardTaskComments;
import com.yorosis.taskboard.taskboard.entities.TaskboardTaskDependencies;
import com.yorosis.taskboard.taskboard.entities.TaskboardTaskFiles;
import com.yorosis.taskboard.taskboard.entities.TaskboardTaskLabels;
import com.yorosis.taskboard.taskboard.entities.User;
import com.yorosis.taskboard.taskboard.entities.UserGroup;
import com.yorosis.yoroapps.apps.vo.AppsVo;
import com.yorosis.yoroapps.apps.vo.YoroGroupMapVo;
import com.yorosis.yoroapps.vo.LicenseVO;
import com.yorosis.yoroapps.vo.ReactiveOrInactiveUsers;
import com.yorosis.yoroapps.vo.SubscriptionExpireVO;
import com.yorosis.yoroapps.vo.TaskboardNamesVO;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class TaskboardService {

	private static final String DELETED = "deleted";
	private static final String ARCHIVED = "Archived";

	@Autowired
	private YoroappsServiceClient yoroappsServiceClient;

	private static final String MAIN_SECTION = "mainSection";
	private static final String TABLE_CONTROL = "tableControl";
	private static final String SUB_SECTION = "subSection";

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
	private static final String PARENT_TASK = "parentTask";
	private static final String BLACK = "black";
	private static final String CREATED_DATE = "createdDate";
	private static final String START_DATE = "startDate";
	private static final String DUE_DATE = "dueDate";
	private static final String ALL = "all";
	public static final PolicyFactory IMAGES = new HtmlPolicyBuilder().allowAttributes("src").onElements("img").allowUrlProtocols("http", "https", "data")
			.allowElements("img").toFactory();

	@Autowired
	private TaskboardRepository taskboardRepository;

	@Autowired
	private TaskboardTaskRepository taskboardTaskRepository;

	@Autowired
	private UsersRepository userRepository;

	@Autowired
	private TaskboardColumnsRepository taskboardColumnsRepository;

	@Autowired
	private TaskboardTaskCommentsRepository taskboardTaskCommentsRepository;

	@Autowired
	private TaskboardTaskAssignedUsersRepository taskboardTaskAssignedUsersRepository;

	@Autowired
	private NotificationsRepository notificationRepository;

	@Autowired
	private UserService userService;

	@Autowired
	private FileManagerService fileManagerService;

	@Autowired
	private TaskboardTaskFilesRepository taskboardTaskFilesRepository;

	@Autowired
	private TaskboardSecurityRepository taskboardSecurityRepository;

	@Autowired
	private GroupRepository groupRepository;

	@Autowired
	private TaskboardColumnsSecurityRepository taskboardColumnsSecurityRepository;

	@Autowired
	private UserGroupRepository userGroupRepository;

	@Autowired
	private TaskboardLabelsRepository taskboardLabelsRepository;

	@Autowired
	private TaskboardTaskLabelsRepository taskboardTaskLabelsRepository;

	@Autowired
	private TaskboardSubStatusRepository taskboardSubStatusRepository;

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private EventsAutomationService eventAutomationService;

	@Autowired
	private EventAutomationService entAutomationService;

	@Autowired
	private MessagingServiceClient messagingServiceClient;

	@Autowired
	private NotificationsService notificationsService;

	@Autowired
	private ProxyYoroflowSchemaService proxyYoroflowSchemaService;

	@Autowired
	private TaskboardTaskDependenciesRepository taskboardTaskDependenciesRepository;

	@Autowired
	private TaskboardSprintService taskboardSprintService;

	@Autowired
	private TaskboardSprintSettingsRepository taskboardSprintSettingsRepository;

	@Autowired
	private SystemVariableService systemVariableService;

	@Autowired
	private OrgCustomAttributeService orgCustomAttributeService;

	@Autowired
	private EventAutomationRepository eventAutomationRepository;

	@Autowired
	private ActivityLogService taskboardActivityLogService;

	@Autowired
	private GridViewRepository gridViewRepository;

	@Autowired
	private UserCustomAttributeService userCustomAttributeService;

	@Transactional
	public ResponseStringVO saveTaskBoard(TaskboardVO vo, UUID workspaceId, boolean installApp) throws IOException, ParseException {
		Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());
		Taskboard taskboard = null;

		if (vo.getId() == null) {
			LicenseVO licenseVO = isAllowed();
			if (StringUtils.equals(licenseVO.getResponse(), "within the limit")) {
				removedTaskboardColumns(vo.getRemovedColumnsIdList());
				taskboard = Taskboard.builder().name(vo.getName()).description(vo.getDescription()).createdBy(YorosisContext.get().getUserName())
						.createdOn(currentTimestamp).modifiedBy(YorosisContext.get().getUserName()).modifiedOn(currentTimestamp)
						.activeFlag(YorosisConstants.YES).tenantId(YorosisContext.get().getTenantId()).generatedTaskId(vo.getGeneratedTaskId())
						.taskName(vo.getTaskName()).taskboardKey(vo.getTaskboardKey()).workspaceId(workspaceId).initialMapData(vo.getFieldMapping())
						.isColumnBackground(vo.getIsColumnBackground() != null ? booleanToChar(vo.getIsColumnBackground()) : YorosisConstants.NO)
						.sprintEnabled(booleanToChar(vo.getSprintEnabled())).launchButtonName(vo.getLaunchButtonName()).build();

				List<TaskboardColumns> taskboardColumnsList = new ArrayList<>();
				for (TaskboardColumnsVO taskboardColumnsVO : vo.getTaskboardColumns()) {
					TaskboardColumns taskboardColumns = TaskboardColumns.builder().columnName(taskboardColumnsVO.getColumnName())
							.columnOrder(taskboardColumnsVO.getColumnOrder()).columnColor(taskboardColumnsVO.getColumnColor()).taskboard(taskboard)
							.createdBy(YorosisContext.get().getUserName()).createdOn(currentTimestamp).modifiedBy(YorosisContext.get().getUserName())
							.modifiedOn(currentTimestamp).formId(taskboardColumnsVO.getFormId()).version(taskboardColumnsVO.getVersion())
							.activeFlag(YorosisConstants.YES).tenantId(YorosisContext.get().getTenantId()).layoutType(taskboardColumnsVO.getLayoutType())
							.isDoneColumn(booleanToChar(taskboardColumnsVO.getIsDoneColumn()))
							.isColumnBackground(taskboardColumnsVO.getIsColumnBackground() != null ? booleanToChar(taskboardColumnsVO.getIsColumnBackground())
									: YorosisConstants.NO)
							.build();
					taskboardColumns.setTaskboard(taskboard);
//					if (BooleanUtils.isTrue(installApp)) {
//						taskboardColumns.setId(taskboardColumnsVO.getId());
//					}
					taskboardColumnsList.add(taskboardColumns);
				}
				taskboard.setTaskboardColumns(taskboardColumnsList);
				Taskboard savedTaskboard = taskboardRepository.save(taskboard);
				if (BooleanUtils.isTrue(vo.getSprintEnabled())) {
					TaskboardSprintSettings taskboardSprintSettings = taskboardSprintService.constructSprintSettingsVOToDto(vo.getSprintSettingsVo());
					taskboardSprintSettings.setTaskboard(savedTaskboard);
					taskboardSprintSettingsRepository.save(taskboardSprintSettings);
				}
				saveTaskboardSecurity(savedTaskboard);

				return ResponseStringVO.builder().response("Taskboard Created Successfully")
						.taskboardVO(constructTaskboardDtoToVo(savedTaskboard.getId(), "all", true)).build();
			} else {
				return ResponseStringVO.builder().response("You have exceeded your limit").licenseVO(licenseVO).build();
			}
		} else {
			removedTaskboardColumns(vo.getRemovedColumnsIdList());
			taskboard = taskboardRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(vo.getId(), YorosisContext.get().getTenantId(),
					YorosisConstants.YES);
			taskboard.setName(vo.getName());
			taskboard.setDescription(vo.getDescription());
			taskboard.setGeneratedTaskId(vo.getGeneratedTaskId());
			taskboard.setIsColumnBackground(booleanToChar(vo.getIsColumnBackground()));
			taskboard.setTaskName(vo.getTaskName());
			taskboard.setModifiedBy(YorosisContext.get().getUserName());
			taskboard.setModifiedOn(currentTimestamp);
			taskboard.setTaskboardKey(vo.getTaskboardKey());
			taskboard.setIsColumnBackground(booleanToChar(vo.getIsColumnBackground()));
			taskboard.setWorkspaceId(workspaceId);
			taskboard.setSprintEnabled(booleanToChar(vo.getSprintEnabled()));
			taskboard.setLaunchButtonName(vo.getLaunchButtonName());
			taskboard.setInitialMapData(vo.getFieldMapping());
			if (BooleanUtils.isFalse(vo.getSprintEnabled())) {
				TaskboardSprintSettings taskboardSprintSettings = taskboardSprintSettingsRepository.getTaskboardSprintSettingsByTaskboardId(vo.getId(),
						YorosisContext.get().getTenantId(), YorosisConstants.YES);
				if (taskboardSprintSettings != null) {
					taskboardSprintSettings.setActiveFlag(YorosisConstants.NO);
					taskboardSprintSettingsRepository.save(taskboardSprintSettings);
				}
			}
			return ResponseStringVO.builder().response("Taskboard Updated Successfully").taskboardVO(updateTaskboardColumnsList(taskboard, vo)).build();
		}

	}

	public LicenseVO isAllowed() {
		String currentTenantId = YorosisContext.get().getTenantId();

		LicenseVO licenseVO = proxyYoroflowSchemaService.isAllowed(currentTenantId, "taskboards", "boards");

		int totalTaskBoardCount = taskboardRepository.getTotalTaskBoardCountForLicence(currentTenantId, YorosisConstants.YES);

		if (totalTaskBoardCount < licenseVO.getAllowedLimit()) {
			licenseVO.setResponse("within the limit");
			return licenseVO;
		}
		licenseVO.setResponse("You have exceeded your limit");
		return licenseVO;
	}

	public LicenseVO getUserLicenseForTaskboard() {
		String currentTenantId = YorosisContext.get().getTenantId();
		return proxyYoroflowSchemaService.isAllowed(currentTenantId, "taskboards", "user_restriction");
	}

	private void removedTaskboardColumns(List<String> uuidList) {
		if (uuidList != null && !uuidList.isEmpty()) {
			for (String id : uuidList) {
				removedTaskboardColumnsSecurity(id);
				TaskboardColumns taskboardColumns = taskboardColumnsRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID.fromString(id),
						YorosisContext.get().getTenantId(), YorosisConstants.YES);
				taskboardColumns.setActiveFlag(YorosisConstants.NO);
				taskboardColumnsRepository.save(taskboardColumns);
			}
		}
	}

	private void removedTaskboardColumnsSecurity(String uuid) {
		List<TaskboardColumnsSecurity> taskboardColumnsSecurityList = taskboardColumnsSecurityRepository
				.getTaskBoardColumnIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID.fromString(uuid), YorosisContext.get().getTenantId(),
						YorosisConstants.YES);
		if (taskboardColumnsSecurityList != null && !taskboardColumnsSecurityList.isEmpty()) {
			taskboardColumnsSecurityRepository.deleteAll(taskboardColumnsSecurityList);
		}
	}

	public void saveTaskboardSecurity(Taskboard taskboard) {
		TaskboardSecurity security = null;
		User user = userRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(YorosisContext.get().getUserName(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		SecurityListVO securityListVO = SecurityListVO.builder().readAllowed(true).updateAllowed(true).deleteAllowed(true).build();
		security = constructTaskboardSecurityVOToDTO(securityListVO);
		security.setUserId(user.getUserId());
		security.setTaskboard(taskboard);
		taskboardSecurityRepository.save(security);
	}

	@Transactional
	private TaskboardVO updateTaskboardColumnsList(Taskboard taskboard, TaskboardVO vo) throws IOException, ParseException {
		Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());
		TaskboardColumns taskboardColumns = null;
		int idCheck = 0;
		for (TaskboardColumnsVO taskboardColumnsVO : vo.getTaskboardColumns()) {
			if (taskboardColumnsVO.getId() == null) {
				idCheck++;
				taskboardColumns = TaskboardColumns.builder().columnName(taskboardColumnsVO.getColumnName()).columnOrder(taskboardColumnsVO.getColumnOrder())
						.columnColor(taskboardColumnsVO.getColumnColor()).taskboard(taskboard).createdBy(YorosisContext.get().getUserName())
						.createdOn(currentTimestamp).modifiedBy(YorosisContext.get().getUserName()).modifiedOn(currentTimestamp)
						.formId(taskboardColumnsVO.getFormId()).version(taskboardColumnsVO.getVersion()).activeFlag(YorosisConstants.YES)
						.tenantId(YorosisContext.get().getTenantId()).layoutType(taskboardColumnsVO.getLayoutType())
						.isColumnBackground(booleanToChar(taskboardColumnsVO.getIsColumnBackground()))
						.isDoneColumn(booleanToChar(taskboardColumnsVO.getIsDoneColumn())).build();
				taskboardColumns.setTaskboard(taskboard);
			} else {
				handleExistTaskStatusChange(taskboardColumnsVO.getColumnOrder() - idCheck, taskboard, taskboardColumnsVO.getColumnName());
				idCheck = 0;
				taskboardColumns = taskboardColumnsRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(taskboardColumnsVO.getId(),
						YorosisContext.get().getTenantId(), YorosisConstants.YES);
				taskboardColumns.setColumnName(taskboardColumnsVO.getColumnName());
				taskboardColumns.setColumnOrder(taskboardColumnsVO.getColumnOrder());
				taskboardColumns.setColumnColor(taskboardColumnsVO.getColumnColor());
				taskboardColumns.setFormId(taskboardColumnsVO.getFormId());
				taskboardColumns.setVersion(taskboardColumnsVO.getVersion());
				taskboardColumns.setLayoutType(taskboardColumnsVO.getLayoutType());
				taskboardColumns.setModifiedOn(currentTimestamp);
				taskboardColumns.setIsColumnBackground(booleanToChar(taskboardColumnsVO.getIsColumnBackground()));
				taskboardColumns.setModifiedBy(YorosisContext.get().getUserName());
				taskboardColumns.setIsDoneColumn(booleanToChar(taskboardColumnsVO.getIsDoneColumn()));
			}
			taskboardColumnsRepository.save(taskboardColumns);
		}
		Taskboard savedTaskboard = taskboardRepository.save(taskboard);

		log.info("size: {}", savedTaskboard.getTaskboardColumns().size());

		return constructTaskboardDtoToVo(savedTaskboard.getId(), "all", true);
	}

	private void handleExistTaskStatusChange(Long columnOrder, Taskboard taskboard, String newColumnName) {
		List<TaskboardColumns> filteredcolumn = taskboard.getTaskboardColumns().stream().filter(column -> column.getColumnOrder() == columnOrder)
				.collect(Collectors.toList());
		List<TaskboardTask> tasks = taskboard.getTaskboardTask();
		if (!filteredcolumn.isEmpty()) {
			List<TaskboardTask> filteredTask = tasks.stream().filter(task -> StringUtils.equals(task.getActiveFlag(), YorosisConstants.YES)
					&& StringUtils.equals(task.getStatus(), filteredcolumn.get(0).getColumnName())).collect(Collectors.toList());
			filteredTask.forEach(t -> t.setStatus(newColumnName));
			taskboardTaskRepository.saveAll(filteredTask);
		}
	}

	@Transactional
	public void processTasksAfterDueDate() {
		log.info("scheduled process started");

		List<UUID> listTaskBoardIDs = eventAutomationService.getTaskBoardWithDueDates();
		List<TaskboardTask> listTaskBoardTask = taskboardTaskRepository.findTasksforTaskBoardIdsPastDueDate(listTaskBoardIDs,
				YorosisContext.get().getTenantId(), Timestamp.valueOf(LocalDateTime.now()), Timestamp.valueOf(LocalDateTime.now().plusDays(1)));
		listTaskBoardTask.stream().forEach(s -> {
			eventAutomationService.handleDueDate(s.getTaskboard().getId(), s, s.getStatus());
			s.setNextReminderTimestamp(Timestamp.valueOf(LocalDateTime.now().plusDays(1)));
		});

		Map<UUID, UserTasks> mapUserTasks = getUserTasks(listTaskBoardTask, YorosisContext.get().getTenantId());
		try {
			eventAutomationService.sendSummaryEmails(mapUserTasks);
			log.info(mapper.writeValueAsString(mapUserTasks));
		} catch (JsonProcessingException e) {
			log.error("some error occured while getting tasks per user", e);
			return;
		}
		log.info("scheduled process completed");

	}

	private Map<UUID, UserTasks> getUserTasks(List<TaskboardTask> listTaskBoardTask, String tenantId) {

		Map<UUID, UserTasks> mapUserTasks = new HashMap<>();
		for (TaskboardTask taskboardTask : listTaskBoardTask) {

			tasksByUser(mapUserTasks, taskboardTask);

		}

		return mapUserTasks;

	}

	private void tasksByUser(Map<UUID, UserTasks> mapUserTasks, TaskboardTask taskboardTask) {
		for (TaskboardTaskAssignedUsers taskBoardAssignedUser : taskboardTask.getTaskboardTaskAssignedUsers()) {

			UserTasks userTask = null;
			if (mapUserTasks.containsKey(taskBoardAssignedUser.getUserId())) {
				userTask = mapUserTasks.get(taskBoardAssignedUser.getUserId());
				Set<TaskboardTaskVO> setTaskboardTaskVO = userTask.getTaskBoardTaskVOs();
				if (CollectionUtils.isEmpty(setTaskboardTaskVO)) {
					Set<TaskboardTaskVO> newTaskBoardTaskVO = new HashSet<>();
					newTaskBoardTaskVO.add(TaskboardTaskVO.builder().taskId(taskboardTask.getTaskId()).id(taskboardTask.getId())
							.taskName(taskboardTask.getTaskName()).build());
				}
				setTaskboardTaskVO.add(
						TaskboardTaskVO.builder().taskId(taskboardTask.getTaskId()).id(taskboardTask.getId()).taskName(taskboardTask.getTaskName()).build());
			} else {
				Set<TaskboardTaskVO> newTaskBoardTaskVO = new HashSet<>();
				newTaskBoardTaskVO.add(
						TaskboardTaskVO.builder().taskId(taskboardTask.getTaskId()).id(taskboardTask.getId()).taskName(taskboardTask.getTaskName()).build());
				userTask = UserTasks.builder().userId(taskBoardAssignedUser.getUserId()).TaskBoardTaskVOs(newTaskBoardTaskVO).build();
			}

			mapUserTasks.put(taskBoardAssignedUser.getUserId(), userTask);

		}
	}

	@Transactional
	public List<TaskboardVO> getAllTaskboards(UUID workspaceId) throws IOException {
		List<TaskboardVO> taskboardVOList = new ArrayList<>();
		List<Taskboard> taskboardList = taskboardRepository.getTaskBoardListByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(YorosisContext.get().getTenantId(),
				YorosisConstants.YES, workspaceId);
		UUID userId = getUserId();
		List<UUID> uuidList = new ArrayList<>();
		for (Taskboard taskboard : taskboardList) {
			if (taskboard != null && taskboard.getTaskboardSecurity() != null && !taskboard.getTaskboardSecurity().isEmpty()) {
				for (TaskboardSecurity taskboardSecurity : taskboard.getTaskboardSecurity()) {
					if (taskboardSecurity != null && StringUtils.equals(taskboardSecurity.getActiveFlag(), YorosisConstants.YES)) {
						if (taskboardSecurity.getUserId() != null && taskboardSecurity.getUserId().equals(userId) && !uuidList.contains(taskboard.getId())) {
//							TaskboardColumns taskboardColumns = taskboard.getTaskboardColumns().stream()
//									.filter(c -> StringUtils.equals(String.valueOf(c.getColumnOrder()), "0"))
//									.collect(Collectors.toList()).get(0);
//							TaskboardVO taskboardVO = TaskboardVO.builder().name(taskboard.getName())
//									.taskboardKey(taskboard.getTaskboardKey()).id(taskboard.getId())
//									.startColumn(taskboardColumns.getColumnName()).formId(taskboardColumns.getFormId())
//									.version(taskboardColumns.getVersion())
//									.sprintEnabled(charToBoolean(taskboard.getSprintEnabled())).build();
//							taskboardVO.setSprintSettingsVoList(getSprintSettingsVoList(taskboard));
//							taskboardVOList.add(taskboardVO);
//							uuidList.add(taskboard.getId());
							loadTaskBoardVo(taskboard, taskboardVOList, uuidList);
						} else if (taskboardSecurity.getGroupId() != null) {
							List<UserGroup> filteredList = userGroupRepository.getGroupIdAndUsernameAndTenantIdAndActiveFlagIgnoreCase(
									taskboardSecurity.getGroupId(), YorosisContext.get().getUserName(), YorosisContext.get().getTenantId(),
									YorosisConstants.YES, PageRequest.of(0, 2));

							List<TaskboardSecurity> securityList = taskboardSecurityRepository.getTaskboardSecurityList(taskboard.getId(),
									taskboardSecurity.getGroupId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);

							if (!filteredList.isEmpty() && securityList != null && !securityList.isEmpty()) {
								TaskboardSecurity security = securityList.get(0);
								if ((security != null
										&& (BooleanUtils.isTrue(charToBoolean(security.getRead())) || BooleanUtils.isTrue(charToBoolean(security.getDelete()))
												|| BooleanUtils.isTrue(charToBoolean(security.getUpdate()))))
										&& !uuidList.contains(taskboard.getId())) {
//									TaskboardColumns taskboardColumns = taskboard.getTaskboardColumns().stream()
//											.filter(c -> StringUtils.equals(String.valueOf(c.getColumnOrder()), "0"))
//											.collect(Collectors.toList()).get(0);
//									TaskboardVO taskboardVO = TaskboardVO.builder().name(taskboard.getName())
//											.taskboardKey(taskboard.getTaskboardKey()).id(taskboard.getId())
//											.startColumn(taskboardColumns.getColumnName())
//											.formId(taskboardColumns.getFormId())
//											.sprintEnabled(charToBoolean(taskboard.getSprintEnabled()))
//											.version(taskboardColumns.getVersion()).build();
//									taskboardVO.setSprintSettingsVoList(getSprintSettingsVoList(taskboard));
//									taskboardVOList.add(taskboardVO);
//									uuidList.add(taskboard.getId());
									loadTaskBoardVo(taskboard, taskboardVOList, uuidList);
								}
							}

						}
					}

				}
			}
		}
		return taskboardVOList;
	}

	private void loadTaskBoardVo(Taskboard taskboard, List<TaskboardVO> taskboardVOList, List<UUID> uuidList) {
		if (taskboard != null && taskboard.getTaskboardColumns() != null && !taskboard.getTaskboardColumns().isEmpty()) {
			List<TaskboardColumns> taskboardColumnsList = taskboard.getTaskboardColumns().stream()
					.filter(c -> StringUtils.equals(String.valueOf(c.getColumnOrder()), "0")).collect(Collectors.toList());
			if (!taskboardColumnsList.isEmpty()) {
				TaskboardColumns taskboardColumns = taskboardColumnsList.get(0);
				TaskboardVO taskboardVO = TaskboardVO.builder().name(taskboard.getName()).taskboardKey(taskboard.getTaskboardKey()).id(taskboard.getId())
						.startColumn(taskboardColumns.getColumnName()).formId(taskboardColumns.getFormId()).version(taskboardColumns.getVersion())
						.sprintEnabled(charToBoolean(taskboard.getSprintEnabled())).build();
				getSprintSettingsVo(taskboard, taskboardVO);
				taskboardVOList.add(taskboardVO);
				uuidList.add(taskboard.getId());
			}
		}
	}

	private void getSprintSettingsVo(Taskboard taskboard, TaskboardVO taskboardVO) {
		if (StringUtils.equals(taskboard.getSprintEnabled(), YorosisConstants.YES)) {
			SprintSettingsVo sprintSettingsVo = taskboardSprintService.getSprintSettingsByTaskBoard(taskboard.getId());
			if (sprintSettingsVo != null) {
				taskboardVO.setSprintSettingsVo(sprintSettingsVo);
				taskboardVO.setSprintsVoList(taskboardSprintService.getSprintBySprintSettings(sprintSettingsVo.getSprintSettingsId()));
			}
		}
	}

	@Transactional
	public ResponseStringVO saveTaskTitle(TaskboardTaskVO vo) {
		String username = getUserName();
		TaskboardTask taskboardTask = taskboardTaskRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(vo.getId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);

		if (taskboardTask != null && !StringUtils.equals(taskboardTask.getStatus(), vo.getStatus())) {
			Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());
			taskboardTask.setTaskName(vo.getTaskName());
			taskboardTask.setModifiedOn(currentTimestamp);
			taskboardTask.setModifiedBy(username);
			taskboardTaskRepository.save(taskboardTask);
			return ResponseStringVO.builder().response("Task Title Modified Successfully").build();
		} else {
			return ResponseStringVO.builder().response("Invalid Task Id").build();
		}
	}

	@Transactional
	public ResponseStringVO saveStatusChange(TaskboardTaskVO vo) throws JsonProcessingException {
		String username = getUserName();
		TaskboardTask taskboardTask = taskboardTaskRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(vo.getId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);

		if (taskboardTask != null && !StringUtils.equals(taskboardTask.getStatus(), vo.getStatus())) {
			Long taskboardTasksByStatusCount = taskboardTaskRepository.getTaskboardTasksByStatusCount(vo.getTaskboardId(), vo.getStatus(),
					YorosisContext.get().getTenantId(), YorosisConstants.YES);
			taskboardTask.setSequenceNo(taskboardTasksByStatusCount);
			taskboardTask.setStatus(vo.getStatus());
			changeSubStatus(username, taskboardTask, vo);
			eventAutomationService.handleStatusChange(taskboardTask.getTaskboard().getId(), taskboardTask, vo.getStatus());
			if (StringUtils.equals(taskboardTask.getTaskType(), "subtask")) {
				taskboardActivityLogService.saveSubTaskActivityLog(taskboardTask.getTaskboard(), taskboardTask, vo.getStatus(), "changedSubTaskStatus");
			} else {
				taskboardActivityLogService.saveActivityLog(taskboardTask.getTaskboard(), taskboardTask, vo, "changedStatus");
			}

			return ResponseStringVO.builder().response("Status Modified Successfully").build();
		} else if (taskboardTask != null && !StringUtils.equals(taskboardTask.getSubStatus(), vo.getSubStatus())) {
			changeSubStatus(username, taskboardTask, vo);
			return ResponseStringVO.builder().response("Sub Status Modified Successfully").build();
		} else {
			return ResponseStringVO.builder().response("Invalid Task Id").build();
		}
	}

	private void changeSubStatus(String username, TaskboardTask taskboardTask, TaskboardTaskVO vo) throws JsonProcessingException {
		Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());
		taskboardTask.setModifiedBy(username);
		taskboardTask.setModifiedOn(currentTimestamp);
		taskboardTask.setSubStatus(vo.getSubStatus());
		taskboardActivityLogService.saveActivityLog(taskboardTask.getTaskboard(), taskboardTask, vo, "changedSubStatus");
		List<TaskboardTask> subTask = taskboardTaskRepository.getParentTaskIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(taskboardTask.getId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (subTask != null && !subTask.isEmpty()) {
			subTask.stream().forEach(t -> t.setSubStatus(vo.getSubStatus()));
			taskboardTaskRepository.saveAll(subTask);
		}
		taskboardTaskRepository.save(taskboardTask);
	}

	@Transactional
	public ResponseStringVO updateSequenceNumber(TaskSequenceVO taskSequenceVO) {
		for (TaskSequenceNumberVO taskSequenceNumberVO : taskSequenceVO.getTaskSequenceNumber()) {
			TaskboardTask task = taskboardTaskRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(taskSequenceNumberVO.getTaskId(),
					YorosisContext.get().getTenantId(), YorosisConstants.YES);
			if (task != null) {
				task.setSequenceNo(taskSequenceNumberVO.getSequenceNumber());
				taskboardTaskRepository.save(task);
			}
		}
		return ResponseStringVO.builder().response("Sequence Modified Successfully").build();
	}

	private void hasSubTask(TaskboardTask taskboardTask, List<TaskboardTaskVO> taskboardTaskList) throws IOException {
		for (TaskboardTask subTask : taskboardTaskRepository.getParentTaskIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(taskboardTask.getId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES)) {
			taskboardTaskList.add(contructTaskboardTaskDtoToVo(subTask, null));
		}
	}

	private void hasSubTaskForFilters(TaskboardTask taskboardTask, List<TaskboardTaskVO> taskboardTaskList, String status) throws IOException {

		for (TaskboardTask subTask : taskboardTaskRepository.getParentTaskIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(taskboardTask.getId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES)) {
			TaskboardTask task = taskboardTaskRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(subTask.getParentTaskId(),
					YorosisContext.get().getTenantId(), YorosisConstants.YES);
			if (StringUtils.equals(task.getStatus(), status)) {
				taskboardTaskList.add(contructTaskboardTaskDtoToVo(subTask, null));
			}
		}

	}

	private boolean filterSearchTaskId(String taskId, TaskEntityVO taskboardTask) {
		return (StringUtils.isEmpty(taskId) || StringUtils.containsIgnoreCase(taskboardTask.getTaskId(), taskId)
				|| StringUtils.containsIgnoreCase(taskboardTask.getTaskName(), taskId));
	}

	private boolean hasSearchTaskId(String taskId, TaskboardTask taskboardTask) {
		return (StringUtils.isEmpty(taskId) || StringUtils.containsIgnoreCase(taskboardTask.getTaskId(), taskId)
				|| StringUtils.containsIgnoreCase(taskboardTask.getTaskName(), taskId));
	}

	private boolean hasSearchTaskId(String taskId, TaskboardTaskVO taskboardTask) {
		return (StringUtils.isEmpty(taskId) || StringUtils.containsIgnoreCase(taskboardTask.getTaskId(), taskId)
				|| StringUtils.containsIgnoreCase(taskboardTask.getTaskName(), taskId));
	}

	private List<TaskEntityVO> getTaskboardTaskListWithLabel(Taskboard taskboard, AssignTaskVO vo, int limit, UUID sprintId) throws IOException {
		if (taskboard.getTaskboardTask() != null && !taskboard.getTaskboardTask().isEmpty()) {
			List<TaskEntityVO> taskboardTasksList = null;
			UsersVO userVO = userService.getLoggedInUserDetails();
			List<UUID> userGroupIdsList = getGroupAsUUID(userVO);
			List<UUID> taskboardOwnerList = new ArrayList<>();
			if (taskboard.getTaskboardSecurity() != null && !taskboard.getTaskboardSecurity().isEmpty()) {
				taskboardOwnerList = taskboard.getTaskboardSecurity().stream()
						.filter(security -> StringUtils.equals(security.getActiveFlag(), YorosisConstants.YES)).map(t -> t.getUserId())
						.collect(Collectors.toList());
			}
			if (taskboardOwnerList.contains(userVO.getUserId())) {
				if (BooleanUtils.isTrue(vo.getIsUnAssignedUser()) || !vo.getAssignedUserIdList().isEmpty()) {
					taskboardTasksList = sprintId == null
							? taskboardTaskRepository.getTaskboardTasksForUnAssignedUsersWithLabels(taskboard.getId(), vo.getAssignedUserIdList(),
									userVO.getUserId(), userGroupIdsList, vo.getTaskboardLabelIdList(), YorosisContext.get().getTenantId(),
									YorosisConstants.YES, vo.getIsNoLabel(), vo.getIsUnAssignedUser())
							: taskboardTaskRepository.getTaskboardTasksForUnAssignedUsersWithLabelsWithSprint(taskboard.getId(), vo.getAssignedUserIdList(),
									userVO.getUserId(), userGroupIdsList, vo.getTaskboardLabelIdList(), YorosisContext.get().getTenantId(),
									YorosisConstants.YES, vo.getIsNoLabel(), vo.getIsUnAssignedUser(), sprintId);
				} else {
					taskboardTasksList = sprintId == null
							? taskboardTaskRepository.getTaskboardTasksForAssignedUsersWithLabels(taskboard.getId(), vo.getAssignedUserIdList(),
									userVO.getUserId(), userGroupIdsList, vo.getTaskboardLabelIdList(), YorosisContext.get().getTenantId(),
									YorosisConstants.YES, vo.getIsNoLabel(), vo.getIsUnAssignedUser())
							: taskboardTaskRepository.getTaskboardTasksForAssignedUsersWithLabelsWithSprint(taskboard.getId(), vo.getAssignedUserIdList(),
									userVO.getUserId(), userGroupIdsList, vo.getTaskboardLabelIdList(), YorosisContext.get().getTenantId(),
									YorosisConstants.YES, vo.getIsNoLabel(), vo.getIsUnAssignedUser(), sprintId);
				}
			} else {
				taskboardTasksList = sprintId == null
						? taskboardTaskRepository.getTaskboardTasksWithLabelsOnly(taskboard.getId(), userVO.getUserId(), userGroupIdsList,
								vo.getTaskboardLabelIdList(), YorosisContext.get().getTenantId(), YorosisConstants.YES, vo.getIsNoLabel())
						: taskboardTaskRepository.getTaskboardTasksWithLabelsOnlyWithSprint(taskboard.getId(), userVO.getUserId(), userGroupIdsList,
								vo.getTaskboardLabelIdList(), YorosisContext.get().getTenantId(), YorosisConstants.YES, vo.getIsNoLabel(), sprintId);
			}

//			for (TaskboardTask taskboardTask : taskboardTasksList) {
//				if (!StringUtils.equals(taskboardTask.getTaskType(), "subtask")
//						&& !uuidList.contains(taskboardTask.getId())
//						&& hasSearchTaskId(vo.getSearchByTaskId(), taskboardTask)) {
//					taskboardTaskList.add(contructTaskboardTaskDtoToVo(taskboardTask, null));
//					hasSubTaskForFilters(taskboardTask, taskboardTaskList, status);
//					uuidList.add(taskboardTask.getId());
//				}
//			}

			return taskboardTasksList;
		}
		return Collections.emptyList();
	}

	private List<TaskboardTaskVO> getTaskboardTaskListWithLabel(Taskboard taskboard, String status, AssignTaskVO vo, int limit, UUID sprintId)
			throws IOException {
		if (taskboard.getTaskboardTask() != null && !taskboard.getTaskboardTask().isEmpty()) {
			List<TaskboardTaskVO> taskboardTaskList = new ArrayList<>();
			List<UUID> uuidList = new ArrayList<>();
			List<TaskboardTask> taskboardTasksList = null;
			UsersVO userVO = userService.getLoggedInUserDetails();
			List<UUID> userGroupIdsList = getGroupAsUUID(userVO);
			List<UUID> taskboardOwnerList = new ArrayList<>();
			if (taskboard.getTaskboardSecurity() != null && !taskboard.getTaskboardSecurity().isEmpty()) {
				taskboardOwnerList = taskboard.getTaskboardSecurity().stream()
						.filter(security -> StringUtils.equals(security.getActiveFlag(), YorosisConstants.YES)).map(t -> t.getUserId())
						.collect(Collectors.toList());
			}
			if (taskboardOwnerList.contains(userVO.getUserId())) {
				if (BooleanUtils.isTrue(vo.getIsUnAssignedUser()) || !vo.getAssignedUserIdList().isEmpty()) {
					taskboardTasksList = sprintId == null
							? taskboardTaskRepository.getTaskboardTasksForUnAssignedUsersWithLabels(taskboard.getId(), status, vo.getAssignedUserIdList(),
									userVO.getUserId(), userGroupIdsList, vo.getTaskboardLabelIdList(), YorosisContext.get().getTenantId(),
									YorosisConstants.YES, vo.getIsNoLabel(), vo.getIsUnAssignedUser(), limit)
							: taskboardTaskRepository.getTaskboardTasksForUnAssignedUsersWithLabelsWithSprint(taskboard.getId(), status,
									vo.getAssignedUserIdList(), userVO.getUserId(), userGroupIdsList, vo.getTaskboardLabelIdList(),
									YorosisContext.get().getTenantId(), YorosisConstants.YES, vo.getIsNoLabel(), vo.getIsUnAssignedUser(), limit, sprintId);
				} else {
					taskboardTasksList = sprintId == null
							? taskboardTaskRepository.getTaskboardTasksForAssignedUsersWithLabels(taskboard.getId(), status, vo.getAssignedUserIdList(),
									userVO.getUserId(), userGroupIdsList, vo.getTaskboardLabelIdList(), YorosisContext.get().getTenantId(),
									YorosisConstants.YES, vo.getIsNoLabel(), vo.getIsUnAssignedUser(), limit)
							: taskboardTaskRepository.getTaskboardTasksForAssignedUsersWithLabelsWithSprint(taskboard.getId(), status,
									vo.getAssignedUserIdList(), userVO.getUserId(), userGroupIdsList, vo.getTaskboardLabelIdList(),
									YorosisContext.get().getTenantId(), YorosisConstants.YES, vo.getIsNoLabel(), vo.getIsUnAssignedUser(), limit, sprintId);
				}
			} else {
				taskboardTasksList = sprintId == null
						? taskboardTaskRepository.getTaskboardTasksWithLabelsOnly(taskboard.getId(), status, userVO.getUserId(), userGroupIdsList,
								vo.getTaskboardLabelIdList(), YorosisContext.get().getTenantId(), YorosisConstants.YES, vo.getIsNoLabel(), limit)
						: taskboardTaskRepository.getTaskboardTasksWithLabelsOnlyWithSprint(taskboard.getId(), status, userVO.getUserId(), userGroupIdsList,
								vo.getTaskboardLabelIdList(), YorosisContext.get().getTenantId(), YorosisConstants.YES, vo.getIsNoLabel(), limit, sprintId);
			}

			for (TaskboardTask taskboardTask : taskboardTasksList) {
				if (!StringUtils.equals(taskboardTask.getTaskType(), "subtask") && !uuidList.contains(taskboardTask.getId())
						&& hasSearchTaskId(vo.getSearchByTaskId(), taskboardTask)) {
					taskboardTaskList.add(contructTaskboardTaskDtoToVo(taskboardTask, null));
					hasSubTaskForFilters(taskboardTask, taskboardTaskList, status);
					uuidList.add(taskboardTask.getId());
				}
			}

			return taskboardTaskList;
		}
		return Collections.emptyList();
	}

	private List<TaskboardTaskVO> getTaskboardTaskList(Taskboard taskboard, String status, AssignTaskVO vo, int limit, UUID sprintId) throws IOException {
		if (taskboard.getTaskboardTask() != null && !taskboard.getTaskboardTask().isEmpty()) {
			List<TaskboardTaskVO> taskboardTaskList = new ArrayList<>();
			List<UUID> uuidList = new ArrayList<>();
			for (UUID id : vo.getAssignedUserIdList()) {
				List<TaskboardTask> taskboardTasksWithAssignedUsers = sprintId == null
						? taskboardTaskRepository.getTaskboardTasksWithAssignedUsers(taskboard.getId(), id, YorosisContext.get().getTenantId(),
								YorosisConstants.YES, limit)
						: taskboardTaskRepository.getTaskboardTasksWithAssignedUsersWithSprint(taskboard.getId(), id, YorosisContext.get().getTenantId(),
								YorosisConstants.YES, limit, sprintId);
				for (TaskboardTask taskboardTask : taskboardTasksWithAssignedUsers) {
					if (StringUtils.equals(taskboardTask.getStatus(), status) && StringUtils.equals("parentTask", taskboardTask.getTaskType())
							&& !uuidList.contains(taskboardTask.getId()) && hasSearchTaskId(vo.getSearchByTaskId(), taskboardTask)) {
						taskboardTaskList.add(contructTaskboardTaskDtoToVo(taskboardTask, null));
						hasSubTask(taskboardTask, taskboardTaskList);
						uuidList.add(taskboardTask.getId());
					}
				}
			}

			if (BooleanUtils.isTrue(vo.getIsUnAssignedUser())) {
				List<UUID> unAssignedUserUuidList = new ArrayList<>();
				if (!taskboard.getTaskboardTask().isEmpty()) {
					int count = 1;
					for (TaskboardTask taskboardTask : taskboard.getTaskboardTask()) {
						if (taskboardTask.getTaskboardTaskAssignedUsers().isEmpty()) {
							if (StringUtils.equals(taskboardTask.getStatus(), status) && StringUtils.equals("parentTask", taskboardTask.getTaskType())
									&& !unAssignedUserUuidList.contains(taskboardTask.getId()) && count < limit) {
								taskboardTaskList.add(contructTaskboardTaskDtoToVo(taskboardTask, null));
								count++;
								hasSubTask(taskboardTask, taskboardTaskList);
								unAssignedUserUuidList.add(taskboardTask.getId());
							}
						}
					}
				}
			}

			return taskboardTaskList;
		}
		return Collections.emptyList();
	}

	private List<TaskboardTaskVO> getConstructedTaskboardTaskVo(List<TaskboardTask> taskboardList, String status) throws IOException {
		List<TaskboardTaskVO> taskboardTaskList = new ArrayList<>();
		List<UUID> uuidList = new ArrayList<>();
		for (TaskboardTask taskboardTask : taskboardList) {
			if (!StringUtils.equals(taskboardTask.getTaskType(), "subtask") && !uuidList.contains(taskboardTask.getId())) {
				taskboardTaskList.add(contructTaskboardTaskDtoToVo(taskboardTask, null));
				hasSubTaskForFilters(taskboardTask, taskboardTaskList, status);
				uuidList.add(taskboardTask.getId());
			}
		}
		return taskboardTaskList;
	}

	private List<TaskboardColumnMapVO> setTaskboardColumnMapVo(List<TaskEntityVO> taskList, List<TaskboardColumnsVO> taskboardColumnsList, String username)
			throws IOException {
		List<TaskboardColumnMapVO> taskboardColumnMapVOList = new ArrayList<>();
		for (TaskboardColumnsVO taskboardColumnsVO : taskboardColumnsList) {
			List<TaskboardTaskVO> taskboardTaskList = new ArrayList<>();
			List<UUID> uuidList = new ArrayList<>();
			for (TaskEntityVO taskEntityVO : taskList) {
				String columnName = taskEntityVO.getColumnName();
				UUID id = UUID.fromString(taskEntityVO.getId());
				if (StringUtils.equals(columnName, taskboardColumnsVO.getColumnName()) && StringUtils.equals(taskEntityVO.getTaskType(), "parentTask")
						&& !uuidList.contains(id)) {
					uuidList.add(id);
					taskboardTaskList.add(contructTaskDtoToVo(taskEntityVO, taskList, username));
					List<SubTaskVO> subTaskList = hasSubTask(taskList, id, taskboardTaskList, username);
					List<TaskboardTaskVO> parentTaskList = taskboardTaskList.stream()
							.filter(t -> StringUtils.equals(t.getId().toString(), taskEntityVO.getId())).collect(Collectors.toList());
					if (parentTaskList != null && !parentTaskList.isEmpty()) {
						parentTaskList.get(0).setSubTaskLength(subTaskList.size());
						parentTaskList.get(0).setSubTasks(subTaskList);
					}

					Collections.sort(taskboardTaskList, TaskboardTaskVO.DisplayOrderComparator);
				}
			}
			taskboardColumnMapVOList.add(TaskboardColumnMapVO.builder().taskboardColumnsVO(taskboardColumnsVO).taskboardTaskVOList(taskboardTaskList).build());
		}
		return taskboardColumnMapVOList;
	}

	private List<TaskEntityVO> checkAndaddDoneColumn(String doneColumn, List<TaskEntityVO> taskList) {
		List<TaskEntityVO> returnTaskList = new ArrayList<>();
		int doneColumnCount = 0;
		for (TaskEntityVO t : taskList) {
			if (StringUtils.equals(doneColumn, t.getStatus())) {
				if (doneColumnCount < 25) {
					returnTaskList.add(t);
				}
				doneColumnCount++;
			} else {
				returnTaskList.add(t);
			}
		}
		return returnTaskList;
	}

	@Transactional
	public List<TaskboardColumnMapVO> getTaskboardTaskByUsers(AssignTaskVO vo, UUID sprintId) throws IOException {
		Taskboard taskboard = taskboardRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(vo.getTaskboardId(), YorosisContext.get().getTenantId(),
				YorosisConstants.YES);
		List<TaskboardColumnsVO> taskboardColumnsList = null;
		List<TaskboardColumnMapVO> taskboardColumnMapVO = new ArrayList<>();
		List<TaskEntityVO> taskList = new ArrayList<>();
		String doneColumn = null;
		User user = userRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(YorosisContext.get().getUserName(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		UsersVO userVo = constructDTOToVO(user);
		List<UUID> userGroupIdsList = getGroupAsUUID(userVo);

		taskboardColumnsList = taskboard.getTaskboardColumns().stream()
				.filter(taskboardColumns -> StringUtils.equals(taskboardColumns.getActiveFlag(), YorosisConstants.YES))
				.map(this::constructTaskboardColumnsDtoToVo).sorted(Comparator.comparing(TaskboardColumnsVO::getColumnOrder)).collect(Collectors.toList());
		if (taskboardColumnsList != null && !taskboardColumnsList.isEmpty()) {
			doneColumn = taskboardColumnsList.get(taskboardColumnsList.size() - 1).getColumnName();
		}
		if ((BooleanUtils.isFalse(vo.getIsNoLabel()) && vo.getTaskboardLabelIdList().isEmpty() && vo.getTaskboardPriorityList().isEmpty()
				&& vo.getAssignedUserIdList().isEmpty() && BooleanUtils.isFalse(vo.getIsUnAssignedUser()) && BooleanUtils.isFalse(vo.getIsNoPriority()))
				&& !StringUtils.isEmpty(vo.getSearchByTaskId())) {

			if (sprintId == null) {
				taskList = taskboardTaskRepository.getTaskboardTasksByTaskIdSearch(taskboard.getId(), userVo.getUserId(), userGroupIdsList,
						YorosisContext.get().getTenantId(), YorosisConstants.YES, "%" + vo.getSearchByTaskId() + "%");
				return setTaskboardColumnMapVo(taskList, taskboardColumnsList, userVo.getUserName());
			} else {
				taskList = taskboardTaskRepository.getTaskboardTasksByTaskIdSearchWithSprint(taskboard.getId(), userVo.getUserId(), userGroupIdsList,
						YorosisContext.get().getTenantId(), YorosisConstants.YES, "%" + vo.getSearchByTaskId() + "%", sprintId);
			}
			if (taskList != null) {
				if (BooleanUtils.isTrue(vo.getIsNoPriority()) || !vo.getTaskboardPriorityList().isEmpty()) {
					taskList = filterPriorityList(taskList, vo);
				}
				taskList = checkAndaddDoneColumn(doneColumn, taskList);
				return setTaskboardColumnMapVo(taskList, taskboardColumnsList, userVo.getUserName());
			}
		} else {

			if (BooleanUtils.isTrue(vo.getIsNoLabel()) || !vo.getTaskboardLabelIdList().isEmpty()) {
				taskList = getTaskboardTaskListWithLabel(taskboard, vo, 100, sprintId);
				if (BooleanUtils.isTrue(vo.getIsNoPriority()) || !vo.getTaskboardPriorityList().isEmpty()) {
					taskList = filterPriorityList(taskList, vo);
				}
				taskList = taskList.stream().filter(f -> (filterSearchTaskId(vo.getSearchByTaskId(), f))).collect(Collectors.toList());
				taskList = checkAndaddDoneColumn(doneColumn, taskList);
				return setTaskboardColumnMapVo(taskList, taskboardColumnsList, userVo.getUserName());
			} else {
				if (!vo.getAssignedUserIdList().isEmpty()) {
					taskList = sprintId == null
							? taskboardTaskRepository.getTaskboardTasksWithAssignedUsers(taskboard.getId(), vo.getAssignedUserIdList(),
									YorosisContext.get().getTenantId(), YorosisConstants.YES)
							: taskboardTaskRepository.getTaskboardTasksWithAssignedUsersWithSprint(taskboard.getId(), vo.getAssignedUserIdList(),
									YorosisContext.get().getTenantId(), YorosisConstants.YES, sprintId);
					if (BooleanUtils.isTrue(vo.getIsUnAssignedUser())) {
						List<TaskEntityVO> taskListUnassigned = sprintId == null
								? taskboardTaskRepository.getTaskboardTaskListsForUnAssignedUser(taskboard.getId(), userVo.getUserId(), userGroupIdsList,
										YorosisContext.get().getTenantId(), YorosisConstants.YES)
								: taskboardTaskRepository.getTaskboardTaskListsForUnAssignedUserWithSprint(taskboard.getId(), userVo.getUserId(),
										userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES, sprintId);
						if (taskListUnassigned != null) {
							taskList.addAll(taskListUnassigned);
						}
					}
					taskList = taskList.stream().filter(f -> (filterSearchTaskId(vo.getSearchByTaskId(), f))).collect(Collectors.toList());
					if (BooleanUtils.isTrue(vo.getIsNoPriority()) || !vo.getTaskboardPriorityList().isEmpty()) {
						taskList = filterPriorityList(taskList, vo);
					}
					taskList = checkAndaddDoneColumn(doneColumn, taskList);

					return setTaskboardColumnMapVo(taskList, taskboardColumnsList, userVo.getUserName());
				} else {
					if (BooleanUtils.isFalse(vo.getIsUnAssignedUser())) {
						taskList = sprintId == null
								? taskboardTaskRepository.getTaskboardTaskListsForFilter(taskboard.getId(), userVo.getUserId(), userGroupIdsList,
										YorosisContext.get().getTenantId(), YorosisConstants.YES)
								: taskboardTaskRepository.getTaskboardTaskListForFiltersWithSprint(taskboard.getId(), userVo.getUserId(), userGroupIdsList,
										YorosisContext.get().getTenantId(), YorosisConstants.YES, sprintId);
					} else {
						taskList = sprintId == null
								? taskboardTaskRepository.getTaskboardTaskListsForUnAssignedUser(taskboard.getId(), userVo.getUserId(), userGroupIdsList,
										YorosisContext.get().getTenantId(), YorosisConstants.YES)
								: taskboardTaskRepository.getTaskboardTaskListsForUnAssignedUserWithSprint(taskboard.getId(), userVo.getUserId(),
										userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES, sprintId);
					}
//					for (TaskboardColumnsVO taskboardColumnsVO : taskboardColumnsList) {
//						List<UUID> taskboardOwnerList = new ArrayList<>();
//						UsersVO userVO = userService.getLoggedInUserDetails();
//
//					if (taskboard.getTaskboardSecurity() != null && !taskboard.getTaskboardSecurity().isEmpty()) {
//						taskboardOwnerList = taskboard.getTaskboardSecurity().stream()
//								.filter(security -> StringUtils.equals(security.getActiveFlag(), YorosisConstants.YES))
//								.map(this::getUserId).collect(Collectors.toList());
//					}
//						if (taskboardColumnsVO.getColumnOrder() == totalColumnListLength) {
//							taskboardTaskList = getTaskboardTaskListForDoneColumn(taskboard,
//									taskboardColumnsVO.getColumnName(),
//									taskboardOwnerList.contains(userVO.getUserId()));
//						} else {
//							taskboardTaskList = getRefactorTaskboardTaskList(taskLists, taskboard,
//									taskboardColumnsVO.getColumnName(), userVo);
//						}
//						taskboardTaskList = taskboardTaskList.stream()
//								.filter(f -> (hasSearchTaskId(vo.getSearchByTaskId(), f))).collect(Collectors.toList());
//						if (BooleanUtils.isTrue(vo.getIsNoPriority()) || !vo.getTaskboardPriorityList().isEmpty()) {
//							taskboardTaskList = hasPriorityList(taskboardTaskList, vo);
//						}
//						Collections.sort(taskboardTaskList, TaskboardTaskVO.DisplayOrderComparator);
//						taskboardColumnMapVO.add(TaskboardColumnMapVO.builder().taskboardColumnsVO(taskboardColumnsVO)
//								.taskboardTaskVOList(taskboardTaskList).build());
//					}
					taskList = taskList.stream().filter(f -> (filterSearchTaskId(vo.getSearchByTaskId(), f))).collect(Collectors.toList());
					if (BooleanUtils.isTrue(vo.getIsNoPriority()) || !vo.getTaskboardPriorityList().isEmpty()) {
						taskList = filterPriorityList(taskList, vo);
					}
					taskList = checkAndaddDoneColumn(doneColumn, taskList);
					return setTaskboardColumnMapVo(taskList, taskboardColumnsList, userVo.getUserName());
				}
			}

		}
		return taskboardColumnMapVO;
	}

	@Transactional
	public List<TaskboardColumnMapVO> getTaskboardTaskByUser(AssignTaskVO vo, UUID sprintId) throws IOException {
		Taskboard taskboard = taskboardRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(vo.getTaskboardId(), YorosisContext.get().getTenantId(),
				YorosisConstants.YES);
		List<TaskboardColumnsVO> taskboardColumnsList = null;
		List<TaskboardTaskVO> taskboardTaskList = null;
		List<TaskboardColumnMapVO> taskboardColumnMapVO = new ArrayList<>();
		List<TaskboardTask> searchTaskboardTaskList = null;
		User user = userRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(YorosisContext.get().getUserName(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		UsersVO userVo = constructDTOToVO(user);
		List<UUID> userGroupIdsList = getGroupAsUUID(userVo);

		taskboardColumnsList = taskboard.getTaskboardColumns().stream()
				.filter(taskboardColumns -> StringUtils.equals(taskboardColumns.getActiveFlag(), YorosisConstants.YES))
				.map(this::constructTaskboardColumnsDtoToVo).sorted(Comparator.comparing(TaskboardColumnsVO::getColumnOrder)).collect(Collectors.toList());
		int totalColumnListLength = taskboardColumnsList.size() - 1;
		if ((BooleanUtils.isFalse(vo.getIsNoLabel()) && vo.getTaskboardLabelIdList().isEmpty() && vo.getTaskboardPriorityList().isEmpty()
				&& vo.getAssignedUserIdList().isEmpty() && BooleanUtils.isFalse(vo.getIsUnAssignedUser()) && BooleanUtils.isFalse(vo.getIsNoPriority()))
				&& !StringUtils.isEmpty(vo.getSearchByTaskId())) {
			for (TaskboardColumnsVO taskboardColumnsVO : taskboardColumnsList) {
				if (sprintId == null) {
					searchTaskboardTaskList = taskboardTaskRepository.getTaskboardTasksByTaskIdSearch(taskboard.getId(), userVo.getUserId(), userGroupIdsList,
							taskboardColumnsVO.getColumnName(), YorosisContext.get().getTenantId(), YorosisConstants.YES, "%" + vo.getSearchByTaskId() + "%",
							(taskboardColumnsVO.getColumnOrder() == totalColumnListLength) ? 25 : 3000);
				} else {
					searchTaskboardTaskList = taskboardTaskRepository.getTaskboardTasksByTaskIdSearchWithSprint(taskboard.getId(), userVo.getUserId(),
							userGroupIdsList, taskboardColumnsVO.getColumnName(), YorosisContext.get().getTenantId(), YorosisConstants.YES,
							"%" + vo.getSearchByTaskId() + "%", (taskboardColumnsVO.getColumnOrder() == totalColumnListLength) ? 25 : 3000, sprintId);
				}
				taskboardTaskList = getConstructedTaskboardTaskVo(searchTaskboardTaskList, taskboardColumnsVO.getColumnName());

				if (BooleanUtils.isTrue(vo.getIsNoPriority()) || !vo.getTaskboardPriorityList().isEmpty()) {
					taskboardTaskList = hasPriorityList(taskboardTaskList, vo);
				}
				Collections.sort(taskboardTaskList, TaskboardTaskVO.DisplayOrderComparator);
				taskboardColumnMapVO.add(TaskboardColumnMapVO.builder().taskboardColumnsVO(taskboardColumnsVO).taskboardTaskVOList(taskboardTaskList).build());
			}

		} else {

			if (BooleanUtils.isTrue(vo.getIsNoLabel()) || !vo.getTaskboardLabelIdList().isEmpty()) {
				for (TaskboardColumnsVO taskboardColumnsVO : taskboardColumnsList) {

					taskboardTaskList = getTaskboardTaskListWithLabel(taskboard, taskboardColumnsVO.getColumnName(), vo,
							(taskboardColumnsVO.getColumnOrder() == totalColumnListLength) ? 25 : 3000, sprintId);
					if (BooleanUtils.isTrue(vo.getIsNoPriority()) || !vo.getTaskboardPriorityList().isEmpty()) {
						taskboardTaskList = hasPriorityList(taskboardTaskList, vo);
					}
					Collections.sort(taskboardTaskList, TaskboardTaskVO.DisplayOrderComparator);
					taskboardColumnMapVO
							.add(TaskboardColumnMapVO.builder().taskboardColumnsVO(taskboardColumnsVO).taskboardTaskVOList(taskboardTaskList).build());
				}
			} else {
				if (!vo.getAssignedUserIdList().isEmpty()) {
					for (TaskboardColumnsVO taskboardColumnsVO : taskboardColumnsList) {
						int limit = 0;
						if (taskboardColumnsVO.getColumnOrder() == totalColumnListLength) {
							limit = 25;
						} else {
							limit = 3000;
						}
						taskboardTaskList = getTaskboardTaskList(taskboard, taskboardColumnsVO.getColumnName(), vo, limit, sprintId);
						taskboardTaskList = taskboardTaskList.stream().filter(f -> (hasSearchTaskId(vo.getSearchByTaskId(), f))).collect(Collectors.toList());
						if (BooleanUtils.isTrue(vo.getIsNoPriority()) || !vo.getTaskboardPriorityList().isEmpty()) {
							taskboardTaskList = hasPriorityList(taskboardTaskList, vo);
						}
						Collections.sort(taskboardTaskList, TaskboardTaskVO.DisplayOrderComparator);
						taskboardColumnMapVO
								.add(TaskboardColumnMapVO.builder().taskboardColumnsVO(taskboardColumnsVO).taskboardTaskVOList(taskboardTaskList).build());
					}
				} else {
					List<TaskboardTask> taskLists = null;
					if (BooleanUtils.isFalse(vo.getIsUnAssignedUser())) {
						taskLists = sprintId == null
								? taskboardTaskRepository.getTaskboardTaskListForFilter(taskboard.getId(), userVo.getUserId(), userGroupIdsList,
										YorosisContext.get().getTenantId(), YorosisConstants.YES)
								: taskboardTaskRepository.getTaskboardTaskListForFilterWithSprint(taskboard.getId(), userVo.getUserId(), userGroupIdsList,
										YorosisContext.get().getTenantId(), YorosisConstants.YES, sprintId);
					} else {
						taskLists = sprintId == null
								? taskboardTaskRepository.getTaskboardTaskListForUnAssignedUser(taskboard.getId(), userVo.getUserId(), userGroupIdsList,
										YorosisContext.get().getTenantId(), YorosisConstants.YES)
								: taskboardTaskRepository.getTaskboardTaskListForUnAssignedUserWithSprint(taskboard.getId(), userVo.getUserId(),
										userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES, sprintId);
					}
					for (TaskboardColumnsVO taskboardColumnsVO : taskboardColumnsList) {
						List<UUID> taskboardOwnerList = new ArrayList<>();
						UsersVO userVO = userService.getLoggedInUserDetails();

						if (taskboard.getTaskboardSecurity() != null && !taskboard.getTaskboardSecurity().isEmpty()) {
							taskboardOwnerList = taskboard.getTaskboardSecurity().stream()
									.filter(security -> StringUtils.equals(security.getActiveFlag(), YorosisConstants.YES)).map(this::getUserId)
									.collect(Collectors.toList());
						}
						if (taskboardColumnsVO.getColumnOrder() == totalColumnListLength) {
							taskboardTaskList = getTaskboardTaskListForDoneColumn(taskboard, taskboardColumnsVO.getColumnName(),
									taskboardOwnerList.contains(userVO.getUserId()));
						} else {
							taskboardTaskList = getRefactorTaskboardTaskList(taskLists, taskboard, taskboardColumnsVO.getColumnName(), userVo);
						}
						taskboardTaskList = taskboardTaskList.stream().filter(f -> (hasSearchTaskId(vo.getSearchByTaskId(), f))).collect(Collectors.toList());
						if (BooleanUtils.isTrue(vo.getIsNoPriority()) || !vo.getTaskboardPriorityList().isEmpty()) {
							taskboardTaskList = hasPriorityList(taskboardTaskList, vo);
						}
						Collections.sort(taskboardTaskList, TaskboardTaskVO.DisplayOrderComparator);
						taskboardColumnMapVO
								.add(TaskboardColumnMapVO.builder().taskboardColumnsVO(taskboardColumnsVO).taskboardTaskVOList(taskboardTaskList).build());
					}
				}
			}

		}
		return taskboardColumnMapVO;
	}

	private List<TaskEntityVO> filterPriorityList(List<TaskEntityVO> taskList, AssignTaskVO vo) {
		return taskList.stream().filter(i -> BooleanUtils.isFalse(vo.getIsNoPriority()) ? vo.getTaskboardPriorityList().contains(i.getPriority())
				: (vo.getTaskboardPriorityList().contains(i.getPriority()) || StringUtils.isBlank(i.getPriority()))).collect(Collectors.toList());
	}

	private List<TaskboardTaskVO> hasPriorityList(List<TaskboardTaskVO> taskboardTaskList, AssignTaskVO vo) {
		return taskboardTaskList.stream().filter(i -> BooleanUtils.isFalse(vo.getIsNoPriority()) ? vo.getTaskboardPriorityList().contains(i.getPriority())
				: (vo.getTaskboardPriorityList().contains(i.getPriority()) || StringUtils.isBlank(i.getPriority()))).collect(Collectors.toList());
	}

	private List<SubTaskVO> hasSubTask(List<TaskboardTask> taskList, TaskboardTask taskboardTask, List<TaskboardTaskVO> taskboardTaskList) throws IOException {
		List<SubTaskVO> subTaskList = new ArrayList<>();
		for (TaskboardTask task : taskList) {
			if (task.getParentTaskId() != null && StringUtils.equals(task.getParentTaskId().toString(), taskboardTask.getId().toString())) {
				TaskboardTaskVO subTaskVo = contructTaskDtoToVo(task);
				taskboardTaskList.add(subTaskVo);
				subTaskList.add(constructSubTaskDtoToVo(task));
			}
		}
		return subTaskList;
	}

	private List<TaskboardTaskVO> getRefactorTaskboardTaskList(List<TaskboardTask> taskList, Taskboard taskboard, String status, UsersVO userVo)
			throws IOException {
		if (taskboard.getTaskboardTask() != null && !taskboard.getTaskboardTask().isEmpty()) {
			List<TaskboardTaskVO> taskboardTaskList = new ArrayList<>();
			for (TaskboardTask taskboardTask : taskList) {
				long startTime = System.currentTimeMillis();
				log.info("START TASKBOARD --------------Get for each startTime {}", startTime);
				if (StringUtils.equals(taskboardTask.getTaskType(), "parentTask") && StringUtils.equals(taskboardTask.getStatus(), status)) {
					taskboardTaskList.add(contructTaskDtoToVo(taskboardTask));
					List<SubTaskVO> subTaskList = hasSubTask(taskList, taskboardTask, taskboardTaskList);
					List<TaskboardTaskVO> list = taskboardTaskList.stream().filter(t -> t.getId() == taskboardTask.getId()).collect(Collectors.toList());
					if (!list.isEmpty()) {
						TaskboardTaskVO taskboardTaskVO = list.get(0);
						taskboardTaskVO.setSubTaskLength(subTaskList.size());
						taskboardTaskVO.setSubTasks(subTaskList);
					}
				}
				long stopTime = System.currentTimeMillis();
				long elapsedTime = stopTime - startTime;
				log.info("END TASKBOARD --------------Get for each with elaspedTime ms {}", elapsedTime);
			}

			taskboardTaskList.stream().sorted(Comparator.comparing(TaskboardTaskVO::getSequenceNo, Comparator.nullsLast(Comparator.reverseOrder())))
					.collect(Collectors.toList());
			return taskboardTaskList;
		}
		return Collections.emptyList();
	}

	private UUID getUserId(TaskboardSecurity taskboardSecurity) {
		return taskboardSecurity.getUserId();
	}

	private List<TaskboardTaskVO> getTaskboardTaskListForDoneColumn(Taskboard taskboard, String status, boolean isTaskboardOwner) throws IOException {
		List<TaskboardTaskVO> taskList = new ArrayList<>();
		List<TaskboardTask> taskboardTaskList = null;
		UsersVO user = userService.getLoggedInUserDetails();
		if (BooleanUtils.isTrue(isTaskboardOwner)) {
			taskboardTaskList = taskboardTaskRepository.getTasksForDoneColumnsWithOwners(taskboard.getId(), status, YorosisContext.get().getTenantId(),
					YorosisConstants.YES);
		} else {
			taskboardTaskList = taskboardTaskRepository.getTasksForDoneColumnsWithoutOwners(taskboard.getId(), user.getUserId(), status,
					YorosisContext.get().getTenantId(), YorosisConstants.YES);
		}

		if (taskboardTaskList != null && !taskboardTaskList.isEmpty()) {
			for (TaskboardTask task : taskboardTaskList) {
				taskList.add(contructTaskDtoToVo(task));
			}

			taskList.stream().sorted(Comparator.comparing(TaskboardTaskVO::getSequenceNo, Comparator.nullsLast(Comparator.reverseOrder())))
					.collect(Collectors.toList());
		}

		return taskList;
	}

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

	@Transactional
	public List<TaskboardTaskVO> getDoneTask(UUID taskboardId, boolean boardCall, UUID sprintId) throws IOException {
		List<TaskboardTaskVO> taskboardTaskList = new ArrayList<>();
		User user = userRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(YorosisContext.get().getUserName(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);

		if (user != null) {
			UsersVO userVo = constructDTOToVO(user);
			List<UUID> userGroupIdsList = getGroupAsUUID(userVo);
			String username = user.getFirstName() + " " + user.getLastName();
			Set<TaskEntityVO> taskLists = null;
			if (sprintId == null) {
				taskLists = taskboardTaskRepository.getTaskboardTaskListForDoneColumn(taskboardId, userVo.getUserId(), userGroupIdsList,
						YorosisContext.get().getTenantId(), YorosisConstants.YES);
			} else {
				taskLists = taskboardTaskRepository.getTaskboardTaskListForDoneColumnBysprint(taskboardId, sprintId, userVo.getUserId(), userGroupIdsList,
						YorosisContext.get().getTenantId(), YorosisConstants.YES);
			}
			List<UUID> uuidList = new ArrayList<>();
			List<TaskEntityVO> taskList = new ArrayList<TaskEntityVO>();
			taskList.addAll(taskLists);
			if (taskList != null && !taskList.isEmpty()) {
				for (TaskEntityVO taskEntityVO : taskList) {
					UUID id = UUID.fromString(taskEntityVO.getId());
					if (!uuidList.contains(id)) {
						if ((boardCall == true && uuidList.size() < 25) || boardCall == false) {
							taskboardTaskList.add(contructTaskDtoToVo(taskEntityVO, taskList, username));
							uuidList.add(id);
						}
					}
				}
			}
		}
		return taskboardTaskList;
	}

	@Transactional
	public List<TaskboardTaskVO> getDoneTaskForFilters(TaskGroupByVO taskGroupByVO) throws IOException {
		List<TaskboardTaskVO> taskboardTaskList = new ArrayList<>();
		User user = userRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(YorosisContext.get().getUserName(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);

		if (user != null) {
			UsersVO userVo = constructDTOToVO(user);
			List<UUID> userGroupIdsList = getGroupAsUUID(userVo);
			String username = user.getFirstName() + " " + user.getLastName();
			Set<TaskEntityVO> taskLists = null;
			FilterDateVO filterDateVO = getStartAndEndDate(taskGroupByVO);
			if (taskGroupByVO.getSprintId() == null) {
				if (!StringUtils.equals(taskGroupByVO.getFilterType(), ALL)) {
					if (StringUtils.equals(taskGroupByVO.getFilterBy(), CREATED_DATE)) {
						taskLists = taskboardTaskRepository.getTaskboardTaskListForDoneColumnWithCreatedDateFilter(taskGroupByVO.getId(), userVo.getUserId(),
								userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES, Timestamp.valueOf(filterDateVO.getStartDate()),
								Timestamp.valueOf(filterDateVO.getEndDate()));
					} else if (StringUtils.equals(taskGroupByVO.getFilterBy(), START_DATE)) {
						taskLists = taskboardTaskRepository.getTaskboardTaskListForDoneColumnWithStartDateFilter(taskGroupByVO.getId(), userVo.getUserId(),
								userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES, Timestamp.valueOf(filterDateVO.getStartDate()),
								Timestamp.valueOf(filterDateVO.getEndDate()));
					} else if (StringUtils.equals(taskGroupByVO.getFilterBy(), DUE_DATE)) {
						taskLists = taskboardTaskRepository.getTaskboardTaskListForDoneColumnWithDueDateFilter(taskGroupByVO.getId(), userVo.getUserId(),
								userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES, Timestamp.valueOf(filterDateVO.getStartDate()),
								Timestamp.valueOf(filterDateVO.getEndDate()));
					} else {
						taskLists = taskboardTaskRepository.getTaskboardTaskListForDoneColumn(taskGroupByVO.getId(), userVo.getUserId(), userGroupIdsList,
								YorosisContext.get().getTenantId(), YorosisConstants.YES);
					}
				} else {
					taskLists = taskboardTaskRepository.getTaskboardTaskListForDoneColumn(taskGroupByVO.getId(), userVo.getUserId(), userGroupIdsList,
							YorosisContext.get().getTenantId(), YorosisConstants.YES);
				}

			} else {
				if (!StringUtils.equals(taskGroupByVO.getFilterType(), ALL)) {
					if (StringUtils.equals(taskGroupByVO.getFilterBy(), CREATED_DATE)) {
						taskLists = taskboardTaskRepository.getTaskboardTaskListForDoneColumnBySprintWithCreatedDateFilter(taskGroupByVO.getId(),
								taskGroupByVO.getSprintId(), userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES,
								Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()));
					} else if (StringUtils.equals(taskGroupByVO.getFilterBy(), START_DATE)) {
						taskLists = taskboardTaskRepository.getTaskboardTaskListForDoneColumnBySprintWithStartDateFilter(taskGroupByVO.getId(),
								taskGroupByVO.getSprintId(), userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES,
								Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()));
					} else if (StringUtils.equals(taskGroupByVO.getFilterBy(), DUE_DATE)) {
						taskLists = taskboardTaskRepository.getTaskboardTaskListForDoneColumnBySprintWithDueDateFilter(taskGroupByVO.getId(),
								taskGroupByVO.getSprintId(), userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES,
								Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()));
					} else {
						taskLists = taskboardTaskRepository.getTaskboardTaskListForDoneColumnBysprint(taskGroupByVO.getId(), taskGroupByVO.getSprintId(),
								userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES);
					}
				} else {
					taskLists = taskboardTaskRepository.getTaskboardTaskListForDoneColumnBysprint(taskGroupByVO.getId(), taskGroupByVO.getSprintId(),
							userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES);
				}
			}
			List<UUID> uuidList = new ArrayList<>();
			List<TaskEntityVO> taskList = new ArrayList<TaskEntityVO>();
			taskList.addAll(taskLists);
			if (!taskList.isEmpty()) {
				for (TaskEntityVO taskEntityVO : taskList) {
					UUID id = UUID.fromString(taskEntityVO.getId());
					if (!uuidList.contains(id) && uuidList.size() < 25) {
						if (!taskGroupByVO.getAssignedUserIdList().isEmpty() || !taskGroupByVO.getTaskboardPriorityList().isEmpty()
								|| !taskGroupByVO.getTaskboardLabelIdList().isEmpty() || BooleanUtils.isTrue(taskGroupByVO.getIsNoLabel())
								|| BooleanUtils.isTrue(taskGroupByVO.getIsNoPriority()) || BooleanUtils.isTrue(taskGroupByVO.getIsUnAssignedUser())) {
							List<TaskboardTaskVO> tempList = new ArrayList<>();
							TaskboardTaskVO contructTaskDtoToVo = contructTaskDtoToVo(taskEntityVO, taskList, username);
							tempList.add(contructTaskDtoToVo);
							List<TaskboardTaskVO> applyFilters = applyFilter(taskGroupByVO.getGroupBy(), taskGroupByVO, tempList);
							if (!applyFilters.isEmpty()) {
								uuidList.add(id);
								taskboardTaskList.add(contructTaskDtoToVo(taskEntityVO, taskList, username));
							}
						} else {
							taskboardTaskList.add(contructTaskDtoToVo(taskEntityVO, taskList, username));
							uuidList.add(id);
						}

					}
				}
			}
		}
		return taskboardTaskList;
	}

	@Transactional
	public TaskboardVO getDoneTaskForFiltersCount(TaskGroupByVO taskGroupByVO) throws IOException {
		List<TaskboardTaskVO> taskboardTaskList = new ArrayList<>();
		User user = userRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(YorosisContext.get().getUserName(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);

		if (user != null) {
			UsersVO userVo = constructDTOToVO(user);
			List<UUID> userGroupIdsList = getGroupAsUUID(userVo);
			String username = user.getFirstName() + " " + user.getLastName();
			Set<TaskEntityVO> taskLists = null;
			FilterDateVO filterDateVO = getStartAndEndDate(taskGroupByVO);
			if (taskGroupByVO.getSprintId() == null) {
				if (!StringUtils.equals(taskGroupByVO.getFilterType(), ALL)) {
					if (StringUtils.equals(taskGroupByVO.getFilterBy(), CREATED_DATE)) {
						taskLists = taskboardTaskRepository.getTaskboardTaskListForDoneColumnWithCreatedDateFilter(taskGroupByVO.getId(), userVo.getUserId(),
								userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES, Timestamp.valueOf(filterDateVO.getStartDate()),
								Timestamp.valueOf(filterDateVO.getEndDate()));
					} else if (StringUtils.equals(taskGroupByVO.getFilterBy(), START_DATE)) {
						taskLists = taskboardTaskRepository.getTaskboardTaskListForDoneColumnWithStartDateFilter(taskGroupByVO.getId(), userVo.getUserId(),
								userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES, Timestamp.valueOf(filterDateVO.getStartDate()),
								Timestamp.valueOf(filterDateVO.getEndDate()));
					} else if (StringUtils.equals(taskGroupByVO.getFilterBy(), DUE_DATE)) {
						taskLists = taskboardTaskRepository.getTaskboardTaskListForDoneColumnWithDueDateFilter(taskGroupByVO.getId(), userVo.getUserId(),
								userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES, Timestamp.valueOf(filterDateVO.getStartDate()),
								Timestamp.valueOf(filterDateVO.getEndDate()));
					} else {
						taskLists = taskboardTaskRepository.getTaskboardTaskListForDoneColumn(taskGroupByVO.getId(), userVo.getUserId(), userGroupIdsList,
								YorosisContext.get().getTenantId(), YorosisConstants.YES);
					}
				} else {
					taskLists = taskboardTaskRepository.getTaskboardTaskListForDoneColumn(taskGroupByVO.getId(), userVo.getUserId(), userGroupIdsList,
							YorosisContext.get().getTenantId(), YorosisConstants.YES);
				}

			} else {
				if (!StringUtils.equals(taskGroupByVO.getFilterType(), ALL)) {
					if (StringUtils.equals(taskGroupByVO.getFilterBy(), CREATED_DATE)) {
						taskLists = taskboardTaskRepository.getTaskboardTaskListForDoneColumnBySprintWithCreatedDateFilter(taskGroupByVO.getId(),
								taskGroupByVO.getSprintId(), userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES,
								Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()));
					} else if (StringUtils.equals(taskGroupByVO.getFilterBy(), START_DATE)) {
						taskLists = taskboardTaskRepository.getTaskboardTaskListForDoneColumnBySprintWithStartDateFilter(taskGroupByVO.getId(),
								taskGroupByVO.getSprintId(), userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES,
								Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()));
					} else if (StringUtils.equals(taskGroupByVO.getFilterBy(), DUE_DATE)) {
						taskLists = taskboardTaskRepository.getTaskboardTaskListForDoneColumnBySprintWithDueDateFilter(taskGroupByVO.getId(),
								taskGroupByVO.getSprintId(), userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES,
								Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()));
					} else {
						taskLists = taskboardTaskRepository.getTaskboardTaskListForDoneColumnBysprint(taskGroupByVO.getId(), taskGroupByVO.getSprintId(),
								userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES);
					}
				} else {
					taskLists = taskboardTaskRepository.getTaskboardTaskListForDoneColumnBysprint(taskGroupByVO.getId(), taskGroupByVO.getSprintId(),
							userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES);
				}
			}
			List<UUID> uuidList = new ArrayList<>();
			List<TaskEntityVO> taskList = new ArrayList<TaskEntityVO>();
			taskList.addAll(taskLists);
			if (!taskList.isEmpty()) {
				for (TaskEntityVO taskEntityVO : taskList) {
					UUID id = UUID.fromString(taskEntityVO.getId());
					if (!uuidList.contains(id) && uuidList.size() < 25) {
						if (!taskGroupByVO.getAssignedUserIdList().isEmpty() || !taskGroupByVO.getTaskboardPriorityList().isEmpty()
								|| !taskGroupByVO.getTaskboardLabelIdList().isEmpty() || BooleanUtils.isTrue(taskGroupByVO.getIsNoLabel())
								|| BooleanUtils.isTrue(taskGroupByVO.getIsNoPriority()) || BooleanUtils.isTrue(taskGroupByVO.getIsUnAssignedUser())) {
							List<TaskboardTaskVO> tempList = new ArrayList<>();
							TaskboardTaskVO contructTaskDtoToVo = contructTaskDtoToVo(taskEntityVO, taskList, username);
							tempList.add(contructTaskDtoToVo);
							List<TaskboardTaskVO> applyFilters = applyFilter(taskGroupByVO.getGroupBy(), taskGroupByVO, tempList);
							if (!applyFilters.isEmpty()) {
								uuidList.add(id);
								taskboardTaskList.add(contructTaskDtoToVo(taskEntityVO, taskList, username));
							}
						} else {
							taskboardTaskList.add(contructTaskDtoToVo(taskEntityVO, taskList, username));
							uuidList.add(id);
						}

					}
				}
			}
		}
		return TaskboardVO.builder().doneTaskLength(taskboardTaskList.size()).build();
	}

//	@Transactional
//	public List<TaskboardTaskVO> getRemainingTaskTask(UUID taskboardId) throws IOException {
//		List<TaskboardTaskVO> taskboardTaskList = new ArrayList<>();
//		User user = userRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
//				YorosisContext.get().getUserName(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
//
//		if (user != null) {
//			UsersVO userVo = constructDTOToVO(user);
//			List<UUID> userGroupIdsList = getGroupAsUUID(userVo);
//			String username = user.getFirstName() + " " + user.getLastName();
//			List<TaskEntityVO> taskList = taskboardTaskRepository.getTaskboardRemainingTaskList(taskboardId,
//					userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES);
//			List<UUID> uuidList = new ArrayList<>();
//			if (taskList != null && !taskList.isEmpty()) {
//				for (TaskEntityVO taskEntityVO : taskList) {
//					UUID id = UUID.fromString(taskEntityVO.getId());
//					if (!uuidList.contains(id) && uuidList.size() < 25) {
//						taskboardTaskList.add(contructTaskDtoToVo(taskEntityVO, taskList, username));
//						uuidList.add(id);
//					}
//				}
//			}
//		}
//		return taskboardTaskList;
//	}

	private void getTotalCount(UUID taskboardId, UsersVO userVo, List<TaskboardColumnsVO> taskboardColumnsList, String doneColumn, UUID sprintId) {
		List<TaskCountVo> statusCountList = new ArrayList<>();
		List<SubTaskCountVo> subCountList = new ArrayList<>();
		List<UUID> userGroupIdsList = getGroupAsUUID(userVo);
		List<Object[]> parentTaskCount = sprintId == null
				? taskboardTaskRepository.getTaskboardInitialTaskListCount(taskboardId, userVo.getUserId(), userGroupIdsList,
						YorosisContext.get().getTenantId(), YorosisConstants.YES)
				: taskboardTaskRepository.getTaskboardInitialTaskListCountSprint(taskboardId, userVo.getUserId(), userGroupIdsList,
						YorosisContext.get().getTenantId(), YorosisConstants.YES, sprintId);
		if (parentTaskCount != null && !parentTaskCount.isEmpty()) {
			statusCountList = parentTaskCount.stream().map(this::constructTaskCountVO).collect(Collectors.toList());
		}
		List<Object[]> subTaskCount = sprintId == null
				? taskboardTaskRepository.getTaskboardInitialTaskListSubtaskCount(taskboardId, userVo.getUserId(), userGroupIdsList,
						YorosisContext.get().getTenantId(), YorosisConstants.YES)
				: taskboardTaskRepository.getTaskboardInitialTaskListSubtaskCountSprint(taskboardId, userVo.getUserId(), userGroupIdsList,
						YorosisContext.get().getTenantId(), YorosisConstants.YES, sprintId);
		if (subTaskCount != null && !subTaskCount.isEmpty()) {
			subCountList = subTaskCount.stream().map(this::constructSubTaskCountVo).collect(Collectors.toList());
		}

		List<UUID> parentIdList = new ArrayList<>();
		subCountList.stream().forEach(p -> parentIdList.add(p.getId()));
		List<Object[]> statusAndParentTask = sprintId == null
				? taskboardTaskRepository.getTaskboardInitialTaskListSubTaskWithParentTaskId(taskboardId, parentIdList, YorosisContext.get().getTenantId(),
						YorosisConstants.YES)
				: taskboardTaskRepository.getTaskboardInitialTaskListSubTaskWithParentTaskIdSprint(taskboardId, parentIdList,
						YorosisContext.get().getTenantId(), YorosisConstants.YES, sprintId);
		if (statusAndParentTask != null && !statusAndParentTask.isEmpty()) {
			for (Object[] s : statusAndParentTask) {
				for (SubTaskCountVo count : subCountList) {
					if (StringUtils.equals(count.getId().toString(), (String) s[1])) {
						statusCountList.stream().forEach(ts -> {
							if (StringUtils.equals((String) s[0], ts.getStatus())) {
								ts.setCount(ts.getCount() + count.getCount());
							}
						});
					}
				}
			}
		}
		for (TaskboardColumnsVO tc : taskboardColumnsList) {
			statusCountList.stream().forEach(s -> {
				if (StringUtils.equals(tc.getColumnName(), s.getStatus()) && !StringUtils.equals(tc.getColumnName(), doneColumn)) {
					tc.setTaskCount(s.getCount());
				}
				if (StringUtils.equals(tc.getColumnName(), s.getStatus()) && StringUtils.equals(tc.getColumnName(), doneColumn)) {
					tc.setTaskCount(s.getCount() > 25 ? 25 : s.getCount());
				}
			});
		}

	}

	private SubTaskCountVo constructSubTaskCountVo(Object[] taskCountVo) {
		return SubTaskCountVo.builder().id(UUID.fromString((String) taskCountVo[0])).count(((BigInteger) taskCountVo[1]).intValue()).build();
	}

	private TaskCountVo constructTaskCountVO(Object[] taskCountVo) {
		return TaskCountVo.builder().status((String) taskCountVo[0]).count(((BigInteger) taskCountVo[1]).intValue()).build();
	}

	@Transactional
	public TaskboardVO getTaskBoardRecordsByType(UUID taskboardId, Integer index, UUID sprintId) throws IOException {

		if (taskboardId != null) {

			List<TaskboardColumnsVO> taskboardColumnsList = null;
			List<TaskboardColumnMapVO> taskboardColumnMapVOList = new ArrayList<>();

			User user = userRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(YorosisContext.get().getUserName(),
					YorosisContext.get().getTenantId(), YorosisConstants.YES);

			if (user != null) {
				UsersVO userVo = constructDTOToVO(user);
				List<UUID> userGroupIdsList = getGroupAsUUID(userVo);
				String username = user.getFirstName() + " " + user.getLastName();
				TaskboardVO taskboardVO = TaskboardVO.builder().build();
				taskboardVO = setTaskboardVO(taskboardId, userVo);
				taskboardColumnsList = taskboardVO.getTaskboardColumns().stream().sorted(Comparator.comparing(TaskboardColumnsVO::getColumnOrder))
						.collect(Collectors.toList());
				String doneColumn = null;
				if (taskboardColumnsList != null && !taskboardColumnsList.isEmpty()) {
					doneColumn = taskboardColumnsList.get(taskboardColumnsList.size() - 1).getColumnName();
				}

				int startIndex = 0;
				int endIndex = 10;
				if (index != null && index > 0) {
					startIndex = index * 10;
					endIndex = startIndex + 10;
				}
				List<TaskEntityVO> taskList = null;

				if (index == null || index == 0) {
					getTotalCount(taskboardId, userVo, taskboardColumnsList, doneColumn, sprintId);
				}
				if (sprintId == null) {
					taskList = taskboardTaskRepository.getTaskboardInitialTaskList(taskboardId, userVo.getUserId(), userGroupIdsList,
							YorosisContext.get().getTenantId(), YorosisConstants.YES);
				} else {
					taskList = taskboardTaskRepository.getTaskboardInitialTaskListBySprint(taskboardId, sprintId, userVo.getUserId(), userGroupIdsList,
							YorosisContext.get().getTenantId(), YorosisConstants.YES);
				}

				for (TaskboardColumnsVO taskboardColumnsVO : taskboardColumnsList) {
					List<TaskboardTaskVO> taskboardTaskList = new ArrayList<>();
					List<UUID> uuidList = new ArrayList<>();
					int matchCount = 0;
					for (TaskEntityVO taskEntityVO : taskList) {
						String columnName = taskEntityVO.getColumnName();
						UUID id = UUID.fromString(taskEntityVO.getId());
						if (StringUtils.equals(columnName, taskboardColumnsVO.getColumnName()) && StringUtils.equals(taskEntityVO.getTaskType(), "parentTask")
								&& !uuidList.contains(id)) {
							uuidList.add(id);
							matchCount++;
							if (matchCount > startIndex && matchCount <= endIndex) {
								taskboardTaskList.add(contructTaskDtoToVo(taskEntityVO, taskList, username));
								List<SubTaskVO> subTaskList = hasSubTask(taskList, id, taskboardTaskList, username);
								List<TaskboardTaskVO> parentTaskList = taskboardTaskList.stream()
										.filter(t -> StringUtils.equals(t.getId().toString(), taskEntityVO.getId())).collect(Collectors.toList());
								if (parentTaskList != null && !parentTaskList.isEmpty()) {
									parentTaskList.get(0).setSubTaskLength(subTaskList.size());
									parentTaskList.get(0).setSubTasks(subTaskList);
								}

								Collections.sort(taskboardTaskList, TaskboardTaskVO.DisplayOrderComparator);
							}
						}
					}
					taskboardColumnMapVOList
							.add(TaskboardColumnMapVO.builder().taskboardColumnsVO(taskboardColumnsVO).taskboardTaskVOList(taskboardTaskList).build());
				}

//				if (boardCall && !taskboardColumnMapVOList.isEmpty()) {
//					// Get the last column
//					TaskboardColumnMapVO taskboardColumnMapVO = taskboardColumnMapVOList
//							.get(taskboardColumnMapVOList.size() - 1);
//
//					List<TaskboardTaskVO> voList = taskboardColumnMapVO.getTaskboardTaskVOList();
//
//					// If the size is more than 25, then get the latest 25 and set it
//					if (voList != null && voList.size() > 25) {
//						List<TaskboardTaskVO> subList = voList.subList(voList.size() - 25, voList.size());
//						taskboardColumnMapVO.setTaskboardTaskVOList(subList);
//					}
//				}

				taskboardVO.setTaskboardColumnMapVO(taskboardColumnMapVOList);
				if (index == 0) {
					taskboardVO.setTaskboardColumns(taskboardColumnsList);

					taskboardVO.setTaskboardSecurity(BooleanUtils.isTrue(taskboardVO.getIsTaskBoardOwner())
							? ResolveSecurityForTaskboardVO.builder().read(true).update(true).delete(true).build()
							: getResolvedTaskboardSecurity(taskboardId));
				}

				return taskboardVO;
			} else {
				return TaskboardVO.builder().build();
			}
		} else {
			return TaskboardVO.builder().build();
		}

	}

	private TaskboardVO constructTaskboardDtoToVo(UUID taskboardId, String status, boolean isFromTaskboard) throws IOException {

		if (taskboardId != null) {

			List<TaskboardColumnsVO> taskboardColumnsList = null;
			List<TaskboardColumnMapVO> taskboardColumnMapVOList = new ArrayList<>();

			User user = userRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(YorosisContext.get().getUserName(),
					YorosisContext.get().getTenantId(), YorosisConstants.YES);

			if (user != null) {
				UsersVO userVo = constructDTOToVO(user);
				List<UUID> userGroupIdsList = getGroupAsUUID(userVo);
				String username = user.getFirstName() + " " + user.getLastName();
				TaskboardVO taskboardVO = setTaskboardVO(taskboardId, userVo);
				if (taskboardVO.getTaskboardColumns() != null && !taskboardVO.getTaskboardColumns().isEmpty()) {
					taskboardColumnsList = taskboardVO.getTaskboardColumns().stream().sorted(Comparator.comparing(TaskboardColumnsVO::getColumnOrder))
							.collect(Collectors.toList());
				} else {
					return TaskboardVO.builder().build();
				}
				List<TaskEntityVO> taskList = null;
				if (StringUtils.equalsAnyIgnoreCase(status, ARCHIVED, DELETED)) {
					if (StringUtils.equals(status, DELETED)) {
						taskList = taskboardTaskRepository.getTaskboardTaskListForDeletedTask(taskboardId, userVo.getUserId(), userGroupIdsList,
								YorosisContext.get().getTenantId());
					} else {
						taskList = taskboardTaskRepository.getTaskboardTaskListForArchivedTask(taskboardId, status, userVo.getUserId(), userGroupIdsList,
								YorosisContext.get().getTenantId(), YorosisConstants.YES);
					}
				} else {
					taskList = taskboardTaskRepository.getTaskboardTaskList(taskboardId, userVo.getUserId(), userGroupIdsList,
							YorosisContext.get().getTenantId(), YorosisConstants.YES);
				}

				for (TaskboardColumnsVO taskboardColumnsVO : taskboardColumnsList) {
					List<TaskboardTaskVO> taskboardTaskList = new ArrayList<>();
					List<UUID> uuidList = new ArrayList<>();
					for (TaskEntityVO taskEntityVO : taskList) {
						String columnName = taskEntityVO.getColumnName();
						UUID id = UUID.fromString(taskEntityVO.getId());
						if (StringUtils.equals(columnName, taskboardColumnsVO.getColumnName()) && StringUtils.equals(taskEntityVO.getTaskType(), "parentTask")
								&& !uuidList.contains(id)) {
							uuidList.add(id);
							taskboardTaskList.add(contructTaskDtoToVo(taskEntityVO, taskList, username));
							List<SubTaskVO> subTaskList = hasSubTask(taskList, id, taskboardTaskList, username);
							List<TaskboardTaskVO> parentTaskList = taskboardTaskList.stream()
									.filter(t -> StringUtils.equals(t.getId().toString(), taskEntityVO.getId())).collect(Collectors.toList());
							if (parentTaskList != null && !parentTaskList.isEmpty()) {
								parentTaskList.get(0).setSubTaskLength(subTaskList.size());
								parentTaskList.get(0).setSubTasks(subTaskList);
							}

							Collections.sort(taskboardTaskList, TaskboardTaskVO.DisplayOrderComparator);
						}
					}
					taskboardColumnMapVOList
							.add(TaskboardColumnMapVO.builder().taskboardColumnsVO(taskboardColumnsVO).taskboardTaskVOList(taskboardTaskList).build());
				}

//				if (boardCall && !taskboardColumnMapVOList.isEmpty()) {
//					// Get the last column
//					TaskboardColumnMapVO taskboardColumnMapVO = taskboardColumnMapVOList
//							.get(taskboardColumnMapVOList.size() - 1);
//
//					List<TaskboardTaskVO> voList = taskboardColumnMapVO.getTaskboardTaskVOList();
//
//					// If the size is more than 25, then get the latest 25 and set it
//					if (voList != null && voList.size() > 25) {
//						List<TaskboardTaskVO> subList = voList.subList(voList.size() - 25, voList.size());
//						taskboardColumnMapVO.setTaskboardTaskVOList(subList);
//					}
//				}

				taskboardVO.setTaskboardColumnMapVO(taskboardColumnMapVOList);
				taskboardVO.setTaskboardColumns(taskboardColumnsList);
//				taskboardVO.setSprintEnabled(charToBoolean(taskboard.getSprintEnabled()));
				taskboardVO.setSprintSettingsVo(taskboardSprintService.getSprintSettingsByTaskBoard(taskboardId));
				taskboardVO.setTaskboardSecurity(BooleanUtils.isTrue(taskboardVO.getIsTaskBoardOwner())
						? ResolveSecurityForTaskboardVO.builder().read(true).update(true).delete(true).build()
						: getResolvedTaskboardSecurity(taskboardId));

				return taskboardVO;
			} else {
				return TaskboardVO.builder().build();
			}
		} else {
			return TaskboardVO.builder().build();
		}

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

	public FilterDateVO getStartAndEndDate(TaskGroupByVO vo) {
		LocalDate today = LocalDate.now();
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
			FilterDateVO filterDateVO = getStartAndEndDate(taskGroupByVO);
			UsersVO userVo = constructDTOToVO(user);
			List<UUID> userGroupIdsList = getGroupAsUUID(userVo);
			String username = user.getFirstName() + " " + user.getLastName();
			TaskboardVO taskboardVO = setTaskboardVO(taskGroupByVO.getId(), userVo);
			taskboardColumnsList = taskboardVO.getTaskboardColumns().stream().sorted(Comparator.comparing(TaskboardColumnsVO::getColumnOrder))
					.collect(Collectors.toList());
			int startIndex = 0;
			int endIndex = 10;
			if (index != null && index > 0) {
				startIndex = index * 10;
				endIndex = startIndex + 10;
			}
			if (BooleanUtils.isFalse(taskGroupByVO.getIsForCount()) && StringUtils.equals(taskGroupByVO.getGroupBy(), STATUS)
					&& (index == null || index == 0)) {
				getTotalCount(taskGroupByVO.getId(), userVo, taskboardColumnsList, null, taskGroupByVO.getSprintId());
			}
			if (StringUtils.equals(taskGroupByVO.getGroupBy(), ASSIGNEE)) {

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
			} else {
				if (taskGroupByVO.getSprintId() == null) {
					if (!StringUtils.equals(taskGroupByVO.getFilterType(), ALL)) {
						if (StringUtils.equals(taskGroupByVO.getFilterBy(), CREATED_DATE)) {
							taskList = taskboardTaskRepository.getTaskboardInitialTaskListWithCreatedDateFilter(taskGroupByVO.getId(), userVo.getUserId(),
									userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES, Timestamp.valueOf(filterDateVO.getStartDate()),
									Timestamp.valueOf(filterDateVO.getEndDate()));
						} else if (StringUtils.equals(taskGroupByVO.getFilterBy(), START_DATE)) {
							taskList = taskboardTaskRepository.getTaskboardInitialTaskListWithStartDateFilter(taskGroupByVO.getId(), userVo.getUserId(),
									userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES, Timestamp.valueOf(filterDateVO.getStartDate()),
									Timestamp.valueOf(filterDateVO.getEndDate()));
						} else if (StringUtils.equals(taskGroupByVO.getFilterBy(), DUE_DATE)) {
							taskList = taskboardTaskRepository.getTaskboardInitialTaskListWithDueDateFilter(taskGroupByVO.getId(), userVo.getUserId(),
									userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES, Timestamp.valueOf(filterDateVO.getStartDate()),
									Timestamp.valueOf(filterDateVO.getEndDate()));
						} else {
							taskList = taskboardTaskRepository.getTaskboardInitialTaskList(taskGroupByVO.getId(), userVo.getUserId(), userGroupIdsList,
									YorosisContext.get().getTenantId(), YorosisConstants.YES);
						}
					} else {
						taskList = taskboardTaskRepository.getTaskboardInitialTaskList(taskGroupByVO.getId(), userVo.getUserId(), userGroupIdsList,
								YorosisContext.get().getTenantId(), YorosisConstants.YES);
					}
				} else {
					if (!StringUtils.equals(taskGroupByVO.getFilterType(), ALL)) {
						if (StringUtils.equals(taskGroupByVO.getFilterBy(), CREATED_DATE)) {
							taskList = taskboardTaskRepository.getTaskboardInitialTaskListBySprintWithCreatedDateFilter(taskGroupByVO.getId(),
									taskGroupByVO.getSprintId(), userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES,
									Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()));
						} else if (StringUtils.equals(taskGroupByVO.getFilterBy(), START_DATE)) {
							taskList = taskboardTaskRepository.getTaskboardInitialTaskListBySprintWithStartDateFilter(taskGroupByVO.getId(),
									taskGroupByVO.getSprintId(), userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES,
									Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()));
						} else if (StringUtils.equals(taskGroupByVO.getFilterBy(), DUE_DATE)) {
							taskList = taskboardTaskRepository.getTaskboardInitialTaskListBySprintWithDueDateFilter(taskGroupByVO.getId(),
									taskGroupByVO.getSprintId(), userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES,
									Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()));
						} else {
							taskList = taskboardTaskRepository.getTaskboardInitialTaskListBySprint(taskGroupByVO.getId(), taskGroupByVO.getSprintId(),
									userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES);
						}
					} else {
						taskList = taskboardTaskRepository.getTaskboardInitialTaskListBySprint(taskGroupByVO.getId(), taskGroupByVO.getSprintId(),
								userVo.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES);
					}
				}
			}

			if (StringUtils.isNotBlank(taskGroupByVO.getSearchByTaskId())) {
				taskList = taskList.stream().filter(f -> (filterSearchTaskId(taskGroupByVO.getSearchByTaskId(), f))).collect(Collectors.toList());
			}

			if (StringUtils.equals(taskGroupByVO.getGroupBy(), STATUS)) {
				taskboardVO.setTaskboardColumnMapVO(BooleanUtils.isTrue(taskGroupByVO.getIsForCount())
						? getAssigneeOrPriorityCount(taskboardColumnsList, taskList, username, STATUS, taskGroupByVO)
						: setColumnMapVO(taskboardColumnsList, taskList, startIndex, endIndex, username, STATUS, taskGroupByVO));
				if (index == 0) {
					taskboardVO.setTaskboardColumns(taskboardColumnsList);

					taskboardVO.setTaskboardSecurity(BooleanUtils.isTrue(taskboardVO.getIsTaskBoardOwner())
							? ResolveSecurityForTaskboardVO.builder().read(true).update(true).delete(true).build()
							: getResolvedTaskboardSecurity(taskGroupByVO.getId()));
				}

				return taskboardVO;

			} else if (StringUtils.equals(taskGroupByVO.getGroupBy(), PRIORITY)) {
				List<TaskboardColumnsVO> priorityColumnsList = new ArrayList<>();

				priorityColumnsList.add(TaskboardColumnsVO.builder().columnName(NO_PRIORITY).columnColor(NO_PRIORITY_COLOR).columnOrder(1L).build());
				priorityColumnsList.add(TaskboardColumnsVO.builder().columnName(URGENT).columnColor(URGENT_COLOR).columnOrder(2L).build());
				priorityColumnsList.add(TaskboardColumnsVO.builder().columnName(HIGH).columnColor(HIGH_COLOR).columnOrder(3L).build());
				priorityColumnsList.add(TaskboardColumnsVO.builder().columnName(MEDIUM).columnColor(MEDIUM_COLOR).columnOrder(4L).build());
				priorityColumnsList.add(TaskboardColumnsVO.builder().columnName(LOW).columnColor(LOW_COLOR).columnOrder(5L).build());

				taskboardVO.setTaskboardColumnMapVO(BooleanUtils.isTrue(taskGroupByVO.getIsForCount())
						? getAssigneeOrPriorityCount(priorityColumnsList, taskList, username, PRIORITY, taskGroupByVO)
						: setColumnMapVO(priorityColumnsList, taskList, startIndex, endIndex, username, PRIORITY, taskGroupByVO));
				if (index == 0) {
					taskboardVO.setTaskboardColumns(taskboardColumnsList);

					taskboardVO.setTaskboardSecurity(BooleanUtils.isTrue(taskboardVO.getIsTaskBoardOwner())
							? ResolveSecurityForTaskboardVO.builder().read(true).update(true).delete(true).build()
							: getResolvedTaskboardSecurity(taskGroupByVO.getId()));
				}

				return taskboardVO;

			} else if (StringUtils.equals(taskGroupByVO.getGroupBy(), ASSIGNEE)) {
				Map<String, TaskboardColumnsVO> assigneeMap = new LinkedHashMap<>();
				List<TaskboardColumnsVO> assigneeColumnsList = new ArrayList<>();

				List<UserFieldVO> userFieldVOList = new ArrayList<>();

				Integer assigneeIndex = taskGroupByVO.getAssigneeIndex();

				if (assigneeIndex == 0) {
					userFieldVOList.add(UserFieldVO.builder().name(UNASSIGNED).color(BLACK).build());

					assigneeMap.put(UNASSIGNED,
							TaskboardColumnsVO.builder().columnName(UNASSIGNED).columnColor(WHITE).columnOrder(1L).userFieldList(userFieldVOList).build());

					assigneeColumnsList.add(assigneeMap.get(UNASSIGNED));
				}

				Long i = 2L;
				int assigneeStartIndex = 0;
				int assigneeEndIndex = 10;

				if (assigneeIndex != null && assigneeIndex > 0) {
					assigneeStartIndex = assigneeIndex * 10;
					assigneeEndIndex = assigneeStartIndex + 10;
				}

				int matchCount = 0;
				if (assigneeIndex == 0) {
					matchCount = 1;
				}
				for (TaskEntityVO taskEntityVO : taskList) {
					String assigneeUsers = getUsername(taskEntityVO, taskList);
					if (StringUtils.isNotBlank(assigneeUsers) && !assigneeMap.containsKey(assigneeUsers)) {
						i++;
						assigneeMap.put(assigneeUsers, TaskboardColumnsVO.builder().columnName(assigneeUsers)
								.userFieldList(getUserField(taskEntityVO, taskList)).columnOrder(i).build());
						matchCount++;
						if (matchCount > assigneeStartIndex && matchCount <= assigneeEndIndex) {
							log.info("assigneeUsers:{}", assigneeUsers);
							assigneeColumnsList.add(assigneeMap.get(assigneeUsers));
							if (assigneeColumnsList.size() == 10) {
								break;
							}
						}
					}
				}

				log.info("assigneeColumnsList:{}", assigneeColumnsList);
				log.info("assigneeIndex:{}", taskGroupByVO.getAssigneeIndex());
				log.info("assigneeColumnsListSize:{}", assigneeColumnsList.size());

				taskboardVO.setTaskboardColumnMapVO(BooleanUtils.isTrue(taskGroupByVO.getIsForCount())
						? getAssigneeOrPriorityCount(assigneeColumnsList, taskList, username, ASSIGNEE, taskGroupByVO)
						: setColumnMapVO(assigneeColumnsList, taskList, startIndex, endIndex, username, ASSIGNEE, taskGroupByVO));
				if (index == 0) {
					taskboardVO.setTaskboardColumns(taskboardColumnsList);

					taskboardVO.setTaskboardSecurity(BooleanUtils.isTrue(taskboardVO.getIsTaskBoardOwner())
							? ResolveSecurityForTaskboardVO.builder().read(true).update(true).delete(true).build()
							: getResolvedTaskboardSecurity(taskGroupByVO.getId()));
				}

				long stopTime = System.currentTimeMillis();
				long elapsedTime = stopTime - startTime;
				log.info("END TASKBOARD --------------Get All Task with elaspedTime ms {}", elapsedTime);
				return taskboardVO;
			}
		}
		return TaskboardVO.builder().build();

	}

	@Transactional
	public TaskboardVO getAssigneeTasksByHorizontal(TaskGroupByVO taskGroupByVO) throws IOException {
		User user = userRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(YorosisContext.get().getUserName(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		List<TaskEntityVO> taskList = null;
		long startTime = System.currentTimeMillis();
		log.info("START TASKBOARD --------------Get All Task with startTime {​}​", startTime);

		if (user != null) {
			UsersVO userVo = constructDTOToVO(user);
			List<UUID> userGroupIdsList = getGroupAsUUID(userVo);
			String username = user.getFirstName() + " " + user.getLastName();
			TaskboardVO taskboardVO = setTaskboardVO(taskGroupByVO.getId(), userVo);
			Integer index = taskGroupByVO.getIndex();
			int startIndex = 0;
			int endIndex = 10;
			if (index != null && index > 0) {
				endIndex = (index * 10) + 10;
			}
			FilterDateVO filterDateVO = getStartAndEndDate(taskGroupByVO);

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
			Map<String, TaskboardColumnsVO> assigneeMap = new LinkedHashMap<>();
			List<TaskboardColumnsVO> assigneeColumnsList = new ArrayList<>();

			List<UserFieldVO> userFieldVOList = new ArrayList<>();
			Integer assigneeIndex = taskGroupByVO.getAssigneeIndex();

			if (assigneeIndex == 0) {
				userFieldVOList.add(UserFieldVO.builder().name(UNASSIGNED).color(BLACK).build());

				assigneeMap.put(UNASSIGNED,
						TaskboardColumnsVO.builder().columnName(UNASSIGNED).columnColor(WHITE).columnOrder(1L).userFieldList(userFieldVOList).build());

				assigneeColumnsList.add(assigneeMap.get(UNASSIGNED));
			}

			Long i = 2L;
			int assigneeStartIndex = 0;
			int assigneeEndIndex = 10;

			if (assigneeIndex != null && assigneeIndex > 0) {
				assigneeStartIndex = assigneeIndex * 10;
				assigneeEndIndex = assigneeStartIndex + 10;
			}

			int matchCount = 0;
			if (assigneeIndex == 0) {
				matchCount = 1;
			}
			for (TaskEntityVO taskEntityVO : taskList) {
				String assigneeUsers = getUsername(taskEntityVO, taskList);
				if (StringUtils.isNotBlank(assigneeUsers) && !assigneeMap.containsKey(assigneeUsers)) {
					i++;
					assigneeMap.put(assigneeUsers,
							TaskboardColumnsVO.builder().columnName(assigneeUsers).userFieldList(getUserField(taskEntityVO, taskList)).columnOrder(i).build());
					matchCount++;
					if (matchCount > assigneeStartIndex && matchCount <= assigneeEndIndex) {
						log.info("assigneeUsers:{}", assigneeUsers);
						assigneeColumnsList.add(assigneeMap.get(assigneeUsers));
						if (assigneeColumnsList.size() == 10) {
							break;
						}
					}
				}
			}

			log.info("assigneeColumnsList:{}", assigneeColumnsList);
			log.info("assigneeIndex:{}", taskGroupByVO.getAssigneeIndex());
			log.info("assigneeColumnsListSize:{}", assigneeColumnsList.size());

			taskboardVO.setTaskboardColumnMapVO(BooleanUtils.isTrue(taskGroupByVO.getIsForCount())
					? getAssigneeOrPriorityCount(assigneeColumnsList, taskList, username, ASSIGNEE, taskGroupByVO)
					: setColumnMapVO(assigneeColumnsList, taskList, startIndex, endIndex, username, ASSIGNEE, taskGroupByVO));

			long stopTime = System.currentTimeMillis();
			long elapsedTime = stopTime - startTime;
			log.info("END TASKBOARD --------------Get All Task with elaspedTime ms {}", elapsedTime);

			return taskboardVO;
		}
		return TaskboardVO.builder().build();
	}

	@Transactional
	public TaskboardVO getAssigneeTasksByVertical(TaskGroupByVO taskGroupByVO) throws IOException {
		User user = userRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(YorosisContext.get().getUserName(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		List<TaskEntityVO> taskList = null;
		long startTime = System.currentTimeMillis();
		log.info("START TASKBOARD --------------Get All Task with startTime {​}​", startTime);
		if (user != null) {
			UsersVO userVo = constructDTOToVO(user);
			List<UUID> userGroupIdsList = getGroupAsUUID(userVo);
			String username = user.getFirstName() + " " + user.getLastName();
			TaskboardVO taskboardVO = setTaskboardVO(taskGroupByVO.getId(), userVo);
			Integer index = taskGroupByVO.getIndex();
			int startIndex = 0;
			int endIndex = 10;
			if (index != null && index > 0) {
				startIndex = index * 10;
				endIndex = (index * 10) + 10;
			}

			FilterDateVO filterDateVO = getStartAndEndDate(taskGroupByVO);

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
			Map<String, TaskboardColumnsVO> assigneeMap = new LinkedHashMap<>();
			List<TaskboardColumnsVO> assigneeColumnsList = new ArrayList<>();

			List<UserFieldVO> userFieldVOList = new ArrayList<>();

			Integer assigneeIndex = taskGroupByVO.getAssigneeIndex();

			userFieldVOList.add(UserFieldVO.builder().name(UNASSIGNED).color(BLACK).build());

			assigneeMap.put(UNASSIGNED,
					TaskboardColumnsVO.builder().columnName(UNASSIGNED).columnColor(WHITE).columnOrder(1L).userFieldList(userFieldVOList).build());

			assigneeColumnsList.add(assigneeMap.get(UNASSIGNED));

			Long i = 2L;
			int assigneeStartIndex = 0;
			int assigneeEndIndex = 10;

			if (assigneeIndex != null && assigneeIndex > 0) {
				assigneeEndIndex = (assigneeIndex * 10) + 10;
			}

			int matchCount = 1;
			for (TaskEntityVO taskEntityVO : taskList) {
				String assigneeUsers = getUsername(taskEntityVO, taskList);
				if (StringUtils.isNotBlank(assigneeUsers) && !assigneeMap.containsKey(assigneeUsers)) {
					i++;
					assigneeMap.put(assigneeUsers,
							TaskboardColumnsVO.builder().columnName(assigneeUsers).userFieldList(getUserField(taskEntityVO, taskList)).columnOrder(i).build());
					matchCount++;
					if (matchCount > assigneeStartIndex && matchCount <= assigneeEndIndex) {
						log.info("assigneeUsers:{}", assigneeUsers);
						assigneeColumnsList.add(assigneeMap.get(assigneeUsers));
						if (assigneeColumnsList.size() == assigneeEndIndex) {
							break;
						}
					}
				}
			}

			log.info("assigneeColumnsList:{}", assigneeColumnsList);
			log.info("assigneeIndex:{}", taskGroupByVO.getAssigneeIndex());
			log.info("assigneeColumnsListSize:{}", assigneeColumnsList.size());

			taskboardVO.setTaskboardColumnMapVO(BooleanUtils.isTrue(taskGroupByVO.getIsForCount())
					? getAssigneeOrPriorityCount(assigneeColumnsList, taskList, username, ASSIGNEE, taskGroupByVO)
					: setColumnMapVO(assigneeColumnsList, taskList, startIndex, endIndex, username, ASSIGNEE, taskGroupByVO));

			long stopTime = System.currentTimeMillis();
			long elapsedTime = stopTime - startTime;
			log.info("END TASKBOARD --------------Get All Task with elaspedTime ms {}", elapsedTime);

			return taskboardVO;
		}
		return TaskboardVO.builder().build();
	}

	private List<TaskboardColumnMapVO> setColumnMapVO(List<TaskboardColumnsVO> columnsList, List<TaskEntityVO> taskList, int startIndex, int endIndex,
			String username, String status, TaskGroupByVO taskGroupByVO) throws IOException {
		List<TaskboardColumnMapVO> taskboardColumnMapVOList = new ArrayList<>();
		for (TaskboardColumnsVO taskboardColumnsVO : columnsList) {
			taskboardColumnMapVOList.add(TaskboardColumnMapVO.builder().taskboardColumnsVO(taskboardColumnsVO)
					.taskboardTaskVOList(setTaskboardTaskList(taskboardColumnsVO, taskList, status, startIndex, endIndex, username, taskGroupByVO)).build());
		}
		return taskboardColumnMapVOList;
	}

	private List<TaskboardColumnMapVO> getAssigneeOrPriorityCount(List<TaskboardColumnsVO> columnsList, List<TaskEntityVO> taskList, String username,
			String status, TaskGroupByVO taskGroupByVO) throws IOException {
		List<TaskboardColumnMapVO> taskboardColumnMapVOList = new ArrayList<>();
		for (TaskboardColumnsVO taskboardColumnsVO : columnsList) {
			taskboardColumnsVO.setTaskCount(getCount(taskboardColumnsVO, taskList, status, username, taskGroupByVO));
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
				} else {
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

		return taskboardTaskList.size();
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

	private SubTaskVO constructSubTaskDtoToVo(TaskEntityVO task, List<TaskEntityVO> taskList) {
		SubTaskVOBuilder subTaskVOBuilder = SubTaskVO.builder();

		return subTaskVOBuilder.id(UUID.fromString(task.getId())).status(task.getStatus()).taskName(task.getTaskName()).taskType(task.getTaskType())
				.assignTaskVO(setAssignTask(task, taskList)).createdBy(task.getCreatedBy()).modifiedBy(task.getModifiedBy()).startDate(task.getStartDate())
				.dueDate(task.getDueDate()).createdOn(task.getCreatedOn()).modifiedOn(task.getModifiedOn()).build();
	}

	private List<SubTaskVO> hasSubTask(List<TaskEntityVO> taskList, UUID parentTaskId, List<TaskboardTaskVO> taskboardTaskList, String userName)
			throws IOException {
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
				}).distinct().forEach(param -> {
					taskboardTaskList.add(param);
				});
		return subTaskList;
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public TaskboardVO getTaskBoardIdByKey(String taskboardKey) throws IOException {
		UUID taskboardId = taskboardRepository
				.findByTaskboardKeyAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(taskboardKey, YorosisContext.get().getTenantId(), YorosisConstants.YES).getId();
		Taskboard taskboard = taskboardRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(taskboardId, YorosisContext.get().getTenantId(),
				YorosisConstants.YES);
		if (taskboard != null) {
			TaskboardVO taskboardVO = TaskboardVO.builder().id(taskboard.getId()).name(taskboard.getName()).description(taskboard.getDescription())
					.generatedTaskId(taskboard.getGeneratedTaskId()).taskName(taskboard.getTaskName()).taskboardKey(taskboard.getTaskboardKey()).build();

			List<TaskboardColumnsVO> taskboardColumnsList = taskboard.getTaskboardColumns().stream()
					.filter(taskboardColumns -> StringUtils.equals(taskboardColumns.getActiveFlag(), YorosisConstants.YES))
					.map(this::constructTaskboardColumnsDtoToVo).collect(Collectors.toList());

			taskboardVO.setTaskboardColumns(taskboardColumnsList);

			if (taskboard.getTaskboardTask() != null && !taskboard.getTaskboardTask().isEmpty()) {
				long parentTaskLength = taskboard.getTaskboardTask().stream().filter(l -> l.getTaskType().equals("parentTask")).count();
				taskboardVO.setParentTaskLength(parentTaskLength);
			}

			return taskboardVO;
		}
		return TaskboardVO.builder().build();
	}

	private TaskboardColumnsVO constructTaskboardColumnsDtoToVo(TaskboardColumns taskboardColumns) {
		List<SubStatusVO> subStatusList = taskboardSubStatusRepository
				.getSubStatusList(taskboardColumns, YorosisContext.get().getTenantId(), YorosisConstants.YES).stream()
				.map(subStatus -> SubStatusVO.builder().name(subStatus.getSubStatusName()).color(subStatus.getSubStatusColor()).id(subStatus.getId())
						.columnOrder(subStatus.getColumnOrder()).previousName(subStatus.getSubStatusName()).build())
				.collect(Collectors.toList());
		return TaskboardColumnsVO.builder().columnName(taskboardColumns.getColumnName()).columnOrder(taskboardColumns.getColumnOrder())
				.formId(taskboardColumns.getFormId()).id(taskboardColumns.getId()).version(taskboardColumns.getVersion())
				.columnColor(taskboardColumns.getColumnColor()).layoutType(taskboardColumns.getLayoutType())
				.taskboardColumnSecurity(getResolvedTaskboardColumnSecurity(taskboardColumns.getId()))
				.isDoneColumn(charToBoolean(taskboardColumns.getIsDoneColumn())).isColumnBackground(charToBoolean(taskboardColumns.getIsColumnBackground()))
				.subStatus(subStatusList).build();
	}

	@Transactional
	public TaskboardVO getTaskboardDetails(UUID taskboardId, String status, boolean isFromTaskboard) throws IOException, ParseException {
		long startTime = System.currentTimeMillis();
		log.info("START TASKBOARD --------------Get All Task with startTime {​}​", startTime);
		TaskboardVO constructTaskboardDtoToVo = constructTaskboardDtoToVo(taskboardId, status, isFromTaskboard);
		long stopTime = System.currentTimeMillis();
		long elapsedTime = stopTime - startTime;
		log.info("END TASKBOARD --------------Get All Task with elaspedTime ms {}", elapsedTime);
		return constructTaskboardDtoToVo;
	}

	private TaskboardVO setTaskboardVO(UUID taskboardId, UsersVO userVo) throws JsonMappingException, JsonProcessingException {
		List<TaskboardEntityVO> taskboardEntityVoList = taskboardRepository.getTaskboardInfo(taskboardId, YorosisContext.get().getTenantId(),
				YorosisConstants.YES);
		TaskboardVOBuilder taskboardVO = TaskboardVO.builder();
		if (taskboardEntityVoList != null && !taskboardEntityVoList.isEmpty()) {
			List<UUID> uuidList = new ArrayList<>();
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
		}
		return taskboardVO.build();
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

	private List<SubStatusVO> hasSubstatus(UUID columnId, List<TaskboardEntityVO> taskboardEntityVoList) {
		List<SubStatusVO> subStatusList = new ArrayList<>();
		List<UUID> uuidList = new ArrayList<>();
		taskboardEntityVoList.stream().filter(t -> StringUtils.equals(t.getTaskboardColumnId(), columnId.toString())).forEach(t -> {
			if (t.getSubStatusId() != null) {
				UUID subStatusId = UUID.fromString(t.getSubStatusId());
				if (!uuidList.contains(subStatusId) && t.getSubStatusColumnId() != null && StringUtils.equals(t.getSubStatusColumnId(), columnId.toString())) {
					subStatusList.add(SubStatusVO.builder().name(t.getSubStatusName()).color(t.getSubStatusColor()).id(subStatusId)
							.columnOrder(t.getSubStatusColumnOrder()).previousName(t.getSubStatusName()).build());
					uuidList.add(subStatusId);
				}
			}
		});

		return !subStatusList.isEmpty() ? subStatusList.stream().filter(t -> t.getColumnOrder() != null)
				.sorted(Comparator.comparing(SubStatusVO::getColumnOrder)).collect(Collectors.toList()) : Collections.emptyList();
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

	@Transactional
	public List<TaskboardTaskVO> getTaskboardTaskList(UUID taskboardId) {
		List<TaskboardTaskVO> taskboardTaskList = new ArrayList<>();
		Taskboard taskboard = taskboardRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(taskboardId, YorosisContext.get().getTenantId(),
				YorosisConstants.YES);
		if (taskboard != null && !taskboard.getTaskboardTask().isEmpty()) {
			taskboardTaskList = taskboard.getTaskboardTask().stream().map(t -> {
				try {
					return contructTaskboardTaskDtoToVo(t, null);
				} catch (IOException e) {
					log.info("List is empty");
				}
				return null;
			}).sorted(Comparator.comparing(TaskboardTaskVO::getSequenceNo)).collect(Collectors.toList());
		}
		return taskboardTaskList;
	}

	private NestedCommentsVO constructNestedCommentsVo(TaskboardTaskComments taskComments) {
		List<NestedCommentsVO> nestedCommentVoList = new ArrayList<>();
		List<TaskboardTaskComments> taskboardTaskCommentsList = taskboardTaskCommentsRepository.getTaskboardTaskParentComments(
				taskComments.getTaskboardTask().getId(), taskComments.getId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskboardTaskCommentsList != null) {
			nestedCommentVoList = taskboardTaskCommentsList.stream().map(this::constructNestedCommentsVo).collect(Collectors.toList());
		}
		return NestedCommentsVO.builder().nestedComment(taskComments.getComment()).createdBy(taskComments.getCreatedBy()).createdOn(taskComments.getCreatedOn())
				.id(taskComments.getId()).parentCommentId(taskComments.getReplyToCommentId()).modifiedOn(taskComments.getModifiedOn())
				.nestedComments(nestedCommentVoList).build();
	}

	private TaskCommentsVO constructTaskCommentsDtoToVo(TaskboardTaskComments taskComments) {
		List<NestedCommentsVO> nestedCommentVoList = new ArrayList<>();
		List<TaskboardTaskComments> taskboardTaskCommentsList = taskboardTaskCommentsRepository.getTaskboardTaskParentComments(
				taskComments.getTaskboardTask().getId(), taskComments.getId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskboardTaskCommentsList != null) {
			nestedCommentVoList = taskboardTaskCommentsList.stream().map(this::constructNestedCommentsVo).collect(Collectors.toList());
		}
		return TaskCommentsVO.builder().id(taskComments.getId()).taskId(taskComments.getTaskboardTask().getId()).comments(taskComments.getComment())
				.createdBy(taskComments.getCreatedBy()).createdOn(taskComments.getCreatedOn()).modifiedOn(taskComments.getModifiedOn())
				.nestedComments(nestedCommentVoList).build();
	}

	private AssignGroupTaskVO constructAssignGroupDtoToVo(TaskboardTaskAssignedUsers assignedTask) {
		return AssignGroupTaskVO.builder().id(assignedTask.getId()).assigneeGroup(assignedTask.getGroupId()).build();
	}

	private AssignUserTaskVO constructAssignUserDtoToVo(TaskboardTaskAssignedUsers assignedTask) {
		return AssignUserTaskVO.builder().id(assignedTask.getId()).assigneeUser(assignedTask.getUserId()).build();
	}

	private SubTaskVO constructSubTaskDtoToVo(TaskboardTask task) {
		return SubTaskVO.builder().id(task.getId()).startDate(task.getStartDate()).dueDate(task.getDueDate()).taskName(task.getTaskName())
				.taskType(task.getTaskType()).status(task.getStatus()).assignTaskVO(setAssignTask(task)).createdBy(task.getCreatedBy())
				.createdOn(task.getCreatedOn()).modifiedBy(task.getModifiedBy()).modifiedOn(task.getModifiedOn()).build();
	}

	private AssignTaskVO setAssignTask(TaskboardTask task) {
		List<AssignGroupTaskVO> assignGroupTaskVOList = null;
		List<AssignUserTaskVO> assignUserTaskVOList = null;
		AssignTaskVO assignTaskVO = null;
		if (task != null && !task.getTaskboardTaskAssignedUsers().isEmpty()) {
			assignGroupTaskVOList = task.getTaskboardTaskAssignedUsers().stream()
					.filter(assignedTask -> assignedTask.getGroupId() != null && StringUtils.equals(assignedTask.getActiveFlag(), YorosisConstants.YES))
					.map(this::constructAssignGroupDtoToVo).collect(Collectors.toList());

			assignUserTaskVOList = task.getTaskboardTaskAssignedUsers().stream().filter(
					assignedUserTask -> assignedUserTask.getUserId() != null && StringUtils.equals(assignedUserTask.getActiveFlag(), YorosisConstants.YES))
					.map(this::constructAssignUserDtoToVo).collect(Collectors.toList());

			assignTaskVO = AssignTaskVO.builder().assigneeGroupTaskList(assignGroupTaskVOList).assigneeUserTaskList(assignUserTaskVOList).taskId(task.getId())
					.build();
		}
		return assignTaskVO;
	}

	private LabelVO constructTaskLabelsDtoToVo(TaskboardTaskLabels labels) {
		return LabelVO.builder().taskboardLabelId(labels.getTaskboardLabels().getId()).labelName(labels.getLabelName())
				.labelcolor(labels.getTaskboardLabels().getLabelColor()).taskboardTaskLabelId(labels.getId()).build();
	}

	private TaskboardTaskVO contructTaskboardTaskDtoToVo(TaskboardTask taskboardTask, String status) throws IOException {
		List<SubTaskVO> subTasks = new ArrayList<>();
		List<LabelVO> labels = null;
		List<TaskCommentsVO> commentsList = new ArrayList<>();
		List<FilesVO> fileList = new ArrayList<>();
		List<UUID> uuidList = new ArrayList<>();

		if (taskboardTask != null) {
			if (taskboardTask.getTaskboardTaskComments() != null && !taskboardTask.getTaskboardTaskComments().isEmpty()) {
				commentsList = taskboardTask.getTaskboardTaskComments().stream().filter(c -> c.getReplyToCommentId() == null)
						.map(this::constructTaskCommentsDtoToVo).sorted(Comparator.comparing(TaskCommentsVO::getCreatedOn)).collect(Collectors.toList());

			}

			List<TaskboardTask> subTaskboardTaskList = taskboardTaskRepository.getParentTaskIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
					taskboardTask.getId(), YorosisContext.get().getTenantId(),
					StringUtils.equals(status, DELETED) ? YorosisConstants.NO : YorosisConstants.YES);
			if (subTaskboardTaskList != null && !subTaskboardTaskList.isEmpty()) {
				subTaskboardTaskList.stream().sorted(Comparator.comparing(TaskboardTask::getCreatedOn)).collect(Collectors.toList());
				for (TaskboardTask subTask : subTaskboardTaskList) {
					if (!uuidList.contains(subTask.getId())) {
						subTasks.add(constructSubTaskDtoToVo(subTask));
						uuidList.add(subTask.getId());
					}
				}
			}

			labels = taskboardTaskLabelsRepository.getTaskboardTaskLabels(taskboardTask.getId(), YorosisContext.get().getTenantId(), YorosisConstants.YES)
					.stream().map(this::constructTaskLabelsDtoToVo).collect(Collectors.toList());

			if (taskboardTask.getTaskboardTaskFiles() != null && !taskboardTask.getTaskboardTaskFiles().isEmpty()) {
				fileList = taskboardTask.getTaskboardTaskFiles().stream().filter(task -> StringUtils.equals(task.getActiveFlag(), YorosisConstants.YES))
						.map(this::constructTaskFilesDtoToVo).collect(Collectors.toList()).stream()
						.map(t -> FilesVO.builder().fileName(t.getFileName()).id(t.getId()).fileType(t.getFileType()).build()).collect(Collectors.toList());
			}

			List<TaskboardTaskVO> waitingOn = new ArrayList<>();
			List<TaskboardTaskVO> blocking = new ArrayList<>();
			List<TaskboardTaskVO> relatedTasks = new ArrayList<>();
			for (TaskboardTaskDependencies taskDependency : taskboardTask.getTaskboardTaskDependencies()) {
				if (taskDependency.getWaitingOn() != null && StringUtils.equals(taskDependency.getActiveFlag(), YorosisConstants.YES)) {
					waitingOn.add(TaskboardTaskVO.builder().id(taskDependency.getWaitingOn().getId()).taskId(taskDependency.getWaitingOn().getTaskId())
							.dependencyId(taskDependency.getId()).taskName(taskDependency.getWaitingOn().getTaskName())
							.startDate(taskDependency.getWaitingOn().getStartDate()).dueDate(taskDependency.getWaitingOn().getDueDate())
							.status(taskDependency.getWaitingOn().getStatus()).build());
				} else if (taskDependency.getBlocking() != null && StringUtils.equals(taskDependency.getActiveFlag(), YorosisConstants.YES)) {
					blocking.add(TaskboardTaskVO.builder().id(taskDependency.getBlocking().getId()).taskId(taskDependency.getBlocking().getTaskId())
							.dependencyId(taskDependency.getId()).taskName(taskDependency.getBlocking().getTaskName())
							.startDate(taskDependency.getBlocking().getStartDate()).dueDate(taskDependency.getBlocking().getDueDate())
							.status(taskDependency.getBlocking().getStatus()).build());
				} else if (taskDependency.getRelatedTask() != null && StringUtils.equals(taskDependency.getActiveFlag(), YorosisConstants.YES)) {
					relatedTasks.add(TaskboardTaskVO.builder().id(taskDependency.getRelatedTask().getId()).taskId(taskDependency.getRelatedTask().getTaskId())
							.dependencyId(taskDependency.getId()).taskName(taskDependency.getRelatedTask().getTaskName())
							.startDate(taskDependency.getRelatedTask().getStartDate()).dueDate(taskDependency.getRelatedTask().getDueDate())
							.status(taskDependency.getRelatedTask().getStatus()).build());
				}
			}

			return TaskboardTaskVO.builder().id(taskboardTask.getId()).taskboardId(taskboardTask.getTaskboard().getId()).startDate(taskboardTask.getStartDate())
					.dueDate(taskboardTask.getDueDate()).status(taskboardTask.getStatus()).taskData(taskboardTask.getTaskData())
					.taskName(taskboardTask.getTaskName()).taskType(taskboardTask.getTaskType()).taskComments(commentsList).labels(labels).subTasks(subTasks)
					.assignTaskVO(setAssignTask(taskboardTask)).description(taskboardTask.getDescription()).taskId(taskboardTask.getTaskId())
					.createdBy(taskboardTask.getCreatedBy()).createdOn(taskboardTask.getCreatedOn()).modifiedBy(taskboardTask.getModifiedBy())
					.modifiedOn(taskboardTask.getModifiedOn()).files(fileList).subTaskLength(subTasks.size())
					.commentsLength(taskboardTask.getTaskboardTaskComments() == null ? 0 : taskboardTask.getTaskboardTaskComments().size())
					.filesList(fileList.size()).sequenceNo(taskboardTask.getSequenceNo()).parentTaskId(taskboardTask.getParentTaskId())
					.subStatus(taskboardTask.getSubStatus()).loggedInUserName(getUserName()).previousStatus(taskboardTask.getPreviousStatus())
					.priority(taskboardTask.getPriority())
					.taskDependenciesVO(TaskDependenciesVO.builder().waitingOn(waitingOn).blocking(blocking).relatedTasks(relatedTasks).build())
					.estimateHours(taskboardTask.getEstimateHours()).originalPoints(taskboardTask.getOriginalPoints()).build();
		} else {
			return TaskboardTaskVO.builder().build();
		}
	}

	private TaskboardTaskVO contructTaskDtoToVo(TaskboardTask taskboardTask) throws IOException {
		if (taskboardTask != null) {
			return TaskboardTaskVO.builder().id(taskboardTask.getId()).taskboardId(taskboardTask.getTaskboard().getId()).startDate(taskboardTask.getStartDate())
					.dueDate(taskboardTask.getDueDate()).status(taskboardTask.getStatus()).taskData(taskboardTask.getTaskData())
					.taskName(taskboardTask.getTaskName()).taskType(taskboardTask.getTaskType()).assignTaskVO(setAssignTask(taskboardTask))
					.description(taskboardTask.getDescription()).taskId(taskboardTask.getTaskId()).createdBy(taskboardTask.getCreatedBy())
					.createdOn(taskboardTask.getCreatedOn()).modifiedBy(taskboardTask.getModifiedBy()).modifiedOn(taskboardTask.getModifiedOn())
					.commentsLength(getCommentsLength(taskboardTask)).filesList(getAttachmentsLength(taskboardTask)).sequenceNo(taskboardTask.getSequenceNo())
					.parentTaskId(taskboardTask.getParentTaskId()).subStatus(taskboardTask.getSubStatus()).loggedInUserName(getUserName())
					.previousStatus(taskboardTask.getPreviousStatus()).labels(getLabelsList(taskboardTask)).priority(taskboardTask.getPriority()).build();
		} else {
			return TaskboardTaskVO.builder().build();
		}
	}

	private int getCommentsLength(TaskboardTask taskboardTask) {
		List<TaskboardTaskComments> commentsList = new ArrayList<>();
		if (taskboardTask.getTaskboardTaskComments() != null && !taskboardTask.getTaskboardTaskComments().isEmpty()) {
			commentsList = taskboardTask.getTaskboardTaskComments().stream().filter(task -> StringUtils.equals(task.getActiveFlag(), YorosisConstants.YES))
					.collect(Collectors.toList());
		}
		return commentsList.size();
	}

	private int getAttachmentsLength(TaskboardTask taskboardTask) {
		List<TaskboardTaskFiles> filesList = new ArrayList<>();
		if (taskboardTask.getTaskboardTaskFiles() != null && !taskboardTask.getTaskboardTaskFiles().isEmpty()) {
			filesList = taskboardTask.getTaskboardTaskFiles().stream().filter(task -> StringUtils.equals(task.getActiveFlag(), YorosisConstants.YES))
					.collect(Collectors.toList());
		}
		return filesList.size();
	}

	private List<LabelVO> getLabelsList(TaskboardTask taskboardTask) {
		List<LabelVO> labelsList = new ArrayList<>();
		if (taskboardTask.getTaskboardTaskLabels() != null && !taskboardTask.getTaskboardTaskLabels().isEmpty()) {
			labelsList = taskboardTask.getTaskboardTaskLabels().stream().filter(task -> StringUtils.equals(task.getActiveFlag(), YorosisConstants.YES))
					.map(this::constructTaskLabelsDtoToVo).collect(Collectors.toList());
		}
		return labelsList;
	}

	private TaskboardTaskFilesVO constructTaskFilesDtoToVo(TaskboardTaskFiles taskboardTaskFiles) {
		return TaskboardTaskFilesVO.builder().filePath(taskboardTaskFiles.getFilePath()).fileType(taskboardTaskFiles.getFileType())
				.id(taskboardTaskFiles.getId()).fileName(taskboardTaskFiles.getFileName()).build();
	}

	@Transactional
	public TaskboardVO getGeneratedTaskIdList() {
		List<String> generatedTaskIdList = new ArrayList<>();
		List<Taskboard> taskboardList = taskboardRepository
				.getTaskBoardListByTenantIdIgnoreCaseAndActiveFlagIgnoreCaseWithoutWorkspace(YorosisContext.get().getTenantId(), YorosisConstants.YES);
		for (Taskboard task : taskboardList) {
			if (task.getGeneratedTaskId() != null) {
				generatedTaskIdList.add(task.getGeneratedTaskId());
			}
		}
		return TaskboardVO.builder().generatedTaskIdList(generatedTaskIdList).build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO saveTaskboardTask(TaskboardTaskVO vo) throws JsonProcessingException {
		Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());
		JsonNode jsonNode = mapper.readTree(mapper.writeValueAsString(vo.getTaskData()));

		String username = getUserName();
		TaskboardTask taskboardTask = null;
		Taskboard taskboard = null;
		JsonNode oldTaskData = null;

		if (vo.getTaskboardId() != null) {
			taskboard = taskboardRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(vo.getTaskboardId(), YorosisContext.get().getTenantId(),
					YorosisConstants.YES);
		} else {
			return ResponseStringVO.builder().response("Choose Taskboard").build();
		}

		String subStatus = StringUtils.EMPTY;
		if (StringUtils.isEmpty(vo.getSubStatus())) {
			subStatus = getSubStatusInfo(taskboard);
		} else {
			subStatus = vo.getSubStatus();
		}

		if (CollectionUtils.isNotEmpty(vo.getRemovedSubtasks())) {
			for (String id : vo.getRemovedSubtasks()) {
				taskboardTask = taskboardTaskRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID.fromString(id),
						YorosisContext.get().getTenantId(), YorosisConstants.YES);
				taskboardTask.setActiveFlag(YorosisConstants.NO);
				taskboardTaskRepository.save(taskboardTask);
			}
		}

		Long taskboardTasksByStatusCount = taskboardTaskRepository.getTaskboardTasksByStatusCount(vo.getTaskboardId(), vo.getStatus(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		boolean newTask = false;
		String activityType = "updateTask";
		if (vo.getId() == null) {
			String taskId = null;

			Long tasksCount = taskboardTaskRepository.getTaskboardTasksCount(vo.getTaskboardId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
			tasksCount++;
			if (tasksCount < 9) {
				taskId = taskboard.getGeneratedTaskId() + "-00" + tasksCount.toString();
			} else if (tasksCount < 99) {
				taskId = taskboard.getGeneratedTaskId() + "-0" + tasksCount.toString();
			} else {
				taskId = taskboard.getGeneratedTaskId() + "-" + tasksCount.toString();
			}
			taskboardTask = TaskboardTask.builder().taskData(jsonNode).launchTaskData(jsonNode).status(vo.getStatus()).createdBy(username)
					.createdOn(currentTimestamp).modifiedBy(username).modifiedOn(currentTimestamp).activeFlag(YorosisConstants.YES).taskboard(taskboard)
					.taskType(vo.getTaskType()).tenantId(YorosisContext.get().getTenantId()).taskName(getTaskName(vo, taskboard, taskId)).taskId(taskId)
					.sequenceNo(taskboardTasksByStatusCount).subStatus(subStatus).build();
			newTask = true;
			activityType = "createTask";

		} else {
			taskboardTask = taskboardTaskRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(vo.getId(), YorosisContext.get().getTenantId(),
					YorosisConstants.YES);
			oldTaskData = taskboardTask.getTaskData();
			taskboardTask.setTaskData(jsonNode);
			taskboardTask.setTaskType(vo.getTaskType());
			taskboardTask.setModifiedOn(currentTimestamp);
			taskboardTask.setModifiedBy(username);
			taskboardTask.setTaskName(
					StringUtils.equals(taskboardTask.getTaskId(), taskboardTask.getTaskName()) ? getTaskName(vo, taskboard, taskboardTask.getTaskId())
							: vo.getTaskName());
			taskboardTask.setTaskId(vo.getTaskId());
		}

		taskboardTaskRepository.save(taskboardTask);
		taskboardActivityLogService.saveActivityLog(taskboard, taskboardTask, vo, activityType);
		if (newTask) {
			eventAutomationService.handleNewItemsChange(taskboard.getId(), taskboardTask);
		}
		eventAutomationService.handleFieldValueChanges(taskboard.getId(), taskboardTask, oldTaskData);
		return ResponseStringVO.builder().response("Taskboard Task Created Successfully").uuid(taskboardTask.getId()).taskId(taskboardTask.getTaskId()).build();
	}

	private String getTaskName(TaskboardTaskVO vo, Taskboard taskboard, String taskId) {
		return (vo.getTaskData() != null && vo.getTaskData().has(taskboard.getTaskName()) && vo.getTaskData().get(taskboard.getTaskName()) != null
				&& !StringUtils.equals(vo.getTaskData().get(taskboard.getTaskName()).asText(), "null")) ? vo.getTaskData().get(taskboard.getTaskName()).asText()
						: taskId;
	}

	private String getSubStatusInfo(Taskboard taskboard) {
		if (taskboard != null && CollectionUtils.isNotEmpty(taskboard.getTaskboardColumns())) {
			TaskboardColumns taskBoardCols = taskboard.getTaskboardColumns().stream().filter(s -> StringUtils.equalsIgnoreCase(s.getActiveFlag(), "Y"))
					.filter(s -> s.getColumnOrder() == 0L).findFirst().get();
			if (CollectionUtils.isNotEmpty(taskBoardCols.getTaskboardSubStatus())) {
				Optional<TaskboardSubStatus> taskBoardSubStatus = taskBoardCols.getTaskboardSubStatus().stream()
						.filter(s -> StringUtils.equalsIgnoreCase(s.getActiveFlag(), "Y")).filter(s -> s.getColumnOrder() != null && s.getColumnOrder() == 0L)
						.findAny();
				if (taskBoardSubStatus.isPresent()) {
					return taskBoardSubStatus.get().getSubStatusName();
				}
			}
		}
		return null;

	}

	@Transactional
	public ResponseStringVO saveAssignUsers(TaskboardTaskVO taskboardTaskVO) throws JsonProcessingException {
		TaskboardTask taskboardTask = taskboardTaskRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(taskboardTaskVO.getId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);

		if (taskboardTask == null) {
			return ResponseStringVO.builder().response("Invalid Task Id").build();
		}
//		if (taskboardTaskVO.getAssignTaskVO().getRemovedAssigneeList() != null
//				&& !taskboardTaskVO.getAssignTaskVO().getRemovedAssigneeList().isEmpty()) {
//			taskboardActivityLogService.saveActivityLog(taskboardTask.getTaskboard(), taskboardTask, taskboardTaskVO,
//					"removeAssignUser");
//		}
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		List<AssignUserTaskVO> assignUserTaskList = saveAssignTask(taskboardTaskVO.getAssignTaskVO(), timestamp, taskboardTask, getUserName());
		JsonNode jsonNode = mapper.readTree(mapper.writeValueAsString(assignUserTaskList));
		taskboardTask.setModifiedOn(timestamp);
		taskboardTask.setModifiedBy(getUserName());
		taskboardTaskRepository.save(taskboardTask);
		if (taskboardTaskVO.getAssignTaskVO().getAssigneeUserTaskList() != null && !taskboardTaskVO.getAssignTaskVO().getAssigneeUserTaskList().isEmpty()) {
			taskboardActivityLogService.saveActivityLog(taskboardTask.getTaskboard(), taskboardTask, taskboardTaskVO, "addedAssignUser");
		}
		List<UUID> listUserId = assignUserTaskList.stream().map(s -> s.getAssigneeUser()).collect(Collectors.toList());
		UUID loggedInuserId = userRepository.findByUserNameAndTenantId(YorosisContext.get().getUserName(), YorosisContext.get().getTenantId()).getUserId();
		List<UUID> notificationsList = notificationRepository.checkNotificationsForTaskboardAssign(listUserId, loggedInuserId, taskboardTask.getId(),
				YorosisContext.get().getTenantId());
		if (notificationsList != null && !notificationsList.isEmpty()) {
			listUserId = listUserId.stream().filter(f -> !notificationsList.contains(f)).collect(Collectors.toList());
		}
		if (listUserId.isEmpty()) {
			saveTaskAssignedTaskNotifications(taskboardTask, assignUserTaskList, listUserId, loggedInuserId);
			eventAutomationService.handleTaskAssignmentNotification(taskboardTask, assignUserTaskList, listUserId);
			return ResponseStringVO.builder().object(jsonNode).response("Assignee users saved successfully").build();
		}
		return ResponseStringVO.builder().object(jsonNode).response("Assignee users already saved").build();
	}

	private void saveTaskAssignedTaskNotifications(TaskboardTask taskboardTask, List<AssignUserTaskVO> assignUserTaskList, List<UUID> listUserId,
			UUID loggedInuserId) {
//		List<UUID> listUserId = assignUserTaskList.stream().map(s -> s.getAssigneeUser()).collect(Collectors.toList());
//		UUID loggedInuserId = userRepository
//				.findByUserNameAndTenantId(YorosisContext.get().getUserName(), YorosisContext.get().getTenantId())
//				.getUserId();
		for (UUID userId : listUserId) {
			NotificationsVO notificationsVO = NotificationsVO.builder().fromId(loggedInuserId).toId(userId).type("taskboard")
					.message(taskboardTask.getTaskId() + " of " + taskboardTask.getTaskboard().getName()).taskboardId(taskboardTask.getTaskboard().getId())
					.taskboardTaskId(taskboardTask.getId()).build();
			messagingServiceClient.saveNotifications(YorosisContext.get().getToken(), notificationsVO);
		}
	}

	@Transactional
	private List<AssignUserTaskVO> saveAssignTask(AssignTaskVO vo, Timestamp currentTimestamp, TaskboardTask taskboardTask, String username)
			throws JsonProcessingException {
		List<AssignUserTaskVO> assignedUsers = new ArrayList<>();
		removeAssigneeList(vo, taskboardTask);

		if (vo != null && vo.getAssigneeUserTaskList() != null && !vo.getAssigneeUserTaskList().isEmpty()) {
			for (AssignUserTaskVO assignUserTaskVO : vo.getAssigneeUserTaskList()) {
				TaskboardTaskAssignedUsers taskboardTaskAssignedUsers = null;
				if (assignUserTaskVO.getId() == null) {
					taskboardTaskAssignedUsers = TaskboardTaskAssignedUsers.builder().taskboardTask(taskboardTask).userId(assignUserTaskVO.getAssigneeUser())
							.createdBy(username).createdOn(currentTimestamp).modifiedBy(username).modifiedOn(currentTimestamp).activeFlag(YorosisConstants.YES)
							.tenantId(YorosisContext.get().getTenantId()).build();
					taskboardTaskAssignedUsersRepository.save(taskboardTaskAssignedUsers);
					assignedUsers.add(constructAssignUserDtoToVo(taskboardTaskAssignedUsers));
				}
			}
		}
		if (vo != null && vo.getAssigneeGroupTaskList() != null && !vo.getAssigneeGroupTaskList().isEmpty()) {
			for (AssignGroupTaskVO assignGroupTaskVO : vo.getAssigneeGroupTaskList()) {
				TaskboardTaskAssignedUsers taskboardTaskAssignedGroups = null;
				if (assignGroupTaskVO.getId() == null) {
					taskboardTaskAssignedGroups = TaskboardTaskAssignedUsers.builder().taskboardTask(taskboardTask)
							.groupId(assignGroupTaskVO.getAssigneeGroup()).createdBy(username).createdOn(currentTimestamp).modifiedBy(username)
							.modifiedOn(currentTimestamp).activeFlag(YorosisConstants.YES).tenantId(YorosisContext.get().getTenantId()).build();
					taskboardTaskAssignedUsersRepository.save(taskboardTaskAssignedGroups);
				}
			}
		}
		return assignedUsers;
	}

	@Transactional
	public ResponseStringVO saveAssignTask(AssignTaskVO vo) throws JsonProcessingException {
		Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());

		if (vo.getTaskId() != null) {
			TaskboardTask taskboardTask = taskboardTaskRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(vo.getTaskId(),
					YorosisContext.get().getTenantId(), YorosisConstants.YES);
			if (taskboardTask != null) {
				List<AssignUserTaskVO> assignUserTaskList = saveAssignTask(vo, currentTimestamp, taskboardTask, getUserName());
				JsonNode jsonNode = mapper.readTree(mapper.writeValueAsString(assignUserTaskList));
				taskboardTask.setModifiedBy(getUserName());
				taskboardTask.setModifiedOn(currentTimestamp);

				taskboardTaskRepository.save(taskboardTask);
				return ResponseStringVO.builder().object(jsonNode).response("Task Assigned Successfully").build();
			}
		}
		return ResponseStringVO.builder().response("Invalid Task").build();

	}

	@Transactional
	public ResponseStringVO saveSubTasks(TaskboardTaskVO vo) throws JsonProcessingException {
		Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());
		Taskboard taskboard = null;
		TaskboardTask taskboardTask = null;
		if (vo.getTaskboardId() != null) {
			taskboard = taskboardRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(vo.getTaskboardId(), YorosisContext.get().getTenantId(),
					YorosisConstants.YES);
		} else {
			return ResponseStringVO.builder().response("Invalid Taskboard").build();
		}

		if (vo.getId() != null) {
			taskboardTask = taskboardTaskRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(vo.getId(), YorosisContext.get().getTenantId(),
					YorosisConstants.YES);
		} else {
			return ResponseStringVO.builder().response("Invalid Task").build();
		}
		saveSubTasks(vo.getSubTasks(), getUserName(), currentTimestamp, taskboardTask, taskboard);
//		taskboardActivityLogService.saveActivityLog(taskboardTask.getTaskboard(), taskboardTask, vo, "addedSubTask");
		return ResponseStringVO.builder().response("Sub Tasks Added Successfully").build();
	}

	@Transactional
	public ResponseStringVO saveTaskComments(TaskboardTaskVO vo) {
		Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());
		TaskboardTask taskboardTask = null;
		if (vo.getId() != null) {
			taskboardTask = taskboardTaskRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(vo.getId(), YorosisContext.get().getTenantId(),
					YorosisConstants.YES);
		} else {
			return ResponseStringVO.builder().response("Invalid Task").build();
		}

		if (taskboardTask != null && vo.getTaskComments() != null && !vo.getTaskComments().isEmpty()) {
			saveTaskComments(vo.getTaskComments(), getUserName(), currentTimestamp, taskboardTask);
			taskboardTask.setModifiedBy(getUserName());
			taskboardTask.setModifiedOn(currentTimestamp);

			taskboardTaskRepository.save(taskboardTask);
			eventAutomationService.handleCommentChange(taskboardTask.getTaskboard().getId(), taskboardTask);
			return ResponseStringVO.builder().response("Tasks Comments Added Successfully").build();
		}
		return ResponseStringVO.builder().response("Empty Comments").build();
	}

	private String getUserName() {
		String username = null;
		User user = userRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(YorosisContext.get().getUserName(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (user != null) {
			username = user.getFirstName() + " " + user.getLastName();
		}
		return username;
	}

	private UUID getUserId() {
		UUID userId = null;
		User user = userRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(YorosisContext.get().getUserName(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (user != null) {
			userId = user.getUserId();
		}
		return userId;
	}

	@Transactional
	public ResponseStringVO saveDescription(TaskboardTaskVO vo) throws JsonProcessingException {
		Timestamp timeStamp = new Timestamp(System.currentTimeMillis());

		TaskboardTask taskboardTask = taskboardTaskRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(vo.getId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);

		if (taskboardTask == null) {
			return ResponseStringVO.builder().response("Invalid Task Id").build();
		}
		taskboardTask.setDescription(vo.getDescription());
		taskboardTask.setModifiedBy(getUserName());
		taskboardTask.setModifiedOn(timeStamp);

		taskboardTaskRepository.save(taskboardTask);
		taskboardActivityLogService.saveActivityLog(taskboardTask.getTaskboard(), taskboardTask, vo, "addedDescription");
		return ResponseStringVO.builder().response("Description saved successfully").build();
	}

	@Transactional
	private void removeAssigneeList(AssignTaskVO vo, TaskboardTask taskboardTask) throws JsonProcessingException {
		List<UUID> uuidList = new ArrayList<>();
		if (vo != null && vo.getRemovedAssigneeList() != null && !vo.getRemovedAssigneeList().isEmpty()) {
			for (String uuid : vo.getRemovedAssigneeList()) {
				uuidList.add(UUID.fromString(uuid));
			}
			List<TaskboardTaskAssignedUsers> taskboardTaskAssignedUsers = taskboardTaskAssignedUsersRepository.getAssigneeList(uuidList,
					YorosisContext.get().getTenantId(), YorosisConstants.YES);
			taskboardActivityLogService.saveAssignedActivity(taskboardTask.getTaskboard(), taskboardTask, taskboardTaskAssignedUsers, "removeAssignUser");
			taskboardTaskAssignedUsersRepository.deleteAll(taskboardTaskAssignedUsers);
			List<Notifications> notificationsList = notificationRepository.getDeleteUserNotifications(uuidList, vo.getTaskId(),
					YorosisContext.get().getTenantId());
			if (!notificationsList.isEmpty()) {
				notificationRepository.deleteAll(notificationsList);
			}
		}
	}

	@Transactional
	public ResponseStringVO removeSubtask(String id) throws JsonProcessingException {
		TaskboardTask subTask = taskboardTaskRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID.fromString(id),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		subTask.setActiveFlag(YorosisConstants.NO);
		taskboardActivityLogService.saveLabelsActivityForRemove(subTask.getTaskboard(), subTask.getParentTaskId(), subTask.getStatus(), "removedSubTask");
		taskboardTaskRepository.save(subTask);
		return ResponseStringVO.builder().response("Subtask removed successfully").build();
	}

	@Transactional
	public ResponseStringVO saveSubtask(Subtask vo) throws JsonProcessingException {
		UUID savedSubtaskId = null;
		Timestamp timeStamp = new Timestamp(System.currentTimeMillis());
		TaskboardTask task = taskboardTaskRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(vo.getTaskboardTaskId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		List<TaskboardTask> subTaskList = taskboardTaskRepository.getParentTaskIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(vo.getTaskboardTaskId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (task == null) {
			return ResponseStringVO.builder().response("Invalid Task").build();
		}
		if (vo.getId() == null) {
			Taskboard taskboard = taskboardRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(vo.getTaskboardId(),
					YorosisContext.get().getTenantId(), YorosisConstants.YES);

			TaskboardTask subTask = TaskboardTask.builder().taskName(vo.getSubtaskName()).status(vo.getSubtaskStatus()).taskboard(taskboard)
					.parentTaskId(vo.getTaskboardTaskId()).activeFlag(YorosisConstants.YES).tenantId(YorosisContext.get().getTenantId()).createdOn(timeStamp)
					.modifiedOn(timeStamp).createdBy(YorosisContext.get().getUserName()).modifiedBy(YorosisContext.get().getUserName()).taskType("subtask")
					.taskId(vo.getTaskId()).subStatus(vo.getSubStatus()).build();
			if (subTaskList != null && !subTaskList.isEmpty()) {
				subTask.setSequenceNo((long) subTaskList.size() + 1);
			} else {
				subTask.setSequenceNo(0L);
			}
			TaskboardTask saveSubtask = taskboardTaskRepository.save(subTask);
			taskboardActivityLogService.saveSubTaskActivityLog(task.getTaskboard(), task, vo.getSubtaskName(), "addedSubTask");
			savedSubtaskId = saveSubtask.getId();
		} else {
			TaskboardTask subTask = taskboardTaskRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(vo.getId(), YorosisContext.get().getTenantId(),
					YorosisConstants.YES);
			if (!StringUtils.equals(vo.getSubtaskStatus(), subTask.getStatus())) {
				taskboardActivityLogService.saveSubTaskActivityLog(task.getTaskboard(), task, vo.getSubtaskStatus(), "changedSubTaskStatus");
			}
			if (vo.getSubtaskStatus() != null) {
				subTask.setStatus(vo.getSubtaskStatus());
			}
			subTask.setStartDate(vo.getStartDate());
			subTask.setDueDate(vo.getDueDate());
			subTask.setModifiedBy(getUserName());
			subTask.setModifiedOn(timeStamp);
			if (vo.getSubtaskName() != null) {
				subTask.setTaskName(vo.getSubtaskName());
			}
			taskboardTaskRepository.save(subTask);
		}

		task.setModifiedBy(getUserName());
		task.setModifiedOn(timeStamp);

		TaskboardTask taskBoardTask = taskboardTaskRepository.save(task);

		eventAutomationService.handleSubTaskStatusChange(taskBoardTask.getId(), taskBoardTask, vo.getSubtaskStatus());

		return ResponseStringVO.builder().response("Subtask status updated successfully").uuid(savedSubtaskId).build();
	}

	@Transactional
	private void saveSubTasks(List<SubTaskVO> subTasks, String username, Timestamp currentTimestamp, TaskboardTask taskboardTask, Taskboard taskboard) {
		if (subTasks != null && !subTasks.isEmpty() && taskboard != null && taskboardTask != null) {
			for (SubTaskVO subTaskVO : subTasks) {
				TaskboardTask subTaskboardTask = taskboardTaskRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(subTaskVO.getId(),
						YorosisContext.get().getTenantId(), YorosisConstants.YES);
				if (subTaskVO.getId() == null) {
					subTaskboardTask = TaskboardTask.builder().startDate(subTaskVO.getStartDate()).dueDate(subTaskVO.getDueDate()).status(subTaskVO.getStatus())
							.createdBy(username).createdOn(currentTimestamp).modifiedBy(username).modifiedOn(currentTimestamp).activeFlag(YorosisConstants.YES)
							.taskboard(taskboard).taskType(subTaskVO.getTaskType()).tenantId(YorosisContext.get().getTenantId())
							.parentTaskId(taskboardTask.getId()).taskName(subTaskVO.getTaskName()).sequenceNo((long) (subTasks.size() - 1)).build();
				} else {
					subTaskboardTask.setStartDate(subTaskVO.getStartDate());
					subTaskboardTask.setDueDate(subTaskVO.getDueDate());
					subTaskboardTask.setTaskName(subTaskVO.getTaskName());
					subTaskboardTask.setStatus(subTaskVO.getStatus());
					subTaskboardTask.setModifiedOn(currentTimestamp);
					subTaskboardTask.setModifiedBy(username);
				}
				taskboardTaskRepository.save(subTaskboardTask);
			}
			taskboardTask.setModifiedBy(getUserName());
			taskboardTask.setModifiedOn(currentTimestamp);

			taskboardTaskRepository.save(taskboardTask);
		}
	}

	@Transactional
	private void saveTaskComments(List<TaskCommentsVO> taskCommentsList, String username, Timestamp currentTimestamp, TaskboardTask taskboardTask) {
		if (taskCommentsList != null && !taskCommentsList.isEmpty()) {
			for (TaskCommentsVO comments : taskCommentsList) {
				TaskboardTaskComments taskComments = null;
				PolicyFactory policy = Sanitizers.FORMATTING.and(Sanitizers.LINKS).and(Sanitizers.BLOCKS).and(IMAGES).and(Sanitizers.STYLES)
						.and(Sanitizers.TABLES).and(Sanitizers.FORMATTING);
				String safeHTML = policy.sanitize(comments.getComments());
				if (comments.getId() == null) {
					taskComments = TaskboardTaskComments.builder().comment(safeHTML).taskboardTask(taskboardTask).createdBy(comments.getCreatedBy())
							.createdOn(currentTimestamp).modifiedBy(username).modifiedOn(currentTimestamp).tenantId(YorosisContext.get().getTenantId())
							.activeFlag(YorosisConstants.YES).build();
				} else {
					taskComments = taskboardTaskCommentsRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(comments.getId(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES);
					taskComments.setComment(safeHTML);
					taskComments.setModifiedBy(username);
					taskComments.setModifiedOn(currentTimestamp);
				}
				taskboardTaskCommentsRepository.save(taskComments);
			}
		}
	}

	@Transactional
	public TaskboardTaskVO getTaskboardTaskDetails(UUID taskboardTaskId, UUID sprintId) throws IOException {
		TaskboardTask taskboardTask = taskboardTaskRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(taskboardTaskId,
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		TaskboardTaskVO taskVO = contructTaskboardTaskDtoToVo(taskboardTask, null);
		if (sprintId != null) {
			taskboardSprintService.getRemainingHours(taskVO, sprintId);
		}
		List<TaskboardTaskDependencies> taskDependenciesForWaiting = taskboardTaskDependenciesRepository.getTaskDependenciesForWaiting(taskVO.getId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskDependenciesForWaiting != null && !taskDependenciesForWaiting.isEmpty()) {
			taskVO.getTaskDependenciesVO().setBlocking(constructEntityToVOForBlocking(taskDependenciesForWaiting, taskboardTask));
		}
		List<TaskboardTaskDependencies> taskDependenciesForBlocking = taskboardTaskDependenciesRepository.getTaskDependenciesForBlocking(taskVO.getId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskDependenciesForBlocking != null && !taskDependenciesForBlocking.isEmpty()) {
			taskVO.getTaskDependenciesVO().setWaitingOn(constructEntityToVOForWaitingOn(taskDependenciesForBlocking, taskboardTask));
		}
		List<TaskboardTaskDependencies> taskDependenciesForRelatedTask = taskboardTaskDependenciesRepository.getTaskDependenciesForRelatedTask(taskVO.getId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskDependenciesForRelatedTask != null && !taskDependenciesForRelatedTask.isEmpty()) {
			taskVO.getTaskDependenciesVO().setRelatedTasks(constructEntityToVOForRelatedTask(taskDependenciesForRelatedTask, taskboardTask));
		}
		return taskVO;
	}

	@Transactional
	public TaskboardTaskVO checkWaitingOn(UUID taskboardTaskId) throws IOException {
		TaskboardTask taskboardTask = taskboardTaskRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(taskboardTaskId,
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		TaskboardTaskVO taskVO = contructTaskboardTaskDtoToVo(taskboardTask, null);
		String status = taskboardColumnsRepository.getDoneColumnForWaitingOn(YorosisContext.get().getTenantId(), YorosisConstants.YES,
				taskboardTask.getTaskboard().getId());
		List<TaskboardTaskDependencies> taskDependenciesForBlocking = taskboardTaskDependenciesRepository.getTaskDependenciesForBlocking(taskVO.getId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (!checkSubTask(taskboardTask, status, taskVO)) {
			taskVO.setSubTaskLength(0);
			if (taskDependenciesForBlocking != null && !taskDependenciesForBlocking.isEmpty()) {
				taskVO.getTaskDependenciesVO().setWaitingOn(constructEntityToVOForWaitingOn(taskDependenciesForBlocking, taskboardTask));
			}
			if (taskVO.getTaskDependenciesVO().getWaitingOn() != null && !taskVO.getTaskDependenciesVO().getWaitingOn().isEmpty()) {
				taskVO.getTaskDependenciesVO().setWaitingOn(taskVO.getTaskDependenciesVO().getWaitingOn().stream()
						.filter(f -> StringUtils.isNotEmpty(status) && !StringUtils.equals(status, f.getStatus())).collect(Collectors.toList()));
			}
		}
		return taskVO;
	}

	private boolean checkSubTask(TaskboardTask taskboardTask, String status, TaskboardTaskVO taskVO) {
		if (taskboardTask != null && !taskVO.getSubTasks().isEmpty()) {
			List<SubTaskVO> subTasks = taskVO.getSubTasks().stream().filter(s -> !StringUtils.equals(s.getStatus(), "Done")).collect(Collectors.toList());
			taskVO.setSubTasks(subTasks);
			if (subTasks != null && !subTasks.isEmpty()) {
				taskVO.setSubTaskLength(subTasks.size());
				return true;
			}
		}
		return false;
	}

	private List<TaskboardTaskVO> constructEntityToVOForBlocking(List<TaskboardTaskDependencies> taskboardTaskDependencies, TaskboardTask taskBoardTask) {
		List<TaskboardTaskVO> taskList = new ArrayList<>();
		taskboardTaskDependencies.stream().forEach(d -> taskList.add(TaskboardTaskVO.builder().id(d.getTaskboardTask().getId())
				.taskId(d.getTaskboardTask().getTaskId()).dependencyId(d.getId()).status(d.getTaskboardTask().getStatus()).build()));
		taskBoardTask.getTaskboardTaskDependencies().stream().forEach(d -> {
			if (d.getBlocking() != null && StringUtils.equals(d.getActiveFlag(), YorosisConstants.YES)) {
				taskList.add(TaskboardTaskVO.builder().id(d.getBlocking().getId()).taskId(d.getBlocking().getTaskId()).dependencyId(d.getId())
						.taskName(d.getBlocking().getTaskName()).startDate(d.getBlocking().getStartDate()).dueDate(d.getBlocking().getDueDate())
						.status(d.getBlocking().getStatus()).build());
			}
		});
		return taskList;
	}

	private List<TaskboardTaskVO> constructEntityToVOForWaitingOn(List<TaskboardTaskDependencies> taskboardTaskDependencies, TaskboardTask taskBoardTask) {
		List<TaskboardTaskVO> taskList = new ArrayList<>();
		taskboardTaskDependencies.stream().forEach(d -> taskList.add(TaskboardTaskVO.builder().id(d.getTaskboardTask().getId())
				.taskId(d.getTaskboardTask().getTaskId()).dependencyId(d.getId()).status(d.getTaskboardTask().getStatus()).build()));
		taskBoardTask.getTaskboardTaskDependencies().stream().forEach(d -> {
			if (d.getWaitingOn() != null && StringUtils.equals(d.getActiveFlag(), YorosisConstants.YES)) {
				taskList.add(TaskboardTaskVO.builder().id(d.getWaitingOn().getId()).taskId(d.getWaitingOn().getTaskId()).dependencyId(d.getId())
						.taskName(d.getWaitingOn().getTaskName()).startDate(d.getWaitingOn().getStartDate()).dueDate(d.getWaitingOn().getDueDate())
						.status(d.getWaitingOn().getStatus()).build());
			}
		});
		return taskList;
	}

	private List<TaskboardTaskVO> constructEntityToVOForRelatedTask(List<TaskboardTaskDependencies> taskboardTaskDependencies, TaskboardTask taskBoardTask) {
		List<TaskboardTaskVO> taskList = new ArrayList<>();
		taskboardTaskDependencies.stream().forEach(d -> taskList.add(TaskboardTaskVO.builder().id(d.getTaskboardTask().getId())
				.taskId(d.getTaskboardTask().getTaskId()).dependencyId(d.getId()).status(d.getTaskboardTask().getStatus()).build()));
		taskBoardTask.getTaskboardTaskDependencies().stream().forEach(d -> {
			if (d.getRelatedTask() != null && StringUtils.equals(d.getActiveFlag(), YorosisConstants.YES)) {
				taskList.add(TaskboardTaskVO.builder().id(d.getRelatedTask().getId()).taskId(d.getRelatedTask().getTaskId())
						.taskName(d.getRelatedTask().getTaskName()).dependencyId(d.getId()).startDate(d.getRelatedTask().getStartDate())
						.dueDate(d.getRelatedTask().getDueDate()).status(d.getRelatedTask().getStatus()).build());
			}
		});
		return taskList;
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public TaskboardTaskVO getTaskboardTask(String taskboardKey, String taskId) throws IOException {
		TaskboardTaskVO taskVO = TaskboardTaskVO.builder().build();
		Taskboard taskboard = taskboardRepository.findByTaskboardKeyAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(taskboardKey,
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskboard != null) {
			List<TaskboardTask> task = taskboard.getTaskboardTask().stream().filter(t -> StringUtils.equals(t.getTaskId(), taskId))
					.collect(Collectors.toList());
			if (task != null && !task.isEmpty()) {
				taskVO = contructTaskboardTaskDtoToVo(task.get(0), null);
			}
		}
		return taskVO;
	}

	@Transactional
	public ResponseStringVO checkTaskboardName(String taskboardName) {
		List<Taskboard> taskboard = taskboardRepository.findByNameAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(taskboardName,
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskboard != null && !taskboard.isEmpty()) {
			return ResponseStringVO.builder().response("Taskboard Name already exist").build();
		}
		return ResponseStringVO.builder().response("New Name").build();
	}

	@Transactional
	public ResponseStringVO checkTaskboardKey(String taskboardKey) {
		Taskboard taskboard = taskboardRepository.findByTaskboardKeyAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(taskboardKey,
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskboard != null) {
			return ResponseStringVO.builder().response("Taskboard Key already exist").build();
		}
		return ResponseStringVO.builder().response("New Key").build();
	}

	@Transactional
	public ResponseStringVO saveTaskboardLabels(TaskboardLabelsVO vo) {
		Taskboard taskboard = taskboardRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(vo.getTaskboardId(), YorosisContext.get().getTenantId(),
				YorosisConstants.YES);

		taskboardRepository.save(taskboard);
		return ResponseStringVO.builder().response("Taskboard Labels Created Successfully").build();
	}

	public byte[] getFile(UUID id) throws IOException {
		TaskboardTaskFiles taskboardTaskFiles = taskboardTaskFilesRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(id,
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskboardTaskFiles != null) {
			return fileManagerService.downloadFile(taskboardTaskFiles.getFilePath());
		}

		return null;
	}

	public ResponseStringVO deleteFile(FilesVO filesVO) {
		TaskboardTaskFiles taskboardTaskFiles = taskboardTaskFilesRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(filesVO.getId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);

		if (taskboardTaskFiles != null) {
			fileManagerService.deleteFile(taskboardTaskFiles.getFilePath());
			taskboardTaskFiles.setActiveFlag(YorosisConstants.NO);
			taskboardTaskFilesRepository.save(taskboardTaskFiles);
			return ResponseStringVO.builder().response(String.format("File %s Removed Successfully", taskboardTaskFiles.getFileName())).build();
		}
		return ResponseStringVO.builder().response("Invalid file").build();
	}

	public ResponseStringVO saveAttachments(String taskId, String name, MultipartFile file) throws IOException, YoroFlowException {
		Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());
		TaskboardTask taskboardTask = taskboardTaskRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID.fromString(taskId),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);

		if (taskboardTask != null) {
			if (WorkflowUtils.checkFileTypes(file.getOriginalFilename())) {
				String fileKey = new StringBuilder("task-attachments/").append(taskId).append(LocalTime.now()).toString();
				FileUploadVO fileUploadVO = FileUploadVO.builder().key(fileKey).contentSize(file.getSize()).inputStream(file.getBytes())
						.contentType(file.getContentType()).build();
				fileManagerService.saveUploadFile(fileUploadVO);

				TaskboardTaskFiles taskboardTaskFiles = TaskboardTaskFiles.builder().fileType(fileUploadVO.getContentType()).filePath(fileKey)
						.taskboardTask(taskboardTask).createdBy(YorosisContext.get().getUserName()).createdOn(currentTimestamp)
						.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(currentTimestamp).activeFlag(YorosisConstants.YES)
						.tenantId(YorosisContext.get().getTenantId()).fileName(name).build();

				taskboardTaskFilesRepository.save(taskboardTaskFiles);

				taskboardTask.setModifiedBy(getUserName());
				taskboardTask.setModifiedOn(currentTimestamp);

				taskboardTaskRepository.save(taskboardTask);
				taskboardActivityLogService.saveAttachmentsActivity(taskboardTask.getTaskboard(), taskboardTask, name, "addedAttachment");
				return ResponseStringVO.builder().response("File Uploaded Successfully").build();
			} else {
				return ResponseStringVO.builder().response("Executable files are not allowed").build();
			}
		}
		return ResponseStringVO.builder().response("Invalid file").build();
	}

	private TaskboardSecurity constructTaskboardSecurityVOToDTO(SecurityListVO securityListVO) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());

		return TaskboardSecurity.builder().tenantId(YorosisContext.get().getTenantId()).read(booleanToChar(securityListVO.getReadAllowed()))
				.update(booleanToChar(securityListVO.getUpdateAllowed())).delete(booleanToChar(securityListVO.getDeleteAllowed())).createdOn(timestamp)
				.activeFlag(YorosisConstants.YES).createdBy(YorosisContext.get().getUserName()).modifiedBy(YorosisContext.get().getUserName())
				.launch(booleanToChar(true)).modifiedOn(timestamp).build();
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

	private TaskboardColumnsSecurity constructTaskboardColumnsSecurityVOToDTO(SecurityListVO columnsSecurityListVO) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());

		return TaskboardColumnsSecurity.builder().tenantId(YorosisContext.get().getTenantId()).read(booleanToChar(columnsSecurityListVO.getReadAllowed()))
				.update(booleanToChar(columnsSecurityListVO.getUpdateAllowed())).createdOn(timestamp).activeFlag(YorosisConstants.YES)
				.createdBy(YorosisContext.get().getUserName()).delete(booleanToChar(columnsSecurityListVO.getDeleteAllowed())).launch(booleanToChar(true))
				.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp).build();
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

	private String booleanToChar(boolean value) {
		return value ? YorosisConstants.YES : YorosisConstants.NO;
	}

	private boolean charToBoolean(String value) {
		return StringUtils.equalsIgnoreCase(YorosisConstants.YES, value);
	}

	public ResponseStringVO saveTaskboardSecurity(TaskboardSecurityVO vo) {
		TaskboardSecurity security = null;
		TaskboardColumnsSecurity taskboardColumnsSecurity = null;

		Taskboard taskboard = taskboardRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(vo.getTaskboardId(), YorosisContext.get().getTenantId(),
				YorosisConstants.YES);

		if (taskboard == null) {
			return ResponseStringVO.builder().response("Invalid Taskboard").build();
		}

		if (vo.getDeletedIDList() != null && !vo.getDeletedIDList().isEmpty()) {
			for (String id : vo.getDeletedIDList()) {
				security = taskboardSecurityRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID.fromString(id),
						YorosisContext.get().getTenantId(), YorosisConstants.YES);
				if (security != null) {
					security.setActiveFlag(YorosisConstants.NO);
					taskboardSecurityRepository.save(security);
				}
			}
		}

		if (vo.getDeletedColumnsIDList() != null && !vo.getDeletedColumnsIDList().isEmpty()) {
			for (String id : vo.getDeletedColumnsIDList()) {
				taskboardColumnsSecurity = taskboardColumnsSecurityRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID.fromString(id),
						YorosisContext.get().getTenantId(), YorosisConstants.YES);
				if (taskboardColumnsSecurity != null) {
					taskboardColumnsSecurity.setActiveFlag(YorosisConstants.NO);
					taskboardColumnsSecurityRepository.save(taskboardColumnsSecurity);
				}
			}
		}
		for (SecurityListVO securityListVO : vo.getSecurityList()) {
			Group group = groupRepository.findByGroupNameAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(securityListVO.getGroupId(),
					YorosisContext.get().getTenantId(), YorosisConstants.YES);
			if (group != null) {
				List<TaskboardSecurity> taskboardSecurityList = taskboardSecurityRepository.getTaskboardSecurityList(taskboard.getId(), group.getGroupId(),
						YorosisContext.get().getTenantId(), YorosisConstants.YES);
				if (securityListVO.getId() == null) {
					if (taskboardSecurityList == null || taskboardSecurityList.isEmpty()) {
						security = constructTaskboardSecurityVOToDTO(securityListVO);
						security.setGroupId(group.getGroupId());
						security.setTaskboard(taskboard);
						taskboardSecurityRepository.save(security);
					}
				} else {
					security = taskboardSecurityRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(securityListVO.getId(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES);
					if (security != null) {
						security.setGroupId(group.getGroupId());
						security.setRead(booleanToChar(securityListVO.getReadAllowed()));
						security.setDelete(booleanToChar(securityListVO.getDeleteAllowed()));
						security.setUpdate(booleanToChar(securityListVO.getUpdateAllowed()));
						taskboardSecurityRepository.save(security);
					}
				}
			}
		}

		if (vo.getTaskboardOwner() != null && !vo.getTaskboardOwner().isEmpty()) {
			for (UUID uuid : vo.getTaskboardOwner()) {
				Timestamp timestamp = new Timestamp(System.currentTimeMillis());
				List<TaskboardSecurity> securityList = taskboardSecurityRepository.getTaskboardSecurityListByUser(vo.getTaskboardId(), uuid,
						YorosisContext.get().getTenantId(), YorosisConstants.YES);
				if (securityList == null || securityList.isEmpty()) {
					security = TaskboardSecurity.builder().read(booleanToChar(true)).update(booleanToChar(true)).delete(booleanToChar(true))
							.createdOn(timestamp).activeFlag(YorosisConstants.YES).createdBy(YorosisContext.get().getUserName())
							.modifiedBy(YorosisContext.get().getUserName()).launch(booleanToChar(true)).modifiedOn(timestamp).taskboard(taskboard)
							.tenantId(YorosisContext.get().getTenantId()).userId(uuid).build();
					taskboardSecurityRepository.save(security);
				}
			}
		}

		if (vo.getColumnSecurityList() != null && !vo.getColumnSecurityList().isEmpty()) {
			for (TaskboardColumnSecurityListVO taskboardColumnSecurityListVO : vo.getColumnSecurityList()) {
				if (taskboardColumnSecurityListVO != null && !taskboardColumnSecurityListVO.getColumnPermissions().isEmpty()) {
					for (SecurityListVO columnSecurityListVO : taskboardColumnSecurityListVO.getColumnPermissions()) {
						TaskboardColumns taskboardColumns = taskboardColumnsRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
								taskboardColumnSecurityListVO.getColumnId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
						Group group = groupRepository.findByGroupNameAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(columnSecurityListVO.getGroupId(),
								YorosisContext.get().getTenantId(), YorosisConstants.YES);
						if (taskboardColumns != null && group != null) {
							List<TaskboardColumnsSecurity> taskboardColumnSecurityWithGroupIdList = taskboardColumnsSecurityRepository
									.getTaskboardColumnSecurityWithGroupId(taskboardColumns.getId(), group.getGroupId(), YorosisContext.get().getTenantId(),
											YorosisConstants.YES);
							if (columnSecurityListVO.getId() == null) {
								if (taskboardColumnSecurityWithGroupIdList == null || taskboardColumnSecurityWithGroupIdList.isEmpty()) {
									taskboardColumnsSecurity = constructTaskboardColumnsSecurityVOToDTO(columnSecurityListVO);
									taskboardColumnsSecurity.setGroupId(group.getGroupId());
									taskboardColumnsSecurity.setTaskboardColumns(taskboardColumns);
									taskboardColumnsSecurityRepository.save(taskboardColumnsSecurity);
								}
							} else {
								taskboardColumnsSecurity = taskboardColumnsSecurityRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
										columnSecurityListVO.getId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);

								if (taskboardColumnsSecurity != null) {
									taskboardColumnsSecurity.setGroupId(group.getGroupId());
									taskboardColumnsSecurity.setRead(booleanToChar(columnSecurityListVO.getReadAllowed()));
									taskboardColumnsSecurity.setDelete(booleanToChar(columnSecurityListVO.getDeleteAllowed()));
									taskboardColumnsSecurity.setUpdate(booleanToChar(columnSecurityListVO.getUpdateAllowed()));
									taskboardColumnsSecurityRepository.save(taskboardColumnsSecurity);
								}
							}
						}
					}
				}
			}
		}
		return ResponseStringVO.builder().response("Security Created Successfully").build();
	}

	@Transactional
	public ResponseStringVO replaceColumnName(ReplaceColumnVO replaceColumnVO) {
		TaskboardColumns taskboardColumns = taskboardColumnsRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(replaceColumnVO.getColumnId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskboardColumns != null) {
			taskboardColumns.setColumnName(replaceColumnVO.getNewColumnName());
			taskboardColumnsRepository.save(taskboardColumns);
		}

		List<TaskboardTask> taskboardTaskList = taskboardTaskRepository.getTaskboardTasksByStatus(replaceColumnVO.getTaskboardId(),
				replaceColumnVO.getOldColumnName(), YorosisContext.get().getTenantId(), YorosisConstants.YES);

		if (taskboardTaskList != null && !taskboardTaskList.isEmpty()) {
			for (TaskboardTask taskboardTask : taskboardTaskList) {
				if (StringUtils.equals(taskboardTask.getActiveFlag(), YorosisConstants.YES)) {
					taskboardTask.setStatus(replaceColumnVO.getNewColumnName());
					taskboardTaskRepository.save(taskboardTask);
				}
			}
		}
		return ResponseStringVO.builder().response("column Name Replaced Successfully").build();
	}

	@Transactional
	public TaskboardSecurityVO getTaskboardSecurity(String taskboardId) {
		Taskboard taskboard = taskboardRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID.fromString(taskboardId),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		TaskboardSecurityVO taskboardSecurityVO = null;
		List<SecurityListVO> securityListVO = null;
		List<UUID> taskboardOwnerList = null;
		List<TaskboardColumnSecurityListVO> columnSecurityList = new ArrayList<>();

		if (taskboard != null) {
			if (taskboard.getTaskboardSecurity() != null && !taskboard.getTaskboardSecurity().isEmpty()) {
				securityListVO = taskboard.getTaskboardSecurity().stream()
						.filter(security -> StringUtils.equals(security.getActiveFlag(), YorosisConstants.YES) && security.getGroupId() != null)
						.map(this::constructTaskboardSecurityDTOToVO).collect(Collectors.toList());

				taskboardOwnerList = taskboard.getTaskboardSecurity().stream()
						.filter(security -> StringUtils.equals(security.getActiveFlag(), YorosisConstants.YES) && security.getGroupId() == null)
						.map(t -> t.getUserId()).collect(Collectors.toList());
			}

			Collections.sort(taskboard.getTaskboardColumns(), Taskboard.DisplayOrderComparator);
			if (taskboard.getTaskboardColumns() != null && !taskboard.getTaskboardColumns().isEmpty()) {
				for (TaskboardColumns columns : taskboard.getTaskboardColumns()) {
					if (columns != null && columns.getTaskboardColumnsSecurity() != null && !columns.getTaskboardColumnsSecurity().isEmpty()) {
						List<SecurityListVO> columnPermissionsList = new ArrayList<>();
						for (TaskboardColumnsSecurity columnSecurity : columns.getTaskboardColumnsSecurity()) {
							if (StringUtils.equals(columnSecurity.getActiveFlag(), YorosisConstants.YES)) {
								columnPermissionsList.add(constructTaskboardColumnsSecurityDTOToVO(columnSecurity));
							}
						}
						columnSecurityList
								.add(TaskboardColumnSecurityListVO.builder().columnId(columns.getId()).columnPermissions(columnPermissionsList).build());
					}
				}
			}

			taskboardSecurityVO = TaskboardSecurityVO.builder().taskboardId(taskboard.getId()).securityList(securityListVO)
					.columnSecurityList(columnSecurityList).build();

			User user = userRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(YorosisContext.get().getUserName(),
					YorosisContext.get().getTenantId(), YorosisConstants.YES);

			if (taskboardOwnerList != null && !taskboardOwnerList.isEmpty()) {
				taskboardSecurityVO.setTaskboardOwner(taskboardOwnerList);
				if (taskboardOwnerList.contains(user.getUserId())) {
					taskboardSecurityVO.setIsTaskBoardOwner(true);
				} else {
					taskboardSecurityVO.setIsTaskBoardOwner(false);
				}
			}
			return taskboardSecurityVO;
		}

		return TaskboardSecurityVO.builder().build();
	}

	@Transactional
	public List<String> getOwnerNameList(String taskboardId) {
		Taskboard taskboard = taskboardRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID.fromString(taskboardId),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);

		List<UUID> taskboardOwnerList = null;
		String userName = "";
		List<String> ownerNameList = new ArrayList<>();

		if (taskboard != null) {
			if (taskboard.getTaskboardSecurity() != null && !taskboard.getTaskboardSecurity().isEmpty()) {
				taskboardOwnerList = taskboard.getTaskboardSecurity().stream()
						.filter(security -> StringUtils.equals(security.getActiveFlag(), YorosisConstants.YES) && security.getGroupId() == null)
						.map(t -> t.getUserId()).collect(Collectors.toList());
				if (taskboardOwnerList != null && !taskboardOwnerList.isEmpty()) {
					for (UUID userId : taskboardOwnerList) {
						UsersVO userVo = userService.getUserInfo(userId, YorosisContext.get().getTenantId());
						userName = userVo.getFirstName() + " " + userVo.getLastName();
						ownerNameList.add(userName);
					}
				}
			}
		}
		return ownerNameList;
	}

	@Transactional
	public List<UUID> getOwnerIdList(String taskboardId) {
		Taskboard taskboard = taskboardRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID.fromString(taskboardId),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);

		List<UUID> taskboardOwnerList = null;

		if (taskboard != null && taskboard.getTaskboardSecurity() != null && !taskboard.getTaskboardSecurity().isEmpty()) {
			taskboardOwnerList = taskboard.getTaskboardSecurity().stream()
					.filter(security -> StringUtils.equals(security.getActiveFlag(), YorosisConstants.YES) && security.getGroupId() == null)
					.map(t -> t.getUserId()).collect(Collectors.toList());

		}
		return taskboardOwnerList;
	}

	public ResponseStringVO saveTaskboardOwners(TaskboardSecurityVO vo) {
		TaskboardSecurity security = null;
		Taskboard taskboard = taskboardRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(vo.getTaskboardId(), YorosisContext.get().getTenantId(),
				YorosisConstants.YES);

		if (!vo.getDeletedOwnerIdList().isEmpty()) {
			for (String id : vo.getDeletedOwnerIdList()) {
				security = taskboardSecurityRepository.findByIdAndUserIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(vo.getTaskboardId(), UUID.fromString(id),
						YorosisContext.get().getTenantId(), YorosisConstants.YES);
				security.setActiveFlag(YorosisConstants.NO);
				taskboardSecurityRepository.save(security);
			}
		}

		if (vo.getTaskboardOwner() != null && !vo.getTaskboardOwner().isEmpty()) {
			for (UUID uuid : vo.getTaskboardOwner()) {
				Timestamp timestamp = new Timestamp(System.currentTimeMillis());
				security = taskboardSecurityRepository.findByIdAndUserIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(vo.getTaskboardId(), uuid,
						YorosisContext.get().getTenantId(), YorosisConstants.YES);
				if (security == null) {
					security = TaskboardSecurity.builder().read(booleanToChar(true)).update(booleanToChar(true)).delete(booleanToChar(true))
							.createdOn(timestamp).activeFlag(YorosisConstants.YES).createdBy(YorosisContext.get().getUserName())
							.modifiedBy(YorosisContext.get().getUserName()).launch(booleanToChar(true)).modifiedOn(timestamp).taskboard(taskboard)
							.tenantId(YorosisContext.get().getTenantId()).userId(uuid).build();
					taskboardSecurityRepository.save(security);
				}
			}
		}
		return ResponseStringVO.builder().response("Taskboard Owners Created Successfully").build();
	}

	public ResponseStringVO updateColumnColor(TaskboardColumnsVO taskboardColumnsVO) {
		TaskboardColumns taskboardColumns = taskboardColumnsRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(taskboardColumnsVO.getId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);

		if (taskboardColumns != null) {
			taskboardColumns.setColumnColor(taskboardColumnsVO.getColumnColor());
			taskboardColumns.setIsColumnBackground(booleanToChar(taskboardColumnsVO.getIsColumnBackground()));
			taskboardColumnsRepository.save(taskboardColumns);
		}
		return ResponseStringVO.builder().response("Color Updated Successfully").build();
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

	public ResponseStringVO saveTaskboardColumnSecurity(TaskboardSecurityVO vo) {
		TaskboardColumnsSecurity taskboardColumnsSecurity = null;

		if (vo.getDeletedColumnsIDList() != null && !vo.getDeletedColumnsIDList().isEmpty()) {
			for (String id : vo.getDeletedColumnsIDList()) {
				taskboardColumnsSecurity = taskboardColumnsSecurityRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID.fromString(id),
						YorosisContext.get().getTenantId(), YorosisConstants.YES);
				taskboardColumnsSecurity.setActiveFlag(YorosisConstants.NO);
				taskboardColumnsSecurityRepository.save(taskboardColumnsSecurity);
			}
		}

		if (vo.getColumnSecurityList() != null && !vo.getColumnSecurityList().isEmpty()) {
			for (TaskboardColumnSecurityListVO taskboardColumnSecurityListVO : vo.getColumnSecurityList()) {
				if (taskboardColumnSecurityListVO != null && !taskboardColumnSecurityListVO.getColumnPermissions().isEmpty()) {
					for (SecurityListVO columnSecurityListVO : taskboardColumnSecurityListVO.getColumnPermissions()) {
						TaskboardColumns taskboardColumns = taskboardColumnsRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
								taskboardColumnSecurityListVO.getColumnId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
						Group group = groupRepository.findByGroupNameAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(columnSecurityListVO.getGroupId(),
								YorosisContext.get().getTenantId(), YorosisConstants.YES);
						if (taskboardColumns != null && group != null) {
							List<TaskboardColumnsSecurity> taskboardColumnSecurityWithGroupIdList = taskboardColumnsSecurityRepository
									.getTaskboardColumnSecurityWithGroupId(taskboardColumns.getId(), group.getGroupId(), YorosisContext.get().getTenantId(),
											YorosisConstants.YES);
							if (columnSecurityListVO.getId() == null) {
								if (taskboardColumnSecurityWithGroupIdList == null || taskboardColumnSecurityWithGroupIdList.isEmpty()) {
									taskboardColumnsSecurity = constructTaskboardColumnsSecurityVOToDTO(columnSecurityListVO);
									taskboardColumnsSecurity.setGroupId(group.getGroupId());
									taskboardColumnsSecurity.setTaskboardColumns(taskboardColumns);
									taskboardColumnsSecurityRepository.save(taskboardColumnsSecurity);
								}
							} else {
								taskboardColumnsSecurity = taskboardColumnsSecurityRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
										columnSecurityListVO.getId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);

								taskboardColumnsSecurity.setGroupId(group.getGroupId());
								taskboardColumnsSecurity.setRead(booleanToChar(columnSecurityListVO.getReadAllowed()));
								taskboardColumnsSecurity.setDelete(booleanToChar(columnSecurityListVO.getDeleteAllowed()));
								taskboardColumnsSecurity.setUpdate(booleanToChar(columnSecurityListVO.getUpdateAllowed()));
								taskboardColumnsSecurityRepository.save(taskboardColumnsSecurity);
							}

						} else {
							return ResponseStringVO.builder().response("Invalid Column Id").build();
						}
					}
					return ResponseStringVO.builder().response("Security Created Successfully").build();
				}
			}
		}
		return null;
	}

	@Transactional
	public ResponseStringVO saveTaskboardLabel(TaskboardLabelsVO taskboardLabelsVO) {
		Taskboard taskboard = taskboardRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(taskboardLabelsVO.getTaskboardId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskboard != null && taskboardLabelsVO.getLabels() != null && !taskboardLabelsVO.getLabels().isEmpty()) {
			Timestamp timestamp = new Timestamp(System.currentTimeMillis());
			TaskboardLabels taskboardLabels = TaskboardLabels.builder().taskboard(taskboard).labelName(taskboardLabelsVO.getLabels().get(0).getLabelName())
					.labelColor(taskboardLabelsVO.getLabels().get(0).getLabelcolor()).createdOn(timestamp).modifiedOn(timestamp).createdBy(getUserName())
					.modifiedBy(getUserName()).tenantId(YorosisContext.get().getTenantId()).activeFlag(YorosisConstants.YES).build();
			TaskboardLabels taskboardLabel = taskboardLabelsRepository.save(taskboardLabels);
			return ResponseStringVO.builder().response("Taskboard Label Saved Successfully").uuid(taskboardLabel.getId()).build();
		}
		return ResponseStringVO.builder().response("Invalid taskboard Id").build();
	}

	@Transactional
	public ResponseStringVO saveTaskboardTaskLabel(TaskboardTaskLabelVO taskboardTaskLabelVO) throws JsonMappingException, JsonProcessingException {
		Set<String> newLabelsSet = new HashSet<>();
		Set<String> existingLabelsSet = new HashSet<>();
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		List<TaskboardTaskLabels> taskboardTaskLabelsList = new ArrayList<>();
		TaskboardTask taskboardTask = taskboardTaskRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(taskboardTaskLabelVO.getId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskboardTask == null) {
			return ResponseStringVO.builder().response("Invalid Task Id").build();
		}
		for (LabelVO label : taskboardTaskLabelVO.getLabels()) {
			if (label.getTaskboardTaskLabelId() == null) {
				TaskboardLabels taskboardLabels = taskboardLabelsRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(label.getTaskboardLabelId(),
						YorosisContext.get().getTenantId(), YorosisConstants.YES);
				TaskboardTaskLabels taskboardTaskLabels = TaskboardTaskLabels.builder().taskboardTask(taskboardTask).labelName(label.getLabelName())
						.taskboardLabels(taskboardLabels).createdOn(timestamp).modifiedOn(timestamp).createdBy(getUserName()).modifiedBy(getUserName())
						.tenantId(YorosisContext.get().getTenantId()).activeFlag(YorosisConstants.YES).build();
				taskboardTaskLabelsList.add(taskboardTaskLabels);

				if (StringUtils.isNotBlank(label.getLabelName())) {
					newLabelsSet.add(label.getLabelName().trim().toLowerCase());
				}
			} else {
				TaskboardTaskLabels taskboardTaskLabels = taskboardTaskLabelsRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
						label.getTaskboardTaskLabelId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
				taskboardTaskLabels.setActiveFlag(YorosisConstants.YES);
				taskboardTaskLabels.setModifiedBy(getUserName());
				taskboardTaskLabels.setModifiedOn(timestamp);
				taskboardTaskLabelsList.add(taskboardTaskLabels);

				if (StringUtils.isNotBlank(taskboardTaskLabels.getLabelName())) {
					existingLabelsSet.add(taskboardTaskLabels.getLabelName().toLowerCase().trim());
				}
			}
		}

		if (taskboardTaskLabelVO != null && taskboardTaskLabelVO.getLabels() != null) {
			taskboardActivityLogService.saveLabelsActivity(taskboardTask.getTaskboard(), taskboardTask, taskboardTaskLabelVO, "addLabels");
		}

		taskboardTask.setModifiedBy(getUserName());
		taskboardTask.setModifiedOn(timestamp);

		taskboardTaskRepository.save(taskboardTask);

		List<TaskboardTaskLabels> taskboardTaskLabels = taskboardTaskLabelsRepository.saveAll(taskboardTaskLabelsList);
		JsonNode jsonNode = mapper.readTree(mapper.writeValueAsString(constructTaskboardTaskLabelDtotoVO(taskboardTaskLabels)));
		if (!taskboardTaskLabelVO.getRemovedIdList().isEmpty()) {
			taskboardActivityLogService.saveLabelsActivity(taskboardTask.getTaskboard(), taskboardTask, taskboardTaskLabelVO, "removeLabels");
			removeTaskboardTaskLabels(taskboardTaskLabelVO.getRemovedIdList());
		}

		Taskboard taskboard = taskboardTask.getTaskboard();
		eventAutomationService.handleLabelChange(taskboard.getId(), taskboardTask, existingLabelsSet, newLabelsSet, "label_add");

		return ResponseStringVO.builder().response("Task Labels are Saved Successfully").object(jsonNode).build();
	}

	private TaskboardTaskLabelVO constructTaskboardTaskLabelDtotoVO(List<TaskboardTaskLabels> taskboardTaskLabels) {
		List<LabelVO> labelList = new ArrayList<>();
		for (TaskboardTaskLabels taskLabels : taskboardTaskLabels) {
			LabelVO label = LabelVO.builder().labelName(taskLabels.getLabelName()).labelcolor(taskLabels.getTaskboardLabels().getLabelColor())
					.taskboardLabelId(taskLabels.getTaskboardLabels().getId()).taskboardTaskLabelId(taskLabels.getId()).build();
			labelList.add(label);
		}
		return TaskboardTaskLabelVO.builder().labels(labelList).build();
	}

	private TaskboardLabelsVO constructTaskboardLabelsDtotoVO(List<TaskboardLabels> taskboardLabelsList) {
		if (taskboardLabelsList != null && !taskboardLabelsList.isEmpty()) {
			List<LabelVO> labelList = new ArrayList<>();
			for (TaskboardLabels taskboardLabels : taskboardLabelsList) {
				UUID taskLabelId = null;
				for (TaskboardTaskLabels taskboardTaskLabels : taskboardLabels.getTaskboardTaskLabels()) {
					if (StringUtils.equals(taskboardTaskLabels.getTaskboardLabels().getId().toString(), taskboardLabels.getId().toString())) {
						taskLabelId = taskboardTaskLabels.getId();
					}
				}
				LabelVO label = LabelVO.builder().labelName(taskboardLabels.getLabelName()).labelcolor(taskboardLabels.getLabelColor())
						.taskboardLabelId(taskboardLabels.getId()).taskboardTaskLabelId(taskLabelId).build();
				labelList.add(label);
			}
			return TaskboardLabelsVO.builder().taskboardId(taskboardLabelsList.get(0).getTaskboard().getId()).labels(labelList).build();
		}
		return TaskboardLabelsVO.builder().build();
	}

	@Transactional
	public TaskboardLabelsVO getTaskboardLabelsList(UUID taskboardId) {
		List<TaskboardLabels> taskboardLabelsList = taskboardLabelsRepository.getTaskboardLabels(taskboardId, YorosisContext.get().getTenantId(),
				YorosisConstants.YES);
		if (!taskboardLabelsList.isEmpty()) {
			return constructTaskboardLabelsDtotoVO(taskboardLabelsList);
		} else {
			return TaskboardLabelsVO.builder().build();
		}
	}

	@Transactional
	public ResponseStringVO removeTaskboartaskLabel(UUID taskboardtaskLabelId) throws JsonProcessingException {
		TaskboardTaskLabels taskboardTaskLabels = taskboardTaskLabelsRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(taskboardtaskLabelId,
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		String status = null;
		if (taskboardTaskLabels != null) {
			Timestamp timestamp = new Timestamp(System.currentTimeMillis());
			taskboardTaskLabels.setActiveFlag(YorosisConstants.NO);
			taskboardTaskLabels.setModifiedBy(YorosisContext.get().getUserName());
			taskboardTaskLabels.setModifiedOn(timestamp);
			taskboardTaskLabelsRepository.save(taskboardTaskLabels);

			TaskboardTask taskboardTask = taskboardTaskLabels.getTaskboardTask();

			Set<String> existingLabelsSet = new HashSet<>();
			existingLabelsSet.add(taskboardTaskLabels.getLabelName());
			taskboardActivityLogService.saveLabelsActivityForRemove(taskboardTask.getTaskboard(), taskboardTask.getId(), taskboardTaskLabels.getLabelName(),
					"removeLabels");
			Taskboard taskboard = taskboardTask.getTaskboard();
			eventAutomationService.handleLabelChange(taskboard.getId(), taskboardTask, existingLabelsSet, Collections.emptySet(), "label_remove");
			status = "Label removed successfully";
		} else {
			status = "Label already removed";
		}

		return ResponseStringVO.builder().response(status).build();
	}

	private void removeTaskboardTaskLabels(List<UUID> taskLabelIdList) {
		List<TaskboardTaskLabels> taskLabelList = new ArrayList<>();
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		for (TaskboardTaskLabels taskLabel : taskboardTaskLabelsRepository.getTaskLabels(taskLabelIdList, YorosisContext.get().getTenantId(),
				YorosisConstants.YES)) {
			taskLabel.setActiveFlag(YorosisConstants.NO);
			taskLabel.setModifiedBy(YorosisContext.get().getUserName());
			taskLabel.setModifiedOn(timestamp);
			taskLabelList.add(taskLabel);
		}

		taskboardTaskLabelsRepository.saveAll(taskLabelList);
	}

	@Transactional
	public ResponseStringVO saveTaskComment(TaskCommentsVO comments) throws JsonProcessingException {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		TaskboardTaskComments taskComments = null;
		TaskboardTask taskboardTask = taskboardTaskRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(comments.getTaskId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskboardTask == null) {
			return ResponseStringVO.builder().response("Invalid Task Id").build();
		}
		PolicyFactory policy = Sanitizers.FORMATTING.and(Sanitizers.LINKS).and(Sanitizers.BLOCKS).and(IMAGES).and(Sanitizers.STYLES).and(Sanitizers.TABLES)
				.and(Sanitizers.FORMATTING);
		String safeHTML = policy.sanitize(comments.getComments());
		comments.setComments(safeHTML);
		if (comments.getId() == null) {
			taskComments = TaskboardTaskComments.builder().comment(comments.getComments()).taskboardTask(taskboardTask).createdBy(comments.getCreatedBy())
					.createdOn(timestamp).modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp).replyToCommentId(comments.getParentCommentId())
					.tenantId(YorosisContext.get().getTenantId()).activeFlag(YorosisConstants.YES).build();
		} else {
			taskComments = taskboardTaskCommentsRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(comments.getId(),
					YorosisContext.get().getTenantId(), YorosisConstants.YES);
			taskComments.setComment(comments.getComments());
			taskComments.setModifiedBy(YorosisContext.get().getUserName());
			taskComments.setModifiedOn(timestamp);
		}
		TaskboardTaskComments save = taskboardTaskCommentsRepository.save(taskComments);
		if (comments.getMentionedUsersEmail() != null && !comments.getMentionedUsersEmail().isEmpty()) {
			notificationsService.handleTaskCommentsNotifications(taskboardTask, comments);
		}
		taskboardTask.setModifiedBy(getUserName());
		taskboardTask.setModifiedOn(timestamp);

		taskboardTaskRepository.save(taskboardTask);
		taskboardActivityLogService.saveActivityLog(taskboardTask.getTaskboard(), taskboardTask, null, "addedComment");
		eventAutomationService.handleCommentChange(taskboardTask.getTaskboard().getId(), taskboardTask);

		return ResponseStringVO.builder().response("Task comments saved successfully").uuid(save.getId()).build();
	}

	@Transactional
	public ResponseStringVO saveTaskStartAndDueDate(TaskboardTaskVO taskVO) throws JsonProcessingException {
		TaskboardTask taskboardTask = taskboardTaskRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(taskVO.getId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);

		if (taskboardTask == null) {
			return ResponseStringVO.builder().response("Invalid Task Id").build();
		}
		if (taskboardTask.getStartDate() == null && taskVO.getStartDate() != null) {
			taskboardActivityLogService.saveActivityLog(taskboardTask.getTaskboard(), taskboardTask, taskVO, "addedStartDate");
		} else {
			if (taskboardTask.getStartDate() != null && taskVO.getStartDate() != null) {
				LocalDateTime startDate = taskboardTask.getStartDate().toLocalDateTime();
				LocalDateTime startDateVo = taskVO.getStartDate().toLocalDateTime();
				if (!startDate.toLocalDate().isEqual(startDateVo.toLocalDate())) {
					taskboardActivityLogService.saveActivityLog(taskboardTask.getTaskboard(), taskboardTask, taskVO, "addedStartDate");
				}
			}
		}
		if (taskboardTask.getDueDate() == null && taskVO.getDueDate() != null) {
			taskboardActivityLogService.saveActivityLog(taskboardTask.getTaskboard(), taskboardTask, taskVO, "addedDueDate");
		} else {
			if (taskboardTask.getDueDate() != null && taskVO.getDueDate() != null) {
				LocalDateTime dueDate = taskboardTask.getDueDate().toLocalDateTime();
				LocalDateTime dueDateVo = taskVO.getDueDate().toLocalDateTime();
				if (!dueDate.toLocalDate().isEqual(dueDateVo.toLocalDate())) {
					taskboardActivityLogService.saveActivityLog(taskboardTask.getTaskboard(), taskboardTask, taskVO, "addedDueDate");
				}
			}
		}

		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		taskboardTask.setStartDate(taskVO.getStartDate());
		taskboardTask.setDueDate(taskVO.getDueDate());
		taskboardTask.setActiveFlag(YorosisConstants.YES);
		taskboardTask.setModifiedBy(getUserName());
		taskboardTask.setModifiedOn(timestamp);
		taskboardTaskRepository.save(taskboardTask);
		return ResponseStringVO.builder().response("Task date saved successfully").build();
	}

	@Transactional
	public ResponseStringVO savePriority(TaskboardTaskVO taskVO) throws JsonProcessingException {
		TaskboardTask taskboardTask = taskboardTaskRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(taskVO.getId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);

		if (taskboardTask == null) {
			return ResponseStringVO.builder().response("Invalid Task Id").build();
		}

		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		taskboardTask.setPriority(taskVO.getPriority());
		taskboardTask.setModifiedBy(getUserName());
		taskboardTask.setModifiedOn(timestamp);
		taskboardTaskRepository.save(taskboardTask);
		taskboardActivityLogService.saveActivityLog(taskboardTask.getTaskboard(), taskboardTask, taskVO, "addedPriority");
		return ResponseStringVO.builder().response("Task priority updated successfully").build();
	}

	@Transactional
	public List<FilesVO> getFiles(UUID id) {
		TaskboardTask taskboardTask = taskboardTaskRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(id, YorosisContext.get().getTenantId(),
				YorosisConstants.YES);
		return taskboardTask.getTaskboardTaskFiles().stream().filter(task -> StringUtils.equals(task.getActiveFlag(), YorosisConstants.YES))
				.map(this::constructTaskFilesDtoToVo).collect(Collectors.toList()).stream()
				.map(t -> FilesVO.builder().fileName(t.getFileName()).id(t.getId()).fileType(t.getFileType()).build()).collect(Collectors.toList());

	}

	private List<UUID> getGroupAsUUID(UsersVO userVO) {
		List<GroupVO> listGroupVO = userVO.getGroupVOList();
		if (listGroupVO.isEmpty()) {
			return java.util.Collections.emptyList();
		}

		return listGroupVO.stream().map(GroupVO::getGroupId).collect(Collectors.toList());
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public String getUserNameByTenantId() {
		String userName = null;
		List<User> user = userRepository.getUserNameByTenantId(YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (user != null && !user.isEmpty()) {
			userName = user.get(0).getUserName();
		}
		return userName;
	}

	@Transactional
	public ResponseStringVO deleteTask(UUID taskId) {
		return deleteAndUndoDelete(taskId, true);
	}

	private ResponseStringVO deleteAndUndoDelete(UUID taskId, boolean forDelete) {
		TaskboardTask taskboardTask = taskboardTaskRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(taskId, YorosisContext.get().getTenantId(),
				forDelete ? YorosisConstants.YES : YorosisConstants.NO);
		if (taskboardTask != null) {
			taskboardTask.setActiveFlag(forDelete ? YorosisConstants.NO : YorosisConstants.YES);
			taskboardTaskRepository.save(taskboardTask);
			List<TaskboardTask> subTask = taskboardTaskRepository.getParentTaskIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(taskId,
					YorosisContext.get().getTenantId(), forDelete ? YorosisConstants.YES : YorosisConstants.NO);
			if (subTask != null && !subTask.isEmpty()) {
				subTask.stream().forEach(t -> t.setActiveFlag(forDelete ? YorosisConstants.NO : YorosisConstants.YES));
				taskboardTaskRepository.saveAll(subTask);
			}

			return ResponseStringVO.builder().response("Task " + (forDelete ? DELETED : "undeleted") + " successfully").build();
		}
		return ResponseStringVO.builder().response("Invalid Task").build();
	}

	@Transactional
	public ResponseStringVO undoDeleteTask(UUID taskId) {
		return deleteAndUndoDelete(taskId, false);
	}

	@Transactional
	public ResponseStringVO changeStatusToArchive(UUID taskId) {
		TaskboardTask taskboardTask = taskboardTaskRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(taskId, YorosisContext.get().getTenantId(),
				YorosisConstants.YES);
		if (taskboardTask != null) {
			taskboardTask.setPreviousStatus(taskboardTask.getStatus());
			taskboardTask.setStatus(ARCHIVED);
			taskboardTaskRepository.save(taskboardTask);
			return ResponseStringVO.builder().response("Task Archived successfully").build();
		}
		return ResponseStringVO.builder().response("Invalid Task").build();
	}

	@Transactional
	public ResponseStringVO unArchiveTask(UUID taskId) {
		TaskboardTask taskboardTask = taskboardTaskRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(taskId, YorosisContext.get().getTenantId(),
				YorosisConstants.YES);
		if (taskboardTask != null && taskboardTask.getPreviousStatus() != null) {
			taskboardTask.setStatus(taskboardTask.getPreviousStatus());
			taskboardTaskRepository.save(taskboardTask);
			return ResponseStringVO.builder().response("Task Unarchived successfully").build();
		}
		return ResponseStringVO.builder().response("Invalid Task").build();
	}

	@Transactional
	public List<TaskboardTaskVO> getAllTaskss(UUID taskboardId) {
		List<TaskboardTaskVO> taskList = new ArrayList<>();
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = getGroupAsUUID(userVO);
		List<TaskboardTask> taskboardTask = taskboardTaskRepository.getAllTasksByBoardId(taskboardId, YorosisContext.get().getTenantId(), YorosisConstants.YES,
				userVO.getUserId(), userGroupIdsList);
		if (taskboardTask != null && !taskboardTask.isEmpty()) {
			taskboardTask.stream().forEach(t -> {
				try {
					TaskboardTaskVO taskboardTaskVo = contructTaskboardTaskDtoToVo(t, null);
					List<TaskboardTaskDependencies> taskDependenciesForBlocking = taskboardTaskDependenciesRepository.getTaskDependenciesForBlocking(t.getId(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES);
					if (taskDependenciesForBlocking != null && !taskDependenciesForBlocking.isEmpty()) {
						taskboardTaskVo.getTaskDependenciesVO().setWaitingOn(constructEntityToVOForWaitingOn(taskDependenciesForBlocking, t));
					}
					List<TaskboardTaskDependencies> taskDependenciesForRelatedTask = taskboardTaskDependenciesRepository
							.getTaskDependenciesForRelatedTask(t.getId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
					if (taskDependenciesForRelatedTask != null && !taskDependenciesForRelatedTask.isEmpty()) {
						taskboardTaskVo.getTaskDependenciesVO().setRelatedTasks(constructEntityToVOForRelatedTask(taskDependenciesForRelatedTask, t));
					}
					taskList.add(taskboardTaskVo);
				} catch (IOException e) {
					log.info("Invalid Task");
				}
			});
		}
		return taskList;
	}

	@Transactional
	public List<TaskboardTaskVO> getAllTasks(UUID taskboardId) {
		List<TaskboardTaskVO> taskList = new ArrayList<>();
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = getGroupAsUUID(userVO);
		List<TaskboardTask> taskboardTask = taskboardTaskRepository.getAllTasksByBoardId(taskboardId, YorosisContext.get().getTenantId(), YorosisConstants.YES,
				userVO.getUserId(), userGroupIdsList);
		if (taskboardTask != null && !taskboardTask.isEmpty()) {
			List<TaskboardTaskDependencies> taskDependenciesList = taskboardTaskDependenciesRepository.getTaskDependenciesForBlockingForTaskBoard(taskboardTask,
					YorosisContext.get().getTenantId(), YorosisConstants.YES);
			List<TaskboardTaskDependencies> taskDependenciesForBlocking = new ArrayList<>();
			List<TaskboardTaskDependencies> taskDependenciesForRelatedTask = new ArrayList<>();
			taskboardTask.stream().forEach(t -> {
				try {
					TaskboardTaskVO taskboardTaskVo = contructTaskboardTaskDtoToVo(t, null);
					if (taskDependenciesList != null && !taskDependenciesList.isEmpty()) {
						taskDependenciesList.stream().forEach(d -> {
							if (d.getBlocking() != null && d.getBlocking().getId() != null
									&& StringUtils.equals(d.getBlocking().getId().toString(), t.getId().toString())) {
								taskDependenciesForBlocking.add(d);
							}
							if (d.getRelatedTask() != null && d.getRelatedTask().getId() != null
									&& StringUtils.equals(d.getRelatedTask().getId().toString(), t.getId().toString())) {
								taskDependenciesForRelatedTask.add(d);
							}
						});
					}
					if (taskDependenciesForBlocking != null && !taskDependenciesForBlocking.isEmpty()) {
						taskboardTaskVo.getTaskDependenciesVO().setWaitingOn(constructEntityToVOForWaitingOn(taskDependenciesForBlocking, t));
					}
					if (taskDependenciesForRelatedTask != null && !taskDependenciesForRelatedTask.isEmpty()) {
						taskboardTaskVo.getTaskDependenciesVO().setRelatedTasks(constructEntityToVOForRelatedTask(taskDependenciesForRelatedTask, t));
					}
					taskList.add(taskboardTaskVo);
				} catch (IOException e) {
					log.info("Invalid Task");
				}
			});
		}
		return taskList;
	}

	@Transactional
	public List<TaskboardNamesVO> getTaskBoardNameList() {
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = getGroupAsUUID(userVO);
		List<TaskboardNamesVO> taskboardNamesVoList = new ArrayList<>();
		List<Object[]> count = taskboardRepository.getTaskBoardNameListByTenantIdIgnoreCaseAndActiveFlagIgnoreCaseWithPermission(userVO.getUserId(),
				userGroupIdsList, YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (count != null) {
			taskboardNamesVoList = count.stream().map(this::constructTaskboardNamesVO).collect(Collectors.toList());
		}
		return taskboardNamesVoList;
	}

	@Transactional
	public List<TaskboardNamesVO> getAllTaskBoardNameList() {
		List<TaskboardNamesVO> taskboardNamesVoList = new ArrayList<>();
		List<Object[]> count = taskboardRepository
				.getTaskBoardNameListByTenantIdIgnoreCaseAndActiveFlagIgnoreCaseWithoutPermission(YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (count != null) {
			taskboardNamesVoList = count.stream().map(this::constructTaskboardNamesVO).collect(Collectors.toList());
		}
		return taskboardNamesVoList;
	}

	private TaskboardNamesVO constructTaskboardNamesVO(Object[] taskboardNamesVo) {
		return TaskboardNamesVO.builder().workspaceId((UUID) taskboardNamesVo[0]).taskboardCount((long) taskboardNamesVo[1]).build();
	}

	public ResponseStringVO getTotalTaskboardCount() {
		return ResponseStringVO.builder().count(taskboardRepository.getTotalTaskBoardCount(YorosisContext.get().getTenantId(), YorosisConstants.YES)).build();
	}

	@Transactional
	public ResponseStringVO saveTaskBoardFromApps(AppsVo appsVo) throws IOException, ParseException {
		if (appsVo != null) {
			if (appsVo.getTemplateNode().has("taskboard") && appsVo.getTemplateNode().get("taskboard").isArray()) {
				JsonNode taskBoardList = appsVo.getTemplateNode().get("taskboard");
				List<UUID> taskboardId = new ArrayList<>();
				List<TaskboardSecurity> taskboardSecurityList = new ArrayList<>();
				List<TaskboardColumnsSecurity> taskboardColumnsSecurityList = new ArrayList<>();
				Taskboard taskboardEntity = null;
				UsersVO userVO = userService.getLoggedInUserDetails();
				List<String> taskboardName = taskboardRepository.getTaskBoardNameListByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
						YorosisContext.get().getTenantId(), YorosisConstants.YES, appsVo.getWorkspaceId());
				if (taskboardName != null && !taskboardName.isEmpty()) {
					for (final JsonNode taskboard : taskBoardList) {
						if (taskboard.has("taskboardVo")) {
							mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
							JsonNode taskboardVo = taskboard.get("taskboardVo");
							TaskboardVO taskboardVO = mapper.treeToValue(taskboardVo, TaskboardVO.class);
							if (taskboardName.contains(taskboardVO.getName())) {
								return ResponseStringVO.builder().response("App already installed in this workspace").build();
							}
						}
					}
				}
				LicenseVO licenseVO = isAllowedForInstall(taskBoardList.size());
				if (StringUtils.equals(licenseVO.getResponse(), "within the limit")) {
					for (final JsonNode taskboard : taskBoardList) {
						mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
						taskboardEntity = null;
						if (taskboard.has("taskboardVo")) {
							JsonNode taskboardVo = taskboard.get("taskboardVo");
							TaskboardVO taskboardVO = mapper.treeToValue(taskboardVo, TaskboardVO.class);
							if (taskboardVO != null) {
								taskboardEntity = saveTaskboardFromInstall(taskboardVO, appsVo.getWorkspaceId());
								taskboardId.add(taskboardEntity.getId());
							}
						}
						if (taskboard.has("taskboardLabels") && taskboardEntity != null) {
							JsonNode taskboardLabels = taskboard.get("taskboardLabels");
							TaskboardLabelsVO taskboardLabelsVO = mapper.treeToValue(taskboardLabels, TaskboardLabelsVO.class);
							if (taskboardLabelsVO != null && taskboardLabelsVO.getLabels() != null && !taskboardLabelsVO.getLabels().isEmpty()) {
								taskboardLabelsVO.setTaskboardId(taskboardEntity.getId());
								saveTaskboardLabel(taskboardLabelsVO);
							}
						}
						if (taskboard.has("automations") && taskboard.get("automations").isArray() && taskboardEntity != null) {
							JsonNode automationList = taskboard.get("automations");
							for (final JsonNode automation : automationList) {
								EventAutomationVO eventAutomationVO = mapper.treeToValue(automation, EventAutomationVO.class);
								if (eventAutomationVO != null) {
									setEventAutomation(eventAutomationVO, appsVo.getGroupNameMap(), userVO);
									eventAutomationVO.setTaskboardId(taskboardEntity.getId());
									eventAutomationVO.setId(null);
									entAutomationService.saveAutomation(eventAutomationVO);
								}
							}
						}
						if (taskboard.has("security") && !taskboard.get("security").isNull()) {
							JsonNode securityNode = taskboard.get("security");
							if (securityNode.has("securityList") && taskboardEntity != null) {
								JsonNode securityList = securityNode.get("securityList");
								if (securityList.isArray()) {
									for (final JsonNode security : securityList) {
										SecurityListVO securityListVO = mapper.treeToValue(security, SecurityListVO.class);
										if (securityListVO != null) {
											taskboardSecurityList.add(saveTaskboardSecurityTeam(taskboardEntity, securityListVO, appsVo.getGroupNameMap()));
										}
									}
								}
							}
							if (securityNode.has("columnSecurityList") && taskboardEntity != null) {
								JsonNode columnSecurityList = securityNode.get("columnSecurityList");
								if (columnSecurityList.isArray()) {
									for (final JsonNode security : columnSecurityList) {
										TaskboardColumnSecurityListVO securityListVO = mapper.treeToValue(security, TaskboardColumnSecurityListVO.class);
										if (securityListVO != null) {
											for (TaskboardColumns te : taskboardEntity.getTaskboardColumns()) {
												if (StringUtils.equals(te.getColumnName(), securityListVO.getColumnName())) {
													taskboardColumnsSecurityList
															.addAll(saveColumnSecurity(taskboardEntity, securityListVO, te, appsVo.getGroupNameMap()));
												}
											}
										}
									}
								}
							}
						}
					}
					if (taskboardSecurityList != null && !taskboardSecurityList.isEmpty()) {
						taskboardSecurityRepository.saveAll(taskboardSecurityList);
					}
					if (taskboardColumnsSecurityList != null && !taskboardColumnsSecurityList.isEmpty()) {
						taskboardColumnsSecurityRepository.saveAll(taskboardColumnsSecurityList);
					}
				} else {
					return ResponseStringVO.builder().response("You have exceeded your limit").licenseVO(licenseVO).build();
				}
			}
		}
		return ResponseStringVO.builder().response("Taskboard installed").build();
	}

	private void setEventAutomation(EventAutomationVO eventAutomationVO, List<YoroGroupMapVo> groupNameMap, UsersVO userVO) {
		JsonNode automationList = eventAutomationVO.getAutomation();
		if (automationList != null && automationList.isArray()) {
			for (final JsonNode automation : automationList) {
				if (automation.has("conditions") && !automation.get("conditions").isNull()) {
					JsonNode conditionsList = automation.get("conditions");
					if (conditionsList != null && conditionsList.isArray()) {
						for (final JsonNode conditions : conditionsList) {
							if (conditions.has("actions") && !conditions.get("actions").isNull()) {
								JsonNode actionsList = conditions.get("actions");
								if (actionsList != null && actionsList.isArray()) {
									for (final JsonNode actions : actionsList) {
										if (actions.has("values") && !actions.get("values").isNull()) {
											JsonNode valuesList = actions.get("values");
											if (valuesList != null && valuesList.isArray()) {
												for (final JsonNode values : valuesList) {
													if (values.has("user") && !values.get("user").isNull()) {
														JsonNode userList = values.get("user");
														if (userList != null && userList.isArray() && userList.size() > 0) {
															for (final JsonNode user : userList) {
																if (user.has("userId") && user.has("userName") && !user.get("userId").isNull()) {
																	change(user, "userId", userVO.getUserId().toString());
																	change(user, "userName", userVO.getFirstName() + " " + userVO.getLastName());
																}
															}
														}
													}
													if (values.has("group") && !values.get("group").isNull()) {
														JsonNode groupList = values.get("group");
														if (groupList != null && groupList.isArray()) {
															for (final JsonNode group : groupList) {
																if (group.has("groupName") && group.get("groupName") != null) {
																	String groupName = group.get("groupName").asText();
																	groupNameMap.stream().forEach(as -> {
																		if (StringUtils.equals(as.getGroupName(), groupName)) {
																			change(group, "groupId", as.getYoroGroups().toString());
																		}
																	});
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
			eventAutomationVO.setAutomation(automationList);
		}
	}

	public void change(JsonNode parent, String fieldName, String newValue) {
		if (parent.has(fieldName)) {
			((ObjectNode) parent).put(fieldName, newValue);
		}
	}

	public LicenseVO isAllowedForInstall(int count) {
		String currentTenantId = YorosisContext.get().getTenantId();

		LicenseVO licenseVO = proxyYoroflowSchemaService.isAllowed(currentTenantId, "taskboards", "boards");

		int totalTaskBoardCount = taskboardRepository.getTotalTaskBoardCountForLicence(currentTenantId, YorosisConstants.YES);
		totalTaskBoardCount = totalTaskBoardCount + count;
		if (totalTaskBoardCount < licenseVO.getAllowedLimit()) {
			licenseVO.setResponse("within the limit");
			return licenseVO;
		}
		licenseVO.setResponse("You have exceeded your limit");
		return licenseVO;
	}

	private List<TaskboardColumnsSecurity> saveColumnSecurity(Taskboard taskboard, TaskboardColumnSecurityListVO taskboardColumnSecurityVo,
			TaskboardColumns taskboardColumns, List<YoroGroupMapVo> groupNameMap) {
		List<TaskboardColumnsSecurity> taskboardColumnsSecurityList = new ArrayList<>();
		if (taskboardColumnSecurityVo != null) {
			for (SecurityListVO columnSecurityListVO : taskboardColumnSecurityVo.getColumnPermissions()) {
				TaskboardColumnsSecurity taskboardColumnsSecurity = constructTaskboardColumnsSecurityVOToDTO(columnSecurityListVO);
				groupNameMap.stream().forEach(as -> {
					if (StringUtils.equals(as.getGroupName(), columnSecurityListVO.getGroupId())) {
						taskboardColumnsSecurity.setGroupId(as.getYoroGroups());
					}
				});
				taskboardColumnsSecurity.setTaskboardColumns(taskboardColumns);
				taskboardColumnsSecurityList.add(taskboardColumnsSecurity);
			}
		}
		return taskboardColumnsSecurityList;
	}

	private TaskboardSecurity saveTaskboardSecurityTeam(Taskboard taskboard, SecurityListVO securityListVO, List<YoroGroupMapVo> groupNameMap) {
		TaskboardSecurity security = constructTaskboardSecurityVOToDTO(securityListVO);
		groupNameMap.stream().forEach(as -> {
			if (StringUtils.equals(as.getGroupName(), securityListVO.getGroupId())) {
				security.setGroupId(as.getYoroGroups());
			}
		});
		security.setTaskboard(taskboard);
		return security;
	}

	private Taskboard saveTaskboardFromInstall(TaskboardVO vo, UUID workspaceId) {
		Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());
		Taskboard taskboard = null;
		taskboard = Taskboard.builder().name(vo.getName()).description(vo.getDescription()).createdBy(YorosisContext.get().getUserName())
				.createdOn(currentTimestamp).modifiedBy(YorosisContext.get().getUserName()).modifiedOn(currentTimestamp).activeFlag(YorosisConstants.YES)
				.tenantId(YorosisContext.get().getTenantId()).generatedTaskId(vo.getGeneratedTaskId()).taskName(vo.getTaskName())
				.taskboardKey(vo.getTaskboardKey()).workspaceId(workspaceId).isColumnBackground(booleanToChar(vo.getIsColumnBackground())).build();

		List<TaskboardColumns> taskboardColumnsList = new ArrayList<>();
		for (TaskboardColumnsVO taskboardColumnsVO : vo.getTaskboardColumns()) {
			TaskboardColumns taskboardColumns = TaskboardColumns.builder().columnName(taskboardColumnsVO.getColumnName())
					.columnOrder(taskboardColumnsVO.getColumnOrder()).columnColor(taskboardColumnsVO.getColumnColor()).taskboard(taskboard)
					.createdBy(YorosisContext.get().getUserName()).createdOn(currentTimestamp).modifiedBy(YorosisContext.get().getUserName())
					.modifiedOn(currentTimestamp).formId(taskboardColumnsVO.getFormId()).version(taskboardColumnsVO.getVersion())
					.activeFlag(YorosisConstants.YES).tenantId(YorosisContext.get().getTenantId()).layoutType(taskboardColumnsVO.getLayoutType())
					.isDoneColumn(booleanToChar(taskboardColumnsVO.getIsDoneColumn()))
					.isColumnBackground(booleanToChar(taskboardColumnsVO.getIsColumnBackground())).build();
			taskboardColumns.setTaskboard(taskboard);
			taskboardColumnsList.add(taskboardColumns);
		}
		taskboard.setTaskboardColumns(taskboardColumnsList);
		Taskboard savedTaskboard = taskboardRepository.save(taskboard);
		saveTaskboardSecurity(savedTaskboard);
		return taskboard;
	}

	@Transactional
	public ResponseStringVO saveInactiveUser(ReactiveOrInactiveUsers userId) {
		List<TaskboardTaskAssignedUsers> taskboardTaskAssignedUsersList = taskboardTaskAssignedUsersRepository.getAssigneeListByUserId(userId.getUserIdList(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskboardTaskAssignedUsersList != null && !taskboardTaskAssignedUsersList.isEmpty()) {
			taskboardTaskAssignedUsersList.stream().forEach(t -> {
				t.setActiveFlag(YorosisConstants.NO);
			});
			taskboardTaskAssignedUsersRepository.saveAll(taskboardTaskAssignedUsersList);
		}
		List<TaskboardSecurity> taskboardSecurityList = taskboardSecurityRepository.getTaskboardSecurityListByUserId(userId.getUserIdList(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskboardSecurityList != null && !taskboardSecurityList.isEmpty()) {
			taskboardSecurityList.stream().forEach(t -> {
				t.setActiveFlag(YorosisConstants.NO);
			});
			taskboardSecurityRepository.saveAll(taskboardSecurityList);
		}
		return ResponseStringVO.builder().build();
	}

	@Transactional
	public ResponseStringVO saveReactiveUser(ReactiveOrInactiveUsers userId) {
		List<TaskboardTaskAssignedUsers> taskboardTaskAssignedUsersList = taskboardTaskAssignedUsersRepository.getAssigneeListByUserId(userId.getUserIdList(),
				YorosisContext.get().getTenantId(), YorosisConstants.NO);
		if (taskboardTaskAssignedUsersList != null && !taskboardTaskAssignedUsersList.isEmpty()) {
			taskboardTaskAssignedUsersList.stream().forEach(t -> {
				t.setActiveFlag(YorosisConstants.YES);
			});
			taskboardTaskAssignedUsersRepository.saveAll(taskboardTaskAssignedUsersList);
		}
		List<TaskboardSecurity> taskboardSecurityList = taskboardSecurityRepository.getTaskboardSecurityListByUserId(userId.getUserIdList(),
				YorosisContext.get().getTenantId(), YorosisConstants.NO);
		if (taskboardSecurityList != null && !taskboardSecurityList.isEmpty()) {
			taskboardSecurityList.stream().forEach(t -> {
				t.setActiveFlag(YorosisConstants.YES);
			});
			taskboardSecurityRepository.saveAll(taskboardSecurityList);
		}
		return ResponseStringVO.builder().build();
	}

	@Transactional
	public ResponseStringVO deleteTaskboard(UUID taskboardId) {
		Taskboard taskboard = taskboardRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(taskboardId, YorosisContext.get().getTenantId(),
				YorosisConstants.YES);
		if (taskboard != null) {
			taskboard.setActiveFlag(YorosisConstants.NO);
			taskboard.setModifiedBy(YorosisContext.get().getUserName());
			taskboard.setModifiedOn(new Timestamp(System.currentTimeMillis()));
			taskboard = taskboardRepository.save(taskboard);
			taskboardSprintService.deleteSprintByTaskboard(taskboardId);
		} else {
			return ResponseStringVO.builder().response("Invalid Taskboard").build();
		}
		return ResponseStringVO.builder().response("Taskboard deleted successfully").build();
	}

	@Transactional
	public ResponseStringVO removedTaskboardColumnsById(String id) {
		if (StringUtils.isNotBlank(id)) {
			removedTaskboardColumnsSecurity(id);
			TaskboardColumns taskboardColumns = taskboardColumnsRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID.fromString(id),
					YorosisContext.get().getTenantId(), YorosisConstants.YES);
			if (taskboardColumns != null) {
				taskboardColumns.setActiveFlag(YorosisConstants.NO);
				taskboardColumnsRepository.save(taskboardColumns);
				return ResponseStringVO.builder().response("Column removed successfully").build();
			}
		}
		return ResponseStringVO.builder().response("Invalid Id").build();
	}

	public Map<String, List<FieldVO>> getFieldList(String pageId, Long pageVersion) {
		List<FieldVO> listFieldVO = new ArrayList<>();
		List<FieldVO> listFieldSubVO = new ArrayList<>();
		List<FieldVO> listFieldTableVO = new ArrayList<>();
		Map<String, List<FieldVO>> fieldList = new LinkedHashMap<>();
		Map<String, List<FieldVO>> fieldVolist = yoroappsServiceClient.getFieldValues(YorosisContext.get().getToken(), pageId, pageVersion);
		if (fieldVolist.get(MAIN_SECTION) != null) {
			listFieldVO.addAll(fieldVolist.get(MAIN_SECTION));
		}
		if (fieldVolist.get(TABLE_CONTROL) != null && !fieldVolist.get(TABLE_CONTROL).isEmpty()) {
			listFieldTableVO.addAll(fieldVolist.get(TABLE_CONTROL));
			listFieldVO.add(FieldVO.builder().fieldId(fieldVolist.get(TABLE_CONTROL).get(0).getRepeatableFieldId())
					.fieldName(fieldVolist.get(TABLE_CONTROL).get(0).getRepeatableFieldName()).datatype("array").build());
		}
		if (fieldVolist.get(SUB_SECTION) != null) {
			listFieldSubVO.addAll(fieldVolist.get(SUB_SECTION));
		}

		fieldList.put(MAIN_SECTION, listFieldVO);
		fieldList.put(TABLE_CONTROL, listFieldTableVO);
		fieldList.put(SUB_SECTION, listFieldSubVO);
		return fieldList;
	}

	@Transactional
	public Set<PageFieldVo> getPageFieldVoForTaskboardAutomation(String pageId, Long pageVersion) {
		Set<PageFieldVo> fieldList = new LinkedHashSet<>();
		Map<String, List<FieldVO>> pageFieldList = new LinkedHashMap<>();
		pageFieldList = getFieldList(pageId, pageVersion);
		if (pageFieldList.get(MAIN_SECTION) != null) {
			List<FieldVO> taskServiceFieldMainSectionList = sortedFieldVoList(pageFieldList.get(MAIN_SECTION));
			fieldList.add(PageFieldVo.builder().fieldType("Workflow Variables:").fieldVO(taskServiceFieldMainSectionList).build());
		}
		List<FieldVO> systemVariableFieldList = sortedFieldVoList(systemVariableService.getFieldList());
		List<FieldVO> orgCustomAttributeServiceFieldList = sortedFieldVoList(orgCustomAttributeService.getCustomAttributes());
		if (!CollectionUtils.isEmpty(systemVariableFieldList)) {
			fieldList.add(PageFieldVo.builder().fieldType("System Variables:").fieldVO(systemVariableFieldList).build());
		}
		if (!CollectionUtils.isEmpty(orgCustomAttributeServiceFieldList)) {
			fieldList.add(PageFieldVo.builder().fieldType("Custom Attributes:").fieldVO(orgCustomAttributeServiceFieldList).build());
		}
		return fieldList;
	}

	@Transactional
	public Set<PageFieldVo> getPageFieldVoForTaskboard() {
		Set<PageFieldVo> fieldList = new LinkedHashSet<>();
		List<FieldVO> systemVariableFieldList = sortedFieldVoList(systemVariableService.getFieldList());
		List<FieldVO> orgCustomAttributeServiceFieldList = sortedFieldVoList(orgCustomAttributeService.getCustomAttributes());
		if (!CollectionUtils.isEmpty(systemVariableFieldList)) {
			fieldList.add(PageFieldVo.builder().fieldType("System Variables:").fieldVO(systemVariableFieldList).build());
		}
		if (!CollectionUtils.isEmpty(orgCustomAttributeServiceFieldList)) {
			fieldList.add(PageFieldVo.builder().fieldType("Custom Attributes:").fieldVO(orgCustomAttributeServiceFieldList).build());
		}
		return fieldList;
	}

	private List<FieldVO> sortedFieldVoList(List<FieldVO> fieldList) {
		if (fieldList != null && fieldList.size() > 1) {
			Collections.sort(fieldList, (p1, p2) -> p1.getFieldName().compareToIgnoreCase(p2.getFieldName()));
		}
		return fieldList;
	}

	@Transactional
	public ValueType getFieldValue(UUID processInstanceId, String fieldName, VariableType variableType) {

		// TODO - should rely on OwnedByField in FieldVo to determine call another
		// workflow

		if (variableType == VariableType.CONSTANT) {
			return ValueType.builder().value(fieldName).clazz(YoroDataType.STRING).build();
		}

		if (fieldName != null) {
			String resolvedValue = systemVariableService.resolveSystemVariable(fieldName);
			if (StringUtils.isBlank(resolvedValue)) {
				UserCustomAttributeVO userCustomAttributeVO = userCustomAttributeService.getCustomAttribute(fieldName);
				if (userCustomAttributeVO != null && !StringUtils.isBlank(userCustomAttributeVO.getValue())) {
					resolvedValue = userCustomAttributeVO.getValue();
				}

			}

			if (StringUtils.isNotBlank(resolvedValue)) {
				return ValueType.builder().value(resolvedValue).clazz(YoroDataType.STRING).build();
			}
		}
		return ValueType.builder().value(StringUtils.EMPTY).clazz(YoroDataType.STRING).build();

	}

	@Transactional
	public TaskboardVO getInitialMapValue(UUID taskboardId) {
		Taskboard taskboard = taskboardRepository.getTaskboardByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(taskboardId, YorosisContext.get().getTenantId(),
				YorosisConstants.YES);
		if (taskboard != null && taskboard.getInitialMapData() != null) {
			JsonNode fieldMapping = taskboard.getInitialMapData().deepCopy();
			if (fieldMapping != null) {
				Iterator<String> fieldNames = fieldMapping.fieldNames();
				while (fieldNames.hasNext()) {
					String fieldName = fieldNames.next();
					JsonNode field = fieldMapping.get(fieldName);
					if (!field.isNull()) {
						ValueType leftAssignment = getFieldValue(null, field.asText(), VariableType.PAGEFIELD);
						if (leftAssignment != null) {
							change(fieldMapping, fieldName, leftAssignment.getValue().toString());
						}
					}
				}
			}
			return TaskboardVO.builder().fieldMapping(fieldMapping).build();
		}
		return null;
	}

	@Transactional
	public ResponseStringVO inactivateTaskboard(SubscriptionExpireVO subscriptionExpireVO) throws IOException {
		String response = null;
		List<Taskboard> taskboardList = taskboardRepository.getTaskboardFromAllWorkplaceToInactivate(YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (!taskboardList.isEmpty() && taskboardList.size() > 2) {
			if (BooleanUtils.isTrue(subscriptionExpireVO.getIsRandomTaskboard())) {
				List<UUID> uuidList = new ArrayList<>();
				List<Taskboard> subList = taskboardList.subList(taskboardList.size() - 5, taskboardList.size());
				subList.stream().forEach(t -> uuidList.add(t.getId()));
				List<Taskboard> list = taskboardRepository.getTaskboardFromAllWorkplaceByIdToInactivate(uuidList, YorosisContext.get().getTenantId(),
						YorosisConstants.YES);
				list.stream().forEach(t -> t.setActiveFlag(YorosisConstants.NO));
				list.stream().forEach(t -> t.setSprintEnabled(YorosisConstants.NO));
				taskboardRepository.saveAll(list);

				List<EventAutomation> automationByTaskboardsIdList = eventAutomationRepository.getAutomationByTaskboardsIdList(uuidList,
						YorosisContext.get().getTenantId(), YorosisConstants.YES);
				automationByTaskboardsIdList.stream().forEach(t -> t.setActiveFlag(YorosisConstants.NO));
				eventAutomationRepository.saveAll(automationByTaskboardsIdList);

				response = "Removed random taskboards";
			} else {
				List<Taskboard> pickedTaskboardList = taskboardRepository.getTaskboardFromAllWorkplaceByIdToInactivate(
						subscriptionExpireVO.getTaskboardsIdList(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
				pickedTaskboardList.stream().forEach(t -> t.setActiveFlag(YorosisConstants.NO));
				pickedTaskboardList.stream().forEach(t -> t.setSprintEnabled(YorosisConstants.NO));
				taskboardRepository.saveAll(pickedTaskboardList);

				List<EventAutomation> automationByTaskboardsIdList = eventAutomationRepository
						.getAutomationByTaskboardsIdList(subscriptionExpireVO.getTaskboardsIdList(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
				automationByTaskboardsIdList.stream().forEach(t -> t.setActiveFlag(YorosisConstants.NO));
				eventAutomationRepository.saveAll(automationByTaskboardsIdList);

				response = "Removed picked taskboards";
			}
		}
		return ResponseStringVO.builder().response(response).build();
	}

	public TaskboardExcelVO isEmptyTaskboard(TaskboardExcelVO taskboardExcelVO) {
		List<TaskboardTask> taskboardTaskList = taskboardTaskRepository.getTaskForExcel(YorosisContext.get().getTenantId(), YorosisConstants.YES,
				taskboardExcelVO.getTaskboardId(), taskboardExcelVO.getWorkspaceId());
		return TaskboardExcelVO.builder().isEmptyTaskboard(taskboardTaskList.isEmpty()).build();
	}

	public void getExcel(TaskboardExcelVO taskboardExcelVO, HttpServletResponse response) throws YoroFlowException, ParseException {
		List<Map<String, String>> excelDataList = new ArrayList<>();

		List<ReportHeadersVo> reportHeaders = new ArrayList<>();
		List<TaskboardTask> taskboardTaskList = taskboardTaskRepository.getTaskForExcel(YorosisContext.get().getTenantId(), YorosisConstants.YES,
				taskboardExcelVO.getTaskboardId(), taskboardExcelVO.getWorkspaceId());
		for (TaskboardTask task : taskboardTaskList) {
			Map<String, String> dataMap = new LinkedHashMap<>();
			dataMap.put("taskId", task.getTaskId());
			dataMap.put("taskname", task.getTaskName());
			dataMap.put("status", task.getStatus());
			dataMap.put("subStatus", task.getSubStatus());
			dataMap.put("labels", getLabels(task));
			dataMap.put("assignedTo", getAssignedTo(task));
			dataMap.put("startDate", task.getStartDate() != null ? setDateFormat(task.getStartDate().toString()) : "");
			dataMap.put("dueDate", task.getDueDate() != null ? setDateFormat(task.getDueDate().toString()) : "");
			dataMap.put("taskType", StringUtils.equals(task.getTaskType(), "parentTask") ? "Task" : "Sub Task");
			dataMap.put("taskCreatedBy", getUserName(task.getCreatedBy()));
			dataMap.put("taskModifiedBy", getUserName(task.getModifiedBy()));
			dataMap.put("taskCreatedOn", task.getCreatedOn() != null ? setDateTimeFormat(task.getCreatedOn().toString()) : "");
			dataMap.put("taskModifiedOn", task.getModifiedOn() != null ? setDateTimeFormat(task.getModifiedOn().toString()) : "");
			excelDataList.add(dataMap);
		}
		reportHeaders.add(ReportHeadersVo.builder().headerId("taskId").headerName("Task Id").build());
		reportHeaders.add(ReportHeadersVo.builder().headerId("taskname").headerName("Taskname").build());
		reportHeaders.add(ReportHeadersVo.builder().headerId("status").headerName("Status").build());
		reportHeaders.add(ReportHeadersVo.builder().headerId("subStatus").headerName("Sub Status").build());
		reportHeaders.add(ReportHeadersVo.builder().headerId("labels").headerName("Labels").build());
		reportHeaders.add(ReportHeadersVo.builder().headerId("assignedTo").headerName("Assigned To").build());
		reportHeaders.add(ReportHeadersVo.builder().headerId("startDate").headerName("Start Date").build());
		reportHeaders.add(ReportHeadersVo.builder().headerId("dueDate").headerName("Due Date").build());
		reportHeaders.add(ReportHeadersVo.builder().headerId("taskType").headerName("Task Type").build());
		reportHeaders.add(ReportHeadersVo.builder().headerId("taskCreatedBy").headerName("Task Created By").build());
		reportHeaders.add(ReportHeadersVo.builder().headerId("taskModifiedBy").headerName("Task Modified By").build());
		reportHeaders.add(ReportHeadersVo.builder().headerId("taskCreatedOn").headerName("Task Created On").build());
		reportHeaders.add(ReportHeadersVo.builder().headerId("taskModifiedOn").headerName("Task Modified On").build());

		ReportGenerationVo report = ReportGenerationVo.builder().reportName("task").data(excelDataList).reportHeaders(reportHeaders).build();
		getExcel(report, response);
	}

	public void getExcel(ReportGenerationVo reportData, HttpServletResponse response) throws YoroFlowException, ParseException {
		if (!CollectionUtils.isEmpty(reportData.getData()) || !CollectionUtils.isEmpty(reportData.getReportHeaders())) {
			List<Map<String, String>> data = reportData.getData();
			try (SXSSFWorkbook workbook = new SXSSFWorkbook(10000);) {
				SXSSFSheet sheet = workbook.createSheet(reportData.getReportName());
				List<Integer> dateColumn = new ArrayList<>();
				int iSheet = 0;

				for (Map.Entry<String, String> entry : data.get(0).entrySet()) {
					if (StringUtils.contains(entry.getValue(), "0Z")) {
						dateColumn.add(iSheet);
					}
					sheet.setColumnWidth(iSheet++, 3500);
				}

				Row row = sheet.createRow(0);
				row.setHeightInPoints(20f);
				int irow = 0;

				for (Map.Entry<String, String> entry : data.get(0).entrySet()) {
					for (ReportHeadersVo key : reportData.getReportHeaders()) {
						if (StringUtils.equals(key.getHeaderId(), entry.getKey()))
							row.createCell(irow++).setCellValue(key.getHeaderName());
					}
				}
				CreationHelper createHelper = workbook.getCreationHelper();

				short dateFormat = createHelper.createDataFormat().getFormat("MM/dd/yyyy");

				CellStyle cellStyle = workbook.createCellStyle();
				cellStyle.setDataFormat(dateFormat);
				Font font = workbook.createFont();
				cellStyle.setFont(font);
				cellStyle.setAlignment(HorizontalAlignment.LEFT);
				cellStyle.setWrapText(true);

				CellStyle rowCellStyle = workbook.createCellStyle();
				Font rowFont = workbook.createFont();
				rowFont.setBold(true);
				rowCellStyle.setFont(rowFont);
				rowCellStyle.setFillBackgroundColor(IndexedColors.BRIGHT_GREEN.getIndex());
				for (int i = 0; i < row.getLastCellNum(); i++) {
					row.getCell(i).setCellStyle(rowCellStyle);
				}

				int rownum = 1;
				for (int i = 0; i < data.size(); i++) {
					row = sheet.createRow(rownum++);
					int colnum = 0;
					for (Map.Entry<String, String> entry : data.get(i).entrySet()) {
						if (dateColumn.contains(colnum) && !StringUtils.isEmpty(entry.getValue())) {
							Cell dateCell = row.createCell(colnum++);
							Date parseDate = new SimpleDateFormat("yyyy-MM-dd").parse(entry.getValue().substring(0, 10));
							String dateString = new SimpleDateFormat("dd MMM yyyy").format(parseDate);
							dateCell.setCellValue(dateString);
							dateCell.setCellStyle(cellStyle);
						} else {
							row.createCell(colnum++).setCellValue(entry.getValue());
						}
					}
				}
				response.setHeader("content-disposition", "attachment; filename=" + reportData.getReportName() + ".xlsx");

				for (int x = 0; x < sheet.getRow(0).getPhysicalNumberOfCells(); x++) {
					sheet.trackAllColumnsForAutoSizing();
					sheet.autoSizeColumn(x);
				}

				workbook.write(response.getOutputStream());
				workbook.dispose();
			} catch (IOException ie) {
				throw new YoroFlowException("File is invalid");
			}

		}
	}

	private String setDateFormat(String date) throws ParseException {
		Date parseDate = new SimpleDateFormat("yyyy-MM-dd").parse(date.substring(0, 10));
		return new SimpleDateFormat("dd MMM yyyy").format(parseDate);
	}

	private String setDateTimeFormat(String date) throws ParseException {
		Date parseDate = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss.S").parse(date);
		return new SimpleDateFormat("MM/dd/yyyy HH:mm a").format(parseDate);
	}

	private String getLabelName(TaskboardTaskLabels labels) {
		return labels.getLabelName();
	}

	private String getLabels(TaskboardTask taskboardTask) {
		return taskboardTaskLabelsRepository.getTaskboardTaskLabels(taskboardTask.getId(), YorosisContext.get().getTenantId(), YorosisConstants.YES).stream()
				.map(this::getLabelName).collect(Collectors.joining(", "));
	}

	private String getUserName(TaskboardTaskAssignedUsers taskboardTaskAssignedUsers) {
		User user = userRepository.findByUserIdAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(taskboardTaskAssignedUsers.getUserId(), YorosisConstants.YES,
				YorosisContext.get().getTenantId());
		return user != null ? user.getFirstName() + " " + user.getLastName() : "";
	}

	private String getUserName(String username) {
		if (username.contains("@")) {
			User user = userRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(username, YorosisContext.get().getTenantId(),
					YorosisConstants.YES);
			return user != null ? user.getFirstName() + " " + user.getLastName() : "";
		}
		return username;
	}

	private String getAssignedTo(TaskboardTask taskboardTask) {
		return taskboardTask.getTaskboardTaskAssignedUsers().stream()
				.filter(assignedUserTask -> assignedUserTask.getUserId() != null && StringUtils.equals(assignedUserTask.getActiveFlag(), YorosisConstants.YES))
				.map(this::getUserName).collect(Collectors.joining(", "));
	}
}