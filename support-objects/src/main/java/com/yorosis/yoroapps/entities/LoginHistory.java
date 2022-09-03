package com.yorosis.yoroapps.entities;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.hibernate.annotations.GenericGenerator;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString.Exclude;

@Entity
@Table(name = "login_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginHistory {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id", unique = true, nullable = false, precision = 10)
	private UUID id;

	@Column(name = "login_ip_from")
	private String loginIpFrom;

	@Column(name = "created_date")
	private Timestamp craetedDate;

	@Column(name = "created_by")
	private String createdBy;

	@Column(name = "tenant_id")
	private String tenantId;

	@Column(name = "active_flag")
	private String activeFlag;
	
	@Column(name = "logout_time")
	private Timestamp logoutTime;

	@Exclude
	@ManyToOne(optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private Users users;
}
