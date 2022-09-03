package com.yorosis.authnz.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.yorosis.yoroapps.entities.YorosisSettings;

@Repository
public interface YoroflowSettingsRepository extends JpaRepository<YorosisSettings, UUID> {

	@Query("select p.keyValue from YorosisSettings p where p.keyName = :keyName")
	public String findByKeyName(@Param("keyName") String keyName);

}
