package com.yorosis.yoroflow.creation.provisioning.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import javax.persistence.EntityManager;
import javax.persistence.Query;

import org.apache.commons.lang3.StringUtils;
import org.hibernate.jpa.TypedParameterValue;
import org.hibernate.type.StandardBasicTypes;
import org.hibernate.type.StringType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.yorosis.yoroapps.entities.Customers;
import com.yorosis.yoroapps.entities.Roles;
import com.yorosis.yoroapps.entities.UserAssociateRoles;
import com.yorosis.yoroapps.entities.UserGroup;
import com.yorosis.yoroapps.entities.Users;
import com.yorosis.yoroapps.entities.YoroGroupsUsers;
import com.yorosis.yoroapps.vo.CustomersVO;
import com.yorosis.yoroapps.vo.DataObject;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.exception.YoroappsException;
import com.yorosis.yoroflow.creation.repository.UserAssociateRolesRepository;
import com.yorosis.yoroflow.creation.repository.UserRolesRepository;
import com.yorosis.yoroflow.creation.repository.UsersRepository;
import com.yorosis.yoroflow.creation.repository.YoroGroupsRepository;
import com.yorosis.yoroflow.creation.repository.YoroGroupsUsersRepository;
import com.yorosis.yoroflow.creation.service.FeignClientService;
import com.yorosis.yoroflow.creation.service.UserService;
import com.yorosis.yoroflow.creation.table.vo.CreateCustomerVO;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ProvisioningService {
	@Value("classpath:sql/ddl.sql")
	private Resource ddlResourceFile;

	@Value("classpath:sql/dml.sql")
	private Resource dmlResourceFile;

	@Value("classpath:sql/newUserDml.sql")
	private Resource newUserDmlResourceFile;

	@Value("${spring.datasource.username}")
	private String databaseUserName;

	@Autowired
	private EntityManager entityManager;

	@Autowired
	private BCryptPasswordEncoder bcryptEncoder;

	@Autowired
	private UsersRepository usersRepository;

	@Autowired
	private FeignClientService clientService;

	@Value("${liquibase.db.deployment.enable}")
	private boolean useLiquibase;

	@Autowired
	private UserAssociateRolesRepository userAssociateRolesRepository;

	@Autowired
	private UserRolesRepository userRolesRepository;

	@Autowired
	private UserService userService;

	@Autowired
	private YoroGroupsUsersRepository yoroGroupsUsersRepository;

	@Autowired
	private YoroGroupsRepository yoroGroupsRepository;

	private static final String ACCOUNT_OWNER_ROLE_ID = "e9b0ca86-4335-413a-9330-6e319af63e66";

	private static final String DEFAULT_USER_ID = "99b2568e-9c90-47f5-b3ad-ae39d130a86f";
	private static final String DEFAULT_GROUP_ID = "040e0ad6-e4c2-475f-a8d2-9e4c2505ae5b";
	private static final String PRIMARY_KEY = "85c17199-286e-4da9-b1e8-e8835cac616b";
	private static final String DEFAULT_WORKSPACE = "6a6ad5ca-5a59-4165-84fc-675c5c503fdf";
	private static final String APP_LOGO = "app_logo";
	private static final String ORGANIZATION_COLUMNS = "id , allowed_domain_names, subdomain_name, organization_url , org_name , logo,"
			+ "background_image, theme_id, tenant_id, created_by,"
			+ " created_on, modified_by, modified_on, active_flag";

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void provisionNewCustomer(String tenantId) throws IOException {
		if (StringUtils.isBlank(tenantId)) {
			throw new IllegalArgumentException("Invalid Customer Id. Customer Id cannot be empty");
		}

		tenantId = tenantId.trim().toLowerCase();
		if (useLiquibase) {
			provisionLiquibaseNewCustomer(tenantId, tenantId);
		} else {
			executeQueries(ddlResourceFile, tenantId, null, null, null);
		}
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void provisionLiquibaseNewCustomer(String tenantId, String customerUserId) throws IOException {
		if (StringUtils.isBlank(tenantId)) {
			throw new IllegalArgumentException("Invalid Customer Id. Customer Id cannot be empty");
		}
		tenantId = tenantId.trim().toLowerCase();
		CreateCustomerVO customerVO = CreateCustomerVO.builder().customerId(tenantId).tenantId(tenantId)
				.customerUserId(customerUserId).build();
		clientService.provisionNewCustomer(customerVO);
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void insertDefaultValues(String tenantId, UUID userId, UUID groupId, Customers customer) throws IOException {
		if (StringUtils.isBlank(tenantId)) {
			throw new IllegalArgumentException("Invalid Customer Id. Customer Id cannot be empty");
		}

		tenantId = tenantId.trim().toLowerCase();
		if (!useLiquibase && groupId == null) {
			executeQueries(dmlResourceFile, tenantId, userId, groupId, customer);
		}

		if (groupId != null) {
			executeQueries(newUserDmlResourceFile, tenantId, userId, groupId, customer);
		}
	}

	private JsonNode getFontSize() {
		ObjectNode node = JsonNodeFactory.instance.objectNode();
		node.put("fontSize", 12);
		return node;
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public UUID setupFirstUser(CustomersVO customerVo, boolean fromAccount) throws YoroappsException {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		if (fromAccount || userService.isValidPassword(customerVo.getPassword())) {
			String hashedPassword = bcryptEncoder.encode(customerVo.getPassword());

			Users user = Users.builder().emailId(customerVo.getUserEmailId()).firstName(customerVo.getFirstName())
					.lastName(customerVo.getLastName()).tenantId(YorosisContext.get().getTenantId())
					.userName(customerVo.getUserEmailId()).userPassword(hashedPassword)
					.createdBy(YorosisContext.get().getUserName()).createdOn(timestamp)
					.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp).profilePicture(null)
					.activeFlag(YoroappsConstants.YES).contactEmailId(customerVo.getContactEmailId())
					.defaultWorkspace(UUID.fromString(DEFAULT_WORKSPACE)).additionalSettings(getFontSize())
					.color("#1b5e20").defaultLanguage("en").timezone(customerVo.getTimezone()).build();
			user = usersRepository.save(user);
			YoroGroupsUsers userGroup = constructVOTODTO();
			userGroup.setYoroGroups(yoroGroupsRepository.getOne(UUID.fromString(DEFAULT_GROUP_ID)));
			userGroup.setUsers(user);
			yoroGroupsUsersRepository.save(userGroup);
			return user.getUserId();
		} else {
			throw new YoroappsException("Invalid password pattern");
		}
	}

	private YoroGroupsUsers constructVOTODTO() {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return YoroGroupsUsers.builder().createdBy(YorosisContext.get().getUserName()).activeFlag(YorosisConstants.YES)
				.modifiedBy(YorosisContext.get().getUserName()).createdOn(timestamp).modifiedOn(timestamp)
				.tenantId(YorosisContext.get().getTenantId()).build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void addDefaultRole(UUID userId) {
		int userAssociateRolesCount = userAssociateRolesRepository.getUserAssociateRolesBasedOnUserAndRoleId(
				UUID.fromString(ACCOUNT_OWNER_ROLE_ID), userId, YorosisContext.get().getTenantId(),
				YoroappsConstants.YES);
		Users user = usersRepository.findByUserId(userId);
		if (userAssociateRolesCount == 0) {
			Roles userRole = userRolesRepository.findByRoleIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
					UUID.fromString(ACCOUNT_OWNER_ROLE_ID), YorosisContext.get().getTenantId(), YoroappsConstants.YES);
			if (userRole != null) {
				Timestamp timestamp = new Timestamp(System.currentTimeMillis());
				UserAssociateRoles roles = UserAssociateRoles.builder().activeFlag(YoroappsConstants.YES)
						.tenantId(YorosisContext.get().getTenantId()).createdBy(YorosisContext.get().getUserName())
						.createdOn(timestamp).users(user).roles(userRole).modifiedBy(YorosisContext.get().getUserName())
						.modifiedOn(timestamp).build();
				userAssociateRolesRepository.save(roles);
			}
		}
	}

	private void executeQueries(Resource resourceFile, String tenantId, UUID userId, UUID groupId, Customers customer)
			throws IOException {
		try (BufferedReader reader = new BufferedReader(new InputStreamReader(resourceFile.getInputStream()))) {
			String line = null;
			while ((line = reader.readLine()) != null) {
				if (StringUtils.isBlank(line)) {
					continue;
				}

				line = replaceMacrosWithNewValues(line, tenantId, userId, groupId, customer);

				Query nativeQuery = entityManager.createNativeQuery(line);
				log.info("Now executing: {}", line);
				nativeQuery.executeUpdate();
			}
		}
	}

	private String replaceMacrosWithNewValues(String line, String tenantId, UUID userId, UUID groupId,
			Customers customer) {
		line = line.replace(YoroappsConstants.DEFAULT_SCHEMA, tenantId);
		line = line.replace("liveappsuser", databaseUserName);

		if (customer != null) {
			if (StringUtils.isNotBlank(customer.getLogo()) && line.contains(APP_LOGO)) {
				line = line.replace(APP_LOGO, customer.getLogo());
			} else if (StringUtils.isBlank(customer.getLogo()) && line.contains(APP_LOGO)) {
				line = line.replace(APP_LOGO, "");
			}
		}

		if (userId != null && line.contains(DEFAULT_USER_ID)) {
			line = line.replace(DEFAULT_USER_ID, userId.toString());
		}

		if (groupId != null && line.contains(DEFAULT_GROUP_ID)) {
			line = line.replace(DEFAULT_GROUP_ID, groupId.toString());
			line = line.replace(PRIMARY_KEY, UUID.randomUUID().toString());
		}

		return line;
	}

	public void setupOrganization(Customers customer) {
		StringBuilder builder = new StringBuilder();
		StringBuilder values = new StringBuilder();
		List<DataObject> valueList = new ArrayList<>();
		builder.append("insert into ").append(YorosisContext.get().getTenantId()).append(".").append("organization")
				.append("(");
		builder.append(ORGANIZATION_COLUMNS);
		values.append("?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?");

		UUID uuid = UUID.randomUUID();

		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		StringType stringType = StandardBasicTypes.STRING;
		valueList.add(DataObject.builder().type(StandardBasicTypes.UUID_CHAR).value(uuid).build());
		valueList.add(DataObject.builder().type(stringType).value(customer.getAllowedDomainNames()).build());
		valueList.add(DataObject.builder().type(stringType).value(customer.getSubdomainName()).build());
		valueList.add(DataObject.builder().type(stringType).value(customer.getOrganizationUrl()).build());
		valueList.add(DataObject.builder().type(stringType).value(customer.getOrgName()).build());
		valueList.add(DataObject.builder().type(stringType).value(customer.getLogo()).build());
		valueList.add(DataObject.builder().type(stringType).value(customer.getBackgroundImage()).build());
		valueList.add(DataObject.builder().type(stringType).value(customer.getThemeId()).build());
		valueList.add(DataObject.builder().type(stringType).value(YorosisContext.get().getTenantId()).build());
		valueList.add(DataObject.builder().type(stringType).value(YorosisContext.get().getUserName()).build());
		valueList.add(DataObject.builder().type(StandardBasicTypes.TIMESTAMP).value(timestamp).build());
		valueList.add(DataObject.builder().type(stringType).value(YorosisContext.get().getUserName()).build());
		valueList.add(DataObject.builder().type(StandardBasicTypes.TIMESTAMP).value(timestamp).build());
		valueList.add(DataObject.builder().type(stringType).value(YoroappsConstants.YES).build());

		builder.append(") values (").append(values).append(")");
		processDBQuery(builder, valueList);
	}

	private void processDBQuery(StringBuilder query, List<DataObject> valueList) {
		Query nativeQuery = entityManager.createNativeQuery(query.toString());
		int index = 1;
		for (DataObject object : valueList) {
			if (object.getType() == StandardBasicTypes.UUID_CHAR) {
				nativeQuery.setParameter(index, object.getValue());
			} else {
				nativeQuery.setParameter(index, new TypedParameterValue(object.getType(), object.getValue()));
			}

			index++;
		}

		log.info("Now executing: {}", query.toString());
		int executeUpdate = nativeQuery.executeUpdate();
		log.info("Total created/records: {}", executeUpdate);
	}
}