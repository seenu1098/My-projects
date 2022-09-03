package com.yorosis.livetester.service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.livetester.entities.Environment;
import com.yorosis.livetester.repo.EnvironmentRepository;
import com.yorosis.livetester.security.YorosisContext;
import com.yorosis.livetester.vo.EnvironmentListVO;
import com.yorosis.livetester.vo.EnvironmentVO;
import com.yorosis.livetester.vo.ResponseVO;

@Service
public class EnvironmentService {

	@Autowired
	private EnvironmentRepository environmentRepository;

	@Autowired
	private EncryptionService encryptionService;

	private String getEncodedString(String value) {
		return encryptionService.encrypt(value);
	}

	private String getDecodedString(String value) {
		return encryptionService.decrypt(value);
	}
	
	public Environment constructVOToDTO(EnvironmentVO vo) {
		Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());
		String user = YorosisContext.get().getUserName();

		return Environment.builder().environmentName(vo.getEnvironmentName()).protocol(vo.getProtocol()).host(vo.getHost()).port(vo.getPort()).logonType(vo.getLogonType())
				.username(vo.getUserName()).password(getEncodedString(vo.getPassword())).pemText(getEncodedString(vo.getPemText())).dbType(vo.getDbType()).dbHost(vo.getDbHost()).dbPort(vo.getDbPort())
				.dbName(vo.getDbName()).dbUsername(vo.getDbUsername()).dbPassword(getEncodedString(vo.getDbPassword())).targetFolder(vo.getTargetFolder()).schemeName(vo.getSchemaName())
				.createdBy(user).completionQuery(vo.getCompletionQuery()).tcnQuery(vo.getTcnQuery()).createdDate(currentTimestamp).updatedBy(user).updatedDate(currentTimestamp)
				.build();
	}

	public EnvironmentVO constructDTOToVO(Environment environment) {
		return EnvironmentVO.builder().environmentName(environment.getEnvironmentName()).protocol(environment.getProtocol()).host(environment.getHost()).port(environment.getPort())
				.logonType(environment.getLogonType()).userName(environment.getUsername()).pemText(getDecodedString(environment.getPemText())).dbType(environment.getDbType())
				.dbHost(environment.getDbHost()).dbPort(environment.getDbPort()).dbName(environment.getDbName()).dbUsername(environment.getDbUsername())
				.targetFolder(environment.getTargetFolder()).completionQuery(environment.getCompletionQuery()).schemaName(environment.getSchemeName())
				.environmentId(environment.getId()).tcnQuery(environment.getTcnQuery()).build();
	}

	@Transactional
	public ResponseVO saveEnvironmentData(EnvironmentVO vo) {
		String message = null;
		Environment environment = environmentRepository.findByEnvironmentNameIgnoreCase(vo.getEnvironmentName());
		int environmentNameCount = environmentRepository.getEnvironmentNameCount(vo.getEnvironmentName());

		if (vo.getEnvironmentId() == null) {
			if (environmentNameCount == 0) {
				Environment environmentData = constructVOToDTO(vo);
				environmentRepository.save(environmentData);
				message = "Environment created successfully";
			} else {
				message = "Environment Name Already Exist";
			}

		} else {
			environment.setTargetFolder(vo.getTargetFolder());
			environment.setProtocol(vo.getProtocol());
			environment.setHost(vo.getHost());
			environment.setPort(vo.getPort());
			environment.setLogonType(vo.getLogonType());
			environment.setUsername(vo.getUserName());
			environment.setPassword(getEncodedString(vo.getPassword()));
			environment.setPemText(vo.getPemText());
			environment.setDbType(vo.getDbType());
			environment.setDbHost(vo.getDbHost());
			environment.setDbPort(vo.getDbPort());
			environment.setDbUsername(vo.getDbUsername());
			environment.setDbPassword(getEncodedString(vo.getDbPassword()));
			environment.setDbName(vo.getDbName());
			environment.setSchemeName(vo.getSchemaName());
			environment.setUpdatedBy(YorosisContext.get().getUserName());
			environment.setUpdatedDate(new Timestamp(System.currentTimeMillis()));
			environment.setCompletionQuery(vo.getCompletionQuery());
			environment.setTcnQuery(vo.getTcnQuery());

			environmentRepository.save(environment);
			message = "Environment updated successfully";
		}

		return ResponseVO.builder().response(message).build();
	}

	@Transactional
	public EnvironmentVO getEnvironmentInfo(long id) {
		Environment environmentData = environmentRepository.findById(id);
		return constructDTOToVO(environmentData);
	}

	@Transactional
	public List<EnvironmentListVO> getEnvironmentList() {
		List<Environment> environmentNameList = environmentRepository.findAllByOrderByIdDesc();

		List<EnvironmentListVO> responseList = new ArrayList<>();
		for (Environment environment : environmentNameList) {
			responseList.add(EnvironmentListVO.builder().id(environment.getId()).environmentNames(environment.getEnvironmentName()).build());
		}

		return responseList;
	}

	@Transactional
	public ResponseVO deleteEnvironmentInfo(Long id) {
		String message = "Environment have some batches";
		int deleted = 0;

		if (environmentRepository.getOne(id).getBatch().isEmpty()) {
			environmentRepository.deleteById(id);
			message = "Environment deleted Successfully";
			deleted = 1;
		}

		return ResponseVO.builder().response(message).isDeleted(deleted).build();
	}
}
