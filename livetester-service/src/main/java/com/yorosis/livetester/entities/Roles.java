package com.yorosis.livetester.entities;

import java.sql.Timestamp;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "roles", indexes = { @Index(name = "roles_role_name_IX", columnList = "role_name", unique = true) })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Roles {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "role_id", unique = true, nullable = false)
	private int roleId;

	@Column(name = "role_name", unique = true, nullable = false)
	private String roleName;

	@Column(name = "role_desc", nullable = false )
	private String roleDesc;

	@Column(name = "created_by")
	private String createdBy;

	@Column(name = "created_date")
	private Timestamp createdDate;

	@Column(name = "updated_by")
	private String updatedBy;

	@Column(name = "updated_date")
	private Timestamp updatedDate;

	@OneToMany(mappedBy = "roles")
	@EqualsAndHashCode.Exclude
	@ToString.Exclude
	private Set<UserRole> userRole;

}
