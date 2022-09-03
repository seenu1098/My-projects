package com.yorosis.yoroflow.rendering.service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroapps.entities.CustomPage;
import com.yorosis.yoroapps.entities.CustomPagePermissions;
import com.yorosis.yoroapps.entities.Page;
import com.yorosis.yoroapps.entities.PagePermissions;
import com.yorosis.yoroapps.entities.UserGroup;
import com.yorosis.yoroapps.entities.Users;
import com.yorosis.yoroapps.entities.YoroGroups;
import com.yorosis.yoroapps.entities.YoroGroupsUsers;
import com.yorosis.yoroapps.vo.GroupVO;
import com.yorosis.yoroapps.vo.PagePermissionVO;
import com.yorosis.yoroapps.vo.PermissionVO;
import com.yorosis.yoroapps.vo.ResolvedSecurityForPageVO;
import com.yorosis.yoroapps.vo.ResolvedSecurityForPageVO.ResolvedSecurityForPageVOBuilder;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.SectionVO;
import com.yorosis.yoroapps.vo.SecurityVO;
import com.yorosis.yoroapps.vo.UsersVO;
import com.yorosis.yoroapps.vo.YoroGroupsVO;
import com.yorosis.yoroflow.rendering.constants.YoroappsConstants;
import com.yorosis.yoroflow.rendering.repository.CustomPagePermissionsRepository;
import com.yorosis.yoroflow.rendering.repository.CustomPagesRepository;
import com.yorosis.yoroflow.rendering.repository.PagePermissionsRepository;
import com.yorosis.yoroflow.rendering.repository.PageRepository;
import com.yorosis.yoroflow.rendering.repository.UsersRepository;
import com.yorosis.yoroflow.rendering.repository.YoroGroupsRepository;
import com.yorosis.yoroflow.rendering.repository.YoroGroupsUsersRepository;
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
	private CustomPagesRepository customPageRepository;

	@Autowired
	private CustomPagePermissionsRepository customPagePermissionsRepository;

	@Autowired
	private YoroGroupsUsersRepository groupUsersRepository;

	@Autowired
	private ApplicationSecurityService applicationSecurityService;

	@Autowired
	private UsersRepository usersRepo;

	private PagePermissions constructPagePermissionsVOToDTO(PermissionVO pagePermissionsVO) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());

		return PagePermissions.builder().tenantId(YorosisContext.get().getTenantId())
				.readAllowed(booleanToChar(pagePermissionsVO.getReadAllowed()))
				.updateAllowed(booleanToChar(pagePermissionsVO.getUpdateAllowed())).createdOn(timestamp)
				.activeFlag(YoroappsConstants.YES).createdBy(YorosisContext.get().getUserName())
				.createAllowed(booleanToChar(pagePermissionsVO.getCreateAllowed()))
				.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp)
				.deleteAllowed(booleanToChar(pagePermissionsVO.getDeleteAllowed())).build();
	}

	private PermissionVO constructPagePermissionsDTOToVO(PagePermissions pagePermissions) {
		return PermissionVO.builder().readAllowed(charToBoolean(pagePermissions.getReadAllowed()))
				.createAllowed(charToBoolean(pagePermissions.getCreateAllowed()))
				.updateAllowed(charToBoolean(pagePermissions.getUpdateAllowed()))
				.deleteAllowed(charToBoolean(pagePermissions.getDeleteAllowed())).id(pagePermissions.getId())
				.tenantId(pagePermissions.getTenantId()).build();
	}

	private PermissionVO constructPagePermissionsDTOToVO(CustomPagePermissions pagePermissions) {
		return PermissionVO.builder().readAllowed(charToBoolean(pagePermissions.getReadAllowed()))
				.createAllowed(charToBoolean(pagePermissions.getCreateAllowed()))
				.updateAllowed(charToBoolean(pagePermissions.getUpdateAllowed()))
				.deleteAllowed(charToBoolean(pagePermissions.getDeleteAllowed())).id(pagePermissions.getId())
				.tenantId(pagePermissions.getTenantId()).build();
	}

	private UsersVO constructDTOToVO(Users user) {
		List<GroupVO> groupVOList = new ArrayList<>();

		for (UserGroup group : user.getUserGroups()) {
			YoroGroups yoroGroups = group.getYoroGroups();
			groupVOList.add(GroupVO.builder().groupId(yoroGroups.getId())
					.groupName(yoroGroups.getGroupName()).groupDesc(yoroGroups.getDescription()).build());
		}

		return UsersVO.builder().userId(user.getUserId()).firstName(user.getFirstName()).lastName(user.getLastName())
				.userName(user.getUserName()).emailId(user.getEmailId()).groupVOList(groupVOList).build();
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
		int count = pagePermissionsRepository.checkPageSecurityExist(pageSecurityVO.getSecurityId(),
				YoroappsConstants.YES, YorosisContext.get().getTenantId());
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
				pagePermissions.setYoroGroups(yoroGroupsRepository
						.findByGroupNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCaseAndManagedFlagIgnoreCase(
								permissionVo.getGroupId(), YorosisContext.get().getTenantId(), YoroappsConstants.YES,
								YoroappsConstants.NO));
				pagePermissions.setPage(pageRepository.getOne(permissionVo.getSecurityId()));
			} else {
				Timestamp timestamp = new Timestamp(System.currentTimeMillis());

				pagePermissions = pagePermissionsRepository.getOne(permissionVo.getId());
				pagePermissions.setYoroGroups(yoroGroupsRepository
						.findByGroupNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCaseAndManagedFlagIgnoreCase(
								permissionVo.getGroupId(), YorosisContext.get().getTenantId(), YoroappsConstants.YES,
								YoroappsConstants.NO));

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
		return buildPermissionsVOList(pagePermissionsRepository.findByPageIdAndTenantIdIgnoreCaseAndActiveFlag(pageId,
				YorosisContext.get().getTenantId(), YoroappsConstants.YES), pageId);
	}

	public List<PermissionVO> buildPermissionsVOList(List<PagePermissions> pagePermissions, UUID pageId) {
		List<PermissionVO> pagePermissionsVOList = new ArrayList<>();
		for (PagePermissions permissions : pagePermissions) {
			PermissionVO permissionsVO = constructPagePermissionsDTOToVO(permissions);
			permissionsVO.setSecurityId(pageId);
			permissionsVO.setGroupId(permissions.getYoroGroups().getGroupName());
			permissionsVO.setPageName(permissions.getPage().getPageName());
			permissionsVO.setVersion(permissions.getPage().getVersion());
			pagePermissionsVOList.add(permissionsVO);
		}
		return pagePermissionsVOList;
	}

	@Transactional
	public List<YoroGroupsVO> getYoroGroupNames(String groupName) {
		List<YoroGroups> list = yoroGroupsRepository
				.findByGroupNameContainingIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCaseAndManagedFlagIgnoreCase(
						groupName, YorosisContext.get().getTenantId(), YoroappsConstants.YES, YoroappsConstants.NO);

		List<YoroGroupsVO> groupNames = new ArrayList<>();
		for (YoroGroups group : list) {
			groupNames.add(YoroGroupsVO.builder().name(group.getGroupName()).description(group.getDescription())
					.id(group.getId()).build());
		}

		return groupNames;
	}

	public ResponseStringVO checkExistYoroGroup(UUID groupId, UUID pageId) {
		ResponseStringVO responseVO = null;

		int count = pagePermissionsRepository.checkAccessForYororoups(YorosisContext.get().getTenantId(), groupId,
				pageId, YoroappsConstants.YES);
		if (count > 0) {
			responseVO = ResponseStringVO.builder().response("Team Name already selected").isDisable(true).build();
		} else {
			responseVO = ResponseStringVO.builder().response("Team Name doesn't selected").isDisable(false).build();
		}

		return responseVO;
	}

	public ResponseStringVO checkYoroGroupCreated(String name) {
		int count = yoroGroupsRepository.checkGroupExistOrNot(name, YoroappsConstants.YES,
				YorosisContext.get().getTenantId(), YoroappsConstants.NO);
		if (count == 0) {
			return ResponseStringVO.builder().response("Team does not exist").build();
		}
		return null;

	}

	@Transactional
	public ResolvedSecurityForPageVO getResolvedPageSecurity(String pageId, Long version) {
		ResolvedSecurityForPageVOBuilder builder = ResolvedSecurityForPageVO.builder().read(false).create(false)
				.update(false).delete(false).admin(false);

		Page page = pageRepository.findByPageIdAndVersionAndTenantIdAndActiveFlag(pageId, version,
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		if (page != null && page.getApplicationId() != null) {
			updatePermission(applicationSecurityService.getApplicationPermissionsList(page.getApplicationId()), builder,
					false);
			updatePermission(getPagePermissionsList(page.getId()), builder, true);
		} else {
			CustomPage customPage = customPageRepository.findByPageIdAndTenantId(pageId,
					YorosisContext.get().getTenantId());
			if (customPage != null) {
				updatePermission(
						applicationSecurityService.getApplicationPermissionsList(customPage.getApplicationId()),
						builder, false);
				updatePermission(getCustomPagePermissionsList(customPage.getId()), builder, true);
			}
		}
		return builder.build();
	}

	@Transactional
	public ResolvedSecurityForPageVO getResolvedPageSecurityForSection(SectionVO sectionVO) {
		ResolvedSecurityForPageVOBuilder builder = ResolvedSecurityForPageVO.builder().read(false).create(false)
				.update(false).delete(false).show(false);

		if (sectionVO.getSecurity() != null && sectionVO.getSecurity().getPermissionsVOList() != null
				&& !sectionVO.getSecurity().getPermissionsVOList().isEmpty()) {
			updatePermission(sectionVO.getSecurity().getPermissionsVOList(), builder, true);
		}
		return builder.build();
	}

	public List<PermissionVO> getCustomPagePermissionsList(UUID pageId) {
		return buildCustomPagePermissionsVOList(
				customPagePermissionsRepository.findByCustomPageIdAndTenantIdIgnoreCaseAndActiveFlag(pageId,
						YorosisContext.get().getTenantId(), YoroappsConstants.YES),
				pageId);
	}

	public List<PermissionVO> buildCustomPagePermissionsVOList(List<CustomPagePermissions> pagePermissions,
			UUID pageId) {
		List<PermissionVO> pagePermissionsVOList = new ArrayList<>();
		for (CustomPagePermissions permissions : pagePermissions) {
			PermissionVO permissionsVO = constructPagePermissionsDTOToVO(permissions);
			permissionsVO.setSecurityId(pageId);
			permissionsVO.setGroupId(permissions.getYoroGroups().getGroupName());
			pagePermissionsVOList.add(permissionsVO);
		}
		return pagePermissionsVOList;
	}

	private void updatePermission(List<PermissionVO> permissionsList, ResolvedSecurityForPageVOBuilder builder,
			boolean override) {
		for (PermissionVO permissionVo : permissionsList) {
			resolveGroups(permissionVo, builder, override);
		}
	}

	private void resolveGroups(PermissionVO permissionVo, ResolvedSecurityForPageVOBuilder builder, boolean override) {
		YoroGroups yoroGroups = yoroGroupsRepository
				.findByGroupNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(permissionVo.getGroupId(),
						YorosisContext.get().getTenantId(), YoroappsConstants.YES);

		if (yoroGroups != null) {
			List<YoroGroupsUsers> filteredList = groupUsersRepository
					.getByGroupIdAndUsernameAndTenantIdAndActiveFlagIgnoreCase(yoroGroups.getId(),
							YorosisContext.get().getUserName(), YorosisContext.get().getTenantId(),
							YoroappsConstants.YES, PageRequest.of(0, 2));

			if (!filteredList.isEmpty()) {
				resolveUserGroup(permissionVo, builder, override);
			}
		}
	}

	private void resolveUserGroup(PermissionVO permissionVo, ResolvedSecurityForPageVOBuilder builder,
			boolean override) {
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

		if (BooleanUtils.isTrue(permissionVo.getShowAllowed())) {
			builder.show(true);
		} else if (override) {
			builder.show(false);
		}
	}

	private UsersVO getLoggedInUserDetails(String userName) {
		Users user = usersRepo.findByUserNameAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(userName,
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		return constructDTOToVO(user);
	}

	@Transactional
	public ResponseStringVO getPagePermission(PagePermissionVO permission) {
		ResponseStringVO responseString = null;
		String groupName = "";
		Set<UUID> groupIdList = new HashSet<>();
		List<UUID> groupNameList = new ArrayList<>();
		Page page = pageRepository.getPage(permission.getPageId(), permission.getVersion(), YoroappsConstants.YES,
				YorosisContext.get().getTenantId());
		if (permission.getUserId() != null) {
			Users user = usersRepo.findByUserIdAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(permission.getUserId(),
					YoroappsConstants.YES, YorosisContext.get().getTenantId());
			groupIdList.addAll(getLoggedInUserDetails(user.getUserName()).getGroupVOList().stream()
					.map(GroupVO::getGroupId).collect(Collectors.toList()));
			if (adduserId(groupIdList, page)) {
				groupNameList.add(user.getUserId());
			}

		}
		if (permission.getGroupId() != null) {
			groupIdList.addAll(permission.getGroupId());
		}
		for (UUID uuid : groupIdList) {
			PagePermissions pagePermissions = pagePermissionsRepository.checkPermission(uuid, page.getId(),
					YoroappsConstants.YES, YorosisContext.get().getTenantId());
			if (pagePermissions == null) {
				YoroGroups yoroGroups = yoroGroupsRepository
						.findByIdAndTenantIdAndActiveFlagIgnoreCaseAndManagedFlagIgnoreCase(uuid,
								YorosisContext.get().getTenantId(), YoroappsConstants.YES, YoroappsConstants.NO);
				if (yoroGroups != null) {
					if (StringUtils.isBlank(groupName)) {
						groupName = yoroGroups.getGroupName();
					} else {
						groupName = groupName + "," + " " + yoroGroups.getGroupName();
					}
					groupNameList.add(uuid);
				}
			}
		}
		if (StringUtils.isEmpty(groupName)) {
			responseString = ResponseStringVO.builder().response("It has permission").build();
		} else {
			responseString = ResponseStringVO.builder()
					.response(groupName + " " + "have no permission for" + " " + page.getPageName())
					.pageName(page.getPageName()).responseId(page.getId().toString()).groupNameList(groupNameList)
					.build();
		}
		return responseString;
	}

	private Boolean adduserId(Set<UUID> groupIdList, Page page) {
		Boolean groupNameList = false;
		for (UUID uuid : groupIdList) {
			PagePermissions pagePermissions = pagePermissionsRepository.checkPermission(uuid, page.getId(),
					YoroappsConstants.YES, YorosisContext.get().getTenantId());
			if (pagePermissions == null) {
				groupNameList = true;
			}
		}
		return groupNameList;
	}

	@Transactional
	public ResponseStringVO savePermissionsList(List<PermissionVO> pagePermissionsVO) {
		for (PermissionVO permissionVO : pagePermissionsVO) {
			YoroGroups yoroGroups = yoroGroupsRepository
					.findByGroupNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(permissionVO.getGroupId(),
							YorosisContext.get().getTenantId(), YoroappsConstants.YES);
			if (yoroGroups != null) {
				PagePermissions pagePermissions = constructPagePermissionsVOToDTO(permissionVO);

				Page page = pageRepository.getOne(permissionVO.getSecurityId());
				pagePermissions.setYoroGroups(yoroGroups);
				pagePermissions.setPage(page);
				pagePermissionsRepository.save(pagePermissions);
			}
		}
		return ResponseStringVO.builder().response("Page Permission Created Successfully").build();
	}
}
