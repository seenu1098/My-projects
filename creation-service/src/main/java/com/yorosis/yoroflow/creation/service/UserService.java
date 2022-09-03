package com.yorosis.yoroflow.creation.service;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import javax.mail.MessagingException;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.yorosis.yoroapps.automation.Email;
import com.yorosis.yoroapps.automation.EmailPerson;
import com.yorosis.yoroapps.entities.Customers;
import com.yorosis.yoroapps.entities.Organization;
import com.yorosis.yoroapps.entities.Roles;
import com.yorosis.yoroapps.entities.UserAssociateRoles;
import com.yorosis.yoroapps.entities.UserGroup;
import com.yorosis.yoroapps.entities.UserOTPRecoveryCodes;
import com.yorosis.yoroapps.entities.Users;
import com.yorosis.yoroapps.entities.YoroGroups;
import com.yorosis.yoroapps.entities.YoroGroupsUsers;
import com.yorosis.yoroapps.grid.vo.PaginationVO;
import com.yorosis.yoroapps.vo.ChangePasswordVO;
import com.yorosis.yoroapps.vo.CustomersVO;
import com.yorosis.yoroapps.vo.FilterValueVO;
import com.yorosis.yoroapps.vo.GroupVO;
import com.yorosis.yoroapps.vo.LicenseVO;
import com.yorosis.yoroapps.vo.ReactiveOrInactiveUsers;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.RolesListVO;
import com.yorosis.yoroapps.vo.SubscriptionExpireVO;
import com.yorosis.yoroapps.vo.UsersVO;
import com.yorosis.yoroapps.vo.UsersVO.UsersVOBuilder;
import com.yorosis.yoroflow.creation.config.RabbitConfig;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.exception.YoroappsException;
import com.yorosis.yoroflow.creation.provisioning.service.ProvisioningService;
import com.yorosis.yoroflow.creation.repository.OrganizationRepository;
import com.yorosis.yoroflow.creation.repository.UserAssociateRolesRepository;
import com.yorosis.yoroflow.creation.repository.UserOTPRecoveryCodesRepository;
import com.yorosis.yoroflow.creation.repository.UserRolesRepository;
import com.yorosis.yoroflow.creation.repository.UsersRepository;
import com.yorosis.yoroflow.creation.repository.YoroGroupsRepository;
import com.yorosis.yoroflow.creation.repository.YoroGroupsUsersRepository;
import com.yorosis.yoroflow.creation.table.vo.EnableTwoFactorVO;
import com.yorosis.yoroflow.creation.table.vo.TableData;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service(value = "userService")
public class UserService implements UserDetailsService {

	private static final String INVALID_USER = "Invalid email or password.";
	private static final String LOGIN_EMAIL = "loginEmail";
	private static final String FIRST_NAME = "firstName";
	private static final String LAST_NAME = "lastName";
	private static final String LAST_LOGGEDIN_TIMESTAMP = "lastLogin";
	private static final String AUTH_TYPE = "authType";
	private static final String ROLES = "roles";
	private static final String GROUPS = "groups";
	private static final String CONTACT_EMAIL_ID = "contactEmailId";
	private static final String ACTIVE_FLAG = "activeFlag";
	private static final String TWO_FA = "isTwoFactor";
	private static final String DEFAULT_WORKSPACE = "6a6ad5ca-5a59-4165-84fc-675c5c503fdf";
	private static final String GUEST_ROLE_ID = "aef72506-8ccc-49cc-bdd9-8b62e4fbd4b7";
	private static final String MM_DD_YYYY = "MM/dd/yyyy";
	private static final String EMAIL = "sales@yoroflow.com";

	@Autowired
	private UsersRepository userRepository;

	@Autowired
	private YoroGroupsRepository yoroGroupsRepository;

	@Autowired
	private YoroGroupsUsersRepository yoroGroupsUsersRepository;

	@Autowired
	private EmailService emailService;

	@Autowired
	private FileManagerService fileManagerService;

	@Autowired
	private BCryptPasswordEncoder bcryptEncoder;

	@Autowired
	private ProvisioningService provisioningService;

	@Autowired
	private UserRoleService userRoleService;

	@Autowired
	private UserAssociateRolesRepository userAssociateRolesRepository;

	@Autowired
	private UserRolesRepository userRolesRepository;

	@Autowired
	private UserOTPRecoveryCodesRepository userOTPRecoveryCodesRepository;

	@Autowired
	private UserSignatureService userSignatureService;

	@Autowired
	private ProxyService proxyService;

	@Autowired
	private RabbitTemplate publisherTemplate;

	@Autowired
	private OrganizationRepository organizationRepository;

	@Autowired
	private WorkflowClientService workflowClientService;

	private static final String DEFAULT_GROUP_ID = "7eda9d01-6ea7-4c1e-9201-2eda3fc2b080";
	private static final String DEFAULT_ROLE_ID = "0af6950d-f073-4553-a557-4a1e59a20f2f";

	private UsersVO constructDTOToVO(Users user) throws IOException {
		UsersVOBuilder userVOBuilder = UsersVO.builder();
		List<GroupVO> groupVOList = new ArrayList<>();
		List<RolesListVO> userRoleList = new ArrayList<>();
		List<RolesListVO> allUserRoleList = new ArrayList<>();
		List<UUID> roleIdList = new ArrayList<>();
		List<RolesListVO> filterRoleList = new ArrayList<>();
		if (user.getUserGroups() != null) {
			for (UserGroup group : user.getUserGroups()) {
				if (group.getYoroGroups() != null
						&& StringUtils.equals(group.getYoroGroups().getManagedFlag(), YoroappsConstants.NO)
						&& StringUtils.equals(group.getActiveFlag(), YoroappsConstants.YES)) {
					groupVOList.add(GroupVO.builder().groupId(group.getYoroGroups().getId())
							.groupName(group.getYoroGroups().getGroupName())
							.groupDesc(group.getYoroGroups().getDescription()).color(group.getYoroGroups().getColor())
							.build());
				}
			}
		}
		List<UserAssociateRoles> rolesList = userAssociateRolesRepository.getRolesBasedOnUserId(user.getUserId(),
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		if (!CollectionUtils.isEmpty(rolesList)) {
			for (UserAssociateRoles role : rolesList) {
				if (role.getRoles() != null
						&& StringUtils.equals(role.getRoles().getManagedFlag(), YoroappsConstants.NO)
						&& StringUtils.equals(role.getActiveFlag(), YoroappsConstants.YES)) {
					userRoleList.add(RolesListVO.builder().rolesNames(role.getRoles().getRoleName())
							.id(role.getRoles().getRoleId()).roleColor(role.getRoles().getRoleColor()).build());
				} else if (role.getRoles() != null && StringUtils.equals(role.getActiveFlag(), YoroappsConstants.YES)) {
					allUserRoleList.add(RolesListVO.builder().rolesNames(role.getRoles().getRoleName())
							.id(role.getRoles().getRoleId()).roleColor(role.getRoles().getRoleColor()).build());
				}
			}
		}

		if (allUserRoleList != null && !allUserRoleList.isEmpty()) {
			filterRoleList = allUserRoleList.stream()
					.filter(f -> StringUtils.equalsAny(f.getRolesNames(), "Account Administrator", "Account Owner"))
					.collect(Collectors.toList());
		}

		userVOBuilder.userId(user.getUserId()).firstName(user.getFirstName()).lastName(user.getLastName())
				.userName(user.getUserName()).emailId(user.getEmailId()).contactEmailId(user.getContactEmailId())
				.tenantId(user.getTenantId()).mobileNumber(user.getMobileNumber()).createdBy(user.getCreatedBy())
				.groupVOList(groupVOList).roleId(roleIdList).activeFlag(user.getActiveFlag())
				.lastLogin(user.getLastLogin()).isTwoFactor(user.getIsTwoFactor()).authType(user.getAuthType())
				.userRoleList(userRoleList).isRoleEditable(!filterRoleList.isEmpty())
				.defaultLanguage(user.getDefaultLanguage()).color(user.getColor()).timezone(user.getTimezone());
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

	public UsersVO getUsersCountBasedOnRoles() {
		List<UUID> roleIdList = userRolesRepository.getRolesListExceptGuest(UUID.fromString(GUEST_ROLE_ID),
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);

		log.info("context:{}", YorosisContext.get().getTenantId());
		List<String> guestUsersList = userAssociateRolesRepository.getAllUsersCountBasedOnGuestUser(roleIdList,
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);

		Long guestUsersCount = Long.valueOf(guestUsersList.size());
		Long nonGuestUsersCount = userAssociateRolesRepository.getAllUsersCountBasedOnNonGuestUser(
				UUID.fromString(GUEST_ROLE_ID), YorosisContext.get().getTenantId(), YoroappsConstants.YES);

		Long activeUsersCount = guestUsersCount + nonGuestUsersCount;
		return UsersVO.builder().activeUsersCount(activeUsersCount)
				.guestUsersCount(guestUsersCount != null ? guestUsersCount : 0L)
				.nonGuestUsersCount(nonGuestUsersCount != null ? nonGuestUsersCount : 0L).build();
	}

	@Override
	@Transactional
	public UserDetails loadUserByUsername(String username) {
		String tenantId = YorosisContext.get().getTenantId();
//		try {
//			tenantId = domainService.getAssignedTenantId(username.trim().toLowerCase());
//		} catch (YoroappsException e) {
//			throw new IllegalArgumentException(e);
//		}

		Users user = userRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
				username.trim().toLowerCase(), tenantId, YoroappsConstants.YES);
		if (user == null) {
			throw new UsernameNotFoundException(INVALID_USER);
		}

		return new org.springframework.security.core.userdetails.User(user.getUserName(), user.getUserPassword(),
				getAuthority());
	}

	private Set<SimpleGrantedAuthority> getAuthority() {
		return new HashSet<>();
	}

	@Transactional
	public UsersVO getLoggedInUserDetails() throws IOException {
		log.info("contex:{}", YorosisContext.get().getUserName());
		return getUserDetails(YorosisContext.get().getUserName());
	}

	@Transactional
	public UsersVO getUserDetails(String username) throws IOException {
		log.info("Get userdetails :{}", username);
		Users user = userRepository.findByUserName(username);
		UsersVO usersVO = constructDTOToVO(user);
		usersVO.setUserSignatureListVO(userSignatureService.getUserSignatureListVOList(user));
		usersVO.setTwoFactorSetUp(getTwoFactorSetup(user));
		usersVO.setTwoFactorEnforced(getEnforcedTwoFactor());
		return usersVO;
	}

	private boolean getTwoFactorSetup(Users user) {
		return StringUtils.isEmpty(user.getOtpProvider()) && StringUtils.isEmpty(user.getOtpSecret()) ? false : true;
	}

	private boolean getEnforcedTwoFactor() {
		Organization organization = organizationRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		return organization != null ? charToBoolean(organization.getEnableTwofactor()) : false;
	}

	private boolean charToBoolean(String value) {
		return StringUtils.equalsIgnoreCase(YoroappsConstants.YES, value);
	}

	@Transactional
	public UsersVO getLoggedInUserProfilePicture() throws IOException {
		Users user = userRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
				YorosisContext.get().getUserName(), YorosisContext.get().getTenantId(), YoroappsConstants.YES);

		return constructProfilePictureDTOtoVO(user);
	}

