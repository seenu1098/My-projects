package com.yorosis.yoroflow.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroapps.vo.AccountDetailsVO;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.services.AccountDetailsService;

@RestController
@RequestMapping("/account/v1/")
public class AccountDetailsController {

	@Autowired
	private AccountDetailsService accountDetailsService;

	@PostMapping("public/send-email/save")
	public ResponseStringVO saveAccountDetails(@RequestBody AccountDetailsVO accountDetailsVO) {
		return accountDetailsService.handleAccountCreationEmail(accountDetailsVO);
	}
}
