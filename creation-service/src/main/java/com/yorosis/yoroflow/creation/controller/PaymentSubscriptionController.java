package com.yorosis.yoroflow.creation.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stripe.exception.StripeException;
import com.yorosis.yoroapps.vo.CustomersVO;
import com.yorosis.yoroapps.vo.OrgSubscriptionVo;
import com.yorosis.yoroapps.vo.OrganizationDiscountVo;
import com.yorosis.yoroapps.vo.PlanDetailsListVo;
import com.yorosis.yoroflow.creation.service.OrganizationDiscountService;
import com.yorosis.yoroflow.creation.service.ProxyService;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@RestController
@RequestMapping("/subscription-details/v1/")
public class PaymentSubscriptionController {

	@Autowired
	private OrganizationDiscountService organizationDiscountService;

	@Autowired
	private ProxyService proxyService;

	@GetMapping("/get-details")
	public List<PlanDetailsListVo> getCustomerInfo() {
		return proxyService.getPaymentSubscriptionDetailsFromAnotherCustomer();
	}

	@GetMapping("/get-details-for-payment")
	public List<PlanDetailsListVo> getPaymentDetails() {
		return proxyService.getPaymentSubscriptionDetailsForPayment();
	}

	@PostMapping("/get/amount-per-user")
	public OrganizationDiscountVo getAmountPerUser(@RequestBody CustomersVO vo) throws StripeException {
		return proxyService.getAmountPerUser(vo);
	}

	@PostMapping("/get/plan-details-list")
	public List<PlanDetailsListVo> getPlanDetailsList(@RequestBody CustomersVO vo) throws StripeException {
		return proxyService.getPlanDetailsByCustomer(vo);
	}

	@PostMapping("/get/discount-amount")
	public OrgSubscriptionVo getAmountDetails(@RequestBody OrgSubscriptionVo vo) {
		return organizationDiscountService.getOrganizationDiscountAmount(vo);
	}

	@PostMapping("/get-details/discount-amount")
	public OrgSubscriptionVo getAmountDetailsForCustomer(@RequestBody OrgSubscriptionVo vo) {
		String currentTenantId = YorosisContext.get().getTenantId();
//		List<PaymentSubscriptionDetailsVo> paymentSubscriptionDetailsVo = new ArrayList<PaymentSubscriptionDetailsVo>();
		try {
			YorosisContext.get().setTenantId("yoroflow");
			return organizationDiscountService.getOrganizationDiscountAmountFromCustomer(currentTenantId, vo);
		} finally {
			YorosisContext.get().setTenantId(currentTenantId);
		}
//		return paymentSubscriptionDetailsVo;
	}

}
