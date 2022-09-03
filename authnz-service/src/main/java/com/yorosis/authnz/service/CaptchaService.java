package com.yorosis.authnz.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.yorosis.yoroapps.vo.RecaptchaResponse;

@Service
public class CaptchaService {
	private final RestTemplate restTemplate;

	public CaptchaService(RestTemplateBuilder restTemplateBuilder) {
		this.restTemplate = restTemplateBuilder.build();
	}

	@Value("${google.recaptcha.secret.key}")
	public String recaptchaSecret;
	@Value("${google.recaptcha.secretV2.key}")
	public String recaptchaV2Secret;
	@Value("${google.recaptcha.verify.url}")
	public String recaptchaVerifyUrl;

	public boolean verify(String response, long version) {
		MultiValueMap<Object, Object> param = new LinkedMultiValueMap<>();
		if (version==2) {
			param.add("secret", recaptchaV2Secret);
		} else {
			param.add("secret", recaptchaSecret);
		}
		param.add("response", response);

		RecaptchaResponse recaptchaResponse = null;
		try {
			recaptchaResponse = this.restTemplate.postForObject(recaptchaVerifyUrl, param, RecaptchaResponse.class);
		} catch (RestClientException e) {
//			System.out.print(e.getMessage());
		}
		if (recaptchaResponse != null) {
			return recaptchaResponse.isSuccess();
		}
		return false;
	}

}
