package com.yorosis.yoroflow.creation.controller;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.List;
import java.util.UUID;

import javax.mail.MessagingException;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.exception.StripeException;
import com.yorosis.yoroapps.entities.Customers;
import com.yorosis.yoroapps.vo.CustomerPaymentVO;
import com.yorosis.yoroapps.vo.CustomersVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.exception.YoroappsException;
import com.yorosis.yoroflow.creation.service.AuthMethodService;
import com.yorosis.yoroflow.creation.service.CustomerService;
import com.yorosis.yoroflow.creation.service.FeignClientService;
import com.yorosis.yoroflow.creation.service.ProxyService;
import com.yorosis.yoroflow.creation.table.vo.CreateCustomerVO;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@CrossOrigin
@RequestMapping("/customer/v1/")
public class CustomerController {
	@Autowired
	private CustomerService customerService;

	@Autowired
	private AuthMethodService authMethodService;

	@Autowired
	private FeignClientService clientService;

	@Autowired
	private ProxyService proxyService;

	private final ObjectMapper mapper = new ObjectMapper();

	@PostMapping(path = "/create")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner'})")
	public ResponseStringVO createCustomer(@RequestParam("data") String data,
//			@RequestParam(value = "custom-attribute", required = false) String customAttribute,
			@RequestParam(value = "file", required = false) List<MultipartFile> file,
			@RequestHeader(name = "X-Forwarded-For", required = false) String remoteIp)
			throws IOException, YoroappsException, MessagingException, StripeException {

		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		CustomersVO customersVo = mapper.readValue(data, CustomersVO.class);

		try {
			if (customersVo.getUserEmailId() != null) {
				customersVo.setUserEmailId(customersVo.getUserEmailId().trim().toLowerCase());

				YorosisContext context = YorosisContext.builder().tenantId(YoroappsConstants.DEFAULT_SCHEMA)
						.userName(customersVo.getUserEmailId()).build();
				YorosisContext.set(context);
				if (StringUtils.isBlank(remoteIp)) {
					remoteIp = "localhost";
				}
			}

			return customerService.createCustomer(customersVo, file, remoteIp);
		} finally {
			YorosisContext.clear();
		}
	}

	@GetMapping("/get")
	public CustomersVO getCustomerInfo() throws IOException {
		return proxyService.getCustomerInfo();
	}

	@GetMapping("/get/customer/info/{id}")
	public CustomersVO getCustomerInfoById(@PathVariable(name = "id") String id) throws IOException {
		return customerService.getCustomeInfoById(UUID.fromString(id));
	}

	@PostMapping("/check-subdomain-name")
	public ResponseStringVO checkSubdomainName(@RequestBody CustomersVO customersVo) {
		return customerService.checkSubdomainName(customersVo);
	}

	@GetMapping("/get/logo")
	public ResponseStringVO getCustomerLogo() throws IOException {
		return customerService.getCustomersLogo();
	}

	@GetMapping("/get/theme")
	public ResponseStringVO getCustomerTheme() {
		return customerService.getCustomerTheme();
	}

	@GetMapping("/get/customer-logo")
	public ResponseStringVO getLogo(@RequestHeader("referer") String origin) throws IOException {
		String header = origin;
//		String header="https://yorosis.yoroflow.com";
		String[] arrOfStr = header.split("//", 2);
		String[] url = arrOfStr[1].split("[.]", 2);
		String domain = url[0].toString();
		Customers customer = customerService.getCustomer(domain);
		ResponseStringVO responseStringVO = null;
		if (customer != null) {
			try {
				YorosisContext context = YorosisContext.builder().tenantId(customer.getTenantId()).build();
				YorosisContext.set(context);
				responseStringVO = customerService.getCustomerLogo(domain);
				ResponseStringVO allowed = authMethodService.isAllowed();
				if (StringUtils.equals(allowed.getResponse(), "its allowed")) {
					responseStringVO.setGoogle(authMethodService.checkGoogleUser());
					authMethodService.checkMicrosoftUser(responseStringVO);
				} else {
					responseStringVO.setGoogle(false);
					responseStringVO.setMicrosoft(false);
				}

				return responseStringVO;
			} finally {
				YorosisContext.clear();
			}
		}
		return ResponseStringVO.builder().build();
	}

	@GetMapping("/get/customer-logo/app/{subdomain}")
	public ResponseStringVO getLogoNativeApp(@PathVariable(name = "subdomain") String subdomain) throws IOException {
		Customers customer = customerService.getCustomer(subdomain);
		ResponseStringVO responseStringVO = null;
		try {
			YorosisContext context = YorosisContext.builder().tenantId(customer.getTenantId()).build();
			YorosisContext.set(context);
			responseStringVO = customerService.getCustomerLogo(subdomain);
			responseStringVO.setGoogle(authMethodService.checkGoogleUser());
//			responseStringVO.setMicrosoft(authMethodService.checkMicrosoftUser());
			return responseStringVO;
		} finally {
			YorosisContext.clear();
		}
	}

