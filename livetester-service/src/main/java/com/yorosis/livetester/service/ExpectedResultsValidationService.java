package com.yorosis.livetester.service;

import static com.yorosis.livetester.constants.Constants.COMPLETED;
import static com.yorosis.livetester.constants.Constants.EDI_SUBMITTED;
import static com.yorosis.livetester.constants.Constants.FAIL;
import static com.yorosis.livetester.constants.Constants.MULTI;
import static com.yorosis.livetester.constants.Constants.PASS;
import static com.yorosis.livetester.constants.Constants.PCN;
import static com.yorosis.livetester.constants.Constants.SYSTEM;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Base64;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.transaction.Transactional;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yorosis.livetester.entities.Batch;
import com.yorosis.livetester.entities.BatchTestcases;
import com.yorosis.livetester.entities.BatchTestcasesResult;
import com.yorosis.livetester.entities.ElementsConfiguration;
import com.yorosis.livetester.entities.Environment;
import com.yorosis.livetester.repo.BatchRepository;
import com.yorosis.livetester.repo.BatchTestcaseRepository;
import com.yorosis.livetester.repo.BatchTestcaseResultRepository;

@Service
public class ExpectedResultsValidationService {

	@Autowired
	private BatchRepository batchRepository;

	@Autowired
	private BatchTestcaseRepository batchTestcaseRepository;

	@Autowired
	private BatchTestcaseResultRepository batchTestcaseResultRepository;

	@Autowired
	private EncryptionService encryptionService;

	private String getDecodedString(String value) {
		return encryptionService.decrypt(value);
	}

	// @Scheduled(fixedDelay = 120000)
	@Transactional
	public void executedInAnInterval() throws SQLException {
		List<Batch> list = batchRepository.findByStatus(EDI_SUBMITTED);

		for (Batch batch : list) {
			Environment environment = batch.getEnvironment();
			environment.setPassword(getDecodedString(environment.getPassword()));
			environment.setDbPassword(getDecodedString(environment.getDbPassword()));

			Set<BatchTestcases> batchTestcases = batch.getBatchTestcases();

			int completedCount = 0;

			String url = getUrl(environment);
			try (Connection conn = DriverManager.getConnection(url, environment.getDbUsername(), environment.getDbPassword());
					Statement stmt = conn.createStatement();) {
				for (BatchTestcases batchTestcase : batchTestcases) {
					if (StringUtils.equalsAnyIgnoreCase(batchTestcase.getStatus(), COMPLETED, PASS, FAIL)) {
						completedCount++;
						continue;
					}

					if (isCompleted(stmt, batchTestcase, environment)) {
						// update tcn/icn
						udpateTCN(stmt, batchTestcase, environment);

						boolean updateActualResults = updateActualResults(stmt, batchTestcase.getBatchTestcasesResult(), batchTestcase.getPcn());
						if (updateActualResults) {
							batchTestcase.setStatus(COMPLETED);
							batchTestcase.setUpdatedBy(SYSTEM);
							batchTestcase.setUpdatedDate(new Timestamp(System.currentTimeMillis()));
							batchTestcaseRepository.save(batchTestcase);
							completedCount++;
						}
					}
				}
			}
			if (completedCount == batchTestcases.size()) {
				batch.setStatus(COMPLETED);
				batch.setUpdatedBy(SYSTEM);
				batch.setUpdatedDate(new Timestamp(System.currentTimeMillis()));
				batchRepository.save(batch);
			}
		}
	}

	private boolean isCompleted(Statement stmt, BatchTestcases batchTestcase, Environment environment) throws SQLException {
		try (ResultSet rs = stmt.executeQuery(environment.getCompletionQuery().replace(PCN, batchTestcase.getPcn()))) {
			return rs.next();
		}
	}

	private void udpateTCN(Statement stmt, BatchTestcases batchTestcase, Environment environment) throws SQLException {
		if (StringUtils.isBlank(batchTestcase.getTcn())) {
			try (ResultSet rs = stmt.executeQuery(environment.getTcnQuery().replace(PCN, batchTestcase.getPcn()))) {
				if (rs.next()) {
					batchTestcase.setTcn(rs.getString(1));
					batchTestcase.setUpdatedBy(SYSTEM);
					batchTestcase.setUpdatedDate(new Timestamp(System.currentTimeMillis()));
					batchTestcaseRepository.save(batchTestcase);
				}
			}
		}
	}

