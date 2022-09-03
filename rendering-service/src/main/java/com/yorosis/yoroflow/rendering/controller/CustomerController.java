package com.yorosis.yoroflow.rendering.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroflow.rendering.service.CustomerService;

@RestController
@RequestMapping("/customer/v1")
public class CustomerController {

	@Autowired
	private CustomerService customerService;

//	@GetMapping("/get-domain")
//	public CustomersVO getCustomerDomain(@PathVariable(name = "domain") String domain) {
//		return customerService.getCustomer(domain);
//	}

}
