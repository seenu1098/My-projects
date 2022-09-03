package com.yorosis.yoroapps.entities;

import java.io.Serializable;
import java.sql.Date;
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

@Table(name = "customers")
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Customers implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(generator = "uuid2")
	@GenericGenerator(name = "uuid2", strategy = "uuid2")
	@Column(name = "id", unique = true, nullable = false, precision = 19)
	private UUID id;

	@Column(name = "org_name", nullable = false, length = 200)
	private String orgName;

	@Column(name = "actual_domain_name", length = 100)
	private String actualDomainName;

	@Column(name = "allowed_domain_names", length = 300)
	private String allowedDomainNames;

	@Column(name = "subdomain_name", nullable = false, length = 100)
	private String subdomainName;

	// This would be the schema name as well
	@Column(name = "tenant_id", nullable = false, length = 60)
	private String tenantId;

	@Column(name = "timezone", nullable = false, length = 100)
	private String timezone;

	@Column(name = "default_language", nullable = false, length = 50)
	private String defaultLanguge;

	@Column(name = "trial_start_date", nullable = true)
	private Date trialStartDate;

	@Column(name = "trial_end_date", nullable = true)
	private Date trialEndDate;

	@Column(name = "is_on_trial", nullable = false, length = 1)
	private String isOnTrial;

	@Column(name = "is_paying_customer", nullable = false, length = 1)
	private String isPayingCustomer;

	@Column(name = "registration_date", nullable = false)
	private Date registrationDate;

	@Column(name = "registered_from_ip", nullable = false, length = 50)
	private String registeredFromIp;

	@Column(name = "created_by", nullable = false, length = 100)
	private String createdBy;

	@Column(name = "created_on", nullable = false)
	private Timestamp createdOn;

	@Column(name = "modified_by", length = 100)
	private String modifiedBy;

	@Column(name = "modified_on")
	private Timestamp modifiedOn;

	@Column(name = "active_flag", nullable = false, length = 1)
	private String activeFlag;

	@Column(name = "customer_number")
	private Integer customerNumber;

	@Column(name = "maximum_users")
	private Integer maximunUsers;

	@Column(name = "theme_id")
	private String themeId;

	@Column(name = "logo")
	private String logo;

	@Column(name = "organization_url")
	private String organizationUrl;

	@Column(name = "background_image")
	private String backgroundImage;

	@Column(name = "server_farm")
	private String serverFarm;

	@Column(name = "datasource_name")
	private String datasourceName;

	@Column(name = "payment_customer_id")
	private String paymentCustomerId;

	@Column(name = "subscription_start_date", nullable = true)
	private Date subscriptionStartDate;

	@Column(name = "subscription_end_date", nullable = true)
	private Date subscriptionEndDate;

}
