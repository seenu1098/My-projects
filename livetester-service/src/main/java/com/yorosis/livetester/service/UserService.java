package com.yorosis.livetester.service;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.PostConstruct;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.livetester.entities.Roles;
import com.yorosis.livetester.entities.UserRole;
import com.yorosis.livetester.entities.Users;
import com.yorosis.livetester.exception.LicenseException;
import com.yorosis.livetester.exception.YorosisException;
import com.yorosis.livetester.grid.services.AbstractGridDataService;
import com.yorosis.livetester.grid.vo.PaginationVO;
import com.yorosis.livetester.grid.vo.TableData;
import com.yorosis.livetester.repo.RoleRepository;
import com.yorosis.livetester.repo.UserRoleRepository;
import com.yorosis.livetester.repo.UsersRepository;
import com.yorosis.livetester.security.YorosisContext;
import com.yorosis.livetester.vo.ChangePasswordVO;
import com.yorosis.livetester.vo.ResponseVO;
import com.yorosis.livetester.vo.RolesListVO;
import com.yorosis.livetester.vo.UsersVO;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service(value = "userService")
public class UserService extends AbstractGridDataService implements UserDetailsService {

	private static final String ADMIN_EMAIL = "admin@va-test.com";
	private static final String SYSTEM = "system";
	private static final String ADMIN = "admin";
	private static final String INVALID_USER = "Invalid email or password.";

	@Autowired
	private UsersRepository userRepository;

	@Autowired
	private UserRoleRepository userRoleRepository;

	@Autowired
	private RoleRepository roleRepository;

	@Autowired
	private BCryptPasswordEncoder bcryptEncoder;

	@Autowired
	private LicenseValidationService licenseValidationService;

	@PostConstruct
	private void initializeTheFirstUser() {
		long count = userRepository.count();
		if (count > 0) {
			// user exists
		} else {
			log.info("Initialize the initial user/role, etc");
			
			Timestamp date = new Timestamp(System.currentTimeMillis());
			Roles adminRole = Roles.builder().roleDesc("admininstrator").roleName(ADMIN).updatedBy(SYSTEM).createdBy(SYSTEM).updatedDate(date).createdDate(date)
					.build();
			adminRole = roleRepository.save(adminRole);

			Roles userRole = Roles.builder().roleDesc("User").roleName("user").updatedBy(SYSTEM).createdBy(SYSTEM).updatedDate(date).createdDate(date).build();
			roleRepository.save(userRole);

			String pwd = new String(Base64.getDecoder().decode("VDlQTCojXjJXNWdSX2M0dQ=="));
			Users adminUser = Users.builder().emailId(ADMIN_EMAIL).firstName("Admin").lastName("VA").userPassword(bcryptEncoder.encode(pwd))
					.userName(ADMIN_EMAIL).globalSpecification("Y").build();
			adminUser = userRepository.save(adminUser);

			UserRole adminUserRole = UserRole.builder().roles(adminRole).users(adminUser).updatedBy(SYSTEM).createdBy(SYSTEM).updatedDate(date)
					.createdDate(date).build();
			userRoleRepository.save(adminUserRole);
		}
	}

	private UsersVO constructDTOtoVO(Users user) {
		return UsersVO.builder().userId(user.getUserId()).firstName(user.getFirstName()).lastName(user.getLastName()).userName(user.getUserName())
				.emailId(user.getEmailId()).globalSpecification(user.getGlobalSpecification()).build();
	}

	private Users constructVOtoDTO(UsersVO uservo) {
		String hashedPassword = bcryptEncoder.encode(uservo.getPassword());
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());

