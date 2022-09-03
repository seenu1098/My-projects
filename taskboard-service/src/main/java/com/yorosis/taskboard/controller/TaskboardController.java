package com.yorosis.taskboard.controller;

import java.io.IOException;
import java.text.ParseException;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.yorosis.taskboard.exceptions.YoroFlowException;
import com.yorosis.taskboard.models.AssignTaskVO;
import com.yorosis.taskboard.models.FilesVO;
import com.yorosis.taskboard.models.PageFieldVo;
import com.yorosis.taskboard.models.ReplaceColumnVO;
import com.yorosis.taskboard.models.ResponseStringVO;
import com.yorosis.taskboard.models.Subtask;
import com.yorosis.taskboard.models.TaskCommentsVO;
import com.yorosis.taskboard.models.TaskGroupByVO;
import com.yorosis.taskboard.models.TaskSequenceVO;
import com.yorosis.taskboard.models.TaskboardColumnMapVO;
import com.yorosis.taskboard.models.TaskboardColumnsVO;
import com.yorosis.taskboard.models.TaskboardExcelVO;
import com.yorosis.taskboard.models.TaskboardLabelsVO;
import com.yorosis.taskboard.models.TaskboardSecurityVO;
import com.yorosis.taskboard.models.TaskboardTaskLabelVO;
import com.yorosis.taskboard.models.TaskboardTaskVO;
import com.yorosis.taskboard.models.TaskboardVO;
import com.yorosis.taskboard.repository.CustomersRepository;
import com.yorosis.taskboard.services.GridViewService;
import com.yorosis.taskboard.services.ProxyYoroflowSchemaService;
import com.yorosis.taskboard.services.TaskboardService;
import com.yorosis.taskboard.taskboard.entities.Customers;
import com.yorosis.yoroapps.apps.vo.AppsVo;
import com.yorosis.yoroapps.vo.LicenseVO;
import com.yorosis.yoroapps.vo.ReactiveOrInactiveUsers;
import com.yorosis.yoroapps.vo.SubscriptionExpireVO;
import com.yorosis.yoroapps.vo.TaskboardNamesVO;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@RestController
@RequestMapping("/taskboard/v1/")
public class TaskboardController {
	@Autowired
	private TaskboardService taskboardService;

	@Autowired
	private GridViewService gridViewService;

	@Autowired
	private CustomersRepository customersRepository;

	@Autowired
	private ProxyYoroflowSchemaService proxyYoroflowSchemaService;

	@PostMapping("/save/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO saveAndUpdateTaskboard(@RequestBody TaskboardVO vo,
			@PathVariable("workspaceId") String workspaceId) throws IOException, ParseException {
		return taskboardService.saveTaskBoard(vo, UUID.fromString(workspaceId), false);
	}

	@GetMapping("/license/is-allowed")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public LicenseVO isAllowed() {
		return taskboardService.isAllowed();
	}

	@GetMapping("/delete/{taskboardId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User',"
			+ "'Taskboard User'})")
	public ResponseStringVO deleteTaskboard(@PathVariable(name = "taskboardId") String taskboardId) {
		return taskboardService.deleteTaskboard(UUID.fromString(taskboardId));
	}

	@GetMapping("/get-user-license/taskboard")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public LicenseVO getLicenseTaskboard() {
		return taskboardService.getUserLicenseForTaskboard();
	}

	@GetMapping("/get/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public TaskboardVO getTaskboardDetails(@PathVariable(name = "id") String id) throws IOException, ParseException {
		return taskboardService.getTaskboardDetails(UUID.fromString(id), "all", true);
	}

	@GetMapping("/get/{id}/{type}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public TaskboardVO getInitialTaskboardDetails(@PathVariable(name = "id") String id,
			@PathVariable(name = "type") int index) throws IOException, ParseException {
		return taskboardService.getTaskBoardRecordsByType(UUID.fromString(id), index, null);
	}

