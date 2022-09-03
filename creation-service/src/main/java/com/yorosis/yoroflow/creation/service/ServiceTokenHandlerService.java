package com.yorosis.yoroflow.creation.service;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import javax.crypto.KeyGenerator;

import org.apache.commons.lang3.StringUtils;
import org.jasypt.encryption.StringEncryptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroapps.entities.Page;
import com.yorosis.yoroapps.entities.ServiceToken;
import com.yorosis.yoroapps.entities.UserPermission;
import com.yorosis.yoroapps.entities.Users;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.ServiceTokenVO;
import com.yorosis.yoroapps.vo.ServiceTokenVO.ServiceTokenVOBuilder;
import com.yorosis.yoroapps.vo.UserPermissionVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.PageRepository;
import com.yorosis.yoroflow.creation.repository.ServiceTokenRepository;
import com.yorosis.yoroflow.creation.repository.UserPermissionRepository;
import com.yorosis.yoroflow.creation.repository.UsersRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ServiceTokenHandlerService {

	@Autowired
	private ServiceTokenRepository serviceTokenRepository;

	@Autowired
	private UserPermissionRepository userPermissionRepository;

	@Autowired
	private PageRepository pageRepository;

	@Autowired
	private UsersRepository usersRepository;

	@Autowired
	private StringEncryptor jasyptEncryptor;

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void createServiceToken(UUID userId) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		LocalDateTime localDateTime = LocalDateTime.now().plusYears(1);
		Timestamp expiryDate = Timestamp.valueOf(localDateTime);
		String secretKey = generateSecretKey();
		ServiceToken serviceToken = ServiceToken.builder().apiKey(generateApiKey()).apiName("Admin API Key").expiresOn(expiryDate)
				.secretKey((secretKey != null) ? jasyptEncryptor.encrypt(secretKey) : null).createdBy(YorosisContext.get().getUserName()).createdOn(timestamp)
				.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp).activeFlag(YoroappsConstants.YES).internal(YoroappsConstants.YES)
				.tenantId(YorosisContext.get().getTenantId()).build();

		Users user = usersRepository.findByUserId(userId);
		serviceToken.setUsers(user);
		serviceTokenRepository.save(serviceToken);
		List<Page> pages = pageRepository.getAllPageNames(user.getTenantId(), YoroappsConstants.YES);
		if (pages != null && !pages.isEmpty()) {
			for (Page page : pages) {
				if (page.getPagePermissions() != null && !page.getPagePermissions().isEmpty()) {

					UserPermission userPermission = new UserPermission();
					userPermission.setServiceToken(serviceToken);
					userPermission.setPageId(page.getPageId());
					userPermission.setPageName(page.getPageName());
					userPermission.setReadAllowed(YoroappsConstants.YES);
					userPermission.setVersion(page.getVersion());
					userPermission.setActiveFlag(YoroappsConstants.YES);
					userPermission.setCreatedBy(user.getUserName());

					userPermission.setCreatedOn(timestamp);
					userPermission.setModifiedOn(timestamp);
					userPermission.setModifiedBy(user.getUserName());
					userPermissionRepository.save(userPermission);

				}
			}
		}

	}

	@Transactional
	public ResponseStringVO generateSecretKey(UUID userId, String apiKey) {
		ServiceToken serviceToken = serviceTokenRepository.getServiceTokenByUserIdAndApiKey(userId, apiKey);
		String secretKey = generateSecretKey();
		serviceToken.setSecretKey((secretKey != null) ? jasyptEncryptor.encrypt(secretKey) : null);
		serviceTokenRepository.save(serviceToken);
		return ResponseStringVO.builder().response((!StringUtils.isEmpty(secretKey)) ? secretKey : "Could not generate secret key").build();
	}

	@Transactional
	public ServiceTokenVO loadServiceTokenByServiceTokenIdAndUserId(UUID userId, UUID serviceTokenId) throws IOException {
		ServiceToken serviceToken = serviceTokenRepository.getServiceTokenByIdAndUserId(serviceTokenId, userId, YoroappsConstants.YES);
		if (serviceToken != null) {
			return constructServiceTokenDTOToVO(serviceToken);
		}
		return null;
	}

	@Transactional
	public List<ServiceTokenVO> loadServiceTokensByUserId(UUID userId) throws IOException {
		List<ServiceToken> serviceTokens = serviceTokenRepository.getServiceTokensByUserId(userId, YoroappsConstants.YES);
		List<ServiceTokenVO> serviceTokenVOs = new ArrayList<>();
		for (ServiceToken serviceToken : serviceTokens) {
			serviceTokenVOs.add(constructServiceTokenDTOToVO(serviceToken));
		}
		return serviceTokenVOs;
	}

	private void saveUserPermission(UserPermissionVO userPermissionVO, ServiceToken serviceToken) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		// if (userPermissionVO.getId() == null) {
		UserPermission userPermission = constructUserPermissionVOToDTO(userPermissionVO);
		userPermission.setServiceToken(serviceToken);
		userPermission.setModifiedBy(YorosisContext.get().getUserName());
		userPermission.setModifiedOn(timestamp);
		userPermission.setServiceToken(serviceToken);
		userPermissionRepository.save(userPermission);

	}

	@Transactional
	public ServiceTokenVO saveServiceToken(ServiceTokenVO serviceTokenVO) throws IOException {

		if (serviceTokenVO.getId() == null) {
			ServiceToken serviceToken = constructServiceTokenVOToDTO(serviceTokenVO);
			String secretKey = generateSecretKey();

			serviceToken.setSecretKey((secretKey != null) ? jasyptEncryptor.encrypt(secretKey) : null);
			serviceToken.setApiKey(generateApiKey());
			serviceToken.setUsers(usersRepository.findByUserName(YorosisContext.get().getUserName()));
			serviceTokenRepository.save(serviceToken);
			for (UserPermissionVO userPermissionVO : serviceTokenVO.getPagePermissions()) {
				// UserPermission userPermission = null;
				saveUserPermission(userPermissionVO, serviceToken);

			}
			for (UserPermissionVO userPermissionVO : serviceTokenVO.getWorkflowPermissions()) {
				// UserPermission userPermission = null;
				saveUserPermission(userPermissionVO, serviceToken);

			}
			serviceTokenVO.setSecretKey(secretKey);
			serviceTokenVO.setApiKey(serviceToken.getApiKey());
		} else {

			if (!serviceTokenVO.getDeletedIDList().isEmpty()) {
				Timestamp timestamp = new Timestamp(System.currentTimeMillis());

				for (UUID id : serviceTokenVO.getDeletedIDList()) {
					UserPermission userPermission = userPermissionRepository.getOne(id);
					userPermission.setActiveFlag(YoroappsConstants.NO);
					userPermission.setModifiedBy(YorosisContext.get().getUserName());
					userPermission.setModifiedOn(timestamp);
					userPermissionRepository.save(userPermission);
				}
			}
			for (UserPermissionVO userPermissionVO : serviceTokenVO.getPagePermissions()) {
				Timestamp timestamp = new Timestamp(System.currentTimeMillis());
				UserPermission userPermission = null;

				// if (userPermissionVO.getId() == null) {
				userPermission = constructUserPermissionVOToDTO(userPermissionVO);
				// userPermission.setServiceToken(serviceToken);
				userPermission.setModifiedBy(YorosisContext.get().getUserName());
				userPermission.setModifiedOn(timestamp);

				userPermissionRepository.save(userPermission);

			}
		}
		return serviceTokenVO;
	}

	@Transactional
	public ResponseStringVO updateServiceToken(ServiceTokenVO serviceTokenVO, UUID userId) {

		String message = "User permissions updated successfully";
		ServiceToken serviceToken = serviceTokenRepository.getServiceTokenByUserIdAndApiKey(userId, serviceTokenVO.getApiKey());

		if (serviceToken == null) {
			return ResponseStringVO.builder().response("Invalid API Key").build();
		}

		if (!serviceTokenVO.getDeletedIDList().isEmpty()) {
			Timestamp timestamp = new Timestamp(System.currentTimeMillis());

			for (UUID id : serviceTokenVO.getDeletedIDList()) {
				UserPermission userPermission = userPermissionRepository.getOne(id);
				userPermission.setActiveFlag(YoroappsConstants.NO);
				userPermission.setModifiedBy(YorosisContext.get().getUserName());
				userPermission.setModifiedOn(timestamp);
				userPermissionRepository.save(userPermission);
			}
		}
		for (UserPermissionVO userPermissionVO : serviceTokenVO.getPagePermissions()) {
			Timestamp timestamp = new Timestamp(System.currentTimeMillis());
			UserPermission userPermission = null;

			// if (userPermissionVO.getId() == null) {
			userPermission = constructUserPermissionVOToDTO(userPermissionVO);
			userPermission.setServiceToken(serviceToken);
			userPermission.setModifiedBy(YorosisContext.get().getUserName());
			userPermission.setModifiedOn(timestamp);

			/*
			 * } else {
			 * 
			 * userPermission = userPermissionRepository.getOne(userPermissionVO.getId());
			 * userPermission.setCreateAllowed(booleanToChar(userPermissionVO.
			 * getCreateAllowed()));
			 * userPermission.setReadAllowed(booleanToChar(userPermissionVO.getReadAllowed()
			 * )); userPermission.setDeleteAllowed(booleanToChar(userPermissionVO.
			 * getDeleteAllowed()));
			 * userPermission.setUpdateAllowed(booleanToChar(userPermissionVO.
			 * getUpdateAllowed()));
			 * userPermission.setModifiedBy(YorosisContext.get().getUserName());
			 * userPermission.setModifiedOn(timestamp); }
			 */

			userPermissionRepository.save(userPermission);

		}

		return ResponseStringVO.builder().response(message).build();
	}

	private String generateApiKey() {
		String uuids = new StringBuffer(UUID.randomUUID().toString()).append(UUID.randomUUID().toString()).toString().replace("-", "");
		return (new StringBuilder(YorosisContext.get().getTenantId()).append(".").append(uuids).toString());
	}

	private String generateSecretKey() {
		String secretKey = null;
		try {
			secretKey = KeyGenerator.getInstance("AES").generateKey().getEncoded().toString();
		} catch (NoSuchAlgorithmException e) {
			log.warn("Could not generate secret key ", e);
		}

		return secretKey;
	}

	private ServiceToken constructServiceTokenVOToDTO(ServiceTokenVO serviceTokenVO) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());

		return ServiceToken.builder().id(serviceTokenVO.getId()).apiName(serviceTokenVO.getApiName()).apiKey(serviceTokenVO.getApiKey()).internal("N")

				.activeFlag(YoroappsConstants.YES).createdBy(YorosisContext.get().getUserName()).createdOn(timestamp)
				.expiresOn(Timestamp.valueOf(serviceTokenVO.getExpiresOn())).tenantId(YorosisContext.get().getTenantId())
				.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp).build();
	}

	private UserPermission constructUserPermissionVOToDTO(UserPermissionVO userPermissionVO) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());

		return UserPermission.builder().id(userPermissionVO.getId()).pageId(userPermissionVO.getPageId()).pageName(userPermissionVO.getPageName())
				.workflowKey(userPermissionVO.getWorkflowKey()).workflowName(userPermissionVO.getWorkflowName()).version(userPermissionVO.getVersion())
				.readAllowed((userPermissionVO.getReadAllowed() != null) ? booleanToChar(userPermissionVO.getReadAllowed()) : null)
				.updateAllowed((userPermissionVO.getUpdateAllowed() != null) ? booleanToChar(userPermissionVO.getUpdateAllowed()) : null)
				.publishAllowed((userPermissionVO.getPublishAllowed() != null) ? booleanToChar(userPermissionVO.getPublishAllowed()) : null)
				.launchAllowed((userPermissionVO.getLaunchAllowed() != null) ? booleanToChar(userPermissionVO.getLaunchAllowed()) : null).createdOn(timestamp)
				.activeFlag(YoroappsConstants.YES).createdBy(YorosisContext.get().getUserName())
				.createAllowed((userPermissionVO.getCreateAllowed() != null) ? booleanToChar(userPermissionVO.getCreateAllowed()) : null)
				.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp)

				.deleteAllowed((userPermissionVO.getDeleteAllowed() != null) ? booleanToChar(userPermissionVO.getDeleteAllowed()) : null).build();
	}

	private ServiceTokenVO constructServiceTokenDTOToVO(ServiceToken serviceToken) {
		ServiceTokenVOBuilder serviceTokenVOBuilder = ServiceTokenVO.builder();

		List<UserPermissionVO> pagePermissions = new ArrayList<>();
		List<UserPermissionVO> workflowPermissions = new ArrayList<>();
		for (UserPermission userPermission : serviceToken.getUserPermissions()) {

			if (!StringUtils.isEmpty(userPermission.getPageId())) {
				pagePermissions
						.add(UserPermissionVO.builder().createAllowed(charToBoolean(userPermission.getCreateAllowed())).createdBy(userPermission.getCreatedBy())
								.deleteAllowed((userPermission.getDeleteAllowed() != null) ? charToBoolean(userPermission.getDeleteAllowed()) : null)
								.readAllowed((userPermission.getReadAllowed() != null) ? charToBoolean(userPermission.getReadAllowed()) : null)
								.updateAllowed((userPermission.getUpdateAllowed() != null) ? charToBoolean(userPermission.getUpdateAllowed()) : null)
								.createAllowed((userPermission.getCreateAllowed() != null) ? charToBoolean(userPermission.getCreateAllowed()) : null)
								.pageId(userPermission.getPageId()).pageName(userPermission.getPageName()).workflowKey(userPermission.getWorkflowKey())
								.workflowName(userPermission.getWorkflowName()).version(userPermission.getVersion()).id(userPermission.getId()).build());
			} else {
				workflowPermissions
						.add(UserPermissionVO.builder().createAllowed(charToBoolean(userPermission.getCreateAllowed())).createdBy(userPermission.getCreatedBy())
								.readAllowed((userPermission.getReadAllowed() != null) ? charToBoolean(userPermission.getReadAllowed()) : null)
								.launchAllowed((userPermission.getLaunchAllowed() != null) ? charToBoolean(userPermission.getLaunchAllowed()) : null)
								.updateAllowed((userPermission.getUpdateAllowed() != null) ? charToBoolean(userPermission.getUpdateAllowed()) : null)
								.publishAllowed((userPermission.getPublishAllowed() != null) ? charToBoolean(userPermission.getPublishAllowed()) : null)
								.pageId(userPermission.getPageId()).pageName(userPermission.getPageName()).workflowKey(userPermission.getWorkflowKey())
								.workflowName(userPermission.getWorkflowName()).version(userPermission.getVersion()).id(userPermission.getId()).build());
			}
		}

		return serviceTokenVOBuilder.id(serviceToken.getId()).apiName(serviceToken.getApiName()).apiKey(serviceToken.getApiKey())
				.expiresOn(serviceToken.getExpiresOn().toLocalDateTime()).pagePermissions(pagePermissions).workflowPermissions(workflowPermissions).build();

	}

	private String booleanToChar(boolean value) {
		return value ? YoroappsConstants.YES : YoroappsConstants.NO;
	}

	private boolean charToBoolean(String value) {
		return StringUtils.equalsIgnoreCase(YoroappsConstants.YES, value);
	}

	@Transactional
	public ResponseStringVO deactivateServiceToken(UUID serviceTokenId) {

		ServiceToken serviceToken = serviceTokenRepository.getOne(serviceTokenId);

		if (serviceToken == null) {
			return ResponseStringVO.builder().response("Invalid API key").build();
		}
		serviceToken.setActiveFlag(YoroappsConstants.NO);
		serviceTokenRepository.save(serviceToken);
		if (serviceToken.getUserPermissions() != null && !serviceToken.getUserPermissions().isEmpty()) {
			for (UserPermission userPermission : serviceToken.getUserPermissions()) {
				userPermission.setActiveFlag(YoroappsConstants.NO);
				userPermission.setServiceToken(serviceToken);
				userPermissionRepository.save(userPermission);
			}
		}

		return ResponseStringVO.builder().response("Api key deleted successfully").build();
	}
}
