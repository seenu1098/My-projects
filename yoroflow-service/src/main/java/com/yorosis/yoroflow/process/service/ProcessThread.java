package com.yorosis.yoroflow.process.service;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class ProcessThread implements Runnable {
	private UUID processQueueId;
	private UUID processInstanceId;
	private UUID processDefinitionTaskId;
	private String tenantId;
	private String userName;
	private String token;

	@Autowired
	private TaskProcessorService taskProcessingService;

	public ProcessThread(UUID processQueueId, UUID processInstanceId, UUID processDefinitionTaskId, String tenantId, String userName, String token) {
		this.processQueueId = processQueueId;
		this.processInstanceId = processInstanceId;
		this.processDefinitionTaskId = processDefinitionTaskId;
		this.tenantId = tenantId;
		this.userName = userName;
		this.token = token;
	}

	@Override
	public void run() {
		try {
			YorosisContext.set(YorosisContext.builder().tenantId(tenantId).userName(userName).token(token).build());
			taskProcessingService.processIndividualTask(processQueueId, processInstanceId, processDefinitionTaskId);
		} finally {
			YorosisContext.clear();
		}
	}
}
