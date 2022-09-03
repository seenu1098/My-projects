package com.yorosis.taskboard.controller;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.taskboard.services.TaskboardService;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@RequestMapping("/taskboard-scheduler/v1")
public class TaskBoardSchedulerController {

	@Autowired
	private TaskboardService taskboardService;

	@GetMapping("/process/due-tasks/{tenantId}")
	@Async
	public void processDueTasks(@PathVariable("tenantId") String tenantId,
			@RequestHeader("Authorization") String token) {
		try {
			String strippedToken = StringUtils.remove(token, "Bearer");
			YorosisContext.set(YorosisContext.builder().tenantId(tenantId).token(strippedToken).build());
			log.info("Triggering DUE tasks for tenant: {}", YorosisContext.get().getTenantId());
			taskboardService.processTasksAfterDueDate();
			log.info("Triggered After Due task");
		} finally {
			YorosisContext.clear();
		}

	}

}
