package com.yorosis.yoroflow.creation.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroapps.vo.TimeZoneVo;
import com.yorosis.yoroflow.creation.service.TimeZoneService;

@RestController
@RequestMapping("/time-zone/v1")
public class TimeZoneController {

	@Autowired
	private TimeZoneService timeZoneService;

	@GetMapping("/get/default-time-zone")
	public TimeZoneVo getDefaultTimeZone() {
		return timeZoneService.getDefaultTimeZone();
	}
}
