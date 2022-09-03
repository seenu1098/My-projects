package com.yorosis.yoroflow.creation.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yorosis.yoroapps.entities.Themes;

public interface ThemesRepository extends JpaRepository<Themes, UUID> {

	public Themes findByThemeIdAndActiveFlagAndTenantIdIgnoreCase(String themeId, String activeFlag, String tenantId);

}
