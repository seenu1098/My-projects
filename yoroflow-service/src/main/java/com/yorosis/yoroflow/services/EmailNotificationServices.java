package com.yorosis.yoroflow.services;

import org.springframework.stereotype.Service;

import com.yorosis.yoroflow.models.EmailRequestVO;

import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

@Data
@Builder
@Service
@Slf4j
public class EmailNotificationServices {

	public boolean sendEmail(EmailRequestVO emailRequestVO) {
		log.warn("Email Sent " + emailRequestVO);
		return true;
	}

}
