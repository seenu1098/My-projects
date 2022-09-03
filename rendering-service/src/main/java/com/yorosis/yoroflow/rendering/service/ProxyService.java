package com.yorosis.yoroflow.rendering.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yorosis.yoroapps.entities.Customers;
import com.yorosis.yoroapps.vo.LicenseVO;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.rendering.constants.YoroappsConstants;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class ProxyService {

	@Autowired
	private CustomerService customerService;

	@Autowired
	private LicenseService licenseService;

	public Customers getCustomer(String subdomainName) {
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

	public LicenseVO isAllowed(String currentTenantId, String category, String featureName) {
		YorosisContext context = setYoroflowContext();
		try {
			return licenseService.isAllowed(currentTenantId, category, featureName);
		} finally {
			clearYoroflowContext(context);
		}
	}

	private YorosisContext setYoroflowContext() {
		YorosisContext context = YorosisContext.get();
		YorosisContext.set(YorosisContext.builder().tenantId(YorosisConstants.DEFAULT_SCHEMA).build());
		return context;
	}

	private void clearYoroflowContext(YorosisContext oldContext) {
		YorosisContext.clear();
		YorosisContext.set(oldContext);
	}

}
