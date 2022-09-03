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

@Table(name = "payment_customer")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CustomerPayment {
	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id", unique = true, nullable = false, precision = 19)
	private UUID id;

	@Column(name = "bill_id")
	private UUID billId;

	@Column(name = "payment_type")
	private String paymentType;

	@Column(name = "payment_date")
	private Timestamp paymentDate;

	@Column(name = "payment_amount")
	private Double paymentAmount;

	@Column(name = "charge_id")
	private String chargeId;

	@Column(name = "balance_transaction")
	private String balanceTransaction;

	@Column(name = "description")
	private String description;

	@Column(name = "payment_method")
	private String paymentMethod;

	@Column(name = "receipt_url")
	private String receiptUrl;

	@Column(name = "payment_customer_id")
	private String paymentCustomerId;

	@Column(name = "payment_subscription_id")
	private String paymentSubscriptionId;

	@Column(name = "payment_price_id")
	private String paymentPriceId;

	@Column(name = "payment_method_id")
	private String paymentMethodId;

	@Column(name = "refunds_url")
	private String refundsUrl;

	@Column(name = "invoice_pdf")
	private String invoicePdf;

	@Column(name = "quantity")
	private Long quantity;

	@Column(name = "is_payment_succeed")
	private String isPaymentSucceed;

	@Column(name = "active_flag", nullable = false, length = 1)
	private String activeFlag;

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
}
