package com.yorosis.authnz.service;

import java.sql.Date;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.authnz.constants.YorosisConstants;
import com.yorosis.authnz.exception.YorosisException;
import com.yorosis.authnz.repository.CustomersRepository;
import com.yorosis.yoroapps.entities.Customers;
import com.yorosis.yoroapps.vo.UsersVO;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class DomainService {
	@Autowired
	private CustomersRepository customersRepository;

	@Autowired
	private UserService userService;

	public String getDomain(String emailId) {
		if (StringUtils.isNotBlank(emailId)) {
			emailId = emailId.trim();
			return StringUtils.substring(emailId, emailId.indexOf('@') + 1).trim().toLowerCase();
		}

		throw new IllegalArgumentException("Email id is null or empty");
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public Customers getCustomer(String domain) throws YorosisException {
		log.warn("############" + domain);
//		String domain=getDomain(username);

//		Customers customer = customersRepository.findByActualDomainNameIgnoreCaseAndActiveFlagIgnoreCase(domain, YorosisConstants.YES);

		domain = StringUtils.trim(domain);
		Customers customer = customersRepository.findBySubdomainNameIgnoreCaseAndActiveFlagIgnoreCase(domain,
				YorosisConstants.YES);
		if (customer == null) {
			customer = customersRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(domain,
					YorosisConstants.YES);
//			customer = customersRepository.findByAllowedDomainNamesContainingIgnoreCaseAndActiveFlagIgnoreCase(domain,
//					YorosisConstants.YES);
		}
		return customer;
	}

	public boolean isSubscriptionExpired(Customers customer) throws YorosisException {
		if (customer != null) {
			// Not a paying customer, trial ended
			if (StringUtils.equalsIgnoreCase(customer.getIsPayingCustomer(), YorosisConstants.NO)
					&& customer.getTrialEndDate() != null
					&& customer.getTrialEndDate().getTime() < System.currentTimeMillis()) {
				return true;
				// paying customer, subscription ended
			} else if (StringUtils.equalsIgnoreCase(customer.getIsPayingCustomer(), YorosisConstants.YES)) {
				Date endDate = customer.getSubscriptionEndDate();
				if (endDate != null) {
					LocalDate localEndDate = endDate.toLocalDate();
					LocalDate todayDate = LocalDate.now();
					LocalDate plusDays = localEndDate.plusDays(15);
					if (BooleanUtils.isFalse(todayDate.isBefore(plusDays))) {
						return true;
					}
				}
			}
			return false;
		}
		return true;
	}

	public Long getRemainingDays(Customers customer) {
		Date endDate = customer.getSubscriptionEndDate();
		if (endDate != null) {
			LocalDate localEndDate = endDate.toLocalDate();
			LocalDate todayDate = LocalDate.now();
			LocalDate plusDays = localEndDate.plusDays(15);
			return ChronoUnit.DAYS.between(todayDate, plusDays);
		}
		return null;
	}

	public boolean isAdminOrBillingRole() {
		UsersVO loggedInUserDetails = userService.getLoggedInUserDetails();
		if (loggedInUserDetails != null && !loggedInUserDetails.getUserRoleList().isEmpty()) {
			return loggedInUserDetails.getUserRoleList().stream().anyMatch(
					t -> StringUtils.equalsAny(t.getRolesNames(), "Account Administrator", "Billing Administrator"));
		}
		return false;
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public Customers getAssignedTenantId(String header) throws YorosisException {
		String[] arrOfStr = null;
		String[] url = null;
		if (header.contains("//")) {
			arrOfStr = header.split("//", 2);
			url = arrOfStr[1].split("[.]", 2);
		} else {
			url = header.split("[.]", 2);
		}
		String domain = url[0].toString();
		Customers customer = getCustomer(domain);

		return customer;
	}

	@Transactional
	public String getDefaultAdminUser(String tenantId) {
		return customersRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(tenantId, YorosisConstants.YES)
				.getCreatedBy().trim().toLowerCase();
	}
}
