package com.yorosis.yoroflow.services;

import org.apache.commons.lang3.StringUtils;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroapps.automation.ActivityLogInfo;
import com.yorosis.yoroapps.automation.Email;
import com.yorosis.yoroapps.automation.TaskInfo;
import com.yorosis.yoroflow.config.RabbitConfig;
import com.yorosis.yoroflow.process.service.TaskProcessorService;
import com.yorosis.yoroflow.queue.models.ProcessQueueDto;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;
import com.yorosis.yoroflow.schedule.services.SchedulerService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@ConditionalOnProperty(prefix = "queue", name = "enabled", havingValue = "true")
public class QueueService {
	@Autowired
	private SchedulerService schedulerService;

	@Autowired
	private TaskProcessorService taskProcessorService;

	@Autowired
	private RabbitTemplate publisherTemplate;

	@Autowired
	private ProcessQueueStatusUpdateService statusUpdateService;

	@Transactional
	public void publishToProcessQueue(ProcessQueueDto queueDto) {
		publishToProcessQueue(queueDto, RabbitConfig.DEFAULT_EXCHANGE, RabbitConfig.PROCESS_QUEUE, -1);
	}

	@Transactional
	public void publishToTaskQueue(TaskInfo taskInfo) {
		publisherTemplate.convertAndSend(RabbitConfig.DEFAULT_EXCHANGE, RabbitConfig.AUTOMATION_QUEUE, taskInfo);
	}

	@Transactional
	public void publishToActivityQueue(ActivityLogInfo activityLogInfo) {
		publisherTemplate.convertAndSend(RabbitConfig.DEFAULT_EXCHANGE, RabbitConfig.ACTIVITY_LOG_QUEUE,
				activityLogInfo);
	}

	@Transactional
	public void publishToProcessQueue(ProcessQueueDto queueDto, String exchangeName, String queueName,
			int delayInSeconds) {
		try {
			if (delayInSeconds <= 0) {
				log.info("Exchange: {}, Queue Name: {}, Data: {}", exchangeName, queueName, queueDto);
				publisherTemplate.convertAndSend(exchangeName, queueName, queueDto);
				log.info("Dropped to the queue: {}", queueName);
			} else {
				log.info("Posting the the queue [{}] with a delay of [{}] seconds", queueName, delayInSeconds);
				publisherTemplate.convertAndSend(exchangeName, queueName, queueDto);
				log.info("Dropped to the queue: {} with delay of {} seconds", queueName, delayInSeconds);
			}
		} catch (Exception ex) {
			// Ignore the error when the error happens as it shouldn't stop the process
			log.error("Unable to post in the queue", ex);
		}
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

	@Transactional
	@RabbitListener(concurrency = "2-10", queues = { RabbitConfig.PROCESS_QUEUE })
	public void processTask(ProcessQueueDto queueDto) {
		try {
			log.info("Got the message on the queue for queue id: {}, tenant: {}", queueDto.getProcessQueueId(),
					queueDto.getTenantId());
			YorosisContext context = schedulerService.getDefaultTokenContext(queueDto.getTenantId());
			if (StringUtils.isNotBlank(queueDto.getCurrentUserName())) {
				context.setUserName(queueDto.getCurrentUserName());
			}
			YorosisContext.set(context);

			boolean updatedSuccessfully = statusUpdateService.updateToProcessing(queueDto.getProcessQueueId());
			log.info("Updated to processing status for queue id: {} and the update status is: {}",
					queueDto.getProcessQueueId(), updatedSuccessfully);
			if (updatedSuccessfully) {
				taskProcessorService.processIndividualTask(queueDto.getProcessQueueId());
			}
		} catch (Exception ex) {
			log.error("Error processing through queue", ex);
			publishToProcessQueue(queueDto, RabbitConfig.DEFAULT_EXCHANGE, RabbitConfig.PROCESS_FAILED_QUEUE, 30);
		} finally {
			YorosisContext.clear();
		}
	}

}
