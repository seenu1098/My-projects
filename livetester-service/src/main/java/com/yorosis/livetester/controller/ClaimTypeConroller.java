package com.yorosis.livetester.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.livetester.service.ClaimTypeService;
import com.yorosis.livetester.vo.ClaimTypeVO;
import com.yorosis.livetester.vo.ResponseVO;

@RestController
@CrossOrigin
@RequestMapping("/claim-type/v1/")
public class ClaimTypeConroller {

	@Autowired
	private ClaimTypeService claimTypeService;

	@PostMapping("save")
	public ResponseVO saveClaimType(@RequestBody ClaimTypeVO claimTypeVO) {
		return claimTypeService.saveClaimType(claimTypeVO);
	}

	@GetMapping("/get")
	public List<ClaimTypeVO> getClaimType() {
		return claimTypeService.getClaimType();
	}

	@GetMapping("/get/{id}")
	public ClaimTypeVO getClaimTypeDetail(@PathVariable(name = "id") Integer id) {
		return claimTypeService.getClaimTypeDetail(id);
	}

	@DeleteMapping("/delete/{id}")
	public ResponseVO deleteClaimTypeDetail(@PathVariable(name = "id") Integer id) {
		return claimTypeService.deleteClaimTypeDetail(id);
	}

}
