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
import com.yorosis.livetester.vo.ProviderVO;
import com.yorosis.livetester.vo.ResponseVO;

@Service
public class ProviderPresetService extends AbstractGridDataService {

	@Autowired
	private EnvironmentPresetRepository environmentPresetRepository;

	@Autowired
	private EnvironmentRepository environmentRepository;

	@PersistenceContext
	private EntityManager em;

	@Transactional
	public ResponseVO saveProviderPreset(EnvironmentPresetVO vo) throws JsonProcessingException {
		ObjectWriter writer = new ObjectMapper().writer();
		String jsonData = writer.writeValueAsString(vo.getProvider());
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		String user = YorosisContext.get().getUserName();
		String message = null;

		if (vo.getId() == 0L) {
			Environment environment = environmentRepository.findById(vo.getEnvironmentId());
			int environmentPresetCount = environmentPresetRepository.getCountOfKey(vo.getProvider().getNpi(), environment.getId(), Constants.PROVIDER_TYPE, Constants.ACTIVEFLAG);

			if (environmentPresetCount == 0) {
				EnvironmentPreset preset = EnvironmentPreset.builder().jsonData(jsonData).environment(environment).type(Constants.PROVIDER_TYPE).createdBy(user)
						.createdDate(timestamp).updatedBy(user).updatedDate(timestamp).key(vo.getProvider().getNpi())
						.description(vo.getProvider().getDescription()).activeFlag(Constants.ACTIVEFLAG).build();

				environmentPresetRepository.save(preset);
				message = "Provider Preset Created successfully";
			} else {
				message = "Npi Already Exist";
			}
		} else {
			Environment environment = environmentRepository.findById(vo.getEnvironmentId());
			EnvironmentPreset environmentPreset = environmentPresetRepository.findByKey(vo.getProvider().getNpi(), environment.getId(), Constants.PROVIDER_TYPE, Constants.ACTIVEFLAG);
			environmentPreset.setEnvironment(environment);
			environmentPreset.setDescription(vo.getProvider().getDescription());
			environmentPreset.setJsonData(jsonData);
			environmentPreset.setUpdatedBy(user);
			environmentPreset.setUpdatedDate(timestamp);

			environmentPresetRepository.save(environmentPreset);
			message = "Provider Preset updated successfully";
		}

		return ResponseVO.builder().response(message).build();
	}

	@Transactional
	public ResponseVO deleteProviderPreset(long id) {
		EnvironmentPreset environmentPreset = environmentPresetRepository.findById(id);
		environmentPreset.setActiveFlag("N");

		String message = "Provider Preset Deleted successfully";

		return ResponseVO.builder().response(message).build();

	}

	public EnvironmentPresetVO getEnviromentProviderPresetDetails(String envName, String npi) throws IOException {
		Environment environment = environmentRepository.findByEnvironmentNameIgnoreCase(envName);
		
		ObjectMapper mapper = new ObjectMapper();
		EnvironmentPreset preset = environmentPresetRepository.findByKey(npi, environment.getId(), Constants.PROVIDER_TYPE, Constants.ACTIVEFLAG);

		ProviderVO provider = mapper.reader().forType(ProviderVO.class).readValue(preset.getJsonData());
		return EnvironmentPresetVO.builder().provider(provider).id(preset.getId()).environmentId(preset.getEnvironment().getId()).build();

	}

	@Override
	public TableData getGridData(PaginationVO pagination) throws YorosisException, IOException {
		List<Map<String, String>> list = new ArrayList<>();
		ObjectMapper mapper = new ObjectMapper();

		TableData tableData = null;
		Map<String, String> dataMap = null;

		Pageable pageable = getPageableObject(pagination);
		if (StringUtils.equalsIgnoreCase(Constants.PROVIDER_TYPE, pagination.getGridId())) {
			String totalCount = environmentPresetRepository.getTotalCountForGrid(Constants.PROVIDER_TYPE, Constants.ACTIVEFLAG);
			List<EnvironmentPreset> environmentPresetList = environmentPresetRepository.getEnvironmentPresetList(pageable, Constants.PROVIDER_TYPE, Constants.ACTIVEFLAG);

			tableData = TableData.builder().data(list).totalRecords(totalCount).build();
			for (EnvironmentPreset environmentPreset : environmentPresetList) {
				dataMap = new HashMap<>();
				ProviderVO provider = mapper.readValue(environmentPreset.getJsonData(), ProviderVO.class);

				dataMap.put("col1", environmentPreset.getEnvironment().getEnvironmentName());
				dataMap.put("col2", provider.getNpi());
				dataMap.put("col3", provider.getDescription());
				dataMap.put("col4", provider.getTaxonomy());
				dataMap.put("col5", provider.getFirstName());
				dataMap.put("col6", provider.getLastName());
				dataMap.put("col7", provider.getOrganizationName());
				dataMap.put("col8", provider.getTaxId());
				dataMap.put("col9", provider.getType());
				dataMap.put("col10", provider.getServiceFacility());
				dataMap.put("col11", provider.getAddress().getAddress());
				dataMap.put("col12", provider.getAddress().getCity());
				dataMap.put("col13", provider.getAddress().getState());
				dataMap.put("col14", provider.getAddress().getZipcode());

				list.add(dataMap);
			}
		} else {
			throw new YorosisException("Invalid Grid Id");
		}

		return tableData;
	}

	public List<ProviderVO> getProviderVOList(String key) throws IOException {
		List<ProviderVO> list = new ArrayList<>();
		ObjectMapper mapper = new ObjectMapper();
		CriteriaBuilder criteriaBuilder = em.getCriteriaBuilder();
		CriteriaQuery<EnvironmentPreset> criteriaQuery = criteriaBuilder.createQuery(EnvironmentPreset.class);
		Root<EnvironmentPreset> root = criteriaQuery.from(EnvironmentPreset.class);

		Predicate predicateForBeneficiary = criteriaBuilder.and(criteriaBuilder.equal(root.get("type"), Constants.PROVIDER_TYPE),
				criteriaBuilder.equal(root.get("activeFlag"), Constants.ACTIVEFLAG));
		
		Predicate predicateForKey = criteriaBuilder.like(root.get("key"), "%" + key.toLowerCase() + "%");
		Predicate predicateForDescription = criteriaBuilder.like(criteriaBuilder.lower(root.get("description")),
				"%" + key.toLowerCase() + "%");
		
		Predicate orPredicateKeyOrDescription = criteriaBuilder.or(predicateForKey, predicateForDescription);
		Predicate finalPredicate = criteriaBuilder.and(predicateForBeneficiary, orPredicateKeyOrDescription);

		criteriaQuery.where(finalPredicate);
		List<EnvironmentPreset> presetList = em.createQuery(criteriaQuery).getResultList();
		for (EnvironmentPreset preset : presetList) {
			list.add(mapper.readValue(preset.getJsonData(), ProviderVO.class));
		}

		return list;
	}

	@Override
	public String getGridModuleId() {
		return Constants.PROVIDER_TYPE;
	}


}
