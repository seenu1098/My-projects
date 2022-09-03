package com.yorosis.livetester.controller;

import java.util.Base64;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.livetester.service.AuthenticationService;
import com.yorosis.livetester.vo.AuthToken;
import com.yorosis.livetester.vo.ResultVO;
import com.yorosis.livetester.vo.SigninUserVO;

@RestController
@CrossOrigin
@RequestMapping("/api/v1")
public class ApiController {
	private static final String USERNAME = "admin@yorosis.com";

	@Autowired
	private AuthenticationService authenticationService;

	@GetMapping("/user/externalToken/verify")
	public ResultVO login(@RequestHeader(required = true, value = "Authorization") String token) {

		if (StringUtils.isNotBlank(token)) {
			String pwd = new String(Base64.getDecoder().decode("cXdlMTIz"));
			SigninUserVO signinUserVO = SigninUserVO.builder().username(USERNAME).password(pwd).build();
			AuthToken authenticateUser = authenticationService.authenticateUser(signinUserVO);
			if (authenticateUser != null && StringUtils.isNotBlank(authenticateUser.getToken())) {
				return ResultVO.builder().message("External Token Valid!").result("success")
						.token(authenticateUser.getToken()).build();
			} else {
				return ResultVO.builder().message("Invalid Token!").result("error").build();
			}
		}
		return ResultVO.builder().message("Invalid Token!").result("error").build();
	}
}
