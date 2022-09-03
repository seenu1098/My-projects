package com.yorosis.livetester.service;

import java.io.IOException;
import java.sql.Timestamp;
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
import com.yorosis.livetester.vo.EnvironmentPresetVO;
import com.yorosis.livetester.vo.PayorVO;
import com.yorosis.livetester.vo.ResponseVO;

@Service
public class PayorPresetService extends AbstractGridDataService {

	@Autowired
	private EnvironmentPresetRepository environmentPresetRepository;

	@Autowired
	private EnvironmentRepository environmentRepository;
	
	@PersistenceContext
	private EntityManager em;

	@Transactional
	public ResponseVO savePayorPreset(EnvironmentPresetVO vo) throws JsonProcessingException {
		ObjectWriter writer = new ObjectMapper().writer();
		String jsonData = writer.writeValueAsString(vo.getPayor());
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		String user = YorosisContext.get().getUserName();
		String message = null;

		if (vo.getId() == 0L) {
			Environment environment = environmentRepository.findById(vo.getEnvironmentId());
			int environmentPresetCount = environmentPresetRepository.getCountOfKey(vo.getPayor().getIdentifier(), environment.getId(), Constants.PAYOR_TYPE, Constants.ACTIVEFLAG);

			if (environmentPresetCount == 0) {
				EnvironmentPreset preset = EnvironmentPreset.builder().jsonData(jsonData).environment(environment).type(Constants.PAYOR_TYPE).createdBy(user).createdDate(timestamp)
						.updatedBy(user).updatedDate(timestamp).key(vo.getPayor().getIdentifier())
						.description(vo.getPaVO().getDescription()).activeFlag(Constants.ACTIVEFLAG).build();

				environmentPresetRepository.save(preset);
				message = "Payor Preset Created successfully";
			} else {
				message = "Payor Identifier Already Exist";
			}
		} else {
			Environment environment = environmentRepository.findById(vo.getEnvironmentId());
			EnvironmentPreset environmentPreset = environmentPresetRepository.findByKey(vo.getPayor().getIdentifier(), environment.getId(), Constants.PAYOR_TYPE, Constants.ACTIVEFLAG);
			environmentPreset.setEnvironment(environment);
			environmentPreset.setDescription(vo.getPayor().getDescription());
			environmentPreset.setJsonData(jsonData);
			environmentPreset.setUpdatedBy(user);
			environmentPreset.setUpdatedDate(timestamp);

			environmentPresetRepository.save(environmentPreset);
			message = "Payor Preset updated successfully";

		}

		return ResponseVO.builder().response(message).build();

	}

	@Transactional
	public ResponseVO deletePayorPreset(long id) {
		EnvironmentPreset environmentPreset = environmentPresetRepository.findById(id);
		environmentPreset.setActiveFlag("N");

		String message = "Payor Preset Deleted successfully";

		return ResponseVO.builder().response(message).build();

	}

	public EnvironmentPresetVO getEnviromentPayorPresetDetails(String envName, String identifier) throws IOException {
		Environment environment = environmentRepository.findByEnvironmentNameIgnoreCase(envName);

		ObjectMapper mapper = new ObjectMapper();
		EnvironmentPreset preset = environmentPresetRepository.findByKey(identifier, environment.getId(), Constants.PAYOR_TYPE, Constants.ACTIVEFLAG);

		PayorVO payor = mapper.reader().forType(PayorVO.class).readValue(preset.getJsonData());
		return EnvironmentPresetVO.builder().payor(payor).id(preset.getId()).environmentId(preset.getEnvironment().getId()).build();

	}

	@Override
	public TableData getGridData(PaginationVO pagination) throws YorosisException, IOException {
		List<Map<String, String>> list = new ArrayList<>();
		ObjectMapper mapper = new ObjectMapper();

		TableData tableData = null;
		Map<String, String> dataMap = null;

		Pageable pageable = getPageableObject(pagination);
		if (StringUtils.equalsIgnoreCase(Constants.PAYOR_TYPE, pagination.getGridId())) {
			String totalCount = environmentPresetRepository.getTotalCountForGrid(Constants.PAYOR_TYPE, Constants.ACTIVEFLAG);
			List<EnvironmentPreset> environmentPresetList = environmentPresetRepository.getEnvironmentPresetList(pageable, Constants.PAYOR_TYPE, Constants.ACTIVEFLAG);

			tableData = TableData.builder().data(list).totalRecords(totalCount).build();
			for (EnvironmentPreset environmentPreset : environmentPresetList) {
				dataMap = new HashMap<>();
				PayorVO payor = mapper.readValue(environmentPreset.getJsonData(), PayorVO.class);

				dataMap.put("col1", environmentPreset.getEnvironment().getEnvironmentName());
				dataMap.put("col2", payor.getIdentifier());
				dataMap.put("col3", payor.getName());
				dataMap.put("col4", payor.getDescription());
				dataMap.put("col5", payor.getAddress().getAddress());
				dataMap.put("col6", payor.getAddress().getCity());
				dataMap.put("col7", payor.getAddress().getState());
				dataMap.put("col8", payor.getAddress().getZipcode());

				list.add(dataMap);
			}
		} else {
			throw new YorosisException("Invalid Grid Id");
		}

		return tableData;
	}
	
	public List<PayorVO> getPayorVOList(String key) throws  IOException {
		List<PayorVO> list = new ArrayList<>();
		ObjectMapper mapper = new ObjectMapper();
		CriteriaBuilder criteriaBuilder = em.getCriteriaBuilder();
		CriteriaQuery<EnvironmentPreset> criteriaQuery = criteriaBuilder.createQuery(EnvironmentPreset.class);
		Root<EnvironmentPreset> root = criteriaQuery.from(EnvironmentPreset.class);
		
		Predicate predicateForBeneficiary = criteriaBuilder.and(criteriaBuilder.equal(root.get("type"), Constants.PAYOR_TYPE),criteriaBuilder.equal(root.get("activeFlag"), Constants.ACTIVEFLAG));
		
		Predicate predicateForKey = criteriaBuilder.like(root.get("key"), "%" + key.toLowerCase() + "%");
		Predicate predicateForDescription = criteriaBuilder.like(criteriaBuilder.lower(root.get("description")),
				"%" + key.toLowerCase() + "%");
		
		Predicate orPredicateKeyOrDescription = criteriaBuilder.or(predicateForKey, predicateForDescription);
		Predicate finalPredicate = criteriaBuilder.and(predicateForBeneficiary, orPredicateKeyOrDescription);

		
		criteriaQuery.where(finalPredicate);
		List<EnvironmentPreset> presetList = em.createQuery(criteriaQuery).getResultList();
		for(EnvironmentPreset preset:presetList) {
			list.add(mapper.readValue(preset.getJsonData(), PayorVO.class));
		}
	
		return list;
	}

	@Override
	public String getGridModuleId() {
		return Constants.PAYOR_TYPE;
	}


}
