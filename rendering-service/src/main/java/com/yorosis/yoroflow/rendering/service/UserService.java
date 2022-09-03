package com.yorosis.yoroflow.rendering.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroapps.entities.UserGroup;
import com.yorosis.yoroapps.entities.Users;
import com.yorosis.yoroapps.entities.YoroGroups;
import com.yorosis.yoroapps.vo.GroupVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.UsersVO;
import com.yorosis.yoroapps.vo.UsersVO.UsersVOBuilder;
import com.yorosis.yoroflow.rendering.constants.YoroappsConstants;
import com.yorosis.yoroflow.rendering.repository.UsersRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service(value = "userService")
public class UserService implements UserDetailsService {

	private static final String INVALID_USER = "Invalid email or password.";
	@Autowired
	private UsersRepository userRepository;

	@Autowired
	private FileManagerService fileManagerService;

	@PersistenceContext
	private EntityManager em;

	private UsersVO constructDTOtoVO(Users user) throws IOException {
		UsersVOBuilder userVOBuilder = UsersVO.builder();
		List<GroupVO> groupVOList = new ArrayList<>();
		for (UserGroup group : user.getUserGroups()) {
			YoroGroups yoroGroups = group.getYoroGroups();
			groupVOList.add(GroupVO.builder().groupId(yoroGroups.getId()).groupName(yoroGroups.getGroupName())
					.groupDesc(yoroGroups.getDescription()).build());
		}
//		if (StringUtils.isNotBlank(user.getProfilePicture())) {
//			userVOBuilder.profilePicture("data:image/jpeg;base64,"
//					+ Base64.getEncoder().encodeToString(fileManagerService.downloadFile(user.getProfilePicture())));
//		}
		userVOBuilder.userId(user.getUserId()).firstName(user.getFirstName()).lastName(user.getLastName())
				.userName(user.getUserName()).emailId(user.getEmailId()).tenantId(user.getTenantId())
				.groupVOList(groupVOList).theme(user.getTheme()).layout(user.getLayout())
				.defaultLanguage(user.getDefaultLanguage()).additionalSettings(user.getAdditionalSettings())
				.color(user.getColor());
		return userVOBuilder.build();
	}

	private UsersVO constructProfilePictureDTOtoVO(Users user) throws IOException {
		UsersVOBuilder userVOBuilder = UsersVO.builder();
		if (StringUtils.isNotBlank(user.getProfilePicture())) {
			userVOBuilder.profilePicture("data:image/jpeg;base64,"
					+ Base64.getEncoder().encodeToString(fileManagerService.downloadFile(user.getProfilePicture())));
		}
		return userVOBuilder.build();
	}

	@Override
	@Transactional
	public UserDetails loadUserByUsername(String username) {
		String tenantId = YorosisContext.get().getTenantId();
		// try {
		// tenantId = domainService.getAssignedTenantId(username.trim().toLowerCase());
		// } catch (YoroappsException e) {
		// throw new IllegalArgumentException(e);
		// }

		Users user = userRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
				username.trim().toLowerCase(), tenantId, YoroappsConstants.YES);
		if (user == null) {
			throw new UsernameNotFoundException(INVALID_USER);
		}

		return new org.springframework.security.core.userdetails.User(user.getUserName(), user.getUserPassword(),
				getAuthority(user));
	}

	private Set<SimpleGrantedAuthority> getAuthority(Users user) {
		Set<SimpleGrantedAuthority> authorities = new HashSet<>();

		authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
		return authorities;
	}

	@Transactional
	public UsersVO getLoggedInUserDetails() throws IOException {
		Users user = userRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
				YorosisContext.get().getUserName(), YorosisContext.get().getTenantId(), YoroappsConstants.YES);

		return constructDTOtoVO(user);
	}

	@Transactional
	public UsersVO getLoggedInUserProfilePicture() throws IOException {
		Users user = userRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
				YorosisContext.get().getUserName(), YorosisContext.get().getTenantId(), YoroappsConstants.YES);

		return constructProfilePictureDTOtoVO(user);
	}

	@Transactional
	public List<UsersVO> getAllUsers() throws IOException {
		List<UsersVO> userVOList = new ArrayList<>();
		for (Users user : userRepository.getAllUsers(YorosisContext.get().getTenantId())) {
			userVOList.add(constructDTOtoVO(user));
		}
		return userVOList;
	}

	@Transactional
	public List<UsersVO> getUsersAutocomplete(String userName) throws IOException {
		CriteriaBuilder criteriaBuilder = em.getCriteriaBuilder();
		CriteriaQuery<Users> criteriaQuery = criteriaBuilder.createQuery(Users.class);
		Root<Users> root = criteriaQuery.from(Users.class);
		criteriaQuery.select(root).where(criteriaBuilder.or(criteriaBuilder
				.like(criteriaBuilder.lower(root.get("firstName")), "%" + userName.toLowerCase() + "%")));

		TypedQuery<Users> createQuery = em.createQuery(criteriaQuery);
		List<Users> list = createQuery.getResultList();

		List<UsersVO> usersList = new ArrayList<>();

		for (Users user : list) {
			usersList.add(constructDTOtoVO(user));
		}

		return usersList;
	}

	@Transactional
	public ResponseStringVO saveTheme(UsersVO userVO) {
		Users user = userRepository.findByUserIdAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(userVO.getUserId(),
				YoroappsConstants.YES, YorosisContext.get().getTenantId());
		if (user != null) {
			user.setTheme(userVO.getTheme());
			user.setLayout(userVO.getLayout());
			user.setAdditionalSettings(userVO.getAdditionalSettings());
		} else {
			return ResponseStringVO.builder().response("Invalid user").build();
		}
		return ResponseStringVO.builder().response("Theme updated successfully").build();
	}

}
