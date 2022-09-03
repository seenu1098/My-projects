package com.yorosis.yoroflow.creation.service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroapps.entities.ApplicationPermissions;
import com.yorosis.yoroapps.vo.PermissionVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.SecurityVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.ApplicationPermissionsRepository;
import com.yorosis.yoroflow.creation.repository.ApplicationRepository;
import com.yorosis.yoroflow.creation.repository.YoroGroupsRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class ApplicationSecurityService {

	@Autowired
	private ApplicationPermissionsRepository applicationPermissionsRepository;

	@Autowired
	private YoroGroupsRepository yoroGroupsRepository;

	@Autowired
	private ApplicationRepository applicationRepository;

	private ApplicationPermissions constructApplicationPermissionsVOToDTO(PermissionVO appPermissionsVO) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());

		return ApplicationPermissions.builder().tenantId(YorosisContext.get().getTenantId()).readAllowed(booleanToChar(appPermissionsVO.getReadAllowed()))
				.updateAllowed(booleanToChar(appPermissionsVO.getUpdateAllowed())).createdOn(timestamp).activeFlag(YoroappsConstants.YES)
				.createdBy(YorosisContext.get().getUserName()).createAllowed(booleanToChar(appPermissionsVO.getCreateAllowed()))
				.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp).deleteAllowed(booleanToChar(appPermissionsVO.getDeleteAllowed())).build();
	}

	private PermissionVO constructApplicationPermissionsDTOToVO(ApplicationPermissions pagePermissions) {
		return PermissionVO.builder().readAllowed(charToBoolean(pagePermissions.getReadAllowed()))
				.createAllowed(charToBoolean(pagePermissions.getCreateAllowed())).updateAllowed(charToBoolean(pagePermissions.getUpdateAllowed()))
				.deleteAllowed(charToBoolean(pagePermissions.getDeleteAllowed())).id(pagePermissions.getId()).tenantId(pagePermissions.getTenantId()).build();
	}

	private String booleanToChar(boolean value) {
		return value ? YoroappsConstants.YES : YoroappsConstants.NO;
	}

	private boolean charToBoolean(String value) {
		return StringUtils.equalsIgnoreCase(YoroappsConstants.YES, value);
	}

	@Transactional
	public ResponseStringVO saveApplicationSecurities(SecurityVO applicationSecurityVO) {
		ApplicationPermissions applicationPermissions = null;
		String message = null;
		int count = applicationPermissionsRepository.checkApplicationSecurityExist(applicationSecurityVO.getSecurityId(), YoroappsConstants.YES,
				YorosisContext.get().getTenantId());
		if (count > 0) {
			message = "Application permissions updated successfully";
		} else {
			message = "Application permissions created successfully";
		}

		if (!applicationSecurityVO.getDeletedIDList().isEmpty()) {
			Timestamp timestamp = new Timestamp(System.currentTimeMillis());

			for (UUID id : applicationSecurityVO.getDeletedIDList()) {
				applicationPermissions = applicationPermissionsRepository.getOne(id);
				applicationPermissions.setActiveFlag(YoroappsConstants.NO);
				applicationPermissions.setModifiedBy(YorosisContext.get().getUserName());
				applicationPermissions.setModifiedOn(timestamp);
				applicationPermissionsRepository.save(applicationPermissions);
			}
		}

		for (PermissionVO permissionVO : applicationSecurityVO.getPermissionsVOList()) {
			int groupNameCount = yoroGroupsRepository.checkGroupExistOrNot(permissionVO.getGroupId(), YoroappsConstants.YES,
					YorosisContext.get().getTenantId());
			if (groupNameCount == 0) {
				return ResponseStringVO.builder().response("Team does not exist").build();
			}
			if (permissionVO.getId() == null) {
				applicationPermissions = constructApplicationPermissionsVOToDTO(permissionVO);
				applicationPermissions.setYoroGroups(yoroGroupsRepository.findByGroupNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
						permissionVO.getGroupId(), YorosisContext.get().getTenantId(), YoroappsConstants.YES));
				applicationPermissions.setApplication(applicationRepository.getOne(permissionVO.getSecurityId()));
			} else {
				Timestamp timestamp = new Timestamp(System.currentTimeMillis());

				applicationPermissions = applicationPermissionsRepository.getOne(permissionVO.getId());
				applicationPermissions.setCreateAllowed(booleanToChar(permissionVO.getCreateAllowed()));
				applicationPermissions.setReadAllowed(booleanToChar(permissionVO.getReadAllowed()));
				applicationPermissions.setDeleteAllowed(booleanToChar(permissionVO.getDeleteAllowed()));
				applicationPermissions.setUpdateAllowed(booleanToChar(permissionVO.getUpdateAllowed()));
				applicationPermissions.setModifiedBy(YorosisContext.get().getUserName());
				applicationPermissions.setModifiedOn(timestamp);
			}

			applicationPermissionsRepository.save(applicationPermissions);
		}
		return ResponseStringVO.builder().response(message).build();
	}

	public List<PermissionVO> getApplicationPermissionsList(UUID applicationId) {
		List<PermissionVO> applicationPermissionsVOList = new ArrayList<>();
		for (ApplicationPermissions permissions : applicationPermissionsRepository.findByApplicationIdAndTenantIdIgnoreCaseAndActiveFlag(applicationId,
				YorosisContext.get().getTenantId(), YoroappsConstants.YES)) {
			PermissionVO permissionsVO = constructApplicationPermissionsDTOToVO(permissions);
			permissionsVO.setSecurityId(applicationId);
			permissionsVO.setGroupId(permissions.getYoroGroups().getGroupName());
			applicationPermissionsVOList.add(permissionsVO);
		}
		return applicationPermissionsVOList;
	}
}
