package com.yorosis.yoroflow.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroflow.entities.ProcessInstanceTask;
import com.yorosis.yoroflow.general.exception.ErrorHandler;
import com.yorosis.yoroflow.repository.ProcessInstanceTaskRepo;

@Component
public class TestTransaction {

	@Autowired
	private ProcessInstanceTaskRepo processInstanceTaskRepo;

	@Autowired
	private ErrorHandler errorHandler;

	@Transactional
	public void testTxn(ProcessInstanceTask procInstanceTask) throws Exception {
		procInstanceTask.setStatus("Throw exception");
		processInstanceTaskRepo.save(procInstanceTask);
		throw new Exception("Just some exception");

	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void testTxnCatchException(ProcessInstanceTask procInstanceTask) {
		try {
			procInstanceTask.setStatus("Catch exception");
			processInstanceTaskRepo.save(procInstanceTask);
			throw new IllegalArgumentException("Some exception");
		} catch (Exception ex) {
			procInstanceTask.setStatus("Caught exception");
			errorHandler.persist(processInstanceTaskRepo, procInstanceTask);
		}

	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void testTxnRTException(ProcessInstanceTask procInstanceTask) {
		procInstanceTask.setStatus("Catch RT exception");
		processInstanceTaskRepo.save(procInstanceTask);
		throw new IllegalArgumentException("Some exception");

	}

}
