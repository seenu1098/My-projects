package com.yorosis.livetester.vo;

import java.sql.Timestamp;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsersVO {

	private int userId;
	private String firstName;
	private String lastName;
	private String userName;
	private String password;
	private String emailId;
	private String confirmPassword;
	private String createdBy;
	private Timestamp createdDate;
	private String updatedBy;
	private Timestamp updatedDate;
	private Timestamp lastLogin;
	private List<Integer> roleId;
	private List<RolesListVO> userRole;
	private String globalSpecification;

}
