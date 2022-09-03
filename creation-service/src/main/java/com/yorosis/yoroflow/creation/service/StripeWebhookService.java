package com.yorosis.yoroflow.creation.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.net.URL;
import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.jasypt.encryption.StringEncryptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.Invoice;
import com.stripe.model.PaymentMethod;
import com.stripe.model.StripeObject;
import com.stripe.model.Subscription;
import com.stripe.net.Webhook;
import com.yorosis.yoroapps.entities.CustomerPayment;
import com.yorosis.yoroapps.entities.Customers;
import com.yorosis.yoroapps.entities.OrgSubscription;
import com.yorosis.yoroapps.entities.PaymentSettings;
import com.yorosis.yoroapps.entities.PaymentSubscriptionDetails;
import com.yorosis.yoroapps.vo.FileUploadVo;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.CustomerPaymentRepository;
import com.yorosis.yoroflow.creation.repository.CustomersRepository;
import com.yorosis.yoroflow.creation.repository.OrgSubscriptionRepository;
import com.yorosis.yoroflow.creation.repository.PaymentSettingsRepository;
import com.yorosis.yoroflow.creation.repository.PaymentSubscriptionDetailsRepository;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class StripeWebhookService {

	@Autowired
	private CustomerPaymentRepository customerPaymentRepository;

	@Autowired
	private CustomersRepository customersRepository;

	@Autowired
	private FileManagerService fileManagerService;

	@Autowired
	private PaymentSettingsRepository paymentSettingsRepository;

	@Autowired
	private OrgSubscriptionRepository orgSubscriptionRepository;

	@Autowired
	private PaymentSubscriptionDetailsRepository paymentSubscriptionDetailsRepository;

	private static final String STRIPE_KEY = "Stripe Key";
	private static final String STRIPE_WEBHOOK_KEY = "Stripe Webhook Key";
	private static final String TENANT_ID = "yoroflow";
	private static final String INVOICE_PAID = "invoice.paid";
	private static final String SUBSCRIPTION_CYCLE = "subscription_cycle";
	private static final String MAIN_URL = "https://pay.stripe.com/invoice/";
	private static final String REPLACE_URL = "https://invoicedata.stripe.com/invoice_receipt_file_url/";
	private static final String FILE_URL = "file_url";
	private static final String CONTENT_TYPE = "application/pdf";

	@Autowired
	private StringEncryptor jasyptEncryptor;

	public ResponseStringVO handleStripeEvents(String payload, String sigHeader) throws IOException, StripeException {
		PaymentSettings paymentSettings = paymentSettingsRepository
				.findByStripeKeyNameAndTenantIdAndActiveFlag(STRIPE_WEBHOOK_KEY, TENANT_ID, YoroappsConstants.YES);

		PaymentSettings paymentStripeKey = paymentSettingsRepository
				.findByStripeKeyNameAndTenantIdAndActiveFlag(STRIPE_KEY, TENANT_ID, YoroappsConstants.YES);

		String response = null;
		if (paymentSettings == null || paymentStripeKey == null) {
			response = "Stripe Key not created";
		}

		if (paymentSettings != null && paymentStripeKey != null
				&& StringUtils.isNotBlank(paymentSettings.getSecretKey())) {
			Stripe.apiKey = jasyptEncryptor.decrypt(paymentStripeKey.getSecretKey());
			String endpointSecret = jasyptEncryptor.decrypt(paymentSettings.getSecretKey());
			Event event = getEvent(payload, sigHeader, endpointSecret);
			StripeObject stripeObject = getStripeObject(paymentSettings, payload, sigHeader, endpointSecret);

			if (event != null && StringUtils.equals(event.getType(), INVOICE_PAID)) {
				Invoice invoice = (Invoice) stripeObject;
				if (invoice != null && StringUtils.equals(invoice.getBillingReason(), SUBSCRIPTION_CYCLE)) {
					log.info("invoice:{}", invoice);

					Date startDate = new Date(invoice.getPeriodStart() * 1000);
					Date endDate = new Date(invoice.getPeriodEnd() * 1000);

					log.info("startDate:{}", startDate);
					log.info("endDate:{}", endDate);

					Subscription subscription = Subscription.retrieve(invoice.getSubscription());
					if (subscription != null) {
						Date subscriptionStartDate = new Date(subscription.getCurrentPeriodStart() * 1000);
						Date subscriptionEndDate = new Date(subscription.getCurrentPeriodEnd() * 1000);

						Customers customers = customersRepository.getCustomerByPaymentId(subscription.getCustomer(),
								subscriptionStartDate, subscriptionEndDate, YoroappsConstants.YES);
						if (customers == null) {
							setUpCutomerPayment(invoice, subscription, startDate, endDate, paymentStripeKey);
							response = "Subscription updated successfully";
						} else {
							response = "Subscription already updated";
						}
					}
				} else {
					log.info("Unhandled event type: {}", event.getType());
				}
			}
		}

		return ResponseStringVO.builder().response(response).build();
	}

	private StripeObject getStripeObject(PaymentSettings paymentSettings, String payload, String sigHeader,
			String endpointSecret) {

		Event event = null;
		StripeObject stripeObject = null;

		log.info("payload:{}", payload);
		log.info("sigHeader:{}", sigHeader);

		try {
			event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
			EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();

			Optional<StripeObject> object = dataObjectDeserializer.getObject();
			if (object.isPresent()) {
				stripeObject = object.get();
			}
		} catch (SignatureVerificationException e) {
			log.error(e.getMessage());
		}

		return stripeObject;
	}

	private Event getEvent(String payload, String sigHeader, String endpointSecret) {
		Event event = null;
		try {
			event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
		} catch (SignatureVerificationException e) {
			log.error(e.getMessage());
		}
		return event;
	}

	private void setUpCutomerPayment(Invoice invoice, Subscription subscription, Date startDate, Date endDate,
			PaymentSettings paymentStripeKey) throws IOException, StripeException {
		Stripe.apiKey = jasyptEncryptor.decrypt(paymentStripeKey.getSecretKey());
		Customers customers = customersRepository.getCustomerByPaymentId(subscription.getCustomer(), startDate, endDate,
				YoroappsConstants.YES);
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		Date subscriptionStartDate = new Date(subscription.getCurrentPeriodStart() * 1000);
		Date subscriptionEndDate = new Date(subscription.getCurrentPeriodEnd() * 1000);
		log.info("subscriptionStartDate:{}", subscriptionStartDate);
		log.info("subscriptionEndDate:{}", subscriptionEndDate);
		if (customers != null) {
			customers.setSubscriptionStartDate(subscriptionStartDate);
			customers.setSubscriptionEndDate(subscriptionEndDate);
			if (StringUtils.equals(customers.getIsPayingCustomer(), YoroappsConstants.NO)) {
				customers.setIsPayingCustomer(YoroappsConstants.YES);
			}
			customersRepository.save(customers);
			updatePaymentSubscription(customers, invoice, subscriptionStartDate, subscriptionEndDate);
		}

		CustomerPayment payment = CustomerPayment.builder().tenantId(TENANT_ID).createdBy(invoice.getCustomerEmail())
				.modifiedBy(invoice.getCustomerEmail()).modifiedOn(timestamp).createdOn(timestamp)
				.activeFlag(YoroappsConstants.YES)
				.paymentAmount(BigDecimal.valueOf(invoice.getAmountPaid()).movePointLeft(2).doubleValue())
				.paymentDate(timestamp).paymentCustomerId(invoice.getCustomer())
				.paymentSubscriptionId(invoice.getSubscription())
				.quantity(invoice.getLines().getData().get(0).getQuantity())
				.paymentPriceId(invoice.getLines().getData().get(0).getPrice().getId()).build();

		if (invoice.getInvoicePdf() != null) {
			String invoicePdf = invoice.getInvoicePdf();

			String newStr = invoicePdf.replace(MAIN_URL, REPLACE_URL).replace("/pdf", "");

			URL url = new URL(newStr);

			InputStream is = url.openConnection().getInputStream();
			BufferedReader reader = new BufferedReader(new InputStreamReader(is));

			String line = null;
			String asText = null;
			while ((line = reader.readLine()) != null) {
				ObjectMapper mapper = new ObjectMapper();
				JsonNode node = mapper.readTree(line);
				asText = node.get(FILE_URL).asText();
			}
			reader.close();

			URL fileUrl = new URL(asText);

			byte[] byteArray = IOUtils.toByteArray(fileUrl.openStream());

			String fileKey = new StringBuilder(UUID.randomUUID().toString()).append(LocalTime.now()).toString();
			FileUploadVo fileUploadVO = FileUploadVo.builder().key(fileKey).contentSize(byteArray.length)
					.inputStream(byteArray).contentType(CONTENT_TYPE).build();
			fileManagerService.uploadFileFromStripe(fileUploadVO);

			payment.setInvoicePdf(fileKey);
			payment.setIsPaymentSucceed(YoroappsConstants.YES);

		}

		List<CustomerPayment> paymentList = customerPaymentRepository
				.findByPaymentCustomerIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(invoice.getCustomer(), TENANT_ID,
						YoroappsConstants.YES);
		if (paymentList != null && !paymentList.isEmpty()
				&& StringUtils.isNotBlank(paymentList.get(0).getPaymentMethodId())) {
			PaymentMethod paymentMethod = PaymentMethod.retrieve(paymentList.get(0).getPaymentMethodId());
			payment.setPaymentMethod(
					paymentMethod.getCard().getBrand() + " ending in " + paymentMethod.getCard().getLast4());
			payment.setPaymentType(paymentMethod.getType());
			payment.setPaymentMethodId(paymentMethod.getId());
		}

		if (customers != null && StringUtils.isNotBlank(customers.getOrgName())) {
			payment.setDescription(customers.getOrgName());
		} else {
			payment.setDescription(invoice.getCustomerEmail());
		}
		customerPaymentRepository.save(payment);
	}

	private OrgSubscription construcOrgSubscriptionEntity(OrgSubscription orgSubscription, Invoice invoice) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return OrgSubscription.builder().customerId(orgSubscription.getCustomerId())
				.planType(getPlanId(orgSubscription.getPlanType().getId())).updatedBy(invoice.getCustomerEmail())
				.billingType(orgSubscription.getBillingType())
				.subscriptionAmount(orgSubscription.getSubscriptionAmount()).updatedDate(timestamp)
				.createdBy(invoice.getCustomerEmail()).createdDate(timestamp).tenantId(TENANT_ID)
				.activeFlag(YoroappsConstants.YES).activePlan(YoroappsConstants.YES).build();
	}

	private void updatePaymentSubscription(Customers customers, Invoice invoice, Date subscriptionStartDate,
			Date subscriptionEndDate) {

		List<OrgSubscription> orgSubscriptionList = orgSubscriptionRepository
				.getOrgSubscriptionBasedOnCustomerId(customers.getId(), TENANT_ID, YoroappsConstants.YES);
		List<OrgSubscription> list = orgSubscriptionList.stream()
				.filter(t -> StringUtils.equals(t.getActivePlan(), YoroappsConstants.YES)).collect(Collectors.toList());

		if (!list.isEmpty()) {
			OrgSubscription orgSubs = list.get(0);
			orgSubs.setActiveFlag(YoroappsConstants.NO);
			orgSubs.setActivePlan(YoroappsConstants.NO);
			orgSubscriptionRepository.save(orgSubs);

			OrgSubscription orgSubscription = construcOrgSubscriptionEntity(orgSubs, invoice);
			orgSubscription.setSubscriptionStartDate(subscriptionStartDate);
			orgSubscription.setSubscriptionEndDate(subscriptionEndDate);
			orgSubscriptionRepository.save(orgSubscription);
		}

	}

	private PaymentSubscriptionDetails getPlanId(UUID planId) {
		return paymentSubscriptionDetailsRepository.getbyIdAndPaymentSubscriptionDetails(planId, TENANT_ID,
				YoroappsConstants.YES);
	}
}
