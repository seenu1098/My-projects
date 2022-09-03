package com.yorosis.yoroflow.rendering.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.sql.Timestamp;

import javax.persistence.EntityManager;
import javax.persistence.Query;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroapps.entities.Users;
import com.yorosis.yoroapps.vo.CustomersVO;
import com.yorosis.yoroflow.rendering.constants.YoroappsConstants;
import com.yorosis.yoroflow.rendering.repository.UsersRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ProvisioningService {
	@Value("classpath:sql/ddl.sql")
	private Resource ddlResourceFile;

	@Value("classpath:sql/dml.sql")
	private Resource dmlResourceFile;

	@Autowired
	private EntityManager entityManager;

	@Autowired
	private BCryptPasswordEncoder passwordEncoder;

	@Autowired
	private UsersRepository usersRepository;

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void provisionNewCustomer(String tenantId) throws IOException {
		if (StringUtils.isBlank(tenantId)) {
			throw new IllegalArgumentException("Invalid Customer Id. Customer Id cannot be empty");
		}

		tenantId = tenantId.trim().toLowerCase();
		executeQueries(ddlResourceFile, tenantId);
		executeQueries(dmlResourceFile, tenantId);
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void setupFirstUser(CustomersVO customerVo) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());

		Users user = Users.builder().emailId(customerVo.getUserEmailId()).firstName(customerVo.getFirstName()).lastName(customerVo.getLastName())
				.tenantId(YorosisContext.get().getTenantId()).userName(customerVo.getUserEmailId())
				.userPassword(passwordEncoder.encode(customerVo.getPassword())).createdBy(YorosisContext.get().getUserName()).createdOn(timestamp)
				.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp).activeFlag(YoroappsConstants.YES).build();
		usersRepository.save(user);
	}

	private void executeQueries(Resource resourceFile, String tenantId) throws IOException {
		try (BufferedReader reader = new BufferedReader(new InputStreamReader(resourceFile.getInputStream()))) {
			String line = null;
			while ((line = reader.readLine()) != null) {
				if (StringUtils.isBlank(line)) {
					continue;
				}
				line = line.replace(YoroappsConstants.DEFAULT_SCHEMA, tenantId);

				Query nativeQuery = entityManager.createNativeQuery(line);
				log.info("Now executing: {}", line);
				nativeQuery.executeUpdate();
			}
		}
	}
}
