package com.yorosis.yoroflow.creation.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.AccountCreationDetails;

public interface AccountCreationDetailsRepository extends JpaRepository<AccountCreationDetails, UUID> {

	@Query("select c from AccountCreationDetails c where  c.accessToken = :accessToken and c.activeFlag = :activeFlag")
	public AccountCreationDetails getAccountCreationDetailsByAccountId(@Param("accessToken") String accessToken,
			@Param("activeFlag") String activeFlag);

	@Query("select count(c) from AccountCreationDetails c where  c.email = :email")
	public int getAccountCreationDetailsByEmail(@Param("email") String email);
}
