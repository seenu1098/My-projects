package com.yorosis.yoroflow.services;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
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
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import com.yorosis.yoroflow.entities.Role;
import com.yorosis.yoroflow.entities.User;
import com.yorosis.yoroflow.entities.UserGroup;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.ChangePasswordVO;
import com.yorosis.yoroflow.models.GroupVO;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.models.RolesListVO;
import com.yorosis.yoroflow.models.UsersVO;
import com.yorosis.yoroflow.models.YoroFlowException;
import com.yorosis.yoroflow.repository.GroupRepository;
import com.yorosis.yoroflow.repository.MessageHistoryRepository;
import com.yorosis.yoroflow.repository.RoleRepository;
import com.yorosis.yoroflow.repository.UserGroupRepository;
import com.yorosis.yoroflow.repository.UsersRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service(value = "userService")
public class UserService implements UserDetailsService {

	private static final String INVALID_USER = "Invalid email or password.";

	@Autowired
	private UsersRepository userRepository;

	@Autowired
	private GroupRepository groupRepository;

	@Autowired
	private UserGroupRepository userGroupRepository;

	@PersistenceContext
	private EntityManager em;

	@Autowired
	private RoleRepository roleRepository;

	@Autowired
	private BCryptPasswordEncoder bcryptEncoder;

	@Autowired
	private MessageHistoryRepository messageHistoryRepository;

	private UsersVO constructDTOToVO(User user) {
		List<GroupVO> groupVOList = new ArrayList<>();

		if (user.getUserGroups() != null) {
			for (UserGroup group : user.getUserGroups()) {
				groupVOList.add(GroupVO.builder().groupId(group.getGroup().getGroupId())
						.groupName(group.getGroup().getGroupName()).groupDesc(group.getGroup().getGroupDesc()).build());
			}
		}

		return UsersVO.builder().userId(user.getUserId()).firstName(user.getFirstName()).lastName(user.getLastName())
				.userName(user.getUserName()).emailId(user.getEmailId()).contactEmailId(user.getContactEmailId())
				.groupVOList(groupVOList).color(user.getColor()).build();
	}

	private User constructDTOToVO(UsersVO userVO) {
		String hashedPassword = bcryptEncoder.encode(userVO.getPassword());
		return User.builder().userId(userVO.getUserId()).firstName(userVO.getFirstName()).lastName(userVO.getLastName())
				.userName(userVO.getUserName()).userPassword(hashedPassword).emailId(userVO.getEmailId())
				.contactEmailId(userVO.getContactEmailId()).createdBy(YorosisContext.get().getUserName())
				.activeFlag(YorosisConstants.YES).build();
	}

	@Override
	@Transactional
	public UserDetails loadUserByUsername(String username) {
		User user = userRepository.findByUserName(username.trim().toLowerCase());

		if (user == null) {
			throw new UsernameNotFoundException(INVALID_USER);
		}

		return new org.springframework.security.core.userdetails.User(user.getUserName(), user.getUserPassword(),
				getAuthority(user));
	}

	private Set<SimpleGrantedAuthority> getAuthority(User user) {
		Set<SimpleGrantedAuthority> authorities = new HashSet<>();

		authorities.add(new SimpleGrantedAuthority("ROLE_USER"));

		return authorities;
	}

	@Transactional
	public UsersVO getLoggedInUserDetails() {
		User user = userRepository.findByUserName(YorosisContext.get().getUserName());

		return constructDTOToVO(user);
	}

	@Transactional
	public UsersVO getUserDetailsById(UUID id) {
		User user = userRepository.findByUserId(id);

		return constructDTOToVO(user);
	}

	@Transactional
	public List<UsersVO> getUsersList() {
		List<UsersVO> userVOList = new ArrayList<>();
		for (User user : userRepository.getAllUsers(YorosisContext.get().getTenantId(), YorosisConstants.YES)) {
			UsersVO userVO = constructDTOToVO(user);
			List<GroupVO> groupVOList = new ArrayList<>();
			for (UserGroup group : user.getUserGroups()) {
				groupVOList.add(GroupVO.builder().groupId(group.getGroup().getGroupId())
						.groupName(group.getGroup().getGroupName()).groupDesc(group.getGroup().getGroupDesc()).build());
			}
			userVO.setGroupVOList(groupVOList);
			userVOList.add(userVO);

		}
		return userVOList;
	}

