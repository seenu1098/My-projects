package com.yorosis.livetester.grid.services;

import java.io.IOException;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.reflect.FieldUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;

import com.yorosis.livetester.exception.YorosisException;
import com.yorosis.livetester.grid.vo.FilterData;
import com.yorosis.livetester.grid.vo.HeadersVO;
import com.yorosis.livetester.grid.vo.PaginationVO;
import com.yorosis.livetester.grid.vo.TableData;

public abstract class AbstractGridDataService {

	public abstract TableData getGridData(PaginationVO pagination) throws YorosisException, ParseException, IOException;

	public abstract String getGridModuleId();

	@PersistenceContext
	private EntityManager em;

	@Autowired
	private CommonService commonservice;

	@SuppressWarnings("unchecked")
	protected <T> FilterData<T> getFilterData(Class<T> cls, PaginationVO pagination) throws ParseException {

		CriteriaBuilder criteriaBuilder = em.getCriteriaBuilder();

		CriteriaQuery<T> criteriaQuery = criteriaBuilder.createQuery(cls);

		Root<T> from = criteriaQuery.from(cls);
		Predicate predicate = criteriaBuilder.conjunction();
		String columnName = null;
		String searchTextValue = null;
		String operators = null;

		HeadersVO gridHeaders = commonservice.getGridHeaders(pagination.getGridId());
		List<String> headersIdList = gridHeaders.getHeadersIdList();

		for (int i = 0; i < pagination.getFilterValue().length; i++) {

			columnName = pagination.getFilterValue()[i].getFilterIdColumn();
			searchTextValue = pagination.getFilterValue()[i].getFilterIdColumnValue();
			operators = pagination.getFilterValue()[i].getOperators();

			int indexOf = headersIdList.indexOf(columnName);

			if (headersIdList.indexOf(columnName) != -1) {

				if (columnName.contains(".")) {
					String[] joinColumn = columnName.split("[.]");
					if (StringUtils.equals(operators, "eq")) {
						predicate = criteriaBuilder.and(predicate,
								criteriaBuilder.equal(criteriaBuilder.lower(from.get(joinColumn[0]).get(joinColumn[1])), searchTextValue.toLowerCase()));
					} else if (StringUtils.equals(operators, "ne")) {
						predicate = criteriaBuilder.and(predicate,
								criteriaBuilder.notEqual(criteriaBuilder.lower(from.get(joinColumn[0]).get(joinColumn[1])), searchTextValue.toLowerCase()));
					} else if (StringUtils.equals(operators, "bw")) {
						predicate = criteriaBuilder.and(predicate,
								criteriaBuilder.like(criteriaBuilder.lower(from.get(joinColumn[0]).get(joinColumn[1])), searchTextValue.toLowerCase() + "%"));
					} else if (StringUtils.equals(operators, "ew")) {
						predicate = criteriaBuilder.and(predicate,
								criteriaBuilder.like(criteriaBuilder.lower(from.get(joinColumn[0]).get(joinColumn[1])), "%" + searchTextValue.toLowerCase()));
					} else if (StringUtils.equals(operators, "cn")) {
						predicate = criteriaBuilder.and(predicate,
								criteriaBuilder.like(criteriaBuilder.lower(from.get(joinColumn[0]).get(joinColumn[1])), "%" + searchTextValue.toLowerCase() + "%"));
					}
				} else {
					if (StringUtils.equals(gridHeaders.getFieldType().get(indexOf), "date")) {
						if (StringUtils.equals(operators, "eq")) {
							predicate = criteriaBuilder.and(predicate, criteriaBuilder.equal(from.get(columnName), stringToDate(searchTextValue)));
						} else if (StringUtils.equals(operators, "ne")) {
							predicate = criteriaBuilder.and(predicate, criteriaBuilder.notEqual(from.get(columnName), stringToDate(searchTextValue)));
						} else if (StringUtils.equals(operators, "gt")) {
							predicate = criteriaBuilder.and(predicate, criteriaBuilder.greaterThan(from.get(columnName), stringToDate(searchTextValue)));
						} else if (StringUtils.equals(operators, "ge")) {
							predicate = criteriaBuilder.and(predicate, criteriaBuilder.greaterThanOrEqualTo(from.get(columnName), stringToDate(searchTextValue)));
						} else if (StringUtils.equals(operators, "lt")) {
							predicate = criteriaBuilder.and(predicate, criteriaBuilder.lessThan(from.get(columnName), stringToDate(searchTextValue)));
						} else if (StringUtils.equals(operators, "le")) {
							predicate = criteriaBuilder.and(predicate, criteriaBuilder.lessThanOrEqualTo(from.get(columnName), stringToDate(searchTextValue)));
						}

					} else if (StringUtils.equals(gridHeaders.getFieldType().get(indexOf), "string")) {
						if (StringUtils.equals(operators, "eq")) {
							predicate = criteriaBuilder.and(predicate, criteriaBuilder.equal(criteriaBuilder.lower(from.get(columnName)), searchTextValue.toLowerCase()));
						} else if (StringUtils.equals(operators, "ne")) {
							predicate = criteriaBuilder.and(predicate, criteriaBuilder.notEqual(criteriaBuilder.lower(from.get(columnName)), searchTextValue.toLowerCase()));
						} else if (StringUtils.equals(operators, "bw")) {
							predicate = criteriaBuilder.and(predicate, criteriaBuilder.like(criteriaBuilder.lower(from.get(columnName)), searchTextValue.toLowerCase() + "%"));
						} else if (StringUtils.equals(operators, "ew")) {
							predicate = criteriaBuilder.and(predicate, criteriaBuilder.like(criteriaBuilder.lower(from.get(columnName)), "%" + searchTextValue.toLowerCase()));
						} else if (StringUtils.equals(operators, "cn")) {
							predicate = criteriaBuilder.and(predicate,
									criteriaBuilder.like(criteriaBuilder.lower(from.get(columnName)), "%" + searchTextValue.toLowerCase() + "%"));
						}

					} else if (StringUtils.equals(gridHeaders.getFieldType().get(indexOf), "number")) {
						if (StringUtils.equals(operators, "eq")) {
							predicate = criteriaBuilder.and(predicate, criteriaBuilder.equal(from.get(columnName), stringToLong(searchTextValue)));
						} else if (StringUtils.equals(operators, "ne")) {
							predicate = criteriaBuilder.and(predicate, criteriaBuilder.notEqual(from.get(columnName), stringToLong(searchTextValue)));
						} else if (StringUtils.equals(operators, "gt")) {
							predicate = criteriaBuilder.and(predicate, criteriaBuilder.greaterThan(from.get(columnName), stringToLong(searchTextValue)));
						} else if (StringUtils.equals(operators, "ge")) {
							predicate = criteriaBuilder.and(predicate, criteriaBuilder.greaterThanOrEqualTo(from.get(columnName), stringToLong(searchTextValue)));
						} else if (StringUtils.equals(operators, "lt")) {
							predicate = criteriaBuilder.and(predicate, criteriaBuilder.lessThan(from.get(columnName), stringToLong(searchTextValue)));
						} else if (StringUtils.equals(operators, "le")) {
							predicate = criteriaBuilder.and(predicate, criteriaBuilder.lessThanOrEqualTo(from.get(columnName), stringToLong(searchTextValue)));
						}
					} else if (StringUtils.equals(gridHeaders.getFieldType().get(indexOf), "double")) {
						if (StringUtils.equals(operators, "eq")) {
							predicate = criteriaBuilder.and(predicate, criteriaBuilder.equal(from.get(columnName), stringToDouble(searchTextValue)));
						} else if (StringUtils.equals(operators, "ne")) {
							predicate = criteriaBuilder.and(predicate, criteriaBuilder.notEqual(from.get(columnName), stringToDouble(searchTextValue)));
						} else if (StringUtils.equals(operators, "gt")) {
							predicate = criteriaBuilder.and(predicate, criteriaBuilder.greaterThan(from.get(columnName), stringToDouble(searchTextValue)));
						} else if (StringUtils.equals(operators, "ge")) {
							predicate = criteriaBuilder.and(predicate, criteriaBuilder.greaterThanOrEqualTo(from.get(columnName), stringToDouble(searchTextValue)));
						} else if (StringUtils.equals(operators, "lt")) {
							predicate = criteriaBuilder.and(predicate, criteriaBuilder.lessThan(from.get(columnName), stringToDouble(searchTextValue)));
						} else if (StringUtils.equals(operators, "le")) {
							predicate = criteriaBuilder.and(predicate, criteriaBuilder.lessThanOrEqualTo(from.get(columnName), stringToDouble(searchTextValue)));
						}
					}
				}
			}
		}

		if (StringUtils.equals("asc", pagination.getDirection()))

		{
			criteriaQuery.orderBy(criteriaBuilder.asc(from.get(pagination.getColumnName())));
		} else if (StringUtils.equals("desc", pagination.getDirection())) {
			criteriaQuery.orderBy(criteriaBuilder.desc(from.get(pagination.getColumnName())));
		}
		criteriaQuery.select(from).where(predicate);

		TypedQuery<T> createQuery = em.createQuery(criteriaQuery);
		createQuery.setFirstResult(pagination.getIndex());
		createQuery.setMaxResults(pagination.getSize());

		List<T> resultList = createQuery.getResultList();
		List<Object> resultObjects = new ArrayList<>();
		resultObjects.addAll(resultList);

		CriteriaQuery<Long> countQuery = criteriaBuilder.createQuery(Long.class);
		countQuery.select(criteriaBuilder.count(countQuery.from(cls))).where(predicate);
		Long count = em.createQuery(countQuery).getSingleResult();

		return (FilterData<T>) FilterData.builder().data(resultObjects).totalRecords(count).build();

	}

	

