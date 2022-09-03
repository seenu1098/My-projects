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
import com.yorosis.yoroapps.vo.CustomAttributeListVO;
import com.yorosis.yoroapps.vo.CustomAttributeVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.CustomersRepository;
import com.yorosis.yoroflow.creation.repository.OrganizationRepository;
import com.yorosis.yoroflow.creation.service.CustomerService;
import com.yorosis.yoroflow.creation.service.OrgCustomattributeService;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@RestController
@RequestMapping("/org-custom-attributes/v1")
public class OrgCustomAttributesController {

	@Autowired
	private OrgCustomattributeService orgCustomattributeService;

	@Autowired
	private CustomersRepository customersRepository;

	@Autowired
	private OrganizationRepository organizationRepository;

	@Autowired
	private CustomerService customerService;

	@GetMapping("/get/{subdomain}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public List<CustomAttributeListVO> getCustomAttributes(@PathVariable(name = "subdomain") String subdomain) {
		List<CustomAttributeListVO> list = new ArrayList<>();
		Customers customer = customersRepository.findBySubdomainNameIgnoreCaseAndActiveFlagIgnoreCase(subdomain,
				YoroappsConstants.YES);
		if (customer != null) {
			String currentTenantId = YorosisContext.get().getTenantId();
			try {
				YorosisContext.get().setTenantId(customer.getTenantId());
				list = orgCustomattributeService.getCustomAttributes(subdomain);
			} finally {
				YorosisContext.get().setTenantId(currentTenantId);
			}
		}
		return list;
	}

	@GetMapping("/get/org/{subdomainName}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public List<CustomAttributeListVO> getCustomAttributesForOrg(
			@PathVariable(name = "subdomainName") String subdomainName) {
		List<CustomAttributeListVO> list = new ArrayList<>();
		Organization organization = organizationRepository
				.findBySubdomainNameIgnoreCaseAndActiveFlagIgnoreCase(subdomainName, YoroappsConstants.YES);
		if (organization != null) {
			list = orgCustomattributeService.getCustomAttributesForOrg(subdomainName);
		}
		return list;
	}

	@PostMapping("/update")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO updateAttributes(@RequestBody CustomAttributeVO customAttributes) {
		Customers customer = getCustomer(customAttributes.getSubdomainName());
		if (StringUtils.equalsIgnoreCase(customer.getTenantId(), YoroappsConstants.DEFAULT_SCHEMA)) {
			return orgCustomattributeService.updateAttributes(customAttributes);
		} else {
			YorosisContext currentContext = YorosisContext.get();
			try {
				YorosisContext.clear();
				YorosisContext context = YorosisContext.builder().tenantId(customer.getTenantId())
						.userName(currentContext.getUserName()).build();
				YorosisContext.set(context);
				return orgCustomattributeService.saveCustomAttribute(customAttributes);
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
