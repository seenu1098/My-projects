package com.yorosis.yoroapps.vo;

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
	private String tenantId;
	private List<UUID> roleId;
	private List<RolesListVO> userRoleList;
	private String globalSpecification;
	private String unReadMessagesCount;
	private List<GroupVO> groupVOList;
	private String profilePicture;
	private String recipientEmails;
	private String senderEmail;
	private String subject;
	private String messageBody;
	private String inviteUser;
	private String mobileNumber;
	private List<UUID> groupId;
	private String userType;
	private String tokenId;
	private String activeFlag;
	private String authType;
	private String isTwoFactor;
	private List<UUID> removedGroupIdList;
	private List<UUID> removedRolesIdList;
	private UserSignatureListVO userSignatureListVO;
	private boolean isTwoFactorSetUp;
	private boolean isTwoFactorEnforced;
	private Boolean isRoleEditable;
	private Long activeUsersCount;
	private Long inActiveUsersCount;
	private Long guestUsersCount;
	private Long nonGuestUsersCount;
	private String theme;
	private String layout;
	private String defaultLanguage;
	private JsonNode additionalSettings;
	private String color;
	private String timezone;
}
