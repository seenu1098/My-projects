package com.yorosis.yoroflow.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroflow.process.service.TaskProcessorService;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;
import com.yorosis.yoroflow.schedule.services.SchedulerMultiTenancyService;

import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@RequestMapping("/workflow-scheduler/v1")
public class WorkflowSchedulerController {
	@Autowired
	private SchedulerMultiTenancyService schedulerService;

	@Autowired
	private TaskProcessorService taskProcessorService;

	@GetMapping("/process/due-tasks")
	public void processDueTasks() {
		log.info("Processing DUE tasks for tenant: {}", YorosisContext.get().getTenantId());
		schedulerService.processDueTasks();
	}

	@GetMapping("/process/scheduled-tasks")
	public void processScheduledTasks() {
		log.info("Processing SCHEDULED tasks for tenant: {}", YorosisContext.get().getTenantId());
		schedulerService.processScheduledTasks();
	}

	@GetMapping("/process/tasks")
	public void processTasks() {
		log.info("Processing TASKS for tenant: {}", YorosisContext.get().getTenantId());
		taskProcessorService.processTasks();
	}

	@GetMapping("/process/reminder-tasks")
	public void processRemainderTask() {
		log.info("Processing REMINDER tasks for tenant: {}", YorosisContext.get().getTenantId());
		schedulerService.getProcessRemainderTask();
	}
}
