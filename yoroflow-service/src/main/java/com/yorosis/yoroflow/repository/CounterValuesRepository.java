package com.yorosis.yoroflow.repository;

import java.util.UUID;

import javax.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroflow.entities.CounterValues;

public interface CounterValuesRepository extends JpaRepository<CounterValues, UUID> {

//	@Lock(LockModeType.PESSIMISTIC_WRITE)
//	@Query("select p from CounterValues p where p.key = :key and p.tenantId = :tenantId and p.activeFlag=:activeFlag")
//	public CounterValues findByProcessDefinitionId(@Param("key") String key,
//			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("select p from CounterValues p where p.key = :key and p.tenantId = :tenantId and p.activeFlag=:activeFlag")
	public CounterValues findByProcessDefinitionKey(@Param("key") String key, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

}
