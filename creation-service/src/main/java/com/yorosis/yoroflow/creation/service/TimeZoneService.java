package com.yorosis.yoroflow.creation.service;

import java.sql.Timestamp;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.yorosis.yoroapps.entities.YoroflowTimeZone;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.TimeZoneVo;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.TimeZoneRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class TimeZoneService {

	private Timestamp timestamp = new Timestamp(System.currentTimeMillis());

	@Autowired
	private TimeZoneRepository timeZoneRepository;

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO updateTimeZone(String timeZoneCode) throws JsonMappingException, JsonProcessingException {
		ResponseStringVO response = null;
		List<YoroflowTimeZone> yoroflowTimeZoneList = timeZoneRepository.getAllTimeZone(YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		if (!CollectionUtils.isEmpty(yoroflowTimeZoneList)) {
			for (YoroflowTimeZone yoroflowTimeZone : yoroflowTimeZoneList) {
				if (StringUtils.equals(timeZoneCode, yoroflowTimeZone.getTimeZoneCode())) {
					yoroflowTimeZone.setDefaultTimeZone("Y");
				} else {
					yoroflowTimeZone.setDefaultTimeZone("N");
				}
				yoroflowTimeZone.setModifiedBy(YorosisContext.get().getUserName());
				yoroflowTimeZone.setModifiedOn(timestamp);
				timeZoneRepository.save(yoroflowTimeZone);
			}
		}
		response = ResponseStringVO.builder().response("Time Zone are updated").build();
		return response;
	}

	@Transactional
	public TimeZoneVo getDefaultTimeZone() {
		YoroflowTimeZone yoroflowTimeZone = timeZoneRepository.getDefaultTimeZone(YoroappsConstants.YES, YorosisContext.get().getTenantId(),
				YoroappsConstants.YES);
		if (yoroflowTimeZone != null) {
			return TimeZoneVo.builder().id(yoroflowTimeZone.getId()).defaultTimeZone(yoroflowTimeZone.getDefaultTimeZone())
					.timeZoneCode(yoroflowTimeZone.getTimeZoneCode()).timeZoneLabel(yoroflowTimeZone.getTimeZoneLabel()).build();
		}
		return null;
	}
}