	public boolean isValidPassword(String password) {

		// Regex to check valid password.
		String regex = "^(?=.*[0-9])" + "(?=.*[a-z])(?=.*[A-Z])" + "(?=.*[@#$%^&+=])" + "(?=\\S+$).{8,20}$";

		// Compile the ReGex
		Pattern p = Pattern.compile(regex);

		// If the password is empty
		// return false
		if (password == null || password.length() < 6) {
			return false;
		}

		// Pattern class contains matcher() method
		// to find matching between given password
		// and regular expression.
		Matcher m = p.matcher(password);

		// Return if the password
		// matched the ReGex
		return m.matches();
	}

	@Transactional
	public ResponseStringVO updatePassword(ChangePasswordVO vo) throws YoroappsException, IOException {
		Users user = userRepository.findByUserName(YorosisContext.get().getUserName());
		UsersVO loggedInUserDetails = getLoggedInUserDetails();
		if (bcryptEncoder.matches(vo.getOldPasssword(), user.getUserPassword())) {
			if (isValidPassword(vo.getNewPassword())) {
				if (StringUtils.equals(vo.getNewPassword(), vo.getConfirmNewPassword())) {
					String hashedPassword = bcryptEncoder.encode(vo.getNewPassword());
					user.setUserPassword(hashedPassword);
					user.setModifiedOn(new Timestamp(System.currentTimeMillis()));
					user.setModifiedBy(loggedInUserDetails.getUserName());
					userRepository.save(user);
					return ResponseStringVO.builder().response("Password Updated Successfully").build();
				} else {
					throw new YoroappsException("New Password and Confirm Password does not match");
				}
			} else {
				return ResponseStringVO.builder().response("Invalid password pattern").build();
			}

		} else {
			return ResponseStringVO.builder().response("Old Password does not match").build();
		}
	}

	@Transactional
	public ResponseStringVO saveUserProfile(UsersVO uservo, MultipartFile file) throws IOException {
		if (uservo.getUserId() != null) {
			Users user = userRepository.findByUserId(uservo.getUserId());
			String userProfile = user.getProfilePicture();
			user.setProfilePicture(uservo.getProfilePicture());
			if (file != null) {
				saveFile(file, user);
			}
			userRepository.save(user);
			if (file != null) {
				if (StringUtils.isBlank(userProfile)) {
					return ResponseStringVO.builder().response("Profile Picture Saved successfully").build();
				} else {
					return ResponseStringVO.builder().response("Profile Picture Updated successfully").build();
				}

			} else {
				return ResponseStringVO.builder().response("Profile Picture Removed Successfully").build();
			}
		}
		return null;
	}

	private void saveFile(MultipartFile file, Users user) throws IOException {
		try (InputStream inputStream = file.getInputStream()) {
			String imageKey = new StringBuilder("user-profile/").append(user.getUserId().toString())
					.append(LocalTime.now()).toString();
			fileManagerService.uploadFile(imageKey, file.getInputStream(), file.getSize());
			user.setProfilePicture(imageKey);
		}
	}

	public char[] generatePassword(int length) {
		String capitalCaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		String lowerCaseLetters = "abcdefghijklmnopqrstuvwxyz";
		String specialCharacters = "!@#$";
		String numbers = "1234567890";
		String combinedChars = capitalCaseLetters + lowerCaseLetters + specialCharacters + numbers;
		Random random = new Random();
		char[] password = new char[length];

		password[0] = lowerCaseLetters.charAt(random.nextInt(lowerCaseLetters.length()));
		password[1] = capitalCaseLetters.charAt(random.nextInt(capitalCaseLetters.length()));
		password[2] = specialCharacters.charAt(random.nextInt(specialCharacters.length()));
		password[3] = numbers.charAt(random.nextInt(numbers.length()));

		for (int i = 4; i < length; i++) {
			password[i] = combinedChars.charAt(random.nextInt(combinedChars.length()));
		}
		return password;
	}

	public LicenseVO isAllowed() throws IOException {
		String currentTenantId = YorosisContext.get().getTenantId();

		LicenseVO licenseVO = proxyService.isAllowed(currentTenantId, "general", "users");

		Long totalQuantity = proxyService.getTotalQuantity(currentTenantId);

		int totalAllowedUsers = 0;

		if (totalQuantity != null && totalQuantity != 0L && !StringUtils.equals(licenseVO.getPlanName(), "STARTER")) {
			totalAllowedUsers = totalQuantity.intValue();
		} else {
			totalAllowedUsers = licenseVO.getAllowedLimit().intValue();
		}

		Long allUsersCount = userRepository.getAllUsersCount(currentTenantId, YoroappsConstants.YES);

		if (allUsersCount < totalAllowedUsers) {
			licenseVO.setResponse("within the limit");
			return licenseVO;
		}
		licenseVO.setResponse("You have exceeded your limit");
		return licenseVO;
	}

	private JsonNode getFontSize() {
		ObjectNode node = JsonNodeFactory.instance.objectNode();
		node.put("fontSize", 12);
		return node;
	}

