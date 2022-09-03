package com.yorosis.yoroflow.rendering.service;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroapps.entities.Customers;
import com.yorosis.yoroapps.grid.vo.SubDomainVO;
import com.yorosis.yoroflow.rendering.constants.YoroappsConstants;
import com.yorosis.yoroflow.rendering.exception.YoroappsException;
import com.yorosis.yoroflow.rendering.repository.CustomersRepository;

@Service
public class DomainService {
	@Autowired
	private CustomersRepository customersRepository;

	public String getDomain(String emailId) {
		if (StringUtils.isNotBlank(emailId)) {
			emailId = emailId.trim();
			return StringUtils.substring(emailId, emailId.indexOf('@') + 1).trim().toLowerCase();
		}

		throw new IllegalArgumentException("Email id is null or empty");
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public String getAssignedTenantId(String emailId) throws YoroappsException {
		String domain = getDomain(emailId);
		Customers customer = customersRepository.findByActualDomainNameIgnoreCaseAndActiveFlagIgnoreCase(domain,
				YoroappsConstants.YES);

		if (customer == null) {
			customer = customersRepository.findByAllowedDomainNamesContainingIgnoreCaseAndActiveFlagIgnoreCase(domain,
					YoroappsConstants.YES);
		}

		// Not a paying customer, trial ended
		if (StringUtils.equalsIgnoreCase(customer.getIsPayingCustomer(), YoroappsConstants.NO)
				&& customer.getTrialEndDate().getTime() < System.currentTimeMillis()) {
			throw new YoroappsException("Trial ended. Please subscribe to continue the service");
		}

		return customer.getTenantId();
	}

	@Transactional
	public SubDomainVO getSubDomain(String tenantId) {
		Customers customer = customersRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(tenantId,
				YoroappsConstants.YES);
		return SubDomainVO.builder().subDomainName(customer.getSubdomainName()).build();
	}
}
