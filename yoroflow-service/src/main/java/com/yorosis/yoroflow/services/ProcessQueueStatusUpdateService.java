package com.yorosis.yoroflow.services;

import java.util.UUID;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroflow.entities.ProcessQueue;
import com.yorosis.yoroflow.repository.ProcessQueueRepository;

@Service
public class ProcessQueueStatusUpdateService {
	private static final String PENDING_STATUS = "PENDING";
	private static final String PROCESSING_STATUS = "PROCESSING";

	@Autowired
	private ProcessQueueRepository processQueueRepo;

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public boolean updateToProcessing(UUID processQueueId) {
		return updateToProcessing(processQueueRepo.getOne(processQueueId));
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ProcessQueue insertForProcessing(ProcessQueue processQueue) {
		if (processQueue != null) {
			return processQueueRepo.save(processQueue);
		}

		return null;
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public boolean updateToProcessing(ProcessQueue processQueue) {
		if (processQueue != null && StringUtils.equalsIgnoreCase(processQueue.getStatus(), PENDING_STATUS)) {
			processQueue.setStatus(PROCESSING_STATUS);
			processQueueRepo.save(processQueue);
			return true;
		}

		return false;
	}
}
