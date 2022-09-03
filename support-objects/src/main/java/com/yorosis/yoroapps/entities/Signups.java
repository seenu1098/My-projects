package com.yorosis.yoroapps.entities;

import java.sql.Timestamp;
import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

import org.hibernate.annotations.GenericGenerator;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Table(name = "signup")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Signups {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id", unique = true, nullable = false, precision = 19)
	private UUID id;

	@Column(name = "email_id", nullable = false, length = 100)
	private String emailId;

	@Column(name = "first_name", nullable = false, length = 50)
	private String firstName;

	@Column(name = "last_name", nullable = false, length = 50)
	private String lastName;

	@Column(name = "phone_no", nullable = false, length = 15)
	private String phoneNo;

	@Column(name = "created_from_ip", nullable = false, length = 30)
	private String createdFromIp;

	@Column(name = "invitation_code", nullable = false, length = 1000)
	private String invitationCode;

	@Column(name = "expiry_date", nullable = false)
	private Timestamp expiryDate;

	@Column(name = "email_sent", nullable = false, length = 1)
	private String emailSent;

	@Column(name = "email_sent_on", nullable = true)
	private Timestamp emailSentOn;

	@Column(name = "code_validated_on", nullable = true)
	private Timestamp codeValidatedOn;

	@Column(name = "created_by", nullable = false, length = 100)
	private String createdBy;

	@Column(name = "created_on", nullable = false)
	private Timestamp createdOn;

	@Column(name = "modified_by", nullable = false, length = 100)
	private String modifiedBy;

	@Column(name = "modified_on", nullable = false)
	private Timestamp modifiedOn;

	@Column(name = "active_flag", nullable = false, length = 1)
	private String activeFlag;

}
