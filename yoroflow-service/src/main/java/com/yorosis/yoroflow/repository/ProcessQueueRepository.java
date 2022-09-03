package com.yorosis.yoroflow.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import javax.persistence.LockModeType;
import javax.persistence.QueryHint;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroflow.entities.ProcessQueue;

public interface ProcessQueueRepository extends JpaRepository<ProcessQueue, UUID> {

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@QueryHints({ @QueryHint(name = "javax.persistence.lock.timeout", value = "5000") })
	@Query("select p from ProcessQueue p where p.status = :status and p.createdTimestamp <= :timestamp order by p.createdTimestamp")
	public List<ProcessQueue> getRecordsForProcessing(@Param("status") String status, @Param("timestamp") LocalDateTime timestamp, Pageable pageRequest);
}