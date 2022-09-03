package com.yorosis.yoroflow.creation.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;
import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yorosis.yoroapps.entities.CustomPage;
import com.yorosis.yoroapps.vo.ArgumentsVO;
import com.yorosis.yoroapps.vo.CustomPageVO;
import com.yorosis.yoroapps.vo.CustomPagesJsonVO;
import com.yorosis.yoroapps.vo.PageFieldVO;
import com.yorosis.yoroapps.vo.PageVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.CustomPagesRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class CustomPageService {

	@Autowired
	private CustomPagesRepository customPagesRepository;

	@PersistenceContext
	private EntityManager em;

	private CustomPage constructVOToDTO(CustomPageVO customPageVO) {
		Long version = 1L;
		return CustomPage.builder().activeFlag(YoroappsConstants.YES).tenantId(YorosisContext.get().getTenantId()).jsonPayload(customPageVO.getJsonText())
				.pageId(customPageVO.getPageId()).pageName(customPageVO.getPageName()).menuPath(customPageVO.getMenuPath()).version(version)
				.managedFlag(YoroappsConstants.NO).build();
	}

	private CustomPageVO constructDTOToVO(CustomPage customPage) {

		return CustomPageVO.builder().id(customPage.getId()).pageName(customPage.getPageName()).menuPath(customPage.getMenuPath())
				.jsonText(customPage.getJsonPayload()).pageId(customPage.getPageId()).build();

	}

	@Transactional
	public ResponseStringVO save(CustomPageVO customPageVO) {
		if (customPageVO.getId() == null) {
			customPagesRepository.save(constructVOToDTO(customPageVO));
			return ResponseStringVO.builder().response("Custom Page created successfully").build();
		} else {
			CustomPage customPage = customPagesRepository.getOne(customPageVO.getId());

			customPage.setPageId(customPageVO.getPageId());
			customPage.setPageName(customPageVO.getPageName());
			customPage.setMenuPath(customPageVO.getMenuPath());
			customPage.setJsonPayload(customPageVO.getJsonText());

			customPagesRepository.save(customPage);

			return ResponseStringVO.builder().response("Custom Page updated successfully").build();
		}
	}

	@Transactional
	public CustomPageVO getCustomPageDetails(UUID id) {
		CustomPage customPage = customPagesRepository.getOne(id);

		return constructDTOToVO(customPage);
	}

	@Transactional
	public List<PageVO> getCustomPageNameList(String pageName) throws JsonProcessingException {

		ObjectMapper mapper = new ObjectMapper();
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

		CriteriaBuilder criteriaBuilder = em.getCriteriaBuilder();
		CriteriaQuery<CustomPage> criteriaQuery = criteriaBuilder.createQuery(CustomPage.class);
		Root<CustomPage> root = criteriaQuery.from(CustomPage.class);

		criteriaQuery.select(root)
				.where(criteriaBuilder.or(criteriaBuilder.like(criteriaBuilder.lower(root.get("pageName")), "%" + pageName.toLowerCase() + "%")));

		TypedQuery<CustomPage> createQuery = em.createQuery(criteriaQuery);
		List<CustomPage> list = createQuery.getResultList();

		List<PageVO> pageNameList = new ArrayList<>();

		for (CustomPage code : list) {
			CustomPagesJsonVO customPagesJsonVO = mapper.readValue(mapper.writeValueAsString(code.getJsonPayload()), CustomPagesJsonVO.class);
			if (customPagesJsonVO != null) {
				PageVO vo = PageVO.builder().pageName(code.getPageName()).pageId(code.getPageId()).pageIdWithPrefix(customPagesJsonVO.getTableName()).build();
				pageNameList.add(vo);
			}
		}

		return pageNameList;
	}

	@Transactional
	public List<PageFieldVO> getFieldList(String pageIdentifier) throws JsonProcessingException {
		List<PageFieldVO> fieldVOList = new ArrayList<>();

		ObjectMapper mapper = new ObjectMapper();
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

		CustomPage customPage = customPagesRepository.findByPageIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(pageIdentifier,
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);

		CustomPagesJsonVO customPagesJsonVO = mapper.readValue(mapper.writeValueAsString(customPage.getJsonPayload()), CustomPagesJsonVO.class);

		for (ArgumentsVO vo : customPagesJsonVO.getArguments()) {
			PageFieldVO fieldVO = PageFieldVO.builder().fieldId(vo.getArgumentValue()).fieldName(vo.getPageFieldName()).build();
			fieldVOList.add(fieldVO);
		}
		return fieldVOList;
	}
}
