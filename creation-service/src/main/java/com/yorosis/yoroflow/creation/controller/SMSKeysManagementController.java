package com.yorosis.yoroflow.creation.controller;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroapps.entities.Customers;
import com.yorosis.yoroapps.entities.Organization;
import com.yorosis.yoroapps.vo.OrganizationSMSKeys;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.SMSKeyWorkflowVO;
import com.yorosis.yoroapps.vo.SMSKeysVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.CustomersRepository;
import com.yorosis.yoroflow.creation.repository.OrganizationRepository;
import com.yorosis.yoroflow.creation.service.CustomerService;
import com.yorosis.yoroflow.creation.service.SMSKeysManagementService;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@RestController
@RequestMapping("/sms-keys/v1/")
public class SMSKeysManagementController {

	@Autowired
	private SMSKeysManagementService smsKeysManagementService;

	@Autowired
	private CustomersRepository customersRepository;

	@Autowired
	private OrganizationRepository organizationRepository;

	@Autowired
	private CustomerService customerService;

	@GetMapping("/get/{subdomain}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public List<SMSKeysVO> getSMSKey(@PathVariable(name = "subdomain") String subdomain) {
		List<SMSKeysVO> list = new ArrayList<>();
		Customers customer = customersRepository.findBySubdomainNameIgnoreCaseAndActiveFlagIgnoreCase(subdomain,
				YoroappsConstants.YES);
		if (customer != null) {
			String currentTenantId = YorosisContext.get().getTenantId();
			try {
				YorosisContext.get().setTenantId(customer.getTenantId());
				list = smsKeysManagementService.getSMSKeys();
			} finally {
				YorosisContext.get().setTenantId(currentTenantId);
			}
		}
		return list;
	}

	@GetMapping("/get/org/{subdomainName}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public List<SMSKeysVO> getCustomMenuForOrg(@PathVariable(name = "subdomainName") String subdomainName) {
		List<SMSKeysVO> list = new ArrayList<>();
		Organization organization = organizationRepository
				.findBySubdomainNameIgnoreCaseAndActiveFlagIgnoreCase(subdomainName, YoroappsConstants.YES);
		if (organization != null) {
			list = smsKeysManagementService.getSMSKeys();
		}
		return list;
	}

	@GetMapping("/get-keys/list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public List<SMSKeyWorkflowVO> getSMSKeysForWorkflow() {
		return smsKeysManagementService.getSMSKeysForWorkflow();
	}

	@PostMapping("/save-keys")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ResponseStringVO saveSMSKeys(@RequestBody OrganizationSMSKeys organizationSMSKeys) {
		return smsKeysManagementService.saveSMSKeysFromWorkflow(organizationSMSKeys);
	}

	@PostMapping("/update")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ResponseStringVO updateSMSKeys(@RequestBody OrganizationSMSKeys organizationSMSKeys) {
		Customers customer = getCustomer(organizationSMSKeys.getSubdomainName());
		if (StringUtils.equalsIgnoreCase(customer.getTenantId(), YoroappsConstants.DEFAULT_SCHEMA)) {
			return smsKeysManagementService.updateSMSKeys(organizationSMSKeys);
		} else {
			YorosisContext currentContext = YorosisContext.get();
			try {
				YorosisContext.clear();
				YorosisContext context = YorosisContext.builder().tenantId(customer.getTenantId())
						.userName(currentContext.getUserName()).build();
				YorosisContext.set(context);
				return smsKeysManagementService.saveSMSKeys(organizationSMSKeys);
			} finally {
				YorosisContext.clear();
				YorosisContext.set(currentContext);
			}

		}
	}

	private Customers getCustomer(String subdomainName) {
		YorosisContext currentContext = YorosisContext.get();
		try {
			YorosisContext.clear();
			YorosisContext context = YorosisContext.builder().tenantId(YoroappsConstants.DEFAULT_SCHEMA)
					.userName(currentContext.getUserName()).build();
			YorosisContext.set(context);
			return customerService.getCustomer(subdomainName);
		} finally {
			YorosisContext.clear();
			YorosisContext.set(currentContext);
		}
	}

}
