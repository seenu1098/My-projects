package com.yorosis.livetester;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.sql.DataSource;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import com.yorosis.livetester.entities.Roles;
import com.yorosis.livetester.entities.UserRole;
import com.yorosis.livetester.entities.Users;
import com.yorosis.livetester.exception.LicenseException;
import com.yorosis.livetester.exception.YorosisException;
import com.yorosis.livetester.grid.vo.PaginationVO;
import com.yorosis.livetester.grid.vo.TableData;
import com.yorosis.livetester.repo.RoleRepository;
import com.yorosis.livetester.repo.UserRoleRepository;
import com.yorosis.livetester.repo.UsersRepository;
import com.yorosis.livetester.security.YorosisContext;
import com.yorosis.livetester.service.UserService;
import com.yorosis.livetester.vo.ChangePasswordVO;
import com.yorosis.livetester.vo.ResponseVO;
import com.yorosis.livetester.vo.RolesListVO;
import com.yorosis.livetester.vo.UsersVO;

@SpringBootTest
@ActiveProfiles(profiles = { "default", "test" })
public class UserServiceTest extends AbstractBaseTest {

	@Autowired
	private UsersRepository userRepository;

	@Autowired
	private RoleRepository roleRepository;

	@Autowired
	private UserRoleRepository userRoleRepository;

	@Autowired
	private UserService userService;

	@Autowired
	private DataSource datasource;

	private static final String user_Name_For_Save = "test@test.com";
	private static final String userName = "username";
	private static final String password = "password";
	private static final String firstName = "FirstName";
	private static final String lastName = "LastName";
	private static final String newPassword = "newPassword";
	private static final String INVALID_USER = "Invalid email or password.";

	@AfterEach
	public void clearDataUserService() throws SQLException {
		userRepository.deleteAll();
		roleRepository.deleteAll();
		userRoleRepository.deleteAll();
		clearSequences();
	}

	private UsersVO userVOBuilder() {
		List<Integer> roleId = new ArrayList<>();
		roleId.add(1);
		return UsersVO.builder().firstName(firstName).lastName(lastName).password(password).confirmPassword(password).emailId("test@test.com").userName("test@test.com")
				.roleId(roleId).build();
	}

	@Test
	public void testCreateUser() throws YorosisException, LicenseException {

		Roles roles = Roles.builder().roleId(1).roleName("user").roleDesc("user").build();
		roleRepository.save(roles);

		ResponseVO saveUserVo = userService.createUser(userVOBuilder());
		assertEquals("Account Created Successfully", saveUserVo.getResponse());

		assertNotNull(saveUserVo);
		ResponseVO existUserVo = userService.createUser(userVOBuilder());
		assertEquals("Email Id Already Exist", existUserVo.getResponse());

		Users user = userRepository.findByUserName(user_Name_For_Save);
		assertNotNull(user);

		assertEquals(firstName, user.getFirstName());
		assertEquals(lastName, user.getLastName());
		assertTrue(user.getUserId() > 0);

		UsersVO emptyUserName = UsersVO.builder().password("").emailId("yorotorosis.in").build();
		UsersVO emptyPassword = UsersVO.builder().password("123qwe").emailId("").build();

		YorosisException userException = Assertions.assertThrows(YorosisException.class, () -> {
			userService.createUser(emptyUserName);
		});
		Assertions.assertEquals(INVALID_USER, userException.getMessage());

		YorosisException passwordException = Assertions.assertThrows(YorosisException.class, () -> {
			userService.createUser(emptyPassword);
		});
		Assertions.assertEquals(INVALID_USER, passwordException.getMessage());

	}

