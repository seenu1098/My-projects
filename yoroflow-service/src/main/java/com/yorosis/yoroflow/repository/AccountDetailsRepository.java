package com.yorosis.yoroflow.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yorosis.yoroflow.entities.AccountDetails;

public interface AccountDetailsRepository extends JpaRepository<AccountDetails, UUID> {

}