	protected Pageable getPageableObject(PaginationVO vo) {
		Sort sort = null;
		int pageSize = 10;

		if (vo.getSize() > 0) {
			pageSize = vo.getSize();
		}
		if (StringUtils.equals(vo.getDirection(), "asc")) {
			sort = Sort.by(new Sort.Order(Direction.ASC, vo.getColumnName()));
		} else if (StringUtils.equals(vo.getDirection(), "desc")) {
			sort = Sort.by(new Sort.Order(Direction.DESC, vo.getColumnName()));
		}

		if (sort != null) {
			return PageRequest.of(vo.getIndex(), pageSize, sort);
		}

		return PageRequest.of(vo.getIndex(), pageSize);
	}

	protected <T> Map<String, String> copyObject(T source, Map<String, String> objectColumnMapping) {
		// objectColumnMapping Map contains - key is name and the value is
		// objectFieldName

		Map<String, String> valueMap = new LinkedHashMap<>();
		for (Entry<String, String> entry : objectColumnMapping.entrySet()) {
			try {
				Object object = FieldUtils.readField(source, entry.getValue(), true);
				valueMap.put(entry.getKey(), object != null ? object.toString() : null);
			} catch (IllegalAccessException e) {
				// ignore
			}
		}

		return valueMap;
	}

	public String dateToString(Date date) {
		DateFormat dateFormat = new SimpleDateFormat("MM/dd/yyyy");
		return dateFormat.format(date);
	}

	public String longToString(Long longValue) {
		return Long.toString(longValue);
	}

	public Date stringToDate(String sDate) throws ParseException {
		SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd");
		return simpleDateFormat.parse(sDate);
	}

	public Long stringToLong(String longValue) {
		return Long.parseLong(longValue);
	}

	public Double stringToDouble(String doubleValue) {
		return Double.parseDouble(doubleValue);
	}
}