package com.yorosis.livetester.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.livetester.exception.LicenseException;
import com.yorosis.livetester.exception.YorosisException;
import com.yorosis.livetester.service.AuthenticationService;
import com.yorosis.livetester.service.UserService;
import com.yorosis.livetester.vo.AuthToken;
import com.yorosis.livetester.vo.ChangePasswordVO;
import com.yorosis.livetester.vo.ResponseVO;
import com.yorosis.livetester.vo.RolesListVO;
import com.yorosis.livetester.vo.SigninUserVO;
import com.yorosis.livetester.vo.UsersVO;

@RestController
@CrossOrigin
@RequestMapping("/user-service/v1")
public class UserController {

	@Autowired
	private UserService userService;

	@Autowired
	private AuthenticationService authService;

	@PostMapping("/create/user")
	public ResponseVO save(@RequestBody UsersVO user) throws YorosisException, LicenseException {
		return userService.createUser(user);
	}

	@PostMapping("/authenticate")
	public ResponseEntity<AuthToken> login(@RequestBody SigninUserVO userVo) throws LicenseException {
		userVo.setUsername(userVo.getUsername().trim().toLowerCase());
		return ResponseEntity.ok(authService.authenticateUser(userVo));
	}

	@PostMapping("/change/password")
	public ResponseVO changePassword(@RequestBody ChangePasswordVO user) throws YorosisException {
		return userService.updatePassword(user);
	}

	@GetMapping("/get/logged-in/user-details")
	public UsersVO getUserDetails() {
		return userService.getLoggedInUserDetails();
	}

	@GetMapping("/get-user-form/{id}")
	public UsersVO getUserForm(@PathVariable(name = "id") int id) {
		return userService.getUsersForm(id);
	}

	@GetMapping("/get-role-name-list")
	public List<RolesListVO> getRolesNames() {
		return userService.getRolesNameList();
	}

	@PostMapping("/change/password/user-management")
	public ResponseVO updatePassword(@RequestBody UsersVO user) throws YorosisException {
		return userService.updatePasswordForUserManagement(user);
	}

	@PostMapping("/update/user-management")
	public ResponseVO updateRolesAndGlobalSpecification(@RequestBody UsersVO user) {
		return userService.updateRolesAndGlobalSpecificationForUserManagement(user);
	}

	@GetMapping("/role")
	public int getRole() {
		return userService.getRole();
	}

}