		return Users.builder().firstName(uservo.getFirstName()).lastName(uservo.getLastName()).userName(uservo.getEmailId().trim().toLowerCase())
				.userPassword(hashedPassword).createdBy(ADMIN).updatedBy(ADMIN).globalSpecification(uservo.getGlobalSpecification())
				.emailId(uservo.getEmailId().trim().toLowerCase()).createdDate(timestamp).updatedDate(timestamp).build();
	}

	@Transactional
	public ResponseVO createUser(UsersVO uservo) throws YorosisException, LicenseException {
		Users user = constructVOtoDTO(uservo);
		int userCount = userRepository.getTotalUsersCount(uservo.getEmailId());

		if (userCount == 0) {
			if (StringUtils.isNotBlank(uservo.getEmailId()) && StringUtils.isNotBlank(uservo.getPassword())) {

				licenseValidationService.validateUserLimit(userRepository.count());
				userRepository.save(user);

				for (Integer role : uservo.getRoleId()) {
					Roles roles = roleRepository.findByRoleId(role);
					Users users = userRepository.findByUserId(user.getUserId());
					UserRole userRole = UserRole.builder().roles(roles).users(users).build();
					userRoleRepository.save(userRole);
				}

				log.info("User Created Succesfully");

				return ResponseVO.builder().response("Account Created Successfully").build();
			} else {
				throw new YorosisException(INVALID_USER);
			}
		} else {
			return ResponseVO.builder().response("Email Id Already Exist").build();
		}

	}

	@Override
	@Transactional
	public UserDetails loadUserByUsername(String username) {
		Users user = userRepository.findByUserName(username.trim().toLowerCase());

		if (user == null) {
			throw new UsernameNotFoundException(INVALID_USER);
		}

		return new org.springframework.security.core.userdetails.User(user.getUserName(), user.getUserPassword(), getAuthority(user));
	}

	private Set<SimpleGrantedAuthority> getAuthority(Users user) {
		Set<SimpleGrantedAuthority> authorities = new HashSet<>();

		if (user.getUserRole().isEmpty()) {
			authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
		} else {
			user.getUserRole().forEach(role -> authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getRoles().getRoleName())));
		}

		return authorities;
	}

	@Transactional
	public ResponseVO updatePasswordForUserManagement(UsersVO vo) throws YorosisException {
		Users user = userRepository.findByEmailId(vo.getEmailId());
		UsersVO loggedInUserDetails = getLoggedInUserDetails();
		if (StringUtils.isNotBlank(vo.getPassword())) {
			String hashedPassword = bcryptEncoder.encode(vo.getPassword());
			user.setUserPassword(hashedPassword);
			user.setUpdatedDate(new Timestamp(System.currentTimeMillis()));
			user.setUpdatedBy(loggedInUserDetails.getUserName());

			userRepository.save(user);
			return ResponseVO.builder().response("Password Updated Successfully").build();
		} else {
			throw new YorosisException("Invalid Password");
		}
	}

	@Transactional
	public ResponseVO updateRolesAndGlobalSpecificationForUserManagement(UsersVO vo) {
		Users user = userRepository.findByEmailId(vo.getEmailId());
		UsersVO loggedInUserDetails = getLoggedInUserDetails();

		Set<UserRole> updatedUserRole = new HashSet<>();

		user.setGlobalSpecification(vo.getGlobalSpecification());
		user.setUpdatedDate(new Timestamp(System.currentTimeMillis()));
		user.setUpdatedBy(loggedInUserDetails.getUserName());

		userRoleRepository.deleteByUsers(vo.getUserId());

		for (Integer role : vo.getRoleId()) {
			Roles roles = roleRepository.findByRoleId(role);
			Users users = userRepository.findByUserId(vo.getUserId());
			updatedUserRole.add(UserRole.builder().roles(roles).users(users).build());
		}

		user.setUserRole(updatedUserRole);
		userRepository.save(user);

		return ResponseVO.builder().response("Roles/Global Specification Updated Successfully").build();
	}

	@Transactional
	public ResponseVO updatePassword(ChangePasswordVO vo) throws YorosisException {
		Users user = userRepository.findByUserName(YorosisContext.get().getUserName());
		UsersVO loggedInUserDetails = getLoggedInUserDetails();

		if (bcryptEncoder.matches(vo.getOldPasssword(), user.getUserPassword())) {
			if (StringUtils.equals(vo.getNewPassword(), vo.getConfirmNewPassword())) {
				String hashedPassword = bcryptEncoder.encode(vo.getNewPassword());
				user.setUserPassword(hashedPassword);
				user.setUpdatedDate(new Timestamp(System.currentTimeMillis()));
				user.setUpdatedBy(loggedInUserDetails.getUserName());
				userRepository.save(user);

				return ResponseVO.builder().response("Password Updated Successfully").build();
			} else {
				throw new YorosisException("New Password and Confirm Password does not match");
			}

		} else {
			return ResponseVO.builder().response("Old Password does not match").build();
		}
	}

	@Transactional
	public UsersVO getLoggedInUserDetails() {
		Users user = userRepository.findByUserName(YorosisContext.get().getUserName());
		return constructDTOtoVO(user);
	}

	@Override
	@Transactional
	public TableData getGridData(PaginationVO pagination) throws YorosisException, IOException {
		List<Map<String, String>> list = new ArrayList<>();

		TableData tableData = null;
		Map<String, String> dataMap = null;

		Pageable pageable = getPageableObject(pagination);
		if (StringUtils.equalsIgnoreCase("user", pagination.getGridId())) {
			String totalCount = userRepository.getTotalUsersCountForGrid();
			List<Users> usersList = userRepository.getUsersList(pageable);

			tableData = TableData.builder().data(list).totalRecords(totalCount).build();
			for (Users user : usersList) {
				dataMap = new HashMap<>();

				dataMap.put("col1", user.getEmailId());
				dataMap.put("col2", user.getFirstName());
				dataMap.put("col3", user.getLastName());
				List<String> rolesList = new ArrayList<>();
				for (UserRole role : user.getUserRole()) {
					rolesList.add(role.getRoles().getRoleName());
				}
				dataMap.put("col4", rolesList.toString().replaceAll("[\\[\\](){}]", ""));
				dataMap.put("col5", user.getGlobalSpecification());
				dataMap.put("col6", Integer.toString(user.getUserId()));

				list.add(dataMap);
			}
		} else {
			throw new YorosisException("Invalid Grid Id");
		}

		return tableData;
	}

	@Transactional
	public UsersVO getUsersForm(int id) {
		Users user = userRepository.findByUserId(id);

		Set<UserRole> roles = user.getUserRole();

		List<RolesListVO> rolesList = new ArrayList<>();
		for (UserRole userRoleList : roles) {
			RolesListVO rolesListVO = RolesListVO.builder().id(userRoleList.getRoles().getRoleId()).rolesNames(userRoleList.getRoles().getRoleName()).build();
			rolesList.add(rolesListVO);
		}

		UsersVO vo = constructDTOtoVO(user);

		vo.setUserRole(rolesList);

		return vo;
	}

	public List<RolesListVO> getRolesNameList() {
		List<Roles> roleNamesList = roleRepository.findAll();

		List<RolesListVO> nameList = new ArrayList<>();
		for (Roles role : roleNamesList) {
			nameList.add(RolesListVO.builder().id(role.getRoleId()).rolesNames(role.getRoleName()).rolesDesc(role.getRoleDesc()).build());
		}
		return nameList;

	}

	public int getRole() {
		return getRolesNameList().size();
	}

	@Override
	public String getGridModuleId() {
		return "user";
	}

}
