package com.yorosis.livetester.service;

import java.util.Base64;

import javax.annotation.PostConstruct;

import org.apache.commons.lang3.StringUtils;
import org.jasypt.util.text.BasicTextEncryptor;
import org.springframework.stereotype.Service;

@Service
public class EncryptionService {

	private BasicTextEncryptor encryptor = new BasicTextEncryptor();

	@PostConstruct
	private void initialize() {
		encryptor.setPassword(new String(Base64.getDecoder().decode("IklZVSUjJSReI1NESUdVU0MmUl5eRCZUXiQi")));
	}

	public String encrypt(String value) {
		if (StringUtils.isNotBlank(value)) {
			return encryptor.encrypt(value);
		}

		return "";
	}

	public String decrypt(String value) {
		if (StringUtils.isNotBlank(value)) {
			return encryptor.decrypt(value);
		}

		return "";
	}
}
