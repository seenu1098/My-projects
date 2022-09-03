package com.yorosis.livetester.service;

import java.sql.Timestamp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.livetester.entities.Users;
import com.yorosis.livetester.exception.LicenseException;
import com.yorosis.livetester.repo.UsersRepository;
import com.yorosis.livetester.vo.AuthToken;
import com.yorosis.livetester.vo.SigninUserVO;

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
	private LicenseValidationService licenseValidationService;
	
	@Transactional
	public AuthToken authenticateUser(SigninUserVO userVo) throws LicenseException {
		log.info("Authenticating for user: {}", userVo.getUsername());

		final Authentication authentication = authManager.authenticate(new UsernamePasswordAuthenticationToken(userVo.getUsername(), userVo.getPassword()));

		SecurityContextHolder.getContext().setAuthentication(authentication);
		final String token = tokenProviderService.generateToken(authentication);

		Users entity = userRepository.findByUserName(userVo.getUsername());
		entity.setLastLogin(new Timestamp(System.currentTimeMillis()));

		licenseValidationService.validateUserLimit(userRepository.count());
		
		userRepository.save(entity);

		return new AuthToken(token);
	}

}
