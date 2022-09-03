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
import com.yorosis.yoroapps.vo.CustomMenu;
import com.yorosis.yoroapps.vo.CustomMenuVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.CustomersRepository;
import com.yorosis.yoroflow.creation.repository.OrganizationRepository;
import com.yorosis.yoroflow.creation.service.CustomerService;
import com.yorosis.yoroflow.creation.service.OrganizationMenuPreferencesService;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@RestController
@RequestMapping("/org-custom-menu/v1")
public class OrganizationMenuPreferncesController {
	@Autowired
	private CustomersRepository customersRepository;

	@Autowired
	private OrganizationMenuPreferencesService organizationMenuPreferencesService;

	@Autowired
	private OrganizationRepository organizationRepository;

	@Autowired
	private CustomerService customerService;

	@GetMapping("/get/{subdomain}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public List<CustomMenuVO> getCustomMenu(@PathVariable(name = "subdomain") String subdomain) {
		List<CustomMenuVO> list = new ArrayList<>();
		Customers customer = customersRepository.findBySubdomainNameIgnoreCaseAndActiveFlagIgnoreCase(subdomain,
				YoroappsConstants.YES);
		if (customer != null) {
			String currentTenantId = YorosisContext.get().getTenantId();
			try {
				YorosisContext.get().setTenantId(customer.getTenantId());
				list = organizationMenuPreferencesService.getCustomMenuList();
			} finally {
				YorosisContext.get().setTenantId(currentTenantId);
			}
		}
		return list;
	}

	@GetMapping("/get/org/{subdomainName}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public List<CustomMenuVO> getCustomMenuForOrg(@PathVariable(name = "subdomainName") String subdomainName) {
		List<CustomMenuVO> list = new ArrayList<>();
		Organization organization = organizationRepository
				.findBySubdomainNameIgnoreCaseAndActiveFlagIgnoreCase(subdomainName, YoroappsConstants.YES);
		if (organization != null) {
			list = organizationMenuPreferencesService.getCustomMenuList();
		}
		return list;
	}

	@PostMapping("/update")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ResponseStringVO updateOrganizationMenuPreferences(@RequestBody CustomMenu customMenuVo) {
		Customers customer = getCustomer(customMenuVo.getSubdomainName());
		if (StringUtils.equalsIgnoreCase(customer.getTenantId(), YoroappsConstants.DEFAULT_SCHEMA)) {
			return organizationMenuPreferencesService.updateOrganizationMenuPreferences(customMenuVo);
		} else {
			YorosisContext currentContext = YorosisContext.get();
			try {
				YorosisContext.clear();
				YorosisContext context = YorosisContext.builder().tenantId(customer.getTenantId())
						.userName(currentContext.getUserName()).build();
				YorosisContext.set(context);
				return organizationMenuPreferencesService.saveCustomMenu(customMenuVo);
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
