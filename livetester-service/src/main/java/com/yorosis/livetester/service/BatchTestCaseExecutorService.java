package com.yorosis.livetester.service;

import static com.yorosis.livetester.constants.Constants.EDI_SUBMISSION_FAILURE;
import static com.yorosis.livetester.constants.Constants.EDI_SUBMITTED;

import java.io.File;
import java.io.FileWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.exception.ExceptionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import com.yorosis.livetester.entities.Batch;
import com.yorosis.livetester.entities.BatchTestcases;
import com.yorosis.livetester.entities.Environment;
import com.yorosis.livetester.file.transfer.FileTransfer;
import com.yorosis.livetester.file.transfer.model.FileDestination;
import com.yorosis.livetester.repo.BatchRepository;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class BatchTestCaseExecutorService {

	@Autowired
	private BatchRepository batchRepository;

	@Autowired
	private EDIFileGenerationService ediFileGenerationService;

	@Autowired
	@Qualifier("sftp")
	private FileTransfer sftpFileTransfer;

	@Autowired
	@Qualifier("scp")
	private FileTransfer scpFileTransfer;

	@Autowired
	private EncryptionService encryptionService;
	
	@Async
	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void executeBatch(Batch batch) {
		try {
			batch = batchRepository.getOne(batch.getId());
			
			if (CollectionUtils.isEmpty(batch.getBatchTestcases())) {
				throw new IllegalArgumentException("No test cases present in the batch");
			}

			log.warn("Started to process {}", batch.getBatchName());

			List<String> listSourceContents = new ArrayList<>();
			Set<BatchTestcases> batchTestCaseSet = batch.getBatchTestcases();
			for (BatchTestcases batchTestcase : batchTestCaseSet) {
				listSourceContents.add(getEDIFile(batchTestcase));
			}

			FileDestination fileDestination = getDestinationForBatch(batch);
			if (fileDestination != null) {
				if (StringUtils.equalsIgnoreCase(fileDestination.getProtocol(), "SFTP")) {
					sftpFileTransfer.copyStringToRemoteServer(listSourceContents, fileDestination);
				} else if (StringUtils.equalsIgnoreCase(fileDestination.getProtocol(), "SCP")) {
					scpFileTransfer.copyStringToRemoteServer(listSourceContents, fileDestination);
				} else if (StringUtils.equalsIgnoreCase(fileDestination.getProtocol(), "NFS")) {
					try (FileWriter writer = new FileWriter(new File(fileDestination.getRemoteFolder(), fileDestination.getRemoteFileName()))) {
						IOUtils.writeLines(listSourceContents, null, writer);
					}
				} else {
					throw new IllegalArgumentException("Invalid file destination protocol: " + fileDestination.getProtocol());
				}
			}
			batch.setStatus(EDI_SUBMITTED);
		} catch (Exception e) {
			log.error("Unexpected error", e);
			batch.setStatus(EDI_SUBMISSION_FAILURE);
			batch.setErrorDesc(StringUtils.substring(ExceptionUtils.getStackTrace(e), 0, 500));
		}

		batchRepository.save(batch);
	}

	private String getEDIFile(BatchTestcases batchTestcase) throws Exception {
		ediFileGenerationService.generateEDI(batchTestcase);
		return batchTestcase.getGeneratedEdi();
	}

	private String getDecodedString(String value) {
		return encryptionService.decrypt(value);
	}
	
	private FileDestination getDestinationForBatch(Batch batch) {
		if (batch.getEnvironment() != null) {
			Environment envVO = batch.getEnvironment();
			envVO.setPassword(getDecodedString(envVO.getPassword()));
			envVO.setDbPassword(getDecodedString(envVO.getDbPassword()));
			
			validatateEnvInfo(envVO);
			FileDestination.FileDestinationBuilder fileDeBuilder = FileDestination.builder().remoteHost(envVO.getHost()).remoteFolder(envVO.getTargetFolder())
					.remotePort(envVO.getPort()).protocol(envVO.getProtocol()).userName(envVO.getUsername());

			if (StringUtils.equalsIgnoreCase(envVO.getLogonType(), "Pem File")) {
				fileDeBuilder.privateKeyFileText(envVO.getPemText());
			} else if (StringUtils.equalsIgnoreCase(envVO.getLogonType(), "Password")) {
				fileDeBuilder.pwd(envVO.getPassword());
			} else if (!StringUtils.equalsIgnoreCase(envVO.getLogonType(), "None")) {
				throw new IllegalArgumentException("Logon Type must be PEM or Password");
			}

			StringBuilder strBuilder = new StringBuilder().append(batch.getBatchName()).append("_").append(Long.toString(batch.getId())).append(".dat");
			fileDeBuilder.remoteFileName(strBuilder.toString());

			return fileDeBuilder.build();
		}

		return null;
	}

	private void validatateEnvInfo(Environment envVO) {
		if (StringUtils.equalsIgnoreCase(envVO.getLogonType(), "Pem File") && StringUtils.isBlank(envVO.getPemText())) {
			throw new IllegalArgumentException("PEM Text is mandatory for Logon Type - PEM");
		}

		if (StringUtils.equalsIgnoreCase(envVO.getLogonType(), "Password") && StringUtils.isBlank(envVO.getPassword())) {
			// TODO: Fix it
			//throw new IllegalArgumentException("Password is mandatory for Logon Type - Password");
		}
	}

}
