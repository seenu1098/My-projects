package com.yorosis.yoroflow.rendering.controller;

import java.io.IOException;
import java.text.ParseException;
import java.util.List;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.yorosis.yoroapps.entities.Customers;
import com.yorosis.yoroapps.vo.DBDataVO;
import com.yorosis.yoroapps.vo.OptionsVO;
import com.yorosis.yoroapps.vo.PageVO;
import com.yorosis.yoroapps.vo.SelectOptionVO;
import com.yorosis.yoroapps.vo.YoroResponse;
import com.yorosis.yoroflow.rendering.exception.YoroappsException;
import com.yorosis.yoroflow.rendering.service.DynamicPageService;
import com.yorosis.yoroflow.rendering.service.FileManagerService;
import com.yorosis.yoroflow.rendering.service.PageService;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@RestController
@RequestMapping("/public")
public class PublicFormController {

	@Autowired
	private PageService pageService;

	@Autowired
	private DynamicPageService dynamicPageService;
	
	@Autowired
	private FileManagerService fileManagerService;

	@GetMapping("/get-page/{pageId}")
	public PageVO getPageDetailsByPageId(@PathVariable(name = "pageId") String id,
			@RequestHeader("referer") String header) throws IOException, YoroappsException {

		try {
			if (YorosisContext.get() == null) {
				YorosisContext.set(getContext(header));
			}
			return pageService.getPublicPageDetailsByPageIdentifier(id);
		} finally {
			YorosisContext.clear();
		}
	}

	@PostMapping(path = "/save")
	public YoroResponse save(@RequestBody String body,
			@RequestParam(value = "files", required = false) List<MultipartFile> file,
			@RequestHeader("referer") String header) throws YoroappsException, IOException, ParseException {
		JSONObject request = new JSONObject(body);

		try {
			if (YorosisContext.get() == null) {
				YorosisContext.set(getContext(header));
			}
			return dynamicPageService.savePublicForms(request, file);
		} finally {
			YorosisContext.clear();
		}
	}

	private YorosisContext getContext(String header) {
		String[] arrOfStr = header.split("//", 2);
		String[] url = arrOfStr[1].split("[.]", 2);
		String domain = url[0].toString();
		Customers customer = pageService.getCustomer(domain);
		return YorosisContext.builder().tenantId(customer.getTenantId()).build();
	}

	@GetMapping(path = "/get/list/values/{pageIdentifier}/{controlName}/{version}")
	public List<OptionsVO> getListValues(@PathVariable(name = "pageIdentifier") String pageIdentifier,
			@PathVariable(name = "controlName") String controlName, @PathVariable(name = "version") Long version,
			@RequestHeader("referer") String header) throws ParseException, IOException {
		try {
			if (YorosisContext.get() == null) {
				YorosisContext.set(getContext(header));
			}
			return dynamicPageService.getListValues(pageIdentifier, controlName, version);
		} finally {
			YorosisContext.clear();
		}
	}

	@PostMapping(path = "/get/list/filter/value")
	public List<OptionsVO> getListByFilterValue(@RequestBody SelectOptionVO selectOptionVo,
			@RequestHeader("referer") String header) throws ParseException {
		try {
			if (YorosisContext.get() == null) {
				YorosisContext.set(getContext(header));
			}
			return dynamicPageService.getDynamicSelectBoxValuesByFilterValue(selectOptionVo);
		} finally {
			YorosisContext.clear();
		}
	}

	@PostMapping(path = "/get/auto-complete-list")
	public List<OptionsVO> getAutoCompleteList(@RequestBody DBDataVO vo, @RequestHeader("referer") String header)
			throws ParseException {

		try {
			if (YorosisContext.get() == null) {
				YorosisContext.set(getContext(header));
			}
			return dynamicPageService.getDynamicAutoCompleteList(vo);
		} finally {
			YorosisContext.clear();
		}
	}
	
	@GetMapping(path = "/download-image/{key}", produces = "application/pdf")
	public ResponseEntity<byte[]> getImageByKey(@PathVariable("key") String key,
			@RequestHeader("referer") String headers)
			throws IOException {
		try {
			if (YorosisContext.get() == null) {
				YorosisContext.set(getContext(headers));
			}
			byte[] document = fileManagerService.downloadFile(key);
			String type = "pdf";

			HttpHeaders header = new HttpHeaders();
			header.setContentType(new MediaType("application", type));
			header.setContentLength(document.length);
			return new ResponseEntity<>(document, header, HttpStatus.OK);
		} finally {
			YorosisContext.clear();
		}
		
	}
}