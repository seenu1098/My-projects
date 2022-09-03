package com.yorosis.yoroflow.event.automation.service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.FormatStyle;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yorosis.yoroapps.automation.AutomationUser;
import com.yorosis.yoroapps.automation.Email;
import com.yorosis.yoroapps.automation.EmailPerson;
import com.yorosis.yoroapps.automation.LabelEventPayload;
import com.yorosis.yoroapps.automation.TaskInfo;
import com.yorosis.yoroflow.entities.EventAutomation;
import com.yorosis.yoroflow.entities.ProcessInstanceTask;
import com.yorosis.yoroflow.entities.Taskboard;
import com.yorosis.yoroflow.entities.TaskboardTask;
import com.yorosis.yoroflow.entities.TaskboardTaskAssignedUsers;
import com.yorosis.yoroflow.entities.User;
import com.yorosis.yoroflow.entities.UserGroup;
import com.yorosis.yoroflow.entities.Workspace;
import com.yorosis.yoroflow.entities.YoroDocuments;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.AssignUserTaskVO;
import com.yorosis.yoroflow.models.ProcessInstanceTaskNotesVO;
import com.yorosis.yoroflow.models.RessignTaskVO;
import com.yorosis.yoroflow.models.TaskCommentsVO;
import com.yorosis.yoroflow.models.TaskboardTaskVO;
import com.yorosis.yoroflow.models.docs.YoroDocumentVO;
import com.yorosis.yoroflow.models.taskboard.UserTasks;
import com.yorosis.yoroflow.repository.EventAutomationRepository;
import com.yorosis.yoroflow.repository.UserGroupRepository;
import com.yorosis.yoroflow.repository.UsersRepository;
import com.yorosis.yoroflow.repository.WorkspaceRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;
import com.yorosis.yoroflow.services.QueueService;
import com.yorosis.yoroflow.services.TokenProviderService;

