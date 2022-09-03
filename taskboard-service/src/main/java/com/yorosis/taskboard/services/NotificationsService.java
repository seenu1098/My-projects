package com.yorosis.taskboard.services;

import java.util.UUID;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yorosis.taskboard.event.automation.service.EventsAutomationService;
import com.yorosis.taskboard.models.NotificationsVO;
import com.yorosis.taskboard.models.TaskCommentsVO;
import com.yorosis.taskboard.repository.UsersRepository;
import com.yorosis.taskboard.services.clients.MessagingServiceClient;
import com.yorosis.taskboard.taskboard.entities.TaskboardTask;
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
		return userRepository.findByUserNameAndTenantId(YorosisContext.get().getUserName(), YorosisContext.get().getTenantId()).getUserId();
	}

	@Transactional
	public void handleTaskCommentsNotifications(TaskboardTask taskboardTask, TaskCommentsVO taskCommentsVO) {
		UUID loggedInuserId = getLoggedInUserId();
		for (UUID userId : taskCommentsVO.getMentionedUsersId()) {
			NotificationsVO notificationsVO = NotificationsVO.builder().fromId(loggedInuserId).toId(userId).type("taskboard")
					.message("You are mentioned in task comments of " + taskboardTask.getTaskId() + " on the taskboard "
							+ taskboardTask.getTaskboard().getName())
					.taskboardId(taskboardTask.getTaskboard().getId()).taskboardTaskId(taskboardTask.getId()).build();
			messagingServiceClient.saveNotifications(YorosisContext.get().getToken(), notificationsVO);
		}
		eventAutomationService.handleTaskCommentsMention(taskboardTask, taskCommentsVO);
	}

}
