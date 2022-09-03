package com.yorosis.authnz.controller;

import java.io.IOException;
import java.util.Base64;
import java.util.HashSet;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.yorosis.authnz.constants.YorosisConstants;
import com.yorosis.authnz.exception.YorosisException;
import com.yorosis.authnz.service.AuthenticationService;
import com.yorosis.authnz.service.CaptchaService;
import com.yorosis.authnz.service.DomainService;
import com.yorosis.authnz.service.GoogleAuthService;
import com.yorosis.authnz.service.MicrosoftAuthService;
import com.yorosis.authnz.service.QrSetUpService;
import com.yorosis.authnz.service.TermsAndConditionsService;
import com.yorosis.authnz.service.TokenProviderService;
import com.yorosis.authnz.service.UserService;
import com.yorosis.yoroapps.entities.Customers;
import com.yorosis.yoroapps.entities.Users;
import com.yorosis.yoroapps.vo.AuthToken;
import com.yorosis.yoroapps.vo.NativeAppLoginVo;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.SigninUserVO;
import com.yorosis.yoroapps.vo.UsersVO;
import com.yorosis.yoroflow.cache.service.CacheService;
import com.yorosis.yoroflow.request.filter.client.AuthDetailsVO;
import com.yorosis.yoroflow.request.filter.client.UserDetailsVO;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/user-service/v1")
@Slf4j
public class UserController {

	private static final String TOKEN_PREFIX = "Bearer ";

	@Autowired
	private AuthenticationService authService;

	@Autowired
	private DomainService domainService;

	@Autowired
	private TokenProviderService tokenProviderService;

	@Autowired
	private UserService userService;

	@Autowired
	private CacheService cacheService;

	private static final String TOKEN_CACHE_KEY = "token-cache";

	@Autowired
	private CaptchaService captchaService;

	@Autowired
	private QrSetUpService qrSetUpService;

	@Autowired
	private GoogleAuthService googleAuthService;

	@Autowired
	private MicrosoftAuthService microsoftAuthService;

	@Autowired
	private TermsAndConditionsService termsAndConditionsService;

	@PostMapping("/authenticate")
	public ResponseEntity<AuthToken> login(@RequestBody SigninUserVO userVo, HttpServletRequest request,
			@RequestHeader("origin") String origin)
			throws YorosisException, IOException, InterruptedException, ExecutionException {
		log.warn(origin);
		String header = StringUtils.lowerCase(StringUtils.trim(origin));
//		header = "https://india.yoroflow.com";
		try {

			boolean checkUserNamePassword = true;
			userVo.setUsername(StringUtils.lowerCase(StringUtils.trim(userVo.getUsername())));
			Customers customers = domainService.getAssignedTenantId(header);
			String tenantId = customers.getTenantId();
			YorosisContext context = YorosisContext.builder().tenantId(tenantId).userName(userVo.getUsername()).build();
			YorosisContext.set(context);
			if (userVo.isHasTwofactor()) {
				checkUserNamePassword = qrSetUpService.checkOtp(userVo.getOtpNumber(), userVo.getUsername());
			}
			if (checkUserNamePassword) {
				// put token into cache
				ResponseStringVO responseStringVO = termsAndConditionsService.saveLoginDetails();
				if (StringUtils.equals(userVo.getUserType(), "Google")) {
					return ResponseEntity.ok(googleAuthService.signInByGoogle(userVo));
				} else if (StringUtils.equalsAny(userVo.getUserType(), "Microsoft", "Microsoft Azure")) {
					return ResponseEntity.ok(microsoftAuthService.signInByMicrosoft(userVo));
				} else {
					UsersVO users = userService.getLoggedInUserDetails();
					AuthToken authToken = authService.authenticateUser(userVo, responseStringVO.getPageId().toString());

					// TODO: Need to add the Roles here
					AuthDetailsVO authDetailsVO = new AuthDetailsVO(userVo.getUsername(), tenantId,
							authToken.getToken(), true, UserDetailsVO.builder().authorities(new HashSet<>()).build(),
							tokenProviderService.getAssociateRoles(users));
					cacheService.putKeyValue(TOKEN_CACHE_KEY, authToken.getToken(), authDetailsVO, 15L,
							TimeUnit.MINUTES);
					return ResponseEntity.ok(authToken);
				}
			} else {
				return ResponseEntity.ok(AuthToken.builder().message("invalid").build());
			}

		} finally {
			YorosisContext.clear();
		}
	}

