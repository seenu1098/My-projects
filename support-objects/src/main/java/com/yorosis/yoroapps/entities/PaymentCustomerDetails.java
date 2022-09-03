package com.yorosis.yoroapps.entities;

import java.sql.Timestamp;
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
import lombok.EqualsAndHashCode.Exclude;
import lombok.NoArgsConstructor;

@Table(name = "payment_customer_details")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaymentCustomerDetails {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(unique = true, nullable = false, precision = 19)
	private UUID id;

	@Column(name = "address_line_1", nullable = false, length = 1)
	private String addressLine1;

	@Column(name = "address_line_2", nullable = false, length = 1)
	private String addressLine2;

	@Column(name = "city", nullable = false, length = 1)
	private String city;

	@Column(name = "state", nullable = false, length = 1)
	private String state;

	@Column(name = "country", nullable = false, length = 1)
	private String country;

	@Column(name = "postal_code", nullable = false, length = 1)
	private String postalCode;

	@Column(name = "email", nullable = false, length = 1)
	private String email;

	@Column(name = "phone", nullable = false, length = 1)
	private String phone;

	@Column(name = "active_flag", nullable = false, length = 1)
	private String activeFlag;

	@Column(name = "created_by", nullable = false, length = 100)
	private String createdBy;

	@Column(name = "created_on", nullable = false)
	private Timestamp createdOn;

	@Column(name = "modified_by", nullable = false, length = 100)
	private String modifiedBy;

	@Column(name = "modified_on", nullable = false)
	private Timestamp modifiedOn;

	@Column(name = "tenant_id", nullable = false)
	private String tenantId;

	@Exclude
	@ManyToOne(optional = false)
	@JoinColumn(name = "customer_payment_id", nullable = false)
	private CustomerPayment customerPayment;
}
