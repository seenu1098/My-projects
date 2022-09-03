package com.yorosis.yoroflow.creation.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.yorosis.yoroapps.vo.MarketPlaceVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.service.MarketPlaceService;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@RestController
@RequestMapping("/market-place/v1/")
public class MarketPlaceController {
	@Autowired
	private MarketPlaceService marketPlaceService;

	@PostMapping("/save")
	public ResponseStringVO save(@RequestBody MarketPlaceVO marketPlaceVO) throws JsonMappingException, JsonProcessingException {
		YorosisContext currentContext = YorosisContext.get();
		try {
			YorosisContext.clear();
			YorosisContext context = YorosisContext.builder().tenantId(YoroappsConstants.DEFAULT_SCHEMA).userName(currentContext.getUserName()).build();
			YorosisContext.set(context);
			return marketPlaceService.save(marketPlaceVO);
		} finally {
			YorosisContext.clear();
			YorosisContext.set(currentContext);
		}

	}

	@GetMapping("/get/market-place")
	public List<MarketPlaceVO> getMarketPlace() {
		YorosisContext currentContext = YorosisContext.get();
		try {
			YorosisContext.clear();
			YorosisContext context = YorosisContext.builder().tenantId(YoroappsConstants.DEFAULT_SCHEMA).userName(currentContext.getUserName()).build();
			YorosisContext.set(context);
			return marketPlaceService.getMarketPlace();
		} finally {
			YorosisContext.clear();
			YorosisContext.set(currentContext);
		}
	}

	@GetMapping("/save/app/{processDefinitionName}/{type}")
	public ResponseStringVO saveDisableApp(@PathVariable(name = "processDefinitionName") String processDefinitionName,
			@PathVariable(name = "type") String type) {
		YorosisContext currentContext = YorosisContext.get();
		try {
			YorosisContext.clear();
			YorosisContext context = YorosisContext.builder().tenantId(YoroappsConstants.DEFAULT_SCHEMA).userName(currentContext.getUserName()).build();
			YorosisContext.set(context);
			return marketPlaceService.disableWorkflow(processDefinitionName, type);
		} finally {
			YorosisContext.clear();
			YorosisContext.set(currentContext);
		}
	}
}
