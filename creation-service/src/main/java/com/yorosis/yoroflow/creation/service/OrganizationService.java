package com.yorosis.yoroflow.creation.service;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.yorosis.yoroapps.entities.Application;
import com.yorosis.yoroapps.entities.Customers;
import com.yorosis.yoroapps.entities.Organization;
import com.yorosis.yoroapps.vo.CustomersVO;
import com.yorosis.yoroapps.vo.OrganizationVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.ApplicationRepository;
import com.yorosis.yoroflow.creation.repository.CustomersRepository;
import com.yorosis.yoroflow.creation.repository.OrganizationRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class OrganizationService {

	@Autowired
	private FileManagerService fileManagerService;

	@Autowired
	private OrganizationRepository organizationRepository;

	@Autowired
	private ApplicationService applicationService;

	@Autowired
	private ApplicationRepository applicationRepository;

	@Autowired
	private CustomersRepository customersRepository;

	@Autowired
	private CustomerService customerService;

	private OrganizationVO constructOrganizationDTOToVO(Organization organization) throws IOException {
		List<String> allowedDomainNamesList = null;
		if (organization.getAllowedDomainNames() != null) {
			String allowedDomainNames = organization.getAllowedDomainNames();
			allowedDomainNamesList = Arrays.asList(allowedDomainNames.split(","));
		}

		return OrganizationVO.builder().orgName(organization.getOrgName())
				.subdomainName(organization.getSubdomainName()).id(organization.getId())
				.allowedDomainNames(allowedDomainNamesList).themeId(organization.getThemeId())
				.image(getOrganizationLogoAndBackground(organization, true))
				.organizationUrl(organization.getOrganizationUrl())
				.backgroundImage(getOrganizationLogoAndBackground(organization, false)).build();

	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public Customers getCustomerInfoByDomain(String domain) throws IOException {
		Customers customers = customersRepository.findBySubdomainNameIgnoreCaseAndActiveFlagIgnoreCase(domain,
				YoroappsConstants.YES);
		if (customers != null) {
			return customers;
		} else {
			return null;
		}
	}

	private String getOrganizationLogoAndBackground(Organization organization, Boolean logo) throws IOException {
		String profile = null;
		if (StringUtils.isNotBlank(organization.getLogo()) && logo.booleanValue()) {
			profile = "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(
					fileManagerService.downloadFileForOrganization(organization.getLogo(), organization.getTenantId()));
		}
		if (StringUtils.isNotBlank(organization.getBackgroundImage()) && !logo.booleanValue()) {
			profile = "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(fileManagerService
					.downloadFileForOrganization(organization.getBackgroundImage(), organization.getTenantId()));
		}
		return profile;
	}

	@Transactional
	public OrganizationVO getOrganizationInfo() throws IOException {
		Organization organization = organizationRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		Customers customers = null;
		OrganizationVO organizationVO = constructOrganizationDTOToVO(organization);
		YorosisContext currentTenant = YorosisContext.get();
		try {
			YorosisContext.clear();
			YorosisContext context = YorosisContext.builder().tenantId(YoroappsConstants.DEFAULT_SCHEMA)
					.userName(currentTenant.getUserName()).build();
			YorosisContext.set(context);

			log.info("customer-after:{}", YorosisContext.get().getTenantId());
			customers = customerService.getCustomerInfoForOtherDomain(organizationVO.getSubdomainName());
			if (customers != null) {
				organizationVO.setCustomerPaymentId(customers.getPaymentCustomerId());
				organizationVO.setTimezone(customers.getTimezone());
			}

		} finally {
			YorosisContext.clear();
			YorosisContext.set(currentTenant);
		}
		return organizationVO;
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public OrganizationVO getOrganization() throws IOException {
		Organization organization = organizationRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		return constructOrganizationDTOToVO(organization);
	}

	@Transactional
	public ResponseStringVO updateOrganization(OrganizationVO organizationVO, List<MultipartFile> file,
			String customAttribute) throws IOException {

		String allowedDomains = null;
		if (organizationVO.getAllowedDomainNames() != null && !organizationVO.getAllowedDomainNames().isEmpty()) {
			allowedDomains = String.join(",", organizationVO.getAllowedDomainNames());
		}

		Organization updateOrganization = organizationRepository.findByIdAndActiveFlagIgnoreCase(organizationVO.getId(),
				YoroappsConstants.YES);
		updateOrganization.setOrgName(organizationVO.getOrgName());
		updateOrganization.setAllowedDomainNames(trim(allowedDomains));
		updateOrganization.setSubdomainName(trim(organizationVO.getSubdomainName()));
		updateOrganization.setOrganizationUrl(organizationVO.getOrganizationUrl());
		if (file != null) {
			saveOrUpdateApplicationLogo(file, updateOrganization);
		}
		updateOrganization.setThemeId(organizationVO.getThemeId());

		organizationRepository.save(updateOrganization);
		return ResponseStringVO.builder().response("Your Organization Updated Successfully").build();

	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO updateOrganizationFromCustomer(OrganizationVO organizationVO, List<MultipartFile> file)
			throws IOException {

		String allowedDomains = null;
		if (organizationVO.getAllowedDomainNames() != null && !organizationVO.getAllowedDomainNames().isEmpty()) {
			allowedDomains = String.join(",", organizationVO.getAllowedDomainNames());
		}

		Organization updateOrganization = organizationRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		if (updateOrganization != null) {
			updateOrganization.setOrgName(organizationVO.getOrgName());
			updateOrganization.setAllowedDomainNames(trim(allowedDomains));
			updateOrganization.setSubdomainName(trim(organizationVO.getSubdomainName()));
			updateOrganization.setOrganizationUrl(organizationVO.getOrganizationUrl());
			if (file != null) {
				saveOrUpdateApplicationLogo(file, updateOrganization);
			}
			updateOrganization.setThemeId(organizationVO.getThemeId());

			organizationRepository.save(updateOrganization);
			return ResponseStringVO.builder().response("Your Organization Updated Successfully").build();
		}
		return null;
	}

	private void saveOrUpdateApplicationLogo(List<MultipartFile> files, Organization organization) throws IOException {
		for (MultipartFile file : files) {
			try (InputStream inputStream = file.getInputStream()) {
				String imageKey = new StringBuilder("organization-profile/").append(organization.getId().toString())
						.append(LocalTime.now()).toString();
				fileManagerService.uploadFileForOrganization(imageKey, file.getInputStream(), file.getSize(),
						organization.getTenantId());

				String originalFilename = file.getOriginalFilename();
				if (originalFilename != null && originalFilename.contains("uploadLogo")) {
					organization.setLogo(imageKey);
					Application application = applicationService.getApplication();
					application.setLogo(imageKey);
					applicationRepository.save(application);
				} else if (originalFilename != null && originalFilename.contains("uploadBackgroudImage")) {
					organization.setBackgroundImage(imageKey);
				}
				organizationRepository.save(organization);
			}
		}
	}

	private String trim(String value) {
		return StringUtils.trimToEmpty(value).toLowerCase();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public Customers getCustomer(CustomersVO customerVo) {
		if (!StringUtils.equalsIgnoreCase(customerVo.getType(), "userUpdate")) {
			return customersRepository.findByIdAndActiveFlagIgnoreCase(customerVo.getId(), YoroappsConstants.YES);
		} else {
			return customersRepository.findBySubdomainNameIgnoreCaseAndActiveFlagIgnoreCase(
					customerVo.getSubdomainName(), YoroappsConstants.YES);
		}
	}

}
