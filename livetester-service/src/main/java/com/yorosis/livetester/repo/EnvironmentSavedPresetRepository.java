package com.yorosis.livetester.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.livetester.entities.EnvironmentSavedPreset;

public interface EnvironmentSavedPresetRepository extends JpaRepository<EnvironmentSavedPreset, Long> {

	@Query("select e  from EnvironmentSavedPreset e where e.identifier=:identifier and e.environment.id=:id and e.type=:type ")
	public EnvironmentSavedPreset findByIdentifier(@Param("identifier") String identifier, @Param("id") Long id, @Param("type") String type);

	@Query("select e from EnvironmentSavedPreset e where  e.environment.id=:envoironmentId")
	public List<EnvironmentSavedPreset> getEnvironmentSavedPreset(@Param("envoironmentId") Long envoironmentId);

}
