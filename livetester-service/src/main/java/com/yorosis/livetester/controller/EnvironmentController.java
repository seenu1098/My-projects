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

import com.yorosis.livetester.service.EnvironmentService;
import com.yorosis.livetester.vo.EnvironmentListVO;
import com.yorosis.livetester.vo.EnvironmentVO;
import com.yorosis.livetester.vo.ResponseVO;

@RestController
@CrossOrigin
@RequestMapping("/environment/v1")
public class EnvironmentController {

	@Autowired
	private EnvironmentService environmentService;

	@PostMapping("/save")
	public ResponseVO saveEnvironmentDetails(@RequestBody EnvironmentVO vo) {
		return environmentService.saveEnvironmentData(vo);
	}

	@GetMapping("/get")
	public List<EnvironmentListVO> getEnvironmentList() {
		return environmentService.getEnvironmentList();
	}

	@GetMapping("/get/{id}")
	public EnvironmentVO getEnvironmentInfo(@PathVariable Long id) {
		return environmentService.getEnvironmentInfo(id);
	}

	@DeleteMapping("/delete/{id}")
	public ResponseVO deleteEnvironmentInfo(@PathVariable Long id) {
		return environmentService.deleteEnvironmentInfo(id);
	}

}
