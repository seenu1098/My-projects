package com.yorosis.yoroflow.schedule.services;

import java.sql.Timestamp;
import java.text.ParseException;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.support.CronSequenceGenerator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yorosis.yoroflow.entities.Customers;
import com.yorosis.yoroflow.entities.ProcessDefinition;
import com.yorosis.yoroflow.entities.ProcessInstanceTask;
import com.yorosis.yoroflow.entities.ProcessInstanceTaskNotes;
import com.yorosis.yoroflow.entities.User;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.EmailRequestVO;
import com.yorosis.yoroflow.models.TaskDetailsRequest;
import com.yorosis.yoroflow.models.TaskType;
import com.yorosis.yoroflow.models.YoroFlowException;
import com.yorosis.yoroflow.repository.CustomersRepository;
import com.yorosis.yoroflow.repository.ProcessDefinitionRepo;
import com.yorosis.yoroflow.repository.ProcessInstanceTaskNotesRepository;
import com.yorosis.yoroflow.repository.ProcessInstanceTaskRepo;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;
import com.yorosis.yoroflow.services.EmailNotificationServices;
import com.yorosis.yoroflow.services.EmailTaskServiceHelper;
import com.yorosis.yoroflow.services.FlowEngineService;
import com.yorosis.yoroflow.services.SmstaskServiceHelper;
import com.yorosis.yoroflow.services.WorkflowService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class SchedulerMultiTenancyService {
	private static final String ACTIVE_FLAG = "Y";

	@Autowired
	private FlowEngineService flowEngineService;

	@Autowired
	private EmailNotificationServices emailNotificationService;

	@Autowired
	private WorkflowService workflowService;

	@Autowired
	private CustomersRepository customersRepo;

	@Autowired
	private ProcessInstanceTaskRepo processInstanceTaskRepository;

	@Autowired
	private ProcessDefinitionRepo processDefinitionRepository;

	@Autowired
	private EmailTaskServiceHelper emailTaskService;

	@Autowired
	private SmstaskServiceHelper smstaskServiceHelper;

	@Autowired
	private ProcessInstanceTaskNotesRepository processInstanceTaskNotesRepository;

	@Autowired
	private ObjectMapper objectMapper;

	@Transactional
	public int getMaxTenantId() {
		return customersRepo.getActiveFlagIgnoreCaseMaxTenantId();
	}

	@Transactional
	public Set<String> getDistinctTenantIdbyRange(int startRange, int endRange) {
		List<Customers> listCustomers = customersRepo.findByActiveFlagIgnoreCaseFromTenantRange(startRange, endRange);
		if (!CollectionUtils.isEmpty(listCustomers)) {
			return listCustomers.stream().filter(this::isValidAccount).map(Customers::getTenantId).collect(Collectors.toSet());
		}

		return Collections.emptySet();
	}

	@Transactional
	public Set<String> getDistinctTenantId() {
		List<Customers> listCustomers = customersRepo.findByActiveFlagIgnoreCase(ACTIVE_FLAG);
		if (!CollectionUtils.isEmpty(listCustomers)) {
			return listCustomers.stream().filter(this::isValidAccount).map(Customers::getTenantId).collect(Collectors.toSet());
		}

		return Collections.emptySet();
	}
	
	private boolean isValidAccount(Customers customer) {
		return !(StringUtils.equalsIgnoreCase(customer.getIsPayingCustomer(), YorosisConstants.NO)
				&& customer.getTrialEndDate().getTime() < System.currentTimeMillis());
	}

	@Transactional
	public String getDefaultAdminUser(String tenantId) {
		return customersRepo.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(tenantId, ACTIVE_FLAG).getCreatedBy().trim().toLowerCase();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void processDueTasks() {
		Stream<ProcessInstanceTask> pastDueDateTasksList = processInstanceTaskRepository.getPastDueDateTasks(YorosisConstants.COMPLETED, LocalDateTime.now(),
				YorosisContext.get().getTenantId());
		// set Due processed on and persist
		pastDueDateTasksList.forEach(this::processDueTask);
	}

	private void processDueTask(ProcessInstanceTask task) {
		if (task != null && task.getProcessDefinitionTask() != null) {
			if (StringUtils.equalsIgnoreCase(task.getProcessDefinitionTask().getTaskType(), TaskType.DELAY_TIMER.toString())) {
				try {
					flowEngineService.completeTask(TaskDetailsRequest.builder().instanceTaskId(task.getProcessInstanceTaskId()).build());

				} catch (YoroFlowException | ParseException e) {
					log.error("Unexpected error occurred ", e);
				}
			} else {
				List<User> listUsers = flowEngineService.getAssignedUserInfoBasedOnTaskId(task.getProcessInstanceTaskId());
				List<String> emailList = listUsers.stream().map(User::getEmailId).collect(Collectors.toList());

				EmailRequestVO emailRequestVO = EmailRequestVO.builder().recipientEmails(emailList).subject("Gentle Reminder")
						.messageBody("Please finish this task").build();
				emailNotificationService.sendEmail(emailRequestVO);
			}
		}
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void processScheduledTasks() {
		LocalDateTime localDateTime = LocalDateTime.now().minusMinutes(5);
		Date date = Date.from(localDateTime.toInstant(ZoneOffset.UTC));
		long currentTimeInMillis = System.currentTimeMillis();

		Stream<ProcessDefinition> allScheduledTasks = processDefinitionRepository.getAllScheduledTasks(YorosisContext.get().getTenantId(), ACTIVE_FLAG);
		allScheduledTasks.forEach(p -> processScheduledTasks(p, date, currentTimeInMillis));
	}

	private void processScheduledTasks(ProcessDefinition definition, Date date, long currentTimeInMillis) {
		if (StringUtils.isNotEmpty(definition.getSchedulerExpression())) {
			log.warn(String.format("Scheduled Processing started for %s", definition.getProcessDefinitionName()));

			CronSequenceGenerator generator = new CronSequenceGenerator(definition.getSchedulerExpression());
			Date next = generator.next(date);

			if (next.getTime() <= currentTimeInMillis) {
				// call the start task
				try {
					workflowService.startProcess(definition.getKey(), definition.getWorkflowVersion(), null, definition.getWorkspaceId());
				} catch (YoroFlowException e) {
					log.error("Unable to start the scheduled task.  Task name:  " + definition.getKey() + " Version: " + definition.getWorkflowVersion(), e);
				}
			}
		}
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void getProcessRemainderTask() {
		List<ProcessInstanceTask> processRemainderTasksList = processInstanceTaskRepository.getRemainderTask(YorosisConstants.IN_PROCESS,
				YorosisContext.get().getTenantId());
		// set Due processed on and persist
		for (ProcessInstanceTask task : processRemainderTasksList) {
			try {
				processReminderTask(task);
			} catch (YoroFlowException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}

	private void processReminderTask(ProcessInstanceTask task) throws YoroFlowException {
		JsonNode jsonFieldValue = null;
		long totalTimeTaken = ChronoUnit.MINUTES.between(task.getStartTime(), LocalDateTime.now());
		jsonFieldValue = objectMapper.convertValue(task.getRemainderTask(), JsonNode.class);
		if (jsonFieldValue != null && jsonFieldValue.isArray() && !jsonFieldValue.isEmpty()) {
			for (JsonNode jsonNode : jsonFieldValue) {
				if (jsonNode.has("remainderLevel") && jsonNode.get("remainderLevel") != null && jsonNode.has("reminderTime")
						&& jsonNode.get("reminderTime") != null && jsonNode.has("reminderUnits") && jsonNode.get("reminderUnits") != null) {
					long remainderTime = 0l;
					if (StringUtils.equals(jsonNode.get("reminderUnits").asText(), "minutes")) {
						remainderTime = jsonNode.get("reminderTime").asLong();
					} else {
						remainderTime = jsonNode.get("reminderTime").asLong() * 60;
					}
					long newTime = totalTimeTaken - remainderTime;

					if (newTime > 0 && newTime <= 5) {
						if (StringUtils.equals(jsonNode.get("remainderType").asText(), "systemNotification")) {

						} else if (StringUtils.equals(jsonNode.get("remainderType").asText(), "smsNotification") && jsonNode.has("smsNotification")
								&& jsonNode.get("smsNotification") != null) {
							smstaskServiceHelper.smsTaskService(task, jsonNode.get("smsNotification"), true);
						} else if (StringUtils.equals(jsonNode.get("remainderType").asText(), "emailNotification") && jsonNode.has("emailNotification")
								&& jsonNode.get("emailNotification") != null) {
							emailTaskService.emailTaskService(task, jsonNode.get("emailNotification"), true);
						}
					}
				}
			}
		}
	}

	@Transactional
	public void saveTaskComments(ProcessInstanceTask task, String comment) {
//		LocalDateTime timestamp = LocalDateTime.now();
		Timestamp timestamp = new Timestamp(System.currentTimeMillis()); 
		List<User> listUsers = flowEngineService.getAssignedUserInfoBasedOnTaskId(task.getProcessInstanceTaskId());
		for (User user : listUsers) {
			ProcessInstanceTaskNotes processInstanceTaskNotes = ProcessInstanceTaskNotes.builder().addedBy(user.getUserId()).notes(comment)
					.createdDate((timestamp)).updatedDate(timestamp).processInstanceTask(task).tenantId(YorosisContext.get().getTenantId())
					.updatedBy(user.getUserName()).build();
			processInstanceTaskNotesRepository.save(processInstanceTaskNotes);
		}
	}

}
