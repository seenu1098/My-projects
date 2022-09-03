package com.yorosis.yoroflow.entities;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;

import com.fasterxml.jackson.databind.JsonNode;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TypeDef(name = "jsonb", typeClass = JsonBinaryType.class)
public class User {

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "user_id")
	private UUID userId;

	@Column(name = "created_by")
	private String createdBy;

	@Column(name = "created_on", nullable = false)
	private Timestamp createdOn;

	@Column(name = "email_id")
	private String emailId;

	@Column(name = "contact_email_id", unique = true, nullable = false, length = 355)
	private String contactEmailId;

	@Column(name = "first_name")
	private String firstName;

	@Column(name = "last_login")
	private Timestamp lastLogin;

	@Column(name = "last_name")
	private String lastName;

	@Column(name = "modified_by", nullable = false, length = 100)
	private String modifiedBy;

	@Column(name = "modified_on", nullable = false)
	private Timestamp modifiedOn;

	@Column(name = "user_name")
	private String userName;

	@Column(name = "user_password")
	private String userPassword;

	@Column(name = "active_flag", nullable = false, length = 1)
	private String activeFlag;

	@Column(name = "user_type", nullable = false, length = 1)
	private String userType;

	@Column(name = "tenant_id", length = 60)
	private String tenantId;

	@Column(name = "profile_picture")
	private String profilePicture;

	@Column(name = "contact_mobile_number")
	private String mobileNumber;
	
	@Column(name = "is_two_factor")
	private String isTwoFactor;
	
	@Column(name = "auth_type")
	private String authType;

	@Column(name = "auth_token")
	private String authToken;
	
	@Column(name = "otp_provider")
	private String otpProvider;

	@Column(name = "otp_secret")
	private String otpSecret;
	
	@Column(name = "terms_accepted")
	private String termsAccepted;
	
	@Column(name = "default_workspace")
	private UUID defaultWorkspace;
	
	@Column(name = "theme")
	private String theme;

	@Column(name = "layout")
	private String layout;

	@Column(name = "default_language")
	private String defaultLanguage;
	
	@Column(name = "color")
	private String color;
	
	@Column(name = "timezone")
	private String timezone;

	@Column(name = "additional_settings")
	@Type(type = "jsonb")
	private JsonNode additionalSettings;

	@OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
	private List<UserGroup> userGroups;

	@OneToMany(cascade = CascadeType.ALL, mappedBy = "users")
	private List<MessageGroupUsers> messageGroupUsers;
}