	@GetMapping("/get/org-name/app/{subdomain}")
	public CustomersVO getCustomerInfoForNativeApp(@PathVariable(name = "subdomain") String subdomain)
			throws IOException {
		Customers customer = customerService.getCustomer(subdomain);
		try {
			YorosisContext context = YorosisContext.builder().tenantId(customer.getTenantId()).build();
			YorosisContext.set(context);
			return customerService.getCustomerInfoByDomain(subdomain);
		} finally {
			YorosisContext.clear();
		}
	}

	@PostMapping("/save-customer-payment")
	public ResponseStringVO saveCustomerPayment(@RequestBody CustomerPaymentVO customerPaymentVO)
			throws StripeException, IOException, URISyntaxException {
		return proxyService.saveCustomerPayment(customerPaymentVO, YorosisContext.get().getTenantId());
	}

	@PostMapping("/add-users-payment")
	public ResponseStringVO addUsersPayment(@RequestBody CustomerPaymentVO customerPaymentVO)
			throws StripeException, IOException {
		return proxyService.addUsersPayment(customerPaymentVO, YorosisContext.get().getTenantId());
	}

	@PostMapping("/downgrade-plan")
	public ResponseStringVO downgradePlan(@RequestBody CustomerPaymentVO customerPaymentVO)
			throws IOException, StripeException {

		return proxyService.downgradePlan(customerPaymentVO, YorosisContext.get().getTenantId());
	}

	@PostMapping("/update")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner', 'Account Administrator'})")
	public ResponseStringVO updateOrganization(@RequestParam("data") String data,
			@RequestParam(value = "file", required = false) List<MultipartFile> file)
			throws StripeException, IOException {

		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		CustomersVO customersVo = mapper.readValue(data, CustomersVO.class);

		try {
			if (customersVo.getUserEmailId() != null) {
				customersVo.setUserEmailId(customersVo.getUserEmailId().trim().toLowerCase());

				YorosisContext context = YorosisContext.builder().tenantId(YoroappsConstants.DEFAULT_SCHEMA)
						.userName(customersVo.getUserEmailId()).build();
				YorosisContext.set(context);
			}

			return customerService.updateOrganization(customersVo, file);
		} finally {
			YorosisContext.clear();
		}
	}

	@PostMapping("/create-customer-schema")
	public void saveCustomer(@RequestBody CreateCustomerVO customerVO) {
		clientService.provisionNewCustomer(customerVO);
	}

	@PostMapping("/update-discount")
	public ResponseStringVO updateDiscount(@RequestParam("data") String data,
			@RequestParam(value = "file", required = false) List<MultipartFile> file) throws IOException {

		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		CustomersVO customerVo = mapper.readValue(data, CustomersVO.class);

		return customerService.updateDiscount(customerVo);
	}

	@PostMapping("/update-package-details")
	public ResponseStringVO updatePackageDetails(@RequestParam("data") String data,
			@RequestParam(value = "file", required = false) List<MultipartFile> file) throws IOException {

		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		CustomersVO customerVo = mapper.readValue(data, CustomersVO.class);

		return customerService.updatePackageDetails(customerVo);
	}

	@GetMapping(value = "/get/payment-history/{paymentCustomerId}")
	public List<CustomerPaymentVO> getPaymentHistory(@PathVariable("paymentCustomerId") String paymentCustomerId)
			throws IOException {
		return proxyService.getPaymentHistory(paymentCustomerId, YorosisContext.get().getTenantId());
	}

	@GetMapping(value = "/get/payment-details/{paymentCustomerId}")
	public CustomerPaymentVO getPaymentdetails(@PathVariable("paymentCustomerId") String paymentCustomerId)
			throws StripeException {
		return proxyService.getCustomerPaymentVO(paymentCustomerId);
	}

	@PostMapping("/update-card-details")
	public ResponseStringVO updateCardDetails(@RequestBody CustomerPaymentVO customerPaymentVO)
			throws StripeException, IOException {
		return proxyService.updateCardDetails(customerPaymentVO);
	}

	@GetMapping(value = "/download/file/{id}")
	public ResponseEntity<byte[]> showFiles(@PathVariable("id") String id) throws IOException {
		log.info("rolesList:{}", YorosisContext.get().getRolesList());
		byte[] document = proxyService.getReceiptPdf(UUID.fromString(id));
		HttpHeaders header = new HttpHeaders();
		header.setContentType(new MediaType("application", "png"));
		header.setContentLength(document.length);
		return new ResponseEntity<>(document, header, HttpStatus.OK);
	}

}