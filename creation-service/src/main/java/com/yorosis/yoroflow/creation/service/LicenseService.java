package com.yorosis.yoroflow.creation.service;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroapps.entities.Customers;
import com.yorosis.yoroapps.entities.LicenseValidation;
import com.yorosis.yoroapps.entities.OrgSubscription;
import com.yorosis.yoroapps.vo.LicenseVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.CustomersRepository;
import com.yorosis.yoroflow.creation.repository.LicenseValidationRepository;
import com.yorosis.yoroflow.creation.repository.OrgSubscriptionRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class LicenseService {

	@Autowired
	private CustomersRepository customersRepository;

	@Autowired
	private OrgSubscriptionRepository orgSubscriptionRepository;

	@Autowired
	private LicenseValidationRepository licenseValidationRepository;

	@Autowired
	private CustomerPaymentService customerPaymentService;

	public LicenseVO getLicenseValidation(LicenseVO licenseVO) {
		Customers customers = customersRepository.findBySubdomainNameIgnoreCaseAndActiveFlagIgnoreCase(
				licenseVO.getSubDomainName(), YoroappsConstants.YES);
		List<OrgSubscription> orgSubscriptionList = orgSubscriptionRepository.getOrgSubscriptionBasedOnCustomerId(
				customers.getId(), YorosisContext.get().getTenantId(), YoroappsConstants.YES);

		List<OrgSubscription> list = orgSubscriptionList.stream()
				.filter(t -> StringUtils.equals(t.getActivePlan(), YoroappsConstants.YES)).collect(Collectors.toList());

		if (!list.isEmpty()) {
			OrgSubscription orgSubscriptionBasedOnCustomerId = list.get(0);
			if (orgSubscriptionBasedOnCustomerId != null) {
				LicenseValidation licenseValidation = licenseValidationRepository
						.findByPlanNameAndCategoryAndFeatureNameAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(
								orgSubscriptionBasedOnCustomerId.getPlanType().getPlanName(), licenseVO.getCategory(),
								licenseVO.getFeatureName(), YoroappsConstants.YES, YorosisContext.get().getTenantId());
				return LicenseVO.builder().featureName(licenseValidation.getFeatureName())
						.planName(licenseValidation.getPlanName()).isAllowed(licenseValidation.getIsAllowed())
						.allowedLimit(licenseValidation.getAllowedLimit()).build();
			}
		}
		return licenseVO;
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public LicenseVO isAllowed(String currentTenantId, String category, String featureName) {
		Customers customers = customersRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(currentTenantId,
				YoroappsConstants.YES);
		List<OrgSubscription> orgSubscriptionList = orgSubscriptionRepository.getOrgSubscriptionBasedOnCustomerId(
				customers.getId(), YorosisContext.get().getTenantId(), YoroappsConstants.YES);

		List<OrgSubscription> list = orgSubscriptionList.stream()
				.filter(t -> StringUtils.equals(t.getActivePlan(), YoroappsConstants.YES)).collect(Collectors.toList());
		if (!list.isEmpty()) {
			OrgSubscription orgSubscriptionBasedOnCustomerId = list.get(0);

			LicenseValidation licenseValidation = licenseValidationRepository
					.findByPlanNameAndCategoryAndFeatureNameAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(
							orgSubscriptionBasedOnCustomerId.getPlanType().getPlanName(), category, featureName,
							YoroappsConstants.YES, YorosisContext.get().getTenantId());

			return LicenseVO.builder().featureName(licenseValidation.getFeatureName())
					.planName(licenseValidation.getPlanName()).isAllowed(licenseValidation.getIsAllowed())
					.allowedLimit(licenseValidation.getAllowedLimit()).build();
		}
		return LicenseVO.builder().build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public Long getTotalQuantity(String currentTenantId) throws IOException {
		Long totalQuantity = null;
		Customers orgCustomers = customerPaymentService.getCustomerInfoByTenantId(currentTenantId);

		totalQuantity = Long.valueOf(orgCustomers.getMaximunUsers());

		return totalQuantity != null ? totalQuantity : 0L;
	}

}
