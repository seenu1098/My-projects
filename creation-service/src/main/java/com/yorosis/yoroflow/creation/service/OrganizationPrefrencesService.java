package com.yorosis.yoroflow.creation.service;

import java.sql.Timestamp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yorosis.yoroapps.entities.OrganizationPreferences;
import com.yorosis.yoroapps.vo.OrganizationPrefrencesVo;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.OrganizationPreferencesRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class OrganizationPrefrencesService {

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private OrganizationPreferencesRepository organizationPrefrencesRepository;

	private OrganizationPreferences construcVOtoDTO(OrganizationPrefrencesVo organizationPrefrencesVo) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return OrganizationPreferences.builder().defaultPageSize(Integer.valueOf(organizationPrefrencesVo.getDefaultPageSize()))
				.errorTaskColor(organizationPrefrencesVo.getErrorTaskColor()).completedTaskColor(organizationPrefrencesVo.getCompletedTaskColor())
				.pendingTaskColor(organizationPrefrencesVo.getPendingTaskColor()).approvedTaskColor(organizationPrefrencesVo.getApprovedTaskColor())
				.draftTaskColor(organizationPrefrencesVo.getDraftTaskColor()).rejectTaskColor(organizationPrefrencesVo.getRejectTaskColor())
				.modifiedBy(YorosisContext.get().getUserName()).tenantId(YorosisContext.get().getTenantId()).activeFlag(YoroappsConstants.YES)
				.modifiedOn(timestamp).createdBy(YorosisContext.get().getUserName()).createdDate(timestamp).build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO saveOrganizationPrefrences(OrganizationPrefrencesVo organizationPrefrencesVo) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		if (organizationPrefrencesVo != null) {
			if (organizationPrefrencesVo.getOrganizationPrefrencesId() == null) {
				OrganizationPreferences organizationPrefrence = construcVOtoDTO(organizationPrefrencesVo);
				organizationPrefrencesRepository.save(organizationPrefrence);
			} else {
				OrganizationPreferences organizationPrefrences = organizationPrefrencesRepository
						.getOne(organizationPrefrencesVo.getOrganizationPrefrencesId());
				organizationPrefrences.setDefaultPageSize(Integer.valueOf(organizationPrefrencesVo.getDefaultPageSize()));
				organizationPrefrences.setCompletedTaskColor(organizationPrefrencesVo.getCompletedTaskColor());
				organizationPrefrences.setPendingTaskColor(organizationPrefrencesVo.getPendingTaskColor());
				organizationPrefrences.setErrorTaskColor(organizationPrefrencesVo.getErrorTaskColor());
				organizationPrefrences.setApprovedTaskColor(organizationPrefrencesVo.getApprovedTaskColor());
				organizationPrefrences.setDraftTaskColor(organizationPrefrencesVo.getDraftTaskColor());
				organizationPrefrences.setRejectTaskColor(organizationPrefrencesVo.getRejectTaskColor());
				organizationPrefrences.setModifiedBy(YorosisContext.get().getUserName());
				organizationPrefrences.setModifiedOn(timestamp);
				organizationPrefrencesRepository.save(organizationPrefrences);
			}
		}
		return ResponseStringVO.builder().response("Organization Prefrences are updated").build();
	}

	@Transactional
	public ResponseStringVO saveOrganizationPrefrencesForOrg(String customAttribute) throws JsonProcessingException {
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		OrganizationPrefrencesVo organizationPrefrencesVo = mapper.readValue(customAttribute, OrganizationPrefrencesVo.class);
		return updateOrganizationPreferences(organizationPrefrencesVo);
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public OrganizationPrefrencesVo getOrganizationPrefrences() {
		OrganizationPreferences organizationPrefrences = organizationPrefrencesRepository.getDataTenantIdAndActiveFlag(YorosisContext.get().getTenantId(),
				YoroappsConstants.YES);

		if (organizationPrefrences != null) {
			return OrganizationPrefrencesVo.builder().defaultPageSize(organizationPrefrences.getDefaultPageSize().toString())
					.organizationPrefrencesId(organizationPrefrences.getId()).completedTaskColor(organizationPrefrences.getCompletedTaskColor())
					.pendingTaskColor(organizationPrefrences.getPendingTaskColor()).rejectTaskColor(organizationPrefrences.getRejectTaskColor())
					.approvedTaskColor(organizationPrefrences.getApprovedTaskColor()).errorTaskColor(organizationPrefrences.getErrorTaskColor())
					.draftTaskColor(organizationPrefrences.getDraftTaskColor()).build();
		}

		return null;
	}

	@Transactional
	public OrganizationPrefrencesVo getOrganizationPrefrencesForOrg() {
		OrganizationPreferences organizationPrefrences = organizationPrefrencesRepository.getDataTenantIdAndActiveFlag(YorosisContext.get().getTenantId(),
				YoroappsConstants.YES);

		if (organizationPrefrences != null) {
			return OrganizationPrefrencesVo.builder().defaultPageSize(organizationPrefrences.getDefaultPageSize().toString())
					.organizationPrefrencesId(organizationPrefrences.getId()).completedTaskColor(organizationPrefrences.getCompletedTaskColor())
					.pendingTaskColor(organizationPrefrences.getPendingTaskColor()).rejectTaskColor(organizationPrefrences.getRejectTaskColor())
					.approvedTaskColor(organizationPrefrences.getApprovedTaskColor()).errorTaskColor(organizationPrefrences.getErrorTaskColor())
					.draftTaskColor(organizationPrefrences.getDraftTaskColor()).build();
		}

		return null;
	}

	@Transactional
	public ResponseStringVO updateOrganizationPreferences(OrganizationPrefrencesVo organizationPrefrencesVo) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		if (organizationPrefrencesVo != null) {
			if (organizationPrefrencesVo.getOrganizationPrefrencesId() == null) {
				OrganizationPreferences organizationPrefrence = construcVOtoDTO(organizationPrefrencesVo);
				organizationPrefrencesRepository.save(organizationPrefrence);
			} else {
				OrganizationPreferences organizationPrefrences = organizationPrefrencesRepository
						.getOne(organizationPrefrencesVo.getOrganizationPrefrencesId());
				organizationPrefrences.setDefaultPageSize(Integer.valueOf(organizationPrefrencesVo.getDefaultPageSize()));
				organizationPrefrences.setCompletedTaskColor(organizationPrefrencesVo.getCompletedTaskColor());
				organizationPrefrences.setPendingTaskColor(organizationPrefrencesVo.getPendingTaskColor());
				organizationPrefrences.setErrorTaskColor(organizationPrefrencesVo.getErrorTaskColor());
				organizationPrefrences.setApprovedTaskColor(organizationPrefrencesVo.getApprovedTaskColor());
				organizationPrefrences.setDraftTaskColor(organizationPrefrencesVo.getDraftTaskColor());
				organizationPrefrences.setRejectTaskColor(organizationPrefrencesVo.getRejectTaskColor());
				organizationPrefrences.setModifiedBy(YorosisContext.get().getUserName());
				organizationPrefrences.setModifiedOn(timestamp);
				organizationPrefrencesRepository.save(organizationPrefrences);
			}
		}

		return ResponseStringVO.builder().response("Organization Prefrences are updated").build();
	}
}
