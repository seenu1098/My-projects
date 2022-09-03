package com.yorosis.yoroflow.services;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.sql.Timestamp;
import java.text.ParseException;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import javax.annotation.PostConstruct;
import javax.imageio.ImageIO;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.yorosis.yoroapps.apps.vo.AppsVo;
import com.yorosis.yoroapps.apps.vo.YoroGroupMapVo;
import com.yorosis.yoroapps.vo.LicenseVO;
import com.yorosis.yoroapps.vo.SubscriptionExpireVO;
import com.yorosis.yoroapps.vo.WorkflowNamesVO;
import com.yorosis.yoroflow.entities.CounterValues;
import com.yorosis.yoroflow.entities.ProcessDefPrmsn;
import com.yorosis.yoroflow.entities.ProcessDefTaskPrmsn;
import com.yorosis.yoroflow.entities.ProcessDefTaskProperty;
import com.yorosis.yoroflow.entities.ProcessDefinition;
import com.yorosis.yoroflow.entities.ProcessDefinitionTask;
import com.yorosis.yoroflow.entities.ProcessInstance;
import com.yorosis.yoroflow.entities.ProcessInstanceTask;
import com.yorosis.yoroflow.entities.User;
import com.yorosis.yoroflow.entities.UserGroup;
import com.yorosis.yoroflow.entities.UsersWorkflowPin;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.CounterTaskVO;
import com.yorosis.yoroflow.models.EnablePinVO;
import com.yorosis.yoroflow.models.EnvVariableRequestVO;
import com.yorosis.yoroflow.models.ExcelFileManagerVO;
import com.yorosis.yoroflow.models.FieldVO;
import com.yorosis.yoroflow.models.GroupVO;
import com.yorosis.yoroflow.models.ManualLaunchVo;
import com.yorosis.yoroflow.models.PageFieldVo;
import com.yorosis.yoroflow.models.PermissionVO;
import com.yorosis.yoroflow.models.Process;
import com.yorosis.yoroflow.models.ProcessDefTaskPropertyVO;
import com.yorosis.yoroflow.models.ProcessDefinitionVO;
import com.yorosis.yoroflow.models.ProcessInstanceResponse;
import com.yorosis.yoroflow.models.ProcessInstanceUserTaskVO;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.models.SMSKeyWorkflowVO;
import com.yorosis.yoroflow.models.Status;
import com.yorosis.yoroflow.models.TableObjectsColumnsVO;
import com.yorosis.yoroflow.models.TableObjectsVO;
import com.yorosis.yoroflow.models.Task;
import com.yorosis.yoroflow.models.TaskDetailsRequest;
import com.yorosis.yoroflow.models.TaskDetailsResponse;
import com.yorosis.yoroflow.models.TaskNode;
import com.yorosis.yoroflow.models.TaskType;
import com.yorosis.yoroflow.models.TimeZoneVo;
import com.yorosis.yoroflow.models.UserCustomAttributeVO;
import com.yorosis.yoroflow.models.UsersVO;
import com.yorosis.yoroflow.models.WebHookVo;
import com.yorosis.yoroflow.models.WorkFlow;
import com.yorosis.yoroflow.models.YoroDataType;
import com.yorosis.yoroflow.models.YoroFlowException;
import com.yorosis.yoroflow.repository.CounterValuesRepository;
import com.yorosis.yoroflow.repository.GroupRepository;
import com.yorosis.yoroflow.repository.ProcessDefinitionPermissionRepository;
import com.yorosis.yoroflow.repository.ProcessDefinitionRepo;
import com.yorosis.yoroflow.repository.ProcessDefinitionTaskRepo;
import com.yorosis.yoroflow.repository.ProcessInstanceRepo;
import com.yorosis.yoroflow.repository.ProcessInstanceTaskRepo;
import com.yorosis.yoroflow.repository.UserGroupRepository;
import com.yorosis.yoroflow.repository.UsersRepository;
import com.yorosis.yoroflow.repository.UsersWorkflowPinRepository;
import com.yorosis.yoroflow.repository.WorkspaceRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;
import com.yorosis.yoroflow.service.type.StartTypeService;
import com.yorosis.yoroflow.service.type.TaskService;
import com.yorosis.yoroflow.service.variables.InitiatedVariableService;
import com.yorosis.yoroflow.service.variables.SystemVariableService;

import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;

@Service
@Slf4j
public class WorkflowService {

	private static final String FORM_IDENTIFIER = "formIdentifier";
	private static final String ASSIGNEE_GROUP = "assigneeGroup";
	private static final String ASSIGNEE_USER = "assigneeUser";
	private static final String PUBLISHED = "published";
	private static final String LAUNCH = "LAUNCH";
	private static final String MAIN_SECTION = "mainSection";
	private static final String SUB_SECTION = "subSection";
	private static final String TABLE_CONTROL = "tableControl";
	private static final String DEFAULT_GROUP = "040e0ad6-e4c2-475f-a8d2-9e4c2505ae5b";

	@Autowired
	private ProcessDefinitionRepo processDefinitionRepo;

	@Autowired
	private CounterValuesRepository processInstanceCounterRepository;

	@Autowired
	private ProcessDefinitionTaskRepo processDefinitionTaskRepo;

	@Autowired
	private ProcessInstanceRepo processInstanceRepo;

	@Autowired
	private UsersRepository userRepository;

	@Autowired
	private UserGroupRepository userGroupRepository;

	@Autowired
	private ProcessInstanceTaskRepo processInstanceTaskRepo;

	@Autowired
	private ProcessDefinitionPermissionRepository processDefPrmsnRepository;

	@Autowired
	private FlowHelper flowHelper;

	@Autowired
	private FlowEngineService flowEngineService;

	Map<TaskType, TaskService> mapTaskService = new EnumMap<>(TaskType.class);

	@Autowired
	List<TaskService> listTaskService;

	@Autowired
	private UserService userService;

	@Autowired
	private YoroappsServiceClient yoroappsServiceClient;

	@Autowired
	private SystemVariableService systemVariableService;

	@Autowired
	private InitiatedVariableService initiatedVariableService;

	@Autowired
	private AdminService adminService;

	@Autowired
	private StartTypeService startTypeService;

	@Autowired
	private ObjectMapper objMapper;

	@Autowired
	private UserCustomAttributeService userCustomAttributeService;

	@Autowired
	private OrgCustomAttributeService orgCustomAttributeService;

	@Autowired
	private UsersWorkflowPinRepository usersWorkflowPinRepository;

	@Autowired
	private RenderingServiceClient renderingServiceClient;

	@Autowired
	private TaskListService taskListService;

	@Autowired
	private ProxyYoroflowSchemaService proxyYoroflowSchemaService;

	@Autowired
	private GroupRepository groupRepository;

	@Autowired
	private WorkflowActivityLogService workflowActivityLogService;

	@Autowired
	private WorkspaceRepository workspaceRepository;

	@PostConstruct
	private void initialize() {
		listTaskService.stream().forEach(s -> mapTaskService.put(s.getTaskType(), s));
	}

	private ProcessDefinitionVO constructProcessDefinitionListDTOToVO(ProcessDefinition processDefinition,
			List<String> processDefinitionKey, Boolean forLaunch) {
		JsonNode propertyValue = null;
		for (ProcessDefinitionTask processDefinitionTask : processDefinition.getProcessDefinitionTasks()) {
			if (StringUtils.equalsIgnoreCase(processDefinitionTask.getTaskType(), "START_TASK")) {
				if (!processDefinitionTask.getTaskProperties().isEmpty()) {
					propertyValue = processDefinitionTask.getTaskProperties().get(0).getPropertyValue();
				}
			}
		}

		ProcessDefinitionVO processDefinitionVO = ProcessDefinitionVO.builder()
				.processDefinitionId(processDefinition.getProcessDefinitionId())
				.propertyType(processDefinition.getStartType())
				.processDefinitionName(processDefinition.getProcessDefinitionName()).key(processDefinition.getKey())
				.workflowVersion(processDefinition.getWorkflowVersion()).status(processDefinition.getStatus()).build();
		if (propertyValue != null && propertyValue.has("initialLaunchButton")) {
			processDefinitionVO.setLaunchButtonName(propertyValue.get("initialLaunchButton").asText());
			processDefinitionVO.setWorkspaceId(processDefinition.getWorkspaceId());
		}
		if (BooleanUtils.isTrue(forLaunch)) {
			processDefinitionVO.setCanLaunch(true);
		} else {
			updateProcessDefPermission(processDefinition, processDefinitionVO);
		}
		if (StringUtils.equals(processDefinition.getStartType(), "manual")) {
			processDefinitionVO.setCanLaunch(true);
		} else {
			processDefinitionVO.setCanLaunch(false);
		}

		if (StringUtils.equals(processDefinitionVO.getStatus(), "published")
				&& processDefinitionKey.contains(processDefinitionVO.getKey())) {
			processDefinitionVO.setCanEdit(false);
		}
		return processDefinitionVO;
	}

	private ProcessDefinitionVO constructProcessDefinitionListDTOToVO(ProcessDefinition processDefinition)
			throws JsonProcessingException {
		return ProcessDefinitionVO.builder().processDefinitionId(processDefinition.getProcessDefinitionId())
				.processDefinitionName(processDefinition.getProcessDefinitionName()).key(processDefinition.getKey())
				.workflowVersion(processDefinition.getWorkflowVersion()).updatedDate(processDefinition.getUpdatedDate())
				.status(processDefinition.getStatus()).approve(processDefinition.getApprove())
				.uploadWorkflow(processDefinition.getUploadWorkflow()).install(processDefinition.getInstall()).build();
	}

	private void updateProcessDefPermission(ProcessDefinition processDefinition,
			ProcessDefinitionVO processDefinitionVO) {
		List<UUID> uuidList = userService.getLoggedInUserDetails().getGroupVOList().stream().map(GroupVO::getGroupId)
				.collect(Collectors.toList());

		List<ProcessDefPrmsn> listProcessDefPermission = processDefinition.getProcessPermission();
		uuidList.stream()
				.forEach(uuid -> listProcessDefPermission.stream()
						.filter(s -> StringUtils.equalsIgnoreCase(s.getPublishAllowed(), YorosisConstants.YES)
								&& StringUtils.equals(uuid.toString(), s.getGroupId().toString()))
						.findFirst().ifPresent(s -> processDefinitionVO.setCanPublish(true)));

		uuidList.stream()
				.forEach(uuid -> listProcessDefPermission.stream()
						.filter(s -> StringUtils.equalsIgnoreCase(s.getLaunchAllowed(), YorosisConstants.YES)
								&& StringUtils.equals(uuid.toString(), s.getGroupId().toString()))
						.findFirst().ifPresent(s -> processDefinitionVO.setCanLaunch(true)));
		uuidList.stream()
				.forEach(uuid -> listProcessDefPermission.stream()
						.filter(s -> StringUtils.equalsIgnoreCase(s.getUpdateAllowed(), YorosisConstants.YES)
								&& StringUtils.equals(uuid.toString(), s.getGroupId().toString()))
						.findFirst().ifPresent(s -> processDefinitionVO.setCanEdit(true)));

	}

	private ProcessDefinition constructProcessTOProcessDefinition(Process processModel) {
		return ProcessDefinition.builder().processDefinitionName(processModel.getName()).key(processModel.getKey())
				.createdBy(YorosisContext.get().getUserName()).updatedBy(YorosisContext.get().getUserName())
				.status("draft").workflowVersion(1L).startTaskKey(processModel.getStartKey())
				.startType(processModel.getStartType()).activeFlag(YorosisConstants.YES)
				.tenantId(YorosisContext.get().getTenantId()).userName(YorosisContext.get().getUserName())
				.workflowStructure(processModel.getWorkflowStructure()).build();
	}

	private ProcessDefPrmsn constructProcessTOProcessDefinitionPermission(ProcessDefinition processDefinition) {
		LocalDateTime timestamp = LocalDateTime.now();
		return ProcessDefPrmsn.builder().processDefinition(processDefinition).activeFlag(YorosisConstants.YES)
				.createdDate(timestamp).updatedDate(timestamp).tenantId(YorosisContext.get().getTenantId())
				.publishAllowed(YorosisConstants.YES).updateAllowed(YorosisConstants.YES)
				.readAllowed(YorosisConstants.YES).launchAllowed(YorosisConstants.YES)
				.createdBy(YorosisContext.get().getUserName()).updatedBy(YorosisContext.get().getUserName()).build();
	}

