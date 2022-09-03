package com.yorosis.yoroflow.creation.service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import com.yorosis.yoroapps.entities.AuthAssociateGroups;
import com.yorosis.yoroapps.entities.AuthAssociateRoles;
import com.yorosis.yoroapps.entities.AuthMethods;
import com.yorosis.yoroapps.vo.AllowAuthentication;
import com.yorosis.yoroapps.vo.AuthenticationArray;
import com.yorosis.yoroapps.vo.LicenseVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.AuthAssociateGroupsRepository;
import com.yorosis.yoroflow.creation.repository.AuthAssociateRolesRepository;
import com.yorosis.yoroflow.creation.repository.AuthMethodRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class AuthMethodService {

	@Autowired
	private AuthMethodRepository authMethodRepository;

	@Autowired
	private AuthAssociateGroupsRepository authAssociateGroupsRepository;

	@Autowired
	private AuthAssociateRolesRepository authAssociateRolesRepository;

	@Autowired
	private ProxyService proxyService;

	@Autowired
	private OrgAzureConfigService orgAzureConfigService;

	private AuthMethods construcVOtoDTO(AuthenticationArray authenticationArray) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return AuthMethods.builder().providerName(authenticationArray.getAuthProvider())
				.allowedDomainNames(domainNames(authenticationArray)).modifiedBy(YorosisContext.get().getUserName())
				.modifiedOn(timestamp).createdBy(YorosisContext.get().getUserName()).createdOn(timestamp)
				.tenantId(YorosisContext.get().getTenantId()).activeFlag(setActiveFlag(authenticationArray)).build();
	}

	private AuthAssociateGroups constructAssociateGroupVOtoDTO(AuthMethods authMethods, UUID groupId) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return AuthAssociateGroups.builder().id(UUID.randomUUID()).authMethods(authMethods).groupId(groupId)
				.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp)
				.createdBy(YorosisContext.get().getUserName()).createdOn(timestamp)
				.tenantId(YorosisContext.get().getTenantId()).activeFlag(YoroappsConstants.YES).build();
	}

	private AuthAssociateRoles constructAssociateRolesVOtoDTO(AuthMethods authMethods, UUID roleId) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return AuthAssociateRoles.builder().id(UUID.randomUUID()).authMethods(authMethods).roleId(roleId)
				.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp)
				.createdBy(YorosisContext.get().getUserName()).createdOn(timestamp)
				.tenantId(YorosisContext.get().getTenantId()).activeFlag(YoroappsConstants.YES).build();
	}

	private AuthenticationArray construcDTOtoVO(AuthMethods authMethods) {
		return AuthenticationArray.builder().id(authMethods.getId()).authProvider(authMethods.getProviderName())
				.isAuthProvider(getAuthProvider(authMethods)).selectDomainType(setDomainType(authMethods))
				.allowedDomain(setAllowedDomainNames(authMethods))
				.associateGroups(getGroupAssociateUuidList(authMethods))
				.associateRoles(getRoleAssociateUuidList(authMethods)).build();
	}

	@Transactional
	public List<UUID> getGroupAssociateUuidList(AuthMethods authMethods) {
		List<UUID> uuidList = new ArrayList<>();
		List<AuthAssociateGroups> associateGroupList = authAssociateGroupsRepository
				.getAccosiateGroupListBasedOnAuthMethod(authMethods.getId(), YorosisContext.get().getTenantId(),
						YoroappsConstants.YES);
		if (!associateGroupList.isEmpty()) {
			for (AuthAssociateGroups authAssociateGroups : associateGroupList) {
				uuidList.add(authAssociateGroups.getGroupId());
			}
		}
		return uuidList;
	}

	@Transactional
	public List<UUID> getRoleAssociateUuidList(AuthMethods authMethods) {
		List<UUID> uuidList = new ArrayList<>();
		List<AuthAssociateRoles> authAssociateRolesList = authAssociateRolesRepository
				.getAuthAssociateRolesListBasedOnAuthMethod(authMethods.getId(), YorosisContext.get().getTenantId(),
						YoroappsConstants.YES);
		if (!authAssociateRolesList.isEmpty()) {
			for (AuthAssociateRoles authAssociateRoles : authAssociateRolesList) {
				uuidList.add(authAssociateRoles.getRoleId());
			}
		}
		return uuidList;
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO saveAuthMethods(AllowAuthentication allowAuthentication) {
		ResponseStringVO response = null;
		for (AuthenticationArray authenticationArray : allowAuthentication.getAuthenticationArray()) {
			if (authenticationArray.getId() == null) {
				AuthMethods authMethods = construcVOtoDTO(authenticationArray);
				authMethods = authMethodRepository.save(authMethods);
				saveAuthAssociateGroups(authenticationArray, authMethods);
				saveAuthAssociateRoles(authenticationArray, authMethods);
				if (StringUtils.equalsAnyIgnoreCase(authenticationArray.getAuthProvider(), "Sign in with Microsoft Azure")) {
					orgAzureConfigService.saveAzureMethods(authenticationArray, authMethods);
				}
				response = ResponseStringVO.builder().response("Authentication Methods are saved").build();
			} else {
				AuthMethods authMethods = authMethodRepository.getOne(authenticationArray.getId());

				Timestamp timestamp = new Timestamp(System.currentTimeMillis());
				authMethods.setModifiedBy(YorosisContext.get().getUserName());
				authMethods.setModifiedOn(timestamp);
				authMethods.setProviderName(authenticationArray.getAuthProvider());
				authMethods.setActiveFlag(setActiveFlag(authenticationArray));
				authMethods.setAllowedDomainNames(domainNames(authenticationArray));
				authMethodRepository.save(authMethods);
				if (StringUtils.equalsAnyIgnoreCase(authenticationArray.getAuthProvider(), "Sign in with Microsoft Azure")) {
					orgAzureConfigService.saveAzureMethods(authenticationArray, authMethods);
				}
				saveAuthAssociateGroups(authenticationArray, authMethods);
				saveAuthAssociateRoles(authenticationArray, authMethods);
				response = ResponseStringVO.builder().response("Authentication Methods are updated").build();
			}
		}

		return response;
	}

	@Transactional
	public ResponseStringVO saveAuthMethodsFromDefaultSchema(AllowAuthentication allowAuthentication) {
		ResponseStringVO response = null;
		for (AuthenticationArray authenticationArray : allowAuthentication.getAuthenticationArray()) {
			if (authenticationArray.getId() == null) {
				AuthMethods authMethods = construcVOtoDTO(authenticationArray);
				authMethods = authMethodRepository.save(authMethods);
				saveAuthAssociateGroups(authenticationArray, authMethods);
				saveAuthAssociateRoles(authenticationArray, authMethods);
				if (StringUtils.equalsAnyIgnoreCase(authenticationArray.getAuthProvider(), "Sign in with Microsoft Azure")) {
					orgAzureConfigService.saveAzureMethods(authenticationArray, authMethods);
				}
				response = ResponseStringVO.builder().response("Authentication Methods are saved").build();
			} else {
				AuthMethods authMethods = authMethodRepository.getOne(authenticationArray.getId());
				if (!StringUtils.equals(authMethods.getProviderName(), "Yoroflow sign in")) {
					Timestamp timestamp = new Timestamp(System.currentTimeMillis());
					authMethods.setModifiedBy(YorosisContext.get().getUserName());
					authMethods.setModifiedOn(timestamp);
					authMethods.setProviderName(authenticationArray.getAuthProvider());
					authMethods.setActiveFlag(setActiveFlag(authenticationArray));
					authMethods.setAllowedDomainNames(domainNames(authenticationArray));
					authMethodRepository.save(authMethods);
					if (StringUtils.equalsAnyIgnoreCase(authenticationArray.getAuthProvider(), "Sign in with Microsoft Azure")) {
						orgAzureConfigService.saveAzureMethods(authenticationArray, authMethods);
					}
					saveAuthAssociateGroups(authenticationArray, authMethods);
					saveAuthAssociateRoles(authenticationArray, authMethods);
					response = ResponseStringVO.builder().response("Authentication Methods are updated").build();
				}
			}
		}

		return response;
	}

	@Transactional
	public void saveAuthAssociateGroups(AuthenticationArray authenticationArray, AuthMethods authMethods) {
		if (authMethods.getId() != null) {
			List<AuthAssociateGroups> associateGroupList = authAssociateGroupsRepository
					.getAccosiateGroupListBasedOnAuthMethod(authMethods.getId(), YorosisContext.get().getTenantId(),
							YoroappsConstants.YES);
			if (!associateGroupList.isEmpty()) {
				authAssociateGroupsRepository.deleteAll(associateGroupList);
			}

			if (authenticationArray.getAssociateGroups() != null) {
				for (UUID groupId : authenticationArray.getAssociateGroups()) {
					authAssociateGroupsRepository.save(constructAssociateGroupVOtoDTO(authMethods, groupId));
				}
			}
		}
	}

	@Transactional
	public void saveAuthAssociateRoles(AuthenticationArray authenticationArray, AuthMethods authMethods) {
		if (authMethods.getId() != null) {
			List<AuthAssociateRoles> associateRolesList = authAssociateRolesRepository
					.getAuthAssociateRolesListBasedOnAuthMethod(authMethods.getId(), YorosisContext.get().getTenantId(),
							YoroappsConstants.YES);
			if (!associateRolesList.isEmpty()) {
				authAssociateRolesRepository.deleteAll(associateRolesList);
			}

			if (authenticationArray.getAssociateRoles() != null) {
				for (UUID roleId : authenticationArray.getAssociateRoles()) {
					authAssociateRolesRepository.save(constructAssociateRolesVOtoDTO(authMethods, roleId));
				}
			}
		}
	}

	@Transactional
	public AllowAuthentication getAuthMethodForOrg(String subdomain) {
		List<AuthenticationArray> list = new ArrayList<>();
		List<AuthMethods> authMethodsList = authMethodRepository.findAll();

		constructAuthMethods(authMethodsList, list);

		return AllowAuthentication.builder().authenticationArray(list).subdomainName(subdomain).build();
	}
	
	private void constructAuthMethods(List<AuthMethods> authMethodsList, List<AuthenticationArray> list) {
		if (authMethodsList != null) {
		for (AuthMethods AuthMethods : authMethodsList) {
			AuthenticationArray authenticationArray = construcDTOtoVO(AuthMethods);
			if (StringUtils.equals(authenticationArray.getAuthProvider(), "Sign in with Microsoft Azure")) {
				orgAzureConfigService.getAzureMethods(authenticationArray);
			}
			list.add(authenticationArray);
		}
		}
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public AllowAuthentication getAuthMethod(String subdomain) {
		List<AuthenticationArray> list = new ArrayList<>();
		List<AuthMethods> authMethodsList = authMethodRepository.findAll();

		constructAuthMethods(authMethodsList, list);

		return AllowAuthentication.builder().authenticationArray(list).subdomainName(subdomain).build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public boolean checkGoogleUser() {
		AuthMethods authMethods = authMethodRepository.findByProviderName("Sign in with Google", YoroappsConstants.YES,
				YorosisContext.get().getTenantId());
		if (authMethods != null) {
			return true;
		} else {
			return false;
		}
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO checkMicrosoftUser(ResponseStringVO vo) {
		AuthMethods authMethods = authMethodRepository.findByProviderName("Sign in with Microsoft",
				YoroappsConstants.YES, YorosisContext.get().getTenantId());
		if(authMethods != null) {
			vo.setMicrosoft(true);
			return vo;
		} else {
			authMethods = authMethodRepository.findByProviderName("Sign in with Microsoft Azure",
					YoroappsConstants.YES, YorosisContext.get().getTenantId());
			if (authMethods != null) {
				vo.setMicrosoft(true);
				vo.setAzure(true);
				orgAzureConfigService.getAzureClient(authMethods.getId(), vo);
				return vo;
			}
		}
		vo.setMicrosoft(false);
		return vo;
	}

	private String setActiveFlag(AuthenticationArray authenticationArray) {
		return (authenticationArray != null && authenticationArray.getIsAuthProvider()) ? YoroappsConstants.YES
				: YoroappsConstants.NO;

	}

	private Boolean getAuthProvider(AuthMethods authMethods) {
		return StringUtils.equals(authMethods.getActiveFlag(), YoroappsConstants.YES);
	}

	private String setDomainType(AuthMethods authMethods) {
		if (!StringUtils.isEmpty(authMethods.getAllowedDomainNames())
				&& (!StringUtils.equals(authMethods.getAllowedDomainNames(), "all"))) {
			return "specific";
		} else {
			return "all";
		}
	}

	private List<String> setAllowedDomainNames(AuthMethods authMethods) {
		List<String> allowdDomains = new ArrayList<>();
		if (StringUtils.equals(authMethods.getActiveFlag(), YoroappsConstants.YES)) {
			if (!StringUtils.isEmpty(authMethods.getAllowedDomainNames())
					&& (!StringUtils.equals(authMethods.getAllowedDomainNames(), "all"))) {
				allowdDomains = Arrays.asList(authMethods.getAllowedDomainNames().split(","));
			}
		}
		return allowdDomains;
	}

	private String domainNames(AuthenticationArray authenticationArray) {
		StringBuilder domainName = new StringBuilder();
		if (authenticationArray != null && authenticationArray.getIsAuthProvider()) {
			if (!CollectionUtils.isEmpty(authenticationArray.getAllowedDomain())
					&& StringUtils.equals(authenticationArray.getSelectDomainType(), "specific"))
				for (String name : authenticationArray.getAllowedDomain()) {
					if (domainName.length() > 0) {
						domainName.append(",");
					}
					domainName.append(name);
				}
			else if (StringUtils.equals(authenticationArray.getSelectDomainType(), "all")) {
				domainName.append("all");
			}
		}

		return domainName.toString();
	}

	public ResponseStringVO isAllowed() {
		String currentTenantId = YorosisContext.get().getTenantId();

		LicenseVO licenseVO = proxyService.isAllowed(currentTenantId, "form_page_builder", "two_factor_authentication");

		if (StringUtils.equalsIgnoreCase(licenseVO.getIsAllowed(), YoroappsConstants.YES)) {
			return ResponseStringVO.builder().response("its allowed").build();
		}
		return ResponseStringVO.builder().response("You don't have sufficient plan to access this page").build();
	}
}
