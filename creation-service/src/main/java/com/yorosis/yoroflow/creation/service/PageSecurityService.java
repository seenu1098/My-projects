package com.yorosis.yoroflow.creation.service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroapps.entities.Page;
import com.yorosis.yoroapps.entities.PagePermissions;
import com.yorosis.yoroapps.entities.YoroGroups;
import com.yorosis.yoroapps.entities.YoroGroupsUsers;
import com.yorosis.yoroapps.vo.PageIdListVO;
import com.yorosis.yoroapps.vo.PermissionVO;
import com.yorosis.yoroapps.vo.ResolvedSecurityForPageVO;
import com.yorosis.yoroapps.vo.ResolvedSecurityForPageVO.ResolvedSecurityForPageVOBuilder;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.SecurityVO;
import com.yorosis.yoroapps.vo.YoroGroupsVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.PagePermissionsRepository;
import com.yorosis.yoroflow.creation.repository.PageRepository;
import com.yorosis.yoroflow.creation.repository.YoroGroupsRepository;
import com.yorosis.yoroflow.creation.repository.YoroGroupsUsersRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class PageSecurityService {

	@Autowired
	private PagePermissionsRepository pagePermissionsRepository;

	@Autowired
	private YoroGroupsRepository yoroGroupsRepository;

	@Autowired
	private PageRepository pageRepository;

	@Autowired
	private YoroGroupsUsersRepository groupUsersRepository;

	@Autowired
	private ApplicationSecurityService applicationSecurityService;

	private PagePermissions constructPagePermissionsVOToDTO(PermissionVO pagePermissionsVO) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());

		return PagePermissions.builder().tenantId(YorosisContext.get().getTenantId()).readAllowed(booleanToChar(pagePermissionsVO.getReadAllowed()))
				.updateAllowed(booleanToChar(pagePermissionsVO.getUpdateAllowed())).createdOn(timestamp).activeFlag(YoroappsConstants.YES)
				.createdBy(YorosisContext.get().getUserName()).createAllowed(booleanToChar(pagePermissionsVO.getCreateAllowed()))
				.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp).deleteAllowed(booleanToChar(pagePermissionsVO.getDeleteAllowed()))
				.build();
	}

	private PermissionVO constructPagePermissionsDTOToVO(PagePermissions pagePermissions) {
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
	public ResponseStringVO savePageSecurities(SecurityVO pageSecurityVO) {
		PagePermissions pagePermissions = null;
		String message = null;
		int count = pagePermissionsRepository.checkPageSecurityExist(pageSecurityVO.getSecurityId(), YoroappsConstants.YES, YorosisContext.get().getTenantId());
		if (count > 0) {
			message = "Page permissions updated successfully";
		} else {
			message = "Page permissions created successfully";
		}

		if (!pageSecurityVO.getDeletedIDList().isEmpty()) {
			Timestamp timestamp = new Timestamp(System.currentTimeMillis());

			for (UUID id : pageSecurityVO.getDeletedIDList()) {
				pagePermissions = pagePermissionsRepository.getOne(id);
				pagePermissions.setActiveFlag(YoroappsConstants.NO);
				pagePermissions.setModifiedBy(YorosisContext.get().getUserName());
				pagePermissions.setModifiedOn(timestamp);
				pagePermissionsRepository.save(pagePermissions);
			}
		}

		for (PermissionVO permissionVo : pageSecurityVO.getPermissionsVOList()) {
			if (permissionVo.getId() == null) {
				pagePermissions = constructPagePermissionsVOToDTO(permissionVo);
				pagePermissions.setYoroGroups(yoroGroupsRepository.findByGroupNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
						permissionVo.getGroupId(), YorosisContext.get().getTenantId(), YoroappsConstants.YES));
				pagePermissions.setPage(pageRepository.getOne(permissionVo.getSecurityId()));
			} else {
				Timestamp timestamp = new Timestamp(System.currentTimeMillis());

				pagePermissions = pagePermissionsRepository.getOne(permissionVo.getId());
				pagePermissions.setCreateAllowed(booleanToChar(permissionVo.getCreateAllowed()));
				pagePermissions.setReadAllowed(booleanToChar(permissionVo.getReadAllowed()));
				pagePermissions.setDeleteAllowed(booleanToChar(permissionVo.getDeleteAllowed()));
				pagePermissions.setUpdateAllowed(booleanToChar(permissionVo.getUpdateAllowed()));
				pagePermissions.setModifiedBy(YorosisContext.get().getUserName());
				pagePermissions.setModifiedOn(timestamp);
			}

			pagePermissionsRepository.save(pagePermissions);
		}
		return ResponseStringVO.builder().response(message).build();
	}

	public List<PermissionVO> getPagePermissionsList(UUID pageId) {
		List<PermissionVO> pagePermissionsVOList = new ArrayList<>();
		for (PagePermissions permissions : pagePermissionsRepository.findByPageIdAndTenantIdIgnoreCaseAndActiveFlag(pageId, YorosisContext.get().getTenantId(),
				YoroappsConstants.YES)) {
			PermissionVO permissionsVO = constructPagePermissionsDTOToVO(permissions);
			permissionsVO.setSecurityId(pageId);
			permissionsVO.setGroupId(permissions.getYoroGroups().getGroupName());
			pagePermissionsVOList.add(permissionsVO);
		}
		return pagePermissionsVOList;
	}

	@Transactional
	public ResponseStringVO savePermissionsList(List<PermissionVO> pagePermissionsVO) {
		for (PermissionVO permissionVO : pagePermissionsVO) {
			PagePermissions pagePermissions = constructPagePermissionsVOToDTO(permissionVO);
			pagePermissions.setYoroGroups(yoroGroupsRepository.findByGroupNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(permissionVO.getGroupId(),
					YorosisContext.get().getTenantId(), YoroappsConstants.YES));
			pagePermissions.setPage(pageRepository.getOne(permissionVO.getSecurityId()));
			pagePermissionsRepository.save(pagePermissions);
		}
		return ResponseStringVO.builder().response("Page Permission Created Successfully").build();
	}

	@Transactional
	public List<YoroGroupsVO> getYoroGroupNames(String groupName) {
		List<YoroGroups> list = yoroGroupsRepository.findByGroupNameContainingIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(groupName,
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);

		List<YoroGroupsVO> groupNames = new ArrayList<>();
		for (YoroGroups group : list) {
			groupNames.add(YoroGroupsVO.builder().name(group.getGroupName()).description(group.getDescription()).id(group.getId()).build());
		}

		return groupNames;
	}

	public ResponseStringVO checkExistYoroGroup(UUID groupId, UUID pageId) {
		ResponseStringVO responseVO = null;

		int count = pagePermissionsRepository.checkAccessForYororoups(YorosisContext.get().getTenantId(), groupId, pageId, YoroappsConstants.YES);
		if (count > 0) {
			responseVO = ResponseStringVO.builder().response("Group Name already selected").isDisable(true).build();
		} else {
			responseVO = ResponseStringVO.builder().response("Group Name doesn't selected").isDisable(false).build();
		}

		return responseVO;
	}

	public ResponseStringVO checkYoroGroupCreated(String name) {
		int count = yoroGroupsRepository.checkGroupExistOrNot(name, YoroappsConstants.YES, YorosisContext.get().getTenantId());
		if (count == 0) {
			return ResponseStringVO.builder().response("Group does not exist").build();
		}
		return null;

	}

	@Transactional
	public ResolvedSecurityForPageVO getResolvedPageSecurity(String pageId) {
		ResolvedSecurityForPageVOBuilder builder = ResolvedSecurityForPageVO.builder().read(false).create(false).update(false).delete(false).admin(false);

		Page page = pageRepository.findByPageIdAndTenantIdAndActiveFlag(pageId, YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		if (page != null && page.getApplicationId() != null) {
			updatePermission(applicationSecurityService.getApplicationPermissionsList(page.getApplicationId()), builder, false);
			updatePermission(getPagePermissionsList(page.getId()), builder, true);
		}

		return builder.build();
	}

	private void updatePermission(List<PermissionVO> permissionsList, ResolvedSecurityForPageVOBuilder builder, boolean override) {
		for (PermissionVO permissionVo : permissionsList) {
			resolveGroups(permissionVo, builder, override);
		}
	}

	private void resolveGroups(PermissionVO permissionVo, ResolvedSecurityForPageVOBuilder builder, boolean override) {
		YoroGroups yoroGroups = yoroGroupsRepository.findByGroupNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(permissionVo.getGroupId(),
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);

		if (yoroGroups != null) {
			List<YoroGroupsUsers> filteredList = groupUsersRepository.getByGroupIdAndUsernameAndTenantIdAndActiveFlagIgnoreCase(yoroGroups.getId(),
					YorosisContext.get().getUserName(), YorosisContext.get().getTenantId(), YoroappsConstants.YES, PageRequest.of(0, 2));

			if (!filteredList.isEmpty()) {
				resolveUserGroup(permissionVo, builder, override);
			}
		}
	}

	private void resolveUserGroup(PermissionVO permissionVo, ResolvedSecurityForPageVOBuilder builder, boolean override) {
		if (BooleanUtils.isTrue(permissionVo.getCreateAllowed())) {
			builder.create(true);
		} else if (override) {
			builder.create(false);
		}

		if (BooleanUtils.isTrue(permissionVo.getDeleteAllowed())) {
			builder.delete(true);
		} else if (override) {
			builder.delete(false);
		}

		if (BooleanUtils.isTrue(permissionVo.getReadAllowed())) {
			builder.read(true);
		} else if (override) {
			builder.read(false);
		}

		if (BooleanUtils.isTrue(permissionVo.getUpdateAllowed())) {
			builder.update(true);
		} else if (override) {
			builder.update(false);
		}
	}

	@Transactional
	public List<PermissionVO> getPagePermissionForImport(PageIdListVO pageIdList) {
		List<PermissionVO> pagePermissionsVOList = new ArrayList<>();
		for (PagePermissions pagePermission : pagePermissionsRepository.getPagePermissionList(pageIdList.getUuidList(), YoroappsConstants.YES,
				YorosisContext.get().getTenantId())) {
			PermissionVO permissionsVO = constructPagePermissionsDTOToVO(pagePermission);
			permissionsVO.setSecurityId(pagePermission.getPage().getId());
			permissionsVO.setGroupId(pagePermission.getYoroGroups().getGroupName());
			permissionsVO.setPageName(pagePermission.getPage().getPageName());
			pagePermissionsVOList.add(permissionsVO);
		}
		return pagePermissionsVOList;
	}

	@Transactional
	public ResponseStringVO savePermissions(List<PermissionVO> pagePermissionsVO) {
		for (PermissionVO permissionVO : pagePermissionsVO) {
			YoroGroups yoroGroups = yoroGroupsRepository.findByGroupNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(permissionVO.getGroupId(),
					YorosisContext.get().getTenantId(), YoroappsConstants.YES);
			if (yoroGroups != null) {
				PagePermissions pagePermissions = constructPagePermissionsVOToDTO(permissionVO);
				pagePermissions.setYoroGroups(yoroGroups);
				Page page = pageRepository.findByPageNameAndTenantIdAndActiveFlag(permissionVO.getPageName(), YorosisContext.get().getTenantId(),
						YoroappsConstants.YES);
				pagePermissions.setPage(page);
				pagePermissionsRepository.save(pagePermissions);
			}
		}
		return ResponseStringVO.builder().response("Page Permission Created Successfully").build();
	}

	@Transactional
	public ResponseStringVO savePermissionsForImport(List<PermissionVO> pagePermissionsVO) {
		for (PermissionVO permissionVO : pagePermissionsVO) {
			if (StringUtils.isNotEmpty(permissionVO.getAssigneeUser())) {
				List<YoroGroupsUsers> yoroGroupusers = groupUsersRepository.getGroupList(UUID.fromString(permissionVO.getAssigneeUser()),
						YorosisContext.get().getTenantId(), YoroappsConstants.YES);
				if (yoroGroupusers != null) {
					for (YoroGroupsUsers yoroGroupuser : yoroGroupusers) {
						PagePermissions pagePermissions = constructPagePermissionsVOToDTO(permissionVO);
						pagePermissions.setYoroGroups(yoroGroupuser.getYoroGroups());
						Page page = pageRepository.findByPageNameAndVersionAndTenantIdAndActiveFlag(permissionVO.getPageName(), permissionVO.getVersion(),
								YorosisContext.get().getTenantId(), YoroappsConstants.YES);
						pagePermissions.setPage(page);
						pagePermissionsRepository.save(pagePermissions);
					}
				}
			} else {
				List<YoroGroups> yoroGroups = yoroGroupsRepository.getGroupList(permissionVO.getAssigneeGroup(), YorosisContext.get().getTenantId(),
						YoroappsConstants.YES);
				if (yoroGroups != null) {
					for (YoroGroups yoroGroup : yoroGroups) {
						PagePermissions pagePermissions = constructPagePermissionsVOToDTO(permissionVO);
						pagePermissions.setYoroGroups(yoroGroup);
						Page page = pageRepository.findByPageNameAndVersionAndTenantIdAndActiveFlag(permissionVO.getPageName(), permissionVO.getVersion(),
								YorosisContext.get().getTenantId(), YoroappsConstants.YES);
						pagePermissions.setPage(page);
						pagePermissionsRepository.save(pagePermissions);
					}
				}
			}
		}
		return ResponseStringVO.builder().response("Page Permission Created Successfully").build();
	}

}
