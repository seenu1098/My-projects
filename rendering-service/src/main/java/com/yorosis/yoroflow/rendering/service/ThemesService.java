package com.yorosis.yoroflow.rendering.service;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yorosis.yoroapps.entities.Themes;
import com.yorosis.yoroapps.vo.ThemesVO;
import com.yorosis.yoroflow.rendering.constants.YoroappsConstants;
import com.yorosis.yoroflow.rendering.repository.ThemesRepository;

@Service
public class ThemesService {

	@Autowired
	private ThemesRepository themesRepository;

	private ThemesVO constructThemesDTOToVO(Themes themes) {
		return ThemesVO.builder().themeId(themes.getThemeId()).themeName(themes.getThemeName()).id(themes.getId())
				.build();
	}

	public List<ThemesVO> getThemesList() {
		List<ThemesVO> themesVOList = new ArrayList<>();
		for (Themes theme : themesRepository.findAll()) {
			if (!StringUtils.equals(theme.getActiveFlag(), YoroappsConstants.NO)) {
				themesVOList.add(constructThemesDTOToVO(theme));
			}
		}
		return themesVOList;
	}

}
