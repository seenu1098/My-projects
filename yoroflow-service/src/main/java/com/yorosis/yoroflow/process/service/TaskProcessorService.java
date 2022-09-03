package com.yorosis.yoroflow.process.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import javax.annotation.PreDestroy;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroflow.entities.ProcessQueue;
import com.yorosis.yoroflow.general.exception.ErrorHandler;
import com.yorosis.yoroflow.models.TaskDetailsResponse;
import com.yorosis.yoroflow.repository.ProcessQueueRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;
import com.yorosis.yoroflow.services.FlowEngineService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class TaskProcessorService {
	private static final String ERROR_STATUS = "ERROR";
	private static final String PENDING_STATUS = "PENDING";
	private static final String PROCESSING_STATUS = "PROCESSING";

	@Value("${queue.enabled}")
	private boolean queueEnabled;

	@Autowired
	private ProcessQueueRepository processQueueRepo;

	@Autowired
	private ApplicationContext context;

	@Autowired
	private FlowEngineService flowEngineService;

	@Autowired
	private ErrorHandler errorHandler;

	private ExecutorService threadPool = Executors.newFixedThreadPool(10);

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void processTasks() {
		log.info("Running schedule for processing tasks.... ");

		LocalDateTime localDateTime = LocalDateTime.now();
		if (queueEnabled) {
			localDateTime = localDateTime.minusMinutes(10);
		}

		Pageable pageRequest = PageRequest.of(0, 100);
		List<ProcessQueue> list = processQueueRepo.getRecordsForProcessing(PENDING_STATUS, localDateTime, pageRequest);

		log.info("Total records: {}", list.size());
		if (!list.isEmpty()) {
			list.stream().forEach(p -> {
				p.setPickedUpBy(Thread.currentThread().getName());
				p.setPickedUpTimestamp(LocalDateTime.now());
				p.setStatus(PROCESSING_STATUS);
			});
			log.info("Updating the status");

			processQueueRepo.saveAll(list);

			for (ProcessQueue processQueue : list) {
				ProcessThread processThread = context.getBean(ProcessThread.class, processQueue.getProcessQueueId(), processQueue.getProcessInstanceId(),
						processQueue.getProcessDefinitionTaskId(), YorosisContext.get().getTenantId(), YorosisContext.get().getUserName(),
						YorosisContext.get().getToken());
				threadPool.submit(processThread);
			}

			log.info("Submitted the threads");
		}
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void processIndividualTask(UUID processQueueId) {
		log.info("Getting the corresponding record for queue id: {} and for tenant: {}", processQueueId, YorosisContext.get().getTenantId());
		ProcessQueue queue = processQueueRepo.getOne(processQueueId);
		processIndividualTask(queue, queue.getProcessQueueId(), queue.getProcessInstanceId(), queue.getProcessDefinitionTaskId());
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void processIndividualTask(UUID processQueueId, UUID processInstanceId, UUID processDefinitionTaskId) {
		processIndividualTask(null, processQueueId, processInstanceId, processDefinitionTaskId);
	}

	private void processIndividualTask(ProcessQueue processQueue, UUID processQueueId, UUID processInstanceId, UUID processDefinitionTaskId) {
		TaskDetailsResponse response = null;
		if (processQueue == null) {
			processQueue = processQueueRepo.getOne(processQueueId);
		}

		try {
			log.info("The call method is called... tenant id is: " + YorosisContext.get().getTenantId());
			response = flowEngineService.completeTask(processInstanceId, processDefinitionTaskId);
			if (response != null) {
				processQueueRepo.deleteById(processQueueId);
			}
		} catch (Exception ex) {
			String stacktrace = ExceptionUtils.getStackTrace(ex);

			processQueue.setStatus(ERROR_STATUS);
			processQueue.setErrorDescription(StringUtils.substring(stacktrace, 0, 9998));
			errorHandler.persist(processQueueRepo, processQueue);
		}
	}

	@PreDestroy
	private void shutdownPool() {
		threadPool.shutdownNow();
	}
}