	@Test
	public void testLoadUserByUsername() throws YorosisException {

		Set<UserRole> emptSet = new HashSet<>();
		Set<UserRole> nullSet = null;

		Users users = Users.builder().userName(userName).userPassword(password).emailId("test@test.com").userRole(emptSet).build();
		userRepository.save(users);

		UserDetails userDetails = userService.loadUserByUsername(userName);
		Assertions.assertNotNull(userDetails);

		Users withoutRoleUsers = Users.builder().userName("demo").userPassword("demo").emailId("test@test1.com").userRole(nullSet).build();
		userRepository.save(withoutRoleUsers);

		UserDetails withoutRoleUsersDetails = userService.loadUserByUsername("demo");
		Assertions.assertNotNull(withoutRoleUsersDetails);

		Assertions.assertNotNull(userRepository.getOne(1));

		Set<UserRole> set = new HashSet<>();

		Roles roles = Roles.builder().roleId(1).roleName("user").roleDesc("user").build();
		roleRepository.save(roles);

		UserRole userRole = UserRole.builder().userRoleId(1).roles(roles).users(users).build();
		userRoleRepository.save(userRole);
		set.add(userRole);

		Users userWithRole = Users.builder().userId(1).userName("role").userPassword("role").emailId("role").userRole(set).build();
		userRepository.save(userWithRole);

		UserDetails userRoleDetails = userService.loadUserByUsername("role");
		Assertions.assertNotNull(userRoleDetails);

		Users userInvalid = userRepository.findByUserName("Srini");
		Assertions.assertNull(userInvalid);

		UsernameNotFoundException userException = Assertions.assertThrows(UsernameNotFoundException.class, () -> {
			userService.loadUserByUsername("Srini");
		});
		Assertions.assertEquals(INVALID_USER, userException.getMessage());

	}

	@Test
	public void testUpdateRolesAndGlobalSpecificationForUserManagement() {

		Roles roles = Roles.builder().roleId(1).roleName("user").roleDesc("user").build();
		roleRepository.save(roles);

		BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

		Users users = Users.builder().userName("test@test2.com").userName("test@test2.com").userPassword(encoder.encode(password)).emailId("test@test2.com").build();
		userRepository.save(users);

		List<Integer> roleId = new ArrayList<>();
		roleId.add(1);

		UsersVO vo = UsersVO.builder().userId(1).emailId("test@test2.com").roleId(roleId).password(newPassword).build();

		YorosisContext.set(YorosisContext.builder().userName("test@test2.com").build());
		ResponseVO updateUser = userService.updateRolesAndGlobalSpecificationForUserManagement(vo);
		assertEquals("Roles/Global Specification Updated Successfully", updateUser.getResponse());

	}

	@Test
	public void testUpdatePasswordForUserManagement() throws YorosisException {

		Roles roles = Roles.builder().roleId(1).roleName("user").roleDesc("user").build();
		roleRepository.save(roles);

		BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

		Users users = Users.builder().userName("test@test2.com").userName("test@test2.com").userPassword(encoder.encode(password)).emailId("test@test2.com").build();
		userRepository.save(users);

		List<Integer> roleId = new ArrayList<>();
		roleId.add(1);

		UsersVO vo = UsersVO.builder().userId(1).emailId("test@test2.com").roleId(roleId).password(newPassword).build();

		YorosisContext.set(YorosisContext.builder().userName("test@test2.com").build());
		ResponseVO updateUser = userService.updatePasswordForUserManagement(vo);
		assertEquals("Password Updated Successfully", updateUser.getResponse());

		UsersVO vo1 = UsersVO.builder().userId(1).emailId("test@test2.com").roleId(roleId).password("").build();

		YorosisException userException = Assertions.assertThrows(YorosisException.class, () -> {
			userService.updatePasswordForUserManagement(vo1);
		});
		Assertions.assertEquals("Invalid Password", userException.getMessage());

	}

