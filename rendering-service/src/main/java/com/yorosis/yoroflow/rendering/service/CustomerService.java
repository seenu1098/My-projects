package com.yorosis.yoroflow.rendering.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroapps.entities.Customers;
import com.yorosis.yoroflow.rendering.constants.YoroappsConstants;
import com.yorosis.yoroflow.rendering.repository.CustomersRepository;

@Service
public class CustomerService {

	@Autowired
	private CustomersRepository customersRepository;

	@Transactional
	public Customers getCustomer(String domain) {
		return customersRepository.findBySubdomainNameIgnoreCaseAndActiveFlagIgnoreCase(domain, YoroappsConstants.YES);
	}
}
