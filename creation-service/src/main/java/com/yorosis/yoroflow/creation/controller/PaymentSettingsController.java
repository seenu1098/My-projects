package com.yorosis.yoroflow.creation.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroapps.vo.PaymentSettingVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.service.PaymentSettingService;

@RestController
@RequestMapping("/payment-settings/v1/")
public class PaymentSettingsController {

	@Autowired
	private PaymentSettingService paymentSettingService;

	@GetMapping("/get/publish-key")
	public PaymentSettingVO getPublishKey() {
		return paymentSettingService.getPublishableKey();
	}

	@GetMapping("/get/payment-settings/{id}")
	public PaymentSettingVO getPaymentSettings(@PathVariable(name = "id") String id) {
		return paymentSettingService.getPaymentSettings(id);
	}

	@PostMapping("/save-payment-settings")
	public ResponseStringVO savePaymentSettings(@RequestBody PaymentSettingVO vo) {
		return paymentSettingService.savePaymentSettings(vo);
	}
}