	@Transactional
	public ResponseStringVO saveProcessDefinition(JsonNode workflowJson, UUID workspaceId)
			throws JsonProcessingException {

		Process processModel = flowHelper.convertFlowModel(workflowJson);

		WorkFlow workFlow = objMapper.convertValue(workflowJson, WorkFlow.class);
		ProcessDefinition processDefinition = null;
		if (workFlow.getWorkflowId() == null) {
			LicenseVO licenseVO = isSaveAllowed();
			if (StringUtils.equals(licenseVO.getResponse(), "within the limit")) {
				processDefinition = constructProcessTOProcessDefinition(processModel);
				processDefinition.setWorkflowVersion(1L);
				processDefinition.setWorkspaceId(workspaceId);
				if (!StringUtils.equalsIgnoreCase(workFlow.getUploadWorkflow(), null)) {
					processDefinition.setUploadWorkflow(workFlow.getUploadWorkflow());
				}
				return ResponseStringVO.builder().uuid(saveProcessDefPrmsn(processDefinition))
						.response("workflow created successfully").build();
			} else {
				return ResponseStringVO.builder().uuid(null).licenseVO(licenseVO)
						.response("You have exceeded your limit").build();
			}
		} else {
			ProcessDefinition updateProcessDefinition = processDefinitionRepo.getOne(workFlow.getWorkflowId());
			if (StringUtils.equals(updateProcessDefinition.getStatus(), YorosisConstants.DRAFT)) {
				updateProcessDefinition.setProcessDefinitionName(processModel.getName());
				updateProcessDefinition.setKey(processModel.getKey());
				updateProcessDefinition.setCreatedBy(YorosisContext.get().getUserName());
				updateProcessDefinition.setUpdatedBy(YorosisContext.get().getUserName());
				updateProcessDefinition.setStatus(YorosisConstants.DRAFT);
				updateProcessDefinition.setStartTaskKey(processModel.getStartKey());
				updateProcessDefinition.setStartType(processModel.getStartType());
				updateProcessDefinition.setWorkflowStructure(processModel.getWorkflowStructure());
				updateProcessDefinition.setWorkspaceId(workspaceId);
				processDefinitionRepo.save(updateProcessDefinition);
				return ResponseStringVO.builder().uuid(updateProcessDefinition.getProcessDefinitionId())
						.response("workflow updated successfully").build();
			} else {
				List<ProcessDefinition> processDefinitionList = processDefinitionRepo
						.findBykeyAndTenantIdAndActiveFlagIgnoreCase(workFlow.getKey(),
								YorosisContext.get().getTenantId(), YorosisConstants.YES);
				processDefinition = constructProcessTOProcessDefinition(processModel);
				processDefinition.setWorkspaceId(workspaceId);
				processDefinition.setWorkflowVersion(processDefinitionList.size() + 1L);
				processDefinitionRepo.save(processDefinition);
				for (ProcessDefPrmsn oldprocessDefPrmsn : processDefPrmsnRepository.checkWorkflowSecurityExist(
						updateProcessDefinition.getProcessDefinitionId(), YorosisConstants.YES,
						YorosisContext.get().getTenantId())) {
					LocalDateTime timestamp = LocalDateTime.now();
					ProcessDefPrmsn processDefPrmsn = ProcessDefPrmsn.builder().build();
					processDefPrmsn.setUpdatedBy(YorosisContext.get().getUserName());
					processDefPrmsn.setUpdatedDate(timestamp);
					processDefPrmsn.setProcessDefinition(processDefinition);
					processDefPrmsn.setActiveFlag(YorosisConstants.YES);
					processDefPrmsn.setTenantId(YorosisContext.get().getTenantId());
					processDefPrmsn.setCreatedBy(YorosisContext.get().getUserName());
					processDefPrmsn.setCreatedDate(timestamp);
					processDefPrmsn.setGroupId(oldprocessDefPrmsn.getGroupId());
					processDefPrmsn.setLaunchAllowed(oldprocessDefPrmsn.getLaunchAllowed());
					processDefPrmsn.setPublishAllowed(oldprocessDefPrmsn.getPublishAllowed());
					processDefPrmsn.setReadAllowed(oldprocessDefPrmsn.getReadAllowed());
					processDefPrmsn.setUpdateAllowed(oldprocessDefPrmsn.getUpdateAllowed());
					processDefPrmsnRepository.save(processDefPrmsn);
				}
				return ResponseStringVO.builder().uuid(processDefinition.getProcessDefinitionId())
						.response("workflow updated successfully").build();
			}
		}
	}

	private UUID saveProcessDefPrmsn(ProcessDefinition processDefinition) {
		ProcessDefPrmsn processDefPrmsn = null;
		processDefinitionRepo.save(processDefinition);

		if (processDefinition.getProcessDefinitionId() != null) {
			processDefPrmsn = constructProcessTOProcessDefinitionPermission(processDefinition);

			User user = userRepository.findByUserName(YorosisContext.get().getUserName());
			List<UserGroup> userGroups = userGroupRepository.getUserGroup(user.getUserId(),
					YorosisContext.get().getTenantId());
			// 040e0ad6-e4c2-475f-a8d2-9e4c2505ae5b
			if (userGroups != null && !userGroups.isEmpty()) {
				for (UserGroup userGroup : userGroups) {
					processDefPrmsn.setGroupId(userGroup.getGroup().getGroupId());
					processDefPrmsnRepository.save(processDefPrmsn);
				}
			} else {
				UserGroup userGroup = constructVOTODTO();
				userGroup.setGroup(groupRepository.getOne(UUID.fromString(DEFAULT_GROUP)));
				userGroup.setUser(userRepository.getOne(user.getUserId()));
				userGroupRepository.save(userGroup);
				processDefPrmsn.setGroupId(UUID.fromString(DEFAULT_GROUP));
				processDefPrmsnRepository.save(processDefPrmsn);
			}
		}

		return processDefinition.getProcessDefinitionId();
	}

	private UserGroup constructVOTODTO() {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return UserGroup.builder().createdBy(YorosisContext.get().getUserName()).activeFlag(YorosisConstants.YES)
				.updatedBy(YorosisContext.get().getUserName()).createdDate(timestamp).updatedDate(timestamp)
				.tenantId(YorosisContext.get().getTenantId()).build();
	}

	private List<ProcessDefinitionTask> getTaskList(Process processModel, ProcessDefinition processDefinition)
			throws YoroFlowException {
		List<Task> taskList = processModel.getTaskList();

		List<ProcessDefinitionTask> procDefList = new ArrayList<>();
		List<ProcessDefTaskPrmsn> listProcessDefTaskPrmsn = new ArrayList<>();
		for (Task task : taskList) {
			List<ProcessDefTaskProperty> taskPropertyList = new ArrayList<>();

			ProcessDefinitionTask processDefTask = ProcessDefinitionTask.builder()
					.tenantId(YorosisContext.get().getTenantId()).taskType(task.getTaskType().toString())
					.taskStepKey(task.getKey()).taskName(task.getName()).targetStepKey(task.getTargetTask())
					.processDefinition(processDefinition).build();

			if (task.getTaskProperty() != null) {
				createTaskProperty(task, processDefTask, processDefinition, taskPropertyList);
				listProcessDefTaskPrmsn = createTaskPermission(taskPropertyList, processDefTask);
			}

			if (!CollectionUtils.isEmpty(taskPropertyList)) {
				processDefTask.setTaskProperties(taskPropertyList);
			}

			if (!CollectionUtils.isEmpty(listProcessDefTaskPrmsn)) {
				processDefTask.setListProcessDefTaskPrms(listProcessDefTaskPrmsn);
			}

			procDefList.add(processDefTask);
		}

		return procDefList;
	}

	private void createTaskProperty(Task task, ProcessDefinitionTask processDefTask,
			ProcessDefinition processDefinition, List<ProcessDefTaskProperty> taskPropertyList)
			throws YoroFlowException {
		ProcessDefTaskPropertyVO taskProperty = task.getTaskProperty();

		if (taskProperty.getPropertyValue() != null) {
			JsonNode jsonObject = taskProperty.getPropertyValue();
			if (jsonObject.has(ASSIGNEE_USER)) {
				String user = jsonObject.get(ASSIGNEE_USER).asText();
				if (user != null) {
					processDefTask.setAssignedTo(user);
				}
			}

			if (jsonObject.has(ASSIGNEE_GROUP)) {
				List<String> groupList = new ArrayList<>();
				List<JsonNode> listAssigneeGroup = jsonObject.findValues(ASSIGNEE_GROUP);
				if (!CollectionUtils.isEmpty(listAssigneeGroup)) {
					for (JsonNode assigneeGroups : listAssigneeGroup) {
						for (JsonNode assigneeGroup : assigneeGroups) {
							if (assigneeGroup != null) {
								groupList.add(assigneeGroup.asText());
							}
						}
					}
				}
				if (!groupList.isEmpty()) {
					processDefTask.setAssignedToType(String.join(",", groupList));
				}
			}

			if (jsonObject.has(FORM_IDENTIFIER)) {
				processDefTask.setFormId(jsonObject.get(FORM_IDENTIFIER).asText());
			}

			if (jsonObject.has("schedulerExpression")) {
				processDefTask.setSchedulerExpression(jsonObject.get("schedulerExpression").asText());
			}

			if (StringUtils.equals(task.getTaskType().name(), "COUNTER_TASK")) {
				saveCounterTask(task.getTaskProperty(), processDefinition);
			}

			taskPropertyList.add(getTaskProperty(task.getTaskProperty(), processDefTask, processDefinition));
		}
	}

