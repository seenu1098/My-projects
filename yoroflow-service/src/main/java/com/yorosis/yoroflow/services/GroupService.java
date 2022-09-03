package com.yorosis.yoroflow.services;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroflow.entities.Group;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.GroupVO;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.repository.GroupRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class GroupService {
	@Autowired
	private GroupRepository groupRepository;

	private Group constrcutVOToDTO(GroupVO groupVO) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return Group.builder().groupName(groupVO.getGroupName()).groupDesc(groupVO.getGroupDesc())
				.createdBy(YorosisContext.get().getUserName()).updatedBy(YorosisContext.get().getUserName())
				.createdDate(timestamp).updatedDate(timestamp).tenantId(YorosisContext.get().getTenantId())
				.activeFlag(YorosisConstants.YES).build();
	}

	private GroupVO constrcutVOToDTO(Group group) {
		return GroupVO.builder().groupId(group.getGroupId()).groupName(group.getGroupName())
				.groupDesc(group.getGroupDesc()).color(group.getColor()).build();
	}

	@Transactional
	public ResponseStringVO saveAndUpdateGroup(GroupVO groupVO) {
		Group group = null;
		String response = null;
		if (groupVO.getGroupId() == null) {
			group = constrcutVOToDTO(groupVO);
			response = "Team Created Successfully";
		} else {
			group = groupRepository.getOne(groupVO.getGroupId());
			group.setGroupName(groupVO.getGroupName());
			group.setGroupDesc(groupVO.getGroupDesc());
			group.setUpdatedBy(YorosisContext.get().getUserName());
			group.setUpdatedDate(new Timestamp(System.currentTimeMillis()));
			response = "Team Updated Successfully";
		}
		groupRepository.save(group);
		return ResponseStringVO.builder().response(response).build();
	}

	@Transactional
	public GroupVO getGroupInfo(UUID groupId) {
		return constrcutVOToDTO(groupRepository.getOne(groupId));
	}

	@Transactional
	public List<GroupVO> getGroupsList() {
		List<GroupVO> groupVOList = new ArrayList<>();
		for (Group group : groupRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCaseAndManagedFlagIgnoreCase(
				YorosisContext.get().getTenantId(), YorosisConstants.YES, YorosisConstants.NO)) {
			groupVOList.add(constrcutVOToDTO(group));
		}
		return groupVOList;
	}
}
