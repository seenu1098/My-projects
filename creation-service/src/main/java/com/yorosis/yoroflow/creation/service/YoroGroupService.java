package com.yorosis.yoroflow.creation.service;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import javax.transaction.Transactional;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yorosis.yoroapps.entities.Users;
import com.yorosis.yoroapps.entities.YoroGroups;
import com.yorosis.yoroapps.entities.YoroGroupsUsers;
import com.yorosis.yoroapps.vo.LicenseVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.SubscriptionExpireVO;
import com.yorosis.yoroapps.vo.UsersVO;
import com.yorosis.yoroapps.vo.YoroGroupsVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.UsersRepository;
import com.yorosis.yoroflow.creation.repository.YoroGroupsRepository;
import com.yorosis.yoroflow.creation.repository.YoroGroupsUsersRepository;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class YoroGroupService {

	@Autowired
	private YoroGroupsRepository yoroGroupsRepository;

	@Autowired
	private ProxyService proxyService;

	@Autowired
	private YoroGroupsUsersRepository yoroGroupsUsersRepository;

	@Autowired
	private UsersRepository userRepository;

	private YoroGroups constructYoroGroupsVOToDTO(YoroGroupsVO yoroGroupsVO) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return YoroGroups.builder().groupName(yoroGroupsVO.getName()).description(yoroGroupsVO.getDescription())
				.tenantId(YorosisContext.get().getTenantId()).createdBy(YorosisContext.get().getUserName())
				.createdOn(timestamp).modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp)
				.activeFlag(YoroappsConstants.YES).managedFlag(YoroappsConstants.NO).build();
	}

	private YoroGroupsVO constructYoroGroupsDTOToVO(YoroGroups yoroGroups) {
		return YoroGroupsVO.builder().id(yoroGroups.getId()).name(yoroGroups.getGroupName())
				.description(yoroGroups.getDescription()).build();
	}

	private YoroGroupsUsers constructYoroGroupsUserVOToDTO() {
		Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());
		return YoroGroupsUsers.builder().tenantId(YorosisContext.get().getTenantId())
				.createdBy(YorosisContext.get().getUserName()).createdOn(currentTimestamp)
				.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(currentTimestamp)
				.activeFlag(YoroappsConstants.YES).teamOwner(YoroappsConstants.YES).build();
	}

	public LicenseVO isAllowed() {
		String currentTenantId = YorosisContext.get().getTenantId();

		LicenseVO licenseVO = proxyService.isAllowed(currentTenantId, "general", "teams_groups");

		int allGroupsCount = yoroGroupsRepository.getAllYoroGroupsCount(currentTenantId, YoroappsConstants.YES,
				YoroappsConstants.NO);

		if (allGroupsCount < licenseVO.getAllowedLimit()) {
			licenseVO.setResponse("within the limit");
			return licenseVO;
		}
		licenseVO.setResponse("You have exceeded your limit");
		return licenseVO;
	}

	private void saveGroupUsers(YoroGroups yoroGroups) {
		Users user = userRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
				YorosisContext.get().getUserName(), YoroappsConstants.YES, YorosisContext.get().getTenantId());
		if (user != null) {
			YoroGroupsUsers yoroGroupsUsers = constructYoroGroupsUserVOToDTO();
			yoroGroupsUsers.setUsers(user);
			yoroGroupsUsers.setYoroGroups(yoroGroups);
			yoroGroupsUsersRepository.save(yoroGroupsUsers);
		}
	}

	@Transactional
	public ResponseStringVO saveGroups(YoroGroupsVO yoroGroupsVO) {
		LicenseVO licenseVO = isAllowed();
		int groupNameCount = yoroGroupsRepository.checkGroupExistOrNot(yoroGroupsVO.getName(), YoroappsConstants.YES,
				YorosisContext.get().getTenantId(), YoroappsConstants.NO);
		if (yoroGroupsVO.getId() == null) {
			if (StringUtils.equals(licenseVO.getResponse(), "within the limit")) {
				if (groupNameCount == 0) {
					YoroGroups yoroGroups = constructYoroGroupsVOToDTO(yoroGroupsVO);

					yoroGroups = yoroGroupsRepository.save(yoroGroups);
					saveGroupUsers(yoroGroups);
					return ResponseStringVO.builder().response("Team Created Successfully").build();
				} else {
					return ResponseStringVO.builder().response("Team Name Already Exist").build();
				}
			} else {
				return ResponseStringVO.builder().licenseVO(licenseVO).response("You have exceeded your limit").build();
			}
		} else {
			YoroGroups yoroGroups = yoroGroupsRepository
					.findByIdAndTenantIdAndActiveFlagIgnoreCaseAndManagedFlagIgnoreCase(yoroGroupsVO.getId(),
							YorosisContext.get().getTenantId(), YoroappsConstants.YES, YoroappsConstants.NO);
			yoroGroups.setGroupName(yoroGroupsVO.getName());
			yoroGroups.setDescription(yoroGroupsVO.getDescription());
			yoroGroupsRepository.save(yoroGroups);
			return ResponseStringVO.builder().response("Team Updated Successfully").build();

		}
	}

	public YoroGroupsVO getYoroGroupsInfo(UUID id) {
		YoroGroups yoroGroups = yoroGroupsRepository.findByIdAndTenantIdAndActiveFlagIgnoreCaseAndManagedFlagIgnoreCase(
				id, YorosisContext.get().getTenantId(), YoroappsConstants.YES, YoroappsConstants.NO);
		return constructYoroGroupsDTOToVO(yoroGroups);
	}

	public ResponseStringVO getYoroTeamsCount() {
		int count = yoroGroupsRepository.getGroupsCount(YorosisContext.get().getTenantId(), YoroappsConstants.YES,
				YoroappsConstants.NO);

		return ResponseStringVO.builder().count(count).build();
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
	public ResponseStringVO inactivateTeams(SubscriptionExpireVO subscriptionExpireVO) throws IOException {
		String response = null;

		List<YoroGroups> groupList = yoroGroupsRepository.getAllYoroGroups(YorosisContext.get().getTenantId(),
				YoroappsConstants.YES, YoroappsConstants.NO);
		if (!groupList.isEmpty() && groupList.size() > 6) {
			if (BooleanUtils.isTrue(subscriptionExpireVO.getIsRandomTeam())) {
				List<UUID> uuidList = new ArrayList<>();
				List<YoroGroups> subList = groupList.subList(groupList.size() - 6, groupList.size());
				subList.stream().forEach(t -> uuidList.add(t.getId()));
				List<YoroGroups> list = yoroGroupsRepository.getAllYoroGroupsForInactivate(uuidList,
						YorosisContext.get().getTenantId(), YoroappsConstants.YES, YoroappsConstants.NO);
				list.stream().forEach(t -> t.setActiveFlag(YoroappsConstants.NO));
				yoroGroupsRepository.saveAll(list);
				response = "Removed random teams";
			} else {
				List<YoroGroups> picketGroupList = yoroGroupsRepository.getAllYoroGroupsForInactivate(
						subscriptionExpireVO.getTeamsIdList(), YorosisContext.get().getTenantId(),
						YoroappsConstants.YES, YoroappsConstants.NO);
				picketGroupList.stream().forEach(t -> t.setActiveFlag(YoroappsConstants.NO));
				yoroGroupsRepository.saveAll(picketGroupList);
				response = "Removed picked teams";
			}
		}
		return ResponseStringVO.builder().response(response).build();
	}

	private UsersVO constructUsersToUsersVO(Users users) {
		return UsersVO.builder().userId(users.getUserId()).firstName(users.getFirstName()).lastName(users.getLastName())
				.build();
	}

	@Transactional
	public List<UsersVO> getSelectedTeamsUsers(List<UUID> selectedTeams) {
		return yoroGroupsUsersRepository
				.getUsers(selectedTeams, YorosisContext.get().getTenantId(), YorosisConstants.YES).stream()
				.map(this::constructUsersToUsersVO).collect(Collectors.toList());
	}

}
