package com.yorosis.yoroflow.creation.controller;

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
import com.yorosis.yoroapps.vo.OrganizationPrefrencesVo;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.CustomersRepository;
import com.yorosis.yoroflow.creation.service.CustomerService;
import com.yorosis.yoroflow.creation.service.OrganizationPrefrencesService;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@RestController
@RequestMapping("/org-prefrences/v1")
public class OrganizationPrefrencesController {

	@Autowired
	private OrganizationPrefrencesService organizationPrefrencesService;

	@Autowired
	private CustomersRepository customersRepository;

	@Autowired
	private CustomerService customerService;

	@GetMapping("/get/{subdomain}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public OrganizationPrefrencesVo getCustomAttributes(@PathVariable(name = "subdomain") String subdomain) {
		OrganizationPrefrencesVo organizationPrefrencesVo = null;
		Customers customer = customersRepository.findBySubdomainNameIgnoreCaseAndActiveFlagIgnoreCase(subdomain,
				YoroappsConstants.YES);
		if (customer != null) {
			String currentTenantId = YorosisContext.get().getTenantId();
			try {
				YorosisContext.get().setTenantId(customer.getTenantId());
				organizationPrefrencesVo = organizationPrefrencesService.getOrganizationPrefrences();
			} finally {
				YorosisContext.get().setTenantId(currentTenantId);
			}
		}
		return organizationPrefrencesVo;
	}

	@GetMapping("/get/org/{subdomainName}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public OrganizationPrefrencesVo getCustomAttributesForOrg(
			@PathVariable(name = "subdomainName") String subdomainName) {
		return organizationPrefrencesService.getOrganizationPrefrencesForOrg();
	}

	@GetMapping("/get/org/page-size")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public OrganizationPrefrencesVo getDefaultPageSize() {
		return organizationPrefrencesService.getOrganizationPrefrencesForOrg();
	}

	@PostMapping("/update")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ResponseStringVO updateOrganizationPreferences(
			@RequestBody OrganizationPrefrencesVo organizationPrefrencesVo) {
		Customers customer = getCustomer(organizationPrefrencesVo.getSubdomainName());
		if (StringUtils.equalsIgnoreCase(customer.getTenantId(), YoroappsConstants.DEFAULT_SCHEMA)) {
			return organizationPrefrencesService.updateOrganizationPreferences(organizationPrefrencesVo);
		} else {
			YorosisContext currentContext = YorosisContext.get();
			try {
				YorosisContext.clear();
				YorosisContext context = YorosisContext.builder().tenantId(customer.getTenantId())
						.userName(currentContext.getUserName()).build();
				YorosisContext.set(context);
				return organizationPrefrencesService.saveOrganizationPrefrences(organizationPrefrencesVo);
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