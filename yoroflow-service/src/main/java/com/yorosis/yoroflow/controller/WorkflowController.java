package com.yorosis.yoroflow.controller;

import java.io.IOException;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yorosis.yoroapps.apps.vo.AppsVo;
import com.yorosis.yoroapps.vo.LicenseVO;
import com.yorosis.yoroapps.vo.SubscriptionExpireVO;
import com.yorosis.yoroapps.vo.WorkflowNamesVO;
import com.yorosis.yoroflow.models.AdhocTask;
import com.yorosis.yoroflow.models.EnablePinVO;
import com.yorosis.yoroflow.models.FieldVO;
import com.yorosis.yoroflow.models.ManualLaunchVo;
import com.yorosis.yoroflow.models.PageFieldVo;
import com.yorosis.yoroflow.models.ProcessDefinitionVO;
import com.yorosis.yoroflow.models.ProcessInstanceUserTaskVO;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.models.SMSKeyWorkflowVO;
import com.yorosis.yoroflow.models.TableObjectsColumnsVO;
import com.yorosis.yoroflow.models.TableObjectsVO;
import com.yorosis.yoroflow.models.TaskDetailsRequest;
import com.yorosis.yoroflow.models.TaskDetailsResponse;
import com.yorosis.yoroflow.models.TaskFilesVO;
import com.yorosis.yoroflow.models.TaskNotesVO;
import com.yorosis.yoroflow.models.TimeZoneVo;
import com.yorosis.yoroflow.models.WebHookVo;
import com.yorosis.yoroflow.models.WorkFlow;
import com.yorosis.yoroflow.models.YoroFlowException;
import com.yorosis.yoroflow.services.FlowEngineService;
import com.yorosis.yoroflow.services.WorkflowService;

@RestController
@RequestMapping("/flow/v1")
public class WorkflowController {

	@Autowired
	private WorkflowService workFlowService;

	@Autowired
	private FlowEngineService flowEngineService;

	@Autowired
	private ObjectMapper mapper;

	@PostMapping("/create/workflow/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User'})")
	public ResponseStringVO createProcessDefinition(@RequestBody JsonNode workflowJson,
			@PathVariable("workspaceId") String workspaceId) throws JsonProcessingException {
		return workFlowService.saveProcessDefinition(workflowJson, UUID.fromString(workspaceId));
	}

	@PostMapping("/update/workflow/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User'})")
	public ResponseStringVO updateProcessDefinition(@RequestBody JsonNode workflowJson,
			@PathVariable("workspaceId") String workspaceId) throws JsonProcessingException {
		return workFlowService.saveProcessDefinition(workflowJson, UUID.fromString(workspaceId));
	}

	@GetMapping(value = "/get/workflow/{workflowVersion}/{workflowKey}/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public WorkFlow getProcessDefinition(@PathVariable("workflowVersion") Long workflowVersion,
			@PathVariable("workflowKey") String workflowKey, @PathVariable("workspaceId") String workspaceId)
			throws JsonProcessingException {
		return workFlowService.getProcessDefinition(workflowVersion, workflowKey, UUID.fromString(workspaceId));
	}

	@GetMapping("/get/webhook/workflow/{processDefinitionKey}/{workflowVersion}/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public WebHookVo getWebhook(@PathVariable("processDefinitionKey") String processDefinitionKey,
			@PathVariable("workflowVersion") Long workflowVersion, @PathVariable("workspaceId") String workspaceId)
			throws JsonProcessingException {
		return workFlowService.getWebHook(processDefinitionKey, workflowVersion, UUID.fromString(workspaceId));
	}

	@PostMapping("/start/workflow/{processDefinitionKey}/{workflowVersion}/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public TaskDetailsResponse startProcess(@PathVariable("processDefinitionKey") String processDefinitionKey,
			@PathVariable("workflowVersion") Long workflowVersion,
			@RequestBody(required = false) JsonNode webHookPayload, @PathVariable("workspaceId") String workspaceId)
			throws YoroFlowException, ParseException, JsonMappingException, JsonProcessingException {
		return workFlowService.startProcess(processDefinitionKey, workflowVersion, webHookPayload, null,
				UUID.fromString(workspaceId));
	}

	@PostMapping("/start/workflow/latest/{processDefinitionKey}/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public TaskDetailsResponse startLatestProcess(@PathVariable("processDefinitionKey") String processDefinitionKey,
			@RequestBody(required = false) JsonNode webHookPayload, @PathVariable("workspaceId") String workspaceId)
			throws YoroFlowException, ParseException, JsonMappingException, JsonProcessingException {
		return workFlowService.startProcess(processDefinitionKey, null, webHookPayload, null,
				UUID.fromString(workspaceId));
	}

