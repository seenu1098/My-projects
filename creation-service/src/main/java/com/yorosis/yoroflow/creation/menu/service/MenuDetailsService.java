package com.yorosis.yoroflow.creation.menu.service;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroapps.entities.MenuDetails;
import com.yorosis.yoroapps.entities.Page;
import com.yorosis.yoroapps.menu.vo.MenuDetailsVO;
import com.yorosis.yoroapps.vo.PageVO;

@Service
public class MenuDetailsService {

	@PersistenceContext
	private EntityManager em;

	@Transactional
	public List<PageVO> getPageName(String pageName) {
		CriteriaBuilder criteriaBuilder = em.getCriteriaBuilder();
		CriteriaQuery<Page> criteriaQuery = criteriaBuilder.createQuery(Page.class);
		Root<Page> root = criteriaQuery.from(Page.class);

		criteriaQuery.select(root).where(criteriaBuilder.or(criteriaBuilder.like(criteriaBuilder.lower(root.get("pageName")), pageName.toLowerCase() + "%")));

		TypedQuery<Page> createQuery = em.createQuery(criteriaQuery);
		List<Page> list = createQuery.getResultList();

		List<PageVO> pageNameList = new ArrayList<>();

		for (Page code : list) {
			if (code.getPageData().has("isWorkflowForm") && !code.getPageData().get("isWorkflowForm").asBoolean()) {
				PageVO vo = PageVO.builder().pageName(code.getPageName()).yorosisPageId(code.getId()).pageId(code.getPageId()).version(code.getVersion())
						.build();
				pageNameList.add(vo);
			}
		}

		return pageNameList;
	}

	@Transactional
	public List<MenuDetailsVO> getParentMenuNames(String menuName) {
		CriteriaBuilder criteriaBuilder = em.getCriteriaBuilder();
		CriteriaQuery<MenuDetails> criteriaQuery = criteriaBuilder.createQuery(MenuDetails.class);
		Root<MenuDetails> root = criteriaQuery.from(MenuDetails.class);

		criteriaQuery.select(root)
				.where(criteriaBuilder.or(criteriaBuilder.like(criteriaBuilder.lower(root.get("menuName")), "%" + menuName.toLowerCase() + "%")));

		TypedQuery<MenuDetails> createQuery = em.createQuery(criteriaQuery);
		List<MenuDetails> list = createQuery.getResultList();

		List<MenuDetailsVO> menuNameList = new ArrayList<>();

		for (MenuDetails code : list) {
			if (code.getParentMenuId() == null && code.getPage() == null) {
				MenuDetailsVO vo = MenuDetailsVO.builder().menuName(code.getMenuName()).id(code.getId()).build();
				menuNameList.add(vo);
			}
		}
		return menuNameList;
	}
}
