package com.yorosis.taskboard.services;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.taskboard.config.RabbitConfig;
import com.yorosis.yoroapps.automation.ActivityLogInfo;
import com.yorosis.yoroapps.automation.Email;
import com.yorosis.yoroapps.automation.TaskInfo;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@ConditionalOnProperty(prefix = "queue", name = "enabled", havingValue = "true")
public class QueueService {

	@Autowired
	private RabbitTemplate publisherTemplate;

	@Transactional
	public void publishToTaskQueue(TaskInfo taskInfo) {
		publisherTemplate.convertAndSend(RabbitConfig.DEFAULT_EXCHANGE, RabbitConfig.AUTOMATION_QUEUE, taskInfo);
	}

	@Transactional
	public void publishToActivityQueue(ActivityLogInfo activityLogInfo) {
		publisherTemplate.convertAndSend(RabbitConfig.DEFAULT_EXCHANGE, RabbitConfig.ACTIVITY_LOG_QUEUE, activityLogInfo);
	}

	@Transactional
	public void publishToEmail(Email email) {
		try {
			publisherTemplate.convertAndSend(RabbitConfig.DEFAULT_EXCHANGE, RabbitConfig.EMAIL_QUEUE, email);
		} catch (Exception ex) {
			// Ignore the error when the error happens as it shouldn't stop the process
			log.error("Unable to post in the queue", ex);
		}
	}

}
