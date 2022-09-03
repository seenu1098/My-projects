package com.yorosis.yoroflow.rendering.service;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Map.Entry;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.reflect.FieldUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;

import com.yorosis.yoroapps.grid.vo.PaginationVO;
import com.yorosis.yoroapps.grid.vo.TableData;
import com.yorosis.yoroflow.rendering.exception.YoroappsException;
import com.yorosis.yoroflow.rendering.repository.GridsRepository;


public abstract class AbstractGridDataService {

	public abstract TableData getGridData(PaginationVO pagination) throws YoroappsException;

	public abstract String getGridModuleId();

	@PersistenceContext
	private EntityManager em;

	@Autowired
	private GridsRepository gridsRepository;

	protected Pageable getPageableObject(PaginationVO vo) {
		Sort sort = null;
		int pageSize = 10;

		if (StringUtils.isBlank(vo.getColumnName())) {
			vo.setColumnName(gridsRepository.findByGridName(vo.getGridId()).getDefaultSortableColumn());
		}

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

	protected String getStringValueForBigDecimal(BigDecimal name) {
		if (name != null) {
			return name.toString();
		} else {
			return "";
		}
	}

	protected String getStringValueForLong(Long name) {
		if (name != null) {
			return name.toString();
		} else {
			return "";
		}
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

	public Timestamp dateToTimestamp(Date date) {
		return new Timestamp(date.getTime());
	}

	public Long stringToLong(String longValue) {
		return Long.parseLong(longValue);
	}

	public Double stringToDouble(String doubleValue) {
		return Double.parseDouble(doubleValue);
	}
}
