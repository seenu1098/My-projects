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

import com.yorosis.livetester.service.ElementConfigurationService;
import com.yorosis.livetester.vo.ElementConfigListVO;
import com.yorosis.livetester.vo.ElementConfigVO;
import com.yorosis.livetester.vo.ResponseVO;

@RestController
@CrossOrigin
@RequestMapping("/element-config/v1")
public class ElementConfigController {
	@Autowired
	private ElementConfigurationService elementConfigurationService;

	@PostMapping("/save")
	public ResponseVO saveElementConfigurationDetails(@RequestBody ElementConfigVO vo) {
		return elementConfigurationService.saveElementConfigurationData(vo);
	}

	@GetMapping("/get-list/{type}")
	public List<ElementConfigListVO> getElementConfigList(@PathVariable String type) {
		return elementConfigurationService.getElementConfigList(type);
	}

	@GetMapping("/get/{id}")
	public ElementConfigVO getElementConfigInfo(@PathVariable Long id) {
		return elementConfigurationService.getElementConfigInfo(id);
	}

	@DeleteMapping("/delete/{id}")
	public ResponseVO deleteElementConfigInfo(@PathVariable Long id) {
		return elementConfigurationService.deleteElementConfigInfo(id);
	}
}
