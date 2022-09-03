package com.yorosis.yoroapps.entities;

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
import lombok.ToString.Exclude;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TypeDef(name = "jsonb", typeClass = JsonBinaryType.class)
public class Users {

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "user_id", unique = true, nullable = false, precision = 10)
	private UUID userId;

	@Column(name = "user_name", unique = true, length = 200)
	private String userName;

	@Column(name = "first_name", length = 100)
	private String firstName;

	@Column(name = "last_name", length = 100)
	private String lastName;

	@Column(name = "user_password", length = 200)
	private String userPassword;

	@Column(name = "email_id", unique = true, nullable = false, length = 355)
	private String emailId;

	@Column(name = "contact_email_id", unique = true, nullable = false, length = 355)
	private String contactEmailId;

	@Column(name = "last_login")
	private Timestamp lastLogin;

	@Column(name = "tenant_id", nullable = false, length = 60)
	private String tenantId;

	@Column(name = "created_by", nullable = false, length = 100)
	private String createdBy;

	@Column(name = "created_on", nullable = false)
	private Timestamp createdOn;

	@Column(name = "modified_by", nullable = false, length = 100)
	private String modifiedBy;

	@Column(name = "modified_on", nullable = false)
	private Timestamp modifiedOn;

	@Column(name = "profile_picture")
	private String profilePicture;

	@Column(name = "contact_mobile_number")
	private String mobileNumber;

	@Column(name = "otp_provider")
	private String otpProvider;

	@Column(name = "otp_secret")
	private String otpSecret;

	@Column(name = "active_flag", nullable = false, length = 1)
	private String activeFlag;

	@Column(name = "auth_expiration_date")
	private Timestamp authExpirationDate;

	@Column(name = "auth_type")
	private String authType;

	@Column(name = "auth_token")
	private String authToken;

	@Column(name = "user_type")
	private String userType;

	@Column(name = "terms_accepted")
	private String termsAccepted;

	@Column(name = "is_two_factor")
	private String isTwoFactor;

	@Column(name = "default_workspace")
	private UUID defaultWorkspace;

	@Column(name = "theme")
	private String theme;

	@Column(name = "layout")
	private String layout;

	@Column(name = "default_language")
	private String defaultLanguage;

	@Column(name = "additional_settings")
	@Type(type = "jsonb")
	private JsonNode additionalSettings;
	
	@Column(name = "color")
	private String color;
	
	@Column(name = "timezone")
	private String timezone;

	@OneToMany(mappedBy = "users", cascade = CascadeType.ALL)
	private List<UserGroup> userGroups;

	@OneToMany(mappedBy = "users", cascade = CascadeType.ALL)
	private List<UserAssociateRoles> userAssociateRoles;

	@OneToMany(mappedBy = "users", cascade = CascadeType.ALL)
	private List<ServiceToken> serviceTokens;

	@Exclude
	@lombok.EqualsAndHashCode.Exclude
	@OneToMany(mappedBy = "users", cascade = CascadeType.ALL)
	private List<OrgTermsAccepted> orgTermsAccepteds;

	@Exclude
	@lombok.EqualsAndHashCode.Exclude
	@OneToMany(mappedBy = "users", cascade = CascadeType.ALL)
	private List<LoginHistory> loginHistory;
}
