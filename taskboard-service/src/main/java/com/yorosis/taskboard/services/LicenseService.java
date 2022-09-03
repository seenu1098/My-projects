package com.yorosis.taskboard.services;

import java.util.List;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.taskboard.repository.CustomersRepository;
import com.yorosis.taskboard.repository.LicenseValidationRepository;
import com.yorosis.taskboard.repository.OrgSubscriptionRepository;
import com.yorosis.taskboard.taskboard.entities.Customers;
import com.yorosis.taskboard.taskboard.entities.LicenseValidation;
import com.yorosis.taskboard.taskboard.entities.OrgSubscription;
import com.yorosis.yoroapps.vo.LicenseVO;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class LicenseService {

	@Autowired
	private CustomersRepository customersRepository;

	@Autowired
	private OrgSubscriptionRepository orgSubscriptionRepository;

	@Autowired
	private LicenseValidationRepository licenseValidationRepository;

	public LicenseVO getLicenseValidation(LicenseVO licenseVO) {
		Customers customers = customersRepository.findBySubdomainNameIgnoreCaseAndActiveFlagIgnoreCase(licenseVO.getSubDomainName(), YorosisConstants.YES);

		List<OrgSubscription> orgSubscriptionList = orgSubscriptionRepository.getOrgSubscriptionBasedOnCustomerId(customers.getId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);

		List<OrgSubscription> list = orgSubscriptionList.stream().filter(t -> StringUtils.equals(t.getActivePlan(), YorosisConstants.YES))
				.collect(Collectors.toList());
		if (!list.isEmpty()) {
			OrgSubscription orgSubscriptionBasedOnCustomerId = list.get(0);

			LicenseValidation licenseValidation = licenseValidationRepository
					.findByPlanNameAndCategoryAndFeatureNameAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(
							orgSubscriptionBasedOnCustomerId.getPlanType().getPlanName(), licenseVO.getCategory(), licenseVO.getFeatureName(),
							YorosisConstants.YES, YorosisContext.get().getTenantId());
			return LicenseVO.builder().featureName(licenseValidation.getFeatureName()).planName(licenseValidation.getPlanName())
					.isAllowed(licenseValidation.getIsAllowed()).allowedLimit(licenseValidation.getAllowedLimit()).build();
		}
		return licenseVO;
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public LicenseVO isAllowed(String currentTenantId, String category, String featureName) {
		Customers customers = customersRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(currentTenantId, YorosisConstants.YES);
		List<OrgSubscription> orgSubscriptionList = orgSubscriptionRepository.getOrgSubscriptionBasedOnCustomerId(customers.getId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);

		List<OrgSubscription> list = orgSubscriptionList.stream().filter(t -> StringUtils.equals(t.getActivePlan(), YorosisConstants.YES))
				.collect(Collectors.toList());
		if (!list.isEmpty()) {

			OrgSubscription orgSubscriptionBasedOnCustomerId = list.get(0);
			LicenseValidation licenseValidation = licenseValidationRepository
					.findByPlanNameAndCategoryAndFeatureNameAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(
							orgSubscriptionBasedOnCustomerId.getPlanType().getPlanName(), category, featureName, YorosisConstants.YES,
							YorosisContext.get().getTenantId());

			return LicenseVO.builder().featureName(licenseValidation.getFeatureName()).planName(licenseValidation.getPlanName())
					.isAllowed(licenseValidation.getIsAllowed()).allowedLimit(licenseValidation.getAllowedLimit()).category(licenseValidation.getCategory())
					.build();
		}
		return LicenseVO.builder().build();
	}

}
