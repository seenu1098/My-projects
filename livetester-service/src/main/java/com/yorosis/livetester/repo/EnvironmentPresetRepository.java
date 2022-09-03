
package com.yorosis.livetester.repo;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.livetester.entities.EnvironmentPreset;

public interface EnvironmentPresetRepository extends JpaRepository<EnvironmentPreset, Long> {
	//@Param("envName") String envName, 
	@Query("select e from EnvironmentPreset e where e.key=:key and e.environment.id = :envId and e.type=:type and e.activeFlag=:activeFlag")
	public EnvironmentPreset findByKey(@Param("key") String key, @Param("envId") long envId, @Param("type") String type, @Param("activeFlag") String activeFlag);

	@Query("select count(e) from EnvironmentPreset e where e.key=:key and e.environment.id = :envId and e.type=:type and e.activeFlag=:activeFlag")
	public int getCountOfKey(@Param("key") String key, @Param("envId") long envId, @Param("type") String type, @Param("activeFlag") String activeFlag);

	@Query("select e from EnvironmentPreset e where e.type=:type and e.activeFlag=:activeFlag")
	public List<EnvironmentPreset> getEnvironmentPresetList(Pageable pageable, @Param("type") String type, @Param("activeFlag") String activeFlag);

	@Query("select e from EnvironmentPreset e where e.type=:type and e.environment.id=:id and e.activeFlag=:activeFlag")
	public List<EnvironmentPreset> getJsonDetail(@Param("id") Long id, @Param("type") String type, @Param("activeFlag") String activeFlag);

	@Query("select count(e) from EnvironmentPreset e where e.type=:type and e.activeFlag=:activeFlag")
	public String getTotalCountForGrid(@Param("type") String type, @Param("activeFlag") String activeFlag);

	public EnvironmentPreset findById(long id);

	@Query("select e from EnvironmentPreset e where e.key=:key and e.type=:type and e.environment.id=:id and e.activeFlag=:activeFlag ")
	public EnvironmentPreset getKey(@Param("key") String key, @Param("id") Long id, @Param("type") String type, @Param("activeFlag") String activeFlag);
}
