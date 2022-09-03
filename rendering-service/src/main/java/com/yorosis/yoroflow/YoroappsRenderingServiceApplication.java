package com.yorosis.yoroflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.openfeign.EnableFeignClients;

import com.ulisesbocchio.jasyptspringboot.annotation.EnableEncryptableProperties;

@SpringBootApplication
@EntityScan(basePackages = { "com.yorosis.yoroapps.entities" })
@EnableFeignClients
@EnableEncryptableProperties
public class YoroappsRenderingServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(YoroappsRenderingServiceApplication.class, args);
	}
}