package com.yorosis.yoroflow.services;

import java.util.UUID;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yorosis.yoroflow.entities.ProcessInstanceTask;
import com.yorosis.yoroflow.entities.TaskboardTask;
import com.yorosis.yoroflow.entities.YoroDocuments;
import com.yorosis.yoroflow.event.automation.service.EventsAutomationService;
import com.yorosis.yoroflow.models.NotificationsVO;
import com.yorosis.yoroflow.models.ProcessInstanceTaskNotesVO;
import com.yorosis.yoroflow.models.TaskCommentsVO;
import com.yorosis.yoroflow.models.docs.YoroDocumentVO;
import com.yorosis.yoroflow.repository.UsersRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class NotificationsService {
	@Autowired
	private EventsAutomationService eventAutomationService;

	@Autowired
	private MessagingServiceClient messagingServiceClient;

	@Autowired
	private UsersRepository userRepository;

	@Transactional
	private UUID getLoggedInUserId() {
		return userRepository
				.findByUserNameAndTenantId(YorosisContext.get().getUserName(), YorosisContext.get().getTenantId())
				.getUserId();
	}

	@Transactional
	public void handleTaskCommentsNotifications(TaskboardTask taskboardTask, TaskCommentsVO taskCommentsVO) {
		UUID loggedInuserId = getLoggedInUserId();
		for (UUID userId : taskCommentsVO.getMentionedUsersId()) {
			NotificationsVO notificationsVO = NotificationsVO.builder().fromId(loggedInuserId).toId(userId)
					.type("taskboard")
					.message("You are mentioned in task comments of " + taskboardTask.getTaskId() + " on the taskboard "
							+ taskboardTask.getTaskboard().getName())
					.taskboardId(taskboardTask.getTaskboard().getId()).taskboardTaskId(taskboardTask.getId()).build();
			messagingServiceClient.saveNotifications(YorosisContext.get().getToken(), notificationsVO);
		}
		eventAutomationService.handleTaskCommentsMention(taskboardTask, taskCommentsVO);
	}

	@Transactional
	public void handleDocumentsMentionNotifications(YoroDocuments yoroDocuments, YoroDocumentVO yoroDocumentVO) {
		eventAutomationService.handleDocsMention(yoroDocuments, yoroDocumentVO);
	}

	@Transactional
	public void handleWorkflowCommentsNotifications(ProcessInstanceTask instanceTask,
			ProcessInstanceTaskNotesVO taskNotesVO) {
		UUID loggedInuserId = getLoggedInUserId();
		for (UUID userId : taskNotesVO.getMentionedUsersId()) {
			NotificationsVO notificationsVO = NotificationsVO.builder().fromId(loggedInuserId).toId(userId)
					.type("workflow")
					.message("You are mentioned in workflow comments of "
							+ instanceTask.getProcessDefinitionTask().getTaskName() + " on the workflow "
							+ instanceTask.getProcessDefinitionTask().getProcessDefinition().getProcessDefinitionName())
					.taskId(instanceTask.getProcessDefinitionTask().getTaskId()).build();
			messagingServiceClient.saveNotifications(YorosisContext.get().getToken(), notificationsVO);
			eventAutomationService.handleWorkflowCommentsMention(instanceTask, taskNotesVO);
		}
	}

}
