package com.yorosis.taskboard.models;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsersVO {
	private UUID userId;
	private String firstName;
	private String lastName;
	private String userName;
	private String password;
	private String emailId;
	private String contactEmailId;
	private String confirmPassword;
	private String createdBy;
	private Timestamp createdDate;
	private String updatedBy;
	private Timestamp updatedDate;
	private Timestamp lastLogin;
	private List<UUID> roleId;
	private List<UUID> userRole;
	private String userType;
	private String globalSpecification;
	private List<GroupVO> groupVOList;
	private long unReadMessageCount;
	private String profilePicture;
	private String mobileNumber;
	private List<UUID> groupId;
	private String theme;
	private String layout;
	private String defaultLanguage;
	private JsonNode additionalSettings;
	private String color;
}