	private boolean updateActualResults(Statement stmt, Set<BatchTestcasesResult> batchTestcasesResultList, String pcn) throws SQLException {
		SimpleDateFormat format = new SimpleDateFormat("MM/dd/yyyy");
		boolean resultsDerived = false;

		for (BatchTestcasesResult batchTestcasesResult : batchTestcasesResultList) {
			ElementsConfiguration elementsConfiguration = batchTestcasesResult.getElementsConfiguration();

			String[] matchQuery = { elementsConfiguration.getMatchQuery(), elementsConfiguration.getFallbackQuery1(),
					elementsConfiguration.getFallbackQuery2() };
			int queryIndex = 0;

			while (StringUtils.equalsIgnoreCase("submitted", batchTestcasesResult.getStatus()) && queryIndex < matchQuery.length) {
				boolean isResultFound = false;
				try (ResultSet rs = stmt.executeQuery(matchQuery[queryIndex].replace(PCN, pcn))) {
					String value = getActualValue(rs, elementsConfiguration.getFieldType(), format);
					isResultFound = StringUtils.isNotBlank(value);

					if (isResultFound) {
						String status = getStatus(value, elementsConfiguration.getFieldType(), batchTestcasesResult.getExpectedValue());
						if (StringUtils.isNotBlank(status)) {
							resultsDerived = true;
							batchTestcasesResult.setActualValue(value);
							batchTestcasesResult.setStatus(status);
							batchTestcasesResult.setUpdatedBy(SYSTEM);
							batchTestcasesResult.setUpdatedDate(new Timestamp(System.currentTimeMillis()));
							batchTestcaseResultRepository.save(batchTestcasesResult);
							queryIndex = matchQuery.length + 1;
						}
					}
				}
				queryIndex++;

				if (isResultFound || queryIndex >= matchQuery.length || StringUtils.isBlank(matchQuery[queryIndex])) {
					break;
				}
			}
		}

		return resultsDerived;
	}

	private String getActualValue(ResultSet rs, String fieldType, SimpleDateFormat format) throws SQLException {
		String value = "";

		while (rs.next()) {
			value = getValue(rs, value, fieldType, format);

			if (!StringUtils.equalsIgnoreCase(MULTI, fieldType)) {
				break;
			}
		}

		return value;
	}

	private String getStatus(String value, String fieldType, String expectedValue) {
		String status = null;

		if (StringUtils.isNotBlank(value)) {
			if (StringUtils.equalsIgnoreCase(fieldType, "number")) {
				if (Double.parseDouble(expectedValue) == Double.parseDouble(value)) {
					status = PASS;
				} else {
					status = FAIL;
				}
			} else if (StringUtils.equalsIgnoreCase(fieldType, MULTI)) {
				Set<String> expectedValuesSet = new HashSet<>(Arrays.asList(expectedValue.split(",")));
				Set<String> actualValuesSet = new HashSet<>(Arrays.asList(value.split(",")));

				expectedValuesSet.removeAll(actualValuesSet);
				if (expectedValuesSet.isEmpty()) {
					status = PASS;
				} else {
					status = FAIL;
				}
			} else if (StringUtils.equalsIgnoreCase(value, expectedValue)) {
				status = PASS;
			} else {
				status = FAIL;
			}
		}

		return status;
	}

	private String getValue(ResultSet rs, String value, String fieldType, SimpleDateFormat format) throws SQLException {
		switch (fieldType) {
		case "string":
			value = rs.getString(1);
			break;

		case "number":
			double numValue = rs.getDouble(1);
			value = Double.toString(numValue);
			break;

		case "date":
			Date date = rs.getDate(1);
			value = format.format(date);
			break;

		case MULTI:
			if (StringUtils.isNotBlank(value)) {
				value += ",";
			}

			value += rs.getString(1);
			break;

		default:
			value = rs.getString(1);

		}

		return value;
	}

	private String getUrl(Environment environment) {
		StringBuilder builder = new StringBuilder();
		String divide = "/";

		if (StringUtils.equalsIgnoreCase(environment.getDbType(), "oracle")) {
			builder.append("jdbc:oracle:thin:@");
			divide = ":";
		} else if (StringUtils.equalsIgnoreCase(environment.getDbType(), "postgres")) {
			builder.append("jdbc:postgresql://");
			divide = "/";
		} else if (StringUtils.equalsIgnoreCase(environment.getDbType(), "sqlserver")) {
			builder.append("jdbc:sqlserver://");
			divide = ";databaseName=";
		}

		builder.append(environment.getDbHost()).append(":").append(environment.getPort());
		builder.append(divide).append(environment.getDbName());

		return builder.toString();
	}
}
