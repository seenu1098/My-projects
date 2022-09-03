package com.yorosis.yoroflow.rendering.service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroapps.entities.CustomPagePermissions;
import com.yorosis.yoroapps.vo.PermissionVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.SecurityVO;
import com.yorosis.yoroflow.rendering.constants.YoroappsConstants;
import com.yorosis.yoroflow.rendering.repository.CustomPagePermissionsRepository;
import com.yorosis.yoroflow.rendering.repository.CustomPagesRepository;
import com.yorosis.yoroflow.rendering.repository.YoroGroupsRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class CustomPageSecurityService {

	@Autowired
	private CustomPagePermissionsRepository customPagePermissionsRepository;

	@Autowired
	private YoroGroupsRepository yoroGroupsRepository;

	@Autowired
	private CustomPagesRepository customPageRepository;

	private CustomPagePermissions constructPagePermissionsVOToDTO(PermissionVO pagePermissionsVO) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());

		return CustomPagePermissions.builder().tenantId(YorosisContext.get().getTenantId())
				.readAllowed(booleanToChar(pagePermissionsVO.getReadAllowed()))
				.updateAllowed(booleanToChar(pagePermissionsVO.getUpdateAllowed())).createdOn(timestamp)
				.activeFlag(YoroappsConstants.YES).createdBy(YorosisContext.get().getUserName())
				.createAllowed(booleanToChar(pagePermissionsVO.getCreateAllowed()))
				.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp)
				.deleteAllowed(booleanToChar(pagePermissionsVO.getDeleteAllowed())).build();
	}

	private PermissionVO constructPagePermissionsDTOToVO(CustomPagePermissions pagePermissions) {
		return PermissionVO.builder().readAllowed(charToBoolean(pagePermissions.getReadAllowed()))
				.createAllowed(charToBoolean(pagePermissions.getCreateAllowed()))
				.updateAllowed(charToBoolean(pagePermissions.getUpdateAllowed()))
				.deleteAllowed(charToBoolean(pagePermissions.getDeleteAllowed())).id(pagePermissions.getId())
				.tenantId(pagePermissions.getTenantId()).build();
	}

	private String booleanToChar(boolean value) {
		return value ? YoroappsConstants.YES : YoroappsConstants.NO;
	}

	private boolean charToBoolean(String value) {
		return StringUtils.equalsIgnoreCase(YoroappsConstants.YES, value);
	}

	@Transactional
	public ResponseStringVO savePageSecurities(SecurityVO pageSecurityVO) {
		CustomPagePermissions pagePermissions = null;
		String message = null;
		int count = customPagePermissionsRepository.checkPageSecurityExist(pageSecurityVO.getSecurityId(),
				YoroappsConstants.YES, YorosisContext.get().getTenantId());
		if (count > 0) {
			message = "Page permissions updated successfully";
		} else {
			message = "Page permissions created successfully";
		}

		if (!pageSecurityVO.getDeletedIDList().isEmpty()) {
			Timestamp timestamp = new Timestamp(System.currentTimeMillis());

			for (UUID id : pageSecurityVO.getDeletedIDList()) {
				pagePermissions = customPagePermissionsRepository.getOne(id);
				pagePermissions.setActiveFlag(YoroappsConstants.NO);
				pagePermissions.setModifiedBy(YorosisContext.get().getUserName());
				pagePermissions.setModifiedOn(timestamp);
				customPagePermissionsRepository.save(pagePermissions);
			}
		}

		for (PermissionVO permissionVo : pageSecurityVO.getPermissionsVOList()) {
			if (permissionVo.getId() == null) {
				pagePermissions = constructPagePermissionsVOToDTO(permissionVo);
				pagePermissions.setYoroGroups(yoroGroupsRepository
						.findByGroupNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCaseAndManagedFlagIgnoreCase(
								permissionVo.getGroupId(), YorosisContext.get().getTenantId(), YoroappsConstants.YES,
								YoroappsConstants.NO));
				pagePermissions.setCustomPage(customPageRepository.getOne(permissionVo.getSecurityId()));
			} else {
				Timestamp timestamp = new Timestamp(System.currentTimeMillis());

				pagePermissions = customPagePermissionsRepository.getOne(permissionVo.getId());
				pagePermissions.setCreateAllowed(booleanToChar(permissionVo.getCreateAllowed()));
				pagePermissions.setReadAllowed(booleanToChar(permissionVo.getReadAllowed()));
				pagePermissions.setDeleteAllowed(booleanToChar(permissionVo.getDeleteAllowed()));
				pagePermissions.setUpdateAllowed(booleanToChar(permissionVo.getUpdateAllowed()));
				pagePermissions.setModifiedBy(YorosisContext.get().getUserName());
				pagePermissions.setModifiedOn(timestamp);
			}

			customPagePermissionsRepository.save(pagePermissions);
		}
		return ResponseStringVO.builder().response(message).build();
	}

	public List<PermissionVO> getPagePermissionsList(UUID pageId) {
		return buildPermissionsVOList(
				customPagePermissionsRepository.findByCustomPageIdAndTenantIdIgnoreCaseAndActiveFlag(pageId,
						YorosisContext.get().getTenantId(), YoroappsConstants.YES),
				pageId);
	}

	public List<PermissionVO> buildPermissionsVOList(List<CustomPagePermissions> pagePermissions, UUID pageId) {
		List<PermissionVO> pagePermissionsVOList = new ArrayList<>();
		for (CustomPagePermissions permissions : pagePermissions) {
			PermissionVO permissionsVO = constructPagePermissionsDTOToVO(permissions);
			permissionsVO.setSecurityId(pageId);
			permissionsVO.setGroupId(permissions.getYoroGroups().getGroupName());
			pagePermissionsVOList.add(permissionsVO);
		}
		return pagePermissionsVOList;
	}

}
