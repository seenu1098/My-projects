package com.yorosis.yoroflow.config;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.yorosis.yoroflow.models.TaskType;
import com.yorosis.yoroflow.service.type.TaskService;

@Configuration
public class TaskInjectorConfig {

	@Bean
	public Map<TaskType, TaskService> injectTaskTypse(List<TaskService> listTaskServices) {
		Map<TaskType, TaskService> mapTaskServices = new EnumMap<>(TaskType.class);
		listTaskServices.forEach(s -> mapTaskServices.put(s.getTaskType(), s));
		return mapTaskServices;

	}

}