	@Transactional
	public ResponseStringVO createAndUpdateUsers(UsersVO userVO) {
		User user = null;
		String response = null;
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		if (userVO.getUserId() == null) {
			user = constructDTOToVO(userVO);
			List<UserGroup> userGroups = new ArrayList<>();
			for (GroupVO group : userVO.getGroupVOList()) {
				userGroups.add(UserGroup.builder().group(groupRepository.getOne(group.getGroupId())).user(user)
						.updatedDate(timestamp).createdBy(YorosisContext.get().getUserName())
						.updatedBy(YorosisContext.get().getUserName()).createdDate(timestamp).build());
			}
			user.setUserGroups(userGroups);
			response = "User Created Successfuly";
		} else {
			user = userRepository.getOne(userVO.getUserId());
			user.setFirstName(userVO.getFirstName());
			user.setLastName(userVO.getLastName());
			user.setUserName(userVO.getUserName());
			user.setEmailId(userVO.getEmailId());
			user.setContactEmailId(userVO.getContactEmailId());
			response = "User Updated Successfuly";
		}
		userRepository.save(user);
		return ResponseStringVO.builder().response(response).build();
	}

	@Transactional
	public UsersVO getUserInfo(UUID userUUID, String tenantId) {
		User user = userRepository.getUserbyUserIDAndTenantID(userUUID, tenantId);
		if (user == null) {
			return null;
		}
		return constructDTOToVO(user);

	}

	@Transactional
	public List<UsersVO> getUserName(String name) {
		CriteriaBuilder criteriaBuilder = em.getCriteriaBuilder();
		CriteriaQuery<User> criteriaQuery = criteriaBuilder.createQuery(User.class);
		Root<User> root = criteriaQuery.from(User.class);

		Predicate firstName = criteriaBuilder.like(criteriaBuilder.lower(root.get("firstName")),
				name.toLowerCase() + "%");
		Predicate lastName = criteriaBuilder.like(criteriaBuilder.lower(root.get("lastName")),
				name.toLowerCase() + "%");

		criteriaQuery.select(root).where(criteriaBuilder.or(firstName, lastName));

		TypedQuery<User> createQuery = em.createQuery(criteriaQuery);
		List<User> list = createQuery.getResultList();

		List<UsersVO> usersList = new ArrayList<>();

		for (User code : list) {
			if (!StringUtils.equalsAnyIgnoreCase(YorosisContext.get().getUserName(), code.getUserName())) {
				UsersVO vo = UsersVO.builder().firstName(code.getFirstName()).lastName(code.getLastName())
						.userId(code.getUserId()).userName(code.getFirstName() + " " + code.getLastName()).build();
				usersList.add(vo);
			}
		}

		return usersList;
	}

	public List<RolesListVO> getRolesNameList() {
		List<Role> roleNamesList = roleRepository.findAll();

		List<RolesListVO> nameList = new ArrayList<>();
		for (Role role : roleNamesList) {
			nameList.add(RolesListVO.builder().id(role.getRoleId()).rolesNames(role.getRoleName())
					.rolesDesc(role.getRoleDesc()).build());
		}
		return nameList;

	}

