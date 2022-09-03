package com.yorosis.authnz.service;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

import org.apache.commons.lang3.StringUtils;
import org.jasypt.encryption.StringEncryptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.github.scribejava.apis.MicrosoftAzureActiveDirectory20Api;
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
import com.yorosis.authnz.repository.OrgAzureConfigRepository;
import com.yorosis.authnz.repository.UserAssociateRolesRepository;
import com.yorosis.authnz.repository.UserRolesRepository;
import com.yorosis.authnz.repository.UsersRepository;
import com.yorosis.authnz.repository.YoroGroupsRepository;
import com.yorosis.authnz.repository.YoroGroupsUsersRepository;
import com.yorosis.authnz.repository.YoroflowSettingsRepository;
import com.yorosis.authnz.vo.AzureGroupVo;
import com.yorosis.authnz.vo.AzureVO;
import com.yorosis.yoroapps.entities.AuthMethods;
import com.yorosis.yoroapps.entities.Customers;
import com.yorosis.yoroapps.entities.OrganizationAzureConfig;
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

import kong.unirest.GetRequest;
import kong.unirest.Unirest;

@Service
public class MicrosoftAuthService {

	private static final String SIGN_IN_WITH_MICROSOFT = "Sign in with Microsoft";
	private static final String SIGN_IN_WITH_MICROSOFT_AZURE = "Sign in with Microsoft Azure";

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
	private OrgAzureConfigRepository orgAzureConfigRepository;

	@Autowired
	@Qualifier("jasyptEncryptor")
	private StringEncryptor jasyptEncryptor;

	@Autowired
	private TermsAndConditionsService termsAndConditionsService;

	@Autowired
	ObjectMapper mapper = new ObjectMapper();

