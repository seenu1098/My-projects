package com.yorosis.taskboard.services.clients;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import com.fasterxml.jackson.databind.JsonNode;
import com.yorosis.taskboard.models.FieldVO;
import com.yorosis.taskboard.models.TableObjectsColumnsVO;
import com.yorosis.taskboard.models.TableObjectsVO;
import com.yorosis.yoroapps.menu.vo.WorkflowReportMenuVo;
import com.yorosis.yoroapps.vo.CustomersVO;
import com.yorosis.yoroapps.vo.ExcelFileManagerVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.SMSKeyWorkflowVO;
import com.yorosis.yoroapps.vo.TimeZoneVo;

@FeignClient(name = "yoroapps-creation-service", url = "${creation-service.base.url}")
public interface YoroappsServiceClient {

	@GetMapping(value = "/table/v1/get/table-names", consumes = "application/json")
	public List<TableObjectsVO> getTableNames(@RequestHeader("Authorization") String authorizationToken);

	@GetMapping(value = "/table/v1/get/field-names/{tableObjectId}", consumes = "application/json")
	public List<TableObjectsColumnsVO> getColumnNames(@RequestHeader("Authorization") String authorizationToken,
			@PathVariable(name = "tableObjectId") UUID tableObjectId);

	@GetMapping(value = "/get/table-info/by-name/{name}", consumes = "application/json")
	public TableObjectsVO getTableObjectByName(@RequestHeader("Authorization") String authorizationToken, @PathVariable(name = "name") String name);

	@GetMapping(value = "/table/v1/get/table-info/{id}", consumes = "application/json")
	public TableObjectsVO getTableObjectsById(@RequestHeader("Authorization") String authorizationToken, @PathVariable(name = "id") String id);

	@GetMapping(value = "/dynamic-page/v1/get/fields/for/page/sub-section/{formname}/{version}", consumes = "application/json")
	public Map<String, List<FieldVO>> getFieldValues(@RequestHeader("Authorization") String authorizationToken, @PathVariable("formname") String formName,
			@PathVariable("version") Long version);

	@GetMapping(value = "/time-zone/v1/get/default-time-zone", consumes = "application/json")
	public TimeZoneVo getDefaultTimeZone(@RequestHeader("Authorization") String authorizationToken);

	@PostMapping(value = "/file-manager/v1/upload", consumes = "application/json")
	public Object uploadFileForExcel(@RequestHeader("Authorization") String authorizationToken, @RequestBody ExcelFileManagerVO excelFileManagerVO);

	@PostMapping(value = "/email-template/v1/send-mail", consumes = "application/json")
	public ResponseStringVO sendEmail(@RequestHeader("Authorization") String authorizationToken, @RequestBody JsonNode emailJson);

	@GetMapping(value = "/sms-keys/v1/get-keys/list", consumes = "application/json")
	public List<SMSKeyWorkflowVO> getSMSProviders();

	@GetMapping(value = "/shopping-cart/v1/check/cart-name/{cartName}", consumes = "application/json")
	public ResponseStringVO checkShoppingCart(@PathVariable("cartName") String cartName, @RequestHeader("Authorization") String authorizationToken);

	@PostMapping(value = "/menu/v1/add-report-menu-details", consumes = "application/json")
	public ResponseStringVO saveReportMenuDetails(@RequestHeader("Authorization") String authorizationToken, @RequestBody WorkflowReportMenuVo vo);

	@GetMapping(value = "/customer/v1/get", consumes = "application/json")
	public CustomersVO getCustomer(@RequestHeader("Authorization") String authorizationToken);
}
