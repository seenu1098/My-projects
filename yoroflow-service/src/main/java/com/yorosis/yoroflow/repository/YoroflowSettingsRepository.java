package com.yorosis.yoroflow.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.yorosis.yoroflow.entities.YorosisSettings;

public interface YoroflowSettingsRepository extends JpaRepository<YorosisSettings, UUID> {
	
	@Query("select p.keyValue from YorosisSettings p where p.keyName='oauth_url'")
	public String getOauthUrl();
}