	@PostMapping("/authenticate/app")
	public ResponseEntity<AuthToken> appLogin(@RequestBody NativeAppLoginVo userVo) throws YorosisException {
		try {
			userVo.setSubdoaminName(StringUtils.lowerCase(StringUtils.trim(userVo.getSubdoaminName())));
			userVo.setUsername(StringUtils.lowerCase(StringUtils.trim(userVo.getUsername())));

			Customers customer = domainService.getCustomer(userVo.getSubdoaminName());
			YorosisContext context = YorosisContext.builder().tenantId(customer.getTenantId())
					.userName(userVo.getUsername()).build();
			YorosisContext.set(context);
			userVo.setUsername(userVo.getUsername());

			// put token into cache
			AuthToken authToken = authService.authenticateUserForNativeApp(userVo);

			UsersVO users = userService.getLoggedInUserDetails();

			// TODO: Need to add the Roles here
			AuthDetailsVO authDetailsVO = new AuthDetailsVO(userVo.getUsername(), customer.getTenantId(),
					authToken.getToken(), true, UserDetailsVO.builder().authorities(new HashSet<>()).build(),
					tokenProviderService.getAssociateRoles(users));
			cacheService.putKeyValue(TOKEN_CACHE_KEY, authToken.getToken(), authDetailsVO, 15L, TimeUnit.MINUTES);

			return ResponseEntity.ok(authToken);
		} finally {
			YorosisContext.clear();
		}
	}

	@GetMapping("/get-captcha/{response}/{version}")
	public Boolean verifyInfo(@PathVariable(name = "response") String response,
			@PathVariable(name = "version") Long version) {
		return captchaService.verify(response, version);
	}

	@GetMapping("/validate-token/{token}")
	public AuthDetailsVO validateToken(@PathVariable("token") String token,
			@RequestHeader(required = false, value = "x-api-key") String apiKey,
			@RequestHeader(required = false, value = "x-secret-key") String secretKey)
			throws YorosisException, IOException, InterruptedException, ExecutionException {
		String error = "Token not valid";

		if (StringUtils.isNotBlank(token) && token.lastIndexOf('.') > 0
				&& token.indexOf('.') != token.lastIndexOf('.')) {
			String authToken = token.startsWith(TOKEN_PREFIX) ? token.replace(TOKEN_PREFIX, "").trim() : token;

			AuthDetailsVO authDetailsVO = cacheService.getKeyValue(TOKEN_CACHE_KEY, authToken);
			if (authDetailsVO != null) {
				log.info("AuthDetailsVO fetched from cache ... for token");
				return authDetailsVO;
			}
			String username = tokenProviderService.getUsernameFromToken(authToken);
			String domain = tokenProviderService.getSubdomain(authToken);
			Customers customers = domainService.getAssignedTenantId(domain);
			String tenantId = customers.getTenantId();
//			googleAuthService.validateUser(authDetailsVO, users);
			try {
				YorosisContext context = YorosisContext.builder().tenantId(tenantId).userName(username).build();
				YorosisContext.set(context);
				if (tokenProviderService.getlogin(token)) {
					authDetailsVO = userService.getAuthDetailsFromToken(token);
					UsersVO users = userService.getLoggedInUserDetails();
					authDetailsVO.setRolesList(tokenProviderService.getAssociateRoles(users));
					log.info("authDetails:{}", authDetailsVO);
					if (StringUtils.equals(users.getUserType(), "Microsoft Azure")) {
						return microsoftAuthService.validateUserByAzure(authDetailsVO, users);
					} else if (StringUtils.equals(users.getUserType(), "Google")
							|| StringUtils.equals(users.getUserType(), "Microsoft")) {
						return changeDomain(users, authDetailsVO);
					} else {
						authDetailsVO = userService.validateUser(authDetailsVO);
						cacheService.putKeyValue(TOKEN_CACHE_KEY, authToken, authDetailsVO, 15L, TimeUnit.MINUTES);
						return authDetailsVO;
					}
				}
			} finally {
				YorosisContext.clear();
			}
//			} else {
//				throw new YorosisException("Invalid token");
//			}

		} else if (StringUtils.isNotBlank(apiKey) && StringUtils.isNotBlank(secretKey)) {
			error = "API-KEY not valid";
			try {
				if (StringUtils.lastIndexOf(apiKey, ".") == -1) {
					throw new YorosisException(error);
				}

				String cacheKey = apiKey + Base64.getEncoder().encodeToString(secretKey.getBytes());
				AuthDetailsVO authDetailsVO = cacheService.getKeyValue(TOKEN_CACHE_KEY, cacheKey);
				if (authDetailsVO != null) {
					log.info("AuthDetailsVO fetched from cache ... for api key");

					return authDetailsVO;
				}

				// jasyptEncryptor.decrypt
				String encTenantId = StringUtils.substring(apiKey, 0, StringUtils.lastIndexOf(apiKey, "."));
				String defaultAdminUser = domainService.getDefaultAdminUser((encTenantId));
				YorosisContext.set(YorosisContext.builder().tenantId((encTenantId)).userName(defaultAdminUser).build());
				Users user = tokenProviderService.getUserFromApikey(apiKey, secretKey);

				authDetailsVO = authService.authenticateUser(user);
				cacheService.putKeyValue(TOKEN_CACHE_KEY, cacheKey, authDetailsVO, 15L, TimeUnit.MINUTES);

				return authDetailsVO;
			} finally {
				YorosisContext.clear();
			}
		}

		throw new YorosisException(error);
	}

