package com.yorosis.yoroflow.rendering.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/health/v1/")
public class HealthCheckController {
	@GetMapping("/ping")
	public String ping() {
		return "pong";
	}
}
