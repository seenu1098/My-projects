package com.yorosis.yoroflow.controller;

import java.io.IOException;
import java.text.ParseException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroapps.vo.ReactiveOrInactiveUsers;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.services.InactiveAndReactiveUserService;

@RestController
@RequestMapping("/activate-user/v1")
public class ReactiveAndInactiveUserController {

	@Autowired
	private InactiveAndReactiveUserService inactiveAndReactiveUserService;

	@PostMapping("/reactive-users")
	public ResponseStringVO saveReactiveUsers(@RequestBody ReactiveOrInactiveUsers reactiveOrInactiveUsers)
			throws IOException, ParseException {
		return inactiveAndReactiveUserService.saveReactiveUser(reactiveOrInactiveUsers);
	}

	@PostMapping("/inactive-users")
	public ResponseStringVO saveInactiveUsers(@RequestBody ReactiveOrInactiveUsers reactiveOrInactiveUsers)
			throws IOException, ParseException {
		return inactiveAndReactiveUserService.saveInactiveUser(reactiveOrInactiveUsers);
	}
}
