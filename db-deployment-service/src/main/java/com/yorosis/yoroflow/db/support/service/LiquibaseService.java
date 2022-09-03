package com.yorosis.yoroflow.db.support.service;

import java.util.List;

import javax.sql.DataSource;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroflow.db.support.entities.Customers;
import com.yorosis.yoroflow.db.support.models.CreateCustomerVO;

import liquibase.Liquibase;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class LiquibaseService {
	@Value("${db.changelog.base-version.schema}")
	private String customerSchemaFile;

	@Value("${db.changelog.base-version.table}")
	private String customerTablesFile;

	@Value("${db.changelog.base-version.data}")
	private String customerTableData;

	@Value("${db.changelog.rel.script}")
	private String releaseScripts;

	@Value("${db.changelog.yoroflow.schema}")
	private String yoroflowSchemaName;

	@Value("${db.changelog.yoroflow.script}")
	private String yoroflowScripts;

	private static final String TENANT_ID = "tenantId";
	private static final String USER_ID = "customerUserId";
	private static final String SCHEMA_NAME = "customerId";
	private static final String DEFAULT_SCHEMA = "defaultSchema";

	@Autowired
	private DataSource dataSource;

	@Autowired
	private CustomerService customerService;

	@Transactional
	public void createNewCustomer(CreateCustomerVO createCustomer) throws Exception {
		createNewCustomerSchema(createCustomer);
		createNewCustomerTable(createCustomer);
		createNewCustomerData(createCustomer);
		executeScriptsForRelease(createCustomer.getCustomerId(), createCustomer.getTenantId(), createCustomer.getCustomerUserId());
	}

	@Transactional
	public void executeReleaseScriptsForAllCustomers() throws Exception {
		List<Customers> lstCustomers = customerService.getAllCustomers();

		if (!lstCustomers.isEmpty()) {
			for (Customers customer : lstCustomers) {
				executeScriptsForRelease(customer.getTenantId(), customer.getTenantId(), customer.getTenantId());
			}
		}
		
		executeReleaseScriptsForYoroflow();
	}

	private void executeReleaseScriptsForYoroflow() throws Exception {
		executeUsingLiquibase(yoroflowSchemaName, yoroflowScripts, yoroflowSchemaName, null, false);
	}

	private void createNewCustomerSchema(CreateCustomerVO createCustomer) throws Exception {
		executeUsingLiquibase(createCustomer.getCustomerId(), customerSchemaFile, createCustomer.getTenantId(), createCustomer.getCustomerUserId(), true);
	}

	private void createNewCustomerTable(CreateCustomerVO createCustomer) throws Exception {
		executeUsingLiquibase(createCustomer.getCustomerId(), customerTablesFile, createCustomer.getTenantId(), createCustomer.getCustomerUserId(), false);
	}

	private void createNewCustomerData(CreateCustomerVO createCustomer) throws Exception {
		executeUsingLiquibase(createCustomer.getCustomerId(), customerTableData, createCustomer.getTenantId(), createCustomer.getCustomerUserId(), false);
	}

	@Transactional
	public void executeScriptsForRelease(String schemaName, String tenantId, String userId) throws Exception {
		executeUsingLiquibase(schemaName, releaseScripts, tenantId, userId, false);
	}

	private void executeUsingLiquibase(String runAgainstSchemaName, String liquibaseFile, String tenantId, String userId, boolean isNewCustomer)
			throws Exception {
		log.info("Executing for customer: {}, liquibase file: {}, tenant id: {}, user id: {}, isCustomer: {}", runAgainstSchemaName, liquibaseFile, tenantId,
				userId, isNewCustomer);

		try (Liquibase liquibase = new Liquibase(liquibaseFile, new ClassLoaderResourceAccessor(), new JdbcConnection(dataSource.getConnection()))) {
			String defaultSchema = runAgainstSchemaName;
			if (isNewCustomer) {
				defaultSchema = yoroflowSchemaName;
			}
			log.info("Default schema: {}", defaultSchema);

			liquibase.getDatabase().setDefaultSchemaName(defaultSchema);
			liquibase.setChangeLogParameter(DEFAULT_SCHEMA, defaultSchema);

			liquibase.setChangeLogParameter(SCHEMA_NAME, runAgainstSchemaName);

			if (StringUtils.isNotBlank(tenantId)) {
				liquibase.setChangeLogParameter(TENANT_ID, tenantId);
			}

			if (StringUtils.isNotBlank(userId)) {
				liquibase.setChangeLogParameter(USER_ID, userId);
			} else {
				liquibase.setChangeLogParameter(USER_ID, runAgainstSchemaName);
			}

			liquibase.update("");
		}
	}

}
