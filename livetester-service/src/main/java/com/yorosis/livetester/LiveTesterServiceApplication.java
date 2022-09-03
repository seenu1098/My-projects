package com.yorosis.livetester;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class LiveTesterServiceApplication {
	public static void main(String[] args) {
		SpringApplication.run(LiveTesterServiceApplication.class, args);
	}
}
