package com.yorosis.authnz.service;

import java.sql.Timestamp;
import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.authnz.constants.YorosisConstants;
import com.yorosis.authnz.exception.YorosisException;
import com.yorosis.authnz.repository.UsersRepository;
import com.yorosis.yoroapps.entities.Customers;
import com.yorosis.yoroapps.entities.Users;
import com.yorosis.yoroapps.vo.AuthToken;
import com.yorosis.yoroapps.vo.NativeAppLoginVo;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.SigninUserVO;
import com.yorosis.yoroapps.vo.UsersVO;
import com.yorosis.yoroflow.request.filter.client.AuthDetailsVO;
import com.yorosis.yoroflow.request.filter.client.UserDetailsVO;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

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
	private DomainService domainService;

	@Autowired
	private BCryptPasswordEncoder encoder;

	@Autowired
	private TermsAndConditionsService termsAndConditionsService;

	@Autowired
	private UserService userService;

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public AuthToken authenticateUser(SigninUserVO userVo, String loginUUID) throws YorosisException {
		log.info("Authenticating for user: {} - encrpted: {} ", userVo.getUsername(),
				encoder.encode(userVo.getPassword()));
		String message = null;
		long status = 0;
		boolean captchaVerified = captchaService.verify(userVo.getRecaptchaResponse(), 3);

		final Authentication authentication = authManager
				.authenticate(new UsernamePasswordAuthenticationToken(userVo.getUsername(), userVo.getPassword()));

		SecurityContextHolder.getContext().setAuthentication(authentication);
		final String token = tokenProviderService.generateToken(authentication, loginUUID);

		Users entity = userRepository.findByUserNameIgnoreCase(userVo.getUsername());
		entity.setLastLogin(new Timestamp(System.currentTimeMillis()));

		userRepository.save(entity);

		if (!captchaVerified) {
			message = "Invalid captcha";
			status = 400;
		} else {
			message = "Success";
			status = 200;
		}

		Customers customer = null;
		YorosisContext currentContext = YorosisContext.get();
		try {
			YorosisContext context = YorosisContext.builder().tenantId(YorosisConstants.DEFAULT_SCHEMA)
					.userName(userVo.getUsername()).build();
			YorosisContext.set(context);
			customer = domainService.getCustomer(currentContext.getTenantId());
		} finally {
			YorosisContext.clear();
			YorosisContext.set(currentContext);
		}
		return new AuthToken(token, status, message, customer.getSubdomainName() + ".yoroflow.com",
				termsAndConditionsService.handleTermsAndConditions());
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public AuthToken authenticateUserForNativeApp(NativeAppLoginVo userVo) throws YorosisException {
		log.info("Authenticating for user: {}", userVo.getUsername());
		String message = null;
		long status = 0;

		final Authentication authentication = authManager
				.authenticate(new UsernamePasswordAuthenticationToken(userVo.getUsername(), userVo.getPassword()));

		SecurityContextHolder.getContext().setAuthentication(authentication);
		final String token = tokenProviderService.generateToken(authentication, null);

		Users entity = userRepository.findByUserNameIgnoreCase(userVo.getUsername());
		entity.setLastLogin(new Timestamp(System.currentTimeMillis()));

		userRepository.save(entity);

		Customers customer = null;
		YorosisContext currentContext = YorosisContext.get();
		try {
			YorosisContext context = YorosisContext.builder().tenantId(YorosisConstants.DEFAULT_SCHEMA)
					.userName(userVo.getUsername()).build();
			YorosisContext.set(context);
			customer = domainService.getCustomer(currentContext.getTenantId());
		} finally {
			YorosisContext.clear();
			YorosisContext.set(currentContext);
		}

		if (token != null) {
			status = 200;
			message = "success";
		}

		return new AuthToken(token, status, message, customer.getSubdomainName() + ".yoroflow.com",
				termsAndConditionsService.handleTermsAndConditions());
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public AuthDetailsVO authenticateUser(Users user) throws YorosisException {

		if (user != null) {
			UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
					new User(user.getUserName(), "", getAuthority()), "", getAuthority());

			SecurityContextHolder.getContext().setAuthentication(authentication);
			UsersVO users = userService.getLoggedInUserDetails();
			final String token = tokenProviderService.generateToken(authentication, "");
			// TODO: Need to add the Roles here
			return new AuthDetailsVO(user.getEmailId(), user.getTenantId(), token, true,
					UserDetailsVO.builder().authorities(new HashSet<>()).build(),
					tokenProviderService.getAssociateRoles(users));
		}

		throw new YorosisException("User info not available for this service token");

	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO authenticateForQr(SigninUserVO user) {
		if (user != null) {

			UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
					new User(user.getUsername(), "", getAuthority()), "", getAuthority());
			if (authentication.isAuthenticated()) {
				return ResponseStringVO.builder().response("valid").build();
			}
		}
		return ResponseStringVO.builder().response("invalid").build();
	}

	private Set<SimpleGrantedAuthority> getAuthority() {
		Set<SimpleGrantedAuthority> authorities = new HashSet<>();
		authorities.add(new SimpleGrantedAuthority("ADMIN"));

		return authorities;
	}
}
