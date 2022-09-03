package com.yorosis.yoroflow.creation.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yorosis.yoroapps.entities.UserPermission;

public interface UserPermissionRepository extends JpaRepository<UserPermission, UUID> {

}
