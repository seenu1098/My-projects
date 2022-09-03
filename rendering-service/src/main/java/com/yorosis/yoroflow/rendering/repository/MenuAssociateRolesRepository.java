package com.yorosis.yoroflow.rendering.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yorosis.yoroapps.entities.MenuAssociateRoles;

public interface MenuAssociateRolesRepository extends JpaRepository<MenuAssociateRoles, UUID> {

}
