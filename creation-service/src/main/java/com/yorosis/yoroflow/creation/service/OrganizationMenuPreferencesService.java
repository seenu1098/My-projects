package com.yorosis.yoroflow.creation.service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroapps.entities.CustomMenuMobile;
import com.yorosis.yoroapps.vo.CustomMenu;
import com.yorosis.yoroapps.vo.CustomMenuVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.OrganizationMenuPreferenceRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class OrganizationMenuPreferencesService {

	@Autowired
	private OrganizationMenuPreferenceRepository organizationMenuPreferenceRepository;

	private CustomMenuMobile construcVOtoDTO(CustomMenuVO customMenuVO) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return CustomMenuMobile.builder().defaultMenuName(customMenuVO.getDefaultMenu()).customMenuName(customMenuVO.getCustomMenuName())
				.customPageName(customMenuVO.getDisplayName()).tenantId(YorosisContext.get().getTenantId()).createdBy(YorosisContext.get().getUserName())
				.createdOn(timestamp).modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp).activeFlag(YoroappsConstants.YES).build();
	}

	private CustomMenuVO constructDTOtoVO(CustomMenuMobile customMenu) {
		return CustomMenuVO.builder().id(customMenu.getId()).defaultMenu(customMenu.getDefaultMenuName()).customMenuName(customMenu.getCustomMenuName())
				.displayName(customMenu.getCustomPageName()).build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO saveCustomMenu(CustomMenu customMenu) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		ResponseStringVO response = null;
		for (CustomMenuVO customMenuVO : customMenu.getCustomMenuList()) {
			if (customMenuVO.getId() == null) {
				CustomMenuMobile customMenuMobileView = construcVOtoDTO(customMenuVO);
				organizationMenuPreferenceRepository.save(customMenuMobileView);
				response = ResponseStringVO.builder().response("Organization Custom Menus - created successfully").build();
			} else {
				CustomMenuMobile customMenuMobileView = organizationMenuPreferenceRepository.getCustomMenuWithId(customMenuVO.getId(),
						YorosisContext.get().getTenantId(), YoroappsConstants.YES);
				customMenuMobileView.setDefaultMenuName(customMenuVO.getDefaultMenu());
				customMenuMobileView.setCustomMenuName(customMenuVO.getCustomMenuName());
				customMenuMobileView.setCustomPageName(customMenuVO.getDisplayName());
				customMenuMobileView.setModifiedBy(YorosisContext.get().getUserName());
				customMenuMobileView.setModifiedOn(timestamp);
				organizationMenuPreferenceRepository.save(customMenuMobileView);
				response = ResponseStringVO.builder().response("Organization Custom Menus - updated successfully").build();
			}
		}

		if (response != null) {
			return response;
		}

		return ResponseStringVO.builder().response("Organization Custom Menus are updated").build();
	}

	@Transactional
	public List<CustomMenuVO> getCustomMenuList() {
		List<CustomMenuVO> list = new ArrayList<>();
		for (CustomMenuMobile customMenu : organizationMenuPreferenceRepository.getCustomMenu(YorosisContext.get().getTenantId(), YoroappsConstants.YES)) {
			list.add(constructDTOtoVO(customMenu));
		}
		return list;
	}

	@Transactional
	public ResponseStringVO updateOrganizationMenuPreferences(CustomMenu customMenu) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		ResponseStringVO response = null;
		for (CustomMenuVO customMenuVO : customMenu.getCustomMenuList()) {
			if (customMenuVO.getId() == null) {
				CustomMenuMobile customMenuMobileView = construcVOtoDTO(customMenuVO);
				organizationMenuPreferenceRepository.save(customMenuMobileView);
				response = ResponseStringVO.builder().response("Organization Menu Preference - created successfully").build();
			} else {
				CustomMenuMobile customMenuMobileView = organizationMenuPreferenceRepository.getCustomMenuWithId(customMenuVO.getId(),
						YorosisContext.get().getTenantId(), YoroappsConstants.YES);
				customMenuMobileView.setDefaultMenuName(customMenuVO.getDefaultMenu());
				customMenuMobileView.setCustomMenuName(customMenuVO.getCustomMenuName());
				customMenuMobileView.setCustomPageName(customMenuVO.getDisplayName());
				customMenuMobileView.setModifiedBy(YorosisContext.get().getUserName());
				customMenuMobileView.setModifiedOn(timestamp);
				organizationMenuPreferenceRepository.save(customMenuMobileView);
				response = ResponseStringVO.builder().response("Organization Menu Preference - updated successfully").build();
			}
		}

		if (response != null) {
			return response;
		}
		return ResponseStringVO.builder().response("Organization Custom Preference are saved successfully").build();
	}
}
