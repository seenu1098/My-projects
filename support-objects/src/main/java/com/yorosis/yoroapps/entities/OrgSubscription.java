package com.yorosis.yoroapps.entities;

import java.sql.Date;
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
import lombok.NoArgsConstructor;
import lombok.ToString.Exclude;

@Entity
@Table(name = "payment_subscription")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrgSubscription {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "subscription_id")
	private UUID id;

	@Column(name = "customer_id")
	private UUID customerId;

	@Column(name = "billing_type")
	private String billingType;

	@Column(name = "subscription_amount")
	private Float subscriptionAmount;

	@Column(name = "tenant_id")
	private String tenantId;

	@Column(name = "active_flag")
	private String activeFlag;

	@Column(name = "created_by")
	private String createdBy;

	@Column(name = "created_date")
	private Timestamp createdDate;

	@Column(name = "updated_by", nullable = false, length = 100)
	private String updatedBy;

	@Column(name = "updated_date", nullable = false)
	private Timestamp updatedDate;

	@Column(name = "subscription_start_date")
	private Date subscriptionStartDate;

	@Column(name = "subscription_end_date")
	private Date subscriptionEndDate;

	@Column(name = "active_plan")
	private String activePlan;

	@Exclude
	@ManyToOne(optional = false)
	@JoinColumn(name = "plan_type", nullable = false)
	private PaymentSubscriptionDetails planType;
}
