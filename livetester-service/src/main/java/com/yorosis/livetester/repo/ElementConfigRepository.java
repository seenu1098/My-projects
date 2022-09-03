package com.yorosis.livetester.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.livetester.entities.ElementsConfiguration;

public interface ElementConfigRepository extends JpaRepository<ElementsConfiguration, Long> {

	public ElementsConfiguration findById(long id);

	public ElementsConfiguration findByElementLabel(String name);

	public List<ElementsConfiguration> findAllByOrderByIdDesc();

	public List<ElementsConfiguration> findAllByApplicableAt(String applicableAt);

	@Query("select count(e) from ElementsConfiguration e where e.elementLabel=:elementLabel")
	public int getLabelCount(@Param("elementLabel") String elementLabel);

	@Query("select e from ElementsConfiguration e where e.fieldName=:fieldName and e.applicableAt=:applicableAt")
	public ElementsConfiguration getFieldName(@Param("fieldName") String fieldName, @Param("applicableAt") String applicableAt);
}