	private static final String PROTECTED_RESOURCE_URL = "https://graph.microsoft.com/v1.0/me";
	private static final String DEFAULT_GROUP_ID = "7eda9d01-6ea7-4c1e-9201-2eda3fc2b080";
	private static final String DEFAULT_ROLE_ID = "0af6950d-f073-4553-a557-4a1e59a20f2f";
	private static final String DEFAULT_WORKSPACE = "6a6ad5ca-5a59-4165-84fc-675c5c503fdf";
	private static final String GET_AZURE_GROUP_URL = "https://graph.microsoft.com/v1.0/me/memberOf";

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public AuthVo microsoftService(AuthVo authVo, Response response) throws IOException {
		ObjectMapper mapper = new ObjectMapper();
		JsonNode actualObj = mapper.readTree(response.getBody());
		if (canAllowDomain(actualObj)) {
			if (authVo.isSilentToken() == true) {
				authVo.setValidUser(true);
				return authVo;
			}
			setupFirstUser(actualObj, authVo);
			authVo.setValidUser(true);
			return authVo;
		} else {
			authVo.setEmail("invalid");
			return authVo;
		}
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public AuthVo microsoftServiceByAzure(AuthVo authVo) throws IOException, InterruptedException, ExecutionException {
		AuthMethods authMethods = authMethodRepository.findByProviderName(SIGN_IN_WITH_MICROSOFT_AZURE,
				YorosisConstants.YES, YorosisContext.get().getTenantId());
		if (authMethods != null) {
			Response response = checkAzure(authMethods.getId(), authVo.getTokenId());
			if (response != null && response.isSuccessful()) {
				ObjectMapper mapper = new ObjectMapper();
				JsonNode actualObj = mapper.readTree(response.getBody());
				if (checkGroup(authMethods, authVo.getTokenId())) {
					if (authVo.isSilentToken()) {
						authVo.setValidUser(true);
						return authVo;
					}
					
					setupFirstUser(actualObj, authVo);
					authVo.setValidUser(true);
					return authVo;
				} else {
					authVo.setEmail("invalid");
					return authVo;
				}
			}
		}
		authVo.setEmail("invalid");
		return authVo;
	}

	public boolean checkGroup(AuthMethods authMethods, String token) {
		OrganizationAzureConfig organizationAzureConfig = orgAzureConfigRepository
				.findByIdAndactiveFlag(authMethods.getId(), YorosisConstants.YES, YorosisContext.get().getTenantId());
		if (organizationAzureConfig != null) {
			if (StringUtils.isBlank(organizationAzureConfig.getAzureAllowedGroup())
					|| StringUtils.equals(organizationAzureConfig.getAzureAllowedGroup(), "all")) {
				return true;
			} else {
				AzureGroupVo azureGroupVo = getAzureGroup(token);
				if (azureGroupVo != null && azureGroupVo.getValue() != null) {
					boolean groupFound = false;
					List<String> allowedGroupNamesList = Arrays
							.asList(organizationAzureConfig.getAzureAllowedGroup().toLowerCase().split(","));
					for (AzureVO a : azureGroupVo.getValue()) {
						if (allowedGroupNamesList.contains(a.getDisplayName().toLowerCase()))
							groupFound = true;
					}
					return groupFound;
				}
			}
		}
		return false;
	}

	public Response checkAzure(UUID authId, String token) throws InterruptedException, ExecutionException, IOException {
		String authClientId = null;
		String authClientSecret = null;
		OrganizationAzureConfig organizationAzureConfig = orgAzureConfigRepository.findByIdAndactiveFlag(authId,
				YorosisConstants.YES, YorosisContext.get().getTenantId());
		if (organizationAzureConfig != null) {
			authClientId = organizationAzureConfig.getAzureClientId();
			authClientSecret = organizationAzureConfig.getAzureSecretId();
			return setAuthenticate(authClientId, authClientSecret, token);
		}
		return null;
	}

	@Transactional
	public AuthDetailsVO validateUserByAzure(AuthDetailsVO authDetailsVO, UsersVO usersVO)
			throws IOException, InterruptedException, ExecutionException {
		if (StringUtils.isNotBlank(usersVO.getTokenId())) {
			String tokenId = jasyptEncryptor.decrypt(usersVO.getTokenId());
			AuthMethods authMethods = authMethodRepository.findByProviderName(SIGN_IN_WITH_MICROSOFT_AZURE,
					YorosisConstants.YES, YorosisContext.get().getTenantId());
			if (authMethods != null) {
				Response response = checkAzure(authMethods.getId(), tokenId);
				if (response.isSuccessful() && checkGroup(authMethods, tokenId)) {
					authDetailsVO.setAuthenticated(true);
				}
			}
		}
		return authDetailsVO;
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public AuthDetailsVO validateUser(AuthDetailsVO authDetailsVO, UsersVO usersVO)
			throws IOException, InterruptedException, ExecutionException {
		if (StringUtils.isNotBlank(usersVO.getTokenId())) {
			String tokenId = jasyptEncryptor.decrypt(usersVO.getTokenId());
			String clientId = yoroflowSettingsRepository.findByKeyName("microsoft_client_id");
			String clientSecret = yoroflowSettingsRepository.findByKeyName("microsoft_client_secret");
			Response response = setAuthenticate(clientId, clientSecret, tokenId);
			if (response.isSuccessful()) {
				authDetailsVO.setAuthenticated(true);
			}
		}
		return authDetailsVO;
	}

	public AzureGroupVo getAzureGroup(String token) {
		GetRequest getRequest = Unirest.get(GET_AZURE_GROUP_URL);
		getRequest.headers(getHeaderMap(token));
		try {
			JsonNode data = mapper.readTree(getRequest.asJson().getBody().toPrettyString());
			return mapper.treeToValue(data, AzureGroupVo.class);
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}

	private Map<String, String> getHeaderMap(String token) {
		Map<String, String> hdrMap = new HashMap<>();
		hdrMap.put("Accept", "application/json");
		hdrMap.put("Authorization", "Bearer " + token);
		
		return hdrMap;
	}

	private Response setAuthenticate(String authClientId, String authSecret, String tokenId)
			throws InterruptedException, ExecutionException, IOException {
		final String clientId = (StringUtils.isEmpty(authClientId) ? null : jasyptEncryptor.decrypt(authClientId));
		final String clientSecret = (StringUtils.isEmpty(authSecret) ? null : jasyptEncryptor.decrypt(authSecret));
		final OAuth20Service service = new ServiceBuilder(clientId).apiSecret(clientSecret)
				.defaultScope("openid User.Read").callback("http://www.example.com/oauth_callback/")
				.build(MicrosoftAzureActiveDirectory20Api.instance());
		OAuthRequest request = new OAuthRequest(Verb.GET, PROTECTED_RESOURCE_URL);
		service.signRequest(tokenId, request);
		return service.execute(request);
	}

	@Transactional
	public Response verifyMicrosoftServiceInit(AuthVo authVo)
			throws IOException, InterruptedException, ExecutionException {
//		String id = "ea0e7f19-334e-42a0-be77-120ad6619853";
//		String clientIds = jasyptEncryptor.encrypt(id);
//		String idv = "NF7C6ZTzaURe6-1cG66x.sZ-MK~8ih.eaU";
//		String clientIdsv = jasyptEncryptor.encrypt(idv);
		String authClientId = null;
		String authClientSecret = null;
		if (StringUtils.equals(authVo.getLoginType(), "azure")) {
			OrganizationAzureConfig organizationAzureConfig = orgAzureConfigRepository.findByIdAndactiveFlag(
					authVo.getAuthMethodId(), YorosisConstants.YES, YorosisContext.get().getTenantId());
			if (organizationAzureConfig != null) {
				authClientId = organizationAzureConfig.getAzureClientId();
				authClientSecret = organizationAzureConfig.getAzureSecretId();
			}
		} else {
			authClientId = yoroflowSettingsRepository.findByKeyName("microsoft_client_id");
			authClientSecret = yoroflowSettingsRepository.findByKeyName("microsoft_client_secret");
		}
		final String clientId = (StringUtils.isEmpty(authClientId) ? null : jasyptEncryptor.decrypt(authClientId));
		final String clientSecret = (StringUtils.isEmpty(authClientSecret) ? null
				: jasyptEncryptor.decrypt(authClientSecret));
		final OAuth20Service service = new ServiceBuilder(clientId).apiSecret(clientSecret)
				.defaultScope("openid User.Read").callback("http://www.example.com/oauth_callback/")
				.build(MicrosoftAzureActiveDirectory20Api.instance());
		OAuthRequest request = new OAuthRequest(Verb.GET, PROTECTED_RESOURCE_URL);
		service.signRequest(authVo.getTokenId(), request);
		return service.execute(request);
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public AuthToken signInByMicrosoft(SigninUserVO userVo) throws YorosisException {
//		&& verifyMicrosoftService(GoogleAuthVo.builder().tokenId(userVo.getPassword()).build())
//		.isSuccessful()
		if (StringUtils.isNotBlank(userVo.getUsername())) {
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

	private boolean canAllowDomain(JsonNode actualObj) {
		AuthMethods authMethods = authMethodRepository.findByProviderName(SIGN_IN_WITH_MICROSOFT,
				YorosisConstants.YES, YorosisContext.get().getTenantId());

		if (authMethods != null) {
			if (StringUtils.equalsIgnoreCase(authMethods.getAllowedDomainNames(), "all")) {
				return true;
			}
			
			String email = null;
			if (actualObj.has("mail") && actualObj.get("mail") != null) {
				email = actualObj.get("mail").asText();
			}
			
			if (StringUtils.isBlank(email) || StringUtils.equalsIgnoreCase(email, "null") && actualObj.has("userPrincipalName")) {
				email = actualObj.get("userPrincipalName").asText();
			}
			
			if (StringUtils.isNotBlank(email) && !StringUtils.equalsIgnoreCase(email, "null")) {
				String[] splitString = email.split("@");
				String emailDomain = splitString[1];
				List<String> allowedDomainNamesList = Arrays.asList(authMethods.getAllowedDomainNames().split(","));
				if (allowedDomainNamesList.contains(emailDomain)) {
					return true;
				}
			}
		}
		
		return false;
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public UUID setupFirstUser(JsonNode actualObj, AuthVo authVo) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());

		Users users = userRepository.findByEmailIdAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(
				actualObj.get("userPrincipalName").asText(), YorosisConstants.YES, YorosisContext.get().getTenantId());
		if (users == null) {
			Users user = Users.builder().emailId(actualObj.get("userPrincipalName").asText())
					.firstName(getFirstAndLastName(actualObj, "givenName"))
					.lastName(getFirstAndLastName(actualObj, "surname")).tenantId(YorosisContext.get().getTenantId())
					.userName(actualObj.get("userPrincipalName").asText())
					.authType(StringUtils.equalsIgnoreCase(authVo.getLoginType(), "azure") ? "Microsoft Azure" : "Microsoft")
					.authToken((StringUtils.isEmpty(authVo.getTokenId())) ? null
							: jasyptEncryptor.encrypt(authVo.getTokenId()))
					.mobileNumber(actualObj.has("mobilePhone") && !actualObj.get("mobilePhone").isNull()
							? actualObj.get("mobilePhone").asText()
							: null)
					.createdBy(YorosisContext.get().getUserName()).createdOn(timestamp).lastLogin(timestamp)
					.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp).profilePicture(null)
					.activeFlag(YorosisConstants.YES).contactEmailId(actualObj.get("userPrincipalName").asText())
					.defaultWorkspace(UUID.fromString(DEFAULT_WORKSPACE)).additionalSettings(getFontSize())
					.color("#1b5e20").defaultLanguage("en").build();
			
			userRepository.save(user);
			
			associateGroupWithUser(user);
			associateRolesWithUser(user);
			
			return user.getUserId();
		} else {
			users.setModifiedBy(YorosisContext.get().getUserName());
			users.setModifiedOn(timestamp);
			users.setAuthType(StringUtils.equalsIgnoreCase(authVo.getLoginType(), "azure") ? "Microsoft Azure" : "Microsoft");
			users.setFirstName(getFirstAndLastName(actualObj, "givenName"));
			users.setLastName(getFirstAndLastName(actualObj, "surname"));
			users.setMobileNumber(actualObj.has("mobilePhone") && !actualObj.get("mobilePhone").isNull()
					? actualObj.get("mobilePhone").asText()
					: null);
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

	private String getFirstAndLastName(JsonNode actualObj, String name) {
		if (actualObj.has("userPrincipalName") && actualObj.has(name) && !actualObj.get(name).isNull()) {
			return actualObj.get(name).asText();
		} else {
			return actualObj.get("userPrincipalName").asText().split("@")[0];
		}
	}

	private void associateGroupWithUser(Users user) {
		var provider = SIGN_IN_WITH_MICROSOFT;
		if (StringUtils.containsIgnoreCase(user.getAuthType(), "azure")) {
			provider = SIGN_IN_WITH_MICROSOFT_AZURE;
		}
		AuthMethods authMethods = authMethodRepository.findByProviderName(provider,
				YorosisConstants.YES, YorosisContext.get().getTenantId());
		
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
		var provider = SIGN_IN_WITH_MICROSOFT;
		if (StringUtils.containsIgnoreCase(user.getAuthType(), "azure")) {
			provider = SIGN_IN_WITH_MICROSOFT_AZURE;
		}
		AuthMethods authMethods = authMethodRepository.findByProviderName(provider,
				YorosisConstants.YES, YorosisContext.get().getTenantId());
		
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
