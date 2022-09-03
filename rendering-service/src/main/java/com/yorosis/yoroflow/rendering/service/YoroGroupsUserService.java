package com.yorosis.yoroflow.rendering.service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import javax.transaction.Transactional;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yorosis.yoroapps.entities.Users;
import com.yorosis.yoroapps.entities.YoroGroups;
import com.yorosis.yoroapps.entities.YoroGroupsUsers;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.YoroGroupsUserVO;
import com.yorosis.yoroapps.vo.YoroGroupsVO;
import com.yorosis.yoroflow.rendering.constants.YoroappsConstants;
import com.yorosis.yoroflow.rendering.repository.UsersRepository;
import com.yorosis.yoroflow.rendering.repository.YoroGroupsRepository;
import com.yorosis.yoroflow.rendering.repository.YoroGroupsUsersRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class YoroGroupsUserService {
	@Autowired
	private YoroGroupsRepository yoroGroupsRepository;

	@Autowired
	private UsersRepository userRepository;

	@Autowired
	private YoroGroupsUsersRepository yoroGroupsUsersRepository;

	private YoroGroupsUsers constructYoroGroupsUserVOToDTO() {
		Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());
		return YoroGroupsUsers.builder().tenantId(YorosisContext.get().getTenantId())
				.createdBy(YorosisContext.get().getUserName()).createdOn(currentTimestamp)
				.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(currentTimestamp)
				.activeFlag(YoroappsConstants.YES).build();
	}

	@Transactional
	public List<YoroGroupsVO> getYoroGroups() {
		List<YoroGroups> group = yoroGroupsRepository.getAllYoroGroups(YorosisContext.get().getTenantId(),
				YoroappsConstants.YES, YoroappsConstants.NO);
		List<YoroGroupsVO> groupList = new ArrayList<>();
		for (YoroGroups yoroGroups : group) {
			YoroGroupsVO vo = YoroGroupsVO.builder().id(yoroGroups.getId()).name(yoroGroups.getGroupName())
					.color(yoroGroups.getColor()).build();
			groupList.add(vo);
		}
		return groupList;

	}

	@Transactional
	public List<YoroGroupsVO> getYoroGroupsWithOwner() {
		List<YoroGroupsVO> groupList = new ArrayList<>();
		Users user = userRepository.findByUserNameAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
				YorosisContext.get().getUserName(), YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		if (user != null) {
			List<YoroGroupsUsers> groupId = yoroGroupsUsersRepository.getAllUserIdListByUserId(user.getUserId(),
					YorosisContext.get().getTenantId(), YoroappsConstants.YES);
			if (groupId != null && !groupId.isEmpty()) {
//				List<YoroGroups> group = yoroGroupsRepository.getAllYoroGroupsById(groupId,
//						YorosisContext.get().getTenantId(), YoroappsConstants.YES, YoroappsConstants.NO);
				List<YoroGroups> group = yoroGroupsRepository.getAllYoroGroups(YorosisContext.get().getTenantId(),
						YoroappsConstants.YES, YoroappsConstants.NO);
				if (group != null && !group.isEmpty()) {
					List<YoroGroupsUsers> yoroGroupUsersList = yoroGroupsUsersRepository.getAllUserIdList(group,
							YorosisContext.get().getTenantId(), YoroappsConstants.YES);
					for (YoroGroups yoroGroups : group) {
						long count = 0l;
						boolean isavailableGroup = false;
						List<UUID> ownerId = new ArrayList<>();
						List<UUID> memberId = new ArrayList<>();
						if (yoroGroupUsersList != null && !yoroGroupUsersList.isEmpty()) {
							for (YoroGroupsUsers g : groupId) {
								if (g.getYoroGroups() == yoroGroups) {
									isavailableGroup = true;
								}
							}
							if (BooleanUtils.isTrue(isavailableGroup)) {
								for (YoroGroupsUsers gu : yoroGroupUsersList) {
									if (gu.getYoroGroups() == yoroGroups) {
										count++;
										if (StringUtils.equals(gu.getTeamOwner(), YoroappsConstants.YES)) {
											ownerId.add(gu.getUsers().getUserId());
										} else {
											memberId.add(gu.getUsers().getUserId());
										}
									}
								}
							}
						}
						if (count > 0) {
							YoroGroupsVO vo = YoroGroupsVO.builder().id(yoroGroups.getId())
									.description(yoroGroups.getDescription()).name(yoroGroups.getGroupName())
									.members(memberId).owners(ownerId).userCount(count).color(yoroGroups.getColor())
									.build();
							groupList.add(vo);
						}
					}
				}
			}
		}
		return groupList;

	}

	public List<UUID> getAllUserId() {
		return userRepository.getAllUsersId(YorosisContext.get().getTenantId());
	}

	public List<UUID> getUserIdByGroup(UUID id) {
		return yoroGroupsUsersRepository.getUserIdList(id, YorosisContext.get().getTenantId(), YoroappsConstants.YES);
	}

	@Transactional
	public ResponseStringVO saveYoroGroupsUser(YoroGroupsUserVO yoroGroupsUserVO) {
		int count = yoroGroupsUsersRepository.deleteYoroGroupUsers(yoroGroupsUserVO.getGroupId(),
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		System.out.println(count);
		List<YoroGroupsUsers> yoroGroupsUsersList = new ArrayList<>();
		YoroGroups groups = yoroGroupsRepository.findByIdAndTenantIdAndActiveFlagIgnoreCaseAndManagedFlagIgnoreCase(
				yoroGroupsUserVO.getGroupId(), YorosisContext.get().getTenantId(), YoroappsConstants.YES,
				YoroappsConstants.NO);
		if (groups != null) {
			for (UUID id : yoroGroupsUserVO.getUserId()) {

				YoroGroupsUsers yoroGroupsUsers = constructYoroGroupsUserVOToDTO();

				Users user = userRepository.findByUserIdAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(id,
						YoroappsConstants.YES, YorosisContext.get().getTenantId());
				yoroGroupsUsers.setYoroGroups(groups);
				yoroGroupsUsers.setUsers(user);
				if (yoroGroupsUserVO.getOwnerId().contains(id)) {
					yoroGroupsUsers.setTeamOwner(YoroappsConstants.YES);
				}
				yoroGroupsUsersList.add(yoroGroupsUsers);
			}
			if (!yoroGroupsUsersList.isEmpty()) {
				yoroGroupsUsersRepository.saveAll(yoroGroupsUsersList);
			}
		}

		return ResponseStringVO.builder().response("User added to the team successfully").build();

	}

	@Transactional
	public ResponseStringVO saveOwners(YoroGroupsUserVO yoroGroupsUserVO) {
		if (yoroGroupsUserVO != null && yoroGroupsUserVO.getOwnerId() != null
				&& !yoroGroupsUserVO.getOwnerId().isEmpty()) {
			List<YoroGroupsUsers> yoroGroupsUsersList = yoroGroupsUsersRepository.getGroupUsersListByGroupId(
					yoroGroupsUserVO.getId(), YorosisContext.get().getTenantId(), YoroappsConstants.YES);
			if (yoroGroupsUsersList != null && !yoroGroupsUsersList.isEmpty()) {
				yoroGroupsUsersList.stream().forEach(o -> {
					if (yoroGroupsUserVO.getOwnerId().contains(o.getUsers().getUserId())) {
						o.setTeamOwner(YoroappsConstants.YES);
					} else {
						o.setTeamOwner(YoroappsConstants.NO);
					}
				});
				yoroGroupsUsersRepository.saveAll(yoroGroupsUsersList);
				return ResponseStringVO.builder().response("Team owners added successfully").build();
			}
		}
		return ResponseStringVO.builder().response("Team owners not added").build();
	}
}
