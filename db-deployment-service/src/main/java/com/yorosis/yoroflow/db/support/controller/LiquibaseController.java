package com.yorosis.yoroflow.db.support.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroflow.db.support.models.CreateCustomerVO;
import com.yorosis.yoroflow.db.support.service.LiquibaseService;

@RestController
@RequestMapping("/data/v1")
public class LiquibaseController {

	@Autowired
	private LiquibaseService liquibaseService;

	@PostMapping("/create/customer")
	public void createSchemaForCustomer(@RequestBody CreateCustomerVO createCustomer) throws Exception {
		liquibaseService.createNewCustomer(createCustomer);
	}

	@PostMapping("/release/for-all-customers")
	public void executeReleaseDBChangesForCustomers() throws Exception {
		liquibaseService.executeReleaseScriptsForAllCustomers();
	}

	@PostMapping("/release/for-customer/{tenantId}")
	public void executeReleaseDBChangesForCustomers(@PathVariable("tenantId") String tenantId) throws Exception {
		liquibaseService.executeScriptsForRelease(tenantId, tenantId, tenantId);
	}
}