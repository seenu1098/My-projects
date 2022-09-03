package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.LoginHistory;

public interface LoginHistoryRepository extends JpaRepository<LoginHistory, UUID> {
	
	@Query("select p from LoginHistory p where p.activeFlag = :activeFlag and p.tenantId = :tenantId "
			+ "order by p.craetedDate desc")
	public List<LoginHistory> findLatestLoggedInUserDetails(@Param("activeFlag") String flag,
			@Param("tenantId") String tenantId, Pageable pageable);
}
