package com.yorosis.taskboard.services.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import com.yorosis.taskboard.models.NotificationsVO;
import com.yorosis.taskboard.models.ResponseStringVO;

@FeignClient(name = "messaging-service", url = "${messaging-service.base.url}")
public interface MessagingServiceClient {

	@PostMapping(value = "/notification/v1/save", consumes = "application/json")
	public ResponseStringVO saveNotifications(@RequestHeader("Authorization") String authorizationToken, @RequestBody NotificationsVO notificationsVO);
}