	@PostMapping("/remove-token")
	public AuthDetailsVO validateToken(@RequestBody AuthDetailsVO authDetailsVo)
			throws JsonMappingException, JsonProcessingException, YorosisException {
		String token = authDetailsVo.getToken();
		if (StringUtils.isNotBlank(token) && token.lastIndexOf('.') > 0
				&& token.indexOf('.') != token.lastIndexOf('.')) {
			String authToken = token.startsWith(TOKEN_PREFIX) ? token.replace(TOKEN_PREFIX, "").trim() : token;
			tokenProviderService.getlogoutTime(authToken);
//			String username = tokenProviderService.getUsernameFromToken(authToken);
//			String domain = tokenProviderService.getSubdomain(authToken);
//			Customers customers = domainService.getAssignedTenantId(domain);
//			String tenantId = customers.getTenantId();
//			try {
//				YorosisContext context = YorosisContext.builder().tenantId(tenantId).userName(username).build();
//				YorosisContext.set(context);
//				tokenProviderService.getlogoutTime(authToken);
//			} finally {
//				YorosisContext.clear();
//			}
			AuthDetailsVO authDetailsVO = cacheService.getKeyValue(TOKEN_CACHE_KEY, authToken);
			if (authDetailsVO != null) {
				if (cacheService.deleteKeyValue(TOKEN_CACHE_KEY, authToken))
					return AuthDetailsVO.builder().userName("Token removed successfully").build();
			}
		}
		return AuthDetailsVO.builder().userName("Token is Empty").build();
	}

	private AuthDetailsVO changeDomain(UsersVO users, AuthDetailsVO authDetailsVO)
			throws IOException, InterruptedException, ExecutionException {
		try {
			YorosisContext context = YorosisContext.builder().tenantId(YorosisConstants.DEFAULT_SCHEMA).build();
			YorosisContext.set(context);
			if (StringUtils.equals(users.getUserType(), "Google")) {
				return googleAuthService.validateUser(authDetailsVO, users);
			} else if (StringUtils.equals(users.getUserType(), "Microsoft")) {
				return microsoftAuthService.validateUser(authDetailsVO, users);
			}
		} finally {
			YorosisContext.clear();
		}
		return authDetailsVO;
	}
}
