package com.yorosis.yoroflow.rendering.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yorosis.yoroapps.entities.CustomPage;
import com.yorosis.yoroapps.vo.CustomPageVO;
import com.yorosis.yoroflow.rendering.repository.CustomPagesRepository;

@Service
public class CustomPageService {

	@Autowired
	private CustomPagesRepository customPagesRepository;

	public List<CustomPageVO> getCustomPageList() {
		List<CustomPageVO> pageList = new ArrayList<>();
		for (CustomPage page : customPagesRepository.findAll()) {
			pageList.add(CustomPageVO.builder().id(page.getId()).pageId(page.getPageId()).pageName(page.getPageName())
					.menuPath(page.getMenuPath()).version(page.getVersion()).build());
		}
		return pageList;
	}
}
