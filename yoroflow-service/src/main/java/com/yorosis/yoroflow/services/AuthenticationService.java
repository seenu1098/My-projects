package com.yorosis.yoroflow.services;

import java.sql.Timestamp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroflow.entities.Customers;
import com.yorosis.yoroflow.entities.User;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.AuthToken;
import com.yorosis.yoroflow.models.SigninUserVO;
import com.yorosis.yoroflow.repository.CustomersRepository;
import com.yorosis.yoroflow.repository.UsersRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AuthenticationService {

	@Autowired
	private AuthenticationManager authManager;

	@Autowired
	private TokenProviderService tokenProviderService;

	@Autowired
	private UsersRepository userRepository;

	@Autowired
	private CaptchaService captchaService;

	@Autowired
	private CustomersRepository customersRepository;

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public AuthToken authenticateUser(SigninUserVO userVo) {
		log.info("Authenticating for user: {}", userVo.getUsername());
		String message = null;
		long status = 0;
		boolean captchaVerified = captchaService.verify(userVo.getRecaptchaResponse());

		final Authentication authentication = authManager.authenticate(new UsernamePasswordAuthenticationToken(userVo.getUsername(), userVo.getPassword()));

		SecurityContextHolder.getContext().setAuthentication(authentication);
		final String token = tokenProviderService.generateToken(authentication);

		User entity = userRepository.findByUserName(userVo.getUsername());
		entity.setLastLogin(new Timestamp(System.currentTimeMillis()));

		userRepository.save(entity);

		if (!captchaVerified) {
			message = "Invalid captcha";
			status = 400;
		} else {
			message = "Success";
			status = 200;
		}

		Customers customer = customersRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(entity.getTenantId(), YorosisConstants.YES);

		return new AuthToken(token, status, message, customer.getSubdomainName() + "." + customer.getActualDomainName());
	}

}
