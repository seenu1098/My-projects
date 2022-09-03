package com.yorosis.yoroflow.general.exception;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Component
public class ErrorHandler {

	@SuppressWarnings("unchecked")
	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void persist(@SuppressWarnings("rawtypes") JpaRepository jpaRepo, Object baseEntity) {
		jpaRepo.save(baseEntity);
	}
}
