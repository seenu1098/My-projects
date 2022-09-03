package com.yorosis.yoroflow.entities;

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

@Table(name = "payment_subscription_details")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaymentSubscriptionDetails {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id", unique = true, nullable = false, precision = 19)
	private UUID id;
	
	@Column(name = "plan_name")
	private String planName;
	
	@Column(name = "monthly_price")
	private Float monthlyPrice;
	
	@Column(name = "yearly_price")
	private Float yearlyPrice;
	
	@Column(name = "active_flag", nullable = false, length = 1)
	private String activeFlag;

	@Column(name = "tenant_id", nullable = false, length = 60)
	private String tenantId;

	@Column(name = "created_by", nullable = false, length = 100)
	private String createdBy;

	@Column(name = "created_date", nullable = false)
	private Timestamp createdDate;
}
