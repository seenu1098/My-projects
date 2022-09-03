package com.yorosis.yoroflow.services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroflow.entities.ProcessDefPrmsn;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.PermissionVO;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.models.SecurityVO;
import com.yorosis.yoroflow.repository.GroupRepository;
import com.yorosis.yoroflow.repository.ProcessDefinitionPermissionRepository;
import com.yorosis.yoroflow.repository.ProcessDefinitionRepo;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class ProcessDefinitionPermissionService {

	@Autowired
	private ProcessDefinitionPermissionRepository processDefPrmsnRepository;

	@Autowired
	private ProcessDefinitionRepo processDefinitionRepo;

	@Autowired
	private GroupRepository groupRepository;

	private ProcessDefPrmsn constructPagePermissionsVOToDTO(PermissionVO pagePermissionsVO) {
		LocalDateTime timestamp = LocalDateTime.now();

		return ProcessDefPrmsn.builder().tenantId(YorosisContext.get().getTenantId()).readAllowed(booleanToChar(pagePermissionsVO.getReadAllowed()))
				.groupId(pagePermissionsVO.getGroupId()).updateAllowed(booleanToChar(pagePermissionsVO.getUpdateAllowed())).activeFlag(YorosisConstants.YES)
				.createdBy(YorosisContext.get().getUserName()).createdDate(timestamp).updatedDate(timestamp)
				.launchAllowed(booleanToChar(pagePermissionsVO.getLaunchAllowed())).updatedBy(YorosisContext.get().getUserName())
				.publishAllowed(booleanToChar(pagePermissionsVO.getPublishAllowed())).build();
	}

	private PermissionVO constructPagePermissionsDTOToVO(ProcessDefPrmsn pagePermissions) {
		return PermissionVO.builder().id(pagePermissions.getProcessDefPrmsnId()).readAllowed(charToBoolean(pagePermissions.getReadAllowed()))
				.launchAllowed(charToBoolean(pagePermissions.getLaunchAllowed()))
				.publishAllowed(charToBoolean(pagePermissions.getPublishAllowed())).updateAllowed(charToBoolean(pagePermissions.getUpdateAllowed()))
				.tenantId(pagePermissions.getTenantId()).build();
	}

	private String booleanToChar(boolean value) {
		return value ? YorosisConstants.YES : YorosisConstants.NO;
	}

	private boolean charToBoolean(String value) {
		return StringUtils.equalsIgnoreCase(YorosisConstants.YES, value);
	}

	@Transactional
	public ResponseStringVO saveWorkflowSecurities(SecurityVO pageSecurityVO) {
		ProcessDefPrmsn workflowPermissions = null;
		String message = null;
		List<ProcessDefPrmsn> count = processDefPrmsnRepository.checkWorkflowSecurityExist(pageSecurityVO.getSecurityId(), YorosisConstants.YES,
				YorosisContext.get().getTenantId());
		if (!count.isEmpty()) {
			message = "Workflow permissions updated successfully";
		} else {
			message = "Workflow permissions created successfully";
		}

		if (!pageSecurityVO.getDeletedIDList().isEmpty()) {
			for (UUID id : pageSecurityVO.getDeletedIDList()) {
				workflowPermissions = processDefPrmsnRepository.getOne(id);
				workflowPermissions.setActiveFlag(YorosisConstants.NO);
				workflowPermissions.setUpdatedBy(YorosisContext.get().getUserName());
				workflowPermissions.setUpdatedDate(LocalDateTime.now());
				processDefPrmsnRepository.save(workflowPermissions);
			}
		}

		for (PermissionVO permissionVo : pageSecurityVO.getPermissionsVOList()) {
			if (permissionVo.getId() == null) {
				workflowPermissions = constructPagePermissionsVOToDTO(permissionVo);
				workflowPermissions.setProcessDefinition(processDefinitionRepo.getOne(permissionVo.getSecurityId()));
			} else {
				workflowPermissions = processDefPrmsnRepository.getOne(permissionVo.getId());
				workflowPermissions.setReadAllowed(booleanToChar(permissionVo.getReadAllowed()));
				workflowPermissions.setPublishAllowed(booleanToChar(permissionVo.getPublishAllowed()));
				workflowPermissions.setUpdateAllowed(booleanToChar(permissionVo.getUpdateAllowed()));
				workflowPermissions.setLaunchAllowed(booleanToChar(permissionVo.getLaunchAllowed()));
				workflowPermissions.setUpdatedBy(YorosisContext.get().getUserName());
				workflowPermissions.setUpdatedDate(LocalDateTime.now());
			}

			processDefPrmsnRepository.save(workflowPermissions);
		}

		return ResponseStringVO.builder().response(message).build();
	}

	@Transactional
	public List<PermissionVO> getWorkflowPermissionsList(UUID workflowId) {
		List<PermissionVO> pagePermissionsVOList = new ArrayList<>();
		for (ProcessDefPrmsn permissions : processDefPrmsnRepository.checkWorkflowSecurityExist(workflowId, YorosisConstants.YES,
				YorosisContext.get().getTenantId())) {
			PermissionVO permissionsVO = constructPagePermissionsDTOToVO(permissions);
			permissionsVO.setSecurityId(workflowId);
			permissionsVO.setGroupId(permissions.getGroupId());
			permissionsVO.setGroupName(groupRepository.getOne(permissions.getGroupId()).getGroupName());
			pagePermissionsVOList.add(permissionsVO);
		}

		return pagePermissionsVOList;
	}
}
