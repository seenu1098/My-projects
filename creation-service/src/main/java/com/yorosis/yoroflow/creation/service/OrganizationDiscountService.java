package com.yorosis.yoroflow.creation.service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroapps.entities.Customers;
import com.yorosis.yoroapps.entities.OrganizationDiscount;
import com.yorosis.yoroapps.entities.PaymentSubscriptionDetails;
import com.yorosis.yoroapps.vo.OrgSubscriptionVo;
import com.yorosis.yoroapps.vo.OrganizationDiscountVo;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.OrganizationDiscountRepository;
import com.yorosis.yoroflow.creation.repository.PaymentSubscriptionDetailsRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class OrganizationDiscountService {

	@Autowired
	private OrganizationDiscountRepository organizationDiscountRepository;

	@Autowired
	private PaymentSubscriptionDetailsRepository paymentSubscriptionDetailsRepository;

	private OrganizationDiscount construcVOtoDTO(OrganizationDiscountVo organizationDiscountVo, Customers customer) {
		if (organizationDiscountVo.getPlanId() != null) {
			Timestamp timestamp = new Timestamp(System.currentTimeMillis());
			PaymentSubscriptionDetails paymentSubscriptionDetails = paymentSubscriptionDetailsRepository
					.getbyIdAndPaymentSubscriptionDetails(organizationDiscountVo.getPlanId(),
							YorosisContext.get().getTenantId(), YoroappsConstants.YES);
			if (paymentSubscriptionDetails != null) {
				return OrganizationDiscount.builder().planId(paymentSubscriptionDetails)
						.yearlyDiscount(organizationDiscountVo.getYearlyDiscount())
						.monthlyDiscount(organizationDiscountVo.getMonthlyDiscount()).customer(customer)
						.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp)
						.createdBy(YorosisContext.get().getUserName()).createdOn(timestamp)
						.tenantId(YorosisContext.get().getTenantId()).activeFlag(YoroappsConstants.YES).build();
			}
		}
		return null;
	}

	private OrganizationDiscountVo construcDtotoVO(OrganizationDiscount organizationDiscount) {
		return OrganizationDiscountVo.builder().planId(organizationDiscount.getPlanId().getId())
				.yearlyDiscount(organizationDiscount.getYearlyDiscount())
				.planName(organizationDiscount.getPlanId().getPlanName())
				.monthlyDiscount(organizationDiscount.getMonthlyDiscount())
				.customerId(organizationDiscount.getCustomer().getId()).discountId(organizationDiscount.getId())
				.build();
	}

	@Transactional
	public ResponseStringVO saveDiscount(List<OrganizationDiscountVo> organizationDiscountVo, Customers customer) {
		List<PaymentSubscriptionDetails> planDetailsList = paymentSubscriptionDetailsRepository
				.getPaymentSubscriptionDetails(customer.getId(), YorosisContext.get().getTenantId(),
						YoroappsConstants.YES);

		if (planDetailsList != null && !planDetailsList.isEmpty()) {
			for (PaymentSubscriptionDetails details : planDetailsList) {
				List<OrganizationDiscountVo> list = organizationDiscountVo.stream()
						.filter(t -> StringUtils.equalsIgnoreCase(t.getPlanName(), details.getPlanName()))
						.collect(Collectors.toList());
				if (!list.isEmpty()) {
					OrganizationDiscountVo vo = list.get(0);
					details.setBasePrice(vo.getBasePrice());
					details.setMonthlyPrice(vo.getAmountPerUserMonthly());
					details.setYearlyPrice(vo.getAmountPerUserYearly());
					paymentSubscriptionDetailsRepository.save(details);
				}
			}
			return ResponseStringVO.builder().response("plan details saved successfully").build();
		} else {
			Timestamp timestamp = new Timestamp(System.currentTimeMillis());
			List<PaymentSubscriptionDetails> subscriptionDetailsList = new ArrayList<>();
			PaymentSubscriptionDetails starterDetails = PaymentSubscriptionDetails.builder().yearlyPrice(0.00F)
					.monthlyPrice(0.00F).planName("STARTER").customerId(customer.getId()).basePrice(0.00F)
					.tenantId(YorosisContext.get().getTenantId()).createdBy(YorosisContext.get().getUserName())
					.createdDate(timestamp).activeFlag(YoroappsConstants.YES).build();
			subscriptionDetailsList.add(starterDetails);

			for (OrganizationDiscountVo vo : organizationDiscountVo) {
				PaymentSubscriptionDetails paymentDetails = PaymentSubscriptionDetails.builder()
						.basePrice(vo.getBasePrice()).yearlyPrice(vo.getAmountPerUserYearly())
						.monthlyPrice(vo.getAmountPerUserMonthly()).planName(vo.getPlanName())
						.customerId(customer.getId()).tenantId(YorosisContext.get().getTenantId())
						.createdBy(YorosisContext.get().getUserName()).createdDate(timestamp)
						.activeFlag(YoroappsConstants.YES).build();
				subscriptionDetailsList.add(paymentDetails);
			}

			paymentSubscriptionDetailsRepository.saveAll(subscriptionDetailsList);
			return ResponseStringVO.builder().response("plan details saved successfully").build();
		}
	}

	@Transactional
	public List<OrganizationDiscountVo> getOrganizationDiscount(UUID customerId) {
		List<OrganizationDiscountVo> organizationDiscountVoList = new ArrayList<OrganizationDiscountVo>();
		List<OrganizationDiscount> organizationDiscountList = organizationDiscountRepository
				.getListBasedonCustomerIdAndTenantIdAndActiveFlag(customerId, YorosisContext.get().getTenantId(),
						YoroappsConstants.YES);
		if (organizationDiscountList != null && !organizationDiscountList.isEmpty()) {
			organizationDiscountVoList = organizationDiscountList.stream().map(this::construcDtotoVO)
					.collect(Collectors.toList());
		}
		return organizationDiscountVoList;
	}

	@Transactional
	public OrgSubscriptionVo getOrganizationDiscountAmount(OrgSubscriptionVo orgSubscriptionVo) {
		OrganizationDiscount organizationDiscount = organizationDiscountRepository
				.getBasedonIdAndTypeAndTenantIdAndActiveFlag(YorosisContext.get().getTenantId(),
						YorosisContext.get().getTenantId(), orgSubscriptionVo.getPlanId(), YoroappsConstants.YES);
		return loadDiscountAmount(orgSubscriptionVo, organizationDiscount);
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public OrgSubscriptionVo getOrganizationDiscountAmountFromCustomer(String currentTenantId,
			OrgSubscriptionVo orgSubscriptionVo) {
		OrganizationDiscount organizationDiscount = organizationDiscountRepository
				.getBasedonIdAndTypeAndTenantIdAndActiveFlag(currentTenantId, YorosisContext.get().getTenantId(),
						orgSubscriptionVo.getPlanId(), YoroappsConstants.YES);
		return loadDiscountAmount(orgSubscriptionVo, organizationDiscount);
	}

	private OrgSubscriptionVo loadDiscountAmount(OrgSubscriptionVo orgSubscriptionVo,
			OrganizationDiscount organizationDiscount) {
		Float amount = orgSubscriptionVo.getSubscriptionAmount();
		if (organizationDiscount != null) {
			if (StringUtils.equals(orgSubscriptionVo.getBillingType(), "monthly")) {
				amount = amount - organizationDiscount.getMonthlyDiscount();
				orgSubscriptionVo.setSubscriptionDiscountAmount(organizationDiscount.getMonthlyDiscount());
			} else {
				amount = amount - organizationDiscount.getYearlyDiscount();
				orgSubscriptionVo.setSubscriptionDiscountAmount(organizationDiscount.getYearlyDiscount());
			}
		}
		orgSubscriptionVo.setSubscriptionTotalAmount(amount);
		return orgSubscriptionVo;
	}

}
