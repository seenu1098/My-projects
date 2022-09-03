package com.yorosis.yoroflow.creation.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yorosis.yoroapps.entities.UserOTPRecoveryCodes;

public interface RecoveryCodesRepository extends JpaRepository<UserOTPRecoveryCodes, UUID> {

}
