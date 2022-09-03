package com.yorosis.yoroflow.creation.service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.yorosis.yoroflow.creation.table.vo.CreateCustomerVO;

@FeignClient(name = "db-deployment-service", url = "${db-deployment-service.base.url}")
public interface FeignClientService {

	@RequestMapping(method = RequestMethod.POST, value = "/data/v1/create/customer", consumes = "application/json")
	public void provisionNewCustomer(@RequestBody CreateCustomerVO cutomerVO);

}