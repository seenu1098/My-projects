package com.yorosis.yoroflow.controller;

import java.io.IOException;
import java.text.ParseException;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroflow.models.PaginationVO;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.models.TaskboardTaskVO;
import com.yorosis.yoroflow.models.sprint.SaveSprintVo;
import com.yorosis.yoroflow.models.sprint.SprintSettingsVo;
import com.yorosis.yoroflow.models.sprint.SprintTasksVo;
import com.yorosis.yoroflow.models.sprint.SprintsVO;
import com.yorosis.yoroflow.models.sprint.WorkLogListVo;
import com.yorosis.yoroflow.models.sprint.WorkLogVo;
import com.yorosis.yoroflow.services.TaskboardSprintService;

@RestController
@RequestMapping("/sprint/v1/")
public class TaskboardSprintController {

	@Autowired
	private TaskboardSprintService taskboardSprintService;

	@PostMapping("/save-sprint-setting")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Taskboard User'})")
	public ResponseStringVO saveAndUpdateSprintSettings(@RequestBody SprintSettingsVo vo)
			throws IOException, ParseException {
		return taskboardSprintService.saveAndUpdateSprintSetting(vo, null);
	}

	@GetMapping("/delete-sprint-setting/{sprintSettingsId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Taskboard User'})")
	public ResponseStringVO deleteSprintSettings(@PathVariable("sprintSettingsId") String sprintSettingsId)
			throws IOException, ParseException {
		return taskboardSprintService.deleteSprintSettings(UUID.fromString(sprintSettingsId));
	}

	@PostMapping("/save-sprint")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Taskboard User'})")
	public SaveSprintVo saveAndUpdateSprint(@RequestBody SprintsVO vo) throws IOException, ParseException {
		return taskboardSprintService.saveAndUpdateSprint(vo);
	}

	@GetMapping("/get/in-preparation-sprint/{taskboardId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Taskboard User'})")
	public List<SprintsVO> getSprintWithInPreparationByTaskboard(@PathVariable("taskboardId") String taskboardId)
			throws IOException, ParseException {
		return taskboardSprintService.getSprintWithInPreparationByTaskboard(UUID.fromString(taskboardId));
	}

	@GetMapping("/sprint/delete/{sprintId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Taskboard User'})")
	public ResponseStringVO deleteSprint(@PathVariable("sprintId") String sprintId) throws IOException, ParseException {
		return taskboardSprintService.deleteSprint(UUID.fromString(sprintId));
	}

	@GetMapping("/sprint/start/{sprintId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Taskboard User'})")
	public ResponseStringVO startSprint(@PathVariable("sprintId") String sprintId) throws IOException, ParseException {
		return taskboardSprintService.startSprint(UUID.fromString(sprintId));
	}

	@GetMapping("/sprint/check-start/{sprintId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Taskboard User'})")
	public ResponseStringVO checkStartSprint(@PathVariable("sprintId") String sprintId)
			throws IOException, ParseException {
		return taskboardSprintService.checkStartSprint(UUID.fromString(sprintId));
	}

	@GetMapping("/sprint/complete/{sprintId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Taskboard User'})")
	public ResponseStringVO completeSprint(@PathVariable("sprintId") String sprintId)
			throws IOException, ParseException {
		return taskboardSprintService.completeSprint(UUID.fromString(sprintId));
	}

	@PostMapping("/sprint-task/save")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Taskboard User'})")
	public ResponseStringVO saveAndUpdateSprintTask(@RequestBody SprintTasksVo vo) throws IOException, ParseException {
		return taskboardSprintService.saveAndUpdateSprintTasks(vo);
	}

	@PostMapping("/sprint-task/delete")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Taskboard User'})")
	public ResponseStringVO deleteSprintTask(@RequestBody SprintTasksVo vo) throws IOException, ParseException {
		return taskboardSprintService.deleteSprintTask(vo);
	}

	@PostMapping("/save/task-estimate-hours")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Taskboard User'})")
	public ResponseStringVO addEstimateHoursForTask(@RequestBody TaskboardTaskVO vo)
			throws IOException, ParseException {
		return taskboardSprintService.addEstimateHoursForTask(vo);
	}

	@PostMapping("/save/original-points")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Taskboard User'})")
	public ResponseStringVO addOriginalPointsForTask(@RequestBody TaskboardTaskVO vo)
			throws IOException, ParseException {
		return taskboardSprintService.addOriginalPointsForTask(vo);
	}

	@GetMapping("/get/remaining-hours/{sprintTaskId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Taskboard User'})")
	public TaskboardTaskVO getRemainingHours(@PathVariable("sprintTaskId") String sprintTaskId)
			throws IOException, ParseException {
		return taskboardSprintService.getRemainingHours(UUID.fromString(sprintTaskId));
	}

	@PostMapping("/get/work-log")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Taskboard User'})")
	public WorkLogListVo getWorkLogList(@RequestBody PaginationVO vo) throws IOException, ParseException {
		return taskboardSprintService.getWorklogList(vo);
	}

	@PostMapping("/save/work-log")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Taskboard User'})")
	public ResponseStringVO saveWorkLogList(@RequestBody WorkLogVo workLogVo) throws IOException, ParseException {
		return taskboardSprintService.saveWorklog(workLogVo);
	}
}
