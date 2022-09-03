package com.yorosis.yoroflow.creation.grid.service;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import org.springframework.stereotype.Service;

import com.yorosis.yoroapps.entities.Grids;
import com.yorosis.yoroapps.grid.vo.GridVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;

@Service
public class GridService {

	@PersistenceContext
	private EntityManager em;

	public List<GridVO> getGridName(String gridName) {
		CriteriaBuilder criteriaBuilder = em.getCriteriaBuilder();
		CriteriaQuery<Grids> criteriaQuery = criteriaBuilder.createQuery(Grids.class);
		Root<Grids> root = criteriaQuery.from(Grids.class);

		Predicate predicateForGridName = criteriaBuilder
				.or(criteriaBuilder.like(criteriaBuilder.lower(root.get("gridName")), "%" + gridName.toLowerCase() + "%"));

		Predicate predicateForActiveFlag = criteriaBuilder.equal(root.get("activeFlag"), YoroappsConstants.YES);
		Predicate predicateForManageFlag = criteriaBuilder.equal(root.get("managedFlag"), YoroappsConstants.NO);
		Predicate predicateForGridList = criteriaBuilder.and(predicateForGridName, predicateForActiveFlag, predicateForManageFlag);
		criteriaQuery.select(root).where(predicateForGridList);

		TypedQuery<Grids> createQuery = em.createQuery(criteriaQuery);
		List<Grids> list = createQuery.getResultList();

		List<GridVO> gridNameList = new ArrayList<>();

		for (Grids grid : list) {
			GridVO vo = GridVO.builder().gridName(grid.getGridName()).gridId(grid.getGridId()).build();
			gridNameList.add(vo);
		}
		return gridNameList;
	}
}
