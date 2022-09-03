package com.yorosis.yoroflow.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.AppIntegrationVO;
import com.yorosis.yoroflow.repository.AppIntegrationRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class AppIntegrationService {
	@Autowired
	private AppIntegrationRepository applicationIntegrationRepository;

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public List<AppIntegrationVO> getAllApplications() {
		List<AppIntegrationVO> applications = applicationIntegrationRepository
				.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(YorosisContext.get().getTenantId(),
						YorosisConstants.YES)
				.stream().map(app -> AppIntegrationVO.builder().applicationName(app.getAppName())
						.description(app.getDescription()).build())
				.collect(Collectors.toList());
		return applications;
	}
}
