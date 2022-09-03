package com.yorosis.yoroflow.creation.controller;

import java.io.IOException;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroapps.entities.Customers;
import com.yorosis.yoroapps.entities.Organization;
import com.yorosis.yoroapps.vo.AllowAuthentication;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.CustomersRepository;
import com.yorosis.yoroflow.creation.repository.OrganizationRepository;
import com.yorosis.yoroflow.creation.service.AuthMethodService;
import com.yorosis.yoroflow.creation.service.CustomerService;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@RestController
@RequestMapping("/auth-method/v1")
public class AuthMethodController {
	@Autowired
	private CustomersRepository customersRepository;

	@Autowired
	private AuthMethodService authMethodService;

	@Autowired
	private OrganizationRepository organizationRepository;

	@Autowired
	private CustomerService customerService;

	@PostMapping("/update")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User Administrator'})")
	public ResponseStringVO updateAttributes(@RequestBody AllowAuthentication allowAuthentication) {
		Customers customer = getCustomer(allowAuthentication.getSubdomainName());
		if (StringUtils.equalsIgnoreCase(customer.getTenantId(), YoroappsConstants.DEFAULT_SCHEMA)) {
			return authMethodService.saveAuthMethodsFromDefaultSchema(allowAuthentication);
		} else {
			YorosisContext currentContext = YorosisContext.get();
			try {
				YorosisContext.clear();
				YorosisContext context = YorosisContext.builder().tenantId(customer.getTenantId())
						.userName(currentContext.getUserName()).build();
				YorosisContext.set(context);
				return authMethodService.saveAuthMethods(allowAuthentication);
			} finally {
				YorosisContext.clear();
				YorosisContext.set(currentContext);
			}

		}
	}

	@GetMapping("/get/{subdomain}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User Administrator'})")
	public AllowAuthentication getCustomAttributes(@PathVariable(name = "subdomain") String subdomain) {
		Customers customer = customersRepository.findBySubdomainNameIgnoreCaseAndActiveFlagIgnoreCase(subdomain,
				YoroappsConstants.YES);
		if (customer != null) {
			String currentTenantId = YorosisContext.get().getTenantId();
			try {
				YorosisContext.get().setTenantId(customer.getTenantId());
				return authMethodService.getAuthMethod(subdomain);
			} finally {
				YorosisContext.get().setTenantId(currentTenantId);
			}
		}
		return null;
	}

	@GetMapping("/get/org/{subdomain}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User Administrator'})")
	public AllowAuthentication getCustomAttributesForOrg(@PathVariable(name = "subdomain") String subdomain) {
		Organization organization = organizationRepository
				.findBySubdomainNameIgnoreCaseAndActiveFlagIgnoreCase(subdomain, YoroappsConstants.YES);
		if (organization != null) {
			return authMethodService.getAuthMethodForOrg(subdomain);
		}
		return null;
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

	@GetMapping("/license/is-allowed")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO isAllowed() {
		return authMethodService.isAllowed();
	}
}
