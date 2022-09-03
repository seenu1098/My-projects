package com.yorosis.yoroflow.services;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroflow.entities.Group;
import com.yorosis.yoroflow.entities.UserGroup;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.GroupVO;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.models.UserGroupVO;
import com.yorosis.yoroflow.repository.GroupRepository;
import com.yorosis.yoroflow.repository.UserGroupRepository;
import com.yorosis.yoroflow.repository.UsersRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class UserGroupService {

	@Autowired
	private UserGroupRepository userGroupRepository;

	@Autowired
	private UsersRepository userRepository;

	@Autowired
	private GroupRepository groupRepository;

	@PersistenceContext
	private EntityManager em;

	private UserGroup constructVOTODTO(UserGroupVO userGroupVO) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return UserGroup.builder().createdBy(YorosisContext.get().getUserName()).activeFlag(YorosisConstants.YES)
				.updatedBy(YorosisContext.get().getUserName()).createdDate(timestamp).updatedDate(timestamp)
				.tenantId(YorosisContext.get().getTenantId()).build();
	}

	private UserGroupVO constructDTOToVO(UserGroup userGroup) {
		return UserGroupVO.builder().userGroupId(userGroup.getUserGroupId()).groupId(userGroup.getGroup().getGroupId())
				.groupName(userGroup.getGroup().getGroupName()).userId(userGroup.getUser().getUserId())
				.userName(userGroup.getUser().getUserName()).build();
	}

	@Transactional
	public ResponseStringVO saveAndUpdateUserGroup(UserGroupVO userGroupVO) {
		String response = null;
		UserGroup userGroup = null;
		if (userGroupVO.getUserGroupId() == null) {
			userGroup = constructVOTODTO(userGroupVO);
			userGroup.setGroup(groupRepository.getOne(userGroupVO.getGroupId()));
			userGroup.setUser(userRepository.getOne(userGroupVO.getUserId()));
			response = "User Team created successfully";
		} else {
			userGroup = userGroupRepository.getOne(userGroupVO.getUserGroupId());
			userGroup.setUpdatedBy(YorosisContext.get().getUserName());
			userGroup.setUpdatedDate(new Timestamp(System.currentTimeMillis()));
			userGroup.setGroup(groupRepository.getOne(userGroupVO.getGroupId()));
			userGroup.setUser(userRepository.getOne(userGroupVO.getUserId()));
			response = "User Team updated successfully";
		}
		userGroupRepository.save(userGroup);
		return ResponseStringVO.builder().response(response).build();
	}

	@Transactional
	public List<UserGroupVO> getUserGroupsVOList() {
		List<UserGroupVO> userGroupVOList = new ArrayList<>();
		for (UserGroup userGroup : userGroupRepository.findByTenantId(YorosisContext.get().getTenantId())) {
			userGroupVOList.add(constructDTOToVO(userGroup));
		}
		return userGroupVOList;
	}

	@Transactional
	public UserGroupVO getUserGroup(UUID userGroupId) {
		return constructDTOToVO(userGroupRepository.getOne(userGroupId));
	}

	@Transactional
	public List<GroupVO> getGroupNames(String name) {
		List<Group> list = null;
		CriteriaBuilder criteriaBuilder = em.getCriteriaBuilder();
		CriteriaQuery<Group> criteriaQuery = criteriaBuilder.createQuery(Group.class);
		Root<Group> root = criteriaQuery.from(Group.class);

		Predicate groupName = criteriaBuilder.like(criteriaBuilder.lower(root.get("groupName")),
				"%" + name.toLowerCase() + "%");

		criteriaQuery.select(root).where(criteriaBuilder.or(groupName));

		TypedQuery<Group> createQuery = em.createQuery(criteriaQuery);

		list = createQuery.getResultList();

		List<GroupVO> groupList = new ArrayList<>();

		for (Group code : list) {
			if (StringUtils.equalsIgnoreCase(code.getManagedFlag(), YorosisConstants.NO)) {
				GroupVO vo = GroupVO.builder().groupName(code.getGroupName())
						.groupDesc(code.getGroupDesc()).groupId(code.getGroupId()).build();
				groupList.add(vo);
			}

		}

		return groupList;

	}

}
