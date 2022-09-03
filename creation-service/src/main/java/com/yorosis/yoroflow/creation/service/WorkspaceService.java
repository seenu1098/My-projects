package com.yorosis.yoroflow.creation.service;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import com.yorosis.yoroapps.entities.LoginHistory;
import com.yorosis.yoroapps.entities.Users;
import com.yorosis.yoroapps.entities.WorkSpace;
import com.yorosis.yoroapps.entities.WorkspaceSecurity;
import com.yorosis.yoroapps.vo.GroupVO;
import com.yorosis.yoroapps.vo.LicenseVO;
import com.yorosis.yoroapps.vo.OrgSummaryReportVo;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.SubscriptionExpireVO;
import com.yorosis.yoroapps.vo.TaskboardNamesVO;
import com.yorosis.yoroapps.vo.UsersVO;
import com.yorosis.yoroapps.vo.WorkflowNamesVO;
import com.yorosis.yoroapps.vo.WorkspaceDetailsVo;
import com.yorosis.yoroapps.vo.WorkspaceSecurityNamesVO;
import com.yorosis.yoroapps.vo.WorkspaceSecurityVo;
import com.yorosis.yoroapps.vo.WorkspaceVO;
import com.yorosis.yoroapps.vo.YorDocsNamesVo;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.LoginHistoryRepository;
import com.yorosis.yoroflow.creation.repository.UsersRepository;
import com.yorosis.yoroflow.creation.repository.WorkspaceRepository;
import com.yorosis.yoroflow.creation.repository.WorkspaceSecurityRepository;
import com.yorosis.yoroflow.creation.repository.YoroGroupsRepository;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class WorkspaceService {

	@Autowired
	private WorkspaceRepository workspaceRepository;

	@Autowired
	private YoroGroupsRepository yoroGroupsRepository;

	@Autowired
	private WorkspaceSecurityRepository workspaceSecurityRepository;

	@Autowired
	private WorkflowClientService workflowClientService;

	@Autowired
	private UserService userService;

	@Autowired
	private UsersRepository userRepository;

	@Autowired
	private LoginHistoryRepository loginHistoryRepository;

	@Autowired
	private ProxyService proxyService;

	private WorkSpace construcVOtoDTO(WorkspaceVO workspaceVO) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return WorkSpace.builder().modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp)
				.createdBy(YorosisContext.get().getUserName()).createdOn(timestamp)
				.securedWorkspaceFlag(booleanToChar(workspaceVO.isSecuredWorkspaceFlag()))
				.workspaceName(workspaceVO.getWorkspaceName()).workspaceKey(workspaceVO.getWorkspaceKey())
				.tenantId(YorosisContext.get().getTenantId()).activeFlag(YoroappsConstants.YES)
				.defaultWorkspace(YorosisConstants.NO).archiveWorkspace(YorosisConstants.NO)
				.workspaceUniqueId(workspaceVO.getWorkspaceUniqueId()).managedWorkspace(YorosisConstants.NO)
				.workspaceAvatar(workspaceVO.getWorkspaceAvatar()).build();
	}

	private WorkspaceVO construcDTOtoVO(WorkSpace workSpace) {
		return WorkspaceVO.builder().workspaceId(workSpace.getId()).workspaceAvatar(workSpace.getWorkspaceAvatar())
				.securedWorkspaceFlag(charToBoolean(workSpace.getSecuredWorkspaceFlag()))
				.workspaceName(workSpace.getWorkspaceName()).workspaceKey(workSpace.getWorkspaceKey())
				.defaultWorkspace(false).managedWorkspace(charToBoolean(workSpace.getDefaultWorkspace()))
				.taskboard(TaskboardNamesVO.builder().workspaceId(workSpace.getId()).taskboardCount(0).build())
				.workflow(WorkflowNamesVO.builder().workspaceId(workSpace.getId()).workflowCount(0).build())
				.yoroDocs(YorDocsNamesVo.builder().yoroDocsCount(0).workspaceId(workSpace.getId()).build())
				.workspaceUniqueId(workSpace.getWorkspaceUniqueId()).build();
	}

	private WorkspaceSecurity constructSecurityVOtoDTO() {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return WorkspaceSecurity.builder().modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp)
				.createdBy(YorosisContext.get().getUserName()).createdOn(timestamp)
				.tenantId(YorosisContext.get().getTenantId()).activeFlag(YoroappsConstants.YES).workspace(null).build();
	}

	@Transactional
	public ResponseStringVO saveAndUpdateWorkspace(WorkspaceVO workspaceVO) {
		String currentTenantId = YorosisContext.get().getTenantId();

		LicenseVO licenseVO = proxyService.isAllowed(currentTenantId, "general", "workspace");

		Long allWorkspaceCount = workspaceRepository.totalWorkspaceCount(currentTenantId, YorosisConstants.YES);

		if (allWorkspaceCount < licenseVO.getAllowedLimit()) {
			if (workspaceVO.getWorkspaceId() == null) {
				WorkSpace workSpace = workspaceRepository.save(construcVOtoDTO(workspaceVO));
				saveDefaultOwner(workspaceVO.getWorkspaceSecurityVO(), workSpace);
				saveOwners(workspaceVO.getWorkspaceSecurityVO(), workSpace, false);
				saveSecurity(workspaceVO.getWorkspaceSecurityVO(), workSpace, false);
				return ResponseStringVO.builder().pageId(workSpace.getId()).response("Workspace Created successfully")
						.build();
			} else {
				WorkSpace workSpace = workspaceRepository.getBasedonIdAndTenantIdAndActiveFlag(
						workspaceVO.getWorkspaceId(), YorosisContext.get().getTenantId(), YoroappsConstants.YES);
				if (workSpace != null) {
					Timestamp timestamp = new Timestamp(System.currentTimeMillis());
					workSpace.setModifiedBy(YorosisContext.get().getUserName());
					workSpace.setWorkspaceKey(workspaceVO.getWorkspaceKey());
					workSpace.setWorkspaceName(workspaceVO.getWorkspaceName());
					if (!StringUtils.isEmpty(workspaceVO.getWorkspaceAvatar())) {
						workSpace.setWorkspaceAvatar(workspaceVO.getWorkspaceAvatar());
						workSpace.setSecuredWorkspaceFlag(booleanToChar(workspaceVO.isSecuredWorkspaceFlag()));
					}
					workSpace.setModifiedOn(timestamp);
					workspaceRepository.save(workSpace);
					return ResponseStringVO.builder().pageId(workSpace.getId())
							.response("Workspace Updated successfully").build();
				}
			}
		} else {
			return ResponseStringVO.builder().response("Workspace limit exceeded").build();
		}
		return ResponseStringVO.builder().build();
	}

	@Transactional
	public ResponseStringVO saveWorkspaceAvatar(WorkspaceVO workspaceVO) {
		WorkSpace workSpace = workspaceRepository.getBasedonIdAndTenantIdAndActiveFlag(workspaceVO.getWorkspaceId(),
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		if (workSpace != null) {
			Timestamp timestamp = new Timestamp(System.currentTimeMillis());
			workSpace.setModifiedBy(YorosisContext.get().getUserName());
			workSpace.setWorkspaceAvatar(workspaceVO.getWorkspaceAvatar());
			workSpace.setModifiedOn(timestamp);
			workspaceRepository.save(workSpace);
			return ResponseStringVO.builder().pageId(workSpace.getId())
					.response("Workspace Avatar Updated successfully").build();
		}
		return ResponseStringVO.builder().pageId(null).response("Workspace does not esists").build();
	}

	@Transactional
	public List<WorkspaceVO> getWorkspaceList() throws IOException {
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> groupIdList = getGroupIdList(userVO);
		List<WorkspaceVO> workspaceVOList = new ArrayList<>();
		List<WorkSpace> workspaceList = workspaceRepository.getListBasedonTenantIdAndActiveFlag(
				YorosisContext.get().getTenantId(), YoroappsConstants.YES, userVO.getUserId(), groupIdList);
		if (!workspaceList.isEmpty()) {
			WorkspaceDetailsVo workspaceDetailsVo = getNamesForWorkspace();
			List<TaskboardNamesVO> taskboardNamesVOList = workspaceDetailsVo.getTaskboardNamesVOList();
			List<WorkflowNamesVO> workflowNamesVOList = workspaceDetailsVo.getWorkflowNamesVOList();
			List<YorDocsNamesVo> yorDocsNamesVoList = workspaceDetailsVo.getYorDocsNamesVoList();
			WorkSpace defaultWorkspace = workspaceRepository.getDefaultWorkspace(YorosisContext.get().getTenantId(),
					YoroappsConstants.YES, userVO.getUserId());
			List<Object[]> workspacesecurityGroupList = workspaceSecurityRepository
					.getListBasedonWorkspaceIdTenantIdAndActiveFlag(YorosisContext.get().getTenantId(),
							YoroappsConstants.YES);
			List<Object[]> workspacesecurityUserList = workspaceSecurityRepository
					.getOwnerListBasedonWorkspaceIdTenantIdAndActiveFlag(YorosisContext.get().getTenantId(),
							YoroappsConstants.YES);
			workspaceVOList = workspaceList.stream().map(this::construcDTOtoVO).collect(Collectors.toList());
			workspaceVOList.stream().forEach(t -> {
				taskboardNamesVOList.stream().forEach(tb -> {
					if (tb.getWorkspaceId() != null
							&& StringUtils.equals(tb.getWorkspaceId().toString(), t.getWorkspaceId().toString())) {
						t.setTaskboard(tb);
					}
				});
				t.setWorkspaceSecurityVO(getWorkspaceSecurity(t.getWorkspaceId(), workspacesecurityGroupList,
						workspacesecurityUserList));
				if (defaultWorkspace != null
						&& StringUtils.equals(defaultWorkspace.getId().toString(), t.getWorkspaceId().toString())) {
					t.setDefaultWorkspace(true);
				}
			});
			workspaceVOList.stream().forEach(t -> {
				workflowNamesVOList.stream().forEach(tb -> {
					if (tb.getWorkspaceId() != null
							&& StringUtils.equals(tb.getWorkspaceId().toString(), t.getWorkspaceId().toString())) {
						t.setWorkflow(tb);
					}
				});
				yorDocsNamesVoList.stream().forEach(tb -> {
					if (tb.getWorkspaceId() != null
							&& StringUtils.equals(tb.getWorkspaceId().toString(), t.getWorkspaceId().toString())) {
						t.setYoroDocs(tb);
					}
				});
			});
		}
		return workspaceVOList;
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public List<WorkspaceVO> getAllWorkspaceList(String tenantId) throws IOException {
		List<WorkspaceVO> workspaceVOList = new ArrayList<>();
		List<WorkSpace> workspaceList = workspaceRepository
				.getAllListBasedonTenantIdAndActiveFlag(YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		if (!workspaceList.isEmpty()) {
			WorkspaceDetailsVo workspaceDetailsVo = getAllNamesForWorkspace(tenantId);
			List<TaskboardNamesVO> taskboardNamesVOList = workspaceDetailsVo.getTaskboardNamesVOList();
			List<WorkflowNamesVO> workflowNamesVOList = workspaceDetailsVo.getWorkflowNamesVOList();
			List<YorDocsNamesVo> yorDocsNamesVoList = workspaceDetailsVo.getYorDocsNamesVoList();
			List<Object[]> workspacesecurityGroupList = workspaceSecurityRepository
					.getListBasedonWorkspaceIdTenantIdAndActiveFlag(YorosisContext.get().getTenantId(),
							YoroappsConstants.YES);
			List<Object[]> workspacesecurityUserList = workspaceSecurityRepository
					.getOwnerListBasedonWorkspaceIdTenantIdAndActiveFlag(YorosisContext.get().getTenantId(),
							YoroappsConstants.YES);
			workspaceVOList = workspaceList.stream().map(this::construcDTOtoVO).collect(Collectors.toList());
			workspaceVOList.stream().forEach(t -> {
				taskboardNamesVOList.stream().forEach(tb -> {
					if (tb.getWorkspaceId() != null
							&& StringUtils.equals(tb.getWorkspaceId().toString(), t.getWorkspaceId().toString())) {
						t.setTaskboard(tb);
					}
				});
				t.setWorkspaceSecurityVO(getWorkspaceSecurity(t.getWorkspaceId(), workspacesecurityGroupList,
						workspacesecurityUserList));
			});
			workspaceVOList.stream().forEach(t -> {
				workflowNamesVOList.stream().forEach(tb -> {
					if (tb.getWorkspaceId() != null
							&& StringUtils.equals(tb.getWorkspaceId().toString(), t.getWorkspaceId().toString())) {
						t.setWorkflow(tb);
					}
				});
				yorDocsNamesVoList.stream().forEach(tb -> {
					if (tb.getWorkspaceId() != null
							&& StringUtils.equals(tb.getWorkspaceId().toString(), t.getWorkspaceId().toString())) {
						t.setYoroDocs(tb);
					}
				});
			});
		}
		return workspaceVOList;
	}

	private WorkspaceSecurityVo getWorkspaceSecurity(UUID workspaceId, List<Object[]> workspacesecurityGroupList,
			List<Object[]> workspacesecurityUserList) {
		List<WorkspaceSecurityNamesVO> workspacesecurityGroupListVO = new ArrayList<>();
		List<WorkspaceSecurityNamesVO> workspacesecurityOwnersListVO = new ArrayList<>();
		if (workspacesecurityGroupList != null) {
			workspacesecurityGroupList.stream().forEach(ws -> {
				if (StringUtils.equals(((UUID) ws[0]).toString(), workspaceId.toString())) {
					if ((UUID) ws[1] != null) {
						workspacesecurityGroupListVO.add(constructGroupNames(ws));
					}
				}
			});
		}
		if (workspacesecurityUserList != null) {
			workspacesecurityUserList.stream().forEach(wsu -> {
				if (StringUtils.equals(((UUID) wsu[0]).toString(), workspaceId.toString())) {
					if ((UUID) wsu[1] != null) {
						workspacesecurityOwnersListVO.add(constructUserNames(wsu));
					}
				}
			});
		}
		return WorkspaceSecurityVo.builder().assignOwnerList(workspacesecurityOwnersListVO)
				.assignTeamList(workspacesecurityGroupListVO).build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public OrgSummaryReportVo getOrgUserTeamsList() throws IOException {
		Long userCount = 0L;
		Long teamsCount = 0L;
		userCount = userRepository.getAllActiveUsersCount(YorosisContext.get().getTenantId(), YorosisConstants.YES);
		teamsCount = yoroGroupsRepository.getAllYoroGroupsCountWithoutManagedFlag(YorosisContext.get().getTenantId(),
				YorosisConstants.YES);
		List<LoginHistory> loginHistoryList = loginHistoryRepository.findLatestLoggedInUserDetails(YorosisConstants.YES,
				YorosisContext.get().getTenantId(), PageRequest.of(0, 1));
		if (loginHistoryList != null && !loginHistoryList.isEmpty()) {
			LoginHistory loginHistory = loginHistoryList.get(0);
			return OrgSummaryReportVo.builder().teamsCount(teamsCount).activeUsersCount(userCount)
					.lastLoggedInUserDateAndTime(loginHistory.getCraetedDate())
					.userColor(loginHistory.getUsers().getColor())
					.lastLoggedInUser(
							loginHistory.getUsers().getFirstName() + " " + loginHistory.getUsers().getLastName())
					.build();
		}
		return OrgSummaryReportVo.builder().teamsCount(teamsCount).activeUsersCount(userCount)
				.lastLoggedInUserDateAndTime(null).lastLoggedInUser(null).userColor(null).build();
	}

	private WorkspaceSecurityNamesVO constructGroupNames(Object[] taskboardNamesVo) {
		return WorkspaceSecurityNamesVO.builder().id((UUID) taskboardNamesVo[1]).name((String) taskboardNamesVo[2])
				.build();
	}

	private WorkspaceSecurityNamesVO constructUserNames(Object[] taskboardNamesVo) {
		return WorkspaceSecurityNamesVO.builder().id((UUID) taskboardNamesVo[1])
				.name((String) taskboardNamesVo[2] + " " + (String) taskboardNamesVo[3]).build();
	}

	@Transactional
	public WorkspaceVO getWorkspaceById(UUID id) throws IOException {
		WorkSpace workspace = workspaceRepository.getBasedonIdAndTenantIdAndActiveFlag(id,
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		if (workspace != null) {
			WorkspaceVO workspaceVo = construcDTOtoVO(workspace);
			return workspaceVo;
		}
		return null;
	}

	@Transactional
	public WorkspaceVO getDefaultWorkspace() throws IOException {
		UsersVO userVO = userService.getLoggedInUserDetails();
		WorkSpace workspace = workspaceRepository.getDefaultWorkspace(YorosisContext.get().getTenantId(),
				YoroappsConstants.YES, userVO.getUserId());
		if (workspace != null) {
			WorkspaceVO workspaceVo = construcDTOtoVO(workspace);
			return workspaceVo;
		} else {
			workspace = workspaceRepository.getDefaultWorkspaceNotExists(YorosisContext.get().getTenantId(),
					YoroappsConstants.YES);
			if (workspace != null) {
				WorkspaceVO workspaceVo = construcDTOtoVO(workspace);
				return workspaceVo;
			}
		}
		return WorkspaceVO.builder().build();
	}

	@Transactional
	public WorkspaceVO getWorkspace(String workspaceKey) throws IOException {
		List<WorkSpace> workspaceList = workspaceRepository.getWorkspaceByKey(workspaceKey,
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		if (workspaceList != null && !workspaceList.isEmpty()) {
			WorkspaceVO workspaceVo = construcDTOtoVO(workspaceList.get(0));
			return workspaceVo;
		}
		return null;
	}

	@Transactional
	public WorkspaceVO getWorkspaceByUniqueId(String workspaceUniqueId) throws IOException {
		List<WorkSpace> workspaceList = workspaceRepository.getWorkspaceByKey(workspaceUniqueId,
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		if (workspaceList != null && !workspaceList.isEmpty()) {
			WorkspaceVO workspaceVo = construcDTOtoVO(workspaceList.get(0));
			return workspaceVo;
		} else {
			return getDefaultWorkspace();
		}
	}

	@Transactional
	public ResponseStringVO checkWorkspaceByUniqueId(String workspaceUniqueId) throws IOException {
		String message = null;
		int name = workspaceRepository.checkWorkspaceByUniqueKey(workspaceUniqueId, YorosisContext.get().getTenantId(),
				YorosisConstants.YES);
		if (name > 0) {
			message = String.format("Workspace Unique [%s] already exist", workspaceUniqueId);
		} else {
			message = String.format("Workspace Unique [%s] does not exist", workspaceUniqueId);
		}

		return ResponseStringVO.builder().response(message).build();
	}

	@Transactional
	public ResponseStringVO checkWorkspaceByName(String workspaceName) {
		String message = null;
		int name = workspaceRepository.getWorkspaceName(workspaceName, YorosisContext.get().getTenantId(),
				YorosisConstants.YES);
		if (name > 0) {
			message = String.format("Workspace [%s] already exist", workspaceName);
		} else {
			message = String.format("Workspace [%s] does not exist", workspaceName);
		}

		return ResponseStringVO.builder().response(message).build();
	}

	@Transactional
	public ResponseStringVO addDefaultWorkspace(UUID workspaceId) {
		String message = null;
		Users users = userRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
				YorosisContext.get().getUserName(), YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		if (users != null && workspaceId != null) {
			users.setDefaultWorkspace(workspaceId);
			userRepository.save(users);
			message = String.format("Added as default workspace");
		} else {
			message = "Users does not exist";
		}
		return ResponseStringVO.builder().response(message).build();
	}

	@Transactional
	public ResponseStringVO deleteWorkspace(UUID workspaceId) {
		String message = null;

		WorkSpace workSpace = workspaceRepository.getBasedonIdAndTenantIdAndActiveFlag(workspaceId,
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (workSpace != null) {
			workSpace.setActiveFlag(YorosisConstants.NO);
			workspaceRepository.save(workSpace);
			message = "Workspace deleted successfully";
		} else {
			message = "Workspace does not exists";
		}
		return ResponseStringVO.builder().response(message).build();
	}

	@Transactional
	public ResponseStringVO archiveWorkspace(UUID workspaceId) {
		String message = null;

		WorkSpace workSpace = workspaceRepository.getBasedonIdAndTenantIdAndActiveFlag(workspaceId,
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (workSpace != null) {
			workSpace.setArchiveWorkspace(YorosisConstants.YES);
			workspaceRepository.save(workSpace);
			message = "Workspace Archived successfully";
		} else {
			message = "Workspace does not exists";
		}
		return ResponseStringVO.builder().response(message).build();
	}

	@Transactional
	public ResponseStringVO getWorkspaceSecurityUpdate(WorkspaceSecurityVo workspaceSecurityVo) {
		if (workspaceSecurityVo != null) {
			WorkSpace workspace = workspaceRepository.getBasedonIdAndTenantIdAndActiveFlag(
					workspaceSecurityVo.getWorkspaceId(), YorosisContext.get().getTenantId(), YoroappsConstants.YES);
			if (workspace != null) {
				saveOwners(workspaceSecurityVo, workspace, true);
				return saveSecurity(workspaceSecurityVo, workspace, true);
			}
			return ResponseStringVO.builder().response("Security updated successfully").build();
		}
		return ResponseStringVO.builder().build();
	}

	private ResponseStringVO saveSecurity(WorkspaceSecurityVo workspaceSecurityVo, WorkSpace workSpace,
			Boolean checkSecurity) {
		if (workspaceSecurityVo != null) {
			if (workspaceSecurityVo.getSecuredWorkspaceFlag() != null
					&& BooleanUtils.isTrue(workspaceSecurityVo.getSecuredWorkspaceFlag())) {
				workSpace.setSecuredWorkspaceFlag(YorosisConstants.YES);
			}
			if (workspaceSecurityVo != null && workspaceSecurityVo.getAssignTeamList() != null
					&& !workspaceSecurityVo.getAssignTeamList().isEmpty()) {
				List<WorkspaceSecurity> workspaceSecurityList = workspaceSecurityRepository
						.getGroupIDListBasedonWorkspaceIdTenantIdAndActiveFlag(workSpace.getId(),
								YorosisContext.get().getTenantId(), YoroappsConstants.YES);
				if (workspaceSecurityList != null && !workspaceSecurityList.isEmpty()) {
					workspaceSecurityRepository.deleteAll(workspaceSecurityList);
				}
				workspaceSecurityVo.getAssignTeamList().stream().forEach(ws -> {
					WorkspaceSecurity workspaceSecurity = constructSecurityVOtoDTO();
					workspaceSecurity.setWorkspace(workSpace);
					workspaceSecurity.setYoroGroups(yoroGroupsRepository.findByIdAndTenantIdAndActiveFlagIgnoreCase(
							ws.getId(), YorosisContext.get().getTenantId(), YoroappsConstants.YES));
					workspaceSecurityRepository.save(workspaceSecurity);
				});
			}
			if (workspaceSecurityVo != null && workspaceSecurityVo.getRemovedTeamList() != null
					&& !workspaceSecurityVo.getRemovedTeamList().isEmpty()) {
				List<WorkspaceSecurity> workspaceSecurityList = workspaceSecurityRepository
						.getListBasedonGroupIdAndWorkspaceIdTenantIdAndActiveFlag(
								workspaceSecurityVo.getRemovedTeamList(), workSpace.getId(),
								YorosisContext.get().getTenantId(), YoroappsConstants.YES);
				if (!workspaceSecurityList.isEmpty()) {
					workspaceSecurityRepository.deleteAll(workspaceSecurityList);
				}

			}
//				if (BooleanUtils.isTrue(checkSecurity)) {
//					List<WorkspaceSecurity> workspaceSecurityList = workspaceSecurityRepository
//							.getGroupIDListBasedonWorkspaceIdTenantIdAndActiveFlag(workSpace.getId(),
//									YorosisContext.get().getTenantId(), YoroappsConstants.YES);
//					if (workspaceSecurityList == null || workspaceSecurityList.isEmpty()) {
//						workSpace.setSecuredWorkspaceFlag(YorosisConstants.NO);
//					} else {
//						workSpace.setSecuredWorkspaceFlag(YorosisConstants.YES);
//					}
//				}
		}
		workspaceRepository.save(workSpace);
		return ResponseStringVO.builder().response("Security updated successfully").build();
	}

	private void saveDefaultOwner(WorkspaceSecurityVo workspaceSecurityVo, WorkSpace workSpace) {
		if (workspaceSecurityVo == null || workspaceSecurityVo.getAssignOwnerList() == null
				|| workspaceSecurityVo.getAssignOwnerList().isEmpty()) {
			WorkspaceSecurity workspaceSecurity = constructSecurityVOtoDTO();
			workspaceSecurity.setWorkspace(workSpace);
			workspaceSecurity
					.setUsers(userRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
							YorosisContext.get().getUserName(), YorosisContext.get().getTenantId(),
							YoroappsConstants.YES));
			workspaceSecurityRepository.save(workspaceSecurity);
		}
	}

	private void saveOwners(WorkspaceSecurityVo workspaceSecurityVo, WorkSpace workSpace, Boolean checkSecurity) {
		if (workspaceSecurityVo != null && workspaceSecurityVo.getAssignOwnerList() != null
				&& !workspaceSecurityVo.getAssignOwnerList().isEmpty()) {
			workspaceSecurityVo.getAssignOwnerList().stream().forEach(ws -> {
				WorkspaceSecurity workspaceSecurity = constructSecurityVOtoDTO();
				workspaceSecurity.setWorkspace(workSpace);
				workspaceSecurity.setUsers(userRepository.findByUserIdAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(
						ws.getId(), YoroappsConstants.YES, YorosisContext.get().getTenantId()));
				workspaceSecurityRepository.save(workspaceSecurity);
			});
		}
		if (workspaceSecurityVo != null && workspaceSecurityVo.getRemovedOwnerList() != null
				&& !workspaceSecurityVo.getRemovedOwnerList().isEmpty()) {
			List<WorkspaceSecurity> workspaceSecurityList = workspaceSecurityRepository
					.getListBasedonUserIdAndWorkspaceIdTenantIdAndActiveFlag(workspaceSecurityVo.getRemovedOwnerList(),
							workSpace.getId(), YorosisContext.get().getTenantId(), YoroappsConstants.YES);
			if (!workspaceSecurityList.isEmpty()) {
				workspaceSecurityRepository.deleteAll(workspaceSecurityList);
			}
		}
		if (BooleanUtils.isTrue(checkSecurity)) {
			List<WorkspaceSecurity> workspaceSecurityList = workspaceSecurityRepository
					.getUserIdListBasedonWorkspaceIdTenantIdAndActiveFlag(workSpace.getId(),
							YorosisContext.get().getTenantId(), YoroappsConstants.YES);
			if (workspaceSecurityList == null || workspaceSecurityList.isEmpty()) {
				saveDefaultOwner(workspaceSecurityVo, workSpace);
			}
		}
	}

	private List<WorkflowNamesVO> getWorkflowNames() {
		return workflowClientService.getWorkflowNameList(YorosisContext.get().getToken());
	}

	private List<TaskboardNamesVO> getTaskboardNames() {
		return workflowClientService.getTaskboardNameList(YorosisContext.get().getToken());
	}

//	private List<YorDocsNamesVo> getYoroDocsNames() {
//		return workflowClientService.getYoroDocsNameList(YorosisContext.get().getToken());
//	}

	private WorkspaceDetailsVo getNamesForWorkspace() {
		return workflowClientService.getNamesListForWorkspace(YorosisContext.get().getToken());
	}

	private WorkspaceDetailsVo getAllNamesForWorkspace(String tenantId) {
		return workflowClientService.getAllNamesListForWorkspace(YorosisContext.get().getToken(), tenantId);
	}

	private List<UUID> getGroupIdList(UsersVO userVO) {
		List<GroupVO> listGroupVO = userVO.getGroupVOList();
		List<UUID> listUUID = new ArrayList<>();
		if (!CollectionUtils.isEmpty(listGroupVO)) {
			listUUID = listGroupVO.stream().map(GroupVO::getGroupId).collect(Collectors.toList());
		}
		return listUUID;
	}

	private String booleanToChar(boolean value) {
		return value ? YoroappsConstants.NO : YoroappsConstants.YES;
	}

	private boolean charToBoolean(String value) {
		return StringUtils.equalsIgnoreCase(YoroappsConstants.YES, value);
	}

	public LicenseVO isAllowed() {
		String currentTenantId = YorosisContext.get().getTenantId();

		LicenseVO licenseVO = proxyService.isAllowed(currentTenantId, "general", "workspace");

		Long allWorkspaceCount = workspaceRepository.totalWorkspaceCount(currentTenantId, YorosisConstants.YES);

		if (allWorkspaceCount < licenseVO.getAllowedLimit()) {
			licenseVO.setResponse("within the limit");
			return licenseVO;
		}
		licenseVO.setResponse("You have exceeded your limit");
		return licenseVO;
	}

	@Transactional
	public List<WorkspaceVO> getWorkspaceNamesList() {
		List<WorkSpace> workspaceList = workspaceRepository.getWorkspaceList(YorosisContext.get().getTenantId(),
				YoroappsConstants.YES);
		return workspaceList.stream().map(this::construcDTOtoVO).collect(Collectors.toList());
	}

	@Transactional
	public ResponseStringVO inactivateWorkpace(SubscriptionExpireVO subscriptionExpireVO) {
		String response = null;
		List<WorkSpace> workspaceList = workspaceRepository.getWorkspaceList(YorosisContext.get().getTenantId(),
				YoroappsConstants.YES);

		if (!workspaceList.isEmpty() && workspaceList.size() > 2) {
			List<WorkSpace> pickedWorkspaceList = workspaceRepository.workspaceToInactivate(
					subscriptionExpireVO.getWorkspaceIdList(), YorosisContext.get().getTenantId(),
					YorosisConstants.YES);
			pickedWorkspaceList.stream().forEach(t -> t.setActiveFlag(YorosisConstants.NO));
			workspaceRepository.saveAll(pickedWorkspaceList);
			response = "Removed picked workspaces";
		}
		return ResponseStringVO.builder().response(response).build();
	}

	private UsersVO constructWorkspaceSecurityToUsersVO(WorkspaceSecurity workspaceSecurity) {
		return UsersVO.builder().userId(workspaceSecurity.getUsers().getUserId())
				.color(workspaceSecurity.getUsers().getColor()).firstName(workspaceSecurity.getUsers().getFirstName())
				.lastName(workspaceSecurity.getUsers().getLastName()).build();
	}

	@Transactional
	public List<UsersVO> getWorkspaceUsers(UUID workspaceId) throws IOException {
		WorkSpace workSpace = workspaceRepository.checkDefaultWorkspace(workspaceId, YorosisContext.get().getTenantId(),
				YorosisConstants.YES);
		if (workSpace != null && StringUtils.equals(workSpace.getSecuredWorkspaceFlag(), YorosisConstants.NO)) {
			return userService.getAllUsers();
		} else {
			List<WorkspaceSecurity> workspaceSecurity = workspaceSecurityRepository
					.getUserIdListBasedonWorkspaceIdTenantIdAndActiveFlag(workspaceId,
							YorosisContext.get().getTenantId(), YorosisConstants.YES);
			return workspaceSecurity.stream().map(this::constructWorkspaceSecurityToUsersVO)
					.collect(Collectors.toList());
		}
	}

}
