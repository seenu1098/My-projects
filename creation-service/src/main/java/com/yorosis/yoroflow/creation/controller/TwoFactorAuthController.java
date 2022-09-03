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
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.TwoFactorAuthVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.CustomersRepository;
import com.yorosis.yoroflow.creation.service.ProxyService;
import com.yorosis.yoroflow.creation.service.TwoFactorAuthMethodService;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@RestController
@RequestMapping("/two-factor/v1")
public class TwoFactorAuthController {
	@Autowired
	private TwoFactorAuthMethodService twoFactorAuthMethodService;

	@Autowired
	private CustomersRepository customersRepository;

	@Autowired
	private ProxyService proxyService;

	@GetMapping("/get/{subdomain}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public TwoFactorAuthVO getTwofactor(@PathVariable(name = "subdomain") String subdomain) {
		Customers customer = customersRepository.findBySubdomainNameIgnoreCaseAndActiveFlagIgnoreCase(subdomain,
				YoroappsConstants.YES);
		if (customer != null) {
			String currentTenantId = YorosisContext.get().getTenantId();
			try {
				YorosisContext.get().setTenantId(customer.getTenantId());
				return twoFactorAuthMethodService.getTwoFactorList();
			} finally {
				YorosisContext.get().setTenantId(currentTenantId);
			}
		}
		return TwoFactorAuthVO.builder().build();
	}

	@GetMapping("/get/org/{subdomainName}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public TwoFactorAuthVO getTwofactorForOrg(@PathVariable(name = "subdomainName") String subdomainName) {
		return twoFactorAuthMethodService.getTwoFactorListFromSameDomain();
	}

	@PostMapping("/update")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ResponseStringVO updateTwofactor(@RequestBody TwoFactorAuthVO twoFactorAuthVO) {
		Customers customer = proxyService.getCustomer(twoFactorAuthVO.getSubdomainName());
		if (StringUtils.equalsIgnoreCase(customer.getTenantId(), YoroappsConstants.DEFAULT_SCHEMA)) {
			return twoFactorAuthMethodService.updateTwofactor(twoFactorAuthVO);
		} else {
			YorosisContext currentContext = YorosisContext.get();
			try {
				YorosisContext.clear();
				YorosisContext context = YorosisContext.builder().tenantId(customer.getTenantId())
						.userName(currentContext.getUserName()).build();
				YorosisContext.set(context);
				return twoFactorAuthMethodService.addTwoFactorAuth(twoFactorAuthVO);
			} finally {
				YorosisContext.clear();
				YorosisContext.set(currentContext);
			}

		}
	}

}
