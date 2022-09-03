package com.yorosis.yoroflow.services;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroflow.entities.Customers;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.YoroFlowException;
import com.yorosis.yoroflow.repository.CustomersRepository;

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
	public String getAssignedTenantId(String emailId) throws YoroFlowException {
		String domain = getDomain(emailId);

		Customers customer = customersRepository.findByActualDomainNameIgnoreCaseAndActiveFlagIgnoreCase(domain, YorosisConstants.YES);
		if (customer == null) {
			customer = customersRepository.findByAllowedDomainNamesContainingIgnoreCaseAndActiveFlagIgnoreCase(domain, YorosisConstants.YES);
		}

		// Not a paying customer, trial ended
		if (StringUtils.equalsIgnoreCase(customer.getIsPayingCustomer(), YorosisConstants.NO)
				&& customer.getTrialEndDate().getTime() < System.currentTimeMillis()) {
			throw new YoroFlowException("Trial ended. Please subscribe to continue the service");
		}

		return customer.getTenantId();
	}
}
