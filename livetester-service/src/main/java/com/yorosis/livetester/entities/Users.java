package com.yorosis.livetester.entities;

import java.sql.Timestamp;
import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import org.apache.commons.lang3.builder.ToStringExclude;
import org.hibernate.annotations.CreationTimestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString.Exclude;

@Entity
@Table(name = "users", indexes = { @Index(name = "users_user_name_IX", columnList = "user_name", unique = true),
		@Index(name = "users_email_id_IX", columnList = "email_id", unique = true) })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Users {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "user_id", unique = true, nullable = false, precision = 10)
	private int userId;

	@Column(name = "first_name")
	private String firstName;

	@Column(name = "last_name")
	private String lastName;

	@Column(name = "user_name", unique = true, nullable = false)
	private String userName;

	@Column(name = "user_password", nullable = false)
	private String userPassword;

	@Column(name = "email_id", unique = true, nullable = false)
	private String emailId;

	@Column(name = "created_by")
	private String createdBy;

	@Column(name = "created_date")
	@CreationTimestamp
	private Timestamp createdDate;

	@Column(name = "updated_by")
	private String updatedBy;

	@Column(name = "updated_date")
	@CreationTimestamp
	private Timestamp updatedDate;

	@Column(name = "last_login")
	private Timestamp lastLogin;

	@Column(name = "global_specification")
	private String globalSpecification;

	@OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "users")
	@EqualsAndHashCode.Exclude
	@ToStringExclude
	@Exclude
	private Set<UserRole> userRole;

}
