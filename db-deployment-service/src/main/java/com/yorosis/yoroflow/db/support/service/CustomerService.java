package com.yorosis.yoroflow.db.support.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroflow.db.support.entities.Customers;
import com.yorosis.yoroflow.db.support.repository.CustomersRepository;

@Service
public class CustomerService {
	@Autowired
	private CustomersRepository customerRepo;
	
	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public List<Customers> getAllCustomers() {
		return customerRepo.findAll();
	}
}