	private void saveCounterTask(ProcessDefTaskPropertyVO vo, ProcessDefinition processDefinition)
			throws YoroFlowException {
		try {
			CounterTaskVO counterTaskVO = objMapper.treeToValue(vo.getPropertyValue(), CounterTaskVO.class);
			if (counterTaskVO != null) {
				CounterValues counterValues = processInstanceCounterRepository.findByProcessDefinitionKey(
						processDefinition.getKey(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
				if (counterValues == null) {
					CounterValues processInstanceCounter = CounterValues.builder()
							.processDefinitionId(processDefinition.getProcessDefinitionId())
							.key(processDefinition.getKey()).counterType(counterTaskVO.getCounterType())
							.increaseCountBy(counterTaskVO.getCountIncreasedBy()).resetAt(counterTaskVO.getResetAt())
							.countStartAt(counterTaskVO.getCountStartAt()).counterName(counterTaskVO.getName())
							.timeZone(counterTaskVO.getTimeZone()).createdBy(YorosisContext.get().getUserName())
							.createdDate(LocalDateTime.now()).activeFlag(YorosisConstants.YES)
							.tenantId(YorosisContext.get().getTenantId()).build();
					processInstanceCounterRepository.save(processInstanceCounter);
				} else {
					counterValues.setProcessDefinitionId(processDefinition.getProcessDefinitionId());
					counterValues.setCounterName(counterTaskVO.getName());
					counterValues.setCounterType(counterTaskVO.getCounterType());
					counterValues.setResetAt(counterTaskVO.getResetAt());
					counterValues.setIncreaseCountBy(counterTaskVO.getCountIncreasedBy());
					counterValues.setUpdatedBy(YorosisContext.get().getUserName());
					counterValues.setUpdatedDate(LocalDateTime.now());
					counterValues.setTimeZone(counterTaskVO.getTimeZone());
					processInstanceCounterRepository.save(counterValues);
				}
			}
		} catch (JsonProcessingException e) {
			throw new YoroFlowException(ExceptionUtils.getRootCauseMessage(e));
		}
	}

	private List<ProcessDefTaskPrmsn> createTaskPermission(List<ProcessDefTaskProperty> taskProperties,
			ProcessDefinitionTask processDefTask) {
		List<ProcessDefTaskPrmsn> listProcessDefTaskPrmsn = new ArrayList<>();
		if (CollectionUtils.isEmpty(taskProperties)) {
			return listProcessDefTaskPrmsn;
		}

		// Assumption - only 1 property per Task Definition
		ProcessDefTaskProperty processDefTaskProperty = taskProperties.get(0);
		if (processDefTaskProperty.getPropertyValue() != null) {
			List<JsonNode> listAssigneeGroup = processDefTaskProperty.getPropertyValue().findValues(ASSIGNEE_GROUP);
			setGroupPermission(listAssigneeGroup, listProcessDefTaskPrmsn, processDefTask);

			JsonNode assigneeUser = processDefTaskProperty.getPropertyValue().get(ASSIGNEE_USER);
			setUserPermission(assigneeUser, listProcessDefTaskPrmsn, processDefTask);
		}

		return listProcessDefTaskPrmsn;
	}

	private void checkFormPermission(List<ProcessDefTaskProperty> taskProperties) {
		if (!CollectionUtils.isEmpty(taskProperties)) {
			ProcessDefTaskProperty processDefTaskProperty = taskProperties.get(0);
			if (processDefTaskProperty.getPropertyValue() != null) {
				JsonNode taskProperty = processDefTaskProperty.getPropertyValue();
				if (taskProperty.has("formIdentifier") && taskProperty.has("formVersion")
						&& !StringUtils.equals(taskProperty.get("formIdentifier").asText(), "null")
						&& !StringUtils.equals(taskProperty.get("formVersion").asText(), "null")) {

				}
			}
		}
	}

	private void setUserPermission(JsonNode assigneeUser, List<ProcessDefTaskPrmsn> listProcessDefTaskPrmsn,
			ProcessDefinitionTask processDefTask) {
		if (assigneeUser != null && !assigneeUser.isNull() && !StringUtils.equals(assigneeUser.asText(), "")) {
			ProcessDefTaskPrmsn permission = (ProcessDefTaskPrmsn.builder().tenantId(YorosisContext.get().getTenantId())
					.readAllowed(YorosisConstants.YES).executeAllowed(YorosisConstants.YES)
					.updateAllowed(YorosisConstants.YES).userId(UUID.fromString(assigneeUser.asText()))
					.processDefinitionTask(processDefTask).build());
			listProcessDefTaskPrmsn.add(permission);
		}
	}

	private void setGroupPermission(List<JsonNode> listAssigneeGroup, List<ProcessDefTaskPrmsn> listProcessDefTaskPrmsn,
			ProcessDefinitionTask processDefTask) {
		if (!CollectionUtils.isEmpty(listAssigneeGroup)) {
			for (JsonNode assigneeGroups : listAssigneeGroup) {
				for (JsonNode assigneeGroup : assigneeGroups) {
					if (assigneeGroup != null) {
						ProcessDefTaskPrmsn permission = ProcessDefTaskPrmsn.builder()
								.tenantId(YorosisContext.get().getTenantId()).readAllowed(YorosisConstants.YES)
								.executeAllowed(YorosisConstants.YES).groupId(UUID.fromString(assigneeGroup.asText()))
								.updateAllowed(YorosisConstants.YES).processDefinitionTask(processDefTask).build();
						listProcessDefTaskPrmsn.add(permission);
					}
				}
			}
		}
	}

	private ProcessDefTaskProperty getTaskProperty(ProcessDefTaskPropertyVO vo, ProcessDefinitionTask processDefTask,
			ProcessDefinition processDefinition) {
		return ProcessDefTaskProperty.builder().processDefinitionTask(processDefTask).propertyName(vo.getPropertyName())
				.propertyValue(vo.getPropertyValue()).createdBy(YorosisContext.get().getUserName())
				.tenantId(YorosisContext.get().getTenantId())
				.processDefinitionId(String.valueOf(processDefinition.getProcessDefinitionId()))
				.updatedBy(YorosisContext.get().getUserName()).build();
	}

	@Transactional
	public ResponseStringVO publishProcessDefinition(Long workflowVersion, String workflowKey, UUID workspaceId)
			throws JsonProcessingException, YoroFlowException {
		List<ProcessDefinition> processDefinitionList = processDefinitionRepo
				.findBykeyAndTenantIdAndActiveFlagIgnoreCase(workflowKey, YorosisContext.get().getTenantId(),
						YorosisConstants.YES);

		ProcessDefinition processDefinition = processDefinitionRepo.getProcessDefinitionByKeyAndVersion(workflowVersion,
				workflowKey, YorosisContext.get().getTenantId(), YorosisConstants.YES, workspaceId);

		validateProcessDefintion(processDefinition, workflowVersion, workflowKey);
		Process processModel = flowHelper
				.convertFlowModel(objMapper.readValue(processDefinition.getWorkflowStructure(), JsonNode.class));

		validateWorkflowDefinition(processModel);
		processDefinition.setProcessDefinitionTasks(getTaskList(processModel, processDefinition));
		for (ProcessDefinition processDefinitionByKey : processDefinitionList) {
			if (processDefinitionByKey.getStatus().equals(YorosisConstants.PUBLISHED)) {
				processDefinitionByKey.setStatus("old");
				processDefinitionRepo.save(processDefinitionByKey);
			}
		}

		processDefinition.setStatus(YorosisConstants.PUBLISHED);
		processDefinitionRepo.save(processDefinition);

		return ResponseStringVO.builder().response("Workflow published").build();
	}

	private void validateProcessDefintion(ProcessDefinition processDefinition, Long workflowVersion, String workflowKey)
			throws YoroFlowException {
		if (processDefinition == null) {
			throw new YoroFlowException(
					String.format("Workflow %s not found for version %s", workflowKey, workflowVersion));
		}

		if (StringUtils.equalsIgnoreCase(processDefinition.getStatus(), "published")) {
			throw new YoroFlowException(
					String.format("Workflow  %s already published  version %s", workflowKey, workflowVersion));
		}
	}

	@Transactional
	public UUID updateProcessDefinition(JsonNode workflowJson) {
		WorkFlow workFlow = objMapper.convertValue(workflowJson, WorkFlow.class);

		ProcessDefinition processDefinion = processDefinitionRepo.getOne(workFlow.getWorkflowId());
		processDefinion.setWorkflowStructure(workflowJson.toString());
		processDefinion.setWorkflowVersion(2L);
		processDefinitionRepo.save(processDefinion);

		return workFlow.getWorkflowId();
	}

	private void validateWorkflowDefinition(Process processModel) throws YoroFlowException {
		String missingField = null;

		if (StringUtils.isBlank(processModel.getName())) {
			missingField = "Name";
		} else if (StringUtils.isBlank(processModel.getStartKey())) {
			missingField = "Start Key";
		}

		if (StringUtils.isNotBlank(missingField)) {
			throw new YoroFlowException(String.format("Missing mandatory field %s", missingField));
		}
	}

	public ProcessInstanceResponse startProcess(String processDefinitionKey, Long workflowVersion,
			UUID initiatedProcessInstanceID, UUID workspaceId) throws YoroFlowException {
		ProcessDefinition processDefinition = processDefinitionRepo.getProcessDefinitionByKeyAndVersion(workflowVersion,
				processDefinitionKey, YorosisContext.get().getTenantId(), YorosisConstants.YES, workspaceId);

		if (processDefinition != null) {
			ProcessInstance processInstance = new ProcessInstance();
			processInstance.setStartedBy(YorosisContext.get().getUserName());
			processInstance.setStartTime(LocalDateTime.now());
			processInstance.setInitiatedProcessInstanceID(initiatedProcessInstanceID);
			processInstance.setStatus(Status.IN_PROCESS.toString());
			processInstance.setProcessDefinition(processDefinition);
			processInstance.setProcessInstanceTasks(getListTask(processInstance,
					processDefinition.getProcessDefinitionId(), processDefinition.getStartTaskKey()));
			processInstance.setTenantId(YorosisContext.get().getTenantId());
			processInstance.setCreatedBy(YorosisContext.get().getUserName());
			processInstance.setUpdatedBy(YorosisContext.get().getUserName());

			processInstanceRepo.save(processInstance);
			return ProcessInstanceResponse.builder().instanceId(processInstance.getProcessInstanceId())
					.instanceTaskId(processInstance.getProcessInstanceTasks().get(0).getProcessInstanceTaskId())
					.build();
		} else {
			throw new YoroFlowException("Process definition not found " + processDefinitionKey);
		}
	}

	@Transactional
	public WebHookVo getWebHook(String processDefinitionKey, Long workflowVersion, UUID workspaceId)
			throws JsonProcessingException {
		ProcessDefinition processDefinition = processDefinitionRepo.getProcessDefinitionByKeyAndVersion(workflowVersion,
				processDefinitionKey, YorosisContext.get().getTenantId(), YorosisConstants.YES, workspaceId);

		if (processDefinition != null && StringUtils.equals(processDefinition.getStartType(), "launch")) {
			WorkFlow workFlow = objMapper.readValue(processDefinition.getWorkflowStructure(), WorkFlow.class);
			if (workFlow != null) {
				Optional<TaskNode> optionalTaskNode = flowHelper.getFieldInfoForEachTask(workFlow.getTaskNodeList(),
						processDefinition.getStartTaskKey());
				if (optionalTaskNode.isPresent() && StringUtils.equalsIgnoreCase(optionalTaskNode.get().getTaskType(),
						YorosisConstants.START_TASK)) {
					JsonNode jsonNode = optionalTaskNode.get().getTaskProperty().getPropertyValue();
					if (jsonNode.has("jsonText")) {
						return WebHookVo.builder().webHook(jsonNode.get("jsonText")).status("proceed").build();
					}
				}
			}
		}

		return WebHookVo.builder().status("proceed").build();
	}

	@Transactional
	public TaskDetailsResponse startProcess(String processDefinitionKey, Long workflowVersion, JsonNode webHookPayload,
			UUID initiatedProcessInstanceID, UUID workspaceId)
			throws YoroFlowException, ParseException, JsonMappingException, JsonProcessingException {
		if (workflowVersion == null) {
			ProcessDefinition processDefinition = processDefinitionRepo.getLatestProcessDefinitionByKey(
					processDefinitionKey, YorosisContext.get().getTenantId(), YorosisConstants.YES);
			workflowVersion = processDefinition.getWorkflowVersion();
		}

		ProcessInstanceResponse procInstanceResponse = this.startProcess(processDefinitionKey, workflowVersion,
				initiatedProcessInstanceID, workspaceId);

		TaskDetailsRequest taskDetailsRequest = TaskDetailsRequest.builder()
				.instanceId(procInstanceResponse.getInstanceId())
				.instanceTaskId(procInstanceResponse.getInstanceTaskId()).taskData(webHookPayload).build();
		if (checkPublicForm(processDefinitionKey) && !webHookPayload.has("A") && !webHookPayload.has("B")) {
			return flowEngineService.completeTask(taskDetailsRequest);
		}
		TaskDetailsResponse taskDetailsResponse = flowEngineService.checkStartTask(taskDetailsRequest,
				checkPublicForm(processDefinitionKey));
		if (taskDetailsResponse != null) {
			return taskDetailsResponse;
		} else {
			return flowEngineService.completeTask(taskDetailsRequest);
		}
	}

	public boolean checkPermission(ProcessInstanceResponse procInstanceResponse) {
		ProcessInstanceTask instanceTask = processInstanceTaskRepo
				.findByProcessInstanceTaskId(procInstanceResponse.getInstanceTaskId());
		instanceTask.getProcessDefinitionTask().getTaskId();

		return false;
	}

	private List<ProcessInstanceTask> getListTask(ProcessInstance processInstance, UUID processDefinitionId,
			String taskKey) {
		ProcessInstanceTask procInstanceTask = new ProcessInstanceTask();
		procInstanceTask.setProcessInstance(processInstance);
		procInstanceTask.setStartTime(LocalDateTime.now());
		procInstanceTask.setCreatedBy(YorosisContext.get().getUserName());
		procInstanceTask.setUpdatedBy(YorosisContext.get().getUserName());
		procInstanceTask.setTenantId(YorosisContext.get().getTenantId());
		procInstanceTask.setProcessDefinitionTask(processDefinitionTaskRepo.getProcessTask(processDefinitionId, taskKey,
				YorosisContext.get().getTenantId()));

		List<ProcessInstanceTask> listTasks = new ArrayList<>();
		listTasks.add(procInstanceTask);

		return listTasks;
	}

	@Transactional
	public WorkFlow getProcessDefinition(Long workflowVersion, String workflowKey, UUID workspaceId)
			throws JsonProcessingException {
		ProcessDefinition processDefinition = processDefinitionRepo.getProcessDefinitionByKeyAndVersion(workflowVersion,
				workflowKey, YorosisContext.get().getTenantId(), YorosisConstants.YES, workspaceId);
		ProcessDefinitionVO processDefinitionVO = ProcessDefinitionVO.builder().build();

		updateProcessDefPermission(processDefinition, processDefinitionVO);

		WorkFlow workFlow = objMapper.readValue(processDefinition.getWorkflowStructure(), WorkFlow.class);
		workFlow.setCanPublish(processDefinitionVO.isCanPublish());
		workFlow.setWorkflowId(processDefinition.getProcessDefinitionId());
		workFlow.setStatus(processDefinition.getStatus());
		workFlow.setStartType(processDefinition.getStartType());
		workFlow.setUploadWorkflow(processDefinition.getUploadWorkflow());
		workFlow.setApprove(processDefinition.getApprove());

		return workFlow;
	}

	@Transactional
	public Map<String, Object> getFieldValue(UUID processInstanceTaskId, JsonNode fieldMappingNode) {
		ProcessInstanceTask processInstanceTask = processInstanceTaskRepo.getOne(processInstanceTaskId);
		List<ProcessInstanceTask> listInstanceProcessTask = processInstanceTaskRepo.getInstanceTaskByLastUpdateDate(
				processInstanceTask.getProcessInstance().getProcessInstanceId(), YorosisContext.get().getTenantId());

		Map<String, Object> fieldMappingWithValues = new HashMap<>();
		if (fieldMappingNode == null) {
			return fieldMappingWithValues;
		}
		Map<String, ValueType> mapFieldValues = getDataForInstanceTask(listInstanceProcessTask);
		Iterator<Entry<String, JsonNode>> entryNodeIterator = fieldMappingNode.fields();
		while (entryNodeIterator.hasNext()) {
			Entry<String, JsonNode> fieldMappingEntry = entryNodeIterator.next();
			if (processInstanceTask.getData() == null) {
				String resolvedValue = systemVariableService
						.resolveSystemVariable(fieldMappingEntry.getValue().asText());
				if (StringUtils.isBlank(resolvedValue))
					resolvedValue = initiatedVariableService.resolveInitiatedVariable(
							fieldMappingEntry.getValue().asText(),
							processInstanceTask.getProcessInstance().getProcessInstanceId());
				if (StringUtils.isBlank(resolvedValue)) {
					EnvVariableRequestVO envVariable = adminService.getEnvironmentVariable(
							processInstanceTask.getProcessInstance(), fieldMappingEntry.getValue().asText());
					if (envVariable != null && StringUtils.isNotBlank(envVariable.getValue())) {
						resolvedValue = envVariable.getValue();
					} else {
						UserCustomAttributeVO userCustomAttributeVO = userCustomAttributeService
								.getCustomAttribute(fieldMappingEntry.getValue().asText());
						if (userCustomAttributeVO != null && !StringUtils.isBlank(userCustomAttributeVO.getValue())) {
							resolvedValue = userCustomAttributeVO.getValue();
						}
					}
				}

				if (StringUtils.isNotBlank(resolvedValue)) {
					fieldMappingWithValues.put(fieldMappingEntry.getKey(), resolvedValue);
				} else {
					ValueType valueTypeValue = mapFieldValues.get(fieldMappingEntry.getValue().asText().toLowerCase());
					if (valueTypeValue != null) {
						JsonNode valueTypeValues = fieldMappingNode.get(fieldMappingEntry.getKey() + "ya");
						if (valueTypeValue.getValue() instanceof ArrayNode && valueTypeValues != null) {
							ArrayNode arrayNode = objMapper.createArrayNode();
							ObjectNode resolvedArrayValue = getInitialMapValuesForArray(processInstanceTask,
									valueTypeValues, mapFieldValues, fieldMappingEntry.getKey());
							ArrayNode node = objMapper.valueToTree(valueTypeValue.getValue());

							int arraySize = 1;
							for (int i = 0; i < arraySize; i++) {
								ObjectNode webHookPayload = JsonNodeFactory.instance.objectNode();
								Iterator<Entry<String, JsonNode>> entryNodeIteratorArray = valueTypeValues.fields();
								while (entryNodeIteratorArray.hasNext()) {
									boolean setArrayValues = false;
									Entry<String, JsonNode> fieldMappingEntryArray = entryNodeIteratorArray.next();
									if (resolvedArrayValue.get(fieldMappingEntryArray.getKey()) != null
											&& !StringUtils.isEmpty(
													resolvedArrayValue.get(fieldMappingEntryArray.getKey()).asText())) {
										if (resolvedArrayValue.get(fieldMappingEntryArray.getKey()).isArray()) {
											JsonNode valueTypeValuesImage = node.get(i)
													.get(fieldMappingEntryArray.getValue().asText());
											webHookPayload.putArray(fieldMappingEntryArray.getKey())
													.addAll(setArrayNodeValues(valueTypeValuesImage));
										} else {
											String value = resolvedArrayValue.get(fieldMappingEntryArray.getKey())
													.asText();
											webHookPayload.put(fieldMappingEntryArray.getKey(), value);
										}
									} else if (node.isArray()
											&& node.get(i).has(fieldMappingEntryArray.getValue().asText())) {
										if (node.get(i).get(fieldMappingEntryArray.getValue().asText()).isArray()) {
											JsonNode valueTypeValuesImage = node.get(i)
													.get(fieldMappingEntryArray.getValue().asText());
											webHookPayload.putArray(fieldMappingEntryArray.getKey())
													.addAll(setArrayNodeValues(valueTypeValuesImage));
										} else {
											if (node.get(i).get(fieldMappingEntryArray.getValue().asText())
													.isTextual()) {
												String value = node.get(i)
														.get(fieldMappingEntryArray.getValue().asText()).asText();
												webHookPayload.put(fieldMappingEntryArray.getKey(), value);
											} else {
												webHookPayload.set(fieldMappingEntryArray.getKey(),
														node.get(i).get(fieldMappingEntryArray.getValue().asText()));
											}
										}
										arraySize = node.size();
									} else if (node.isArray() && node.get(i).has(fieldMappingEntryArray.getKey())) {
										if (node.get(i).get(fieldMappingEntryArray.getKey()).isArray()) {
											JsonNode valueTypeValuesImage = node.get(i)
													.get(fieldMappingEntryArray.getValue().asText());
											webHookPayload.putArray(fieldMappingEntryArray.getKey())
													.addAll(setArrayNodeValues(valueTypeValuesImage));
										} else {
											String value = node.get(i).get(fieldMappingEntryArray.getKey()).asText();
											webHookPayload.put(fieldMappingEntryArray.getKey(), value);
										}
										arraySize = node.size();
									} else {
										for (String mapArrayValues : mapFieldValues.keySet()) {
											ValueType valueTypeValueForarray = mapFieldValues.get(mapArrayValues);
											if (!StringUtils.equals(mapArrayValues,
													fieldMappingEntry.getValue().asText().toLowerCase())
													&& valueTypeValueForarray != null
													&& valueTypeValueForarray.getValue() instanceof ArrayNode) {
												ArrayNode nodeArray = objMapper
														.valueToTree(valueTypeValueForarray.getValue());
												if (nodeArray.isArray() && nodeArray.get(i) != null && nodeArray.get(i)
														.has(fieldMappingEntryArray.getValue().asText())) {
													setArrayValues = true;
													if (nodeArray.get(i).get(fieldMappingEntryArray.getValue().asText())
															.isArray()) {
														JsonNode valueTypeValuesImage = node.get(i)
																.get(fieldMappingEntryArray.getValue().asText());
														webHookPayload.putArray(fieldMappingEntryArray.getKey())
																.addAll(setArrayNodeValues(valueTypeValuesImage));
													} else {
														String value = nodeArray.get(i)
																.get(fieldMappingEntryArray.getValue().asText())
																.asText();
														webHookPayload.put(fieldMappingEntryArray.getKey(), value);
													}
													arraySize = nodeArray.size();
												} else if (nodeArray.get(i).has(fieldMappingEntryArray.getKey())) {
													setArrayValues = true;
													if (nodeArray.get(i).get(fieldMappingEntryArray.getKey())
															.isArray()) {
														JsonNode valueTypeValuesImage = node.get(i)
																.get(fieldMappingEntryArray.getValue().asText());
														webHookPayload.putArray(fieldMappingEntryArray.getKey())
																.addAll(setArrayNodeValues(valueTypeValuesImage));
													} else {
														String value = nodeArray.get(i)
																.get(fieldMappingEntryArray.getKey()).asText();
														webHookPayload.put(fieldMappingEntryArray.getKey(), value);
													}
													arraySize = nodeArray.size();
												}
											}
										}
										if (!setArrayValues)
											webHookPayload.put(fieldMappingEntryArray.getKey(), "");
									}
								}
								webHookPayload.put("id", "-1");
								arrayNode.add(webHookPayload);
							}

							fieldMappingWithValues.put(fieldMappingEntry.getKey(), arrayNode);
						} else {
							JsonNode node = objMapper.convertValue(valueTypeValue.getValue(), JsonNode.class);
							if (node.has("cartArray") && checkShoppingCart(fieldMappingEntry.getKey())) {
								fieldMappingWithValues.put(fieldMappingEntry.getKey(), node.get("cartArray"));
							} else {
								fieldMappingWithValues.put(fieldMappingEntry.getKey(), valueTypeValue.getValue());
							}
						}
					}
				}
			} else {
				ValueType valueTypeKey = mapFieldValues.get(fieldMappingEntry.getKey().toLowerCase());
				if (valueTypeKey != null) {
					JsonNode node = objMapper.convertValue(valueTypeKey.getValue(), JsonNode.class);
					if (node.has("cartArray") && checkShoppingCart(fieldMappingEntry.getKey())) {
						fieldMappingWithValues.put(fieldMappingEntry.getKey(), node.get("cartArray"));
					} else {
						fieldMappingWithValues.put(fieldMappingEntry.getKey(), valueTypeKey.getValue());
					}
				}
			}
		}

		return fieldMappingWithValues;
	}

	private ArrayNode setArrayNodeValues(JsonNode valueTypeValuesImage) {
		ArrayNode arrayNodeImage = objMapper.createArrayNode();
		for (JsonNode item : valueTypeValuesImage) {
			if (item.isTextual()) {
				arrayNodeImage.add(item.asText());
			} else {
				arrayNodeImage.add(item);
			}
		}
		return arrayNodeImage;
	}

	private boolean checkShoppingCart(String name) {
		ResponseStringVO response = yoroappsServiceClient.checkShoppingCart(name, YorosisContext.get().getToken());
		if (response != null && StringUtils.equals(response.getResponse(), "continue")) {
			return true;
		}
		return false;
	}

	private void putNormalSection(ArrayNode valueTypeValues, String key, Map<String, Object> fieldMappingWithValues,
			boolean isRepeatable) {
		boolean isRepeatableSection = false;
		boolean isS3Added = false;
		List<String> imagevalueList = new ArrayList<String>();
//		for (JsonNode assigneeGroups : valueTypeValues) {
		for (JsonNode assigneeGroup : valueTypeValues) {
			Iterator<String> arrayFieldNames = assigneeGroup.fieldNames();
			if (!arrayFieldNames.hasNext() && StringUtils.endsWith(assigneeGroup.asText(), "s3Image")) {
				ExcelFileManagerVO excelFileManagerVO = renderingServiceClient
						.downloadFile(YorosisContext.get().getToken(), assigneeGroup.asText());
				String dataurl = Base64.getEncoder().encodeToString(excelFileManagerVO.getInputStream());
				String imageValue = "data:image/jpeg;base64," + dataurl;
				imagevalueList.add(imageValue);
				isS3Added = true;
//				change(valueTypeValues.get(i), arrayFieldName, imageValue);
			} else if (!isRepeatableSection) {
				isRepeatableSection = true;
				putRepeatableSection(valueTypeValues, key, fieldMappingWithValues);
			}
		}
		if (!isRepeatable && isS3Added && !CollectionUtils.isEmpty(imagevalueList)) {
			fieldMappingWithValues.put(key, imagevalueList);
		}
		if (isRepeatable && isS3Added && !CollectionUtils.isEmpty(imagevalueList)) {
			change(valueTypeValues, key, imagevalueList);
		}
	}

	private void putRepeatableSection(ArrayNode valueTypeValues, String key,
			Map<String, Object> fieldMappingWithValues) {
		for (int i = 0; i < valueTypeValues.size(); i++) {
			Iterator<String> arrayFieldNames = valueTypeValues.get(i).fieldNames();
			while (arrayFieldNames.hasNext()) {
				String arrayFieldName = arrayFieldNames.next();
				if (valueTypeValues.get(i).get(arrayFieldName) != null
						&& (valueTypeValues.get(i).get(arrayFieldName).isArray())) {
					putNormalSection((ArrayNode) valueTypeValues.get(i), arrayFieldName, fieldMappingWithValues, true);
				}
//			if (StringUtils.endsWith(valueTypeValues.get(i).get(arrayFieldName).asText(), "s3Image")) {
//				ExcelFileManagerVO excelFileManagerVO = renderingServiceClient.downloadFile(YorosisContext.get().getToken(), valueTypeValues.get(i).get(arrayFieldName).asText());
//				String dataurl = Base64.getEncoder().encodeToString(excelFileManagerVO.getInputStream());
//				String imageValue = "data:image/jpeg;base64," + dataurl;
////				change(valueTypeValues.get(i), arrayFieldName, imageValue);
//		}
			}
		}
	}

	private ObjectNode getInitialMapValuesForArray(ProcessInstanceTask processInstanceTask, JsonNode valueTypeValues,
			Map<String, ValueType> mapFieldValues, String key) {
		ObjectNode webHookPayload = JsonNodeFactory.instance.objectNode();
		Iterator<Entry<String, JsonNode>> entryNodeIteratorArray = valueTypeValues.fields();
		while (entryNodeIteratorArray.hasNext()) {
			Entry<String, JsonNode> fieldMappingEntryArray = entryNodeIteratorArray.next();
			String resolvedValue = systemVariableService
					.resolveSystemVariable(fieldMappingEntryArray.getValue().asText());
			if (StringUtils.isBlank(resolvedValue))
				resolvedValue = initiatedVariableService.resolveInitiatedVariable(
						fieldMappingEntryArray.getValue().asText(),
						processInstanceTask.getProcessInstance().getProcessInstanceId());
			if (StringUtils.isBlank(resolvedValue)) {
				EnvVariableRequestVO envVariable = adminService.getEnvironmentVariable(
						processInstanceTask.getProcessInstance(), fieldMappingEntryArray.getValue().asText());
				if (envVariable != null && StringUtils.isNotBlank(envVariable.getValue())) {
					resolvedValue = envVariable.getValue();
				} else {
					UserCustomAttributeVO userCustomAttributeVO = userCustomAttributeService
							.getCustomAttribute(fieldMappingEntryArray.getValue().asText());
					if (userCustomAttributeVO != null && !StringUtils.isBlank(userCustomAttributeVO.getValue())) {
						resolvedValue = userCustomAttributeVO.getValue();
					}
				}
			}

			if (StringUtils.isNotBlank(resolvedValue)) {
				webHookPayload.put(fieldMappingEntryArray.getKey(), resolvedValue);
			} else {
				ValueType valueTypeValue = mapFieldValues.get(fieldMappingEntryArray.getValue().asText().toLowerCase());
				if (valueTypeValue != null) {
					webHookPayload.put(fieldMappingEntryArray.getKey(), valueTypeValue.getValue().toString());
				} else {
					webHookPayload.put(fieldMappingEntryArray.getKey(), "");
				}
			}
		}
		return webHookPayload;
	}

	@Transactional
	public ValueType getFieldValue(UUID processInstanceId, String fieldName, VariableType variableType) {

		// TODO - should rely on OwnedByField in FieldVo to determine call another
		// workflow

		if (processInstanceId != null && variableType != VariableType.CONSTANT && StringUtils.contains(fieldName, ".")
				&& StringUtils.countMatches(fieldName, ".") == 1) {
			String alias = StringUtils.split(fieldName, ".")[0];
			String anotherWFFieldName = StringUtils.split(fieldName, ".")[1];
			return callAnotherWorkflow(processInstanceId, alias, anotherWFFieldName, variableType);

		}
		if (variableType == VariableType.CONSTANT) {
			return ValueType.builder().value(fieldName).clazz(YoroDataType.STRING).build();
		}

		if (fieldName != null) {
			String resolvedValue = systemVariableService.resolveSystemVariable(fieldName);
			if (StringUtils.isBlank(resolvedValue))
				resolvedValue = initiatedVariableService.resolveInitiatedVariable(fieldName, processInstanceId);
			if (StringUtils.isBlank(resolvedValue)) {
				EnvVariableRequestVO envVariable = processInstanceId != null
						? adminService.getEnvironmentVariable(processInstanceId, fieldName)
						: null;
				if (envVariable != null && !StringUtils.isBlank(envVariable.getValue())) {
					resolvedValue = envVariable.getValue();
				} else {
					UserCustomAttributeVO userCustomAttributeVO = userCustomAttributeService
							.getCustomAttribute(fieldName);
					if (userCustomAttributeVO != null && !StringUtils.isBlank(userCustomAttributeVO.getValue())) {
						resolvedValue = userCustomAttributeVO.getValue();
					}
				}
			}

			if (StringUtils.isNotBlank(resolvedValue)) {
				return ValueType.builder().value(resolvedValue).clazz(YoroDataType.STRING).build();
			}
			if (processInstanceId != null) {
				List<ProcessInstanceTask> listInstanceProcessTask = processInstanceTaskRepo
						.getInstanceTaskByLastUpdateDate(processInstanceId, YorosisContext.get().getTenantId());

				Map<String, ValueType> mapFieldValues = getDataForInstanceTask(listInstanceProcessTask);
				ValueType valueType = mapFieldValues.get(fieldName.toLowerCase());

				if (valueType == null || valueType.getValue() == null) {
					return ValueType.builder().value(StringUtils.EMPTY).clazz(YoroDataType.STRING).build();
				}

				return valueType;
			}
		}
		return ValueType.builder().value(StringUtils.EMPTY).clazz(YoroDataType.STRING).build();

	}

	private ValueType callAnotherWorkflow(UUID processInstanceId, String alias, String fieldName,
			VariableType variableType) {

		List<ProcessInstanceTask> listCallAnotherWFInstanceProcessTask = processInstanceTaskRepo
				.getCallAnotherWFInstanceTask(processInstanceId, YorosisContext.get().getTenantId());
		Optional<ProcessInstanceTask> processInstanceTask = listCallAnotherWFInstanceProcessTask.stream()
				.filter(s -> StringUtils.equalsIgnoreCase(alias, s.getInitiatedProcessInstanceAlias())).findFirst();
		if (processInstanceTask.isPresent()) {

			return getFieldValue(processInstanceTask.get().getInitiatedProcessInstanceID(), fieldName, variableType);
		}
		return ValueType.builder().value(StringUtils.EMPTY).clazz(YoroDataType.STRING).build();

	}

	private Map<String, ValueType> getDataForInstanceTask(List<ProcessInstanceTask> listInstanceProcessTask) {
		Map<String, ValueType> mapFieldValues = new HashMap<>();

		listInstanceProcessTask.stream().forEach(s -> mapFieldValues.putAll(getValueFromData(s.getData())));
		return mapFieldValues;
	}

	private Map<String, ValueType> getValueFromData(JsonNode jsonNode) {
		Map<String, ValueType> mapFieldValues = new HashMap<>();

		if (jsonNode != null) {
			Iterator<String> fieldNames = jsonNode.fieldNames();

			while (fieldNames.hasNext()) {
				String fieldName = fieldNames.next();
				JsonNode field = jsonNode.get(fieldName);
				if (field.isArray()) {
					mapFieldValues.put(fieldName.toLowerCase(),
							ValueType.builder().value(field).clazz(YoroDataType.STRING).build());
				} else if (field.has("cartVo")
						|| (field.has("dialCode") && field.has("countryCode") && field.has("e164Number"))) {
					mapFieldValues.put(fieldName.toLowerCase(),
							ValueType.builder().value(field).clazz(YoroDataType.STRING).build());
				} else {
					mapFieldValues.put(fieldName.toLowerCase(),
							ValueType.builder().value(field.asText()).clazz(YoroDataType.STRING).build());
				}
			}
		}
		return mapFieldValues;

	}

	private Set<ProcessDefinition> getProcessDefList(String propertyType, List<String> workflowPinKeyList,
			UUID workspaceId) {
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<GroupVO> listGroupVO = userVO.getGroupVOList();
		Set<ProcessDefinition> procDef = new HashSet<>();
		if (!CollectionUtils.isEmpty(listGroupVO)) {
			List<UUID> listUUID = listGroupVO.stream().map(GroupVO::getGroupId).collect(Collectors.toList());
			if (StringUtils.equals(propertyType, "true") && !CollectionUtils.isEmpty(workflowPinKeyList)) {
//				List<String> workflowPinKeyList = usersWorkflowPinRepository.getWorkflowPinListByUserId(userService.getLoggedInUserDetails().getUserId(),
//						YorosisContext.get().getTenantId(), YorosisConstants.YES);
				return processDefinitionRepo.getHighestVersionWorkflowByKeyForPin(YorosisContext.get().getTenantId(),
						listUUID, YorosisConstants.YES, workflowPinKeyList, workspaceId);
			}
			if (StringUtils.isNotEmpty(propertyType)) {
				if (StringUtils.equals(propertyType, "app")) {
					return processDefinitionRepo.getHighestVersionWorkflowByKeyForApp(
							YorosisContext.get().getTenantId(), listUUID, YorosisConstants.YES, workspaceId);
				} else {
					if (workspaceId == null) {
						return processDefinitionRepo.getHighestVersionWorkflowByKeyWithoutWorkspace(
								YorosisContext.get().getTenantId(), listUUID, YorosisConstants.YES, propertyType);
					} else {
						return processDefinitionRepo.getHighestVersionWorkflowByKey(YorosisContext.get().getTenantId(),
								listUUID, YorosisConstants.YES, propertyType, workspaceId);
					}
				}
			} else {
				return processDefinitionRepo.getHighestVersionWorkflowByKeyWithoutPropertyType(
						YorosisContext.get().getTenantId(), listUUID, YorosisConstants.YES, workspaceId);
			}
		}
		return procDef;
	}

	private void sortedProcessDefinitionList(List<ProcessDefinitionVO> processDefList) {
		if (processDefList != null) {
			Collections.sort(processDefList,
					(p1, p2) -> p1.getProcessDefinitionName().compareToIgnoreCase(p2.getProcessDefinitionName()));
		}
	}

	private List<FieldVO> sortedFieldVoList(List<FieldVO> fieldList) {
		if (fieldList != null && fieldList.size() > 1) {
			Collections.sort(fieldList, (p1, p2) -> p1.getFieldName().compareToIgnoreCase(p2.getFieldName()));
		}
		return fieldList;
	}

	@Transactional
	public List<ProcessDefinitionVO> getProcessDefinitionList(String propertyType, UUID workspaceId)
			throws JsonProcessingException {
		List<ProcessDefinitionVO> processDefList = new ArrayList<>();
		List<String> processDefinitionKey = new ArrayList<>();
		List<String> workflowPinKeyList = usersWorkflowPinRepository.getWorkflowPinListByUserId(
				userService.getLoggedInUserDetails().getUserId(), YorosisContext.get().getTenantId(),
				YorosisConstants.YES);
		for (ProcessDefinition processDef : getProcessDefList(propertyType, workflowPinKeyList, workspaceId)) {
			if (processDef != null) {
				ProcessDefinitionVO vo = constructProcessDefinitionListDTOToVO(processDef, processDefinitionKey, false);
				vo.setEnablePin(workflowPinKeyList.contains(vo.getKey()));
				processDefinitionKey.add(processDef.getKey());
				processDefList.add(vo);
			}
		}
		sortedProcessDefinitionList(processDefList);
		return processDefList;
	}

	@Transactional
	public List<ProcessDefinitionVO> getProcessDefinitionListForLaunch(String propertyType, String workspaceId)
			throws JsonProcessingException {
		List<ProcessDefinitionVO> processDefList = new ArrayList<>();
		List<String> processDefinitionKey = new ArrayList<>();
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<GroupVO> listGroupVO = userVO.getGroupVOList();
		List<UUID> listUUID = listGroupVO.stream().map(GroupVO::getGroupId).collect(Collectors.toList());
		for (ProcessDefinition processDef : processDefinitionRepo.getHighestVersionWorkflowByKeyForLaunch(
				YorosisContext.get().getTenantId(), listUUID, YorosisConstants.YES, propertyType,
				getWorkspace(workspaceId, listUUID, userVO))) {
			if (processDef != null) {
				ProcessDefinitionVO vo = constructProcessDefinitionListDTOToVO(processDef, processDefinitionKey, true);
				processDefinitionKey.add(processDef.getKey());
				processDefList.add(vo);
			}
		}
		sortedProcessDefinitionList(processDefList);
		return processDefList;
	}

	private List<UUID> getWorkspace(String workspaceId, List<UUID> listUUID, UsersVO userVO) {
		List<UUID> workspaceIdList = new ArrayList<>();
		if (StringUtils.equals(workspaceId, "all")) {
			workspaceIdList = workspaceRepository.getListBasedonTenantIdAndActiveFlag(
					YorosisContext.get().getTenantId(), YorosisConstants.YES, userVO.getUserId(), listUUID);
		} else {
			workspaceIdList.add(UUID.fromString(workspaceId));
		}
		return workspaceIdList;
	}

	@Transactional
	public List<ProcessDefinitionVO> getProcessDefinitionListForApp(UUID workspaceId) throws JsonProcessingException {
		List<ProcessDefinitionVO> processDefList = new ArrayList<>();
		List<String> processDefinitionKey = new ArrayList<>();
		for (ProcessDefinition processDef : getProcessDefList("app", null, workspaceId)) {
			if (processDef != null) {
				ProcessDefinitionVO vo = constructProcessDefinitionListDTOToVO(processDef, processDefinitionKey, false);
				processDefinitionKey.add(processDef.getKey());
				processDefList.add(vo);
			}
		}
		sortedProcessDefinitionList(processDefList);
		return processDefList;
	}

	@Transactional
	public ProcessDefinitionVO getProcessDefinitionListCount(UUID workspaceId) {
		List<String> processDefinitionKey = new ArrayList<>();
//			manualListCount = processDefinitionRepo.getWorkflowApplicationsListCount(YorosisContext.get().getTenantId(),
//					listUUID, YorosisConstants.YES, "manual");
		return ProcessDefinitionVO.builder()
				.manualWorkflowsCount(
						String.valueOf(getProcessDefList("manual", processDefinitionKey, workspaceId).size()))
				.webserviceWorkflowsCount(
						String.valueOf(getProcessDefList("launch", processDefinitionKey, workspaceId).size()))
				.scheduledWorkflowsCount(
						String.valueOf(getProcessDefList("scheduled", processDefinitionKey, workspaceId).size()))
				.build();
	}

	public LicenseVO isAllowed(LicenseVO vo) {
		String currentTenantId = YorosisContext.get().getTenantId();

		LicenseVO licenseVO = proxyYoroflowSchemaService.isAllowed(currentTenantId, vo.getCategory(),
				vo.getFeatureName());
		List<String> processDefinitionKey = new ArrayList<>();
		int totalSize = getProcessDefList("manual", processDefinitionKey, null).size();

		if (totalSize < licenseVO.getAllowedLimit()) {
			licenseVO.setResponse("within the limit");
			return licenseVO;
		}
		licenseVO.setResponse("You have exceeded your limit");
		return licenseVO;
	}

	public LicenseVO isSaveAllowed() {
		String currentTenantId = YorosisContext.get().getTenantId();

		LicenseVO licenseVO = proxyYoroflowSchemaService.isAllowed(currentTenantId, "general", "workflows");

		List<String> processDefinitionKey = new ArrayList<>();
		int totalSize = getProcessDefList("manual", processDefinitionKey, null).size();

		if (totalSize < licenseVO.getAllowedLimit()) {
			licenseVO.setResponse("within the limit");
			return licenseVO;
		}
		licenseVO.setResponse("You have exceeded your limit");
		return licenseVO;
	}

	@Transactional
	public List<ProcessDefinitionVO> getProcessDefinitionListForApiKey(UUID workspaceId)
			throws JsonProcessingException {
		List<ProcessDefinitionVO> processDefList = new ArrayList<>();
		List<String> processDefinitionKey = new ArrayList<>();
		for (ProcessDefinition processDef : getProcessDefList(null, null, workspaceId)) {
			if (processDef != null) {
				ProcessDefinitionVO vo = constructProcessDefinitionListDTOToVO(processDef, processDefinitionKey, false);
				processDefinitionKey.add(processDef.getKey());
				processDefList.add(vo);
			}
		}
		sortedProcessDefinitionList(processDefList);
		return processDefList;
	}

	@Transactional
	public List<ProcessDefinitionVO> getProcessDefinitionList(UUID workspaceId) throws JsonProcessingException {
		List<ProcessDefinitionVO> processDefList = new ArrayList<>();
		for (ProcessDefinition processDef : getProcessDefList(null, null, workspaceId)) {
			if (processDef != null && StringUtils.equals(processDef.getStatus(), PUBLISHED)) {
				ProcessDefinitionVO vo = constructProcessDefinitionListDTOToVO(processDef);
				processDefList.add(vo);
			}
		}
		sortedProcessDefinitionList(processDefList);
		return processDefList;
	}

	@Transactional
	public List<ProcessDefinitionVO> getProcessDefinitionListForButtonAction(UUID workspaceId)
			throws JsonProcessingException {
		List<ProcessDefinitionVO> processDefList = new ArrayList<>();
		List<String> processDefinitionKey = new ArrayList<String>();
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<GroupVO> listGroupVO = userVO.getGroupVOList();
		if (!CollectionUtils.isEmpty(listGroupVO)) {
			List<UUID> listUUID = listGroupVO.stream().map(GroupVO::getGroupId).collect(Collectors.toList());
			Set<ProcessDefinition> listProcessDefinition = processDefinitionRepo.getWorkflowList(userVO.getUserId(),
					listUUID, YorosisContext.get().getTenantId(), YorosisConstants.YES, workspaceId);
			for (ProcessDefinition processDef : listProcessDefinition) {
				if (processDef != null) {
					WorkFlow workFlow = objMapper.readValue(processDef.getWorkflowStructure(), WorkFlow.class);
					if (workFlow != null) {
						Optional<TaskNode> optionalTaskNode = flowHelper
								.getFieldInfoForEachTask(workFlow.getTaskNodeList(), processDef.getStartTaskKey());
						if (optionalTaskNode.isPresent()
								&& StringUtils.equalsIgnoreCase(optionalTaskNode.get().getTaskType(), "START_TASK")) {
							JsonNode jsonValue = optionalTaskNode.get().getTaskProperty().getPropertyValue();
							if (jsonValue.has("propertyType")
									&& StringUtils.equalsIgnoreCase(jsonValue.get("propertyType").asText(), "launch")) {
								processDefList.add(
										constructProcessDefinitionListDTOToVO(processDef, processDefinitionKey, false));
								processDefinitionKey.add(processDef.getKey());
							}
						}
					}
				}
			}
		}
		sortedProcessDefinitionList(processDefList);
		return processDefList;
	}

	@Transactional
	public List<ProcessDefinitionVO> getWorkflowVersionListByKey(String key) throws JsonProcessingException {
		List<ProcessDefinitionVO> processDefList = new ArrayList<>();
		List<String> processDefinitionKey = new ArrayList<String>();
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<GroupVO> listGroupVO = userVO.getGroupVOList();
		if (!CollectionUtils.isEmpty(listGroupVO)) {
			List<UUID> listUUID = listGroupVO.stream().map(GroupVO::getGroupId).collect(Collectors.toList());
			Set<ProcessDefinition> listProcessDefinition = processDefinitionRepo.getWorkflowVersionListByKey(key,
					userVO.getUserId(), listUUID, YorosisContext.get().getTenantId(), YorosisConstants.YES);
			for (ProcessDefinition processDef : listProcessDefinition) {
				if (processDef != null) {
					processDefList.add(constructProcessDefinitionListDTOToVO(processDef, processDefinitionKey, false));
					processDefinitionKey.add(processDef.getKey());
				}
			}
		}
		sortedProcessDefinitionList(processDefList);
		return processDefList;
	}

	@Transactional
	public ResponseStringVO checkWorkflowByName(String workflowName) {
		String message = null;
		int name = processDefinitionRepo.getProcessDefName(workflowName, YorosisContext.get().getTenantId(),
				YorosisConstants.YES);

		if (name > 0) {
			message = String.format("Workflow [%s] already exist", workflowName);
		} else {
			message = String.format("Workflow [%s] does not exist", workflowName);
		}

		return ResponseStringVO.builder().response(message).build();
	}

	@Transactional
	public ResponseStringVO checkWorkflowByKey(String workflowKey) {
		String message = null;
		int key = processDefinitionRepo.getDefKey(workflowKey, YorosisContext.get().getTenantId(),
				YorosisConstants.YES);

		if (key > 0) {
			message = String.format("Workflow Key [%s] already exist", workflowKey);
		} else {
			message = String.format("Workflow Key [%s] does not exist", workflowKey);
		}

		return ResponseStringVO.builder().response(message).build();
	}

	@Transactional
	public Set<PageFieldVo> getPageFields(String taskKey, JsonNode workflowJson, boolean isFromExcel)
			throws YoroFlowException {

		WorkFlow workFlow = objMapper.convertValue(workflowJson, WorkFlow.class);
		List<String> listFields = flowHelper.getAssignableFields(taskKey, workFlow);
		Set<PageFieldVo> listPageFieldVo = new LinkedHashSet<>();
		Set<PageFieldVo> listPageArrayFieldVo = new LinkedHashSet<>();
		Set<PageFieldVo> listPageTableFieldVo = new LinkedHashSet<>();
		Set<FieldVO> listFieldMainSectionVO = new LinkedHashSet<>();
		String repeatableFieldName = null;
		for (String taskName : listFields) {
			Optional<TaskNode> optionalTaskNode = flowHelper.getFieldInfoForEachTask(workFlow.getTaskNodeList(),
					taskName);

			if (optionalTaskNode.isPresent()) {
				TaskService taskService = mapTaskService.get(TaskType.valueOf(optionalTaskNode.get().getTaskType()));
				if (taskService != null && optionalTaskNode.get().getTaskProperty() != null
						&& optionalTaskNode.get().getTaskProperty().getPropertyValue() != null) {
					Map<String, List<FieldVO>> fieldList = new LinkedHashMap<>();
					fieldList = taskService.getFieldList(optionalTaskNode.get().getTaskProperty().getPropertyValue());
					if (fieldList.get(MAIN_SECTION) != null) {
						List<FieldVO> taskServiceFieldMainSectionList = sortedFieldVoList(fieldList.get(MAIN_SECTION));
						listFieldMainSectionVO.addAll(taskServiceFieldMainSectionList);
					}
					if (fieldList.get(SUB_SECTION) != null) {
						List<FieldVO> taskServiceFieldSubSectionListForSort = new ArrayList<>();
						List<FieldVO> taskServiceFieldSubSectionListUnSorted = (fieldList.get(SUB_SECTION));
						for (FieldVO fieldVO : taskServiceFieldSubSectionListUnSorted) {
							if (StringUtils.equals(repeatableFieldName, fieldVO.getRepeatableFieldName())) {
								taskServiceFieldSubSectionListForSort.add(fieldVO);
							} else {
								if (!CollectionUtils.isEmpty(taskServiceFieldSubSectionListForSort)) {
									listPageArrayFieldVo.add(PageFieldVo.builder().fieldType(repeatableFieldName + ":")
											.fieldVO(sortedFieldVoList(taskServiceFieldSubSectionListForSort)).build());
									taskServiceFieldSubSectionListForSort = new ArrayList<>();
								}
								repeatableFieldName = fieldVO.getRepeatableFieldName();
								taskServiceFieldSubSectionListForSort.add(fieldVO);
								listFieldMainSectionVO.add(FieldVO.builder().fieldId(fieldVO.getRepeatableFieldId())
										.fieldName(fieldVO.getRepeatableFieldName()).datatype("array").build());
							}
						}
						if (!CollectionUtils.isEmpty(taskServiceFieldSubSectionListForSort)) {
							listPageArrayFieldVo.add(PageFieldVo.builder().fieldType(repeatableFieldName + ":")
									.fieldVO(sortedFieldVoList(taskServiceFieldSubSectionListForSort)).build());
						}
					}
					if (fieldList.get(TABLE_CONTROL) != null) {
						List<FieldVO> taskServiceFieldTableSectionList = sortedFieldVoList(
								fieldList.get(TABLE_CONTROL));
						if (!CollectionUtils.isEmpty(taskServiceFieldTableSectionList))
							listPageTableFieldVo.add(PageFieldVo.builder()
									.fieldType(taskServiceFieldTableSectionList.get(0).getRepeatableFieldName() + ":")
									.fieldVO(taskServiceFieldTableSectionList).build());
					}
//					taskServiceFieldList = sortedFieldVoList(
//							taskService.getFieldList(optionalTaskNode.get().getTaskProperty().getPropertyValue()));

				}
			}
		}
		if (!CollectionUtils.isEmpty(listFieldMainSectionVO)) {
			List<FieldVO> pageFieldsList = new ArrayList<FieldVO>();
			pageFieldsList.addAll(listFieldMainSectionVO);
			listPageFieldVo.add(PageFieldVo.builder().fieldType("Workflow Variables:").fieldVO(pageFieldsList).build());
		}

		if (!listPageTableFieldVo.isEmpty()) {
			listPageFieldVo.addAll(listPageTableFieldVo);
		}

		if (!listPageArrayFieldVo.isEmpty()) {
			listPageFieldVo.addAll(listPageArrayFieldVo);
		}
		if (BooleanUtils.isFalse(isFromExcel)) {
			List<FieldVO> systemVariableFieldList = sortedFieldVoList(systemVariableService.getFieldList());
			List<FieldVO> initiatedVariableFieldList = sortedFieldVoList(initiatedVariableService.getFieldList());
			List<FieldVO> adminServiceFieldList = sortedFieldVoList(adminService.getFieldList(workFlow.getKey()));
			List<FieldVO> orgCustomAttributeServiceFieldList = sortedFieldVoList(
					orgCustomAttributeService.getCustomAttributes());
			if (!CollectionUtils.isEmpty(systemVariableFieldList)) {
				listPageFieldVo.add(
						PageFieldVo.builder().fieldType("System Variables:").fieldVO(systemVariableFieldList).build());
			}
			if (!CollectionUtils.isEmpty(initiatedVariableFieldList)) {
				listPageFieldVo.add(PageFieldVo.builder().fieldType("Launched User Attributes:")
						.fieldVO(initiatedVariableFieldList).build());
			}
			if (!CollectionUtils.isEmpty(adminServiceFieldList)) {
				listPageFieldVo.add(PageFieldVo.builder().fieldType("Environment Variables:")
						.fieldVO(adminServiceFieldList).build());
			}
			if (!CollectionUtils.isEmpty(orgCustomAttributeServiceFieldList)) {
				listPageFieldVo.add(PageFieldVo.builder().fieldType("Custom Attributes:")
						.fieldVO(orgCustomAttributeServiceFieldList).build());
			}

		}

		// System Variable
//		listFieldVO.addAll(systemVariableFieldList);
//		listFieldVO.addAll(adminServiceFieldList);
//		listFieldVO.addAll(orgCustomAttributeServiceFieldList);
		return listPageFieldVo;
	}

	@Transactional
	public List<FieldVO> getPageFieldsForWorkflow(UUID processDefinitionID, String alias)
			throws YoroFlowException, JsonProcessingException {

		ProcessDefinition processDefinition = processDefinitionRepo.getOne(processDefinitionID);
		String workflowAsString = processDefinition.getWorkflowStructure();

		WorkFlow workFlow = objMapper.readValue(workflowAsString, WorkFlow.class);
		String endTaskKey = processDefinitionTaskRepo.getEndTaskKey(processDefinition.getProcessDefinitionId(),
				YorosisContext.get().getTenantId());
		List<String> listFields = flowHelper.getAssignableFields(endTaskKey, workFlow);
		List<FieldVO> listFieldVO = new ArrayList<>();
		for (String taskName : listFields) {
			Optional<TaskNode> optionalTaskNode = flowHelper.getFieldInfoForEachTask(workFlow.getTaskNodeList(),
					taskName);

			if (optionalTaskNode.isPresent()) {
				TaskService taskService = mapTaskService.get(TaskType.valueOf(optionalTaskNode.get().getTaskType()));
				if (taskService != null && optionalTaskNode.get().getTaskProperty() != null
						&& optionalTaskNode.get().getTaskProperty().getPropertyValue() != null) {
					Map<String, List<FieldVO>> fieldList = new LinkedHashMap<>();
					fieldList = taskService.getFieldList(optionalTaskNode.get().getTaskProperty().getPropertyValue());
					if (fieldList.get(MAIN_SECTION) != null) {
						listFieldVO.addAll(fieldList.get(MAIN_SECTION));
					}
//					listFieldVO.addAll(
//							taskService.getFieldList(optionalTaskNode.get().getTaskProperty().getPropertyValue()));
				}
			}
		}

		// Only Env Variable
		listFieldVO.addAll(adminService.getFieldList(workFlow.getKey()));
		List<FieldVO> modififedlistFieldVO = new ArrayList<>();
		listFieldVO.stream().forEach(s ->

		modififedlistFieldVO.add(FieldVO.builder()
				.fieldId(new StringBuffer(alias).append(".").append(s.getFieldId()).toString())
				.fieldName(new StringBuffer("(").append(alias).append(") ").append(s.getFieldName()).toString())
				.taskType(s.getTaskType()).datatype(s.getDatatype()).ownedByWorkflow(processDefinitionID).build()));
		return modififedlistFieldVO;
	}

	@Transactional

	public List<FieldVO> getWebServiceFieldValues(String workflowKey, Long workflowVersion, UUID workspaceId)
			throws JsonProcessingException {
		ProcessDefinition processDefinition = processDefinitionRepo.getProcessDefinitionByKeyAndVersion(workflowVersion,
				workflowKey, YorosisContext.get().getTenantId(), YorosisConstants.YES, workspaceId);

		if (processDefinition != null) {
			WorkFlow workFlow = objMapper.readValue(processDefinition.getWorkflowStructure(), WorkFlow.class);

			if (workFlow != null) {
				Optional<TaskNode> optionalTaskNode = flowHelper.getFieldInfoForEachTask(workFlow.getTaskNodeList(),
						processDefinition.getStartTaskKey());
				if (optionalTaskNode.isPresent()) {
					Map<String, List<FieldVO>> fieldList = startTypeService
							.getFieldList((optionalTaskNode.get().getTaskProperty().getPropertyValue()));
					if (fieldList.get(MAIN_SECTION) != null) {
						return (fieldList.get(MAIN_SECTION));
					}
				}
			}
		}

		return Collections.emptyList();
	}

	public List<TableObjectsVO> getTableNames() {
		return yoroappsServiceClient.getTableNames(YorosisContext.get().getToken());
	}

	public List<TableObjectsColumnsVO> getFieldNames(UUID tableObjectId) {

		return yoroappsServiceClient.getColumnNames(YorosisContext.get().getToken(), tableObjectId);
	}

	public ResponseStringVO saveTaskInfoAsDraft(JsonNode taskData, List<MultipartFile> fileList, Boolean saveAsDraft)
			throws IOException {
		if (taskData.has("workflowId") && taskData.has("workflowTaskId")) {
			ProcessInstanceTask instanceTask = processInstanceTaskRepo.getInstance(
					UUID.fromString(taskData.get("workflowId").asText()),
					UUID.fromString(taskData.get("workflowTaskId").asText()), YorosisContext.get().getTenantId());

			if (instanceTask != null) {
				Iterator<String> fieldNames = taskData.fieldNames();
				while (fieldNames.hasNext()) {
					String fieldName = fieldNames.next();
					JsonNode field = taskData.get(fieldName);
					if (field.isArray()) {
						setNormalFieldImage(taskData, fieldName);
					}
				}

				instanceTask.setData(taskData);
				instanceTask.setDataB(taskData);
				if (BooleanUtils.isTrue(saveAsDraft)) {
					UsersVO userVo = userService.getLoggedInUserDetails();
					instanceTask.setAssignedTo(userVo.getUserId());
					instanceTask.setAssignedToGroup(null);
					workflowActivityLogService.saveActivityLogForSave(instanceTask, userVo.getUserId());
				}
				processInstanceTaskRepo.save(instanceTask);

				return ResponseStringVO.builder().response("Form data saved successfully").build();
			}
		}

		return ResponseStringVO.builder().response("Form data not saved").build();
	}

	private String addThumbnailImage(String image, String thumbnailImageType) throws IOException {
		byte[] imageByte = Base64.getDecoder().decode(image);
//		InputStream streams = new ByteArrayInputStream(image.getBytes());
		ByteArrayInputStream bis = new ByteArrayInputStream(imageByte);
		BufferedImage originalImage = ImageIO.read(bis);
		bis.close();
		if (originalImage != null) {
			BufferedImage thumbnail = Thumbnails.of(originalImage).scale(0.25).asBufferedImage();
			ByteArrayOutputStream os = new ByteArrayOutputStream();
			ImageIO.write(thumbnail, thumbnailImageType, os);
			return Base64.getEncoder().encodeToString(os.toByteArray());
		} else {
			return image;
		}
	}

	private void setNormalFieldImage(JsonNode taskData, String fieldName) throws IOException {
		boolean isRepeatableSection = false;
		boolean isS3Added = false;
		if (!CollectionUtils.isEmpty(taskData.findValues(fieldName))) {
			List<JsonNode> listAssigneeGroups = taskData.findValues(fieldName);
			List<String> imageKeyList = new ArrayList<>();
			for (JsonNode assigneeGroups : listAssigneeGroups) {
				for (JsonNode assigneeGroup : assigneeGroups) {
					Iterator<String> arrayFieldNames = assigneeGroup.fieldNames();
					if (!arrayFieldNames.hasNext()) {
						if (StringUtils.startsWith(assigneeGroup.asText(), "data:image/")) {
							String str = assigneeGroup.asText();
							String thumbnailImage = str;
							String ThumbnailSeparator = "data:image/";
							thumbnailImage = str.substring(ThumbnailSeparator.length(), str.indexOf(";"));
							String separator = "-";
							int sepPos = str.indexOf(",");
							str = str.substring(sepPos + separator.length());
							byte[] bytes = Base64.getDecoder().decode(str);
							String imageKey = UUID.randomUUID().toString() + LocalTime.now();
							saveImageInS3(imageKey, bytes);
							bytes = Base64.getDecoder().decode(addThumbnailImage(str, thumbnailImage));
							String imageKeyThumbnail = imageKey + "thumbnail";
							saveImageInS3(imageKeyThumbnail, bytes);
							isS3Added = true;
							imageKeyList.add(imageKeyThumbnail);
						}
					} else if (!isRepeatableSection) {
						isRepeatableSection = true;
						setRepeatableImage(taskData.get(fieldName));
					}
				}
			}
			if (isS3Added && !CollectionUtils.isEmpty(imageKeyList)) {
				change(taskData, fieldName, imageKeyList);
			}
		}
	}

	private void saveImageInS3(String imageKey, byte[] bytes) {
		ExcelFileManagerVO excelFileManagerVO = ExcelFileManagerVO.builder().inputStream(bytes).key(imageKey)
				.contentSize(bytes.length).build();
		renderingServiceClient.uploadFile(YorosisContext.get().getToken(), excelFileManagerVO);
	}

	private void setRepeatableImage(JsonNode field) throws IOException {
		for (int i = 0; i < field.size(); i++) {
			Iterator<String> arrayFieldNames = field.get(i).fieldNames();
			while (arrayFieldNames.hasNext()) {
				String arrayFieldName = arrayFieldNames.next();
				if (field.get(i).get(arrayFieldName) != null && (field.get(i).get(arrayFieldName).isArray())) {
					setNormalFieldImage(field.get(i), arrayFieldName);
				}
			}
		}
	}

	private void change(JsonNode parent, String fieldName, List<String> newValue) {
		ArrayNode arrayNode = objMapper.createArrayNode();
		for (String item : newValue) {
			arrayNode.add(item);
		}
		if (parent.has(fieldName)) {
			((ObjectNode) parent).putArray(fieldName).addAll(arrayNode);
		}

		// Now, recursively invoke this method on all properties
		for (JsonNode child : parent) {
			change(child, fieldName, newValue);
		}
	}

	@Transactional
	public ManualLaunchVo getDataForManualLaunch(String processDefinitionKey, Long workflowVersion, UUID workspaceId)
			throws JsonProcessingException {

		ProcessDefinition processDefinition = processDefinitionRepo.getProcessDefinitionByKeyAndVersion(workflowVersion,
				processDefinitionKey, YorosisContext.get().getTenantId(), YorosisConstants.YES, workspaceId);

		if (processDefinition != null) {
			WorkFlow workFlow = objMapper.readValue(processDefinition.getWorkflowStructure(), WorkFlow.class);
			if (workFlow != null) {
				Optional<TaskNode> optionalTaskNode = flowHelper.getFieldInfoForEachTask(workFlow.getTaskNodeList(),
						processDefinition.getStartTaskKey());
				if (optionalTaskNode.isPresent() && StringUtils.equalsIgnoreCase(optionalTaskNode.get().getTaskType(),
						YorosisConstants.START_TASK)) {
					JsonNode jsonNode = optionalTaskNode.get().getTaskProperty().getPropertyValue();
					if (jsonNode.has("propertyType")
							&& StringUtils.equals(jsonNode.get("propertyType").asText(), "manual")
							&& jsonNode.has("formIdentifier") && jsonNode.has("formVersion")) {
						return ManualLaunchVo.builder().formId(jsonNode.get("formIdentifier").asText())
								.version(jsonNode.get("formVersion").asLong()).status(LAUNCH)
								.hasDraft(checkDraftWorkflow(processDefinitionKey, workflowVersion)).build();
					}
				}
			}
		}

		return null;
	}

	@Transactional
	public String getMessage(String processDefinitionKey) throws JsonMappingException, JsonProcessingException {
		JsonNode jsonNode = getStartTaskJson(processDefinitionKey);
		if (jsonNode.has("message")) {
			return jsonNode.get("message").asText();
		}
		return null;
	}

	private JsonNode getStartTaskJson(String processDefinitionKey) throws JsonProcessingException {
		ProcessDefinition processDefinition = processDefinitionRepo.getLatestProcessDefinitionByKey(
				processDefinitionKey, YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (processDefinition != null) {
			WorkFlow workFlow = objMapper.readValue(processDefinition.getWorkflowStructure(), WorkFlow.class);
			if (workFlow != null) {
				Optional<TaskNode> optionalTaskNode = flowHelper.getFieldInfoForEachTask(workFlow.getTaskNodeList(),
						processDefinition.getStartTaskKey());
				if (optionalTaskNode.isPresent() && StringUtils.equalsIgnoreCase(optionalTaskNode.get().getTaskType(),
						YorosisConstants.START_TASK)) {
					return optionalTaskNode.get().getTaskProperty().getPropertyValue();
				}
			}
		}
		return null;
	}

	private boolean checkPublicForm(String processDefinitionKey) throws JsonMappingException, JsonProcessingException {
		JsonNode jsonNode = getStartTaskJson(processDefinitionKey);
		if (jsonNode.has("publicForm")) {
			return jsonNode.get("publicForm").asBoolean();
		} else {
			return false;
		}
	}

	@Transactional
	public TimeZoneVo getDefaultTimeZone() {
		return yoroappsServiceClient.getDefaultTimeZone(YorosisContext.get().getToken());
	}

	@Transactional
	public List<ProcessDefinitionVO> getProcessDefinitionListForImport(UUID workspaceId)
			throws JsonProcessingException {
		List<ProcessDefinitionVO> processDefList = new ArrayList<>();
		List<String> processDefinitionKey = new ArrayList<>();
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<GroupVO> listGroupVO = userVO.getGroupVOList();
		if (!CollectionUtils.isEmpty(listGroupVO)) {
			List<UUID> listUUID = listGroupVO.stream().map(GroupVO::getGroupId).collect(Collectors.toList());
			for (ProcessDefinition processDef : processDefinitionRepo.getHighestVersionWorkflowByKeyWithoutPropertyType(
					YorosisContext.get().getTenantId(), listUUID, YorosisConstants.YES, workspaceId)) {
				if (processDef != null) {
					ProcessDefinitionVO vo = constructProcessDefinitionListDTOToVO(processDef, processDefinitionKey,
							false);
					processDefinitionKey.add(processDef.getKey());
					processDefList.add(vo);
				}
			}
			sortedProcessDefinitionList(processDefList);
			return processDefList;
		}
		return null;
	}

	@Transactional
	public ResponseStringVO saveProcessDefinitionPin(EnablePinVO enablePinVO) {
		UsersVO userVo = userService.getLoggedInUserDetails();
		UsersWorkflowPin usersWorkflowPin = usersWorkflowPinRepository.getWorkflowPinByNameAndUserId(
				enablePinVO.getProcessDefinitionKey(), userVo.getUserId(), YorosisContext.get().getTenantId(),
				YorosisConstants.YES);
		if (usersWorkflowPin == null) {
			if (enablePinVO.isEnablePin()) {
				usersWorkflowPinRepository.save(constructEnablePinVoToDto(enablePinVO));
				return ResponseStringVO.builder().response(" Pin added successfully").build();
			}
		} else if (enablePinVO.isEnablePin()) {
			usersWorkflowPin.setProcessDefinitionKey(enablePinVO.getProcessDefinitionKey());
			usersWorkflowPin.setUserId(userService.getLoggedInUserDetails().getUserId());
			usersWorkflowPinRepository.save(usersWorkflowPin);
			return ResponseStringVO.builder().response(" Pin updated successfully").build();
		} else if (!enablePinVO.isEnablePin()) {
			usersWorkflowPinRepository.delete(usersWorkflowPin);
			return ResponseStringVO.builder().response(" Pin removed successfully").build();
		}
		return ResponseStringVO.builder().build();
	}

	private UsersWorkflowPin constructEnablePinVoToDto(EnablePinVO enablePinVO) {
		return UsersWorkflowPin.builder().processDefinitionKey(enablePinVO.getProcessDefinitionKey())
				.userId(userService.getLoggedInUserDetails().getUserId()).createdBy(YorosisContext.get().getUserName())
				.updatedBy(YorosisContext.get().getUserName()).tenantId(YorosisContext.get().getTenantId())
				.activeFlag(YorosisConstants.YES).build();
	}

	@Transactional
	public List<SMSKeyWorkflowVO> getSMSProviders() {
		return yoroappsServiceClient.getSMSProviders();
	}

	@Transactional
	public WorkFlow getWorkflow(String definitionName, long version, UUID workspaceId) throws JsonProcessingException {
		ProcessDefinition processDefinition = processDefinitionRepo.getLatestProcessDefinitionByDefinitionKey(
				definitionName, YorosisContext.get().getTenantId(), YorosisConstants.YES);
		return getProcessDefinition(version, processDefinition.getKey(), workspaceId);
	}

	@Transactional
	public ResponseStringVO uninstallWorkflow(String processDefinitionName, String startKey) {
		List<ProcessDefinition> processDefinition = processDefinitionRepo.getProcessDefinitionByKey(
				processDefinitionName, startKey, YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (processDefinition != null) {
			processDefinition.get(0).setStatus("old");
			processDefinitionRepo.save(processDefinition.get(0));
			return ResponseStringVO.builder().response("Workflow Uninstalled Successfully").build();
		}
		return null;
	}

	@Transactional
	public ResponseStringVO uploadWorkflow(String processDefinitionName, long version) {
		ProcessDefinition processDefinition = processDefinitionRepo
				.findByProcessDefinitionNameAndWorkflowVersion(processDefinitionName, version);
		if (processDefinition != null) {
			processDefinition.setUploadWorkflow("Y");
			processDefinitionRepo.save(processDefinition);
		}
		return ResponseStringVO.builder().response("Workflow uploaded Successfully").build();
	}

	@Transactional
	public List<ProcessDefinitionVO> getUploadWorkflowList(UUID workspaceId) throws JsonProcessingException {
		List<ProcessDefinitionVO> processDefinitionVOList = new ArrayList<>();
		List<ProcessDefinition> processDefinitionList = processDefinitionRepo.getUploadedProcessDefinitionList(
				YorosisContext.get().getTenantId(), YorosisConstants.YES, workspaceId);
		if (processDefinitionList != null) {
			for (ProcessDefinition processDefinition : processDefinitionList) {
				ProcessDefinitionVO vo = constructProcessDefinitionListDTOToVO(processDefinition);
				processDefinitionVOList.add(vo);
			}
		}
		return processDefinitionVOList;
	}

	@Transactional
	public ResponseStringVO installworkflow(String key, long version, String type) {
		ProcessDefinition processDefinition = processDefinitionRepo.getProcessDefinition(key, version,
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (processDefinition != null) {
			if (StringUtils.equalsIgnoreCase(type, "install")) {
				processDefinition.setInstall(YorosisConstants.YES);
			} else if (StringUtils.equalsIgnoreCase(type, "approve")) {
				processDefinition.setApprove(YorosisConstants.YES);
			} else if (StringUtils.equalsIgnoreCase(type, "disable")) {
				processDefinition.setApprove(YorosisConstants.NO);
			}
			processDefinitionRepo.save(processDefinition);
		}
		return ResponseStringVO.builder().response("Workflow uploaded Successfully").build();
	}

	@Transactional
	public boolean checkDraftWorkflow(String key, long version) {
		ProcessDefinition processDefinition = processDefinitionRepo.checkDraftWorkflowTask(key, version,
				YorosisContext.get().getTenantId(), YorosisConstants.YES, YorosisContext.get().getUserName());
		if (processDefinition != null) {
			return true;
		}
		return false;
	}

	@Transactional
	public ProcessInstanceUserTaskVO getInstanceTask(UUID processDefinitionId) {
		List<ProcessInstance> processInstanceList = processInstanceRepo
				.getProcessInstanceListForDraftLaunch(processDefinitionId, YorosisContext.get().getTenantId());
		if (processInstanceList != null && !processInstanceList.isEmpty()) {
			ProcessInstanceTask processInstanceTask = processInstanceTaskRepo.getProcessInstanceTaskByInstanceId(
					processInstanceList.get(0).getProcessInstanceId(), YorosisContext.get().getTenantId());
			if (processInstanceTask != null) {
				return taskListService.getTaskVo(processInstanceTask);
			}
		}
		return ProcessInstanceUserTaskVO.builder().build();
	}

	@Transactional
	public List<WorkflowNamesVO> getWorkflowNameList() {
		List<WorkflowNamesVO> workflowCountListVo = new ArrayList<>();
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<GroupVO> listGroupVO = userVO.getGroupVOList();
		if (!CollectionUtils.isEmpty(listGroupVO)) {
			List<UUID> listUUID = listGroupVO.stream().map(GroupVO::getGroupId).collect(Collectors.toList());
			List<Object[]> processDefinitionList = processDefinitionRepo.getHighestVersionWorkflowNamesByKey(
					YorosisContext.get().getTenantId(), listUUID, YorosisConstants.YES);
			if (processDefinitionList != null) {
				workflowCountListVo = processDefinitionList.stream().map(this::constructWorkflowNames)
						.collect(Collectors.toList());
			}
		}
		return workflowCountListVo;
	}

	@Transactional
	public List<WorkflowNamesVO> getAllWorkflowNameList() {
		List<WorkflowNamesVO> workflowCountListVo = new ArrayList<>();
		List<Object[]> processDefinitionList = processDefinitionRepo
				.getAllHighestVersionWorkflowNamesByKey(YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (processDefinitionList != null) {
			workflowCountListVo = processDefinitionList.stream().map(this::constructWorkflowNames)
					.collect(Collectors.toList());
		}
		return workflowCountListVo;
	}

	private WorkflowNamesVO constructWorkflowNames(Object[] taskboardNamesVo) {
		return WorkflowNamesVO.builder().workspaceId((UUID) taskboardNamesVo[0])
				.workflowCount((long) taskboardNamesVo[1]).build();
	}

	public ResponseStringVO getWorkflowCount() {
		return ResponseStringVO.builder().count(
				processDefinitionRepo.getTotalWorkflowCount(YorosisContext.get().getTenantId(), YorosisConstants.YES))
				.build();
	}

	@Transactional
	public ResponseStringVO saveWorkflowFromApps(AppsVo appsVo) throws IOException, ParseException {
		List<UUID> workflowId = new ArrayList<>();
		List<ProcessDefPrmsn> processDefPrmsnList = new ArrayList<>();
		if (appsVo.getTemplateNode().has("workflow") && appsVo.getTemplateNode().get("workflow").isArray()) {
			UsersVO userVO = userService.getLoggedInUserDetails();
			JsonNode workflowList = appsVo.getTemplateNode().get("workflow");
			List<String> workflowKey = processDefinitionRepo.getByProcessDefKeyList(YorosisContext.get().getTenantId(),
					YorosisConstants.YES, appsVo.getWorkspaceId());
			if (workflowKey != null && !workflowKey.isEmpty()) {
				for (final JsonNode workflow : workflowList) {
					if (workflow.has("workflowVo")) {
						JsonNode workflowVo = workflow.get("workflowVo");
						if (workflowVo.has("key") && workflowKey.contains(workflowVo.get("key").asText())) {
							return ResponseStringVO.builder().response("App already installed in this workspace")
									.build();
						}
					}
				}
			}
			LicenseVO licenseVO = isSaveAllowed(workflowList.size());
			if (StringUtils.equals(licenseVO.getResponse(), "within the limit")) {
				for (final JsonNode workflowNode : workflowList) {
					ProcessDefinition processDefinition = null;
					objMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
					if (workflowNode.has("workflowVo") && !workflowNode.get("workflowVo").isNull()) {
						processDefinition = saveProcessDefFromInstall(workflowNode.get("workflowVo"),
								appsVo.getWorkspaceId(), appsVo.getGroupNameMap(), userVO.getUserId());
						if (processDefinition != null && processDefinition.getProcessDefinitionId() != null) {
							workflowId.add(processDefinition.getProcessDefinitionId());
						}
					}
					if (workflowNode.has("security") && processDefinition != null) {
						JsonNode securityList = workflowNode.get("security");
						if (securityList.isArray()) {
							for (final JsonNode security : securityList) {
								PermissionVO securityListVO = objMapper.treeToValue(security, PermissionVO.class);
								if (securityListVO != null) {
									ProcessDefPrmsn processDefPrmsn = constructPagePermissionsVOToDTO(processDefinition,
											securityListVO, appsVo.getGroupNameMap());
									if (processDefPrmsn != null) {
										processDefPrmsnList.add(processDefPrmsn);
									}
								}
							}
						}
					}
				}
				if (processDefPrmsnList != null && !processDefPrmsnList.isEmpty()) {
					processDefPrmsnRepository.saveAll(processDefPrmsnList);
				}
			} else {
				return ResponseStringVO.builder().response("You have exceeded your limit").licenseVO(licenseVO).build();
			}
		}
		return ResponseStringVO.builder().response("Workflow installed").build();
	}

	private void changes(JsonNode parent, String fieldName, List<String> newValue) {
		ArrayNode arrayNode = objMapper.createArrayNode();
		for (String item : newValue) {
			arrayNode.add(item);
		}
		if (parent.has(fieldName)) {
			((ObjectNode) parent).putArray(fieldName).addAll(arrayNode);
		}
	}

	public void change(JsonNode parent, String fieldName, String newValue) {
		if (parent.has(fieldName)) {
			((ObjectNode) parent).put(fieldName, newValue);
		}
	}

	private void replaceAssignee(Process processModel, List<YoroGroupMapVo> groupNameMap, UUID userId)
			throws JsonMappingException, JsonProcessingException {
		String workflowStructure = processModel.getWorkflowStructure();
		if (!StringUtils.isAllBlank(workflowStructure)) {
			JsonNode actualObj = objMapper.readTree(workflowStructure);
			if (actualObj.has("taskNodeList") && actualObj.get("taskNodeList").isArray()) {
				JsonNode taskNodeList = actualObj.get("taskNodeList");
				for (final JsonNode taskNode : taskNodeList) {
					if (taskNode.has("taskProperty") && !taskNode.get("taskProperty").isNull()
							&& taskNode.get("taskProperty").has("propertyValue")
							&& !taskNode.get("taskProperty").get("propertyValue").isNull()) {
						JsonNode jsonObject = taskNode.get("taskProperty").get("propertyValue");
						if (jsonObject.has(ASSIGNEE_USER)) {
							String user = jsonObject.get(ASSIGNEE_USER).asText();
							if (!StringUtils.isAllBlank(user)) {
								change(jsonObject, ASSIGNEE_USER, userId.toString());
							}
						}
						if (jsonObject.has(ASSIGNEE_GROUP)) {
							List<String> groupList = new ArrayList<>();
							List<JsonNode> listAssigneeGroup = jsonObject.findValues(ASSIGNEE_GROUP);
							if (!CollectionUtils.isEmpty(listAssigneeGroup)) {
								for (JsonNode assigneeGroups : listAssigneeGroup) {
									for (JsonNode assigneeGroup : assigneeGroups) {
										if (assigneeGroup != null) {
											for (YoroGroupMapVo as : groupNameMap) {
												if (StringUtils.equals(as.getGroupName(), assigneeGroup.asText())) {
													groupList.add(as.getYoroGroups().toString());
												}
											}
										}
									}
								}
							}
							changes(jsonObject, ASSIGNEE_GROUP, groupList);
						}
					}
				}
			}
			processModel.setWorkflowStructure(actualObj.toString());
		}

	}

	private ProcessDefPrmsn constructPagePermissionsVOToDTO(ProcessDefinition processDefinition,
			PermissionVO pagePermissionsVO, List<YoroGroupMapVo> groupNameMap) {
		LocalDateTime timestamp = LocalDateTime.now();
		UUID yoroGroups = null;
		for (YoroGroupMapVo as : groupNameMap) {
			if (StringUtils.equals(as.getGroupName(), pagePermissionsVO.getGroupName())) {
				yoroGroups = as.getYoroGroups();
			}
		}
		if (yoroGroups != null) {
			return ProcessDefPrmsn.builder().processDefinition(processDefinition)
					.tenantId(YorosisContext.get().getTenantId())
					.readAllowed(booleanToChar(pagePermissionsVO.getReadAllowed())).groupId(yoroGroups)
					.updateAllowed(booleanToChar(pagePermissionsVO.getUpdateAllowed())).activeFlag(YorosisConstants.YES)
					.createdBy(YorosisContext.get().getUserName()).createdDate(timestamp).updatedDate(timestamp)
					.launchAllowed(booleanToChar(pagePermissionsVO.getLaunchAllowed()))
					.updatedBy(YorosisContext.get().getUserName())
					.publishAllowed(booleanToChar(pagePermissionsVO.getPublishAllowed())).build();
		}
		return null;
	}

	private ProcessDefinition saveProcessDefFromInstall(JsonNode workflowJson, UUID workspaceId,
			List<YoroGroupMapVo> groupNameMap, UUID userId) throws JsonMappingException, JsonProcessingException {
		Process processModel = flowHelper.convertFlowModel(workflowJson);
		replaceAssignee(processModel, groupNameMap, userId);
		WorkFlow workFlow = objMapper.convertValue(workflowJson, WorkFlow.class);
		ProcessDefinition processDefinition = null;
		if (workFlow.getWorkflowId() == null) {
			processDefinition = constructProcessTOProcessDefinition(processModel);
			processDefinition.setWorkflowVersion(1L);
			processDefinition.setWorkspaceId(workspaceId);
			if (!StringUtils.equalsIgnoreCase(workFlow.getUploadWorkflow(), null)) {
				processDefinition.setUploadWorkflow(workFlow.getUploadWorkflow());
			}
			processDefinition = processDefinitionRepo.save(processDefinition);
		}
		return processDefinition;
	}

	public LicenseVO isSaveAllowed(int count) {
		String currentTenantId = YorosisContext.get().getTenantId();

		LicenseVO licenseVO = proxyYoroflowSchemaService.isAllowed(currentTenantId, "general", "workflows");

		List<String> processDefinitionKey = new ArrayList<>();
		int totalSize = getProcessDefList("manual", processDefinitionKey, null).size();
		totalSize = totalSize + count;
		if (totalSize < licenseVO.getAllowedLimit()) {
			licenseVO.setResponse("within the limit");
			return licenseVO;
		}
		licenseVO.setResponse("You have exceeded your limit");
		return licenseVO;
	}

	private String booleanToChar(boolean value) {
		return value ? YorosisConstants.YES : YorosisConstants.NO;
	}

	@Transactional
	public List<ProcessDefinitionVO> getProcessDefinitionListWithoutWorkspace() {
		List<ProcessDefinitionVO> processDefList = new ArrayList<>();
		Set<Object[]> workflowListWithoutWorkspace = processDefinitionRepo
				.getWorkflowListWithoutWorkspace(YorosisContext.get().getTenantId(), YorosisConstants.YES);
		for (Object[] object : workflowListWithoutWorkspace) {

			UUID processDefinitionId = object[0] != null ? UUID.fromString(object[0].toString()) : null;
			String processDefinitionName = object[1] != null ? object[1].toString() : "";
			String workspaceName = object[2] != null ? object[2].toString() : "";

			ProcessDefinitionVO vo = ProcessDefinitionVO.builder().processDefinitionId(processDefinitionId)
					.processDefinitionName(StringUtils.isBlank(workspaceName) ? processDefinitionName
							: processDefinitionName + " - " + workspaceName)
					.build();
			processDefList.add(vo);
		}
		sortedProcessDefinitionList(processDefList);
		return processDefList;
	}

	@Transactional
	public ResponseStringVO inactivateWorkflow(SubscriptionExpireVO subscriptionExpireVO) throws IOException {
		String response = null;
		List<ProcessDefinition> workflowList = processDefinitionRepo
				.getWorkflowListForInactivate(YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (!workflowList.isEmpty() && workflowList.size() > 2) {
			if (BooleanUtils.isTrue(subscriptionExpireVO.getIsRandomWorkflow())) {
				List<UUID> uuidList = new ArrayList<>();
				List<ProcessDefinition> subList = workflowList.subList(workflowList.size() - 4, workflowList.size());
				subList.stream().forEach(t -> uuidList.add(t.getProcessDefinitionId()));
				List<ProcessDefinition> list = processDefinitionRepo.getWorkflowListForInactivateById(uuidList,
						YorosisContext.get().getTenantId(), YorosisConstants.YES);
				list.stream().forEach(t -> t.setActiveFlag(YorosisConstants.NO));
				processDefinitionRepo.saveAll(list);
				response = "Removed random workflows";

			} else {
				List<ProcessDefinition> pickedWorkflowList = processDefinitionRepo.getWorkflowListForInactivateById(
						subscriptionExpireVO.getWorkflowsIdList(), YorosisContext.get().getTenantId(),
						YorosisConstants.YES);
				pickedWorkflowList.stream().forEach(t -> t.setActiveFlag(YorosisConstants.NO));
				processDefinitionRepo.saveAll(pickedWorkflowList);
				response = "Removed picked workflows";
			}
		}
		return ResponseStringVO.builder().response(response).build();
	}
}
