package com.yorosis.livetester.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.livetester.service.LookupDataService;
import com.yorosis.livetester.vo.LookupDataVO;
import com.yorosis.livetester.vo.ResponseVO;

@RestController
@CrossOrigin
@RequestMapping("/lookup-data/v1/")
public class LookupDataController {
	@Autowired
	private LookupDataService lookupDataService;

	@PostMapping("save")
	public ResponseVO saveClaimType(@RequestBody LookupDataVO lookupDataVo) {
		return lookupDataService.saveLookupData(lookupDataVo);
	}

	@GetMapping("get/{type}")
	public List<LookupDataVO> getlookupData(@PathVariable(name = "type") String type) {
		return lookupDataService.getlookupDataList(type);
	}

	@GetMapping("get")
	public List<LookupDataVO> getlookupData() {
		return lookupDataService.getlookupDataListVO();
	}

	@GetMapping("delete/{id}")
	public ResponseVO deletelookupData(@PathVariable(name = "id") Long id) {
		return lookupDataService.deletelookupDataList(id);
	}

	@GetMapping("info/{id}")
	public LookupDataVO getlookupDataInfo(@PathVariable(name = "id") Long id) {
		return lookupDataService.getLookupDataInfo(id);
	}
}