	@PostMapping("/complete/step")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public TaskDetailsResponse completeProcess(@RequestBody TaskDetailsRequest taskDetailsRequest)
			throws YoroFlowException, ParseException {
		return flowEngineService.completeTask(taskDetailsRequest);
	}

	@PostMapping("/cancel-task")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public TaskDetailsResponse cancelUserTask(@RequestBody TaskDetailsRequest taskDetailsRequest)
			throws YoroFlowException, ParseException, JsonProcessingException {
		return flowEngineService.cancelUserTask(taskDetailsRequest);
	}

	@GetMapping(value = "/get/list/{propertyType}/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public List<ProcessDefinitionVO> getProcessDefinitionList(@PathVariable("propertyType") String propertyType,
			@PathVariable("workspaceId") String workspaceId) throws JsonProcessingException {
		return workFlowService.getProcessDefinitionList(propertyType, UUID.fromString(workspaceId));
	}
	
	@GetMapping(value = "/get-launch/list/{propertyType}/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public List<ProcessDefinitionVO> getProcessDefinitionListForLaunch(@PathVariable("propertyType") String propertyType,
			@PathVariable("workspaceId") String workspaceId) throws JsonProcessingException {
		return workFlowService.getProcessDefinitionListForLaunch(propertyType, workspaceId);
	}

