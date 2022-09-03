package com.yorosis.authnz.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import com.yorosis.authnz.constants.YorosisConstants;
import com.yorosis.authnz.exception.YorosisException;
import com.yorosis.authnz.repository.UserAssociateRolesRepository;
import com.yorosis.authnz.repository.UsersRepository;
import com.yorosis.yoroapps.entities.UserAssociateRoles;
import com.yorosis.yoroapps.entities.UserGroup;
import com.yorosis.yoroapps.entities.Users;
import com.yorosis.yoroapps.vo.GroupVO;
import com.yorosis.yoroapps.vo.RolesListVO;
import com.yorosis.yoroapps.vo.UsersVO;
import com.yorosis.yoroflow.request.filter.client.AuthDetailsVO;
import com.yorosis.yoroflow.request.filter.client.AuthDetailsVO.AuthDetailsVOBuilder;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.SignatureException;
import lombok.extern.slf4j.Slf4j;

@Service(value = "userService")
@Slf4j
public class UserService implements UserDetailsService {

	private static final String INVALID_USER = "Invalid email or password.";
	private static final String TOKEN_PREFIX = "Bearer ";

	@Autowired
	private UsersRepository userRepository;

	@Autowired
	private TokenProviderService tokenProviderService;

	@Autowired
	private UserDetailsService userDetailsService;

	@Autowired
	private UserAssociateRolesRepository userAssociateRolesRepository;

	private UsersVO constructDTOToVO(Users user) {
		List<GroupVO> groupVOList = new ArrayList<>();
		List<RolesListVO> userRoleList = new ArrayList<>();

		for (UserGroup group : user.getUserGroups()) {
			groupVOList.add(GroupVO.builder().groupId(group.getYoroGroups().getId())
					.groupName(group.getYoroGroups().getGroupName()).groupDesc(group.getYoroGroups().getDescription())
					.build());
		}

		List<UserAssociateRoles> rolesList = userAssociateRolesRepository.getRolesBasedOnUserId(user.getUserId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (!CollectionUtils.isEmpty(rolesList)) {
			for (UserAssociateRoles role : rolesList) {
				if (role.getRoles() != null
						&& StringUtils.equals(role.getRoles().getActiveFlag(), YorosisConstants.YES)) {
					userRoleList.add(RolesListVO.builder().rolesNames(role.getRoles().getRoleName())
							.id(role.getRoles().getRoleId()).roleColor(role.getRoles().getRoleColor()).build());
				}
			}
		}

		return UsersVO.builder().userId(user.getUserId()).firstName(user.getFirstName()).lastName(user.getLastName())
				.userName(user.getUserName()).emailId(user.getEmailId()).groupVOList(groupVOList)
				.tokenId(user.getAuthToken()).userType(user.getAuthType()).userRoleList(userRoleList).build();

	}

	@Transactional
	public UsersVO getLoggedInUserDetails() {
		Users user = userRepository.findByUserNameIgnoreCase(YorosisContext.get().getUserName());

		return constructDTOToVO(user);
	}

	@Override
	@Transactional
	public UserDetails loadUserByUsername(String username) {
		Users user = userRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
				username.trim().toLowerCase(), YorosisContext.get().getTenantId(), YorosisConstants.YES);

		if (user == null) {
			throw new UsernameNotFoundException(INVALID_USER);
		}

		return new org.springframework.security.core.userdetails.User(user.getUserName(), user.getUserPassword(),
				getAuthority());
	}

	private Set<SimpleGrantedAuthority> getAuthority() {
		Set<SimpleGrantedAuthority> authorities = new HashSet<>();

		authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
		return authorities;
	}

	@Transactional
	public AuthDetailsVO getAuthDetailsFromToken(String token) {
		AuthDetailsVOBuilder authDetailsBuilder = AuthDetailsVO.builder().isAuthenticated(false);

		String username = null;
		String authToken = null;
		if (StringUtils.isNotBlank(token) && token.startsWith(TOKEN_PREFIX)) {
			authToken = token.replace(TOKEN_PREFIX, "");
		}

		if (StringUtils.isNotBlank(authToken)) {
			try {
				username = tokenProviderService.getUsernameFromToken(authToken);
			} catch (IllegalArgumentException e) {
				log.error("an error occured during getting username from token", e);
			} catch (ExpiredJwtException e) {
				log.warn("the token is expired and not valid anymore", e);
			} catch (SignatureException e) {
				log.error("Authentication Failed. Username or Password not valid.");
			}
		} else {
			log.warn("couldn't find bearer string, will ignore the header");
		}
		authDetailsBuilder.userName(username);
		authDetailsBuilder.token(TOKEN_PREFIX + authToken);
		authDetailsBuilder.tenantId(YorosisContext.get().getTenantId());

		return authDetailsBuilder.build();
	}

	@Transactional
	public AuthDetailsVO validateUser(AuthDetailsVO authDetailsVO) throws YorosisException {
		String authToken = null;
		if (StringUtils.isNotBlank(authDetailsVO.getToken()) && authDetailsVO.getToken().startsWith(TOKEN_PREFIX)) {
			authToken = authDetailsVO.getToken().replace(TOKEN_PREFIX, "");
		}
		UserDetails userDetails = userDetailsService.loadUserByUsername(authDetailsVO.getUserName());

		if (userDetails != null && tokenProviderService.validateToken(authToken, userDetails)) {
			authDetailsVO.setAuthenticated(true);
			// cache authDetailsVO
		} else {
			throw new YorosisException("User info do not match with Token");
		}
		return authDetailsVO;
	}
}
