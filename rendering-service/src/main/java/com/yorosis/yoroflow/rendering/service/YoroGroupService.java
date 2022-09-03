package com.yorosis.yoroflow.rendering.service;

import java.sql.Timestamp;
import java.util.UUID;

import javax.transaction.Transactional;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yorosis.yoroapps.entities.Users;
import com.yorosis.yoroapps.entities.YoroGroups;
import com.yorosis.yoroapps.entities.YoroGroupsUsers;
import com.yorosis.yoroapps.vo.LicenseVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.YoroGroupsVO;
import com.yorosis.yoroflow.rendering.constants.YoroappsConstants;
import com.yorosis.yoroflow.rendering.repository.UsersRepository;
import com.yorosis.yoroflow.rendering.repository.YoroGroupsRepository;
import com.yorosis.yoroflow.rendering.repository.YoroGroupsUsersRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class YoroGroupService {

	@Autowired
	private YoroGroupsRepository yoroGroupsRepository;

	@Autowired
	private YoroGroupsUsersRepository yoroGroupsUsersRepository;

	@Autowired
	private UsersRepository userRepository;

	@Autowired
	private ProxyService proxyService;

	private YoroGroups constructYoroGroupsVOToDTO(YoroGroupsVO yoroGroupsVO) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return YoroGroups.builder().groupName(yoroGroupsVO.getName()).description(yoroGroupsVO.getDescription())
				.tenantId(YorosisContext.get().getTenantId()).createdBy(YorosisContext.get().getUserName())
				.createdOn(timestamp).modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp)
				.activeFlag(YoroappsConstants.YES).managedFlag(YoroappsConstants.NO).color(yoroGroupsVO.getColor())
				.build();
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

	private void saveYoroUserGroups(YoroGroups yoroGroups) {
		Users user = userRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
				YorosisContext.get().getUserName(), YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		if (user != null) {
			YoroGroupsUsers yoroGroupsUsers = constructYoroGroupsUserVOToDTO();
			yoroGroupsUsers.setUsers(user);
			yoroGroupsUsers.setYoroGroups(yoroGroups);
			yoroGroupsUsersRepository.save(yoroGroupsUsers);
		}
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
					saveYoroUserGroups(yoroGroups);
					return ResponseStringVO.builder().userId(yoroGroups.getId()).response("Team Created Successfully")
							.build();
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
			yoroGroups.setColor(yoroGroupsVO.getColor());
			yoroGroupsRepository.save(yoroGroups);
			return ResponseStringVO.builder().response("Team Updated Successfully").build();

		}
	}

	public YoroGroupsVO getYoroGroupsInfo(UUID id) {
		YoroGroups yoroGroups = yoroGroupsRepository.findByIdAndTenantIdAndActiveFlagIgnoreCaseAndManagedFlagIgnoreCase(
				id, YorosisContext.get().getTenantId(), YoroappsConstants.YES, YoroappsConstants.NO);
		return constructYoroGroupsDTOToVO(yoroGroups);
	}
}
