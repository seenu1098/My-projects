package com.yorosis.taskboard.event.automation.service;

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

import javax.annotation.PostConstruct;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yorosis.taskboard.models.AssignUserTaskVO;
import com.yorosis.taskboard.models.TaskCommentsVO;
import com.yorosis.taskboard.models.TaskboardTaskVO;
import com.yorosis.taskboard.models.UserTasks;
import com.yorosis.taskboard.repository.EventAutomationRepository;
import com.yorosis.taskboard.repository.UsersRepository;
import com.yorosis.taskboard.repository.WorkspaceRepository;
import com.yorosis.taskboard.services.QueueService;
import com.yorosis.taskboard.services.TokenProviderService;
import com.yorosis.taskboard.taskboard.entities.EventAutomation;
import com.yorosis.taskboard.taskboard.entities.Taskboard;
import com.yorosis.taskboard.taskboard.entities.TaskboardTask;
import com.yorosis.taskboard.taskboard.entities.TaskboardTaskAssignedUsers;
import com.yorosis.taskboard.taskboard.entities.User;
import com.yorosis.taskboard.taskboard.entities.Workspace;
import com.yorosis.yoroapps.automation.AutomationUser;
import com.yorosis.yoroapps.automation.Email;
import com.yorosis.yoroapps.automation.EmailPerson;
import com.yorosis.yoroapps.automation.LabelEventPayload;
import com.yorosis.yoroapps.automation.TaskInfo;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import io.jsonwebtoken.Claims;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class EventsAutomationService {
	private static final String TASK_INFO_PAYLOAD_TO_THE_AUTOMATION_QUEUE = "Task Info Payload to the automation queue: {}";
	private static final String AUTOMATION_RULES_PRESENT_FOR_STATUS_FOR_TASKBOARD = "Automation rules present for status for taskboard: {}";
	private static final String QUEUE_SERVICE_IS_DISABLED_NEED_TO_FALLBACK_TO_DATABASE_TABLE = "Queue Service is disabled. Need to fallback to database table!";
	private static final String IGNORE_ERROR_AS_IT_DOES_NOT_IMPACT_BUSINESS = "Ignore error as it does not impact business";
	private static final String NO_AUTOMATION_EXISTS_FOR_TASKBOARD_AND_STATUS = "NO AUTOMATION exists for taskboard: {} and status {}";

	private static final String WORKSPACE_KEY = "workspaceKey";
	private static final String TASKNAME = "taskname";
	private static final String TASKKEY = "taskkey";
	private static final String TASKBOARDKEY = "taskboardkey";
	private static final String TASKBOARDNAME = "taskboardname";

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
	private WorkspaceRepository workspaceRepository;

	private Map<String, String> mapAutomationTypeEmailTemplate = new HashMap<>();

	@PostConstruct
	private void initialize() {
		mapAutomationTypeEmailTemplate.put(EVENT_SUB_LABEL_ADDED, EMAIL_TEMPLATE_LABEL_ADDED);
		mapAutomationTypeEmailTemplate.put(EVENT_SUB_LABEL_REMOVED, EMAIL_TEMPLATE_LABEL_REMOVED);
		mapAutomationTypeEmailTemplate.put(EVENT_STATUS, EMAIL_TEMPLATE_STATUS_CHANGED);
		mapAutomationTypeEmailTemplate.put(EVENT_SUBTASK_STATUS, EMAIL_TEMPLATE_SUBTASK_STATUS);
		mapAutomationTypeEmailTemplate.put(EVENT_NEW_ITEM, EMAIL_TEMPLATE_ADD_NEW_ITEM);
		mapAutomationTypeEmailTemplate.put(EVENT_COMMENT, EMAIL_TEMPLATE_COMMENT_ADDED);
		mapAutomationTypeEmailTemplate.put(EVENT_DUE_DATE, EMAIL_TEMPLATE_DUE_DATE_REACHED);
	}

	private boolean isAutomationPresent(UUID taskboardId, String eventType) {
		List<EventAutomation> list = automationRepo.getAutomationListFor((taskboardId), YorosisContext.get().getTenantId(), YorosisConstants.YES, eventType);
		return CollectionUtils.isNotEmpty(list);
	}

	public void handleSubTaskStatusChange(UUID taskboardId, TaskboardTask taskboardTask, String status) {
		if (StringUtils.isBlank(status)) {
			log.warn("No status is available for event automation on Taskboard: {} and Task: {}", taskboardId, taskboardTask.getId());
			return;
		}

		handleEventNotification(taskboardTask, status, mapAutomationTypeEmailTemplate.get(EVENT_SUBTASK_STATUS), EVENT_SUBTASK_STATUS);

	}

	public void handleDueDate(UUID taskboardId, TaskboardTask taskboardTask, String status) {
		log.warn("Due date reached for Task {} with name {} and for Taskboard: {} ", taskboardTask.getId(), taskboardTask.getTaskName(), taskboardId);
		handleEventNotification(taskboardTask, status, mapAutomationTypeEmailTemplate.get(EVENT_DUE_DATE), EVENT_DUE_DATE);

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
			log.info(AUTOMATION_RULES_PRESENT_FOR_STATUS_FOR_TASKBOARD, taskboardId);
			handleEventNotification(taskboardTask, status, mapAutomationTypeEmailTemplate.get(EVENT_STATUS), EVENT_STATUS);
			return;
		}
		log.warn(NO_AUTOMATION_EXISTS_FOR_TASKBOARD_AND_STATUS, taskboardId, EVENT_STATUS);

	}

	@Transactional
	public void handleCommentChange(UUID taskboardId, TaskboardTask taskboardTask) {
		if (isAutomationPresent(taskboardId, EVENT_COMMENT)) {
			log.info(AUTOMATION_RULES_PRESENT_FOR_STATUS_FOR_TASKBOARD, taskboardId);
			handleEventNotification(taskboardTask, StringUtils.EMPTY, mapAutomationTypeEmailTemplate.get(EVENT_COMMENT), EVENT_COMMENT);
			return;
		}
		log.warn(NO_AUTOMATION_EXISTS_FOR_TASKBOARD_AND_STATUS, taskboardId, EVENT_COMMENT);

	}

	@Transactional
	public void handleNewItemsChange(UUID taskboardId, TaskboardTask taskboardTask) {
		if (isAutomationPresent(taskboardId, EVENT_NEW_ITEM)) {
			log.info(AUTOMATION_RULES_PRESENT_FOR_STATUS_FOR_TASKBOARD, taskboardId);
			handleEventNotification(taskboardTask, StringUtils.EMPTY, mapAutomationTypeEmailTemplate.get(EVENT_NEW_ITEM), EVENT_NEW_ITEM);
			return;
		}
		log.warn(NO_AUTOMATION_EXISTS_FOR_TASKBOARD_AND_STATUS, taskboardId, EVENT_NEW_ITEM);

	}

	@Transactional
	public void handleLabelChange(UUID taskboardId, TaskboardTask taskboardTask, Set<String> existingLabelsSet, Set<String> newLabelsSet,
			String labelSubstatus) {

		if (isAutomationPresent(taskboardId, EVENT_LABEL)) {
			log.info("Automation rules present for label for taskboard: {}", taskboardId);
			handleLabelChangeNotification(taskboardTask, existingLabelsSet, newLabelsSet, labelSubstatus);
			return;
		}
		log.warn(NO_AUTOMATION_EXISTS_FOR_TASKBOARD_AND_STATUS, taskboardId, EVENT_LABEL);

	}

	@Transactional
	public void handleFieldValueChanges(UUID taskboardId, TaskboardTask taskboardTask, JsonNode oldTaskData) {
		if (isAutomationPresent(taskboardId, EVENT_FIELD_VALUE_CHANGES)) {
			log.info("Automation rules present for field value changes for taskboard: {}", taskboardId);
			handleEventFieldValue(taskboardTask, EVENT_FIELD_VALUE_CHANGES, oldTaskData);
			return;
		}
		log.warn(NO_AUTOMATION_EXISTS_FOR_TASKBOARD_AND_STATUS, taskboardId, EVENT_FIELD_VALUE_CHANGES);

	}

	private void handleEventFieldValue(TaskboardTask taskboardTask, String automationType, JsonNode oldTaskData) {
		Taskboard vo = taskboardTask.getTaskboard();
		YorosisContext context = YorosisContext.get();
		AutomationUser automationUser = AutomationUser.builder().firstName(context.getUserName()).lastName(context.getUserName())
				.userName(context.getUserName()).build();
		TaskInfo taskInfo = TaskInfo.builder().taskId(taskboardTask.getId()).taskBoardId(vo.getId()).taskKey(taskboardTask.getTaskId())
				.taskName(taskboardTask.getTaskName()).taskBoardName(vo.getName()).automationType(automationType).tenantId(context.getTenantId())
				.automationUser(automationUser).oldTaskData(oldTaskData).newTaskData(taskboardTask.getTaskData()).status(taskboardTask.getStatus()).build();
		taskInfo.setTemplateKeys(getTemplateKeys(taskboardTask, automationUser));
		taskInfo.setListOfAssignedUsers(getListOfAssignedUsers(taskboardTask));
		try {
			log.info(TASK_INFO_PAYLOAD_TO_THE_AUTOMATION_QUEUE, mapper.writeValueAsString(taskInfo));
		} catch (JsonProcessingException e) {
			log.warn(IGNORE_ERROR_AS_IT_DOES_NOT_IMPACT_BUSINESS, e);
		}

		if (queueService == null) {
			log.warn(QUEUE_SERVICE_IS_DISABLED_NEED_TO_FALLBACK_TO_DATABASE_TABLE);
		} else {
			queueService.publishToTaskQueue(taskInfo);
		}
	}

	private void handleEventNotification(TaskboardTask taskboardTask, String status, String emailTemplateId, String automationType) {

		log.info("Automation Type {}, Email Template {}", automationType, emailTemplateId);
		Taskboard vo = taskboardTask.getTaskboard();
		YorosisContext context = YorosisContext.get();
		AutomationUser automationUser = AutomationUser.builder().firstName(context.getUserName()).lastName(context.getUserName())
				.userName(context.getUserName()).build();
		TaskInfo taskInfo = TaskInfo.builder().taskId(taskboardTask.getId()).taskBoardId(vo.getId()).taskKey(taskboardTask.getTaskId())
				.taskName(taskboardTask.getTaskName()).taskBoardName(vo.getName()).automationType(automationType).status(status).tenantId(context.getTenantId())
				.automationUser(automationUser).emailTemplateId(emailTemplateId).build();
		taskInfo.setTemplateKeys(getTemplateKeys(taskboardTask, automationUser));
		taskInfo.setListOfAssignedUsers(getListOfAssignedUsers(taskboardTask));
		try {
			log.info(TASK_INFO_PAYLOAD_TO_THE_AUTOMATION_QUEUE, mapper.writeValueAsString(taskInfo));
		} catch (JsonProcessingException e) {
			log.warn(IGNORE_ERROR_AS_IT_DOES_NOT_IMPACT_BUSINESS, e);
		}

		if (queueService == null) {
			log.warn(QUEUE_SERVICE_IS_DISABLED_NEED_TO_FALLBACK_TO_DATABASE_TABLE);
		} else {
			queueService.publishToTaskQueue(taskInfo);
		}
	}

	private List<UUID> getListOfAssignedUsers(TaskboardTask taskboardTask) {
		if (taskboardTask != null && CollectionUtils.isNotEmpty(taskboardTask.getTaskboardTaskAssignedUsers())) {
			Set<TaskboardTaskAssignedUsers> setTaskboardTaskAssignedUsers = taskboardTask.getTaskboardTaskAssignedUsers();
			return setTaskboardTaskAssignedUsers.stream().map(TaskboardTaskAssignedUsers::getUserId).collect(Collectors.toList());
		}
		return Collections.emptyList();
	}

	public String getWorkspaceKey(UUID workspaceId) {
		String workspaceKey = "deace";
		if (workspaceId != null) {
			Workspace workSpace = workspaceRepository.getBasedonIdAndTenantIdAndActiveFlag(workspaceId, YorosisContext.get().getTenantId(),
					YorosisConstants.YES);
			if (workSpace != null) {
				workspaceKey = workSpace.getWorkspaceUniqueId();
			}
		}
		return workspaceKey;
	}

	private String getUser() {
		User user = userRepo.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(YorosisContext.get().getUserName(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (user != null) {
			return user.getFirstName() + " " + user.getLastName();
		} else {
			return YorosisContext.get().getUserName();
		}
	}

	private void setmentionTemplateData(Map<String, String> templateMap) {
		Instant instant = Instant.now();
		DateTimeFormatter formatter = DateTimeFormatter.ofLocalizedDateTime(FormatStyle.MEDIUM).withLocale(Locale.US).withZone(ZoneId.systemDefault());
		templateMap.put("mentionedAt", formatter.format(instant));
		templateMap.put("mentionedBy", getUser());
	}

	private void setAssignedTemplateData(Map<String, String> templateMap) {
		Instant instant = Instant.now();
		DateTimeFormatter formatter = DateTimeFormatter.ofLocalizedDateTime(FormatStyle.MEDIUM).withLocale(Locale.US).withZone(ZoneId.systemDefault());
		templateMap.put("assignedAt", formatter.format(instant));
		templateMap.put("assignedBy", getUser());
	}

	public void handleTaskCommentsMention(TaskboardTask taskboardTask, TaskCommentsVO taskCommentsVO) {
		Taskboard vo = taskboardTask.getTaskboard();

		Map<String, String> templateMap = new HashMap<>();
		getSubDomain(templateMap);
		setmentionTemplateData(templateMap);
		templateMap.put(TASKBOARDNAME, vo.getName());
		templateMap.put(TASKBOARDKEY, vo.getTaskboardKey());
		templateMap.put(TASKKEY, taskboardTask.getTaskId());
		templateMap.put(TASKNAME, taskboardTask.getTaskName());
		templateMap.put(WORKSPACE_KEY, getWorkspaceKey(taskboardTask.getTaskboard().getWorkspaceId()));
		Set<EmailPerson> setEmailPerson = new HashSet<>();
		taskCommentsVO.getMentionedUsersEmail().stream().forEach(e -> setEmailPerson.add(EmailPerson.builder().emailId(e).build()));
		queueService.publishToEmail(createEmail(setEmailPerson, templateMap, "task_comment_mention"));
	}

	public void handleTaskAssignmentNotification(TaskboardTask taskboardTask, List<AssignUserTaskVO> assignUserTaskList, List<UUID> listUserId) {
		if (CollectionUtils.isNotEmpty(listUserId)) {
			log.warn("No assigned users {}", taskboardTask.getTaskId());
			return;
		}

		if (assignUserTaskList != null) {
			log.debug("Assigned user task list size: {}", assignUserTaskList.size());
		}

		Taskboard vo = taskboardTask.getTaskboard();

		Map<String, String> templateMap = new HashMap<>();
		getSubDomain(templateMap);
		setAssignedTemplateData(templateMap);
		templateMap.put(TASKBOARDNAME, vo.getName());
		templateMap.put(TASKBOARDKEY, vo.getTaskboardKey());
		templateMap.put(TASKKEY, taskboardTask.getTaskId());
		templateMap.put(TASKNAME, taskboardTask.getTaskName());
		templateMap.put(WORKSPACE_KEY, getWorkspaceKey(taskboardTask.getTaskboard().getWorkspaceId()));
		Set<EmailPerson> setEmailPerson = new HashSet<>();
		getEmailPersonFromListUsers(setEmailPerson, listUserId);
		queueService.publishToEmail(createEmail(setEmailPerson, templateMap, "task_assigned"));

	}

	private void getEmailPersonFromListUsers(Set<EmailPerson> setEmailPerson, List<UUID> listUserId) {
		List<User> listUsersEntity = userRepo.findUsersByID(listUserId, YorosisContext.get().getTenantId());
		if (CollectionUtils.isNotEmpty(listUsersEntity)) {
			listUsersEntity.stream().forEach(s -> setEmailPerson.add(EmailPerson.builder().emailId(s.getContactEmailId()).build()));
		}
	}

	private Email createEmail(Set<EmailPerson> setEmailPerson, Map<String, String> templateMap, String templateBodyId) {
		return Email.builder().tenantId(YorosisContext.get().getTenantId()).isHTML(true).templateBodyId(templateBodyId).templateValues(templateMap)
				.toRecipientList(setEmailPerson).build();
	}

	private Email createEmail(EmailPerson toRecipientPerson, Map<String, String> templateMap, List<Map<String, String>> iterativeTemplateValues,
			String templateBodyId) {
		return Email.builder().tenantId(YorosisContext.get().getTenantId()).isHTML(true).templateBodyId(templateBodyId)
				.iterativeTemplateValues(iterativeTemplateValues).templateValues(templateMap).toRecipientEmail(toRecipientPerson).build();
	}

	private void handleLabelChangeNotification(TaskboardTask taskboardTask, Set<String> existingLabelsSet, Set<String> newLabelsSet, String labelSubstatus) {
		if ((existingLabelsSet == null || existingLabelsSet.isEmpty()) && (newLabelsSet == null || newLabelsSet.isEmpty())) {
			return;
		}

		Taskboard vo = taskboardTask.getTaskboard();
		LabelEventPayload labelPayload = LabelEventPayload.builder().existingLabels(existingLabelsSet).newLabels(newLabelsSet).build();

		YorosisContext context = YorosisContext.get();
		AutomationUser automationUser = AutomationUser.builder().firstName(context.getUserName()).lastName(context.getUserName())
				.userName(context.getUserName()).build();

		TaskInfo taskInfo = TaskInfo.builder().taskId(taskboardTask.getId()).taskBoardId(vo.getId()).taskKey(taskboardTask.getTaskId())
				.taskName(taskboardTask.getTaskName()).taskBoardName(vo.getName()).automationType(EVENT_LABEL).eventPayload(labelPayload)
				.tenantId(context.getTenantId()).automationUser(automationUser).emailTemplateId(mapAutomationTypeEmailTemplate.get(labelSubstatus)).build();
		taskInfo.setTemplateKeys(getTemplateKeys(taskboardTask, automationUser));
		taskInfo.setListOfAssignedUsers(getListOfAssignedUsers(taskboardTask));

		try {
			log.debug(TASK_INFO_PAYLOAD_TO_THE_AUTOMATION_QUEUE, mapper.writeValueAsString(taskInfo));
		} catch (JsonProcessingException e) {
			log.warn(IGNORE_ERROR_AS_IT_DOES_NOT_IMPACT_BUSINESS, e);
		}

		if (queueService == null) {
			log.warn(QUEUE_SERVICE_IS_DISABLED_NEED_TO_FALLBACK_TO_DATABASE_TABLE);
		} else {
			queueService.publishToTaskQueue(taskInfo);
		}
	}

	private Map<String, String> getTemplateKeys(TaskboardTask taskboardTask, AutomationUser automationUser) {

		Taskboard vo = taskboardTask.getTaskboard();

		Map<String, String> templateMap = new HashMap<>();

		getSubDomain(templateMap);
		templateMap.put(WORKSPACE_KEY, getWorkspaceKey(vo.getWorkspaceId()));
		templateMap.put(TASKBOARDNAME, vo.getName());
		templateMap.put(TASKBOARDKEY, vo.getTaskboardKey());
		templateMap.put(TASKKEY, taskboardTask.getTaskId());
		templateMap.put(TASKNAME, StringUtils.isBlank(taskboardTask.getTaskName()) ? taskboardTask.getTaskId() : taskboardTask.getTaskName());
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
			templateMap.put("subdomain", subDomain.get("sub_domain", String.class));
		}
	}

	public void sendSummaryEmails(Map<UUID, UserTasks> mapUserTasks) {
		log.info("Sending summary emails");
		mapUserTasks.values().stream().map(this::mapUUIDToEmailPerson).forEach(t -> queueService.publishToEmail(t));
	}

	private Email mapUUIDToEmailPerson(UserTasks s) {
		User user = userRepo.findByUserIdAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(s.getUserId(), "Y", YorosisContext.get().getTenantId());
		Map<String, String> templateMap = new HashMap<>();

		getSubDomain(templateMap);
		templateMap.put("firstname", user.getFirstName());
		templateMap.put("lastname", user.getLastName());
		templateMap.put("username", user.getUserName());

		EmailPerson emailPerson = EmailPerson.builder().userID(s.getUserId()).name(user.getFirstName() + " " + user.getLastName()).emailId(user.getEmailId())
				.build();

		Email.builder().toRecipientEmail(emailPerson);
		return createEmail(emailPerson, templateMap, mapTaskBoardVO(s.getTaskBoardTaskVOs()), EMAIL_TEMPLATE_SUMMARY);
	}

	private List<Map<String, String>> mapTaskBoardVO(Set<TaskboardTaskVO> taskBoardTaskVOs) {
		List<Map<String, String>> listIterativeTemplateValues = new ArrayList<>();

		for (TaskboardTaskVO taskBoardTaskVO : taskBoardTaskVOs) {
			Map<String, String> iterativeTemplateValues = new HashMap<>();

			iterativeTemplateValues.put(TASKNAME, taskBoardTaskVO.getTaskName());
			iterativeTemplateValues.put("taskid", taskBoardTaskVO.getTaskId());
			iterativeTemplateValues.put("taskBoard", taskBoardTaskVO.getTaskBoardName());
			listIterativeTemplateValues.add(iterativeTemplateValues);

		}
		return listIterativeTemplateValues;

	}
}