	@Test
	public void testUpdatePassword() throws YorosisException {
		BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

		Users users = Users.builder().userName("test").userPassword(encoder.encode(password)).emailId("test@test2.com").build();
		userRepository.save(users);

		Users user = userRepository.findByUserName("test");
		assertNotNull(user);

		ChangePasswordVO vo = ChangePasswordVO.builder().oldPasssword(password).newPassword(newPassword).confirmNewPassword(newPassword).build();
		assertEquals(vo.getNewPassword(), vo.getConfirmNewPassword());

		String result = encoder.encode(password);
		assertThat(encoder.matches(vo.getOldPasssword(), result)).isTrue();

		user.setUserPassword(newPassword);

		ChangePasswordVO incorrectVO = ChangePasswordVO.builder().oldPasssword("1qwe").newPassword(newPassword).confirmNewPassword(newPassword).build();

		try {
			YorosisContext.set(YorosisContext.builder().userName("test").build());
			ResponseVO saveUser = userService.updatePassword(vo);
			assertEquals("Password Updated Successfully", saveUser.getResponse());

			ResponseVO saveIncorrectUser = userService.updatePassword(incorrectVO);
			assertEquals("Old Password does not match", saveIncorrectUser.getResponse());

			ChangePasswordVO vo1 = ChangePasswordVO.builder().oldPasssword(newPassword).newPassword(password).confirmNewPassword(newPassword).build();
			YorosisException userException = Assertions.assertThrows(YorosisException.class, () -> {
				userService.updatePassword(vo1);
			});
			Assertions.assertEquals("New Password and Confirm Password does not match", userException.getMessage());
		} finally {
			YorosisContext.clear();
		}
	}

	private PaginationVO getPaginationVOObject(String gridId) {
		return PaginationVO.builder().gridId(gridId).columnName("firstName").index(0).direction("asc").build();
	}

	@Test
	public void testGetGridData() throws YorosisException, IOException {

		Set<UserRole> nullSet = null;

		Roles roles = Roles.builder().roleId(1).roleName("user").roleDesc("user").build();
		roleRepository.save(roles);

		Users withoutRoleUsers = Users.builder().userName("demo").userPassword("demo").emailId("test@test1.com").userRole(nullSet).build();
		userRepository.save(withoutRoleUsers);

		Set<UserRole> set = new HashSet<>();

		UserRole userRole = UserRole.builder().userRoleId(1).roles(roles).users(withoutRoleUsers).build();
		userRoleRepository.save(userRole);
		set.add(userRole);

		Users userWithRole = Users.builder().userId(1).userName("role").userPassword("role").emailId("role").userRole(set).build();
		userRepository.save(userWithRole);

		TableData usersTabledata = userService.getGridData(getPaginationVOObject("user"));
		assertNotNull(usersTabledata);

		YorosisException invalidTableDataException = Assertions.assertThrows(YorosisException.class, () -> {
			userService.getGridData(getPaginationVOObject("test"));
		});
		Assertions.assertEquals("Invalid Grid Id", invalidTableDataException.getMessage());

	}

	@Test
	public void testGetUserForm() {

		Set<UserRole> nullSet = null;

		Roles roles = Roles.builder().roleId(1).roleName("user").roleDesc("user").build();
		roleRepository.save(roles);

		Users withoutRoleUsers = Users.builder().userName("demo").userPassword("demo").emailId("test@test1.com").userRole(nullSet).build();
		userRepository.save(withoutRoleUsers);

		Set<UserRole> set = new HashSet<>();

		UserRole userRole = UserRole.builder().userRoleId(1).roles(roles).users(withoutRoleUsers).build();
		userRoleRepository.save(userRole);
		set.add(userRole);

		Users userWithRole = Users.builder().userId(1).userName("role").userPassword("role").emailId("role").userRole(set).build();
		userRepository.save(userWithRole);

		UsersVO vo = userService.getUsersForm(1);
		assertNotNull(vo);

	}

	@Test
	public void testGetRolesNamesList() {
		Roles roles = Roles.builder().roleId(1).roleName("user").roleDesc("user").build();
		roleRepository.save(roles);

		List<RolesListVO> list = userService.getRolesNameList();
		assertNotNull(list);
		assertEquals(1, list.size());
	}

	@Override
	protected DataSource getDatasource() {
		return datasource;
	}
}
