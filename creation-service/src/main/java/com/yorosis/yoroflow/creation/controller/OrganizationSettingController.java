package com.yorosis.yoroflow.creation.controller;

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
import com.yorosis.yoroapps.vo.EmailSettingsVO;
import com.yorosis.yoroapps.vo.EmailSettingsVOList;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.CustomersRepository;
import com.yorosis.yoroflow.creation.service.OrganizationEmailSettingService;
import com.yorosis.yoroflow.creation.service.ProxyService;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@RestController
@RequestMapping("/email-setting/v1")
public class OrganizationSettingController {

	@Autowired
	private OrganizationEmailSettingService organizationEmailSettingService;

	@Autowired
	private CustomersRepository customersRepository;

	@Autowired
	private ProxyService proxyService;

	@PostMapping("/update")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ResponseStringVO updateTwofactor(@RequestBody EmailSettingsVOList emailSettingsVOList) {
		Customers customer = proxyService.getCustomer(emailSettingsVOList.getSubdomainName());
		if (StringUtils.equalsIgnoreCase(customer.getTenantId(), YoroappsConstants.DEFAULT_SCHEMA)) {
			return organizationEmailSettingService.saveOrgEmailSetting(emailSettingsVOList);
		} else {
			YorosisContext currentContext = YorosisContext.get();
			try {
				YorosisContext.clear();
				YorosisContext context = YorosisContext.builder().tenantId(customer.getTenantId())
						.userName(currentContext.getUserName()).build();
				YorosisContext.set(context);
				return organizationEmailSettingService.saveOrgEmailSetting(emailSettingsVOList);
			} finally {
				YorosisContext.clear();
				YorosisContext.set(currentContext);
			}

		}
	}

	@GetMapping("/get/{subdomainName}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public EmailSettingsVOList getEmailSettingsVOListForOrg(
			@PathVariable(name = "subdomainName") String subdomainName) {
		Customers customer = proxyService.getCustomer(subdomainName);
		if (StringUtils.equalsIgnoreCase(customer.getTenantId(), YoroappsConstants.DEFAULT_SCHEMA)) {
			return organizationEmailSettingService.getEmailSettings();
		} else {
			YorosisContext currentContext = YorosisContext.get();
			try {
				YorosisContext.clear();
				YorosisContext context = YorosisContext.builder().tenantId(customer.getTenantId())
						.userName(currentContext.getUserName()).build();
				YorosisContext.set(context);
				return organizationEmailSettingService.getEmailSettings();
			} finally {
				YorosisContext.clear();
				YorosisContext.set(currentContext);
			}

		}
	}

	@GetMapping("/get/email-setting")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public List<EmailSettingsVO> getEmailSettingsVOList() {
		return organizationEmailSettingService.getEmailSettingsList();
	}

}
