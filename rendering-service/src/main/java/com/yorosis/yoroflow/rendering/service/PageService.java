package com.yorosis.yoroflow.rendering.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yorosis.yoroapps.entities.Customers;
import com.yorosis.yoroapps.entities.Page;
import com.yorosis.yoroapps.vo.ExportPages;
import com.yorosis.yoroapps.vo.PageDataVO;
import com.yorosis.yoroapps.vo.PageVO;
import com.yorosis.yoroapps.vo.ResolvedSecurityForPageVO;
import com.yorosis.yoroapps.vo.SectionVO;
import com.yorosis.yoroflow.rendering.constants.YoroappsConstants;
import com.yorosis.yoroflow.rendering.exception.YoroappsException;
import com.yorosis.yoroflow.rendering.repository.ApplicationRepository;
import com.yorosis.yoroflow.rendering.repository.CustomersRepository;
import com.yorosis.yoroflow.rendering.repository.PageRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class PageService {
	@Autowired
	private PageRepository pageRepository;

	@Autowired
	private ApplicationRepository applicationRepository;

	@Autowired
	private PageSecurityService pageSecurityService;

	@Autowired
	private CustomersRepository customersRepository;

	@Transactional
	public PageVO getPageDetailsByPageIdentifier(String id, Long version) throws IOException {
		Page page = pageRepository.findByPageIdAndVersionAndTenantIdAndActiveFlag(id, version,
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		if (page != null) {
			return getPageVO(page);
		} else {
			return PageVO.builder().build();
		}

	}

	public Customers getCustomer(String domain) {
		return customersRepository.findBySubdomainNameIgnoreCaseAndActiveFlagIgnoreCase(domain, YoroappsConstants.YES);
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public PageVO getPublicPageDetailsByPageIdentifier(String id) throws IOException, YoroappsException {
		PageVO pageVo = null;
		String layoutType = "publicForm";
		List<Page> page = pageRepository.getPageId(id, layoutType, YoroappsConstants.YES,
				YorosisContext.get().getTenantId());
		if (page != null && !page.isEmpty()) {
			pageVo = getPageVO(page.get(0));
		} else {
			pageVo = PageVO.builder().build();
		}
		return pageVo;
	}

	@Transactional
	public PageVO getPageDetails(UUID id) throws IOException {
		return getPageVO(pageRepository.findByIdAndTenantIdAndActiveFlag(id, YorosisContext.get().getTenantId(),
				YoroappsConstants.YES));
	}

	private PageVO getPageVO(Page page) throws JsonProcessingException {
		ObjectMapper mapper = new ObjectMapper();
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

		PageVO pageVO = mapper.readValue(mapper.writeValueAsString(page.getPageData()), PageVO.class);
		pageVO.setApplicationId(page.getApplicationId());
		pageVO.setApplicationName(applicationRepository.getOne(pageVO.getApplicationId()).getAppName());
		pageVO.setYorosisPageId(page.getId());

		ResolvedSecurityForPageVO resolvedPageSecurity = pageSecurityService.getResolvedPageSecurity(pageVO.getPageId(),
				pageVO.getVersion());
		pageVO.setSecurity(resolvedPageSecurity);

		for (SectionVO vo : pageVO.getSections()) {
			ResolvedSecurityForPageVO resolvedPageSecurityForSection = pageSecurityService
					.getResolvedPageSecurityForSection(vo);
			vo.setSectionSecurity(resolvedPageSecurityForSection);
		}

		return pageVO;
	}

	public PageDataVO getData(String pageId, String passingParameter, String dataId) {

		return null;

	}

	@Transactional
	public List<PageVO> getPageList(List<ExportPages> exportPages)
			throws JsonMappingException, JsonProcessingException {
		List<PageVO> pageVOList = new ArrayList<>();
		List<String> pageIdList = new ArrayList<>();
		List<Long> versionList = new ArrayList<>();
		for (ExportPages exportPage : exportPages) {
			pageIdList.add(exportPage.getPageId());
			versionList.add(exportPage.getVersion());
		}
		List<Page> pageList = pageRepository.getPageListByPageId(pageIdList, YoroappsConstants.YES,
				YorosisContext.get().getTenantId());
		ObjectMapper mapper = new ObjectMapper();
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		for (Page page : pageList) {
			for (ExportPages exportPage : exportPages) {
				if (StringUtils.equalsIgnoreCase(exportPage.getPageId(), page.getPageId()) && StringUtils
						.equalsIgnoreCase(String.valueOf(exportPage.getVersion()), String.valueOf(page.getVersion()))) {
					PageVO pageVO = mapper.readValue(mapper.writeValueAsString(page.getPageData()), PageVO.class);
					pageVO.setApplicationId(page.getApplicationId());
					pageVO.setApplicationName(applicationRepository.getOne(pageVO.getApplicationId()).getAppName());
					pageVO.setYorosisPageId(page.getId());
					pageVOList.add(pageVO);
				}
			}
		}

		return pageVOList;
	}

}