	@Transactional
	public ResponseStringVO save(UsersVO uservo) {

		if (uservo.getUserId() == null) {

			int userCount = userRepository.findByEmailIdCount(uservo.getEmailId(), YorosisConstants.YES,
					YorosisContext.get().getTenantId());

			if (userCount == 0) {
				String encryptedPassword = bcryptEncoder.encode(uservo.getPassword());
				uservo.setPassword(encryptedPassword);

				Timestamp timestamp = new Timestamp(System.currentTimeMillis());
				User user = User.builder().userName(uservo.getEmailId()).firstName(uservo.getFirstName())
						.lastName(uservo.getLastName()).userPassword(uservo.getPassword()).emailId(uservo.getEmailId())
						.activeFlag(YorosisConstants.YES).tenantId(YorosisContext.get().getTenantId())
						.createdBy(YorosisContext.get().getUserName()).createdOn(timestamp)
						.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp).build();

				userRepository.save(user);

				return ResponseStringVO.builder()
						.response(String.format("User %s created successfully", user.getUserName())).build();
			} else {
				return ResponseStringVO.builder()
						.response(String.format("User %s already exists", uservo.getUserName())).build();
			}
		} else {
			Timestamp timestamp = new Timestamp(System.currentTimeMillis());

			User user = userRepository.getOne(uservo.getUserId());
			user.setFirstName(uservo.getFirstName());
			user.setLastName(uservo.getLastName());
			user.setProfilePicture(uservo.getProfilePicture());
			if (StringUtils.isNotBlank(uservo.getPassword())) {
				user.setUserPassword(bcryptEncoder.encode(uservo.getPassword()));
			}

			user.setModifiedBy(YorosisContext.get().getUserName());
			user.setModifiedOn(timestamp);

			userRepository.save(user);

			return ResponseStringVO.builder()
					.response(String.format("User %s updated successfully", user.getUserName())).build();
		}
	}

	@Transactional
	public ResponseStringVO updatePasswordForUserManagement(UsersVO vo) {
		User user = userRepository.findByEmailId(vo.getEmailId());
		UsersVO loggedInUserDetails = getLoggedInUserDetails();
		if (StringUtils.isNotBlank(vo.getPassword())) {
			String hashedPassword = bcryptEncoder.encode(vo.getPassword());
			user.setUserPassword(hashedPassword);
			user.setModifiedOn(new Timestamp(System.currentTimeMillis()));
			user.setModifiedBy(loggedInUserDetails.getUserName());

			userRepository.save(user);
			return ResponseStringVO.builder().response("Password Updated Successfully").build();
		}
		return ResponseStringVO.builder().build();
	}

	@Transactional
	public List<UsersVO> getMessageHistoryUsers() {
		List<UsersVO> userVOList = new ArrayList<>();
		for (User user : userRepository.getAllUsers(YorosisContext.get().getTenantId(), YorosisConstants.YES)) {
			UsersVO userVO = constructDTOToVO(user);
			long count = messageHistoryRepository.getUnReadMessageCount(
					userRepository.findByUserName(YorosisContext.get().getUserName()).getUserId(), user.getUserId(),
					YorosisContext.get().getTenantId());
			userVO.setUnReadMessageCount(count);
			userVOList.add(userVO);
		}
		return userVOList;
	}

	@Transactional
	public List<UsersVO> getAllUsers() {
		List<UsersVO> userVOList = new ArrayList<>();
		for (User user : userRepository.getAllUsers(YorosisContext.get().getTenantId(), YorosisConstants.YES)) {
			UsersVO userVO = constructDTOToVO(user);
			userVOList.add(userVO);
		}
		return userVOList;
	}

	@Transactional
	public UsersVO getUsersForm(UUID id) {
		User user = userRepository.getOne(id);
		List<UUID> groupIdList = new ArrayList<>();
		List<UserGroup> groups = userGroupRepository.getUserGroups(id, YorosisContext.get().getTenantId(),
				YorosisConstants.YES);
		if (!CollectionUtils.isEmpty(groups)) {
			for (UserGroup group : groups) {
				if (StringUtils.equals(group.getGroup().getManagedFlag(), YorosisConstants.NO)) {
					groupIdList.add(group.getGroup().getGroupId());
				}
			}
		}
		return UsersVO.builder().userId(user.getUserId()).emailId(user.getEmailId())
				.contactEmailId(user.getContactEmailId()).firstName(user.getFirstName()).lastName(user.getLastName())
				.password(user.getUserPassword()).userType(user.getUserType()).profilePicture(user.getProfilePicture())
				.userName(user.getUserName()).mobileNumber(user.getMobileNumber()).groupId(groupIdList).build();
	}

	@Transactional
	public ResponseStringVO updatePassword(ChangePasswordVO vo) throws YoroFlowException {
		User user = userRepository.findByUserName(YorosisContext.get().getUserName());
		UsersVO loggedInUserDetails = getLoggedInUserDetails();
		if (bcryptEncoder.matches(vo.getOldPasssword(), user.getUserPassword())) {
			if (StringUtils.equals(vo.getNewPassword(), vo.getConfirmNewPassword())) {
				String hashedPassword = bcryptEncoder.encode(vo.getNewPassword());
				user.setUserPassword(hashedPassword);
				user.setModifiedOn(new Timestamp(System.currentTimeMillis()));
				user.setModifiedBy(loggedInUserDetails.getUserName());
				userRepository.save(user);
				return ResponseStringVO.builder().response("Password Updated Successfully").build();
			} else {
				throw new YoroFlowException("New Password and Confirm Password does not match");
			}

		} else {
			return ResponseStringVO.builder().response("Old Password does not match").build();
		}
	}

}
