package com.yorosis.authnz;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

import com.ulisesbocchio.jasyptspringboot.annotation.EnableEncryptableProperties;

@SpringBootApplication(scanBasePackages = { "com.yorosis.authnz", "com.yorosis.yoroflow" })
@EntityScan(basePackages = { "com.yorosis.yoroapps.entities" })
@EnableEncryptableProperties
public class AuthnzServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AuthnzServiceApplication.class, args);
	}

}