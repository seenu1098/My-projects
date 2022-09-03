package com.yorosis.yoroflow.creation.table.service;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroapps.entities.TableObjects;
import com.yorosis.yoroapps.entities.TableObjectsSecurity;
import com.yorosis.yoroapps.entities.Users;
import com.yorosis.yoroapps.entities.YoroGroups;
import com.yorosis.yoroapps.vo.GroupVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.UsersVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.TableObjectSecurityRepository;
import com.yorosis.yoroflow.creation.repository.TableObjectsRepository;
import com.yorosis.yoroflow.creation.repository.UsersRepository;
import com.yorosis.yoroflow.creation.repository.YoroGroupsRepository;
import com.yorosis.yoroflow.creation.service.UserService;
import com.yorosis.yoroflow.creation.table.vo.TableSecurityVO;
import com.yorosis.yoroflow.creation.table.vo.TableSecurityVOList;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class TableObjectsSecurityService {

	@Autowired
	private TableObjectSecurityRepository tableObjectSecurityRepository;

	@Autowired
	private UsersRepository userRepository;

	@Autowired
	private YoroGroupsRepository yoroGroupsRepository;

	@Autowired
	private TableObjectsRepository tableObjectsRepository;

	@Autowired
	private UserService userService;

	private List<UUID> getGroupAsUUID(UsersVO userVO) {
		List<GroupVO> listGroupVO = userVO.getGroupVOList();

		if (listGroupVO.isEmpty()) {
			return java.util.Collections.emptyList();
		}

		return listGroupVO.stream().map(GroupVO::getGroupId).collect(Collectors.toList());
	}

	private String booleanToChar(boolean value) {
		return value ? YorosisConstants.YES : YorosisConstants.NO;
	}

	private boolean charToBoolean(String value) {
		return StringUtils.equalsIgnoreCase(YorosisConstants.YES, value);
	}

	private TableObjectsSecurity constructSecurityVOtoDTO() {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return TableObjectsSecurity.builder().modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp)
				.createdBy(YorosisContext.get().getUserName()).createdOn(timestamp)
				.tenantId(YorosisContext.get().getTenantId()).activeFlag(YorosisConstants.YES).build();
	}

	private TableSecurityVO constructSecurityVo(TableObjectsSecurity tableSecurity) {
		return TableSecurityVO.builder().groupId(tableSecurity.getYoroGroups().getId())
				.readAllowed(charToBoolean(tableSecurity.getReadAllowed()))
				.updateAllowed(charToBoolean(tableSecurity.getEditAllowed()))
				.deleteAllowed(charToBoolean(tableSecurity.getDeleteAllowed())).build();
	}

	@Transactional
	public ResponseStringVO saveDataTableSecurityDefaultGroup(TableObjects object) {
		TableObjectsSecurity tableObjectsSecurity = constructSecurityVOtoDTO();
		Users users = userRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
				YorosisContext.get().getUserName(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (users != null) {
			tableObjectsSecurity.setUsers(users);
			tableObjectsSecurity.setTableOwner(YorosisConstants.YES);
			tableObjectsSecurity.setReadAllowed(YorosisConstants.YES);
			tableObjectsSecurity.setEditAllowed(YorosisConstants.YES);
			tableObjectsSecurity.setTableObjects(object);
			tableObjectSecurityRepository.save(tableObjectsSecurity);
		}
		return ResponseStringVO.builder().response("Security Updated Successfully").build();
	}

	@Transactional
	public ResponseStringVO saveDataTableSecurity(TableSecurityVOList tableSecurityVOList) {
		TableObjects object = tableObjectsRepository.findByTableObjectsIdAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(
				tableSecurityVOList.getTableId(), YoroappsConstants.YES, YorosisContext.get().getTenantId());
		if (object != null) {
			deleteOwnersAndTeams(tableSecurityVOList);
			saveOrUpdateSecurity(tableSecurityVOList, object);
		}
		return ResponseStringVO.builder().response("Security Updated Successfully").build();
	}

	private void saveOrUpdateSecurity(TableSecurityVOList tableSecurityVOList, TableObjects object) {
		List<UUID> teamIDList = getTeamIDListForSave(tableSecurityVOList.getSecurityTeamVOList());
		List<TableObjectsSecurity> tableObjectsSecurityUpdateList = tableObjectSecurityRepository
				.getTableObjectsSecurityListBasedonTableIdTenantIdAndActiveFlag(tableSecurityVOList.getTableId(),
						YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (tableObjectsSecurityUpdateList != null && !tableObjectsSecurityUpdateList.isEmpty()) {
			tableObjectSecurityRepository.deleteAll(tableObjectsSecurityUpdateList);
		}
		List<TableObjectsSecurity> tableObjectsSecurityList = new ArrayList<>();
		saveTeams(tableObjectsSecurityList, tableSecurityVOList.getSecurityTeamVOList(), teamIDList, object);
		saveOwner(tableObjectsSecurityList, tableSecurityVOList.getTableOwnersId(), object);
		if (!tableObjectsSecurityList.isEmpty()) {
			tableObjectSecurityRepository.saveAll(tableObjectsSecurityList);
		}
	}

	@Transactional
	public ResponseStringVO saveOrUpdateTeamSecurity(TableSecurityVOList tableSecurityVOList) {
		TableObjects object = tableObjectsRepository.findByTableObjectsIdAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(
				tableSecurityVOList.getTableId(), YoroappsConstants.YES, YorosisContext.get().getTenantId());
		if (object != null) {
			deleteOwnersAndTeams(tableSecurityVOList);
			List<UUID> teamIDList = getTeamIDListForSave(tableSecurityVOList.getSecurityTeamVOList());
			List<TableObjectsSecurity> tableObjectsSecurityUpdateList = tableObjectSecurityRepository
					.getTableObjectsSecurityListBasedonTableIdTenantIdAndActiveFlagForTeam(
							tableSecurityVOList.getTableId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
			if (tableObjectsSecurityUpdateList != null && !tableObjectsSecurityUpdateList.isEmpty()) {
				tableObjectSecurityRepository.deleteAll(tableObjectsSecurityUpdateList);
			}
			List<TableObjectsSecurity> tableObjectsSecurityList = new ArrayList<>();
			saveTeams(tableObjectsSecurityList, tableSecurityVOList.getSecurityTeamVOList(), teamIDList, object);
			if (!tableObjectsSecurityList.isEmpty()) {
				tableObjectSecurityRepository.saveAll(tableObjectsSecurityList);
			}
		}
		return ResponseStringVO.builder().response("Security Updated Successfully").build();
	}

	@Transactional
	public ResponseStringVO saveOrUpdateOwnerSecurity(TableSecurityVOList tableSecurityVOList) {
		TableObjects object = tableObjectsRepository.findByTableObjectsIdAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(
				tableSecurityVOList.getTableId(), YoroappsConstants.YES, YorosisContext.get().getTenantId());
		if (object != null) {
			deleteOwnersAndTeams(tableSecurityVOList);
//			List<TableObjectsSecurity> tableObjectsSecurityUpdateList = tableObjectSecurityRepository
//					.getTableObjectsSecurityListBasedonTableIdTenantIdAndActiveFlagForOwner(
//							tableSecurityVOList.getTableId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
//			if (tableObjectsSecurityUpdateList != null && !tableObjectsSecurityUpdateList.isEmpty()) {
//				tableObjectSecurityRepository.deleteAll(tableObjectsSecurityUpdateList);
//			}
			List<TableObjectsSecurity> tableObjectsSecurityList = new ArrayList<>();
			saveOwner(tableObjectsSecurityList, tableSecurityVOList.getTableOwnersId(), object);
			if (!tableObjectsSecurityList.isEmpty()) {
				tableObjectSecurityRepository.saveAll(tableObjectsSecurityList);
			}
		}
		return ResponseStringVO.builder().response("Security Updated Successfully").build();
	}

	public void saveTeams(List<TableObjectsSecurity> tableObjectsSecurityList, List<TableSecurityVO> teamsList,
			List<UUID> teamIDList, TableObjects object) {
		List<YoroGroups> yoroGroupsList = yoroGroupsRepository.getGroupList(teamIDList,
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (yoroGroupsList != null && !yoroGroupsList.isEmpty()) {
			teamsList.stream().forEach(o -> {
				TableObjectsSecurity tableObjectsSecurity = constructSecurityVOtoDTO();
				boolean addSecurity = false;
				for (YoroGroups yoroGroups : yoroGroupsList) {
					if (StringUtils.equals(yoroGroups.getId().toString(), o.getGroupId().toString())) {
						addSecurity = true;
						tableObjectsSecurity.setTableOwner(YorosisConstants.NO);
						tableObjectsSecurity.setReadAllowed(booleanToChar(o.getReadAllowed()));
						tableObjectsSecurity.setEditAllowed(booleanToChar(o.getUpdateAllowed()));
						tableObjectsSecurity.setDeleteAllowed(booleanToChar(o.getDeleteAllowed()));
						tableObjectsSecurity.setYoroGroups(yoroGroups);
						tableObjectsSecurity.setTableObjects(object);
					}
				}
				if (addSecurity == true) {
					tableObjectsSecurityList.add(tableObjectsSecurity);
				}
			});
		}
	}

	public void saveOwner(List<TableObjectsSecurity> tableObjectsSecurityList, List<UUID> ownerIdList,
			TableObjects object) {
		if (ownerIdList != null && !ownerIdList.isEmpty()) {
			List<Users> usersList = userRepository.getAllUsersForOwners(ownerIdList, YorosisContext.get().getTenantId(),
					YorosisConstants.YES);
			if (usersList != null && !usersList.isEmpty()) {
				ownerIdList.stream().forEach(o -> {
					TableObjectsSecurity tableObjectsSecurity = constructSecurityVOtoDTO();
					boolean addSecurity = false;
					for (Users users : usersList) {
						if (StringUtils.equals(users.getUserId().toString(), o.toString())) {
							addSecurity = true;
							tableObjectsSecurity.setTableOwner(YorosisConstants.YES);
							tableObjectsSecurity.setReadAllowed(YorosisConstants.YES);
							tableObjectsSecurity.setEditAllowed(YorosisConstants.YES);
							tableObjectsSecurity.setDeleteAllowed(YorosisConstants.YES);
							tableObjectsSecurity.setUsers(users);
							tableObjectsSecurity.setTableObjects(object);
						}
					}
					if (addSecurity == true) {
						tableObjectsSecurityList.add(tableObjectsSecurity);
					}
				});
			}
		}
	}

	private List<UUID> getTeamIDListForSave(List<TableSecurityVO> securityTeamVOList) {
		List<UUID> teamIDList = new ArrayList<>();
		if (securityTeamVOList != null && !securityTeamVOList.isEmpty()) {
			securityTeamVOList.stream().forEach(s -> {
				teamIDList.add(s.getGroupId());
			});
		}
		return teamIDList;
	}

	private void deleteOwnersAndTeams(TableSecurityVOList tableSecurityVOList) {
		List<TableObjectsSecurity> tableObjectsSecurityDeleteList = tableObjectSecurityRepository
				.getTableObjectsSecurityListForDelete(tableSecurityVOList.getTableId(),
						YorosisContext.get().getTenantId(), YorosisConstants.YES,
						tableSecurityVOList.getDeletedOwnerIdList() == null ? java.util.Collections.emptyList()
								: tableSecurityVOList.getDeletedOwnerIdList(),
						tableSecurityVOList.getDeletedTeamsIdList() == null ? java.util.Collections.emptyList()
								: tableSecurityVOList.getDeletedTeamsIdList());
		if (tableObjectsSecurityDeleteList != null) {
			tableObjectSecurityRepository.deleteAll(tableObjectsSecurityDeleteList);
		}
	}

	@Transactional
	public TableSecurityVOList getDataTableSecurity(UUID tableId) throws IOException {
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> groupIdList = getGroupAsUUID(userVO);
		List<TableObjectsSecurity> tableObjectsSecurityList = tableObjectSecurityRepository
				.getTableObjectsSecurityListBasedonTableIdTenantIdAndActiveFlag(tableId,
						YorosisContext.get().getTenantId(), YorosisConstants.YES);
		List<TableSecurityVO> teamList = new ArrayList<>();
		List<UUID> ownerList = new ArrayList<>();
		Boolean read = false;
		Boolean edit = false;
		Boolean delete = false;
		Boolean owner = false;
		String tableName = null;
		if (tableObjectsSecurityList != null && !tableObjectsSecurityList.isEmpty()) {
			tableName = tableObjectsSecurityList.get(0).getTableObjects().getTableIdentifier();
			for (TableObjectsSecurity t : tableObjectsSecurityList) {
				if (t.getYoroGroups() != null) {
					teamList.add(constructSecurityVo(t));
					if (groupIdList.contains(t.getYoroGroups().getId())) {
						if (BooleanUtils.isFalse(read)) {
							read = charToBoolean(t.getReadAllowed());
						}
						if (BooleanUtils.isFalse(edit)) {
							edit = charToBoolean(t.getEditAllowed());
						}
						if (BooleanUtils.isFalse(delete)) {
							delete = charToBoolean(t.getDeleteAllowed());
						}
					}
				}
				if (t.getUsers() != null) {
					ownerList.add(t.getUsers().getUserId());
					if (StringUtils.equals(userVO.getUserId().toString(), t.getUsers().getUserId().toString())) {
						read = true;
						edit = true;
						delete = true;
						owner = true;
					}
				}
			}
		}
		return TableSecurityVOList.builder().tableName(tableName).tableOwnersId(ownerList).securityTeamVOList(teamList)
				.readAllowed(read).updateAllowed(edit).deleteAllowed(delete).owner(owner).build();
	}

	@Transactional
	public TableSecurityVOList getDataTableSecurityForSave(UUID tableId) throws IOException {
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> groupIdList = getGroupAsUUID(userVO);
		List<TableObjectsSecurity> tableObjectsSecurityList = tableObjectSecurityRepository
				.getTableObjectsSecurityListBasedonTableIdTenantIdAndActiveFlag(tableId,
						YorosisContext.get().getTenantId(), YorosisConstants.YES);
		Boolean read = false;
		Boolean edit = false;
		Boolean delete = false;
		Boolean owner = false;
		if (tableObjectsSecurityList != null && !tableObjectsSecurityList.isEmpty()) {
			for (TableObjectsSecurity t : tableObjectsSecurityList) {
				if (t.getYoroGroups() != null && groupIdList.contains(t.getYoroGroups().getId())) {
					if (BooleanUtils.isFalse(read)) {
						read = charToBoolean(t.getReadAllowed());
					}
					if (BooleanUtils.isFalse(edit)) {
						edit = charToBoolean(t.getEditAllowed());
					}
					if (BooleanUtils.isFalse(delete)) {
						delete = charToBoolean(t.getDeleteAllowed());
					}
				}
				if (t.getUsers() != null
						&& StringUtils.equals(userVO.getUserId().toString(), t.getUsers().getUserId().toString())) {
					read = true;
					edit = true;
					delete = true;
					owner = true;
				}
			}
		}
		return TableSecurityVOList.builder().readAllowed(read).updateAllowed(edit).deleteAllowed(delete).owner(owner)
				.build();
	}

}
