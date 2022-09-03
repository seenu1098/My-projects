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
@Table(name = "org_terms_accepted")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrgTermsAccepted {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id", unique = true, nullable = false, precision = 10)
	private UUID id;

	@Column(name = "terms_accepted_date")
	private Timestamp termsAcceptedDate;

	@Column(name = "terms_accepted_ip_from")
	private String termsAcceptedIpFrom;

	@Column(name = "created_by")
	private String createdBy;

	@Column(name = "craeted_date")
	private Timestamp craetedDate;

	@Column(name = "tenant_id")
	private String tenantId;

	@Column(name = "active_flag")
	private String activeFlag;

	@Exclude
	@ManyToOne(optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private Users users;
}