import io.jsonwebtoken.Claims;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class EventsAutomationService {
	// Matching the Automation Type
	private static final String EVENT_SUB_LABEL_ADDED = "label_add";
	private static final String EVENT_SUB_LABEL_REMOVED = "label_remove";
	private static final String EVENT_LABEL = "label";
	private static final String EVENT_STATUS = "status";
	private static final String EVENT_SUBTASK_STATUS = "subtask status";
	private static final String EVENT_NEW_ITEM = "create item";
	private static final String EVENT_COMMENT = "comment";
	private static final String EVENT_DUE_DATE = "due date";
	private static final String EVENT_FIELD_VALUE_CHANGES = "task field";

	private static final String EMAIL_TEMPLATE_ADD_NEW_ITEM = "create_item";
	private static final String EMAIL_TEMPLATE_LABEL_ADDED = "label_add";
	private static final String EMAIL_TEMPLATE_LABEL_REMOVED = "label_remove";
	private static final String EMAIL_TEMPLATE_COMMENT_ADDED = "comment";
	private static final String EMAIL_TEMPLATE_STATUS_CHANGED = "status_change";
	private static final String EMAIL_TEMPLATE_SUBTASK_STATUS = "subtask_status";
	private static final String EMAIL_TEMPLATE_DUE_DATE_REACHED = "due_date";
	private static final String EMAIL_TEMPLATE_SUMMARY = "summary_email";


	// Email Template Names
	private static final String TOKEN_PREFIX = "Bearer ";

	@Autowired(required = false)
	private QueueService queueService;

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private EventAutomationRepository automationRepo;

	@Autowired
	private TokenProviderService tokenProviderService;

	@Autowired
	private UsersRepository userRepo;

	@Autowired
	private UserGroupRepository userGroupRepository;

	@Autowired
	private WorkspaceRepository workspaceRepository;

	@Autowired
	private ObjectMapper objectMapper;

	private Map<String, String> mapAutomationTypeEmailTemplate = new HashMap<String, String>() {
		{
			put(EVENT_SUB_LABEL_ADDED, EMAIL_TEMPLATE_LABEL_ADDED);
			put(EVENT_SUB_LABEL_REMOVED, EMAIL_TEMPLATE_LABEL_REMOVED);
			put(EVENT_STATUS, EMAIL_TEMPLATE_STATUS_CHANGED);
			put(EVENT_SUBTASK_STATUS, EMAIL_TEMPLATE_SUBTASK_STATUS);
			put(EVENT_NEW_ITEM, EMAIL_TEMPLATE_ADD_NEW_ITEM);
			put(EVENT_COMMENT, EMAIL_TEMPLATE_COMMENT_ADDED);
			put(EVENT_DUE_DATE, EMAIL_TEMPLATE_DUE_DATE_REACHED);
		}
	};

	private boolean isAutomationPresent(UUID taskboardId, String eventType) {
		List<EventAutomation> list = automationRepo.getAutomationListFor((taskboardId),
				YorosisContext.get().getTenantId(), YorosisConstants.YES, eventType);
		return CollectionUtils.isNotEmpty(list);
	}

	public void handleSubTaskStatusChange(UUID taskboardId, TaskboardTask taskboardTask, String status) {
		if (StringUtils.isBlank(status)) {
			log.warn("No status is available for event automation {}", taskboardTask.getId());
			return;
		}

		handleEventNotification(taskboardTask, status, mapAutomationTypeEmailTemplate.get(EVENT_SUBTASK_STATUS),
				EVENT_SUBTASK_STATUS);

	}

	public void handleDueDate(UUID taskboardId, TaskboardTask taskboardTask, String status) {
		log.warn("Due date reached for Task {} with name {}", taskboardTask.getId(), taskboardTask.getTaskName());
		handleEventNotification(taskboardTask, status, mapAutomationTypeEmailTemplate.get(EVENT_DUE_DATE),
				EVENT_DUE_DATE);

	}

	@Transactional
	public List<UUID> getTaskBoardWithDueDates() {
		return automationRepo.getTaskBoardWithAutomationType(YorosisContext.get().getTenantId(), EVENT_DUE_DATE);
	}

	@Transactional
	public void handleStatusChange(UUID taskboardId, TaskboardTask taskboardTask, String status) {

		if (StringUtils.isBlank(status)) {
			log.warn("No status is available for event automation {}", taskboardTask.getId());
			return;
		}

		if (isAutomationPresent(taskboardId, EVENT_STATUS)) {
			log.info("Automation rules present for status for taskboard: {}", taskboardId);
			handleEventNotification(taskboardTask, status, mapAutomationTypeEmailTemplate.get(EVENT_STATUS),
					EVENT_STATUS);
			return;
		}
		log.warn("NO AUTOMATION exists for taskboard: {} and status {}", taskboardId, EVENT_STATUS);

	}

	@Transactional
	public void handleCommentChange(UUID taskboardId, TaskboardTask taskboardTask) {
		if (isAutomationPresent(taskboardId, EVENT_COMMENT)) {
			log.info("Automation rules present for status for taskboard: {}", taskboardId);
			handleEventNotification(taskboardTask, StringUtils.EMPTY, mapAutomationTypeEmailTemplate.get(EVENT_COMMENT),
					EVENT_COMMENT);
			return;
		}
		log.warn("NO AUTOMATION exists for taskboard: {} and status {}", taskboardId, EVENT_COMMENT);

	}

	@Transactional
	public void handleNewItemsChange(UUID taskboardId, TaskboardTask taskboardTask) {
		if (isAutomationPresent(taskboardId, EVENT_NEW_ITEM)) {
			log.info("Automation rules present for status for taskboard: {}", taskboardId);
			handleEventNotification(taskboardTask, StringUtils.EMPTY,
					mapAutomationTypeEmailTemplate.get(EVENT_NEW_ITEM), EVENT_NEW_ITEM);
			return;
		}
		log.warn("NO AUTOMATION exists for taskboard: {} and status {}", taskboardId, EVENT_NEW_ITEM);

	}

	@Transactional
	public void handleLabelChange(UUID taskboardId, TaskboardTask taskboardTask, Set<String> existingLabelsSet,
			Set<String> newLabelsSet, String labelSubstatus) {

		if (isAutomationPresent(taskboardId, EVENT_LABEL)) {
			log.info("Automation rules present for label for taskboard: {}", taskboardId);
			handleLabelChangeNotification(taskboardTask, existingLabelsSet, newLabelsSet, labelSubstatus);
			return;
		}
		log.warn("NO AUTOMATION exists for taskboard: {} and status {}", taskboardId, EVENT_LABEL);

	}

	@Transactional
	public void handleFieldValueChanges(UUID taskboardId, TaskboardTask taskboardTask, JsonNode oldTaskData) {
		if (isAutomationPresent(taskboardId, EVENT_FIELD_VALUE_CHANGES)) {
			log.info("Automation rules present for field value changes for taskboard: {}", taskboardId);
			handleEventFieldValue(taskboardTask, EVENT_FIELD_VALUE_CHANGES, oldTaskData);
			return;
		}
		log.warn("NO AUTOMATION exists for taskboard: {} and status {}", taskboardId, EVENT_FIELD_VALUE_CHANGES);

	}

	private void handleEventFieldValue(TaskboardTask taskboardTask, String automationType, JsonNode oldTaskData) {
		Taskboard vo = taskboardTask.getTaskboard();
		YorosisContext context = YorosisContext.get();
		AutomationUser automationUser = AutomationUser.builder().firstName(context.getUserName())
				.lastName(context.getUserName()).userName(context.getUserName()).build();
		TaskInfo taskInfo = TaskInfo.builder().taskId(taskboardTask.getId()).taskBoardId(vo.getId())
				.taskKey(taskboardTask.getTaskId()).taskName(taskboardTask.getTaskName()).taskBoardName(vo.getName())
				.automationType(automationType).tenantId(context.getTenantId()).automationUser(automationUser)
				.oldTaskData(oldTaskData).newTaskData(taskboardTask.getTaskData()).status(taskboardTask.getStatus())
				.build();
		taskInfo.setTemplateKeys(getTemplateKeys(taskboardTask, automationUser));
		taskInfo.setListOfAssignedUsers(getListOfAssignedUsers(taskboardTask));
		try {
			log.info("Task Info Payload to the automation queue: {}", mapper.writeValueAsString(taskInfo));
		} catch (JsonProcessingException e) {
			log.warn("Ignore error as it does not impact business", e);
		}

		if (queueService == null) {
			log.warn("Queue Service is disabled. Need to fallback to database table!");
		} else {
			queueService.publishToTaskQueue(taskInfo);
		}
	}

	private void handleEventNotification(TaskboardTask taskboardTask, String status, String emailTemplateId,
			String automationType) {

		log.info("Automation Type {}, Email Template {}", automationType, emailTemplateId);
		Taskboard vo = taskboardTask.getTaskboard();
		YorosisContext context = YorosisContext.get();
		AutomationUser automationUser = AutomationUser.builder().firstName(context.getUserName())
				.lastName(context.getUserName()).userName(context.getUserName()).build();
		TaskInfo taskInfo = TaskInfo.builder().taskId(taskboardTask.getId()).taskBoardId(vo.getId())
				.taskKey(taskboardTask.getTaskId()).taskName(taskboardTask.getTaskName()).taskBoardName(vo.getName())
				.automationType(automationType).status(status).tenantId(context.getTenantId())
				.automationUser(automationUser).emailTemplateId(emailTemplateId).build();
		taskInfo.setTemplateKeys(getTemplateKeys(taskboardTask, automationUser));
		taskInfo.setListOfAssignedUsers(getListOfAssignedUsers(taskboardTask));
		try {
			log.info("Task Info Payload to the automation queue: {}", mapper.writeValueAsString(taskInfo));
		} catch (JsonProcessingException e) {
			log.warn("Ignore error as it does not impact business", e);
		}

		if (queueService == null) {
			log.warn("Queue Service is disabled. Need to fallback to database table!");
		} else {
			queueService.publishToTaskQueue(taskInfo);
		}
	}

	private List<UUID> getListOfAssignedUsers(TaskboardTask taskboardTask) {
		if (taskboardTask != null && CollectionUtils.isNotEmpty(taskboardTask.getTaskboardTaskAssignedUsers())) {
			Set<TaskboardTaskAssignedUsers> setTaskboardTaskAssignedUsers = taskboardTask
					.getTaskboardTaskAssignedUsers();
			return setTaskboardTaskAssignedUsers.stream().map(s -> s.getUserId()).collect(Collectors.toList());
		}
		return Collections.emptyList();
	}

	public String getWorkspaceKey(UUID workspaceId) {
		String workspaceKey = "deace";
		if (workspaceId != null) {
			Workspace workSpace = workspaceRepository.getBasedonIdAndTenantIdAndActiveFlag(workspaceId,
					YorosisContext.get().getTenantId(), YorosisConstants.YES);
			if (workSpace != null) {
				workspaceKey = workSpace.getWorkspaceUniqueId();
			}
		}
		return workspaceKey;
	}

	public void handleWorkflowCommentsMention(ProcessInstanceTask instanceTask, ProcessInstanceTaskNotesVO taskNotes) {
		Map<String, String> templateMap = new HashMap<>();
		setmentionTemplateData(templateMap);
		templateMap.put("taskname", instanceTask.getProcessDefinitionTask().getTaskName());
		templateMap.put("workflow",
				instanceTask.getProcessDefinitionTask().getProcessDefinition().getProcessDefinitionName());
		templateMap.put("workspaceKey",
				getWorkspaceKey(instanceTask.getProcessDefinitionTask().getProcessDefinition().getWorkspaceId()));
		Set<EmailPerson> setEmailPerson = new HashSet<>();
		taskNotes.getMentionedUsersEmail().stream()
				.forEach(e -> setEmailPerson.add(EmailPerson.builder().emailId(e).build()));
		queueService.publishToEmail(createEmail(setEmailPerson, templateMap, "workflow_comment_mention"));
	}

	public void handleWorkflowTaskAssignMention(ProcessInstanceTask instanceTask, RessignTaskVO assignTaskVo) {
		Map<String, String> templateMap = new HashMap<>();
		setAssignedTemplateData(templateMap);
		templateMap.put("taskname", instanceTask.getProcessDefinitionTask().getTaskName());
		templateMap.put("workflow",
				instanceTask.getProcessDefinitionTask().getProcessDefinition().getProcessDefinitionName());
		templateMap.put("workspaceKey",
				getWorkspaceKey(instanceTask.getProcessDefinitionTask().getProcessDefinition().getWorkspaceId()));
		Set<EmailPerson> setEmailPerson = new HashSet<>();
		List<UUID> userIdList = new ArrayList<UUID>();
		if (assignTaskVo.getAssignedToUser() != null) {
			userIdList.add(assignTaskVo.getAssignedToUser());
		}
		if (assignTaskVo.getAssignedToGroup() != null) {
			List<UserGroup> userGroupList = userGroupRepository
					.findByTenantIdAndGroupId(YorosisContext.get().getTenantId(), assignTaskVo.getAssignedToGroup());
			userGroupList.stream().forEach(u -> userIdList.add(u.getUser().getUserId()));
		}
		getEmailPersonFromListUsers(setEmailPerson, userIdList);
//		queueService.publishToEmail(createEmail(setEmailPerson, templateMap, "workflowTaskAssign"));
	}

	public void handleWorkflowTaskAssignWhenMovedMention(ProcessInstanceTask instanceTask, List<UUID> uuidList) {
		Map<String, String> templateMap = new HashMap<>();
		setSubdomainTemplate(templateMap);
		setAssignedTemplateData(templateMap);
		templateMap.put("taskname", instanceTask.getProcessDefinitionTask().getTaskName());
		templateMap.put("workflow",
				instanceTask.getProcessDefinitionTask().getProcessDefinition().getProcessDefinitionName());
		templateMap.put("taskId", instanceTask.getProcessInstanceTaskId().toString());
		templateMap.put("workspaceKey",
				getWorkspaceKey(instanceTask.getProcessDefinitionTask().getProcessDefinition().getWorkspaceId()));
		Set<EmailPerson> setEmailPerson = new HashSet<>();
		getEmailPersonFromListUsers(setEmailPerson, uuidList);
		queueService.publishToEmail(createEmail(setEmailPerson, templateMap, "workflowTaskAssign"));
	}

	public void handleWorkflowTaskAssignWhenMovedMentionForSendBack(ProcessInstanceTask instanceTask,
			List<UUID> uuidList) {
		Map<String, String> templateMap = new HashMap<>();
		setSubdomainTemplate(templateMap);
		setAssignedTemplateData(templateMap);
		templateMap.put("taskname", instanceTask.getProcessDefinitionTask().getTaskName());
		templateMap.put("workflow",
				instanceTask.getProcessDefinitionTask().getProcessDefinition().getProcessDefinitionName());
		templateMap.put("taskId", instanceTask.getProcessInstanceTaskId().toString());
		templateMap.put("workspaceKey",
				getWorkspaceKey(instanceTask.getProcessDefinitionTask().getProcessDefinition().getWorkspaceId()));
		if (instanceTask.getData() != null && instanceTask.getData().has("sendBackComments")
				&& instanceTask.getData().get("sendBackComments") != null) {
			templateMap.put("comment", instanceTask.getData().get("sendBackComments").asText());
		}
		Set<EmailPerson> setEmailPerson = new HashSet<>();
		getEmailPersonFromListUsers(setEmailPerson, uuidList);
		queueService.publishToEmail(createEmail(setEmailPerson, templateMap, "workflowSendBack"));
	}

	private void setSubdomainTemplate(Map<String, String> templateMap) {
		getSubDomain(templateMap);
	}

	private String getUser() {
		User user = userRepo.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
				YorosisContext.get().getUserName(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (user != null) {
			return user.getFirstName() + " " + user.getLastName();
		} else {
			return YorosisContext.get().getUserName();
		}
	}

	private void setmentionTemplateData(Map<String, String> templateMap) {
		Instant instant = Instant.now();
		DateTimeFormatter formatter = DateTimeFormatter.ofLocalizedDateTime(FormatStyle.MEDIUM).withLocale(Locale.US)
				.withZone(ZoneId.systemDefault());
		templateMap.put("mentionedAt", formatter.format(instant));
		templateMap.put("mentionedBy", getUser());
	}

	private void setAssignedTemplateData(Map<String, String> templateMap) {
		Instant instant = Instant.now();
		DateTimeFormatter formatter = DateTimeFormatter.ofLocalizedDateTime(FormatStyle.MEDIUM).withLocale(Locale.US)
				.withZone(ZoneId.systemDefault());
		templateMap.put("assignedAt", formatter.format(instant));
		templateMap.put("assignedBy", getUser());
	}

	public void handleTaskCommentsMention(TaskboardTask taskboardTask, TaskCommentsVO taskCommentsVO) {
		Taskboard vo = taskboardTask.getTaskboard();

		Map<String, String> templateMap = new HashMap<>();
		getSubDomain(templateMap);
		setmentionTemplateData(templateMap);
		templateMap.put("taskboardname", vo.getName());
		templateMap.put("taskboardkey", vo.getTaskboardKey());
		templateMap.put("taskkey", taskboardTask.getTaskId());
		templateMap.put("taskname", taskboardTask.getTaskName());
		templateMap.put("workspaceKey", getWorkspaceKey(taskboardTask.getTaskboard().getWorkspaceId()));
		Set<EmailPerson> setEmailPerson = new HashSet<>();
		taskCommentsVO.getMentionedUsersEmail().stream()
				.forEach(e -> setEmailPerson.add(EmailPerson.builder().emailId(e).build()));
		queueService.publishToEmail(createEmail(setEmailPerson, templateMap, "task_comment_mention"));
	}

	public void handleTaskAssignmentNotification(TaskboardTask taskboardTask, List<AssignUserTaskVO> assignUserTaskList,
			List<UUID> listUserId) {

//		List<UUID> listUserId = assignUserTaskList.stream().map(s -> s.getAssigneeUser()).collect(Collectors.toList());
		if (CollectionUtils.isNotEmpty(listUserId)) {
			log.warn("No assigned users {}", taskboardTask.getTaskId());
			return;
		}

		Taskboard vo = taskboardTask.getTaskboard();

		Map<String, String> templateMap = new HashMap<>();
		getSubDomain(templateMap);
		setAssignedTemplateData(templateMap);
		templateMap.put("taskboardname", vo.getName());
		templateMap.put("taskboardkey", vo.getTaskboardKey());
		templateMap.put("taskkey", taskboardTask.getTaskId());
		templateMap.put("taskname", taskboardTask.getTaskName());
		templateMap.put("workspaceKey", getWorkspaceKey(taskboardTask.getTaskboard().getWorkspaceId()));
		Set<EmailPerson> setEmailPerson = new HashSet<>();
		getEmailPersonFromListUsers(setEmailPerson, listUserId);
		queueService.publishToEmail(createEmail(setEmailPerson, templateMap, "task_assigned"));

	}

	private void getEmailPersonFromListUsers(Set<EmailPerson> setEmailPerson, List<UUID> listUserId) {
		List<User> listUsersEntity = userRepo.findUsersByID(listUserId, YorosisContext.get().getTenantId());
		if (CollectionUtils.isNotEmpty(listUsersEntity)) {
			listUsersEntity.stream()
					.forEach(s -> setEmailPerson.add(EmailPerson.builder().emailId(s.getContactEmailId()).build()));
		}
	}

	private Email createEmail(Set<EmailPerson> setEmailPerson, Map<String, String> templateMap, String templateBodyId) {
		return Email.builder().tenantId(YorosisContext.get().getTenantId()).isHTML(true).templateBodyId(templateBodyId)
				.templateValues(templateMap).toRecipientList(setEmailPerson).build();
	}

	private Email createEmail(EmailPerson toRecipientPerson, Map<String, String> templateMap,
			List<Map<String, String>> iterativeTemplateValues, String templateBodyId) {
		return Email.builder().tenantId(YorosisContext.get().getTenantId()).isHTML(true).templateBodyId(templateBodyId)
				.iterativeTemplateValues(iterativeTemplateValues)
				.templateValues(templateMap).toRecipientEmail(toRecipientPerson).build();
	}

	private void handleLabelChangeNotification(TaskboardTask taskboardTask, Set<String> existingLabelsSet,
			Set<String> newLabelsSet, String labelSubstatus) {
		if ((existingLabelsSet == null || existingLabelsSet.isEmpty())
				&& (newLabelsSet == null || newLabelsSet.isEmpty())) {
			return;
		}

		Taskboard vo = taskboardTask.getTaskboard();
		LabelEventPayload labelPayload = LabelEventPayload.builder().existingLabels(existingLabelsSet)
				.newLabels(newLabelsSet).build();

		YorosisContext context = YorosisContext.get();
		AutomationUser automationUser = AutomationUser.builder().firstName(context.getUserName())
				.lastName(context.getUserName()).userName(context.getUserName()).build();

		TaskInfo taskInfo = TaskInfo.builder().taskId(taskboardTask.getId()).taskBoardId(vo.getId())
				.taskKey(taskboardTask.getTaskId()).taskName(taskboardTask.getTaskName()).taskBoardName(vo.getName())
				.automationType(EVENT_LABEL).eventPayload(labelPayload).tenantId(context.getTenantId())
				.automationUser(automationUser).emailTemplateId(mapAutomationTypeEmailTemplate.get(labelSubstatus))
				.build();
		taskInfo.setTemplateKeys(getTemplateKeys(taskboardTask, automationUser));
		taskInfo.setListOfAssignedUsers(getListOfAssignedUsers(taskboardTask));

		try {
			log.debug("Task Info Payload to the automation queue: {}", mapper.writeValueAsString(taskInfo));
		} catch (JsonProcessingException e) {
			log.warn("Ignore error as it does not impact business", e);
		}

		if (queueService == null) {
			log.warn("Queue Service is disabled. Need to fallback to database table!");
		} else {
			queueService.publishToTaskQueue(taskInfo);
		}
	}

	private Map<String, String> getTemplateKeys(TaskboardTask taskboardTask, AutomationUser automationUser) {

		Taskboard vo = taskboardTask.getTaskboard();

		Map<String, String> templateMap = new HashMap<>();

		getSubDomain(templateMap);
		templateMap.put("workspaceKey", getWorkspaceKey(vo.getWorkspaceId()));
		templateMap.put("taskboardname", vo.getName());
		templateMap.put("taskboardkey", vo.getTaskboardKey());
		templateMap.put("taskkey", taskboardTask.getTaskId());
		templateMap.put("taskname", StringUtils.isBlank(taskboardTask.getTaskName()) ? taskboardTask.getTaskId()
				: taskboardTask.getTaskName());
		templateMap.put("firstname", automationUser.getFirstName());
		templateMap.put("lastname", automationUser.getLastName());
		templateMap.put("username", automationUser.getUserName());

		return templateMap;
	}

	private void getSubDomain(Map<String, String> templateMap) {
		String token = YorosisContext.get().getToken();
		if (StringUtils.isNoneBlank(token)) {
			String authToken = token.startsWith(TOKEN_PREFIX) ? token.replace(TOKEN_PREFIX, "").trim() : token.trim();
			Claims subDomain = tokenProviderService.getAllClaimsFromToken(authToken);
			// log.info();
			templateMap.put("subdomain", subDomain.get("sub_domain", String.class));
		}
	}

	public void handleDocsMention(YoroDocuments yoroDocuments, YoroDocumentVO yoroDocumentVO) {

		Map<String, String> templateMap = new HashMap<>();
		getSubDomain(templateMap);
		setmentionTemplateData(templateMap);
		templateMap.put("docName", yoroDocuments.getDocumentName());
		templateMap.put("docKey", yoroDocuments.getDocumentKey());
		templateMap.put("workspaceKey", getWorkspaceKey(yoroDocuments.getWorkspaceId()));
		Set<EmailPerson> setEmailPerson = new HashSet<>();
		yoroDocumentVO.getMentionedUsersEmail().stream()
				.forEach(e -> setEmailPerson.add(EmailPerson.builder().emailId(e).build()));
		queueService.publishToEmail(createEmail(setEmailPerson, templateMap, "doc_mention"));
	}

	public void sendSummaryEmails(Map<UUID, UserTasks> mapUserTasks) {
		log.info("Sending summary emails");
		mapUserTasks.values().stream().map(s -> mapUUIDToEmailPerson(s)).forEach(t -> {
			queueService.publishToEmail(t);

		});

	}


	private Email mapUUIDToEmailPerson(UserTasks userTask) {
		User user = userRepo.findByUserIdAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(userTask.getUserId(), "Y",
				YorosisContext.get().getTenantId());
		Map<String, String> templateMap = new HashMap<>();

		getSubDomain(templateMap);
		templateMap.put("firstname", user.getFirstName());
		templateMap.put("lastname", user.getLastName());
		templateMap.put("username", user.getUserName());

		EmailPerson emailPerson = EmailPerson.builder().userID(userTask.getUserId())
				.name(user.getFirstName() + " " + user.getLastName()).emailId(user.getEmailId()).build();

		Email.builder().toRecipientEmail(emailPerson);
		return createEmail(emailPerson, templateMap, mapTaskBoardVO(userTask.getTaskBoardTaskVOs()), EMAIL_TEMPLATE_SUMMARY);
	}

	private List<Map<String, String>> mapTaskBoardVO(Set<TaskboardTaskVO> taskBoardTaskVOs) {
		List<Map<String, String>> listIterativeTemplateValues = new ArrayList<Map<String, String>>();

		for (TaskboardTaskVO taskBoardTaskVO : taskBoardTaskVOs) {
			Map<String, String> iterativeTemplateValues = new HashMap<String, String>();

			iterativeTemplateValues.put("taskname", taskBoardTaskVO.getTaskName());
			iterativeTemplateValues.put("taskid", taskBoardTaskVO.getTaskId());
			iterativeTemplateValues.put("taskBoard", taskBoardTaskVO.getTaskBoardName());
			iterativeTemplateValues.put("workspace", taskBoardTaskVO.getWorkspaceKey());
			listIterativeTemplateValues.add(iterativeTemplateValues);

		}
		return listIterativeTemplateValues;



	}
}