	@GetMapping(value = "/get/list/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public List<ProcessDefinitionVO> getProcessDefinitionList(@PathVariable("workspaceId") String workspaceId)
			throws JsonProcessingException {
		return workFlowService.getProcessDefinitionList(UUID.fromString(workspaceId));
	}

	@GetMapping(value = "/get/list/app/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public List<ProcessDefinitionVO> getProcessDefinitionListForApp(@PathVariable("workspaceId") String workspaceId)
			throws JsonProcessingException {
		return workFlowService.getProcessDefinitionListForApp(UUID.fromString(workspaceId));
	}

	@GetMapping(value = "/get/workflow-list/button/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public List<ProcessDefinitionVO> getProcessDefinitionListForButtonAction(
			@PathVariable("workspaceId") String workspaceId) throws JsonProcessingException {
		return workFlowService.getProcessDefinitionListForButtonAction(UUID.fromString(workspaceId));
	}

	@GetMapping(value = "/get/workflow-list/api-key/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public List<ProcessDefinitionVO> getProcessDefinitionListForApiKey(@PathVariable("workspaceId") String workspaceId)
			throws JsonProcessingException {
		return workFlowService.getProcessDefinitionListForApiKey(UUID.fromString(workspaceId));
	}

	@GetMapping(value = "/get/workflow-version/{key}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public List<ProcessDefinitionVO> getWorkflowVersionListByKey(@PathVariable("key") String key)
			throws JsonProcessingException {
		return workFlowService.getWorkflowVersionListByKey(key);
	}

	@PostMapping("/create/adhocTask")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public AdhocTask adhocTask(@RequestParam("adhocTask") String adhocTask,
			@RequestParam(value = "files", required = false) List<MultipartFile> file) throws IOException {
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		AdhocTask adhocTaskVO = mapper.readValue(adhocTask, AdhocTask.class);
		return flowEngineService.saveAdhocTask(adhocTaskVO, file);
	}

	@PostMapping("/save/files")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public ResponseStringVO saveTaskFiles(@RequestParam("adhocTask") String adhocTask,
			@RequestParam(value = "files", required = false) List<MultipartFile> file) throws IOException {
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		mapper.enable(DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT);
		AdhocTask adhocTaskVO = mapper.readValue(adhocTask, AdhocTask.class);

		return flowEngineService.saveTaskFilesAttachments(adhocTaskVO, file);
	}

	@GetMapping(value = "/get/all/adhocTask")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public List<AdhocTask> getAdhocTaskList() {
		return flowEngineService.getAdhocTaskList();
	}

	@GetMapping(value = "/get/adhocTask/{processInstanceTaskId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public AdhocTask getAdhocTaskInfo(@PathVariable("processInstanceTaskId") String processInstanceTaskId) {
		return flowEngineService.getAdhocTaskDetails(UUID.fromString(processInstanceTaskId));
	}

	@PostMapping("/create/notes")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public ResponseStringVO createNotes(@RequestBody AdhocTask adhocTask) {
		return flowEngineService.saveTaskNotes(adhocTask);
	}

	@GetMapping("/delete/note/{notesId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public ResponseStringVO deleteNotes(@PathVariable("notesId") UUID notesId) {
		return flowEngineService.deleteTaskNotes(notesId);
	}

	@GetMapping("/delete/file/{fileId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public ResponseStringVO deleteFiles(@PathVariable("fileId") UUID fileId) {
		return flowEngineService.deleteTaskFiles(fileId);
	}

	@GetMapping(value = "/get/notes/{processInstanceTaskId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public List<TaskNotesVO> getTaskNotesInfo(@PathVariable("processInstanceTaskId") String processInstanceTaskId) {
		return flowEngineService.getTaskNotes(UUID.fromString(processInstanceTaskId));
	}

	@GetMapping(value = "/get/files/{processInstanceTaskId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public List<TaskFilesVO> getTaskFilesInfo(@PathVariable("processInstanceTaskId") String processInstanceTaskId) {
		return flowEngineService.getTaskFiles(UUID.fromString(processInstanceTaskId));
	}

	@GetMapping(value = "/show/files/{fileId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public ResponseEntity<byte[]> showFiles(@PathVariable("fileId") UUID fileId) {
		byte[] document = flowEngineService.showFiles(fileId);
		HttpHeaders header = new HttpHeaders();
		header.setContentType(new MediaType("application", "png"));
		header.setContentLength(document.length);
		return new ResponseEntity<>(document, header, HttpStatus.OK);
	}

	@GetMapping(value = "/check/name/{workflowName}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public ResponseStringVO checkWorkflowAlreadyExistByName(@PathVariable("workflowName") String workflowName) {
		return workFlowService.checkWorkflowByName(workflowName);
	}

	@GetMapping(value = "/check/key/{workflowKey}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public ResponseStringVO checkWorkflowAlreadyExistByKey(@PathVariable("workflowKey") String workflowKey) {
		return workFlowService.checkWorkflowByKey(workflowKey);
	}

	@PostMapping(value = "/get/assign/fields/{taskKey}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public Set<PageFieldVo> getAssignFields(@PathVariable("taskKey") String taskKey, @RequestBody JsonNode workflowJson)
			throws YoroFlowException {
		return workFlowService.getPageFields(taskKey, workflowJson, false);
	}

	@GetMapping(value = "/get/initial-values/{instanceTaskId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public Map<String, Object> getInitialValues(@PathVariable("instanceTaskId") String instanceTaskId) {
		return flowEngineService.getInitialValues(UUID.fromString(instanceTaskId), true);
	}

	@GetMapping(value = "/publish/workflow/{workflowVersion}/{workflowKey}/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public ResponseStringVO publishProcessDefinition(@PathVariable("workflowVersion") Long workflowVersion,
			@PathVariable("workflowKey") String workflowKey, @PathVariable("workspaceId") String workspaceId)
			throws JsonProcessingException, YoroFlowException {
		return workFlowService.publishProcessDefinition(workflowVersion, workflowKey, UUID.fromString(workspaceId));
	}

	@GetMapping(value = "get/fields/{workflowKey}/{workflowVersion}/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public List<FieldVO> getWebServiceFieldValues(@PathVariable("workflowKey") String workflowKey,
			@PathVariable("workflowVersion") Long workflowVersion, @PathVariable("workspaceId") String workspaceId)
			throws JsonProcessingException {
		return workFlowService.getWebServiceFieldValues(workflowKey, workflowVersion, UUID.fromString(workspaceId));
	}

	@GetMapping("/get/table-names")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public List<TableObjectsVO> getTableNames() {
		return workFlowService.getTableNames();
	}

	@GetMapping("/get/field-names/{tableObjectId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public List<TableObjectsColumnsVO> getTableColumnNames(@PathVariable(name = "tableObjectId") String tableObjectId) {
		return workFlowService.getFieldNames(UUID.fromString(tableObjectId));
	}

	@PostMapping("/save/task-data/draft/{saveAsDraft}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public ResponseStringVO saveTaskDataAsDraft(@RequestBody JsonNode taskData, @PathVariable("saveAsDraft") Boolean saveAsDraft) throws IOException {
		List<MultipartFile> file = new ArrayList<MultipartFile>();
		return workFlowService.saveTaskInfoAsDraft(taskData, file, saveAsDraft);
	}

	@GetMapping("/get/form/workflow/{processDefinitionKey}/{workflowVersion}/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public ManualLaunchVo getDataForManualLaunch(@PathVariable("processDefinitionKey") String processDefinitionKey,
			@PathVariable("workflowVersion") Long workflowVersion, @PathVariable("workspaceId") String workspaceId)
			throws JsonProcessingException {
		return workFlowService.getDataForManualLaunch(processDefinitionKey, workflowVersion,
				UUID.fromString(workspaceId));
	}

	@GetMapping("/get/message/{processDefinitionKey}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public String getMessageInfo(@PathVariable("processDefinitionKey") String processDefinitionKey)
			throws JsonMappingException, JsonProcessingException {
		return workFlowService.getMessage(processDefinitionKey);
	}

	@GetMapping("/get/default-time-zone")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public TimeZoneVo getDefaultTimeZone() {
		return workFlowService.getDefaultTimeZone();
	}

	@GetMapping("/get/workflow-applications/count/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public ProcessDefinitionVO getWorkflowlistCount(@PathVariable("workspaceId") String workspaceId) {
		return workFlowService.getProcessDefinitionListCount(UUID.fromString(workspaceId));
	}

	@GetMapping("/get/workflow/list/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public List<ProcessDefinitionVO> getProcessDefinitionListForImport(@PathVariable("workspaceId") String workspaceId)
			throws JsonProcessingException {
		return workFlowService.getProcessDefinitionListForImport(UUID.fromString(workspaceId));
	}

	@PostMapping("/save/pin")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public ResponseStringVO saveProcessDefinitionPin(@RequestBody EnablePinVO enablePinVO) {
		return workFlowService.saveProcessDefinitionPin(enablePinVO);
	}

	@GetMapping("/get/pin-workflows/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public List<ProcessDefinitionVO> getProcessDefinitionListForPin(@PathVariable("workspaceId") String workspaceId)
			throws JsonProcessingException {
		return workFlowService.getProcessDefinitionList("true", UUID.fromString(workspaceId));
	}

	@GetMapping("/get/upload-workflow/{processDefinitionName}/{version}/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public List<SMSKeyWorkflowVO> getSMSServiceProvider() {
		return workFlowService.getSMSProviders();
	}

	@GetMapping("/get/upload-workflow/{processDefinitionName}/{version}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public WorkFlow getWorkflow(@PathVariable(name = "processDefinitionName") String processDefinitionName,
			@PathVariable(name = "version") long version, @PathVariable("workspaceId") String workspaceId)
			throws JsonProcessingException {
		return workFlowService.getWorkflow(processDefinitionName, version, UUID.fromString(workspaceId));
	}

	@GetMapping("/uninstall/workflow/{processDefinitionName}/{key}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public ResponseStringVO uninstallWorkflow(
			@PathVariable(name = "processDefinitionName") String processDefinitionName,
			@PathVariable(name = "key") String key) {
		return workFlowService.uninstallWorkflow(processDefinitionName, key);
	}

	@GetMapping("/save/upload/workflow/{processDefinitionName}/{version}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public ResponseStringVO uploadWorkflowByProcessDefinition(
			@PathVariable(name = "processDefinitionName") String processDefinitionName,
			@PathVariable(name = "version") long version) {
		return workFlowService.uploadWorkflow(processDefinitionName, version);
	}

	@GetMapping("/get/upload/processDefinitionList/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public List<ProcessDefinitionVO> getUploadWorkflowList(@PathVariable("workspaceId") String workspaceId)
			throws JsonProcessingException {
		return workFlowService.getUploadWorkflowList(UUID.fromString(workspaceId));
	}

	@GetMapping("/save/install/workflow/{key}/{version}/{type}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public ResponseStringVO installWorkflow(@PathVariable(name = "key") String key,
			@PathVariable(name = "version") long version, @PathVariable(name = "type") String type) {
		return workFlowService.installworkflow(key, version, type);
	}

	@GetMapping(value = "/get/draft-task/{processDefinitionId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public ProcessInstanceUserTaskVO getDraftInstanceTask(
			@PathVariable("processDefinitionId") String processDefinitionId) {
		return workFlowService.getInstanceTask(UUID.fromString(processDefinitionId));
	}

	@PostMapping("/license/is-allowed")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public LicenseVO isWorkflowAllowed(@RequestBody LicenseVO licenseVO) {
		return workFlowService.isAllowed(licenseVO);
	}

	@GetMapping("/name-list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public List<WorkflowNamesVO> getWorkflowNamesList() {
		return workFlowService.getWorkflowNameList();
	}

	@GetMapping("/get-workflow-count")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest','Billing Administrator'})")
	public ResponseStringVO getWorkflowCount() {
		return workFlowService.getWorkflowCount();
	}

	@PostMapping("/install-app")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator'})")
	public ResponseStringVO saveTaskboardFromApps(@RequestBody AppsVo appsVo) throws IOException, ParseException {
		return workFlowService.saveWorkflowFromApps(appsVo);
	}

	@GetMapping(value = "/get/workflow-dashboard/list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Billing Administrator','Workflow User','User','Guest'})")
	public List<ProcessDefinitionVO> getProcessDefinitionListWithoutWorkspace() {
		return workFlowService.getProcessDefinitionListWithoutWorkspace();
	}

	@PostMapping("/inactivate-workflow")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Billing Administrator'})")
	public ResponseStringVO inactivateWorkflows(@RequestBody SubscriptionExpireVO subscriptionExpireVO)
			throws IOException {
		return workFlowService.inactivateWorkflow(subscriptionExpireVO);
	}
}
