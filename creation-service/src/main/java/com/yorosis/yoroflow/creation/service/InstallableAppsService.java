package com.yorosis.yoroflow.creation.service;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yorosis.yoroapps.apps.vo.AppsVo;
import com.yorosis.yoroapps.apps.vo.YoroGroupMapVo;
import com.yorosis.yoroapps.entities.InstallableApps;
import com.yorosis.yoroapps.entities.Page;
import com.yorosis.yoroapps.entities.PagePermissions;
import com.yorosis.yoroapps.entities.Users;
import com.yorosis.yoroapps.entities.WorkSpace;
import com.yorosis.yoroapps.entities.WorkspaceSecurity;
import com.yorosis.yoroapps.entities.YoroGroups;
import com.yorosis.yoroapps.entities.YoroGroupsUsers;
import com.yorosis.yoroapps.vo.InstallableAppsVo;
import com.yorosis.yoroapps.vo.LicenseVO;
import com.yorosis.yoroapps.vo.PageVO;
import com.yorosis.yoroapps.vo.PermissionVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.YoroGroupsVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.exception.YoroappsException;
import com.yorosis.yoroflow.creation.repository.InstallableAppsRepository;
import com.yorosis.yoroflow.creation.repository.PagePermissionsRepository;
import com.yorosis.yoroflow.creation.repository.PageRepository;
import com.yorosis.yoroflow.creation.repository.UsersRepository;
import com.yorosis.yoroflow.creation.repository.WorkspaceRepository;
import com.yorosis.yoroflow.creation.repository.WorkspaceSecurityRepository;
import com.yorosis.yoroflow.creation.repository.YoroGroupsRepository;
import com.yorosis.yoroflow.creation.repository.YoroGroupsUsersRepository;
import com.yorosis.yoroflow.creation.table.service.TableObjectsService;
import com.yorosis.yoroflow.creation.table.vo.TableObjectsVO;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class InstallableAppsService {

	@Autowired
	private InstallableAppsRepository installableAppsRepository;

	@Autowired
	private PageRepository pageRepository;

	@Autowired
	private PageService pageService;

	@Autowired
	private WorkspaceSecurityRepository workspaceSecurityRepository;

	@Autowired
	private TableObjectsService tableObjectsService;

	@Autowired
	private YoroGroupsRepository yoroGroupsRepository;

	@Autowired
	private PagePermissionsRepository pagePermissionsRepository;

	@Autowired
	private ProxyService proxyService;

	@Autowired
	private YoroGroupsUsersRepository yoroGroupsUsersRepository;

	@Autowired
	private UsersRepository userRepository;

	@Autowired
	private WorkspaceRepository workspaceRepository;

	@Autowired
	private WorkflowClientService workflowClientService;

	@Autowired
	private ObjectMapper mapper;

	private InstallableAppsVo constructInstallableAppsVo(InstallableApps installableApps) {
		return InstallableAppsVo.builder().description(installableApps.getDescription()).id(installableApps.getId())
				.category(installableApps.getCategory()).templateName(installableApps.getTemplateName()).build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public List<InstallableAppsVo> getInstalledAppsList() {
		List<InstallableAppsVo> installableAppsVoList = new ArrayList<>();
		List<InstallableApps> installableAppsList = installableAppsRepository
				.getAllInstallableApps(YoroappsConstants.YES, YorosisContext.get().getTenantId());
		if (installableAppsList != null && !installableAppsList.isEmpty()) {
			installableAppsVoList = installableAppsList.stream().map(this::constructInstallableAppsVo)
					.collect(Collectors.toList());
		}
		return installableAppsVoList;
	}

	public LicenseVO isAllowed(int size) {
		String currentTenantId = YorosisContext.get().getTenantId();

		LicenseVO licenseVO = proxyService.isAllowed(currentTenantId, "general", "teams_groups");

		int allGroupsCount = yoroGroupsRepository.getAllYoroGroupsCount(currentTenantId, YoroappsConstants.YES,
				YoroappsConstants.NO);
		allGroupsCount = allGroupsCount + size;
		if (allGroupsCount < licenseVO.getAllowedLimit()) {
			licenseVO.setResponse("within the limit");
			return licenseVO;
		}
		licenseVO.setResponse("You have exceeded your limit");
		return licenseVO;
	}

	private void saveGroupUsers(List<YoroGroupMapVo> groupList) {
		Users user = userRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
				YorosisContext.get().getUserName(), YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		List<UUID> groupListId = new ArrayList<>();
		List<YoroGroupsUsers> yoroGroupsUserList = yoroGroupsUsersRepository.getGroupList(user.getUserId(),
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		groupList.stream().forEach(g -> {
			groupListId.add(g.getYoroGroups());
		});
		List<YoroGroups> yoroGroupList = yoroGroupsRepository.getGroupList(groupListId,
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		List<YoroGroups> yoroGroupsList = new ArrayList<>();
		if (yoroGroupList != null && !yoroGroupList.isEmpty()) {
			if (yoroGroupsUserList != null && !yoroGroupsUserList.isEmpty()) {
				for (YoroGroups y : yoroGroupList) {
					boolean isPresent = false;
					for (YoroGroupsUsers yg : yoroGroupsUserList) {
						if (y == yg.getYoroGroups()) {
							isPresent = true;
						}
					}
					if (BooleanUtils.isFalse(isPresent)) {
						yoroGroupsList.add(y);
					}
				}
			} else {
				yoroGroupsList = yoroGroupList;
			}

			if (user != null) {
				List<YoroGroupsUsers> yoroGroupsUsersList = new ArrayList<>();
				yoroGroupsList.stream().forEach(y -> {
					YoroGroupsUsers yoroGroupsUsers = constructYoroGroupsUserVOToDTO();
					yoroGroupsUsers.setUsers(user);
					yoroGroupsUsers.setYoroGroups(y);
					yoroGroupsUsersList.add(yoroGroupsUsers);
				});
				if (!yoroGroupsUsersList.isEmpty()) {
					yoroGroupsUsersRepository.saveAll(yoroGroupsUsersList);
				}
			}
		}
	}

	private YoroGroupsUsers constructYoroGroupsUserVOToDTO() {
		Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());
		return YoroGroupsUsers.builder().tenantId(YorosisContext.get().getTenantId())
				.createdBy(YorosisContext.get().getUserName()).createdOn(currentTimestamp)
				.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(currentTimestamp)
				.activeFlag(YoroappsConstants.YES).teamOwner(YoroappsConstants.YES).build();
	}

	private YoroGroups constructYoroGroupsVOToDTO(YoroGroupsVO yoroGroupsVO) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return YoroGroups.builder().id(yoroGroupsVO.getId()).groupName(yoroGroupsVO.getName())
				.description(yoroGroupsVO.getDescription()).tenantId(YorosisContext.get().getTenantId())
				.createdBy(YorosisContext.get().getUserName()).createdOn(timestamp)
				.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp).activeFlag(YoroappsConstants.YES)
				.managedFlag(YoroappsConstants.NO).build();
	}

	private WorkspaceSecurity constructSecurityVOtoDTO() {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return WorkspaceSecurity.builder().modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp)
				.createdBy(YorosisContext.get().getUserName()).createdOn(timestamp)
				.tenantId(YorosisContext.get().getTenantId()).activeFlag(YoroappsConstants.YES).workspace(null).build();
	}

	private void saveWorkspaceSecurity(UUID workspaceId, List<YoroGroups> workspaceGroupsList) {
		WorkSpace workspace = workspaceRepository.getBasedonIdAndTenantIdAndActiveFlag(workspaceId,
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		List<WorkspaceSecurity> workspaceSecurityList = new ArrayList<>();
		if (workspace != null && !StringUtils.equals(workspace.getSecuredWorkspaceFlag(), YorosisConstants.YES)) {
			WorkspaceSecurity workspaceSecurity = constructSecurityVOtoDTO();
			workspaceSecurity.setWorkspace(workspace);
			workspaceGroupsList.stream().forEach(ws -> {
				workspaceSecurity.setYoroGroups(ws);
				workspaceSecurityList.add(workspaceSecurity);
			});
			if (workspaceSecurityList != null && !workspaceSecurityList.isEmpty()) {
				workspaceSecurityRepository.saveAll(workspaceSecurityList);
			}
		}
	}

	private ResponseStringVO saveTeams(List<YoroGroupsVO> yoroGroupsVOList, Map<UUID, YoroGroups> groupIdMap,
			Map<String, YoroGroups> groupNameMap, List<YoroGroups> workspaceGroupsList, UUID workspaceId,
			Set<YoroGroupMapVo> groupNameList) {
		LicenseVO licenseVO = isAllowed(yoroGroupsVOList.size());
		if (StringUtils.equals(licenseVO.getResponse(), "within the limit")) {
			List<YoroGroups> yoroGroupsList = yoroGroupsVOList.stream().map(this::constructYoroGroupsVOToDTO)
					.collect(Collectors.toList());
			if (!yoroGroupsList.isEmpty()) {
				yoroGroupsList = yoroGroupsRepository.saveAll(yoroGroupsList);
				yoroGroupsList.stream().forEach(yg -> {
					groupIdMap.put(yg.getId(), yg);
					groupNameMap.put(yg.getGroupName(), yg);
					groupNameList
							.add(YoroGroupMapVo.builder().groupName(yg.getGroupName()).yoroGroups(yg.getId()).build());
				});
				workspaceGroupsList.addAll(yoroGroupsList);
//				saveGroupUsers(yoroGroupsList);
				saveWorkspaceSecurity(workspaceId, workspaceGroupsList);
			}
			return ResponseStringVO.builder().response("Teams Created Successfully").build();
		} else {
			return ResponseStringVO.builder().response("You have exceeded your limit").build();
		}
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public InstallableApps getInstallAppsById(UUID appId) {
		return installableAppsRepository.getInstallableAppsById(appId, YoroappsConstants.YES,
				YorosisContext.get().getTenantId());
	}

	@Transactional
	public ResponseStringVO saveInstalleableApps(UUID workspaceId, InstallableApps installableApps)
			throws YoroappsException, IOException {
		if (installableApps != null) {
			List<UUID> workspaceSecurityGroupUUIDList = workspaceSecurityRepository
					.getGroupIDUUIDListBasedonWorkspaceIdTenantIdAndActiveFlag(workspaceId,
							YorosisContext.get().getTenantId(), YoroappsConstants.YES);
			List<YoroGroups> groupsList = yoroGroupsRepository.getAllYoroGroups(YorosisContext.get().getTenantId(),
					YoroappsConstants.YES);
			List<YoroGroups> workspaceGroupsList = new ArrayList<>();
			List<YoroGroupsVO> yoroGroupsVOList = new ArrayList<>();
			Map<UUID, YoroGroups> groupIdMap = new HashMap<>();
			Map<String, YoroGroups> groupNameMap = new HashMap<>();
			Set<YoroGroupMapVo> groupNameList = new HashSet<YoroGroupMapVo>();
			ResponseStringVO responseStringVO = null;
			JsonNode template = installableApps.getTemplateData();
			if (template != null) {
				if (template.has("teams") && template.get("teams").isArray()) {
					JsonNode securityList = template.get("teams");
					for (final JsonNode security : securityList) {
						mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
						YoroGroupsVO yoroGroupsVO = mapper.treeToValue(security, YoroGroupsVO.class);
						if (yoroGroupsVO != null && groupsList != null) {
							Boolean mapped = false;
							for (YoroGroups g : groupsList) {
								if (StringUtils.equals(yoroGroupsVO.getName(), g.getGroupName())) {
									mapped = true;
									groupIdMap.put(yoroGroupsVO.getId(), g);
									groupNameMap.put(yoroGroupsVO.getName(), g);
									groupNameList.add(YoroGroupMapVo.builder().groupName(yoroGroupsVO.getName())
											.yoroGroups(g.getId()).build());
									if (!workspaceSecurityGroupUUIDList.contains(g.getId())) {
										workspaceGroupsList.add(g);
									}
								}
							}
							if (BooleanUtils.isFalse(mapped)) {
								yoroGroupsVOList.add(yoroGroupsVO);
							}
						}
					}
					responseStringVO = saveTeams(yoroGroupsVOList, groupIdMap, groupNameMap, workspaceGroupsList,
							workspaceId, groupNameList);
					if (StringUtils.contains(responseStringVO.getResponse(), "You have exceeded your limit")) {
						return responseStringVO;
					}
				}
				List<YoroGroupMapVo> groupList = new ArrayList<YoroGroupMapVo>();
				groupList.addAll(groupNameList);
				saveGroupUsers(groupList);
				AppsVo appsVo = AppsVo.builder().groupIdMap(null).groupNameMap(groupList).templateNode(template)
						.workspaceId(workspaceId).build();
				if (template.has("page") && template.get("page").isArray()) {
					List<UUID> pageIdLists = new ArrayList<>();
					List<String> pageIdList = pageRepository.getPageId(YoroappsConstants.YES,
							YorosisContext.get().getTenantId());
					JsonNode pageList = template.get("page");
					Map<UUID, List<PermissionVO>> securityListVOList = new HashMap<>();
					for (final JsonNode page : pageList) {
						if (page.has("pageVo") && !page.get("pageVo").isNull()) {
							mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
							PageVO pageVo = mapper.treeToValue(page.get("pageVo"), PageVO.class);
							if (!pageIdList.contains(pageVo.getPageId())) {
								responseStringVO = pageService.savePage(pageVo, workspaceId, true);
								pageIdLists.add(responseStringVO.getPageId());
							}
						}
						if (page.has("security") && !page.get("security").isNull()) {
							JsonNode securityList = page.get("security");
							if (securityList.isArray()) {
								List<PermissionVO> securityListVoList = new ArrayList<>();
								for (final JsonNode security : securityList) {
									PermissionVO securityListVO = mapper.treeToValue(security, PermissionVO.class);
									if (securityListVO != null) {
										securityListVoList.add(securityListVO);
									}
								}
								securityListVOList.put(responseStringVO.getPageId(), securityListVoList);
							}
						}
					}
					if (!pageIdLists.isEmpty() && securityListVOList != null && !securityListVOList.isEmpty()) {
						List<Page> pageLists = pageRepository.getPageByIdList(pageIdLists, YorosisConstants.YES,
								YorosisContext.get().getTenantId());
						if (pageLists != null && !pageLists.isEmpty()) {
							List<PagePermissions> pagePermissionsList = new ArrayList<>();
							pageLists.stream().forEach(p -> {
								List<PermissionVO> securityListVoList = securityListVOList.get(p.getId());
								if (securityListVoList != null && !securityListVoList.isEmpty()) {
									securityListVoList.stream().forEach(s -> {
										PagePermissions pagePermissions = constructPagePermissionsVOToDTO(p, s);
										YoroGroups yoroGroups = groupNameMap.get(s.getGroupId());
										pagePermissions.setYoroGroups(yoroGroups);
										pagePermissionsList.add(pagePermissions);
									});
								}
							});
							if (pagePermissionsList != null && !pagePermissionsList.isEmpty()) {
								pagePermissionsRepository.saveAll(pagePermissionsList);
							}
						}
					}
				}
				if (template.has("tableObject") && template.get("tableObject").isArray()) {
					JsonNode tableObjectsList = template.get("tableObject");
					List<TableObjectsVO> tableObjectsVOList = new ArrayList<>();
					for (final JsonNode tableObjects : tableObjectsList) {
						mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
						TableObjectsVO tableObjectsVo = mapper.treeToValue(tableObjects, TableObjectsVO.class);
						tableObjectsVOList.add(tableObjectsVo);
					}
					if (tableObjectsVOList != null && !tableObjectsVOList.isEmpty()) {
						tableObjectsService.saveTableObjectsList(tableObjectsVOList);
					}
				}
				responseStringVO = saveInstallableApps(appsVo);
				if (StringUtils.equals(responseStringVO.getResponse(), "You have exceeded your limit") || StringUtils
						.equals(responseStringVO.getResponse(), "App already installed in this workspace")) {
					return responseStringVO;
				}
			}
		} else {
			return ResponseStringVO.builder().response("no app found").build();
		}
		return ResponseStringVO.builder().response("App installed successfully").build();
	}
	
	private ResponseStringVO saveInstallableApps(AppsVo appsVo) {
		return workflowClientService.saveInstallableApps(YorosisContext.get().getToken(), appsVo);
	}

	private ResponseStringVO saveTaskBoard(AppsVo appsVo) {
		return workflowClientService.saveTaskboardApp(YorosisContext.get().getToken(), appsVo);
	}

	private ResponseStringVO saveWorkflowBoard(AppsVo appsVo) {
		return workflowClientService.saveWorkflowApp(YorosisContext.get().getToken(), appsVo);
	}

	private PagePermissions constructPagePermissionsVOToDTO(Page page, PermissionVO pagePermissionsVO) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());

		return PagePermissions.builder().page(page).tenantId(YorosisContext.get().getTenantId())
				.readAllowed(booleanToChar(pagePermissionsVO.getReadAllowed()))
				.updateAllowed(booleanToChar(pagePermissionsVO.getUpdateAllowed())).createdOn(timestamp)
				.activeFlag(YoroappsConstants.YES).createdBy(YorosisContext.get().getUserName())
				.createAllowed(booleanToChar(pagePermissionsVO.getCreateAllowed()))
				.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp)
				.deleteAllowed(booleanToChar(pagePermissionsVO.getDeleteAllowed())).build();
	}

	private String booleanToChar(boolean value) {
		return value ? YoroappsConstants.YES : YoroappsConstants.NO;
	}

}
