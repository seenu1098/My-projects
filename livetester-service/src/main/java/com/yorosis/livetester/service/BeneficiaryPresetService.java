package com.yorosis.livetester.service;

import java.io.IOException;
import java.sql.Timestamp;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.yorosis.livetester.constants.Constants;
import com.yorosis.livetester.entities.Environment;
import com.yorosis.livetester.entities.EnvironmentPreset;
import com.yorosis.livetester.exception.YorosisException;
import com.yorosis.livetester.grid.services.AbstractGridDataService;
import com.yorosis.livetester.grid.vo.PaginationVO;
import com.yorosis.livetester.grid.vo.TableData;
import com.yorosis.livetester.repo.EnvironmentPresetRepository;
import com.yorosis.livetester.repo.EnvironmentRepository;
import com.yorosis.livetester.security.YorosisContext;
import com.yorosis.livetester.vo.BeneficiaryVO;
import com.yorosis.livetester.vo.EnvironmentPresetVO;
import com.yorosis.livetester.vo.ResponseVO;

@Service
public class BeneficiaryPresetService extends AbstractGridDataService {

	@Autowired
	private EnvironmentPresetRepository environmentPresetRepository;

	@Autowired
	private EnvironmentRepository environmentRepository;

	@PersistenceContext
	private EntityManager em;

	@Transactional
	public ResponseVO saveBeneficiaryPreset(EnvironmentPresetVO vo) throws JsonProcessingException {

		ObjectWriter writer = new ObjectMapper().writer();
		String jsonData = writer.writeValueAsString(vo.getBeneficiary());
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		String user = YorosisContext.get().getUserName();
		String message = null;

		if (vo.getId() == 0L) {
			Environment environment = environmentRepository.findById(vo.getEnvironmentId());
			int environmentPresetCount = environmentPresetRepository.getCountOfKey(vo.getBeneficiary().getIdentifier(),
					environment.getId(), Constants.BENEFICIARY_TYPE, Constants.ACTIVEFLAG);

			if (environmentPresetCount == 0) {
				EnvironmentPreset preset = EnvironmentPreset.builder().jsonData(jsonData).environment(environment)
						.type(Constants.BENEFICIARY_TYPE).createdBy(user).createdDate(timestamp).updatedBy(user)
						.updatedDate(timestamp).key(vo.getBeneficiary().getIdentifier())
						.description(vo.getBeneficiary().getDescription())
						.activeFlag(Constants.ACTIVEFLAG).build();

				environmentPresetRepository.save(preset);
				message = "Beneficiary Preset Created successfully";
			} else {
				message = "Identifier Already Exist";
			}
		} else {
			Environment environment = environmentRepository.findById(vo.getEnvironmentId());
			EnvironmentPreset environmentPreset = environmentPresetRepository.findByKey(
					vo.getBeneficiary().getIdentifier(), environment.getId(), Constants.BENEFICIARY_TYPE,
					Constants.ACTIVEFLAG);
			environmentPreset.setEnvironment(environment);
			environmentPreset.setDescription(vo.getBeneficiary().getDescription());
			environmentPreset.setJsonData(jsonData);
			environmentPreset.setUpdatedBy(user);
			environmentPreset.setUpdatedDate(timestamp);

			environmentPresetRepository.save(environmentPreset);
			message = "Beneficiary Preset updated successfully";
		}

		return ResponseVO.builder().response(message).build();

	}

	@Transactional
	public ResponseVO deleteBeneficiaryPreset(long id) {
		EnvironmentPreset environmentPreset = environmentPresetRepository.findById(id);
		environmentPreset.setActiveFlag("N");

		String message = "Beneficiary Preset Deleted successfully";

		return ResponseVO.builder().response(message).build();
	}

	public EnvironmentPresetVO getEnviromentPresetDetails(String envName, String identifier) throws IOException {
		Environment environment = environmentRepository.findByEnvironmentNameIgnoreCase(envName);

		ObjectMapper mapper = new ObjectMapper();
		EnvironmentPreset preset = environmentPresetRepository.findByKey(identifier, environment.getId(),
				Constants.BENEFICIARY_TYPE, Constants.ACTIVEFLAG);

		BeneficiaryVO beneficiary = mapper.reader().forType(BeneficiaryVO.class).readValue(preset.getJsonData());
		return EnvironmentPresetVO.builder().beneficiary(beneficiary).id(preset.getId())
				.environmentId(preset.getEnvironment().getId()).build();

	}

