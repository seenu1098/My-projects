package com.yorosis.yoroflow.creation.controller;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import javax.mail.MessagingException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yorosis.yoroapps.grid.vo.PaginationVO;
import com.yorosis.yoroapps.vo.ChangePasswordVO;
import com.yorosis.yoroapps.vo.LicenseVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.ServiceTokenVO;
import com.yorosis.yoroapps.vo.SubscriptionExpireVO;
import com.yorosis.yoroapps.vo.UsersVO;
import com.yorosis.yoroflow.creation.exception.YoroappsException;
import com.yorosis.yoroflow.creation.service.ServiceTokenHandlerService;
import com.yorosis.yoroflow.creation.service.UserService;
import com.yorosis.yoroflow.creation.table.vo.EnableTwoFactorVO;
import com.yorosis.yoroflow.creation.table.vo.TableData;

@RestController
@RequestMapping("/user-service/v1")
public class UserController {

	@Autowired
	private UserService userService;

	@Autowired
	private ServiceTokenHandlerService serviceTokenHandlerService;

	private final ObjectMapper mapper = new ObjectMapper();

	@PostMapping("/save/user-profile")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO saveUserProfile(@RequestParam("userDetails") String userDetails,
			@RequestParam(value = "file", required = false) MultipartFile file) throws IOException {
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		UsersVO usersVO = mapper.readValue(userDetails, UsersVO.class);
		return userService.saveUserProfile(usersVO, file);
	}

	@GetMapping("/license/is-allowed")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public LicenseVO isAllowed() throws IOException {
		return userService.isAllowed();
	}

	@PostMapping("/associate/group")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO associateUserGroup(@RequestBody UsersVO usersVO) throws IOException {
		return userService.saveNewUsersWithBaseGroup(usersVO);
	}

	@PostMapping("/change/password")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO changePassword(@RequestBody ChangePasswordVO user) throws YoroappsException, IOException {
		return userService.updatePassword(user);
	}

	@GetMapping("/get/logged-in/user-details")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public UsersVO getUserDetails() throws IOException {
		return userService.getLoggedInUserDetails();
	}

	@PostMapping("/get/user-details")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public UsersVO getUserDetailsForGivenUser(@RequestBody UsersVO userVo) throws IOException {
		return userService.getUserDetails(userVo.getUserName());
	}

	@PostMapping("/save/user-management")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO save(@RequestBody UsersVO user) throws MessagingException, YoroappsException, IOException {
		return userService.save(user);
	}

	@PostMapping("/update/user-management")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO update(@RequestBody UsersVO user) {
		return userService.update(user);
	}

	@PostMapping("/change/password/user-management")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO updatePassword(@RequestBody UsersVO user) throws IOException {
		return userService.updatePasswordForUserManagement(user);
	}

	@GetMapping("/get/logged-in/user-profile-picture")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public UsersVO getLoggedInUserProfilePicture() throws IOException {
		return userService.getLoggedInUserProfilePicture();
	}

	@GetMapping("/get/apikeys")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public List<ServiceTokenVO> getApiServiceTokens() throws IOException {
		return serviceTokenHandlerService.loadServiceTokensByUserId(userService.getLoggedInUserDetails().getUserId());
	}

	@GetMapping("/get/apikeys/{serviceTokenId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ServiceTokenVO getApiServiceToken(@PathVariable UUID serviceTokenId) throws IOException {
		return serviceTokenHandlerService.loadServiceTokenByServiceTokenIdAndUserId(
				userService.getLoggedInUserDetails().getUserId(), serviceTokenId);
	}

	@GetMapping("/generate/secretkey/apikey/{apiKey}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO generateSecretKey(@PathVariable String apiKey) throws IOException {
		return serviceTokenHandlerService.generateSecretKey(userService.getLoggedInUserDetails().getUserId(), apiKey);
	}

	@PostMapping("/save/apikeys")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ServiceTokenVO saveServiceTokens(@RequestBody ServiceTokenVO serviceTokenVO) throws IOException {
		return serviceTokenHandlerService.saveServiceToken(serviceTokenVO);
	}

	@GetMapping("/delete/apikey/{serviceTokenId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO deleteServiceToken(@PathVariable UUID serviceTokenId) throws IOException {
		return serviceTokenHandlerService.deactivateServiceToken(serviceTokenId);
	}

	@PostMapping("/send/message")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO inviteUsers(@RequestBody UsersVO uservo)
			throws MessagingException, YoroappsException, IOException {
		return userService.inviteOrDeactivetUser(uservo, null);
	}

	@GetMapping("/check/user")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO checkYoroAdminUser() {
		return userService.checkYoroAdmin();
	}

	@GetMapping("/get-user-form/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public UsersVO getUserForm(@PathVariable(name = "id") String id) {
		return userService.getUsersForm(UUID.fromString(id));
	}

	@PostMapping("/get-all-users")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public TableData getAllUsersWithPagination(@RequestBody PaginationVO paginationVO) throws IOException {
		return userService.getAllUsersWithPagination(paginationVO);
	}

	@PostMapping("/save/enable-two-factor")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO enableTwoFactorAuth(@RequestBody EnableTwoFactorVO enableTwoFactorVO) throws IOException {
		return userService.enableTwoFactorAuth(enableTwoFactorVO);
	}

	@PostMapping("/inactivate-all-users")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO inActivateAllUsers(@RequestBody EnableTwoFactorVO enableTwoFactorVO) {
		return userService.inActivateAllUsers(enableTwoFactorVO);
	}

	@GetMapping("/reset/two-factor/{userId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO resetTwoFactor(@PathVariable(name = "userId") UUID userId) {
		return userService.resetTwoFactor(userId);
	}

	@PostMapping("/save-user-changes")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO saveUserChanges(@RequestBody UsersVO usersVO) {
		return userService.saveChanges(usersVO);
	}

	@GetMapping("/remove/two-factor/{userId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO removeTwoFactor(@PathVariable(name = "userId") UUID userId) {
		return userService.removeTwoFactor(userId);
	}

	@GetMapping("/guest-users-count")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public UsersVO getGuestUsersCount() {
		return userService.getUsersCountBasedOnRoles();
	}

	@GetMapping("/get-all-total-users")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public List<UsersVO> getAllUsers() throws IOException {
		return userService.getAllUsers();
	}

	@PostMapping("/inactivate-users")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Billing Administrator'})")
	public ResponseStringVO inactivateUsers(@RequestBody SubscriptionExpireVO subscriptionExpireVO) throws IOException {
		return userService.inactivateUsers(subscriptionExpireVO);
	}

}
