package com.yorosis.yoroflow.request.services;

import java.util.Set;

import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Component("yorosisRoleChecker")
public class YorosisRoleChecker {
	public boolean canAllow(String[] roles) {
		log.info("roles:{}", roles);
		YorosisContext context = YorosisContext.get();
		if (context == null || context.getRolesList() == null || context.getRolesList().isEmpty() || roles == null
				|| roles.length == 0) {
			return false;
		}
		Set<String> contextRoles = context.getRolesList();
		log.info("contextRoles:{}", contextRoles);
		for (String role : roles) {
			if (contextRoles.contains(role)) {
				return true;
			}
		}
		return false;
	}
}