	private String formatString(String a) {
		String[] split = a.substring(0, 10).split("-");
		return (split[1] + "/" + split[2] + "/" + split[0]);

	}

	@Override
	public TableData getGridData(PaginationVO pagination) throws YorosisException, ParseException, IOException {
		List<Map<String, String>> list = new ArrayList<>();
		ObjectMapper mapper = new ObjectMapper();

		TableData tableData = null;
		Map<String, String> dataMap = null;

		Pageable pageable = getPageableObject(pagination);
		if (StringUtils.equalsIgnoreCase(Constants.BENEFICIARY_TYPE, pagination.getGridId())) {
			String totalCount = environmentPresetRepository.getTotalCountForGrid(Constants.BENEFICIARY_TYPE,
					Constants.ACTIVEFLAG);
			List<EnvironmentPreset> environmentPresetList = environmentPresetRepository
					.getEnvironmentPresetList(pageable, Constants.BENEFICIARY_TYPE, Constants.ACTIVEFLAG);

			tableData = TableData.builder().data(list).totalRecords(totalCount).build();
			for (EnvironmentPreset environmentPreset : environmentPresetList) {
				dataMap = new HashMap<>();

				BeneficiaryVO beneficiary = mapper.readValue(environmentPreset.getJsonData(), BeneficiaryVO.class);

				dataMap.put("col1", environmentPreset.getEnvironment().getEnvironmentName());
				dataMap.put("col2", beneficiary.getIdentifier());
				dataMap.put("col3", beneficiary.getDescription());
				dataMap.put("col4", beneficiary.getFirstName());
				dataMap.put("col5", beneficiary.getLastName());
				dataMap.put("col6", formatString(beneficiary.getDob()));
				dataMap.put("col7", beneficiary.getGender());
				dataMap.put("col8", beneficiary.getAddress().getAddress());
				dataMap.put("col9", beneficiary.getAddress().getCity());
				dataMap.put("col10", beneficiary.getAddress().getState());
				dataMap.put("col11", beneficiary.getAddress().getZipcode());
				dataMap.put("col12", Long.toString(environmentPreset.getEnvironment().getId()));

				list.add(dataMap);
			}
		} else {
			throw new YorosisException("Invalid Grid Id");
		}

		return tableData;
	}

	public List<BeneficiaryVO> getBeneficiaryVOList(String key) throws IOException {
		List<BeneficiaryVO> list = new ArrayList<>();
		ObjectMapper mapper = new ObjectMapper();
		CriteriaBuilder criteriaBuilder = em.getCriteriaBuilder();
		CriteriaQuery<EnvironmentPreset> criteriaQuery = criteriaBuilder.createQuery(EnvironmentPreset.class);
		Root<EnvironmentPreset> root = criteriaQuery.from(EnvironmentPreset.class);

		Predicate predicateForBeneficiary = criteriaBuilder.and(
				criteriaBuilder.equal(root.get("type"), Constants.BENEFICIARY_TYPE),
				criteriaBuilder.equal(root.get("activeFlag"), Constants.ACTIVEFLAG));
		
		Predicate predicateForBeneficiaryKey = criteriaBuilder.like(criteriaBuilder.lower(root.get("key")),
				"%" + key.toLowerCase() + "%");
		Predicate predicateForBeneficiaryDescription = criteriaBuilder.like(criteriaBuilder.lower(root.get("description")),
				"%" + key.toLowerCase() + "%");
		
		Predicate orPredicateKeyOrDescription = criteriaBuilder.or(predicateForBeneficiaryKey, predicateForBeneficiaryDescription);
		Predicate finalPredicate = criteriaBuilder.and(predicateForBeneficiary, orPredicateKeyOrDescription);

		criteriaQuery.where(finalPredicate);
		List<EnvironmentPreset> presetList = em.createQuery(criteriaQuery).getResultList();
		for (EnvironmentPreset preset : presetList) {
			list.add(mapper.readValue(preset.getJsonData(), BeneficiaryVO.class));
		}

		return list;
	}

	@Override
	public String getGridModuleId() {
		return Constants.BENEFICIARY_TYPE;
	}

}
