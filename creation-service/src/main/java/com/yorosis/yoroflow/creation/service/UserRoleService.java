package com.yorosis.yoroflow.creation.service;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroapps.entities.Roles;
import com.yorosis.yoroapps.entities.UserAssociateRoles;
import com.yorosis.yoroapps.entities.Users;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.RolesListVO;
import com.yorosis.yoroapps.vo.UserRolesVo;
import com.yorosis.yoroapps.vo.UsersVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.UserAssociateRolesRepository;
import com.yorosis.yoroflow.creation.repository.UserRolesRepository;
import com.yorosis.yoroflow.creation.repository.UsersRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class UserRoleService {

	@Autowired
	private UserAssociateRolesRepository userAssociateRolesRepository;

	@Autowired
	private UserRolesRepository userRolesRepository;

	@Autowired
	private UsersRepository userRepository;

	private UserAssociateRoles constructUserRolesVOToDTO(Users user, Roles role) {
		Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());
		return UserAssociateRoles.builder().tenantId(YorosisContext.get().getTenantId()).createdBy(YorosisContext.get().getUserName())
				.createdOn(currentTimestamp).modifiedBy(YorosisContext.get().getUserName()).modifiedOn(currentTimestamp).activeFlag(YoroappsConstants.YES)
				.users(user).roles(role).build();
	}

	private RolesListVO constructRolesListDtotoVo(Roles role) {
		return RolesListVO.builder().id(role.getRoleId()).rolesNames(role.getRoleName()).roleColor(role.getRoleColor()).build();
	}

	@Transactional
	public ResponseStringVO saveAssociateUserToRoles(UsersVO uservo, Users user) {
		if (uservo.getRoleId() != null && !uservo.getRoleId().isEmpty()) {
			for (UUID roleId : uservo.getRoleId()) {
				List<UserAssociateRoles> checkRolesExist = userAssociateRolesRepository.checkRolesExist(roleId, uservo.getUserId(),
						YorosisContext.get().getTenantId(), YoroappsConstants.YES);
				if (checkRolesExist.isEmpty()) {
					Roles roles = userRolesRepository.findByRoleIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(roleId, YorosisContext.get().getTenantId(),
							YoroappsConstants.YES);
					if (roles != null) {
						userAssociateRolesRepository.save(constructUserRolesVOToDTO(user, roles));
					}
				}
			}
		} else {
			List<UserAssociateRoles> rolesList = userAssociateRolesRepository.getRolesBasedOnUserId(user.getUserId(), YorosisContext.get().getTenantId(),
					YoroappsConstants.YES);
			deleteRoles(rolesList);
		}
		return ResponseStringVO.builder().response("Saved successfully").build();
	}

	@Transactional
	public ResponseStringVO updateRoles(UserRolesVo userRolesVo) {
		userAssociateRolesRepository.deleteUserByRoles(userRolesVo.getRoleId(), YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		for (UUID id : userRolesVo.getUserId()) {
			Users user = userRepository.findByUserIdAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(id, YoroappsConstants.YES, YorosisContext.get().getTenantId());
			if (user != null) {
				Roles roles = userRolesRepository.getOne(userRolesVo.getRoleId());
				userAssociateRolesRepository.save(constructUserRolesVOToDTO(user, roles));
			}
		}
		return ResponseStringVO.builder().response("User(s) added to the role successfully").build();
	}

	@Transactional
	public UserRolesVo getAssociateUserRolesList(UUID roleId) {
		List<UUID> userRolesList = null;
		List<UserAssociateRoles> rolesList = userAssociateRolesRepository.getRolesBasedOnRoleId(roleId, YorosisContext.get().getTenantId(),
				YoroappsConstants.YES);
		userRolesList = rolesList.stream().map(role -> role.getUsers().getUserId()).collect(Collectors.toList());
		return UserRolesVo.builder().roleId(roleId).userId(userRolesList).build();
	}

	@Transactional
	public List<RolesListVO> getRolesList() {
		List<RolesListVO> rolesList = null;
		List<Roles> roles = userRolesRepository.getRolesBasedOnManagedFlag(YorosisContext.get().getTenantId(), YoroappsConstants.NO, YoroappsConstants.YES);
		rolesList = roles.stream().map(this::constructRolesListDtotoVo).collect(Collectors.toList());
		return rolesList;
	}

	private void deleteRoles(List<UserAssociateRoles> rolesList) {
		if (rolesList != null && !rolesList.isEmpty()) {
			userAssociateRolesRepository.deleteAll(rolesList);
		}
	}

}
