package com.yorosis.yoroflow.creation.service;

import java.io.IOException;
import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.exception.StripeException;
import com.yorosis.yoroapps.entities.CustomerPayment;
import com.yorosis.yoroapps.entities.Customers;
import com.yorosis.yoroapps.entities.OrgSubscription;
import com.yorosis.yoroapps.entities.PaymentSubscriptionDetails;
import com.yorosis.yoroapps.vo.CustomerPaymentVO;
import com.yorosis.yoroapps.vo.OrgSubscriptionVo;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.SubscriptionExpireVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.CustomerPaymentRepository;
import com.yorosis.yoroflow.creation.repository.CustomersRepository;
import com.yorosis.yoroflow.creation.repository.OrgSubscriptionRepository;
import com.yorosis.yoroflow.creation.repository.PaymentSubscriptionDetailsRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class OrgSubscriptionService {

	@Autowired
	private OrgSubscriptionRepository orgSubscriptionRepository;

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private PaymentSubscriptionDetailsRepository paymentSubscriptionDetailsRepository;

	@Autowired
	private CustomersRepository customersRepository;

	@Autowired
	private CustomerPaymentRepository customerPaymentRepository;

	@Autowired
	private CustomerPaymentService customerPaymentService;

	private OrgSubscription construcVOtoDTO(OrgSubscriptionVo orgSubscriptionVo) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return OrgSubscription.builder().customerId(orgSubscriptionVo.getCustomerId())
				.planType(getPlanId(orgSubscriptionVo.getPlanId())).updatedBy(YorosisContext.get().getUserName())
				.billingType(orgSubscriptionVo.getBillingType())
				.subscriptionAmount(orgSubscriptionVo.getSubscriptionAmount()).updatedDate(timestamp)
				.createdBy(YorosisContext.get().getUserName()).createdDate(timestamp)
				.tenantId(YorosisContext.get().getTenantId()).activeFlag(YoroappsConstants.YES).build();
	}

	private OrgSubscriptionVo construcDTOtoVO(OrgSubscription orgSubscription) {
		return OrgSubscriptionVo.builder().subscriptionId(orgSubscription.getId())
				.subscriptionAmount(orgSubscription.getSubscriptionAmount()).customerId(orgSubscription.getCustomerId())
				.planType(orgSubscription.getPlanType().getPlanName()).planId(orgSubscription.getPlanType().getId())
				.billingType(orgSubscription.getBillingType())
				.subscriptionStartDate(orgSubscription.getSubscriptionStartDate())
				.subscriptionEndDate(orgSubscription.getSubscriptionEndDate()).build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO saveorgSubscription(String orgSubscription) throws JsonProcessingException {
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		OrgSubscriptionVo orgSubscriptionVo = mapper.readValue(orgSubscription, OrgSubscriptionVo.class);
		if (orgSubscriptionVo.getCustomerId() != null) {
			if (orgSubscriptionVo.getSubscriptionId() == null) {
				orgSubscriptionRepository.save(construcVOtoDTO(orgSubscriptionVo));
				return ResponseStringVO.builder().response("Subscription Added Successfully").build();
			} else {
				OrgSubscription orgSubscriptionUpdate = orgSubscriptionRepository.getOrgSubscriptionBasedOnId(
						orgSubscriptionVo.getSubscriptionId(), YorosisContext.get().getTenantId(),
						YoroappsConstants.YES);
				Timestamp timestamp = new Timestamp(System.currentTimeMillis());
				orgSubscriptionUpdate.setBillingType(orgSubscriptionVo.getBillingType());
				orgSubscriptionUpdate.setPlanType(getPlanId(orgSubscriptionVo.getPlanId()));
				orgSubscriptionUpdate.setSubscriptionAmount(orgSubscriptionVo.getSubscriptionAmount());
				orgSubscriptionUpdate.setUpdatedBy(YorosisContext.get().getUserName());
				orgSubscriptionUpdate.setUpdatedDate(timestamp);
				return ResponseStringVO.builder().response("Subscription Updated Successfully").build();
			}
		} else {
			return ResponseStringVO.builder().response("No Customer Found").build();
		}
	}

	@Transactional
	public ResponseStringVO saveorgSubscriptionFromYoroflow(String orgSubscription) throws JsonProcessingException {
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		OrgSubscriptionVo orgSubscriptionVo = mapper.readValue(orgSubscription, OrgSubscriptionVo.class);
		if (orgSubscriptionVo.getCustomerId() != null) {
			if (orgSubscriptionVo.getSubscriptionId() == null) {
				orgSubscriptionRepository.save(construcVOtoDTO(orgSubscriptionVo));
				return ResponseStringVO.builder().response("Subscription Added Successfully").build();
			} else {
				OrgSubscription orgSubscriptionUpdate = orgSubscriptionRepository.getOrgSubscriptionBasedOnId(
						orgSubscriptionVo.getSubscriptionId(), YorosisContext.get().getTenantId(),
						YoroappsConstants.YES);
				Timestamp timestamp = new Timestamp(System.currentTimeMillis());
				orgSubscriptionUpdate.setBillingType(orgSubscriptionVo.getBillingType());
				orgSubscriptionUpdate.setPlanType(getPlanId(orgSubscriptionVo.getPlanId()));
				orgSubscriptionUpdate.setSubscriptionAmount(orgSubscriptionVo.getSubscriptionAmount());
				orgSubscriptionUpdate.setUpdatedBy(YorosisContext.get().getUserName());
				orgSubscriptionUpdate.setUpdatedDate(timestamp);
				return ResponseStringVO.builder().response("Subscription Updated Successfully").build();
			}
		} else {
			return ResponseStringVO.builder().response("No Customer Found").build();
		}
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public OrgSubscriptionVo getOrgSubscriptionByCustomer(String currentTenantId) throws StripeException {
		log.info("rolesList:{}", YorosisContext.get().getRolesList());
		Customers customers = customersRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(currentTenantId,
				YoroappsConstants.YES);

		Float subscriptionAmount = null;

		Long quantity = Long.valueOf(customers.getMaximunUsers());
		if (StringUtils.isNotBlank(customers.getPaymentCustomerId())) {
			subscriptionAmount = customerPaymentService.getSubscriptionAmount(customers);
		}
		List<OrgSubscription> orgSubscriptionList = orgSubscriptionRepository.getOrgSubscriptionBasedOnCustomerId(
				customers.getId(), YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		List<OrgSubscription> list = orgSubscriptionList.stream()
				.filter(t -> StringUtils.equals(t.getActivePlan(), YoroappsConstants.YES)).collect(Collectors.toList());
		if (!list.isEmpty()) {
			OrgSubscription orgSubscription = list.get(0);
			OrgSubscriptionVo orgSubscriptionVo = construcDTOtoVO(orgSubscription);
			orgSubscriptionVo.setQuantity(quantity);

			orgSubscriptionVo.setSubscriptionAmount(subscriptionAmount);
			return orgSubscriptionVo;
		} else {
			return OrgSubscriptionVo.builder().build();
		}
	}

	public Long getTotalQuantity(String paymentCustomerId, String tenantId) {
		return customerPaymentRepository.getTotalQuantity(paymentCustomerId, tenantId, YoroappsConstants.YES);
	}

	public CustomerPaymentVO getPaymentDetails(String paymentCustomerId, String tenantId, boolean isAdditionalUser) {
		List<CustomerPayment> paymentList = customerPaymentRepository
				.findByPaymentCustomerIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(paymentCustomerId, tenantId,
						YoroappsConstants.YES);

		if (!paymentList.isEmpty()) {

			CustomerPayment payment = paymentList.stream().filter(t -> t.getCreatedOn() != null)
					.sorted(Comparator.comparing(CustomerPayment::getCreatedOn)).collect(Collectors.toList()).get(0);

			if (payment != null) {
				return CustomerPaymentVO.builder().paymentSubscriptionId(payment.getPaymentSubscriptionId())
						.quantity(payment.getQuantity()).paymentPriceId(payment.getPaymentPriceId()).build();
			}
		}

		return CustomerPaymentVO.builder().build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO saveorganizationSubscription(String currentTenantId, OrgSubscriptionVo orgSubscriptionVo) {
		Customers customers = customersRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(currentTenantId,
				YoroappsConstants.YES);
		if (customers != null) {
			List<OrgSubscription> orgSubscriptionList = orgSubscriptionRepository.getOrgSubscriptionBasedOnCustomerId(
					customers.getId(), YorosisContext.get().getTenantId(), YoroappsConstants.YES);
			List<OrgSubscription> list = orgSubscriptionList.stream()
					.filter(t -> StringUtils.equals(t.getActivePlan(), YoroappsConstants.YES))
					.collect(Collectors.toList());
			orgSubscriptionVo.setCustomerId(customers.getId());
			OrgSubscription orgSubscription = construcVOtoDTO(orgSubscriptionVo);
			if (!list.isEmpty()) {
				OrgSubscription orgSubs = list.get(0);
				if (BooleanUtils.isTrue(orgSubscriptionVo.getIsUpgrade())) {
					orgSubs.setActiveFlag(YoroappsConstants.NO);
					orgSubs.setActivePlan(YoroappsConstants.NO);
					orgSubscriptionRepository.save(orgSubs);
				}

				if (StringUtils.equals(orgSubscriptionVo.getPlanType(), "STARTER")) {
					orgSubscription.setSubscriptionStartDate(orgSubs.getSubscriptionEndDate());
					orgSubscription
							.setSubscriptionEndDate(StringUtils.equals(orgSubscriptionVo.getBillingType(), "monthly")
									? Date.valueOf(orgSubs.getSubscriptionEndDate().toLocalDate().plusMonths(1))
									: Date.valueOf(orgSubs.getSubscriptionEndDate().toLocalDate().plusYears(1)));
				} else {
					orgSubscription.setSubscriptionStartDate(orgSubscriptionVo.getSubscriptionStartDate());
					orgSubscription.setSubscriptionEndDate(orgSubscriptionVo.getSubscriptionEndDate());
				}

				if (BooleanUtils.isTrue(orgSubscriptionVo.getIsUpgrade())) {
					orgSubscription.setActivePlan(YoroappsConstants.YES);
				} else {
					orgSubscription.setActivePlan(YoroappsConstants.NO);
				}

				orgSubscriptionRepository.save(orgSubscription);
				return ResponseStringVO.builder().response("Subscription Added Successfully")
						.startDate(orgSubscription.getSubscriptionStartDate())
						.endDate(orgSubscription.getSubscriptionEndDate()).build();
			}
		}
		return ResponseStringVO.builder().response("Invalid customer").build();
	}

	@Transactional
	public ResponseStringVO setFreePlan(SubscriptionExpireVO subscriptionExpireVO) throws IOException {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		List<OrgSubscription> orgSubscriptionList = orgSubscriptionRepository.getOrgSubscriptionBasedOnCustomerId(
				subscriptionExpireVO.getCustomerId(), YoroappsConstants.DEFAULT_SCHEMA, YoroappsConstants.YES);
		List<OrgSubscription> list = orgSubscriptionList.stream()
				.filter(t -> StringUtils.equals(t.getActivePlan(), YoroappsConstants.YES)).collect(Collectors.toList());
		subscriptionExpireVO.setCustomerId(subscriptionExpireVO.getCustomerId());
		OrgSubscription orgSubscription = OrgSubscription.builder().customerId(subscriptionExpireVO.getCustomerId())
				.planType(getPlanId(subscriptionExpireVO.getPlanId())).updatedBy(subscriptionExpireVO.getUsername())
				.billingType(subscriptionExpireVO.getBillingType())
				.subscriptionAmount(subscriptionExpireVO.getSubscriptionAmount()).updatedDate(timestamp)
				.createdBy(subscriptionExpireVO.getUsername()).createdDate(timestamp)
				.tenantId(YoroappsConstants.DEFAULT_SCHEMA).activeFlag(YoroappsConstants.YES).build();
		if (!list.isEmpty()) {
			OrgSubscription orgSubs = list.get(0);
			if (BooleanUtils.isTrue(subscriptionExpireVO.getIsUpgrade())) {
				orgSubs.setActiveFlag(YoroappsConstants.NO);
				orgSubs.setActivePlan(YoroappsConstants.NO);
				orgSubscriptionRepository.save(orgSubs);
			}
		}

		if (StringUtils.equals(subscriptionExpireVO.getPlanType(), "STARTER")) {
			Date startDate = Date.valueOf(LocalDate.now());
			orgSubscription.setSubscriptionStartDate(startDate);
			orgSubscription.setSubscriptionEndDate(StringUtils.equals(subscriptionExpireVO.getBillingType(), "monthly")
					? Date.valueOf(startDate.toLocalDate().plusMonths(1))
					: Date.valueOf(startDate.toLocalDate().plusYears(1)));
		}

		Customers customers = customersRepository.findByIdAndActiveFlagIgnoreCase(subscriptionExpireVO.getCustomerId(),
				YoroappsConstants.YES);
		if (customers != null) {
			customers.setSubscriptionStartDate(orgSubscription.getSubscriptionStartDate());
			customers.setSubscriptionEndDate(orgSubscription.getSubscriptionEndDate());
			customers.setTrialStartDate(orgSubscription.getSubscriptionStartDate());
			customers.setTrialEndDate(orgSubscription.getSubscriptionEndDate());
			customersRepository.save(customers);
		}

		if (BooleanUtils.isTrue(subscriptionExpireVO.getIsUpgrade())) {
			orgSubscription.setActivePlan(YoroappsConstants.YES);
		}

		orgSubscriptionRepository.save(orgSubscription);
		return ResponseStringVO.builder().response("Subscription Added Successfully")
				.startDate(orgSubscription.getSubscriptionStartDate()).endDate(orgSubscription.getSubscriptionEndDate())
				.build();

	}

	@Transactional
	public ResponseStringVO updateSubcription(OrgSubscriptionVo orgSubscriptionVo) {
		if (orgSubscriptionVo.getCustomerId() != null) {
			if (orgSubscriptionVo.getSubscriptionId() == null) {
				orgSubscriptionRepository.save(construcVOtoDTO(orgSubscriptionVo));
				return ResponseStringVO.builder().response("Subscription Added Successfully").build();
			} else {
				OrgSubscription orgSubscriptionUpdate = orgSubscriptionRepository.getOrgSubscriptionBasedOnId(
						orgSubscriptionVo.getSubscriptionId(), YorosisContext.get().getTenantId(),
						YoroappsConstants.YES);
				Timestamp timestamp = new Timestamp(System.currentTimeMillis());
				orgSubscriptionUpdate.setBillingType(orgSubscriptionVo.getBillingType());
				orgSubscriptionUpdate.setPlanType(getPlanId(orgSubscriptionVo.getPlanId()));
				orgSubscriptionUpdate.setSubscriptionAmount(orgSubscriptionVo.getSubscriptionAmount());
				orgSubscriptionUpdate.setUpdatedBy(YorosisContext.get().getUserName());
				orgSubscriptionUpdate.setUpdatedDate(timestamp);
				return ResponseStringVO.builder().response("Subscription Updated Successfully").build();
			}
		} else {
			return ResponseStringVO.builder().response("No Customer Found").build();
		}
	}

	private PaymentSubscriptionDetails getPlanId(UUID planId) {
		return paymentSubscriptionDetailsRepository.getbyIdAndPaymentSubscriptionDetails(planId,
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);
	}

}
