package com.yorosis.yoroflow.creation.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stripe.exception.StripeException;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.service.StripeWebhookService;

@RestController
@CrossOrigin
@RequestMapping("/stripe/v1/")
public class StripeWebhookController {

	@Autowired
	private StripeWebhookService stripeWebhookService;

	@PostMapping("/events")
	public ResponseStringVO handleStripeEvents(@RequestBody String payload,
			@RequestHeader("stripe-signature") String sigHeader) throws IOException, StripeException {
		return stripeWebhookService.handleStripeEvents(payload, sigHeader);
	}

}
