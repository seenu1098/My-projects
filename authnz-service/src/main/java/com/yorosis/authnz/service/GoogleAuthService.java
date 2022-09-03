package com.yorosis.authnz.service;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

import org.apache.commons.lang3.StringUtils;
import org.jasypt.encryption.StringEncryptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.github.scribejava.apis.GoogleApi20;
import com.github.scribejava.core.builder.ServiceBuilder;
import com.github.scribejava.core.model.OAuthRequest;
import com.github.scribejava.core.model.Response;
import com.github.scribejava.core.model.Verb;
import com.github.scribejava.core.oauth.OAuth20Service;
import com.yorosis.authnz.constants.YorosisConstants;
import com.yorosis.authnz.exception.YorosisException;
import com.yorosis.authnz.repository.AuthAssociateGroupsRepository;
import com.yorosis.authnz.repository.AuthAssociateRolesRepository;
import com.yorosis.authnz.repository.AuthMethodRepository;
import com.yorosis.authnz.repository.UserAssociateRolesRepository;
import com.yorosis.authnz.repository.UserRolesRepository;
import com.yorosis.authnz.repository.UsersRepository;
import com.yorosis.authnz.repository.YoroGroupsRepository;
import com.yorosis.authnz.repository.YoroGroupsUsersRepository;
import com.yorosis.authnz.repository.YoroflowSettingsRepository;
import com.yorosis.yoroapps.entities.AuthMethods;
import com.yorosis.yoroapps.entities.Customers;
import com.yorosis.yoroapps.entities.Roles;
import com.yorosis.yoroapps.entities.UserAssociateRoles;
import com.yorosis.yoroapps.entities.Users;
import com.yorosis.yoroapps.entities.YoroGroups;
import com.yorosis.yoroapps.entities.YoroGroupsUsers;
import com.yorosis.yoroapps.vo.AuthToken;
import com.yorosis.yoroapps.vo.AuthVo;
import com.yorosis.yoroapps.vo.SigninUserVO;
import com.yorosis.yoroapps.vo.UsersVO;
import com.yorosis.yoroflow.request.filter.client.AuthDetailsVO;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class GoogleAuthService {
	@Autowired
	private UsersRepository userRepository;

	@Autowired
	private DomainService domainService;

	@Autowired
	private TokenProviderService tokenProviderService;

	@Autowired
	private YoroGroupsRepository yoroGroupsRepository;

	@Autowired
	private AuthMethodRepository authMethodRepository;

	@Autowired
	private YoroGroupsUsersRepository yoroGroupsUsersRepository;

	@Autowired
	private YoroflowSettingsRepository yoroflowSettingsRepository;

	@Autowired
	private AuthAssociateGroupsRepository authAssociateGroupsRepository;

	@Autowired
	private AuthAssociateRolesRepository authAssociateRolesRepository;

	@Autowired
	private UserRolesRepository userRolesRepository;

	@Autowired
	private UserAssociateRolesRepository userAssociateRolesRepository;

	@Autowired
	@Qualifier("jasyptEncryptor")
	private StringEncryptor jasyptEncryptor;

	@Autowired
	private TermsAndConditionsService termsAndConditionsService;

	private static final String PROTECTED_RESOURCE_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
	private static final String DEFAULT_GROUP_ID = "7eda9d01-6ea7-4c1e-9201-2eda3fc2b080";
	private static final String DEFAULT_ROLE_ID = "0af6950d-f073-4553-a557-4a1e59a20f2f";
	private static final String DEFAULT_WORKSPACE = "6a6ad5ca-5a59-4165-84fc-675c5c503fdf";

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public AuthVo googleService(AuthVo authVo, Response response) throws IOException {
		ObjectMapper mapper = new ObjectMapper();
		JsonNode actualObj = mapper.readTree(response.getBody());

		if (hasAllowDoamin(actualObj)) {
			setupFirstUser(actualObj, authVo);
			authVo.setValidUser(true);
			return authVo;
		} else {
			authVo.setEmail("invalid");
			return authVo;
		}
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public AuthDetailsVO validateUser(AuthDetailsVO authDetailsVO, UsersVO usersVO)
			throws IOException, InterruptedException, ExecutionException {
		if (!StringUtils.isEmpty(usersVO.getTokenId())) {
			String tokenId = jasyptEncryptor.decrypt(usersVO.getTokenId());
			String googleClientId = yoroflowSettingsRepository.findByKeyName("google_client_id");
			String googleClientSecret = yoroflowSettingsRepository.findByKeyName("google_client_secret");
			final String clientId = (StringUtils.isEmpty(googleClientId) ? null
					: jasyptEncryptor.decrypt(googleClientId));
			final String clientSecret = (StringUtils.isEmpty(googleClientSecret) ? null
					: jasyptEncryptor.decrypt(googleClientSecret));
			final OAuth20Service service = new ServiceBuilder(clientId).apiSecret(clientSecret)
//	            .defaultScope("profile") // replace with desired scope
					.build(GoogleApi20.instance());
			OAuthRequest request = new OAuthRequest(Verb.GET, PROTECTED_RESOURCE_URL);
			service.signRequest(tokenId, request);
			Response response = service.execute(request);
			if (response.isSuccessful()) {
				authDetailsVO.setAuthenticated(true);
			}
		}
		return authDetailsVO;
	}

	public Response changeDomainForGoogleVerification(AuthVo authVo)
			throws IOException, InterruptedException, ExecutionException, YorosisException {
		YorosisContext currentTenant = YorosisContext.get();
		try {
			YorosisContext.clear();
			YorosisContext context = YorosisContext.builder().tenantId(YorosisConstants.DEFAULT_SCHEMA).build();
			YorosisContext.set(context);
			return verifyGoogleService(authVo);
		} finally {
			YorosisContext.clear();
			YorosisContext.set(currentTenant);
		}
	}

	@Transactional
	public Response verifyGoogleServiceInint(AuthVo authVo)
			throws IOException, InterruptedException, ExecutionException, YorosisException {
//		String id = "548004574948-4diddp336svf9e79nqoo6i2sr2g1gahj.apps.googleusercontent.com";
//		String clientIds = jasyptEncryptor.encrypt(id);
//		String idv = "M5xt2TFGkUxaFiQqPpYTKR3O";
//		String clientIdsv = jasyptEncryptor.encrypt(idv);
		String googleClientId = yoroflowSettingsRepository.findByKeyName("google_client_id");
		String googleClientSecret = yoroflowSettingsRepository.findByKeyName("google_client_secret");
		final String clientId = (StringUtils.isEmpty(googleClientId) ? null : jasyptEncryptor.decrypt(googleClientId));
		final String clientSecret = (StringUtils.isEmpty(googleClientSecret) ? null
				: jasyptEncryptor.decrypt(googleClientSecret));
		final OAuth20Service service = new ServiceBuilder(clientId).apiSecret(clientSecret)
//            .defaultScope("profile") // replace with desired scope
				.build(GoogleApi20.instance());
		OAuthRequest request = new OAuthRequest(Verb.GET, PROTECTED_RESOURCE_URL);
		service.signRequest(authVo.getTokenId(), request);
		return service.execute(request);
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public Response verifyGoogleService(AuthVo authVo)
			throws IOException, InterruptedException, ExecutionException, YorosisException {
//		String id = "548004574948-4diddp336svf9e79nqoo6i2sr2g1gahj.apps.googleusercontent.com";
//		String clientIds = jasyptEncryptor.encrypt(id);
//		String idv = "M5xt2TFGkUxaFiQqPpYTKR3O";
//		String clientIdsv = jasyptEncryptor.encrypt(idv);
		String googleClientId = yoroflowSettingsRepository.findByKeyName("google_client_id");
		String googleClientSecret = yoroflowSettingsRepository.findByKeyName("google_client_secret");
		final String clientId = (StringUtils.isEmpty(googleClientId) ? null : jasyptEncryptor.decrypt(googleClientId));
		final String clientSecret = (StringUtils.isEmpty(googleClientSecret) ? null
				: jasyptEncryptor.decrypt(googleClientSecret));
		final OAuth20Service service = new ServiceBuilder(clientId).apiSecret(clientSecret)
//            .defaultScope("profile") // replace with desired scope
				.build(GoogleApi20.instance());
		OAuthRequest request = new OAuthRequest(Verb.GET, PROTECTED_RESOURCE_URL);
		service.signRequest(authVo.getTokenId(), request);
		return service.execute(request);
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public AuthToken signInByGoogle(SigninUserVO userVo)
			throws YorosisException, IOException, InterruptedException, ExecutionException {
		// &&
		// changeDomainForGoogleVerification(GoogleAuthVo.builder().tokenId(userVo.getPassword()).build()).isSuccessful()
		if (!StringUtils.isEmpty(userVo.getUsername())) {
			final String token = tokenProviderService.generateTokenFromAuthService(userVo.getUsername());
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
			return new AuthToken(token, 200, "success", customer.getSubdomainName() + ".yoroflow.com",
					termsAndConditionsService.handleTermsAndConditions());
		}
		return AuthToken.builder().message("invalid").build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public boolean hasAllowDoamin(JsonNode actualObj) {
		AuthMethods authMethods = authMethodRepository.findByProviderName("Sign in with Google", YorosisConstants.YES,
				YorosisContext.get().getTenantId());
		if (authMethods != null) {
			if (StringUtils.equals(authMethods.getAllowedDomainNames(), "all")) {
				return true;
			}
			String email = actualObj.get("email").asText();
			String[] splitString = email.split("@");
			String emailDomain = splitString[1];
			List<String> allowedDomainNamesList = Arrays.asList(authMethods.getAllowedDomainNames().split(","));
			if (allowedDomainNamesList.contains(emailDomain)) {
				return true;
			}
		}
		return false;
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public UUID setupFirstUser(JsonNode actualObj, AuthVo authVo) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
//		String hashedPassword = bcryptEncoder.encode(customerVo.getPassword());
		Users users = userRepository.findByEmailIdAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(
				actualObj.get("email").asText(), YorosisConstants.YES, YorosisContext.get().getTenantId());
		if (users == null) {
			Users user = Users.builder().emailId(actualObj.get("email").asText())
					.firstName(actualObj.get("given_name").asText()).lastName(actualObj.get("family_name").asText())
					.tenantId(YorosisContext.get().getTenantId()).userName(actualObj.get("email").asText())
					.authType("Google")
					.authToken((StringUtils.isEmpty(authVo.getTokenId())) ? null
							: jasyptEncryptor.encrypt(authVo.getTokenId()))
					.createdBy(YorosisContext.get().getUserName()).createdOn(timestamp).lastLogin(timestamp)
					.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp).profilePicture(null)
					.activeFlag(YorosisConstants.YES).contactEmailId(actualObj.get("email").asText())
					.defaultWorkspace(UUID.fromString(DEFAULT_WORKSPACE)).additionalSettings(getFontSize())
					.color("#1b5e20").defaultLanguage("en").build();
			userRepository.save(user);
			associateGroupWithUser(user);
			associateRolesWithUser(user);
			return user.getUserId();
		} else {
			users.setModifiedBy(YorosisContext.get().getUserName());
			users.setModifiedOn(timestamp);
			users.setAuthType("Google");
			users.setFirstName(actualObj.get("given_name").asText());
			users.setLastName(actualObj.get("family_name").asText());
			users.setAuthToken(
					(StringUtils.isEmpty(authVo.getTokenId())) ? null : jasyptEncryptor.encrypt(authVo.getTokenId()));
			userRepository.save(users);
			addDefaultGroup(users);
			addDefaultRole(users);
			return users.getUserId();
		}

	}
	
	private JsonNode getFontSize() {
		ObjectNode node = JsonNodeFactory.instance.objectNode();
		node.put("fontSize", 12);
		return node;
	}

	private void associateGroupWithUser(Users user) {
		AuthMethods authMethods = authMethodRepository.findByProviderName("Sign in with Google", YorosisConstants.YES,
				YorosisContext.get().getTenantId());
		List<UUID> associateGroupList = authAssociateGroupsRepository.getAccosiateGroupListBasedOnAuthMethod(
				authMethods.getId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (!associateGroupList.isEmpty()) {
			List<YoroGroups> yoroGroupsList = yoroGroupsRepository.getGroupList(associateGroupList,
					YorosisContext.get().getTenantId(), YorosisConstants.YES);
			if (yoroGroupsList != null) {
				for (YoroGroups yoroGroups : yoroGroupsList) {
					Timestamp timestamp = new Timestamp(System.currentTimeMillis());
					YoroGroupsUsers yoroGroupUser = YoroGroupsUsers.builder().activeFlag(YorosisConstants.YES)
							.tenantId(YorosisContext.get().getTenantId()).createdBy(YorosisContext.get().getUserName())
							.createdOn(timestamp).users(user).yoroGroups(yoroGroups)
							.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp).build();
					yoroGroupsUsersRepository.save(yoroGroupUser);
				}
			}
		}
		addDefaultGroup(user);
	}

	private void addDefaultGroup(Users user) {
		int yoroGroupUsers = yoroGroupsUsersRepository.getYoroGroupsUsersBasedOnUserAndGroupId(
				UUID.fromString(DEFAULT_GROUP_ID), user.getUserId(), YorosisContext.get().getTenantId(),
				YorosisConstants.YES);
		if (yoroGroupUsers == 0) {
			YoroGroups yoroGroups = yoroGroupsRepository.findByIdAndTenantIdAndActiveFlagIgnoreCase(
					UUID.fromString(DEFAULT_GROUP_ID), YorosisContext.get().getTenantId(), YorosisConstants.YES);
			if (yoroGroups != null) {
				Timestamp timestamp = new Timestamp(System.currentTimeMillis());
				YoroGroupsUsers yoroGroupUser = YoroGroupsUsers.builder().activeFlag(YorosisConstants.YES)
						.tenantId(YorosisContext.get().getTenantId()).createdBy(YorosisContext.get().getUserName())
						.createdOn(timestamp).users(user).yoroGroups(yoroGroups)
						.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp).build();
				yoroGroupsUsersRepository.save(yoroGroupUser);
			}
		}
	}

	private void associateRolesWithUser(Users user) {
		AuthMethods authMethods = authMethodRepository.findByProviderName("Sign in with Google", YorosisConstants.YES,
				YorosisContext.get().getTenantId());
		List<UUID> associateRolesList = authAssociateRolesRepository.getAuthAssociateRolesListBasedOnAuthMethod(
				authMethods.getId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (associateRolesList != null && !associateRolesList.isEmpty()) {
			List<Roles> yoroRolesList = userRolesRepository.getGroupList(associateRolesList,
					YorosisContext.get().getTenantId(), YorosisConstants.YES);
			if (yoroRolesList != null && !yoroRolesList.isEmpty()) {
				Timestamp timestamp = new Timestamp(System.currentTimeMillis());
				for (Roles yoroRoles : yoroRolesList) {
					UserAssociateRoles roles = UserAssociateRoles.builder().activeFlag(YorosisConstants.YES)
							.tenantId(YorosisContext.get().getTenantId()).createdBy(YorosisContext.get().getUserName())
							.createdOn(timestamp).users(user).roles(yoroRoles)
							.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp).build();
					userAssociateRolesRepository.save(roles);
				}
			}
		} else {
			Roles userRole = userRolesRepository.findByRoleIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
					UUID.fromString(DEFAULT_ROLE_ID), YorosisContext.get().getTenantId(), YorosisConstants.YES);
			if (userRole != null) {
				Timestamp timestamp = new Timestamp(System.currentTimeMillis());
				UserAssociateRoles roles = UserAssociateRoles.builder().activeFlag(YorosisConstants.YES)
						.tenantId(YorosisContext.get().getTenantId()).createdBy(YorosisContext.get().getUserName())
						.createdOn(timestamp).users(user).roles(userRole).modifiedBy(YorosisContext.get().getUserName())
						.modifiedOn(timestamp).build();
				userAssociateRolesRepository.save(roles);

			}
		}

	}

	private void addDefaultRole(Users user) {
		int userAssociateRolesCount = userAssociateRolesRepository.getUserAssociateRolesBasedOnUserAndRoleId(
				UUID.fromString(DEFAULT_ROLE_ID), user.getUserId(), YorosisContext.get().getTenantId(),
				YorosisConstants.YES);
		if (userAssociateRolesCount == 0) {
			Roles userRole = userRolesRepository.findByRoleIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
					UUID.fromString(DEFAULT_ROLE_ID), YorosisContext.get().getTenantId(), YorosisConstants.YES);
			if (userRole != null) {
				Timestamp timestamp = new Timestamp(System.currentTimeMillis());
				UserAssociateRoles roles = UserAssociateRoles.builder().activeFlag(YorosisConstants.YES)
						.tenantId(YorosisContext.get().getTenantId()).createdBy(YorosisContext.get().getUserName())
						.createdOn(timestamp).users(user).roles(userRole).modifiedBy(YorosisContext.get().getUserName())
						.modifiedOn(timestamp).build();
				userAssociateRolesRepository.save(roles);
			}
		}
	}

}
