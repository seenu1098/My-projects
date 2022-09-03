package com.yorosis.taskboard.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.taskboard.repository.CustomersRepository;
import com.yorosis.taskboard.taskboard.entities.Customers;
import com.yorosis.yoroflow.general.constants.YorosisConstants;

@Service
public class CustomerService {

	@Autowired
	private CustomersRepository customersRepository;

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public Customers getCustomerBySubDomain(String domain) {
		return customersRepository.findBySubdomainNameIgnoreCaseAndActiveFlagIgnoreCase(domain, YorosisConstants.YES);
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public Customers getCustomerByTenant(String tenantId) {
		return customersRepository.findBySubdomainNameIgnoreCaseAndActiveFlagIgnoreCase(tenantId, YorosisConstants.YES);
	}
}
