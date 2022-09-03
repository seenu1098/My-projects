package com.yorosis.yoroflow.creation.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroapps.entities.Customers;
import com.yorosis.yoroapps.entities.PaymentSubscriptionDetails;
import com.yorosis.yoroapps.vo.OrganizationDiscountVo;
import com.yorosis.yoroapps.vo.PlanDetailsListVo;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.CustomersRepository;
import com.yorosis.yoroflow.creation.repository.PaymentSubscriptionDetailsRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class PaymentSubscriptionDetailsService {

	@Autowired
	private PaymentSubscriptionDetailsRepository paymentSubscriptionDetailsRepository;

	@Autowired
	private CustomersRepository customersRepository;

	private PlanDetailsListVo constructPlanDetailsVo(PaymentSubscriptionDetails planDetails) {
		return PlanDetailsListVo.builder().planId(planDetails.getId()).planName(planDetails.getPlanName()).build();
	}

	@Transactional
	public List<PlanDetailsListVo> getPaymentSubscriptionDetails(String currentTenantId) {
		Customers customers = customersRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(currentTenantId,
				YoroappsConstants.YES);
		List<PlanDetailsListVo> paymentSubscriptionDetailsVo = new ArrayList<>();
		List<PaymentSubscriptionDetails> planDetailsList = paymentSubscriptionDetailsRepository
				.getPaymentSubscriptionDetails(customers.getId(), YorosisContext.get().getTenantId(),
						YoroappsConstants.YES);
		for (PaymentSubscriptionDetails planDetails : planDetailsList) {
			paymentSubscriptionDetailsVo.add(constructPlanDetailsVo(planDetails));
		}
		return paymentSubscriptionDetailsVo;
	}

	private OrganizationDiscountVo constructOrganizationDiscountVo(PaymentSubscriptionDetails planDetails) {
		return OrganizationDiscountVo.builder().amountPerUserMonthly(planDetails.getMonthlyPrice())
				.amountPerUserYearly(planDetails.getYearlyPrice()).basePrice(planDetails.getBasePrice())
				.planName(planDetails.getPlanName()).build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public List<OrganizationDiscountVo> getOrganizationDiscountVo(String currentTenantId) {
		Customers customers = customersRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(currentTenantId,
				YoroappsConstants.YES);
		List<OrganizationDiscountVo> organizationDiscountVoList = new ArrayList<>();
		List<PaymentSubscriptionDetails> planDetailsList = paymentSubscriptionDetailsRepository
				.getPaymentSubscriptionDetails(customers.getId(), YorosisContext.get().getTenantId(),
						YoroappsConstants.YES);
		if (planDetailsList != null && !planDetailsList.isEmpty()) {
			organizationDiscountVoList = planDetailsList.stream()
					.filter(p -> !StringUtils.equals(p.getPlanName(), "STARTER"))
					.map(this::constructOrganizationDiscountVo).collect(Collectors.toList());
		}
		return organizationDiscountVoList;
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public List<PlanDetailsListVo> getPaymentSubscriptionDetailsFromAnotherCustomer(String currentTenantId) {
		Customers customers = customersRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(currentTenantId,
				YoroappsConstants.YES);
		List<PlanDetailsListVo> paymentSubscriptionDetailsVo = new ArrayList<>();
		List<PaymentSubscriptionDetails> planDetailsList = paymentSubscriptionDetailsRepository
				.getPaymentSubscriptionDetails(customers.getId(), YorosisContext.get().getTenantId(),
						YoroappsConstants.YES);
		for (PaymentSubscriptionDetails planDetails : planDetailsList) {
			PlanDetailsListVo planDetailsVo = constructPlanDetailsVo(planDetails);
			Float monthlyPrice = planDetails.getMonthlyPrice();
			Float yearlyPrice = planDetails.getYearlyPrice();
			planDetailsVo.setMonthlyPrice(monthlyPrice);
			planDetailsVo.setYearlyPrice(yearlyPrice);
			planDetailsVo.setBasePrice(planDetails.getBasePrice());
			paymentSubscriptionDetailsVo.add(planDetailsVo);
		}
		return paymentSubscriptionDetailsVo;
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public List<PlanDetailsListVo> getPaymentSubscriptionDetailsForPayment(String currentTenantId) {

		Customers customers = customersRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(currentTenantId,
				YoroappsConstants.YES);
		log.info("currentTenantId:{}", currentTenantId);
		log.info(" YorosisContext.get().getTenantId():{}", YorosisContext.get().getTenantId());
		List<PlanDetailsListVo> paymentSubscriptionDetailsVo = new ArrayList<>();
		List<PaymentSubscriptionDetails> planDetailsList = paymentSubscriptionDetailsRepository
				.getPaymentSubscriptionDetails(customers.getId(), YorosisContext.get().getTenantId(),
						YoroappsConstants.YES);
		for (PaymentSubscriptionDetails planDetails : planDetailsList) {
			PlanDetailsListVo planDetailsVo = constructPlanDetailsVo(planDetails);
			Float monthlyPrice = planDetails.getBasePrice()
					+ (planDetails.getMonthlyPrice() * customers.getMaximunUsers());
			Float yearlyPrice = (planDetails.getBasePrice() * 12)
					+ (12 * planDetails.getYearlyPrice() * customers.getMaximunUsers());
			planDetailsVo.setMonthlyPrice(monthlyPrice);
			planDetailsVo.setYearlyPrice(yearlyPrice);
			planDetailsVo.setBasePrice(planDetails.getBasePrice());
			paymentSubscriptionDetailsVo.add(planDetailsVo);
		}
		return paymentSubscriptionDetailsVo;
	}
}
