package com.yorosis.yoroapps.vo;

import java.sql.Timestamp;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerPaymentVO {
	private UUID id;
	private Timestamp paymentDate;
	private Double paymentAmount;
	private String paymentMethod;
	private String cardNumber;
	private String expMonth;
	private String expYear;
	private String cvv;
	private String tokenId;
	private String cardId;
	private String publishableKey;
	private String paymentCustomerId;
	private String addressLine1;
	private String addressLine2;
	private String city;
	private String state;
	private String country;
	private String postalCode;
	private String email;
	private String phone;
	private String billingType;
	private String planType;
	private Double discountAmount;
	private Double totalSubscriptionAmount;
	private String paymentSubscriptionId;
	private String invoicePdf;
	private Long quantity;
	private String paymentPriceId;
	private String isPaymentSucceed;
	private Boolean isUpgrade;
	private Timestamp createdOn;
	private Boolean isUpgradeSubscription;
	private String previousPlan;

}
