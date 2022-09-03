package com.yorosis.yoroflow.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroflow.entities.MetricsData;

public interface MetricDataRepository extends JpaRepository<MetricsData, UUID> {

	@Query("select count(p) from MetricsData p where p.metricType= 'sms' and MONTH(p.sentTime) =:month and YEAR(p.sentTime) =:year and p.tenantId=:tenantId")
	public Long getSmsCounts(@Param("tenantId") String tenantId, @Param("month") int month, @Param("year") int year);

}