	@Transactional
	public ResponseStringVO save(UsersVO uservo) throws MessagingException, YoroappsException, IOException {
		String response = null;
		if (uservo.getUserId() == null) {
			LicenseVO licenseVO = isAllowed();
			if (StringUtils.equals(licenseVO.getResponse(), "within the limit")) {
				int userCount = userRepository.findByEmailIdCount(uservo.getEmailId(), YoroappsConstants.YES,
						YorosisContext.get().getTenantId());

				if (userCount == 0) {
					String timezone = null;
					timezone = proxyService.getCustomerTimeZone(YorosisContext.get().getTenantId());
					String password = String.valueOf(generatePassword(8));
					uservo.setPassword(password);
					String encryptedPassword = bcryptEncoder.encode(password);
					Timestamp timestamp = new Timestamp(System.currentTimeMillis());
					Users user = Users.builder().userName(uservo.getEmailId()).firstName(uservo.getFirstName())
							.lastName(uservo.getLastName()).userPassword(encryptedPassword).emailId(uservo.getEmailId())
							.contactEmailId(uservo.getContactEmailId()).activeFlag(YoroappsConstants.YES)
							.tenantId(YorosisContext.get().getTenantId()).createdBy(YorosisContext.get().getUserName())
							.createdOn(timestamp).modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp)
							.profilePicture(uservo.getProfilePicture()).authType("Yoroflow")
							.mobileNumber(uservo.getMobileNumber()).defaultWorkspace(UUID.fromString(DEFAULT_WORKSPACE))
							.defaultLanguage("en").color(uservo.getColor()).additionalSettings(getFontSize())
							.timezone(timezone).build();

					userRepository.save(user);
					saveAssociateUserToSecurityGroup(uservo, user);
					addDefaultGroup(user);
					if (uservo.getRoleId() != null && !uservo.getRoleId().isEmpty()) {
						userRoleService.saveAssociateUserToRoles(uservo, user);
					} else {
						addDefaultRole(user);
					}
					inviteOrDeactivetUser(uservo, null);

					return ResponseStringVO.builder()
							.response(String.format("User %s created successfully", user.getUserName()))
							.responseId(user.getUserId().toString()).build();
				} else {
					return ResponseStringVO.builder()
							.response(String.format("User %s already exists", uservo.getEmailId())).build();
				}
			} else {
				return ResponseStringVO.builder().response("You have exceeded your limit").licenseVO(licenseVO).build();
			}
		} else {
			Users user = userRepository.getOne(uservo.getUserId());
			if (user.getLastLogin() != null) {
				response = user.getLastLogin().toString();
			} else {
				response = "Resend invite user";
			}
			return ResponseStringVO.builder().response(response).build();
		}
	}

	private void addDefaultRole(Users user) {
		int userAssociateRolesCount = userAssociateRolesRepository.getUserAssociateRolesBasedOnUserAndRoleId(
				UUID.fromString(DEFAULT_ROLE_ID), user.getUserId(), YorosisContext.get().getTenantId(),
				YoroappsConstants.YES);
		if (userAssociateRolesCount == 0) {
			Roles userRole = userRolesRepository.findByRoleIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
					UUID.fromString(DEFAULT_ROLE_ID), YorosisContext.get().getTenantId(), YoroappsConstants.YES);
			if (userRole != null) {
				Timestamp timestamp = new Timestamp(System.currentTimeMillis());
				UserAssociateRoles roles = UserAssociateRoles.builder().activeFlag(YoroappsConstants.YES)
						.tenantId(YorosisContext.get().getTenantId()).createdBy(YorosisContext.get().getUserName())
						.createdOn(timestamp).users(user).roles(userRole).modifiedBy(YorosisContext.get().getUserName())
						.modifiedOn(timestamp).build();
				userAssociateRolesRepository.save(roles);
			}
		}
	}

	@Transactional
	public ResponseStringVO update(UsersVO uservo) {
		String response = null;
		if (uservo.getUserId() != null) {
			Users user = userRepository.getOne(uservo.getUserId());
			Timestamp timestamp = new Timestamp(System.currentTimeMillis());
			user.setFirstName(uservo.getFirstName());
			user.setLastName(uservo.getLastName());
			user.setContactEmailId(uservo.getContactEmailId());
			user.setMobileNumber(uservo.getMobileNumber());
			user.setModifiedBy(YorosisContext.get().getUserName());
			user.setModifiedOn(timestamp);
			user.setColor(uservo.getColor());
			user.setDefaultLanguage(uservo.getDefaultLanguage());
			user.setTimezone(uservo.getTimezone());
			Users users = userRepository.save(user);
			userSignatureService.saveAndUpdateSignature(uservo.getUserSignatureListVO(), users);
			response = "User Profile Updated Succesfully";
		}

		return ResponseStringVO.builder().response(response).build();
	}

	@Transactional
	public ResponseStringVO saveNewUsersWithBaseGroup(UsersVO uservo) throws IOException {
		if (uservo.getUserId() != null) {
			provisioningService.insertDefaultValues(YorosisContext.get().getTenantId(), uservo.getUserId(),
					UUID.fromString(DEFAULT_GROUP_ID), null);
		}
		return ResponseStringVO.builder().response("Group Associated Successfully").build();
	}

	private YoroGroupsUsers constructYoroGroupsUserVOToDTO() {
		Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());
		return YoroGroupsUsers.builder().tenantId(YorosisContext.get().getTenantId())
				.createdBy(YorosisContext.get().getUserName()).createdOn(currentTimestamp)
				.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(currentTimestamp)
				.activeFlag(YoroappsConstants.YES).build();
	}

	private void saveAssociateUserToSecurityGroup(UsersVO uservo, Users user) {
		if (uservo.getGroupId() != null) {
			for (UUID id : uservo.getGroupId()) {
				List<YoroGroupsUsers> checkGroupExist = yoroGroupsUsersRepository.checkGroupExist(id,
						uservo.getUserId(), YorosisContext.get().getTenantId(), YoroappsConstants.YES);
				if (checkGroupExist.isEmpty()) {
					YoroGroupsUsers yoroGroupsUsers = constructYoroGroupsUserVOToDTO();
					YoroGroups groups = yoroGroupsRepository
							.findByIdAndTenantIdAndActiveFlagIgnoreCaseAndManagedFlagIgnoreCase(id,
									YorosisContext.get().getTenantId(), YoroappsConstants.YES, YoroappsConstants.NO);
					if (groups != null) {
						yoroGroupsUsers.setYoroGroups(groups);
						yoroGroupsUsers.setUsers(user);
						yoroGroupsUsersRepository.save(yoroGroupsUsers);
					}
				}
			}
		}
	}

	private void addDefaultGroup(Users user) {
		YoroGroups yoroGroups = yoroGroupsRepository.findByIdAndTenantIdAndActiveFlagIgnoreCase(
				UUID.fromString(DEFAULT_GROUP_ID), YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		if (yoroGroups != null) {
			Timestamp timestamp = new Timestamp(System.currentTimeMillis());
			YoroGroupsUsers yoroGroupUser = YoroGroupsUsers.builder().activeFlag(YoroappsConstants.YES)
					.tenantId(YorosisContext.get().getTenantId()).createdBy(YorosisContext.get().getUserName())
					.createdOn(timestamp).users(user).yoroGroups(yoroGroups)
					.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp).build();
			yoroGroupsUsersRepository.save(yoroGroupUser);
		}
	}

	@Transactional
	public ResponseStringVO updatePasswordForUserManagement(UsersVO vo) throws IOException {
		Users user = userRepository.findByEmailId(vo.getEmailId());
		UsersVO loggedInUserDetails = getLoggedInUserDetails();
		if (StringUtils.isNotBlank(vo.getPassword()) && isValidPassword(vo.getPassword())) {
			String hashedPassword = bcryptEncoder.encode(vo.getPassword());
			user.setUserPassword(hashedPassword);
			user.setModifiedOn(new Timestamp(System.currentTimeMillis()));
			user.setModifiedBy(loggedInUserDetails.getUserName());

			userRepository.save(user);
			return ResponseStringVO.builder().response("Password Updated Successfully").build();
		}
		return ResponseStringVO.builder().response("Invalid Password").build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO inviteFirstUser(UsersVO userVo, CustomersVO customerVO)
			throws MessagingException, YoroappsException, IOException {
		return inviteOrDeactivetUser(userVo, customerVO);
	}

	@Transactional
	public ResponseStringVO inviteOrDeactivetUser(UsersVO userVo, CustomersVO customerVO)
			throws MessagingException, YoroappsException, IOException {
		String password = null;
		String profile = null;
		String content = null;
		String subject = null;
		String firstUserName = null;
		password = userVo.getPassword();
		UsersVO adminUser = getLoggedInUserDetails();

		if (customerVO != null) {
			subject = userVo.getSubject();
		} else {
			subject = adminUser.getFirstName() + " " + adminUser.getLastName() + userVo.getSubject();
		}
		List<UUID> userIdList = new ArrayList<>();
		userIdList.add(userVo.getUserId());
		if (userVo.getSubject().contains("deactivated")) {
			firstUserName = adminUser.getCreatedBy();
			if (!userIdList.isEmpty()) {
				workflowClientService.saveInactiveUsers(YorosisContext.get().getToken(),
						ReactiveOrInactiveUsers.builder().userIdList(userIdList).build());
			}
		} else {
			if ((userVo.getSubject().contains("reactivated")) && !userIdList.isEmpty()) {
				workflowClientService.saveReactiveUsers(YorosisContext.get().getToken(),
						ReactiveOrInactiveUsers.builder().userIdList(userIdList).build());
			}
		}

		if (StringUtils.equalsIgnoreCase(firstUserName, userVo.getUserName())
				&& userVo.getSubject().contains("deactivated")) {
			return ResponseStringVO.builder().response("Does not deactive the first user").build();
		} else {
			Users username = userRepository.findByUserName(userVo.getUserName());
			if (username == null) {
				return ResponseStringVO.builder().response("User Name Is Empty").build();
			} else {
				Customers customer = null;

				YorosisContext currentContext = YorosisContext.get();
				try {
					YorosisContext.clear();
					YorosisContext context = YorosisContext.builder().tenantId(YoroappsConstants.DEFAULT_SCHEMA)
							.build();
					YorosisContext.set(context);
					customer = emailService.getCustomer(currentContext.getTenantId());
				} finally {
					YorosisContext.clear();
					YorosisContext.set(currentContext);
				}
				if (customerVO != null) {
					customer = Customers.builder().logo(customerVO.getLogo())
							.subdomainName(customerVO.getSubdomainName())
							.actualDomainName(customerVO.getActualDomainName()).orgName(customerVO.getOrgName())
							.build();
				}
				if (customer != null && StringUtils.isNotBlank(customer.getLogo())) {
					profile = "data:image/jpeg;base64,"
							+ Base64.getEncoder().encodeToString(fileManagerService.downloadFile(customer.getLogo()));
				} else {
					profile = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAREAAABGCAYAAADraKB1AAAACXBIWXMAAAsSAAALEgHS3X78AAAW1klEQVR4nO1dC3AcRXru7n1p9VrhFyR1iSTbUCGHsJB04ZIiWK5UgLsKhy5XV8BRRJLR3UEuwYI7KCABywcHR3IB+cgZATaS6kLAl8pZzuUBuaSwHMqFU5KwAD+wZWQRwA9sa1dv7c50p3q3Z93q7dmZ2RlJK9Nf1Za0szM9M/34+n/135AQAhQUFBRyBVI1p6Cg4AaKRBQUFFxBkYiCgoIr+POp+iobO8p8l6z4Jbpk+TUAIgAQAhBCAOgHodRfiAAMhophQdgPUOp76rzU3/R57Jh+9tSBI/defU0evJ6CwkWJvCIRAECbPnp2AwwXAbRsBUcOBolwhGETZGbm9UV+JwWFixp5552pbOzoAgA0+r9QAdCyleYkgthxC0nk4LdWwTx4LQWFixYLahNZc+8vnrr84X/Hax/YPWR2znD33U0AgG48es71/fDo2VOuC1FQUMiKBSGRNd/7x+vW3v/Lk6io5CGAEIQF4TVrv79rl+zctT/oKff/1up1/sorXN8XT0+97boQBQWFrJh3Elnzl6/tgoXFe2EwdBl/HBaVNKz9/q7t/LG1D/7qKVS2bAiVRKq9uDeZnfk7L8pRUFAwx7zZRNbc8/PrQDD0KxgMlSU9KmmbxgX7Bj2GJ8Z3AKw/DguL3oaFxZdBzvaR1bBqYRMhibh2eGNFQLW9gsL8Yl68M6v//JU9qKBwfXJAWwCVRO4CAGwEfp+nBlAyMTbiZXkKCgpyeEoiq7/TfSsMBjthMBR2dCFCnntQ8NTkP3ldpoKCQiY8IZHVLS+XA5+/BwZD1XakjwVBIt6h2ltBYf7hesSvbnm5FfoDQ9Dv98QY6gXweCx69NH1Sp1RUFgA5CyJrN64vRwg9N/A71+TDO7KI5CJ8T2q8ygoLAxykkRWN7/0FEC+YYDQmnxsJ5KYfS0PHkNB4XMBRy7eyqYXyiGEbwPku4x316bdq3Ncs5BzuZq7eIHgrs3JxYsxgIFg8ljStfvtNcq1q6CwQLAtiVT+2fM0wnQYAHiZjdMXBHhibGK2763x+Lv/C4imJW9JJseVLURBYQFhSSKVd267rvLObaMAgAYqueRF4+ga0T46vvOD+2tLyMz09XhiPBY/2J/8CU9PKdeugsICIiuJVN7x93sAxnsBIWX50ij62dOfJIaPVh978iu3gdSCvQMAgHocPR+LH3znM+XaVVBYWEhtIhXf+umtgJBOCGCYX1qfaf9YWJuIfubkc8eeuPFeWQ1VNnZQF/OJ4e67o0u1D9XW1dTz3/v7Bi4aL1NtXQ2diPgwgGh/38CBRXykBYfYvgwn+vsGTizl98ogkYrbt74OdP3GueSQHyRCZmencfTclcd+dJNru0dtXU0PAOAW4XB3f99Ak4My6LmdwuFYf9+ALcmNdSpaBv1bbnIafVdKJl1OSaW2roaev97GqfQetCNH2b16vOjYrH4a2PtFTE4bZPdsd3pPB+8nwwa+PmvratoAAJvZ1y39fQNtOZYrPqNRB2Jf4xGjdW6njWvramhZxgp4232Nu562xZvcoeb+voEuh2VEufbcMEedoQmBoD9wY77FfRiABeEwWrby8OV/9YbZgHOCdsm5jbV1NRUOypARjqzcOaANyQYAbczGLAQC2G/0nDfpNSazmVuUs8FIO/qzVEusravpclgXadCBU1tXc4IR7C1ZCIRiHQBgk9t75htYHUS5OsiGiNDG2QI3eZKJWJwrQ4NwTPyeFaz/pduTkp4YbNYKEGqAwVCEJOJ52TiUSHzLVx6+/NH/vPLY4zfkLJHQl6+tq+mVzGSt7JMVrDLFa2PZSISJ9G1s0OSC9ayjbe3vG7B8RpegnbqBvqddtYO9X48L6cC4Z1t/34AlGQvoZtKUXcyLCsHqoEtCHCOsbgxpz1DvqgVJjdbdO7V1NVJpqL9vICr0W3qtE7VQnIScTkr8+buBGLFK7QmVjR31AKE9MBiMgITmsPyFASwoDPuWrTp8+WO/vvLYD//YjWpDB+I7wrEm1omtbCsycbfd7DrWufawmdctNjESq7fxnG5AO3ZyZrRSNdiMuMdC6rADev2z7J62Vctc1D2vYdLGdMC3mTxbj/EPU3vaOKl0M5XKTOqAV+Ma7Ei/7B4Vkv4XYROF3brjSSR5TYZ3xvB2AIhiIJC/MVswXBiG/sDdbspgM2y3cDhiJYmYSCEjFnq0GYHE2DNsAABc0t83AOmH/g8A+Lrk+QysE0RbWzDKFz/s/lslZUTYzJqtPiqyEMgIK3cDf0+qPVN93JjNJKCqpVNpZLHBt3GM2RtsDVBml6gW2ruR2WpE9HDfnUh9ZqqLE2mEv1/yOdDYj1bumfq3wjv4sy4QCYzlzapcDnhibCYxdOj2o4/VP+xBcbJGamWzihlks4MpgbDBICMQOoCSsw3taLxUQf/v7xvoYTNRpclgW+fVQGP3p+Qp215jvYWtoseEQKhITt+vVRxIVLKhA6e/b6CBEdig5PpNzJCY95C0cb1TgyVr8yaBSDZLvHYHGEkl4cBOxp+3hfvfVh0LbTFiSKeI6DCiHSz8h+n/Cc4ZGGkiQSh/iETXgH7y490fPPh74aGfNHiyPoZVhEwakYrSbDA1CodHzDoMa2CZDYR6ghrsqCNswDWYSCWbvDS2mkhnwKyjsZlSRpDNdj0cjGDqTYiky4LQFx2sT/BtfJ8b9zUjEn7SkPUtXhqx2/6GnWZEUIHW2azjDFWGAkEEYvqHBUDbX9o53RuSEUkDMDaQWkTg6PnTiZHj6449ccN8zExSacTBudkGi+y33Q71/SQkncvO/XNBj+SajE7GOp6snu7LZRZmnVS0cVmql3kAvv57czAKy9DKSRvlzGbCg5fsLElEkCIMqZfvS3bGFX+fdB9BRpiIPhICif7izqk3C0Qi2cN0VwAWYY8akohj7dOPnj76WP1lx5/9xrvzcQ8TaSSj4XKQQqpNPDiOCYSDbEBZqRtOIZOOZB21SaLG5DyIWMeWvZ+b+ppXMCLl+4QnhM76JN+vxEHOk8h6G5IEf71BALaJiJXPS5ycJOIj6T1g8P+FgDZY1Dn1XxlE0mUQCSHY4lm9Ax49tz9+6J3lQ3/ztYdkhQ5XNbcOVzVPnqhqOuLBTdt4PZM7lu277Bwess7f5cajYkJ4wKm/3wKyDikzDsru6WoWpnYgiTRSPk/xMV5AtBN46SHiSeQWnihYP+DVP6v6Sf/O6hgIEqdV/+HL7+X7MAI+8j5/Jv40CPRDhZ1Tb4TlREKlkXkmEjI9NaF9fOL2Y0/c8GVZGPtwVXP1cFXz24TAJwEBhQCAS93ekzWKOADS0ghrQLGiBy3EdlkgkCMx3wSyMrwkEVlZMuLLkLK4DuoGsvfLVxLh29iLd0+D2VV4QhX7ky1JgknEhus4rcIIRGQVuCaTZJJAQKKh4NNBoB8Ld079h5xIiK4DgPUs98sRGBP9zMmdR9s2lBzf+s0Mw+lwVXPZcFVzOyZwv4bhtQQAZwmhrdEukUZaub+i6G6lq2e437xYL2Iy23mSnpKRpqiyAbHjmEgGXq2Fkb3fUiCR+VgLxMfniHVgVx2R2jIkZWSbiKRGVZAMNkOgT3YFPhsAwEc6p/61EBT+yVR6ZqBEQhe7EV3blF4f4wHwWPQTMjX51ePP3Sa1ewxXNTdgAl/RCKQBckGB/dwGOCXBogHbuTUUgFmuGySE0ZuD6NrrwWMaGBR01JzrgFscZ0Yg3TbXtXglyucyGJtsqjx7PFY5eFvUfETBmq4PolJfbV2N8TXpYTFRlU2lCPZ9E3dehnrO7G2GJDMiToT+0gfPvjV69xekT0/O+4GOQOfkvxSBoq9N8kTSWtnYUUa0RCOki+P8Qen1dkDiszqZnmwbeuZPn5CdPlzVXEEAeC2BUbVOUAgCAhDMEJ+8dB21S6SOLskgzWpAy2FNg1PkZFepratxah2PLbR3hJG508tk5GcGL0nEi3VcbrCbc93WSyTGMo6EBkWSYcs/Yqx/mxGRqRQC7CQlIjEfwKcCL0zuKpozKIyNt0k8ns4q5ggY06Cx/drHwytkBMJUl7YERkcmNf+XEhiFPKlyC7AKFG0jMg+EVUdcsikJOIwsQGi9gjtYqSP8MTN7nJWBNZs6lFo7A0NYAxiaZn4nE74gQWD/5D8XX1v0jYm0KEOJpLKxgyZGboR+HwA+e6oNic9O4PGxb3+47Q5pwNhwVXM9JvDVKd2/XCcgkMwSIDPecBiparq1/L2unbYewBrtTLQ3m2Us3XhU/JfMpl4GTc3natcY63B21hDx8OT9cnRXb1iktTOyRZxewqpOrewiWaUI7ngjd75INg3CuXOQGvVBMmH10mQaBUnMt3/yF8WZEgkh3Xh6ytrYSjDBY9GXh56+uURGIFR1Ga5q7pnS/a/HEsFLNQKdLN75DQfnZgUbOGZE4cQWIhppvVh8Z4ioIsHZXYjYy33E5wNcKH6rBYHIfvNKhZOVsxSkoflQYeckchJ/FDw45RICNgggw5bBwVQSYWq5IYn3yvqEI6soiaMgiKN9k6+VyIhkEE9NAKDLiYRMT32oR89XH3/utrtkv1PVJY7R4XPx0M1Tuj9EFjmfK3Pdygamk8CnjEbzaC1Izp4RtiAs+TEhylvsSBTi+g0GO0FPdiB7v3zN8sY/13yQCC/lZJMkDKTrTiAAU/czIwYzV29WVQakScRPzmV9DQ5kFoWJBvdNvFIqVlh9kkgmx5JrXNLQtDgej94/tPWbaz7suDPD80JVl+NXbTx0Ph56+Hw8VKATmKu756ocr8uGDGu7w+xbskr3gkRkhk7HMQosslRGlHYDxuwGoDmF2fL3fIRdF6ljCBNOzKYkwQ/6rGqIALPoWEt1KDlgoY987OgFcTI+Y9/Ezy8QCQsKSxHJeAwQXQNkZmqvfv6zSz98/s5nxSKY4bRrXAv8+tRMwe/MYl/uLp4U1rq8fj4gG9iNbjw3JmkIgItAJ9mAvcWmu1R2zzY30khtXY0sHmcwX/OxMtXWkMgikjUubsBPFtna18wuYpCBnSBAMzI0yjMlsdSsT3LQHBAJAwj2TXRFZETSjWOj1xz/2R3rTSJOW2d038lPZwrviCaCfpKv+RhdIkuIek4rU9k1MimhO1cPChsEsvgVy8haE5WvPNfQd0au0mRPuZS3gOCfzxWJGpBMFqbGfEEdoXaRaiEBkZ18JrxtJenqFVIhmpJQikTghfUzTgBDOAz8eN/EjrlEQm0kbAXwHNBw9aGrNr59Nl7w5KnZcEECo5z3ApZAHuyy+JCtyVnHMobZ7mxZMqPFPFj0JZs9y00S4oiQqVZU2nKa/NcsM5rV0oJ8AB/pnDOJcnVRJpC4nWA/UaWxtGVYlNFg07PDSASB981OsAIsxmFYQPZNvFRmKqIb4eqxRGD/yHTxtWOJgO1w9QDCpyCw8O+msDzXd5hPsMaXDUaDSOws4zbyaMq8O61uM7Oz62VZzVqt3K1MTJZJW40s6bClu5apMDICcbvieUHAJAH+OR2TqAFusjC8b3aD/UQSyRalagZRLbJFRClJwOUKf1imhQn07xt/4ZI/KPnu6BwJZLiquWlG9/3sdDzsn9VRMLn7g4MbfvHQ9qTr9thVG7dggjYSQOh3n7snXlhQAyabacWoynUs8fIgm3lE6c3oDGau4W4PZ+k2ydL+CJtVrQyGrcwzIT7nepbFfTfrhDzZlXHvZxaP07pU9qZhIehbuRDyRkYITXZVTTZZdAn1YSvYj9YTF3nKD/6MKFWLd0jfl3uOrGUYnpC+C5lFcgNakQgDfa7IM1zV/NiYFvjJ8FRJ4bTu3HDqh+TU4d9tSb7I5e+/vDmI9H4EgDQNPQSg2M3zzzckae94rGNbNbwpfDZbEIhns3SWXB6WRlYuoZAsMxlgbuNO4d12sQFnRiCO90NZbLD0knwb0/emQYft2SQy6oVhksubggTydYckaoy/CDcZOK1DY5Uv3y5ZJZmkJBJ5/PRbsccuvZ1M+l51tQ4FQ1Ec3Tuj+x50WowPkukQ0h/54qGX0rolNcbqBN6kExiSrJ0BYub6fAQd9Gy/mXYXC+ZibIb2fIDRMplqIRJXl1WELCOSaraAMdctMQAz7jUssgRidzEfzQ0zpx0kbRxh9UHTWI5IwgZknrZBJsE4rQPZhmxOvXaOy0jHZER+eHonLNZut4wvzwZf5qVFfq3I7uXU9lHg03fUHOkoFAikGhP4bNy9G3jRwTpdBZuxZBGjZjCywlfM8wwtk0bsGlkBl+zZLIu7GUa4xM6LrcIYm3lZfaTEapK53axcHkYdVOdYB6LxcyQHe5lYRrb4lCTmzN6RLWd2xrasAiCBcpNIfASMPbO8vvT+c8aD2K6IAqQfCCDcUHX4xbTLkIbB01BfAsDeWYw0K2njo6ubyn/73S7XW2xymJfObBjiuERH9SY2hUH2DMbWlk7duI6fn63q3CqJvrQd28I6XQMT4fn3E1WXXuP9ckxmxL+f27D4EzmkajAdoGzwNjHJroF9ZPu+uK2DOfesravp5sgtlwBEsQxL97B0Q+/Y46tuBRi+Cv0YggChEa0A0r8B4y9O/e/njxGgDxcAMu7bUPqDs+kbD121kRydiAAISdKgahhWqUpCWarAp0fDSLt53ZEX3zKuSS3/h6/N6oh2vAR10qTUmNRCPCSUBVNlRSEE1R6TiIKCggWkM3vk0TM7Y0+sov86kkhgAAOC5zpOfJDEZPq/DxKtyKc9UPtBB6+2JLeZnMG+e6Y1f5CSgx/iIElu622qZdEfni5/r8uLPWgUFBQcwlQ9iPz1mZ1jT64EjoiESiQ6rBdEoAMIkuuNBXUIElLk0/Z++ei2OYYrajiNY/TUpO5HOkHJzGX0Ap3AZN4jGWBKDGyoeE9JHwoKi4WsNobSRz7bOfbjldUAEGm29QxgSEkk43AI6bMz2FdQ6NOOh336H9V90MHbPWjukG1jWqhiRkcFSVXFgrIgANMIgkdWv//yUttmUUHhooOlW7T0oc8eHnt6xUoQINIl/HMQwrJE8G0FSO8o9Gmbrz36fDppEDOatscSwZsmNV8QUlg7hogPkr1XHNyRr0l7FRQ+d5AaVmUY+9sV22GJflc2wyqZ8NF9a3ojW06bDnJm92id1P33ReOhYpxM9ZySPtJG0znG19R3P8RRPyQ3X3Fwx1tZH1RBQWFBYTtAq/SBsy1jzywHMKJnl0iybElDQ+ATGD31WbxgeRyjAEzZSLIWR2NHAgg/feXB7cpwqqCQh3AU5Vl6/7mW8fblAC7DciIpwFKbCA0W0wnsOBcvuHpMC4aRPGN7BgIIH/AB0nDlwe3KcKqgkKdwHCpe0nquZfynywBcmcggEkhJBM+Nwhuuar46jtEbJ6aLV1GTh5XRFJiEvSsoKOQnckpFWHLv+RZ8LrBD9hsRJJHK9zrf1QhahW0kPqKqSwjpvWLYu4KCQv4i5+3rSv/ifAs+k0kkSWlEQKHPel+aAMLRQr92ffWRF5XnRUFhCcHVHpgl3xttwSeDc4iEkki09TdFIjBbIk69MKTIr/34Sx88f8nVh19UnhcFhSUG1xvpltwz2oI/CV0gEhpwhjNUl2gI6RniSNinHy/2a5XXHHlBeV4UFJYoPNmNu/g7oy34oxSRwLDUQ3MCQZAmET8kWqk/cd+1R7etrT7ygvK8KCgsYXiWyKe4JdoyvqMMgEL9LoKBuH7mBFVbkuf5E72/L6ybUVBQWLrwRBIxUHJXtIWcC3wX6FDMQdBT6k/0LAvO/qEiEAWFiwu2w94VFBQUZPBUElFQUPj8QZGIgoKCKygSUVBQyB0AgP8HlIGbgExJllUAAAAASUVORK5CYII=";
				}

				if (StringUtils.equalsIgnoreCase(userVo.getInviteUser(), "resend")
						|| StringUtils.equalsIgnoreCase(userVo.getInviteUser(), "changePassword")
						|| StringUtils.equalsIgnoreCase(userVo.getInviteUser(), "invite first user")) {
					if (customerVO == null) {
						password = String.valueOf(generatePassword(8));
					}
					String encryptedPassword = bcryptEncoder.encode(password);
					username.setUserPassword(encryptedPassword);
					userRepository.save(username);
				}

				if (userVo.getSubject().contains("deactivated")) {
					content = "has deactivated your account";
				} else {
					content = "has reactivated your account";
				}

				Map<String, String> templateMap = new HashMap<>();
				String contactEmailId = null;
				if (customerVO != null) {
					templateMap.put("templateId", "inviteFirstUser");
					contactEmailId = customerVO.getContactEmailId();
				} else if (StringUtils.equalsIgnoreCase(userVo.getInviteUser(), "invite")
						|| StringUtils.equalsIgnoreCase(userVo.getInviteUser(), "resend")) {
					templateMap.put("templateId", "invite");
					contactEmailId = userVo.getContactEmailId();
				} else {
					templateMap.put("templateId", userVo.getInviteUser());
					contactEmailId = userVo.getContactEmailId();
				}
				templateMap.put("FirstName", adminUser.getFirstName());
				templateMap.put("LastName", adminUser.getLastName());
				templateMap.put("SubdomainName", customer.getSubdomainName());
				templateMap.put("ContactEmailId", adminUser.getContactEmailId());
				templateMap.put("MessageBody", userVo.getMessageBody());
				templateMap.put("password", password);
				templateMap.put("content", content);
				templateMap.put("DomainName", "yoroflow");

				Set<EmailPerson> setEmailPerson = new HashSet<>();
				setEmailPerson.add(EmailPerson.builder().emailId(contactEmailId).build());
				Email email = Email.builder().tenantId(YorosisContext.get().getTenantId()).isHTML(true)
						.templateBodyId(templateMap.get("templateId")).templateValues(templateMap).subject(subject)
						.toRecipientList(setEmailPerson).build();
				publishToEmail(email);

				if (userVo.getSubject().contains("has deactivated your account at")) {
					Users user = userRepository.findByUserName(userVo.getUserName());
					user.setActiveFlag("N");
					userRepository.save(user);
				}
				if (userVo.getSubject().contains("has reactivated your account at")) {
					Users user = userRepository.findByUserName(userVo.getUserName());
					user.setActiveFlag("Y");
					userRepository.save(user);
				}
				return ResponseStringVO.builder().response("message sent successfully").build();
			}
		}
	}

	@Transactional
	public ResponseStringVO sendEmailForSales(UsersVO userVo, CustomersVO customerVO) throws IOException {

		SimpleDateFormat format = new SimpleDateFormat(MM_DD_YYYY);
		Map<String, String> templateMap = new HashMap<>();
		templateMap.put(FIRST_NAME, customerVO.getFirstName());
		templateMap.put(LAST_NAME, customerVO.getLastName());
		templateMap.put("email", customerVO.getContactEmailId());
		templateMap.put("phoneNumber", customerVO.getPhoneNumber());
		templateMap.put("subdomainName", customerVO.getSubdomainName());
		templateMap.put("planName", customerVO.getOrgPlanType());
		templateMap.put("trialStartDate", format.format(customerVO.getStartDate()));
		templateMap.put("trialEndDate", format.format(customerVO.getEndDate()));

		Set<EmailPerson> setEmailPerson = new HashSet<>();
		setEmailPerson.add(EmailPerson.builder().emailId(EMAIL).build());
		Email email = Email.builder().tenantId(YorosisContext.get().getTenantId()).isHTML(true)
				.templateBodyId("salesTeamNotification").templateValues(templateMap).toRecipientList(setEmailPerson)
				.build();
		publishToEmail(email);
		return ResponseStringVO.builder().response("message sent successfully").build();

	}

	@Transactional
	public void publishToEmail(Email email) {
		try {
			log.info("### pushed to email {}", email);
			publisherTemplate.convertAndSend(RabbitConfig.DEFAULT_EXCHANGE, RabbitConfig.EMAIL_QUEUE, email);
		} catch (Exception ex) {
			// Ignore the error when the error happens as it shouldn't stop the process
			log.error("Unable to post in the queue", ex);
		}
	}

	@Transactional
	public ResponseStringVO checkYoroAdmin() {
		Users user = userRepository.findByUserName(YorosisContext.get().getUserName());
		if (user.getUserGroups() != null) {
			for (UserGroup group : user.getUserGroups()) {
				if (StringUtils.equalsIgnoreCase(group.getYoroGroups().getGroupName(), "Yoro Admin")) {
					return ResponseStringVO.builder().response("Logged in user is in Yoro Admin group").build();
				}
			}
		}
		return ResponseStringVO.builder().response("Logged in user is not in Yoro Admin group").build();
	}

	@Transactional
	public UsersVO getUsersForm(UUID id) {
		Users user = userRepository.findByUserIdAndTenantIdIgnoreCase(id, YorosisContext.get().getTenantId());
		if (user != null) {
			List<UUID> groupIdList = new ArrayList<>();
			List<UUID> roleIdList = new ArrayList<>();
			List<YoroGroupsUsers> groups = yoroGroupsUsersRepository.getGroupList(id,
					YorosisContext.get().getTenantId(), YoroappsConstants.YES);
			if (!CollectionUtils.isEmpty(groups)) {
				for (YoroGroupsUsers group : groups) {
					if (group.getYoroGroups() != null
							&& StringUtils.equals(group.getYoroGroups().getManagedFlag(), YoroappsConstants.NO)) {
						groupIdList.add(group.getYoroGroups().getId());
					}
				}
			}

			List<UserAssociateRoles> rolesList = userAssociateRolesRepository.getRolesBasedOnUserId(user.getUserId(),
					YorosisContext.get().getTenantId(), YoroappsConstants.YES);
			if (!CollectionUtils.isEmpty(rolesList)) {
				for (UserAssociateRoles role : rolesList) {
					if (role.getRoles() != null
							&& StringUtils.equals(role.getRoles().getManagedFlag(), YoroappsConstants.NO)) {
						roleIdList.add(role.getRoles().getRoleId());
					}
				}
			}

			return UsersVO.builder().userId(user.getUserId()).emailId(user.getEmailId())
					.contactEmailId(user.getContactEmailId()).firstName(user.getFirstName())
					.lastName(user.getLastName()).userType(user.getUserType()).profilePicture(user.getProfilePicture())
					.userName(user.getUserName()).mobileNumber(user.getMobileNumber()).groupId(groupIdList)
					.roleId(roleIdList).isTwoFactor(user.getIsTwoFactor()).build();
		}
		return UsersVO.builder().build();
	}

	protected Pageable getPageable(PaginationVO vo, boolean hasFilter) {
		Sort sort = null;
		int pageSize = 10;
		if (vo.getSize() > 0) {
			pageSize = vo.getSize();
		}
		if (!StringUtils.isEmpty(vo.getColumnName())) {
			if (StringUtils.equals(vo.getDirection(), "desc")) {
				sort = Sort.by(new Sort.Order(Direction.DESC, vo.getColumnName()));
			} else {
				sort = Sort.by(new Sort.Order(Direction.ASC, vo.getColumnName()));
			}
		}
		if (hasFilter && sort != null) {
			return PageRequest.of(0, 100000, sort);
		} else if (hasFilter) {
			return PageRequest.of(0, 100000);
		}

		if (sort != null) {
			return PageRequest.of(vo.getIndex(), pageSize, sort);
		}
		return PageRequest.of(vo.getIndex(), pageSize);
	}

	@Transactional
	public TableData getAllUsersWithPagination(PaginationVO vo) throws IOException {
		Pageable pageable = null;
		UsersVO usersVo = getLoggedInUserDetails();
		if (vo.getFilterValue().length != 0 || BooleanUtils.isTrue(vo.getIsNoRoles())
				|| BooleanUtils.isTrue(vo.getIsUnAssigned())) {
			pageable = getPageable(vo, true);
			List<Users> allUsersWithPagination = userRepository.getAllUsersWithPagination(usersVo.getUserId(),
					YorosisContext.get().getTenantId(), pageable);
			List<String> authTypeList = new ArrayList<>();
			List<String> roleIdList = new ArrayList<>();
			List<String> groupIdList = new ArrayList<>();
			List<String> twoFAList = new ArrayList<>();
			List<String> activeList = new ArrayList<>();
			for (FilterValueVO fValue : vo.getFilterValue()) {
				if (StringUtils.equals(fValue.getFilterIdColumn(), AUTH_TYPE)) {
					authTypeList.add(fValue.getFilterIdColumnValue());
				}

				if (StringUtils.equals(fValue.getFilterIdColumn(), ROLES)) {
					roleIdList.add(fValue.getFilterIdColumnValue());
				}

				if (StringUtils.equals(fValue.getFilterIdColumn(), GROUPS)) {
					groupIdList.add(fValue.getFilterIdColumnValue());
				}

				if (StringUtils.equals(fValue.getFilterIdColumn(), TWO_FA)) {
					twoFAList.add(fValue.getFilterIdColumnValue());
				}

				if (StringUtils.equals(fValue.getFilterIdColumn(), ACTIVE_FLAG)) {
					activeList.add(fValue.getFilterIdColumnValue());
				}
			}
			if (!authTypeList.isEmpty()) {
				if (authTypeList.contains("Yoroflow")) {
					allUsersWithPagination = allUsersWithPagination.stream().filter(
							f -> (authTypeList.contains(f.getAuthType())) || StringUtils.isEmpty(f.getAuthType()))
							.collect(Collectors.toList());
				} else {
					allUsersWithPagination = allUsersWithPagination.stream()
							.filter(f -> (authTypeList.contains(f.getAuthType()))).collect(Collectors.toList());
				}
			}

			if (!twoFAList.isEmpty()) {
				if (twoFAList.contains("N")) {
					allUsersWithPagination = allUsersWithPagination.stream().filter(
							f -> (twoFAList.contains(f.getIsTwoFactor())) || StringUtils.isEmpty(f.getIsTwoFactor()))
							.collect(Collectors.toList());
				} else {
					allUsersWithPagination = allUsersWithPagination.stream()
							.filter(f -> (twoFAList.contains(f.getIsTwoFactor()))).collect(Collectors.toList());
				}

			}

			if (!activeList.isEmpty()) {
				if (activeList.contains("N")) {
					allUsersWithPagination = allUsersWithPagination.stream().filter(
							f -> (activeList.contains(f.getActiveFlag())) || StringUtils.isEmpty(f.getActiveFlag()))
							.collect(Collectors.toList());
				} else {
					allUsersWithPagination = allUsersWithPagination.stream()
							.filter(f -> (activeList.contains(f.getActiveFlag()))).collect(Collectors.toList());
				}
			}

			if (!roleIdList.isEmpty() || BooleanUtils.isTrue(vo.getIsNoRoles())) {
				allUsersWithPagination = allUsersWithPagination.stream()
						.filter(f -> checkRole(f, vo.getIsNoRoles(), roleIdList)).collect(Collectors.toList());
			}

			if (!groupIdList.isEmpty() || BooleanUtils.isTrue(vo.getIsUnAssigned())) {
				allUsersWithPagination = allUsersWithPagination.stream()
						.filter(f -> checkGroup(f, vo.getIsUnAssigned(), groupIdList)).collect(Collectors.toList());
			}

			return getUsersWithFilter(vo, allUsersWithPagination);
		} else {
			pageable = getPageable(vo, false);
			List<Users> allUsersWithPagination = userRepository.getAllUsersWithPagination(usersVo.getUserId(),
					YorosisContext.get().getTenantId(), pageable);
			int count = 0;
			count = userRepository.getAllUsersCount(usersVo.getUserId(), YorosisContext.get().getTenantId());
			List<UsersVO> userVoList = allUsersWithPagination.stream().map(t -> {
				try {
					return constructDTOToVO(t);
				} catch (IOException e) {
					log.info("List is empty");
				}
				return null;
			}).collect(Collectors.toList());
			return TableData.builder().userVoList(userVoList).totalRecords(String.valueOf(count)).build();
		}
	}

	private boolean checkRole(Users user, boolean isNoRoles, List<String> roleIdList) {
		if (BooleanUtils.isFalse(isNoRoles)) {
			return !user.getUserAssociateRoles().stream()
					.filter(f -> StringUtils.equals(f.getActiveFlag(), YorosisConstants.YES)
							&& roleIdList.contains(f.getRoles().getRoleId().toString()))
					.collect(Collectors.toList()).isEmpty();
		}

		return (user.getUserAssociateRoles() == null || user.getUserAssociateRoles().isEmpty())
				|| !user.getUserAssociateRoles().stream()
						.filter(f -> StringUtils.equals(f.getActiveFlag(), YorosisConstants.YES)
								&& roleIdList.contains(f.getRoles().getRoleId().toString()))
						.collect(Collectors.toList()).isEmpty();
	}

	private boolean checkGroup(Users user, boolean isUnAssigned, List<String> groupIdList) {
		if (BooleanUtils.isFalse(isUnAssigned)) {
			return !user.getUserGroups().stream()
					.filter(f -> StringUtils.equals(f.getActiveFlag(), YorosisConstants.YES)
							&& groupIdList.contains(f.getYoroGroups().getId().toString()))
					.collect(Collectors.toList()).isEmpty();
		}

		return ((BooleanUtils.isTrue(isUnAssigned) && !user.getUserGroups().isEmpty()
				&& user.getUserGroups().size() == 1
				&& StringUtils.equals(user.getUserGroups().get(0).getYoroGroups().getManagedFlag(),
						YoroappsConstants.YES)))
				|| (user.getUserGroups() == null || user.getUserGroups().isEmpty())
				|| !user.getUserGroups().stream()
						.filter(f -> StringUtils.equals(f.getYoroGroups().getActiveFlag(), YorosisConstants.YES)
								&& groupIdList.contains(f.getYoroGroups().getId().toString()))
						.collect(Collectors.toList()).isEmpty();
	}

	@Transactional
	public ResponseStringVO enableTwoFactorAuth(EnableTwoFactorVO enableTwoFactorVO) throws IOException {
		UsersVO usersVo = getLoggedInUserDetails();
		if (BooleanUtils.isTrue(enableTwoFactorVO.getIsEnableAll())) {
			List<Users> allUsersWithoutAdminRoles = userRepository.getAllUsersWithoutAdminRoles(usersVo.getUserId(),
					YorosisContext.get().getTenantId(), YoroappsConstants.YES);
			allUsersWithoutAdminRoles.stream().forEach(t -> t.setIsTwoFactor(YoroappsConstants.YES));
			userRepository.saveAll(allUsersWithoutAdminRoles);
			return ResponseStringVO.builder().response("Two factor enabled for all users").build();
		} else {
			for (UUID id : enableTwoFactorVO.getUserIdList()) {
				Users user = userRepository.findByUserIdAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(id,
						YoroappsConstants.YES, YorosisContext.get().getTenantId());
				if (user != null) {
					user.setIsTwoFactor(YoroappsConstants.YES);
					userRepository.save(user);
				}
			}
			return ResponseStringVO.builder().response("Two factor enabled").build();
		}
	}

	@Transactional
	public ResponseStringVO inActivateAllUsers(EnableTwoFactorVO enableTwoFactorVO) {
		if (enableTwoFactorVO != null && enableTwoFactorVO.getUserIdList() != null
				&& enableTwoFactorVO.getUserIdList().isEmpty()) {
			for (UUID id : enableTwoFactorVO.getUserIdList()) {
				Users user = userRepository.findByUserIdAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(id,
						YoroappsConstants.YES, YorosisContext.get().getTenantId());
				if (user != null) {
					user.setActiveFlag(YoroappsConstants.NO);
					userRepository.save(user);
				}
				workflowClientService.saveInactiveUsers(YorosisContext.get().getToken(),
						ReactiveOrInactiveUsers.builder().userIdList(enableTwoFactorVO.getUserIdList()).build());
			}
		}
		return ResponseStringVO.builder().response("Selected users got deactivated successfully").build();
	}

	@Transactional
	public ResponseStringVO resetTwoFactor(UUID userId) {
		Users user = userRepository.findByUserIdAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(userId,
				YoroappsConstants.YES, YorosisContext.get().getTenantId());
		if (user.getOtpSecret() != null && user.getOtpProvider() != null) {
			user.setOtpSecret(null);
			user.setOtpProvider(null);
			userRepository.save(user);
			List<UserOTPRecoveryCodes> userOTPRecoveryCodesList = userOTPRecoveryCodesRepository
					.findByUserIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(userId,
							YorosisContext.get().getTenantId(), YoroappsConstants.YES);
			if (userOTPRecoveryCodesList != null && !userOTPRecoveryCodesList.isEmpty()) {
				userOTPRecoveryCodesRepository.deleteAll(userOTPRecoveryCodesList);
			}
			return ResponseStringVO.builder().response("Two Factor has been reset successfully").build();
		}
		return ResponseStringVO.builder().response("User haven't configured yet").build();
	}

	@Transactional
	public ResponseStringVO removeTwoFactor(UUID userId) {
		Users user = userRepository.findByUserIdAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(userId,
				YoroappsConstants.YES, YorosisContext.get().getTenantId());
		if (user != null && StringUtils.equals(user.getIsTwoFactor(), YorosisConstants.YES)) {
			user.setIsTwoFactor(YorosisConstants.NO);
			user.setOtpSecret(null);
			user.setOtpProvider(null);
			userRepository.save(user);
			List<UserOTPRecoveryCodes> userOTPRecoveryCodesList = userOTPRecoveryCodesRepository
					.findByUserIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(userId,
							YorosisContext.get().getTenantId(), YoroappsConstants.YES);
			if (userOTPRecoveryCodesList != null && !userOTPRecoveryCodesList.isEmpty()) {
				userOTPRecoveryCodesRepository.deleteAll(userOTPRecoveryCodesList);
			}
			return ResponseStringVO.builder().response("Two Factor has been removed successfully").build();
		}
		return ResponseStringVO.builder().response("User haven't added two factor yet").build();
	}

	@Transactional
	public ResponseStringVO saveChanges(UsersVO usersVO) {
		Users user = userRepository.findByUserIdAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(usersVO.getUserId(),
				YoroappsConstants.YES, YorosisContext.get().getTenantId());
		if (user != null) {
			deleteRolesAndGroup(user, usersVO.getRemovedGroupIdList(), usersVO.getRemovedRolesIdList());
			saveAssociateUserToSecurityGroup(usersVO, user);
			userRoleService.saveAssociateUserToRoles(usersVO, user);
			user.setContactEmailId(usersVO.getContactEmailId());
			userRepository.save(user);
			return ResponseStringVO.builder().response("Saved Changes Successfully").build();
		}
		return ResponseStringVO.builder().response("Invalid User").build();
	}

	private void deleteRolesAndGroup(Users user, List<UUID> removedGroupIdList, List<UUID> removedRolesIdList) {
		for (UUID id : removedGroupIdList) {
			YoroGroupsUsers yoroGroupsUsers = yoroGroupsUsersRepository.findByUserIdandGroupId(id, user.getUserId(),
					YorosisContext.get().getTenantId(), YoroappsConstants.YES);
			yoroGroupsUsers.setActiveFlag(YoroappsConstants.NO);
			yoroGroupsUsersRepository.save(yoroGroupsUsers);
		}

		for (UUID id : removedRolesIdList) {
			UserAssociateRoles rolesBasedOnUserIdAndRole = userAssociateRolesRepository.getRolesBasedOnUserIdAndRole(
					user.getUserId(), id, YorosisContext.get().getTenantId(), YoroappsConstants.YES);
			rolesBasedOnUserIdAndRole.setActiveFlag(YoroappsConstants.NO);
			userAssociateRolesRepository.save(rolesBasedOnUserIdAndRole);
		}

	}

	private TableData getUsersWithFilter(PaginationVO pagination, List<Users> users) throws IOException {
		List<UsersVO> list = new ArrayList<>();

		int pageNumber = pagination.getIndex();
		int pageSize = pagination.getSize() > 0 ? pagination.getSize() : 10;
		int skipRecords = pageNumber * pageSize;

		int matchCount = 0;
		for (Users user : users) {
			if (doesMatchesFilterValue(user, pagination.getFilterValue())) {
				matchCount++;
				if (matchCount > skipRecords && matchCount <= (skipRecords + pageSize)) {
					list.add(constructDTOToVO(user));
				}
			}
		}

		return TableData.builder().userVoList(list).totalRecords(String.valueOf(matchCount)).build();
	}

	private boolean doesMatchesFilterValue(Users users, FilterValueVO[] currentFilterList) {
		boolean isMatched = true;
		for (FilterValueVO filterValue : currentFilterList) {
			if (!StringUtils.isEmpty(filterValue.getFilterIdColumn())) {

				if (StringUtils.equalsAny(filterValue.getFilterIdColumn(), LOGIN_EMAIL, FIRST_NAME, LAST_NAME,
						CONTACT_EMAIL_ID)) {
					String value = null;
					if (StringUtils.equals(filterValue.getFilterIdColumn(), LOGIN_EMAIL)) {
						value = users.getUserName();
					}
					if (StringUtils.equals(filterValue.getFilterIdColumn(), FIRST_NAME)) {
						value = users.getFirstName();
					}
					if (StringUtils.equals(filterValue.getFilterIdColumn(), LAST_NAME)) {
						value = users.getLastName();
					}
					if (StringUtils.equals(filterValue.getFilterIdColumn(), CONTACT_EMAIL_ID)) {
						value = users.getContactEmailId();
					}

					isMatched = FilterUtils.getValue(value, filterValue, isMatched);
				} else if (StringUtils.equalsAny(filterValue.getFilterIdColumn(), LAST_LOGGEDIN_TIMESTAMP)) {
					LocalDateTime dateValue = null;
					DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
					if (users.getLastLogin() != null
							&& StringUtils.equals(filterValue.getFilterIdColumn(), LAST_LOGGEDIN_TIMESTAMP)) {

						dateValue = users.getLastLogin().toLocalDateTime();
						dateValue = LocalDateTime.parse(dateValue.toString().subSequence(0, 19), formatter);
						if (dateValue != null) {
							isMatched = FilterUtils.getDateValue(dateValue.toLocalDate(), filterValue, isMatched);
						}
					} else {
						isMatched = false;
					}
				}

			}
		}

		return isMatched;
	}

	public ResponseStringVO getAllUsersCreatedByCustomer() {
		int usersCount = userRepository.getAllUsersCountByCustomer(YorosisContext.get().getTenantId(),
				YoroappsConstants.YES);
		return ResponseStringVO.builder().count(usersCount).build();
	}

	@Transactional
	public List<UsersVO> getAllUsers() throws IOException {
		UsersVO usersVo = getLoggedInUserDetails();
		List<Users> allUsers = userRepository.getAllUsers(usersVo.getUserId(), YorosisContext.get().getTenantId(),
				YoroappsConstants.YES);
		List<UsersVO> usersList = new ArrayList<>();
		for (Users user : allUsers) {
			usersList.add(UsersVO.builder().userId(user.getUserId()).firstName(user.getFirstName())
					.lastName(user.getLastName()).userName(user.getUserName()).emailId(user.getEmailId())
					.color(user.getColor()).build());
		}
		return usersList;
	}

	@Transactional
	public ResponseStringVO inactivateUsers(SubscriptionExpireVO subscriptionExpireVO) throws IOException {
		String response = null;
		UsersVO usersVo = getLoggedInUserDetails();
		List<Users> allUsers = userRepository.getAllUsers(usersVo.getUserId(), YorosisContext.get().getTenantId(),
				YoroappsConstants.YES);
		if (allUsers.size() > 2) {
			if (BooleanUtils.isTrue(subscriptionExpireVO.getIsRandomUser())) {
				List<UUID> uuidList = new ArrayList<>();
				List<Users> subList = allUsers.subList(allUsers.size() - 2, allUsers.size());
				subList.stream().forEach(t -> uuidList.add(t.getUserId()));
				List<Users> list = userRepository.getAllUsersForInactivate(uuidList, YorosisContext.get().getTenantId(),
						YoroappsConstants.YES);
				list.stream().forEach(t -> t.setActiveFlag(YoroappsConstants.NO));
				userRepository.saveAll(list);
				response = "Removed random users";
			} else {
				List<Users> pickedUsers = userRepository.getAllUsersForInactivate(subscriptionExpireVO.getUsersIdList(),
						YorosisContext.get().getTenantId(), YoroappsConstants.YES);
				pickedUsers.stream().forEach(t -> t.setActiveFlag(YoroappsConstants.NO));
				userRepository.saveAll(pickedUsers);
				response = "Removed picked users";
			}
		}
		return ResponseStringVO.builder().response(response).build();
	}

}