	@GetMapping("/get-sprint-task/{id}/{sprintId}/{type}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public TaskboardVO getInitialTaskboardDetailsForSprint(@PathVariable(name = "id") String id,
			@PathVariable(name = "sprintId") String sprintId, @PathVariable(name = "type") int index)
			throws IOException, ParseException {
		return taskboardService.getTaskBoardRecordsByType(UUID.fromString(id), index, UUID.fromString(sprintId));
	}

	@GetMapping("/get/done/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public List<TaskboardTaskVO> getTaskboardDoneDetails(@PathVariable(name = "id") String id)
			throws IOException, ParseException {
		return taskboardService.getDoneTask(UUID.fromString(id), true, null);
	}

	@GetMapping("/get/done-sprint-task/{id}/{sprintId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public List<TaskboardTaskVO> getTaskboardDoneDetailsBySprint(@PathVariable(name = "id") String id,
			@PathVariable(name = "sprintId") String sprintId) throws IOException, ParseException {
		return taskboardService.getDoneTask(UUID.fromString(id), true, UUID.fromString(sprintId));
	}

	@GetMapping("/get-all/done/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public List<TaskboardTaskVO> getAllTaskboardDoneDetails(@PathVariable(name = "id") String id)
			throws IOException, ParseException {
		return taskboardService.getDoneTask(UUID.fromString(id), false, null);
	}

	@GetMapping("/get/all-task/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public TaskboardVO getTaskboardDetailsForLastColumn(@PathVariable(name = "id") String id)
			throws IOException, ParseException {
		return taskboardService.getTaskboardDetails(UUID.fromString(id), "all", false);
	}

	@GetMapping("/get/archive-task/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public TaskboardVO getTaskboardDetailsForArchivedTasks(@PathVariable(name = "id") String id)
			throws IOException, ParseException {
		return taskboardService.getTaskboardDetails(UUID.fromString(id), "Archived", false);
	}

	@GetMapping("/get/deleted-task/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public TaskboardVO getTaskboardDetailsForDeletedTasks(@PathVariable(name = "id") String id)
			throws IOException, ParseException {
		return taskboardService.getTaskboardDetails(UUID.fromString(id), "deleted", false);
	}

	@PostMapping("/save/taskboard-task")
	public ResponseStringVO saveAndUpdateTaskboardTask(@RequestBody TaskboardTaskVO vo,
			@RequestHeader(name = "referer", required = false) String header) throws JsonProcessingException {
		try {
			if (YorosisContext.get() == null) {
				YorosisContext.set(getContext(header));
			}
			return taskboardService.saveTaskboardTask(vo);
		} finally {
			YorosisContext.clear();
		}
	}

	@PostMapping("/save/taskboard-task/app")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO saveAndUpdateTaskboardTaskApp(@RequestBody TaskboardTaskVO vo)
			throws JsonProcessingException {
		return taskboardService.saveTaskboardTask(vo);
	}

	@PostMapping("/save/taskboard-task-title")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO saveAndUpdateTaskboardTaskTitleApp(@RequestBody TaskboardTaskVO vo)
			throws JsonProcessingException {
		return taskboardService.saveTaskTitle(vo);
	}

	@PostMapping("/save/taskboard-status")
	public ResponseStringVO saveTaskboardStatus(@RequestBody TaskboardTaskVO vo) throws JsonProcessingException {
		return taskboardService.saveStatusChange(vo);
	}

	@GetMapping("/get/taskboard-task/{id}")
	public TaskboardTaskVO getTaskboardTaskDetails(@PathVariable(name = "id") String id) throws IOException {
		return taskboardService.getTaskboardTaskDetails(UUID.fromString(id), null);
	}

	@GetMapping("/get/taskboard-task/{id}/{sprintId}")
	public TaskboardTaskVO getTaskboardTaskDetailsBySprint(@PathVariable(name = "id") String id,
			@PathVariable(name = "sprintId") String sprintId) throws IOException {
		return taskboardService.getTaskboardTaskDetails(UUID.fromString(id), UUID.fromString(sprintId));
	}

	@GetMapping("/get/taskboard-task/public/{taskboardKey}/{taskId}")
	public TaskboardTaskVO getTaskboardTaskDetail(@PathVariable(name = "taskboardKey") String taskboardKey,
			@PathVariable(name = "taskId") String taskId, @RequestHeader("referer") String origin) throws IOException {
		String header = StringUtils.lowerCase(StringUtils.trim(origin));
		return proxyYoroflowSchemaService.getTaskboardTask(header, taskboardKey, taskId);
	}

	@GetMapping("/get/task/{taskboardId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public List<TaskboardTaskVO> getTaskboardTaskDetailsByTaskboardId(
			@PathVariable(name = "taskboardId") String taskboardId) {
		return taskboardService.getTaskboardTaskList(UUID.fromString(taskboardId));
	}

	@GetMapping("/get/all-taskboard-task/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public List<TaskboardVO> getAllTaskboardTasks(@PathVariable("workspaceId") String workspaceId) throws IOException {
		return taskboardService.getAllTaskboards(UUID.fromString(workspaceId));
	}

	@GetMapping("/get/taskboard-labels/{taskboardId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public TaskboardLabelsVO getTaskboardLabels(@PathVariable(name = "taskboardId") String taskboardId)
			throws IOException {
		return taskboardService.getTaskboardLabelsList(UUID.fromString(taskboardId));
	}

	@PostMapping("/save/taskboard-labels")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO saveTaskboardLabels(@RequestBody TaskboardLabelsVO vo) throws JsonProcessingException {
		return taskboardService.saveTaskboardLabel(vo);
	}

	@GetMapping("/get/generated-task-id-list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public TaskboardVO getGeneratedTaskIdList() {
		return taskboardService.getGeneratedTaskIdList();
	}

	@GetMapping("/get/taskboard-by-key/{taskboardKey}")
	public TaskboardVO getTaskboardByKey(@PathVariable(name = "taskboardKey") String taskboardKey,
			@RequestHeader("referer") String header) throws IOException {

		try {
			if (YorosisContext.get() == null) {
				YorosisContext.set(getContext(header));
			}
			return taskboardService.getTaskBoardIdByKey(taskboardKey);
		} finally {
			YorosisContext.clear();
		}
	}

	private YorosisContext getContext(String header) {
		String[] arrOfStr = header.split("//", 2);
		String[] url = arrOfStr[1].split("[.]", 2);
		String domain = url[0].toString();
		Customers customer = customersRepository.findBySubdomainNameIgnoreCaseAndActiveFlagIgnoreCase(domain,
				YorosisConstants.YES);
		if (customer != null) {
			YorosisContext.set(YorosisContext.builder().tenantId(customer.getTenantId()).build());
			return YorosisContext.builder().tenantId(customer.getTenantId())
					.userName(taskboardService.getUserNameByTenantId()).build();
		}
		return YorosisContext.builder().build();
	}

	@GetMapping("/check-taskboard-name/{name}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO checkTaskboardName(@PathVariable(name = "name") String taskboardName) {
		return taskboardService.checkTaskboardName(taskboardName);
	}

	@GetMapping("/check-taskboard-key/{key}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO checkTaskboardKey(@PathVariable(name = "key") String key) {
		return taskboardService.checkTaskboardKey(key);
	}

	@PostMapping(path = "/upload-file")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO attachFile(@RequestParam("taskId") String taskId, @RequestParam("name") String name,
			@RequestParam(value = "files[]", required = false) MultipartFile file)
			throws IOException, YoroFlowException {
		return taskboardService.saveAttachments(taskId, name, file);
	}

	@PostMapping(path = "app/upload-file")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO attachFiles(@RequestParam("taskId") String taskId, @RequestParam("name") String name,
			@RequestParam(value = "files", required = false) MultipartFile file) throws IOException, YoroFlowException {
		return taskboardService.saveAttachments(taskId, name, file);
	}

	@GetMapping(value = "/download/file/{fileId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseEntity<byte[]> showFiles(@PathVariable("fileId") UUID fileId) throws IOException {
		byte[] document = taskboardService.getFile(fileId);
		HttpHeaders header = new HttpHeaders();
		header.setContentType(new MediaType("application", "png"));
		header.setContentLength(document.length);
		return new ResponseEntity<>(document, header, HttpStatus.OK);
	}

	@PostMapping(value = "/delete/file")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO deleteFiles(@RequestBody FilesVO vo) throws IOException {
		return taskboardService.deleteFile(vo);
	}

	@PostMapping(value = "/save/taskboard-security")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO saveTaskboardSecurity(@RequestBody TaskboardSecurityVO vo) throws IOException {
		return taskboardService.saveTaskboardSecurity(vo);
	}

	@PostMapping(value = "/save/taskboard-column-security")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO saveTaskboardColumnSecurity(@RequestBody TaskboardSecurityVO vo) throws IOException {
		return taskboardService.saveTaskboardColumnSecurity(vo);
	}

	@GetMapping(value = "/get/taskboard-security/{taskboardId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public TaskboardSecurityVO getTaskboardSecurity(@PathVariable("taskboardId") String taskboardId) {
		return taskboardService.getTaskboardSecurity(taskboardId);
	}

	@PostMapping("/save/assign-task")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO saveAssignTask(@RequestBody AssignTaskVO vo) throws JsonProcessingException {
		return taskboardService.saveAssignTask(vo);
	}

	@PostMapping("/save/sub-task")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO saveSubTasks(@RequestBody TaskboardTaskVO vo) throws JsonProcessingException {
		return taskboardService.saveSubTasks(vo);
	}

	@PostMapping("/save/task-comments")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO saveTaskComments(@RequestBody TaskboardTaskVO vo) {
		return taskboardService.saveTaskComments(vo);
	}

	@PostMapping("/save/taskboard-owners")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO saveTaskboardOwners(@RequestBody TaskboardSecurityVO vo) {
		return taskboardService.saveTaskboardOwners(vo);
	}

	@PostMapping("/save/update-column-color")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO saveUpdateColumnColor(@RequestBody TaskboardColumnsVO vo) {
		return taskboardService.updateColumnColor(vo);
	}

	@PostMapping("/replace/column-name")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO replaceColumnName(@RequestBody ReplaceColumnVO replaceColumnVO) {
		return taskboardService.replaceColumnName(replaceColumnVO);
	}

	@PostMapping("/update/sequence-number")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO updateSequenceNumber(@RequestBody TaskSequenceVO taskSequenceVO) {
		return taskboardService.updateSequenceNumber(taskSequenceVO);
	}

	@PostMapping("/save/assign-users")
	public ResponseStringVO saveAssignUser(@RequestBody TaskboardTaskVO vo) throws JsonProcessingException {
		return taskboardService.saveAssignUsers(vo);
	}

	@GetMapping("/remove/sub-task/{taskId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO removeSubtasks(@PathVariable(name = "taskId") String taskId)
			throws JsonProcessingException {
		return taskboardService.removeSubtask(taskId);
	}

	@PostMapping("/save/subtask")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO saveSubtask(@RequestBody Subtask vo) throws JsonProcessingException {
		return taskboardService.saveSubtask(vo);
	}

	@PostMapping("/save/description")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO saveDescription(@RequestBody TaskboardTaskVO vo) throws JsonProcessingException {
		return taskboardService.saveDescription(vo);
	}

	@PostMapping("/save/taskboard/labels")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO saveTaskboardLabel(@RequestBody TaskboardLabelsVO vo) {
		return taskboardService.saveTaskboardLabel(vo);
	}

	@PostMapping("/save/taskboard-task/labels")
	public ResponseStringVO saveTaskboardTaskLabel(@RequestBody TaskboardTaskLabelVO vo)
			throws JsonMappingException, JsonProcessingException {
		return taskboardService.saveTaskboardTaskLabel(vo);
	}

	@GetMapping("/remove/taskboard-label/{taskboardTaskLabelId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO getTaskboardLabelsList(
			@PathVariable(name = "taskboardTaskLabelId") String taskboardTaskLabelId) throws JsonProcessingException {
		return taskboardService.removeTaskboartaskLabel(UUID.fromString(taskboardTaskLabelId));
	}

	@PostMapping("/save/task/comments")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO saveTaskComments(@RequestBody TaskCommentsVO vo) throws JsonProcessingException {
		return taskboardService.saveTaskComment(vo);
	}

	@PostMapping("/save/task-date")
	public ResponseStringVO saveTaskStartAndDueDate(@RequestBody TaskboardTaskVO vo) throws JsonProcessingException {
		return taskboardService.saveTaskStartAndDueDate(vo);
	}

	@GetMapping("/get/files/{taskId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public List<FilesVO> getFiles(@PathVariable(name = "taskId") String taskId) {
		return taskboardService.getFiles(UUID.fromString(taskId));
	}

	@PostMapping("/get/taskboard-task-by-user")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public List<TaskboardColumnMapVO> getTaskboardTaskByUser(@RequestBody AssignTaskVO vo) throws IOException {
		return taskboardService.getTaskboardTaskByUsers(vo, null);
	}

	@PostMapping("/get/taskboard-task-by-user/{sprintId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public List<TaskboardColumnMapVO> getTaskboardTaskByUserWithSprint(@RequestBody AssignTaskVO vo,
			@PathVariable(name = "sprintId") String sprintId) throws IOException {
		return taskboardService.getTaskboardTaskByUsers(vo, UUID.fromString(sprintId));
	}

	@DeleteMapping("/delete/task/{taskId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO deleteTask(@PathVariable(name = "taskId") String taskId) {
		return taskboardService.deleteTask(UUID.fromString(taskId));
	}

	@GetMapping("/undelete/task/{taskId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO undoDeleteTask(@PathVariable(name = "taskId") String taskId) {
		return taskboardService.undoDeleteTask(UUID.fromString(taskId));
	}

	@GetMapping("/archive/task/{taskId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO archiveTask(@PathVariable(name = "taskId") String taskId) {
		return taskboardService.changeStatusToArchive(UUID.fromString(taskId));
	}

	@GetMapping("/unarchive/task/{taskId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO unArchiveTask(@PathVariable(name = "taskId") String taskId) {
		return taskboardService.unArchiveTask(UUID.fromString(taskId));
	}

	@PostMapping("/save/task-priority")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO savePriority(@RequestBody TaskboardTaskVO vo) throws JsonProcessingException {
		return taskboardService.savePriority(vo);
	}

	@GetMapping("/get/all-tasks/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public List<TaskboardTaskVO> getAllTasks(@PathVariable(name = "id") String id) throws IOException {
		return taskboardService.getAllTasks(UUID.fromString(id));
	}

	@GetMapping("/name-list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public List<TaskboardNamesVO> getTaskboardNamesList() {
		return taskboardService.getTaskBoardNameList();
	}

	@GetMapping("/get-taskboard-count")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User','Billing Administrator'})")
	public ResponseStringVO getTotalTaskboardCount() {
		return taskboardService.getTotalTaskboardCount();
	}

	@PostMapping("/install-app")
	public ResponseStringVO saveTaskboardFromApps(@RequestBody AppsVo appsVo) throws IOException, ParseException {
		return taskboardService.saveTaskBoardFromApps(appsVo);
	}

	@PostMapping("/reactive-users")
	public ResponseStringVO saveReactiveUsers(@RequestBody ReactiveOrInactiveUsers reactiveOrInactiveUsers)
			throws IOException, ParseException {
		return taskboardService.saveReactiveUser(reactiveOrInactiveUsers);
	}

	@PostMapping("/inactive-users")
	public ResponseStringVO saveInactiveUsers(@RequestBody ReactiveOrInactiveUsers reactiveOrInactiveUsers)
			throws IOException, ParseException {
		return taskboardService.saveInactiveUser(reactiveOrInactiveUsers);
	}

	@GetMapping("/check-waiting-on/{taskboardTaskId}")
	public TaskboardTaskVO checkWaitingOn(@PathVariable(name = "taskboardTaskId") String taskboardTaskId)
			throws IOException, ParseException {
		return taskboardService.checkWaitingOn(UUID.fromString(taskboardTaskId));
	}

	@GetMapping("/delete/column/{columnId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User',"
			+ "'Taskboard User'})")
	public ResponseStringVO removedTaskboardColumnsById(@PathVariable(name = "columnId") String columnId) {
		return taskboardService.removedTaskboardColumnsById(columnId);
	}

	@GetMapping(path = "/get-initial-fields")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Taskboard User'})")
	public Set<PageFieldVo> getFieldListForTaskboard() {
		return taskboardService.getPageFieldVoForTaskboard();
	}

	@GetMapping(path = "/get-initial-fields/automation/{pageId}/{pageVersion}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Taskboard User'})")
	public Set<PageFieldVo> getFieldListForTaskboard(@PathVariable(name = "pageId") String pageId,
			@PathVariable(name = "pageVersion") Long pageVersion) {
		return taskboardService.getPageFieldVoForTaskboardAutomation(pageId, pageVersion);
	}

	@GetMapping(path = "/resolve-initial-fields/{taskboardId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Taskboard User'})")
	public TaskboardVO getInitialMapValue(@PathVariable(name = "taskboardId") String taskboardId) {
		return taskboardService.getInitialMapValue(UUID.fromString(taskboardId));
	}

	@PostMapping("/inactivate-taskboard")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Billing Administrator'})")
	public ResponseStringVO inactivateTaskboards(@RequestBody SubscriptionExpireVO subscriptionExpireVO)
			throws IOException {
		return taskboardService.inactivateTaskboard(subscriptionExpireVO);
	}

	@PostMapping("/get-excel")
	@Transactional(readOnly = true)
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public void getExcelData(@RequestBody TaskboardExcelVO taskboardExcelVO, HttpServletResponse response)
			throws YoroFlowException, ParseException {
		taskboardService.getExcel(taskboardExcelVO, response);
	}

	@PostMapping(path = "/is-empty-taskboard")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public TaskboardExcelVO isEmptyTaskboard(@RequestBody TaskboardExcelVO taskboardExcelVO) {
		return taskboardService.isEmptyTaskboard(taskboardExcelVO);
	}

	@PostMapping(path = "/get-group-by-task")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public TaskboardVO getGroupTaskBy(@RequestBody TaskGroupByVO taskGroupByVO) throws IOException {
		return taskboardService.getGroupByTask(taskGroupByVO);
	}

	@PostMapping(path = "/get-assignee-group-by-horizontal")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public TaskboardVO getAssigneeGroupTaskByHorizontal(@RequestBody TaskGroupByVO taskGroupByVO) throws IOException {
		return taskboardService.getAssigneeTasksByHorizontal(taskGroupByVO);
	}

	@PostMapping(path = "/get-assignee-group-by-vertical")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public TaskboardVO getAssigneeGroupTaskByVertical(@RequestBody TaskGroupByVO taskGroupByVO) throws IOException {
		return taskboardService.getAssigneeTasksByVertical(taskGroupByVO);
	}

	@PostMapping(path = "/get-grid-view")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public TaskboardVO getGridView(@RequestBody TaskGroupByVO taskGroupByVO) throws IOException {
		return gridViewService.getGroupByTask(taskGroupByVO);
	}

	@PostMapping(path = "/get-assignee-combinations")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public TaskboardVO getAssigneeCobinations(@RequestBody TaskGroupByVO taskGroupByVO) throws IOException {
		return gridViewService.getAssigneeCombinations(taskGroupByVO);
	}

	@PostMapping(path = "/get-done-filter")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public List<TaskboardTaskVO> getDoneTaskForFilters(@RequestBody TaskGroupByVO taskGroupByVO) throws IOException {
		return taskboardService.getDoneTaskForFilters(taskGroupByVO);
	}

	@PostMapping(path = "/get-done-filter-count")
//	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public TaskboardVO getDoneTaskForFiltersCount(@RequestBody TaskGroupByVO taskGroupByVO) throws IOException {
		return taskboardService.getDoneTaskForFiltersCount(taskGroupByVO);
	}

}
