package com.yorosis.taskboard.services;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yorosis.taskboard.models.AppIntegrationVO;
import com.yorosis.taskboard.models.EventAutomationCategoryVO;
import com.yorosis.taskboard.models.EventAutomationConfigurationVO;
import com.yorosis.taskboard.models.OrganizationIntegratedAppsVO;
import com.yorosis.taskboard.models.ResponseStringVO;
import com.yorosis.taskboard.models.TaskBoardTaskSummaryVo;
import com.yorosis.taskboard.models.TaskboardTaskVO;
import com.yorosis.taskboard.repository.CustomersRepository;
import com.yorosis.taskboard.taskboard.entities.Customers;
import com.yorosis.yoroapps.grid.vo.PaginationVO;
import com.yorosis.yoroapps.vo.LicenseVO;
import com.yorosis.yoroapps.vo.WorkspaceDetailsVo;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.general.exception.YorosisException;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class ProxyYoroflowSchemaService {

	@Autowired
	private AppIntegrationService appIntegrationService;

	@Autowired
	private EventAutomationService eventAutomationService;

	@Autowired
	private CustomersRepository customersRepository;

	@Autowired
	private CustomerService customerService;

	@Autowired
	private TaskboardApplicationService taskboardApplicationService;

	@Autowired
	private OrganizationIntegratedAppsService organizationIntegratedAppsService;

	@Autowired
	private LicenseService licenseService;

	@Autowired
	private TaskboardService taskboardService;

	@Autowired
	private WorkspaceService workspaceService;

	public List<AppIntegrationVO> getAllApplications() {
		YorosisContext context = setYoroflowContext();
		try {
			return appIntegrationService.getAllApplications();
		} finally {
			clearYoroflowContext(context);
		}
	}

	public List<EventAutomationConfigurationVO> getAutomationConfigurationList(UUID taskboardId) {
		List<String> applicationsList = eventAutomationService.getApplicationsList(taskboardId);
		YorosisContext context = setYoroflowContext();
		try {
			return eventAutomationService.getAutomationConfigurationList(applicationsList);
		} finally {
			clearYoroflowContext(context);
		}
	}

	public List<EventAutomationCategoryVO> getAutomationsByCategory(UUID taskboardId) {
		List<String> applicationsList = eventAutomationService.getApplicationsList(taskboardId);
		YorosisContext context = setYoroflowContext();
		try {
			return eventAutomationService.getAutomationsByCategory(applicationsList);
		} finally {
			clearYoroflowContext(context);
		}
	}

	public void setUpYoroContext(final String tenantId, final String authorizationCode, final UUID appId, final UUID taskboardId) throws YorosisException {
		YorosisContext context = setYoroflowContext();
		Customers customer = customerService.getCustomerByTenant(tenantId);
		if (customer != null) {
			context = YorosisContext.builder().tenantId(customer.getTenantId()).userName(customer.getCreatedBy()).build();
			YorosisContext.set(context);
			taskboardApplicationService.taskboardAppIntegration(authorizationCode, appId, taskboardId);
		}
	}

	public List<OrganizationIntegratedAppsVO> getApps() {
		YorosisContext context = setYoroflowContext();
		try {
			return organizationIntegratedAppsService.getApplications();
		} finally {
			clearYoroflowContext(context);
		}
	}

	public LicenseVO isAllowed(String currentTenantId, String category, String featureName) {
		YorosisContext context = setYoroflowContext();
		try {
			return licenseService.isAllowed(currentTenantId, category, featureName);
		} finally {
			clearYoroflowContext(context);
		}
	}

	public TaskboardTaskVO getTaskboardTask(String header, String taskboardKey, String taskId) throws IOException {
		YorosisContext context = setYoroflowContextWithDomain(header);
		try {
			return taskboardService.getTaskboardTask(taskboardKey, taskId);
		} finally {
			clearYoroflowContext(context);
		}
	}

	private YorosisContext setYoroflowContextWithDomain(String header) {
		YorosisContext context = YorosisContext.get();
		if (YorosisContext.get() == null) {
			String[] arrOfStr = header.split("//", 2);
			String[] url = arrOfStr[1].split("[.]", 2);
			String domain = url[0].toString();
			Customers customer = customersRepository.findBySubdomainNameIgnoreCaseAndActiveFlagIgnoreCase(domain, YorosisConstants.YES);
			YorosisContext.set(YorosisContext.builder().tenantId(customer.getTenantId()).build());
		}
		return context;
	}

	public WorkspaceDetailsVo getAllWorkspaceNameList(String tenantId) {
		YorosisContext context = YorosisContext.get();
		YorosisContext.set(YorosisContext.builder().tenantId(tenantId).build());
		try {
			return workspaceService.getAllNamesListForWorkspace();
		} finally {
			clearYoroflowContext(context);
		}
	}

	public List<TaskBoardTaskSummaryVo> getAllTaskboardNameList(UUID workspaceId, PaginationVO vo, String tenantId) {
		YorosisContext context = setYoroflowContext();
		Customers customer = customerService.getCustomerByTenant(tenantId);
		if (customer != null) {
			YorosisContext.set(YorosisContext.builder().tenantId(customer.getTenantId()).build());
			try {
				return workspaceService.getAllTaskboardNameList(workspaceId, vo);
			} finally {
				clearYoroflowContext(context);
			}
		}
		return null;
	}

	public ResponseStringVO getOauthUrl() {

		YorosisContext context = setYoroflowContext();
		try {
			return organizationIntegratedAppsService.getOauthUrl();
		} finally {
			clearYoroflowContext(context);
		}
	}

	private YorosisContext setYoroflowContext() {
		YorosisContext context = YorosisContext.get();
		YorosisContext.set(YorosisContext.builder().tenantId(YorosisConstants.DEFAULT_SCHEMA).build());
		return context;
	}

	private void clearYoroflowContext(YorosisContext oldContext) {
		YorosisContext.clear();
		YorosisContext.set(oldContext);
	}
}
