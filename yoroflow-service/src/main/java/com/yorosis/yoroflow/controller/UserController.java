package com.yorosis.yoroflow.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroflow.models.AuthToken;
import com.yorosis.yoroflow.models.ChangePasswordVO;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.models.RolesListVO;
import com.yorosis.yoroflow.models.SigninUserVO;
import com.yorosis.yoroflow.models.UsersVO;
import com.yorosis.yoroflow.models.YoroFlowException;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;
import com.yorosis.yoroflow.services.AuthenticationService;
import com.yorosis.yoroflow.services.DomainService;
import com.yorosis.yoroflow.services.UserService;

@RestController
@RequestMapping("/user-service/v1")
public class UserController {

	@Autowired
	private UserService userService;

	@Autowired
	private AuthenticationService authService;

	@Autowired
	private DomainService domainService;

	@PostMapping("/authenticate")
	public ResponseEntity<AuthToken> login(@RequestBody SigninUserVO userVo) throws YoroFlowException {
		try {
			String tenantId = domainService.getAssignedTenantId(userVo.getUsername());
			YorosisContext context = YorosisContext.builder().tenantId(tenantId).userName(userVo.getUsername()).build();
			YorosisContext.set(context);
			userVo.setUsername(userVo.getUsername().trim().toLowerCase());
			return ResponseEntity.ok(authService.authenticateUser(userVo));
		} finally {
			YorosisContext.clear();
		}
	}

	@GetMapping("/get/logged-in/user-details")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public UsersVO getUserDetails() {
		return userService.getLoggedInUserDetails();
	}

	@PostMapping("/save")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO saveAndUpdate(@RequestBody UsersVO userVO) {
		return userService.createAndUpdateUsers(userVO);
	}

	@GetMapping("/get/users")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public List<UsersVO> getUsersList() {
		return userService.getUsersList();
	}

	@GetMapping("/get/message-history/users")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public List<UsersVO> getMessageHistoryUsersList() {
		return userService.getMessageHistoryUsers();
	}

	@GetMapping("/get/user-names/{userName}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public List<UsersVO> getUserNames(@PathVariable(name = "userName") String userName) {
		return userService.getUserName(userName);
	}

	@GetMapping("/get-role-name-list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public List<RolesListVO> getRolesNames() {
		return userService.getRolesNameList();
	}

	@PostMapping("/save/user-management")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO save(@RequestBody UsersVO user) {
		return userService.save(user);
	}

	@GetMapping("/get/list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public List<UsersVO> getUserList() {
		return userService.getAllUsers();
	}

	@GetMapping("/get-user-form/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public UsersVO getUserForm(@PathVariable(name = "id") String id) {
		return userService.getUsersForm(UUID.fromString(id));
	}

	@PostMapping("/change/password/user-management")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO updatePassword(@RequestBody UsersVO user) {
		return userService.updatePasswordForUserManagement(user);
	}

	@PostMapping("/change/password")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO changePassword(@RequestBody ChangePasswordVO user) throws YoroFlowException {
		return userService.updatePassword(user);
	}

	@GetMapping("/get/user-details/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public UsersVO getUserDetailsById(@PathVariable("id") String id) throws YoroFlowException {
		return userService.getUserDetailsById(UUID.fromString(id));
	}
}
