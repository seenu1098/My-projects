package com.yorosis.yoroflow.services;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.yorosis.yoroflow.models.ExcelFileManagerVO;
import com.yorosis.yoroflow.models.FieldVO;

@FeignClient(name = "rendering-service", url = "${rendering-service.base.url}")
public interface RenderingServiceClient {

	@RequestMapping(method = RequestMethod.GET, value = "/dynamic-page/v1/get/fields/for/page/{formname}/{version}", consumes = "application/json")
	public List<FieldVO> getFieldValues(@RequestHeader("Authorization") String authorizationToken, @PathVariable("formname") String formName,
			@PathVariable("version") Long version);

	@RequestMapping(method = RequestMethod.POST, value = "/file-manager/v1/upload", consumes = "application/json")
	public Object uploadFile(@RequestHeader("Authorization") String authorizationToken, @RequestBody ExcelFileManagerVO excelFileManagerVO);

	@RequestMapping(method = RequestMethod.GET, value = "/file-manager/v1/download/{key}", consumes = "application/json")
	public ExcelFileManagerVO downloadFile(@RequestHeader("Authorization") String authorizationToken, @PathVariable("key") String key);
}
