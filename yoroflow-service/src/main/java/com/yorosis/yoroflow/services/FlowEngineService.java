package com.yorosis.yoroflow.services;

import java.io.IOException;
import java.sql.Timestamp;
import java.text.ParseException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.EnumMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.annotation.PostConstruct;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.yorosis.yoroflow.entities.ProcessDefTaskPrmsn;
import com.yorosis.yoroflow.entities.ProcessDefTaskProperty;
import com.yorosis.yoroflow.entities.ProcessDefinitionTask;
import com.yorosis.yoroflow.entities.ProcessInstance;
import com.yorosis.yoroflow.entities.ProcessInstanceTask;
import com.yorosis.yoroflow.entities.ProcessInstanceTaskFile;
import com.yorosis.yoroflow.entities.ProcessInstanceTaskNotes;
import com.yorosis.yoroflow.entities.ProcessQueue;
import com.yorosis.yoroflow.entities.User;
import com.yorosis.yoroflow.entities.UserGroup;
import com.yorosis.yoroflow.event.automation.service.EventsAutomationService;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.general.exception.ErrorHandler;
import com.yorosis.yoroflow.models.AdhocTask;
import com.yorosis.yoroflow.models.CancelUserTask;
import com.yorosis.yoroflow.models.ExcelFileManagerVO;
import com.yorosis.yoroflow.models.FieldVO;
import com.yorosis.yoroflow.models.GroupVO;
import com.yorosis.yoroflow.models.NotificationsVO;
import com.yorosis.yoroflow.models.ProcessInstanceTaskNotesVO;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.models.Status;
import com.yorosis.yoroflow.models.TaskDetailsRequest;
import com.yorosis.yoroflow.models.TaskDetailsResponse;
import com.yorosis.yoroflow.models.TaskFilesVO;
import com.yorosis.yoroflow.models.TaskNotesVO;
import com.yorosis.yoroflow.models.TaskType;
import com.yorosis.yoroflow.models.UsersVO;
import com.yorosis.yoroflow.models.YoroFlowException;
import com.yorosis.yoroflow.queue.models.ProcessQueueDto;
import com.yorosis.yoroflow.repository.ProcessDefTaskPrmsnRepository;
import com.yorosis.yoroflow.repository.ProcessDefinitionTaskRepo;
import com.yorosis.yoroflow.repository.ProcessInstanceRepo;
import com.yorosis.yoroflow.repository.ProcessInstanceTaskFilesRepository;
import com.yorosis.yoroflow.repository.ProcessInstanceTaskNotesRepository;
import com.yorosis.yoroflow.repository.ProcessInstanceTaskRepo;
import com.yorosis.yoroflow.repository.UserGroupRepository;
import com.yorosis.yoroflow.repository.UsersRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;
import com.yorosis.yoroflow.service.type.TaskService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class FlowEngineService {

	private static final String APPROVAL_STATUS = "approvalStatus";
	private static final String SENDBACK = "sendback";
	private static final String APPROVE = "approved";
	private static final String REJECT = "rejected";
	private static final String MAIN_SECTION = "mainSection";
	private static final String TABLE_CONTROL = "tableControl";
	private static final String SUB_SECTION = "subSection";

	@Autowired
	private ProcessInstanceTaskRepo processInstanceTaskRepo;

	@Autowired
	private ProcessDefinitionTaskRepo processDefinitionTaskRepo;

	@Autowired
	private TestTransaction testTransaction;

	@Autowired
	private ProcessInstanceRepo processInstanceRepo;

	@Autowired
	private ProcessInstanceTaskNotesRepository processInstanceTaskNotesRepo;

	@Autowired
	private ProcessInstanceTaskFilesRepository processInstanceTaskFilesRepo;

	@Autowired
	private ProcessDefTaskPrmsnRepository processDefTaskPrmsnRepo;

	@Autowired
	private List<TaskService> listTaskService;

	@Autowired
	private UserGroupRepository userGroupRepo;

	@Autowired
	private UsersRepository usersRepo;

	@Autowired
	private WorkflowService workflowService;

	@Autowired
	private UserService userService;

	@Autowired
	private ErrorHandler errorHandler;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private RenderingServiceClient renderingServiceClient;

	@Autowired
	private YoroappsServiceClient yoroappsServiceClient;

	@Autowired(required = false)
	private QueueService queueService;

	@Autowired
	private ProcessQueueStatusUpdateService processQueueService;

	@Autowired
	private ProcessInstanceTaskNotesRepository processInstanceTaskNotesRepository;

	@Autowired
	private EventsAutomationService eventsAutomationService;

	@Autowired
	private MessagingServiceClient messagingServiceClient;

	private Map<TaskType, TaskService> mapTaskService = new EnumMap<>(TaskType.class);

	@PostConstruct
	private void initialize() {
		listTaskService.stream().forEach(s -> mapTaskService.put(s.getTaskType(), s));
	}

	private ProcessInstanceTask createTask(ProcessDefinitionTask targetProcDefTask, UUID processInstanceId,
			ProcessInstanceTask oldProcessInstanceTask, ProcessDefinitionTask oldProcDefTask)
			throws YoroFlowException, ParseException {
		ProcessInstance processInstance = processInstanceRepo.getOne(processInstanceId);

		ProcessInstanceTask procInstanceTask = new ProcessInstanceTask();
		procInstanceTask.setProcessDefinitionTask(targetProcDefTask);
		procInstanceTask.setProcessInstance(processInstance);
		processInstance.getProcessInstanceTasks().add(procInstanceTask);
		procInstanceTask.setStartTime(LocalDateTime.now());
		procInstanceTask.setTenantId(YorosisContext.get().getTenantId());
		procInstanceTask.setCreatedBy(YorosisContext.get().getUserName());
		procInstanceTask.setUpdatedBy(YorosisContext.get().getUserName());
		TaskService taskService = getTaskService(targetProcDefTask.getTaskType());
		taskService.preProcessTask(procInstanceTask, targetProcDefTask);
		procInstanceTask.setAssignedTo(getAutoAssignedUser(procInstanceTask, targetProcDefTask));
		procInstanceTask
				.setTaskCompletionRemainderTime(getTaskCompletionRemainderTime(procInstanceTask, targetProcDefTask));
		procInstanceTask.setDueDate(LocalDateTime.now().plusDays(4));
		procInstanceTask.setStatus(Status.IN_PROCESS.getValue());
		procInstanceTask.setRemainderTask(getRemainderTask(procInstanceTask, targetProcDefTask));
		if (oldProcessInstanceTask != null) {
			setDataForSendBack(oldProcDefTask, procInstanceTask, oldProcessInstanceTask, targetProcDefTask);
		}
		processInstanceTaskRepo.save(procInstanceTask);

		setTaskData(procInstanceTask);
		sendMessage(procInstanceTask, oldProcDefTask, oldProcessInstanceTask, targetProcDefTask);

		return procInstanceTask;
	}

	/**
	 * get variable name from assigned user from def Task get group name resolve
	 * variable if the user exists in group set it in assigned user
	 * 
	 * @param procInstanceTask
	 * @param targetProcDefTask
	 * @return
	 */

	private void setDataForSendBack(ProcessDefinitionTask ProcDefTask, ProcessInstanceTask procInstanceTask,
			ProcessInstanceTask oldProcInstanceTask, ProcessDefinitionTask targetProcDefTask) {
		if (StringUtils.equals(ProcDefTask.getTaskType(), "APPROVAL_TASK")) {
			String approvalStatus = workflowService
					.getFieldValue(oldProcInstanceTask.getProcessInstance().getProcessInstanceId(), APPROVAL_STATUS,
							VariableType.PAGEFIELD)
					.getValue().toString();
			if (StringUtils.equalsIgnoreCase(approvalStatus, SENDBACK)) {
				procInstanceTask.setData(oldProcInstanceTask.getData());
				procInstanceTask.setDataB(oldProcInstanceTask.getData());
				procInstanceTask.setApproveComment(oldProcInstanceTask.getData().has("sendbackComments")
						&& oldProcInstanceTask.getData().get("sendbackComments") != null
								? oldProcInstanceTask.getData().get("sendbackComments").asText()
								: null);
				List<ProcessInstanceTask> procInstanceTaskList = processInstanceTaskRepo.getTaskForSendBack(
						targetProcDefTask.getTaskId(), oldProcInstanceTask.getProcessInstance().getProcessInstanceId(),
						YorosisContext.get().getTenantId());
				List<ProcessDefTaskPrmsn> ProcessDefTaskPrmsnList = processDefTaskPrmsnRepo
						.getPermissionList(targetProcDefTask.getTaskId());
				procInstanceTask.setAssignedTo(checkAssignTo(ProcessDefTaskPrmsnList, procInstanceTaskList));
			} else if (StringUtils.equalsIgnoreCase(approvalStatus, APPROVE)) {
				procInstanceTask.setApproveComment(oldProcInstanceTask.getData().has("approveComment")
						&& oldProcInstanceTask.getData().get("approveComment") != null
								? oldProcInstanceTask.getData().get("approveComment").asText()
								: null);
				if (oldProcInstanceTask.getData().has("approveComment")
						&& oldProcInstanceTask.getData().get("approveComment") != null) {
					constructNotesVo(oldProcInstanceTask, oldProcInstanceTask.getData().get("approveComment").asText());
				}
			} else if (StringUtils.equalsIgnoreCase(approvalStatus, REJECT)) {
				procInstanceTask.setRejectComment(oldProcInstanceTask.getData().has("rejectComment")
						&& oldProcInstanceTask.getData().get("rejectComment") != null
								? oldProcInstanceTask.getData().get("rejectComment").asText()
								: null);
				if (oldProcInstanceTask.getData().has("rejectComment")
						&& oldProcInstanceTask.getData().get("rejectComment") != null) {
					constructNotesVo(oldProcInstanceTask, oldProcInstanceTask.getData().get("rejectComment").asText());
				}
			}
		}
	}

	private void constructNotesVo(ProcessInstanceTask oldProcInstanceTask, String comments) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		ProcessInstanceTaskNotes processInstanceTaskNotes = ProcessInstanceTaskNotes.builder()
				.addedBy(usersRepo.findByUserNameAndTenantId(YorosisContext.get().getUserName(),
						YorosisContext.get().getTenantId()).getUserId())
				.processInstanceTask(oldProcInstanceTask).createdDate((timestamp)).updatedDate(timestamp)
				.notes(comments).tenantId(YorosisContext.get().getTenantId())
				.updatedBy(YorosisContext.get().getUserName()).build();
		processInstanceTaskNotesRepository.save(processInstanceTaskNotes);
	}

	private UUID getGroupIdList(String groupId) {
		return UUID.fromString(groupId);
	}

	private UUID getAssigToIdForSendBack(List<ProcessInstanceTask> procInstanceTaskList) {
		if (!CollectionUtils.isEmpty(procInstanceTaskList)) {
			for (ProcessInstanceTask processInstanceTask : procInstanceTaskList) {
				if (processInstanceTask.getAssignedTo() != null) {
					return processInstanceTask.getAssignedTo();
				}
			}
		}
		return null;
	}

	private void sendMessage(ProcessInstanceTask procInstanceTask, ProcessDefinitionTask ProcDefTask,
			ProcessInstanceTask oldProcInstanceTask, ProcessDefinitionTask targetProcDefTask) {
		List<UUID> uuidList = new ArrayList<>();
		UUID userId = null;
		if (oldProcInstanceTask != null && !StringUtils.isEmpty(ProcDefTask.getTaskType())
				&& StringUtils.equals(ProcDefTask.getTaskType(), "APPROVAL_TASK")) {
			String approvalStatus = workflowService
					.getFieldValue(oldProcInstanceTask.getProcessInstance().getProcessInstanceId(), APPROVAL_STATUS,
							VariableType.PAGEFIELD)
					.getValue().toString();
			if (StringUtils.equalsIgnoreCase(approvalStatus, SENDBACK)) {
				List<ProcessInstanceTask> procInstanceTaskList = processInstanceTaskRepo.getTaskForSendBack(
						targetProcDefTask.getTaskId(), oldProcInstanceTask.getProcessInstance().getProcessInstanceId(),
						YorosisContext.get().getTenantId());
				userId = getAssigToIdForSendBack(procInstanceTaskList);
				if (userId != null) {
					saveNotification(procInstanceTask, userId, null);
					uuidList.add(userId);
					eventsAutomationService.handleWorkflowTaskAssignWhenMovedMentionForSendBack(procInstanceTask,
							uuidList);
				}
			}
		} else {
			if (!StringUtils.isEmpty(procInstanceTask.getProcessDefinitionTask().getAssignedTo())
					&& !StringUtils.equals(procInstanceTask.getProcessDefinitionTask().getAssignedTo(), "null")) {
				uuidList.add(UUID.fromString(procInstanceTask.getProcessDefinitionTask().getAssignedTo()));
				userId = UUID.fromString(procInstanceTask.getProcessDefinitionTask().getAssignedTo());
			}
			if (!StringUtils.isEmpty(procInstanceTask.getProcessDefinitionTask().getAssignedToType())
					&& !StringUtils.equals(procInstanceTask.getProcessDefinitionTask().getAssignedToType(), "null")) {
				List<UUID> convertedGroupList = Stream
						.of(procInstanceTask.getProcessDefinitionTask().getAssignedToType().split(",", -1))
						.map(this::getGroupIdList).collect(Collectors.toList());
				for (UUID i : convertedGroupList) {
					List<UserGroup> userGroupList = userGroupRepo
							.findByTenantIdAndGroupId(YorosisContext.get().getTenantId(), i);
					userGroupList.stream().forEach(u -> uuidList.add(u.getUser().getUserId()));
					saveNotification(procInstanceTask, userId, i);
				}
			} else {
				if (userId != null) {
					saveNotification(procInstanceTask, userId, null);
				}
			}
			if (!uuidList.isEmpty()) {
				eventsAutomationService.handleWorkflowTaskAssignWhenMovedMention(procInstanceTask, uuidList);
			}
		}
	}

	private void saveNotification(ProcessInstanceTask procInstanceTask, UUID userId, UUID groupIdList) {
		NotificationsVO notificationsVO = NotificationsVO.builder()
				.fromId(usersRepo.findByUserNameAndTenantId(YorosisContext.get().getUserName(),
						YorosisContext.get().getTenantId()).getUserId())
				.toId(userId).groupId(groupIdList).type("workflow")
				.message(procInstanceTask.getProcessDefinitionTask().getTaskName())
				.taskId(procInstanceTask.getProcessInstanceTaskId()).build();
		messagingServiceClient.saveNotifications(YorosisContext.get().getToken(), notificationsVO);
	}

	@SuppressWarnings("deprecation")
	private void setTaskData(ProcessInstanceTask procInstanceTask) {
		ObjectNode taskDataPayload = JsonNodeFactory.instance.objectNode();
		ProcessDefinitionTask procDefinitionTask = procInstanceTask.getProcessDefinitionTask();
		List<ProcessDefTaskProperty> listProcessDefTask = procDefinitionTask.getTaskProperties();

		Optional<JsonNode> listFieldMappings = listProcessDefTask.stream().findFirst()
				.map(ProcessDefTaskProperty::getPropertyValue);
		if (listFieldMappings.isPresent()) {
//		JsonNode fieldObjects = listFieldMappings.get().findValue("fieldMapping");
			Map<String, Object> initialValues = getInitialValues(procInstanceTask.getProcessInstanceTaskId(), true);
			if (!initialValues.isEmpty()) {
				for (Map.Entry<String, Object> entry : initialValues.entrySet()) {
					if (entry.getValue() != null && !StringUtils.equals(entry.getValue().toString(), "null")) {
						JsonNode node = objectMapper.convertValue(entry.getValue(), JsonNode.class);
						taskDataPayload.put(entry.getKey(), node);
					} else {
						taskDataPayload.put(entry.getKey(), "");
						changeJsonString(taskDataPayload, entry.getKey(), null);
					}
				}
				setArrayNode(listFieldMappings, taskDataPayload);
				procInstanceTask.setDataB(taskDataPayload);
			}
//		else {
//			procInstanceTask.setDataB(fieldObjects);
//		}
			processInstanceTaskRepo.save(procInstanceTask);
		}
	}

	private void setArrayNode(Optional<JsonNode> listFieldMappings, ObjectNode taskDataPayload) {
		if (listFieldMappings.get().has("formIdentifier") && listFieldMappings.get().has("formVersion")
				&& !StringUtils.equals(listFieldMappings.get().get("formIdentifier").asText(), "null")
				&& !StringUtils.equals(listFieldMappings.get().get("formVersion").asText(), "null")) {
			Map<String, List<FieldVO>> fieldVolist = yoroappsServiceClient.getFieldValues(
					YorosisContext.get().getToken(), listFieldMappings.get().get("formIdentifier").asText(),
					listFieldMappings.get().get("formVersion").asLong());
			if (fieldVolist.get(MAIN_SECTION) != null) {
				List<FieldVO> listFieldVO = fieldVolist.get(MAIN_SECTION);
				for (FieldVO fieldVo : listFieldVO) {
					if (!taskDataPayload.has(fieldVo.getFieldId())) {
						taskDataPayload.put(fieldVo.getFieldId(), "");
						changeJsonString(taskDataPayload, fieldVo.getFieldId(), null);
					}
				}
			}
			if (fieldVolist.get(TABLE_CONTROL) != null) {
				List<FieldVO> listFieldVO = fieldVolist.get(TABLE_CONTROL);
				setRepeatableSectionValues(listFieldVO, taskDataPayload);
			}
			if (fieldVolist.get(SUB_SECTION) != null) {
				List<FieldVO> listFieldVO = fieldVolist.get(SUB_SECTION);
				setRepeatableSectionValues(listFieldVO, taskDataPayload);
			}
		}
	}

	@SuppressWarnings("deprecation")
	private void setRepeatableSectionValues(List<FieldVO> listFieldVO, ObjectNode taskDataPayload) {
		String repeatableFieldName = null;
		ObjectNode arrayobjectnode = objectMapper.createObjectNode();
		ArrayNode arrayNode = objectMapper.createArrayNode();
		if (listFieldVO != null) {
			for (FieldVO fieldVo : listFieldVO) {
				if ((!taskDataPayload.has(fieldVo.getRepeatableFieldId())
						|| (taskDataPayload.has(fieldVo.getRepeatableFieldId())
								&& taskDataPayload.get(fieldVo.getRepeatableFieldId()) == null)
								&& !arrayobjectnode.has(fieldVo.getFieldId()))) {
					if (StringUtils.isEmpty(repeatableFieldName)) {
						repeatableFieldName = fieldVo.getRepeatableFieldId();
					}
					if (StringUtils.equals(repeatableFieldName, fieldVo.getRepeatableFieldId())) {
						arrayobjectnode.put(fieldVo.getFieldId(), "");
						changeJsonString(arrayobjectnode, fieldVo.getFieldId(), null);
					} else {
						arrayNode.add(arrayobjectnode);
						if (taskDataPayload.has(fieldVo.getRepeatableFieldId())) {
							taskDataPayload.remove(fieldVo.getRepeatableFieldId());
						}
						taskDataPayload.put(fieldVo.getRepeatableFieldId(), arrayNode);
						arrayNode = objectMapper.createArrayNode();
						arrayobjectnode = objectMapper.createObjectNode();
						arrayobjectnode.put(fieldVo.getFieldId(), "");
						changeJsonString(arrayobjectnode, fieldVo.getFieldId(), null);
						repeatableFieldName = fieldVo.getRepeatableFieldId();
					}
				}
			}
		}
		if (!arrayobjectnode.isEmpty()) {
			arrayNode.add(arrayobjectnode);
			if (taskDataPayload.has(repeatableFieldName)) {
				taskDataPayload.remove(repeatableFieldName);
			}
			taskDataPayload.put(repeatableFieldName, arrayNode);
		}
	}

	private void changeJsonString(JsonNode parent, String fieldName, String newValue) {
		if (parent.has(fieldName)) {
			((ObjectNode) parent).put(fieldName, newValue);
		}
		// Now, recursively invoke this method on all properties
		for (JsonNode child : parent) {
			changeJsonString(child, fieldName, newValue);
		}
	}

	private UUID checkAssignTo(List<ProcessDefTaskPrmsn> ProcessDefTaskPrmsnList,
			List<ProcessInstanceTask> procInstanceTaskList) {
		if (!CollectionUtils.isEmpty(procInstanceTaskList)) {
			for (ProcessInstanceTask processInstanceTask : procInstanceTaskList) {
				if (processInstanceTask.getAssignedTo() != null) {
					return processInstanceTask.getAssignedTo();
				}
			}
		}
		if (!CollectionUtils.isEmpty(ProcessDefTaskPrmsnList)) {
			for (ProcessDefTaskPrmsn ProcessDefTaskPrmsn : ProcessDefTaskPrmsnList) {
				if (ProcessDefTaskPrmsn.getUserId() != null) {
					return ProcessDefTaskPrmsn.getUserId();
				}
			}
		}
		return null;
	}

	private UUID getAutoAssignedUser(ProcessInstanceTask procInstanceTask, ProcessDefinitionTask targetProcDefTask) {
		if (targetProcDefTask == null || (!StringUtils.equalsIgnoreCase(targetProcDefTask.getTaskType(),
				TaskType.USER_TASK.toString())
				&& !StringUtils.equalsIgnoreCase(targetProcDefTask.getTaskType(), TaskType.APPROVAL_TASK.toString()))) {
			return null;
		}

		List<ProcessDefTaskProperty> listTaskProperties = targetProcDefTask.getTaskProperties();
		if (!CollectionUtils.isEmpty(listTaskProperties)) {
			ProcessDefTaskProperty procDefTaskProperty = listTaskProperties.get(0);
			JsonNode autoAssignUser = null;
			if (procDefTaskProperty.getPropertyValue() != null
					&& (autoAssignUser = procDefTaskProperty.getPropertyValue().get("autoAssignUser")) != null
					&& !autoAssignUser.isNull() && StringUtils.isNotEmpty(autoAssignUser.asText())) {
				ValueType resolvedAutoAssignedUser = workflowService.getFieldValue(
						procInstanceTask.getProcessInstance().getProcessInstanceId(), autoAssignUser.asText(),
						VariableType.PAGEFIELD);
				if (resolvedAutoAssignedUser != null && (resolvedAutoAssignedUser.getValue() != null)) {
					User user = usersRepo.findByUserNameAndTenantId(resolvedAutoAssignedUser.getValue().toString(),
							YorosisContext.get().getTenantId());
					if (user != null) {
						return user.getUserId();
					}
				} else {
					User user = usersRepo.findByUserNameAndTenantId(autoAssignUser.asText(),
							YorosisContext.get().getTenantId());
					if (user != null) {
						return user.getUserId();
					}
				}
			}
		}

		return null;
	}

	@Transactional
	public ProcessInstanceTask getIntiatedByTaskId(UUID initiatedByProcessInstanceId)
			throws YoroFlowException, ParseException {
		return processInstanceTaskRepo.findByinitiatedProcessInstanceID(initiatedByProcessInstanceId);
	}

	@Transactional
	public TaskDetailsResponse completeTask(UUID processInstanceId, UUID processDefinitionTaskId)
			throws YoroFlowException, ParseException {
		ProcessDefinitionTask targetProcDefTask = processDefinitionTaskRepo
				.findByTaskIdAndTenantId(processDefinitionTaskId, YorosisContext.get().getTenantId());

		ProcessInstanceTask instanceTask = createTask(targetProcDefTask, processInstanceId, null, null);
		if (getTaskService(targetProcDefTask.getTaskType()).canProceed(instanceTask)) {
			TaskDetailsRequest targetTaskDetailRequest = TaskDetailsRequest.builder().instanceId(processInstanceId)
					.instanceTaskId(instanceTask.getProcessInstanceTaskId()).build();
			return getTaskDetailsResponse(processTask(targetTaskDetailRequest));
		}

		return null;
	}

	private TaskDetailsResponse getTaskDetailsResponse(ProcessInstanceTask procInstanceTask) {
		return TaskDetailsResponse.builder().instanceId(procInstanceTask.getProcessInstance().getProcessInstanceId())
				.instanceTaskId(procInstanceTask.getProcessInstanceTaskId())
				.workflowStatus(Status.valueOf(procInstanceTask.getProcessInstance().getStatus()))
				.canProceed(checkPermission(procInstanceTask))
				.taskName(procInstanceTask.getProcessDefinitionTask().getTaskName())
				.taskType(TaskType.valueOf(procInstanceTask.getProcessDefinitionTask().getTaskType())).build();
	}

	@Transactional
	public TaskDetailsResponse completeTask(TaskDetailsRequest taskDetailsRequest)
			throws YoroFlowException, ParseException {
		return getTaskDetailsResponse(processTask(taskDetailsRequest));
	}

	@Transactional
	public TaskDetailsResponse checkStartTask(TaskDetailsRequest taskDetailsRequest, Boolean pulicForm)
			throws JsonMappingException, JsonProcessingException {
		ProcessInstanceTask procInstanceTask = processInstanceTaskRepo.getOne(taskDetailsRequest.getInstanceTaskId());
		ProcessDefinitionTask procDefinitionTask = procInstanceTask.getProcessDefinitionTask();
		if (StringUtils.equals(procInstanceTask.getProcessInstance().getProcessDefinition().getStartType(), "manual")) {
			procInstanceTask.setTaskCompletionRemainderTime(
					getTaskCompletionRemainderTime(procInstanceTask, procDefinitionTask));
			procInstanceTask.setDueDate(LocalDateTime.now().plusDays(4));
			procInstanceTask.setStatus(Status.IN_PROCESS.getValue());
//			setAssignTo(procInstanceTask);
			procInstanceTask.setAssignedTo(userService.getLoggedInUserDetails().getUserId());
			processInstanceTaskRepo.save(procInstanceTask);
			TaskDetailsResponse taskDetailsResponse = getTaskDetailsResponse(procInstanceTask);
			taskDetailsResponse.setCanProceed(false);
			if (pulicForm) {
				taskDetailsResponse.setCanProceed(false);
			}
			setTaskData(procInstanceTask);
			return taskDetailsResponse;
		}
		return null;
	}

	private void setAssignTo(ProcessInstanceTask procInstanceTask) {
		List<UUID> groupIdList = processDefTaskPrmsnRepo
				.getPermissionListByTaskId(procInstanceTask.getProcessDefinitionTask().getTaskId());
		List<UserGroup> listUserGroups = userGroupRepo.getUserGroups(userService.getLoggedInUserDetails().getUserId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (!CollectionUtils.isEmpty(groupIdList)) {
			for (UserGroup userGroup : listUserGroups) {
				if (groupIdList.contains(userGroup.getGroup().getGroupId())) {
					procInstanceTask.setAssignedTo(userService.getLoggedInUserDetails().getUserId());
					break;
				}
			}
		}
	}

	@Transactional
	public TaskDetailsResponse cancelUserTask(TaskDetailsRequest taskDetailsRequest)
			throws YoroFlowException, ParseException, JsonProcessingException {
		return cancelTask(taskDetailsRequest);
	}

	public boolean checkPermission(ProcessInstanceTask procInstanceTask) {
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<GroupVO> listGroupVO = userVO.getGroupVOList();
		List<UUID> listUUID = listGroupVO.stream().map(GroupVO::getGroupId).collect(Collectors.toList());

		List<ProcessDefTaskPrmsn> processDefTaskPrmsnList = processDefTaskPrmsnRepo.getPermissionListByUserAndGroup(
				procInstanceTask.getProcessDefinitionTask().getTaskId(), userVO.getUserId(), listUUID);

		return processDefTaskPrmsnList.isEmpty();

	}

	@Transactional
	public void testTransaction(UUID procInstanceTaskUUID) {
		ProcessInstanceTask procInstanceTask = processInstanceTaskRepo.getOne((procInstanceTaskUUID));
		testTransaction.testTxnRTException(procInstanceTask);
	}

	private TaskDetailsResponse cancelTask(TaskDetailsRequest taskDetailsRequest)
			throws JsonProcessingException, YoroFlowException {
		Boolean canProceed = false;
		ProcessInstanceTask procInstanceTask = processInstanceTaskRepo.getOne(taskDetailsRequest.getInstanceTaskId());
		ProcessDefinitionTask procDefinitionTask = procInstanceTask.getProcessDefinitionTask();
		List<ProcessDefTaskProperty> listTaskProperties = procDefinitionTask.getTaskProperties();
		if (!CollectionUtils.isEmpty(listTaskProperties)) {
			ProcessDefTaskProperty procDefTaskProperty = listTaskProperties.get(0);
			CancelUserTask cancelUserTask = objectMapper.treeToValue(procDefTaskProperty.getPropertyValue(),
					CancelUserTask.class);
			cancelUserTask.setCancellableWorkflow(
					procDefTaskProperty.getPropertyValue().get("isCancellableWorkflow").asBoolean());
			if (!cancelUserTask.isCancellableWorkflow()) {
				throw new YoroFlowException(
						"UserTask not cancellable " + taskDetailsRequest.getInstanceTaskId().toString());
			}
			procInstanceTask.setStatus(Status.ABORTED.getValue());
			procInstanceTask.setUpdatedDate(LocalDateTime.now());
			procInstanceTask.setUpdatedBy(YorosisContext.get().getUserName());
			processInstanceTaskRepo.save(procInstanceTask);
			ProcessDefinitionTask targetProcDefTask = null;
			if (cancelUserTask.isEndWorkflowWhenCancelled()) {
				targetProcDefTask = processDefinitionTaskRepo.getProcessEndTask(
						procDefinitionTask.getProcessDefinition().getProcessDefinitionId(),
						YorosisContext.get().getTenantId());
			} else {
				targetProcDefTask = processDefinitionTaskRepo.getProcessTask(
						procDefinitionTask.getProcessDefinition().getProcessDefinitionId(),
						cancelUserTask.getConnectionForCancel(), YorosisContext.get().getTenantId());
			}
			ProcessQueue processQueue = ProcessQueue.builder().createdTimestamp(LocalDateTime.now())
					.processDefinitionTaskId(targetProcDefTask.getTaskId()).status("PENDING")
					.processInstanceId(taskDetailsRequest.getInstanceId()).build();
			processQueue = processQueueService.insertForProcessing(processQueue);
			if (queueService != null) {
				log.info("Dropping the message to the queue");
				queueService.publishToProcessQueue(ProcessQueueDto.builder()
						.processQueueId(processQueue.getProcessQueueId()).tenantId(YorosisContext.get().getTenantId())
						.currentUserName(YorosisContext.get().getUserName()).build());
			} else {
				log.info("Queue service is not bound... Will go through scheduler");
			}
			canProceed = true;
		}

		return TaskDetailsResponse.builder().canProceed(canProceed).build();

	}

	/**
	 * Get the Task details from proc-definition task Call the respective Task
	 * Service
	 * 
	 * @param processInstance.
	 * @param taskKey
	 * @return
	 * @throws YoroFlowException
	 * @throws ParseException
	 */
	private ProcessInstanceTask processTask(TaskDetailsRequest taskDetailsRequest)
			throws YoroFlowException, ParseException {
		ProcessInstanceTask procInstanceTask = processInstanceTaskRepo.getOne(taskDetailsRequest.getInstanceTaskId());

		log.warn("procInstanceTask TaskId" + procInstanceTask.getProcessInstanceTaskId());
		log.warn("procInstanceTask.getProcessInstance().getProcessInstanceId()"
				+ procInstanceTask.getProcessInstance().getProcessInstanceId());
		if (StringUtils.equalsIgnoreCase(procInstanceTask.getStatus(), Status.COMPLETED.toString())) {
			throw new YoroFlowException("Task is already completed " + taskDetailsRequest.toString());
		}

		procInstanceTask.setData(taskDetailsRequest.getTaskData());
		procInstanceTask.setDataB(taskDetailsRequest.getTaskData());
		ProcessDefinitionTask procDefinitionTask = procInstanceTask.getProcessDefinitionTask();
		TaskService taskService = getTaskService(procDefinitionTask.getTaskType());

		procInstanceTask = taskService.processTask(procInstanceTask, procDefinitionTask);
		// Go to next target
		String targetStepKey = procInstanceTask.getTargetStepKey();
		if (StringUtils.equalsIgnoreCase(procInstanceTask.getStatus(), Status.COMPLETED.toString())
				&& StringUtils.isNotBlank(targetStepKey)) {
			ProcessDefinitionTask targetProcDefTask = processDefinitionTaskRepo.getProcessTask(
					procDefinitionTask.getProcessDefinition().getProcessDefinitionId(), targetStepKey,
					YorosisContext.get().getTenantId());

			if (getTaskService(targetProcDefTask.getTaskType()).canProceed(procInstanceTask)) {
				log.warn("Calling {} #####", targetProcDefTask.toString());
				ProcessQueue processQueue = ProcessQueue.builder().createdTimestamp(LocalDateTime.now())
						.processDefinitionTaskId(targetProcDefTask.getTaskId()).status("PENDING")
						.processInstanceId(taskDetailsRequest.getInstanceId()).build();
				processQueue = processQueueService.insertForProcessing(processQueue);
				if (queueService != null) {
					log.info("Dropping the message to the queue");
					queueService.publishToProcessQueue(
							ProcessQueueDto.builder().processQueueId(processQueue.getProcessQueueId())
									.tenantId(YorosisContext.get().getTenantId())
									.currentUserName(YorosisContext.get().getUserName()).build());
				} else {
					log.info("Queue service is not bound... Will go through scheduler");
				}
			} else {
				return createTask(targetProcDefTask, taskDetailsRequest.getInstanceId(), procInstanceTask,
						procDefinitionTask);
			}

			return procInstanceTask;
		} else if (TaskType.valueOf(procDefinitionTask.getTaskType()) == TaskType.END_TASK) {
			log.warn("Workflow Completed {}#####");
			ProcessInstance processInstance = processInstanceRepo.getOne(taskDetailsRequest.getInstanceId());
			processInstance.setEndTime(LocalDateTime.now());
			processInstance.setStatus(Status.COMPLETED.toString());
			processInstanceRepo.save(processInstance);

			return procInstanceTask;
		} else if (StringUtils.equalsIgnoreCase(procInstanceTask.getStatus(), Status.ERROR.toString())) {
			log.warn("Workflow Error {}#####");
			ProcessInstance processInstance = processInstanceRepo.getOne(taskDetailsRequest.getInstanceId());
			processInstance.setEndTime(LocalDateTime.now());
			processInstance.setStatus(Status.ERROR.toString());
			errorHandler.persist(processInstanceRepo, processInstance);
		}

		throw new YoroFlowException("Task not completed " + taskDetailsRequest.toString());
	}

	private TaskService getTaskService(String procDefinitionTaskType) throws YoroFlowException {
		TaskService taskService = mapTaskService.get(TaskType.valueOf(procDefinitionTaskType));

		if (taskService == null) {
			throw new YoroFlowException("Task service is null " + procDefinitionTaskType);
		}

		return taskService;
	}

	@Transactional
	public AdhocTask saveAdhocTask(AdhocTask adhocTask, List<MultipartFile> file) throws IOException {
		ProcessInstanceTask adhocProcInstanceTask = convertAdhocToProcessTask(adhocTask, file);
		processInstanceTaskRepo.save(adhocProcInstanceTask);
		adhocTask.setTaskID(adhocProcInstanceTask.getProcessInstanceTaskId());

		return adhocTask;
	}

	private ProcessInstanceTask convertAdhocToProcessTask(AdhocTask adhocTask, List<MultipartFile> file)
			throws IOException {
		if (adhocTask.getTaskID() == null) {
			ProcessDefinitionTask pdTask = processDefinitionTaskRepo
					.getOne(UUID.fromString("5c1b75e0-b8cc-47e0-a8cf-013d4f2eb2ea"));
			ProcessInstance adhocInstance = processInstanceRepo
					.getOne(UUID.fromString("854166a3-dcf6-46d2-9ff8-0a46f8401b60"));
			ProcessInstanceTask procInstanceTask = ProcessInstanceTask.builder().processDefinitionTask(pdTask)
					.assignedTo(adhocTask.getAssignee()).status(adhocTask.getStatus()).processInstance(adhocInstance)
					.startTime(LocalDateTime.now()).endTime(LocalDateTime.now())
					.createdBy(YorosisContext.get().getUserName()).updatedBy(YorosisContext.get().getUserName())
					.dueDate(getStringToLocalDateTime(adhocTask.getDueDate()))
					.tenantId(YorosisContext.get().getTenantId()).description(adhocTask.getDescription()).build();
			procInstanceTask.setListTaskFiles(saveFiles(adhocTask, procInstanceTask, file));

			return procInstanceTask;
		} else {
			ProcessInstanceTask procInstanceTask = processInstanceTaskRepo
					.findByProcessInstanceTaskId(adhocTask.getTaskID());
			procInstanceTask.setStatus(adhocTask.getStatus());
			procInstanceTask.setAssignedTo(adhocTask.getAssignee());
			procInstanceTask.setDescription(adhocTask.getDescription());
			procInstanceTask.setListTaskFiles(saveFiles(adhocTask, procInstanceTask, file));
			procInstanceTask.setUpdatedBy(YorosisContext.get().getUserName());

			return procInstanceTask;
		}

	}

	private List<ProcessInstanceTaskFile> saveFiles(AdhocTask adhocTask, ProcessInstanceTask procInstanceTask,
			List<MultipartFile> file) throws IOException {
		List<ProcessInstanceTaskFile> listTaskFiles = new ArrayList<>();
		for (MultipartFile files : file) {
			ProcessInstanceTaskFile taskFiles = ProcessInstanceTaskFile.builder().addedBy(adhocTask.getAssignee())
					.fileName(files.getOriginalFilename()).processInstanceTask(procInstanceTask).files(files.getBytes())
					.build();
			listTaskFiles.add(taskFiles);
		}

		return listTaskFiles;
	}

	@Transactional
	public ResponseStringVO saveTaskFilesAttachments(AdhocTask adhocTask, List<MultipartFile> file) throws IOException {
		ProcessInstanceTask procInstanceTask = processInstanceTaskRepo
				.findByProcessInstanceTaskId(adhocTask.getTaskID());
		for (MultipartFile files : file) {
			ProcessInstanceTaskFile taskFiles = ProcessInstanceTaskFile.builder().addedBy(adhocTask.getAssignee())
					.tenantId(YorosisContext.get().getTenantId()).fileName(files.getOriginalFilename())
					.processInstanceTask(procInstanceTask).files(files.getBytes()).build();

			processInstanceTaskFilesRepo.save(taskFiles);
		}

		return ResponseStringVO.builder().response("Files Added Successfully").build();
	}

	private AdhocTask constructAdhocTaskListDTOToVO(ProcessInstanceTask processInstanceTask) {
		return AdhocTask.builder().taskName(processInstanceTask.getProcessDefinitionTask().getTaskName())
				.assignee(processInstanceTask.getAssignedTo()).status(processInstanceTask.getStatus())
				.taskID(processInstanceTask.getProcessInstanceTaskId())
				.description(processInstanceTask.getDescription()).dueDate(processInstanceTask.getDueDate().toString())
				.build();
	}

	@Transactional
	public List<AdhocTask> getAdhocTaskList() {
		List<ProcessInstanceTask> instanceTaskList = processInstanceTaskRepo.findAll();

		List<AdhocTask> taskList = new ArrayList<>();
		for (ProcessInstanceTask instanceTask : instanceTaskList) {
			taskList.add(constructAdhocTaskListDTOToVO(instanceTask));
		}

		return taskList;
	}

	private TaskFilesVO constructTaskFilesDTOToVO(ProcessInstanceTaskFile taskFiles) {
		return TaskFilesVO.builder().fileId(taskFiles.getTaskFileAttId()).fileName(taskFiles.getFileName())
				.file(Base64.getEncoder().encodeToString(taskFiles.getFiles())).build();
	}

	private TaskNotesVO constructTaskNotesDTOToVO(ProcessInstanceTaskNotes taskNotes) {
		return TaskNotesVO.builder().notesId(taskNotes.getTaskNotesAttId()).notes(taskNotes.getNotes())
				.updatedBy(taskNotes.getUpdatedBy()).build();

	}

	@Transactional
	public AdhocTask getAdhocTaskDetails(UUID processInstanceTaskId) {
		ProcessInstanceTask procInstanceTask = processInstanceTaskRepo
				.findByProcessInstanceTaskId(processInstanceTaskId);
		return constructAdhocTaskListDTOToVO(procInstanceTask);

	}

	@Transactional
	public List<TaskNotesVO> getTaskNotes(UUID processInstanceTaskId) {
		ProcessInstanceTask procInstanceTask = processInstanceTaskRepo
				.findByProcessInstanceTaskId(processInstanceTaskId);

		List<TaskNotesVO> taskNotesList = new ArrayList<>();

		for (ProcessInstanceTaskNotes taskNotes : procInstanceTask.getListTaskNotes()) {
			taskNotesList.add(constructTaskNotesDTOToVO(taskNotes));
		}
		return taskNotesList;
	}

	@Transactional
	public List<TaskFilesVO> getTaskFiles(UUID processInstanceTaskId) {
		ProcessInstanceTask procInstanceTask = processInstanceTaskRepo
				.findByProcessInstanceTaskId(processInstanceTaskId);

		List<TaskFilesVO> taskFilesList = new ArrayList<>();
		for (ProcessInstanceTaskFile taskFiles : procInstanceTask.getListTaskFiles()) {
			taskFilesList.add(constructTaskFilesDTOToVO(taskFiles));
		}
		return taskFilesList;
	}

	@Transactional
	public ResponseStringVO saveTaskNotes(AdhocTask adhocTask) {
		ProcessInstanceTask procInstanceTask = processInstanceTaskRepo
				.findByProcessInstanceTaskId(adhocTask.getTaskID());

		ProcessInstanceTaskNotes notes = null;

		if (adhocTask.getNotesId() == null && adhocTask.getNotes() != null) {
			notes = ProcessInstanceTaskNotes.builder().addedBy(adhocTask.getAssignee())
					.tenantId(YorosisContext.get().getTenantId()).processInstanceTask(procInstanceTask)
					.notes(adhocTask.getNotes()).updatedBy(YorosisContext.get().getUserName()).build();
			processInstanceTaskNotesRepo.save(notes);

			return ResponseStringVO.builder().response("Notes Created Successfully").build();
		} else {
			notes = processInstanceTaskNotesRepo.findByTaskNotesAttId(adhocTask.getNotesId());
			notes.setNotes(adhocTask.getNotes());
			notes.setUpdatedBy("test");

			processInstanceTaskNotesRepo.save(notes);

			return ResponseStringVO.builder().response("Notes Updated Successfully").build();
		}
	}

	@Transactional
	public ResponseStringVO deleteTaskNotes(UUID notesId) {
		if (notesId != null) {
			processInstanceTaskNotesRepo.deleteByTaskNotesAttId(notesId, YorosisContext.get().getTenantId());
			return ResponseStringVO.builder().response("Note Removed Successfully").build();
		}

		return null;
	}

	public ResponseStringVO deleteTaskFiles(UUID fileId) {
		if (fileId != null) {
			processInstanceTaskFilesRepo.deleteByTaskFileAttId(fileId, YorosisContext.get().getTenantId());
			return ResponseStringVO.builder().response("File Removed Successfully").build();
		}

		return null;
	}

	private LocalDateTime getStringToLocalDateTime(String date) {
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
		return LocalDateTime.parse(date, formatter).plusDays(1);
	}

	public byte[] showFiles(UUID fileId) {
		ProcessInstanceTaskFile files = processInstanceTaskFilesRepo.getOne(fileId);
		return files.getFiles();
	}

	@Transactional
	public Map<String, Object> getInitialValues(UUID instanceTaskID, boolean isinitialValues) {
		ProcessInstanceTask procInstanceTask = processInstanceTaskRepo.findByProcessInstanceTaskId(instanceTaskID);
		ProcessDefinitionTask procDefinitionTask = procInstanceTask.getProcessDefinitionTask();
		List<ProcessDefTaskProperty> listProcessDefTask = procDefinitionTask.getTaskProperties();

		Optional<JsonNode> listFieldMappings = listProcessDefTask.stream().findFirst()
				.map(ProcessDefTaskProperty::getPropertyValue);
		if (listFieldMappings.isPresent()) {
			Map<String, Object> initialValues = workflowService.getFieldValue(instanceTaskID,
					listFieldMappings.get().findValue("fieldMapping"));
//			if (!initialValues.isEmpty() && isinitialValues) {
//				JsonNode jsonNode = objectMapper.convertValue(initialValues, JsonNode.class);
//				return getS3ImageValues(jsonNode);
//			}
			return initialValues;
		}

		return Collections.emptyMap();
	}

	private Map<String, Object> getS3ImageValues(JsonNode taskData) {
		Iterator<String> fieldNames = taskData.fieldNames();
		while (fieldNames.hasNext()) {
			String fieldName = fieldNames.next();
			JsonNode field = taskData.get(fieldName);
			if (field.isArray()) {
				setNormalFieldImage(taskData, fieldName);
			}
		}
		Map<String, Object> result = objectMapper.convertValue(taskData, new TypeReference<Map<String, Object>>() {
		});
		return result;
	}

	private void setNormalFieldImage(JsonNode taskData, String fieldName) {
		boolean isRepeatableSection = false;
		boolean isS3Added = false;
		if (!CollectionUtils.isEmpty(taskData.findValues(fieldName))) {
			List<JsonNode> listAssigneeGroups = taskData.findValues(fieldName);
			List<String> imagevalueList = new ArrayList<String>();
			for (JsonNode assigneeGroups : listAssigneeGroups) {
				for (JsonNode assigneeGroup : assigneeGroups) {
					Iterator<String> arrayFieldNames = assigneeGroup.fieldNames();
					if (!arrayFieldNames.hasNext() && assigneeGroup != null) {
						if (StringUtils.endsWith(assigneeGroup.asText(), "s3Image")) {
							ExcelFileManagerVO excelFileManagerVO = renderingServiceClient
									.downloadFile(YorosisContext.get().getToken(), assigneeGroup.asText());
							String dataurl = Base64.getEncoder().encodeToString(excelFileManagerVO.getInputStream());
							String imageValue = "data:image/jpeg;base64," + dataurl;
							imagevalueList.add(imageValue);
							isS3Added = true;
						}
					} else if (!isRepeatableSection) {
						isRepeatableSection = true;
						setRepeatableImage(taskData.get(fieldName));
					}
				}
			}
			if (isS3Added && !CollectionUtils.isEmpty(imagevalueList)) {
				change(taskData, fieldName, imagevalueList);
			}
		}
	}

	private void setRepeatableImage(JsonNode field) {
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
		ArrayNode arrayNode = objectMapper.createArrayNode();
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
	public List<User> getAssignedUserInfoBasedOnTaskId(UUID instanceTaskID) {
		ProcessInstanceTask procInstanceTask = processInstanceTaskRepo.getOne(instanceTaskID);
		UUID assignedUser = procInstanceTask.getAssignedTo();
		List<User> listUsers = new ArrayList<>();
		if (assignedUser == null) {
			return getUsersForGroup(procInstanceTask);
		} else {
			listUsers.add(usersRepo.getUserbyUserIDAndTenantID(assignedUser, YorosisContext.get().getTenantId()));
			return listUsers;
		}
	}

	private List<User> getUsersForGroup(ProcessInstanceTask procInstanceTask) {
		List<ProcessDefTaskProperty> listTaskProperties = procInstanceTask.getProcessDefinitionTask()
				.getTaskProperties();
		if (!CollectionUtils.isEmpty(listTaskProperties)) {
			ProcessDefTaskProperty procDefTaskProperty = listTaskProperties.get(0);
			List<User> user = new ArrayList<>();
			if (procDefTaskProperty.getPropertyValue() != null) {
				List<JsonNode> listAssigneeGroup = procDefTaskProperty.getPropertyValue().findValues("assigneeGroup");
				if (!CollectionUtils.isEmpty(listAssigneeGroup)) {
					List<UserGroup> listUserGroups = new ArrayList<>();
					for (JsonNode assigneeGroups : listAssigneeGroup) {
						for (JsonNode assigneeGroup : assigneeGroups) {
							if (assigneeGroup != null) {
								listUserGroups.addAll(userGroupRepo.findByTenantIdAndGroupId(
										YorosisContext.get().getTenantId(), UUID.fromString(assigneeGroup.asText())));
							}
						}
					}

					user.addAll(listUserGroups.stream().map(UserGroup::getUser).collect(Collectors.toList()));
				}
				if (procDefTaskProperty.getPropertyValue().get("assigneeUser") != null
						&& procDefTaskProperty.getPropertyValue().get("assigneeUser").asText() != null) {
					String assigneeUser = procDefTaskProperty.getPropertyValue().get("assigneeUser").asText();
					if (StringUtils.isNotBlank(assigneeUser)
							&& !StringUtils.equalsAnyIgnoreCase(assigneeUser, "null")) {
						user.add(usersRepo.getUserbyUserIDAndTenantID(UUID.fromString(assigneeUser),
								YorosisContext.get().getTenantId()));
					}

				}
				return user;
			}
		}

		return Collections.emptyList();
	}

	private LocalDateTime getTaskCompletionRemainderTime(ProcessInstanceTask procInstanceTask,
			ProcessDefinitionTask targetProcDefTask) {
		LocalDateTime taskRemainderTime = null;
		if (targetProcDefTask != null && (StringUtils.equalsIgnoreCase(targetProcDefTask.getTaskType(),
				TaskType.USER_TASK.toString())
				|| StringUtils.equalsIgnoreCase(targetProcDefTask.getTaskType(), TaskType.APPROVAL_TASK.toString()))) {
			List<ProcessDefTaskProperty> listTaskProperties = targetProcDefTask.getTaskProperties();
			if (!CollectionUtils.isEmpty(listTaskProperties)) {
				ProcessDefTaskProperty procDefTaskProperty = listTaskProperties.get(0);
				JsonNode reminderTime = procDefTaskProperty.getPropertyValue().get("reminderTime");
				JsonNode reminderUnits = procDefTaskProperty.getPropertyValue().get("reminderUnits");
				if (procDefTaskProperty.getPropertyValue() != null && reminderTime != null && reminderUnits != null
						&& StringUtils.isNotEmpty(reminderUnits.asText())) {
					if (StringUtils.equals(reminderUnits.asText(), "hours")) {
						taskRemainderTime = LocalDateTime.now().plusHours(reminderTime.asLong());
					} else if (StringUtils.equals(reminderUnits.asText(), "minutes")) {
						taskRemainderTime = LocalDateTime.now().plusMinutes(reminderTime.asLong());
					}
				}
			}
		}
		return taskRemainderTime;
	}

	private JsonNode getRemainderTask(ProcessInstanceTask procInstanceTask, ProcessDefinitionTask targetProcDefTask) {
		JsonNode taskRemainder = null;
		if (targetProcDefTask != null && (StringUtils.equalsIgnoreCase(targetProcDefTask.getTaskType(),
				TaskType.USER_TASK.toString())
				|| StringUtils.equalsIgnoreCase(targetProcDefTask.getTaskType(), TaskType.APPROVAL_TASK.toString()))) {
			List<ProcessDefTaskProperty> listTaskProperties = targetProcDefTask.getTaskProperties();
			if (!CollectionUtils.isEmpty(listTaskProperties)) {
				ProcessDefTaskProperty procDefTaskProperty = listTaskProperties.get(0);
				if (procDefTaskProperty.getPropertyValue() != null
						&& procDefTaskProperty.getPropertyValue().has("remainderDetails")) {
					JsonNode reminderTime = procDefTaskProperty.getPropertyValue().get("remainderDetails")
							.get("remainderDetails");
					if (reminderTime != null && reminderTime.isArray()) {
						taskRemainder = reminderTime;
					}
				}
			}
		}
		return taskRemainder;
	}
}
