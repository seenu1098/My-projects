package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.GridColumns;

public interface GridColumnRepository extends JpaRepository<GridColumns, UUID> {
	@Query("select c from GridColumns c where c.grids.activeFlag = :activeFlag and c.activeFlag = :activeFlag and c.tenantId = :tenantId order by c.columnSequenceNo asc")
	public List<GridColumns> getGridColumnList(Pageable pageable, @Param("activeFlag") String flag, @Param("tenantId") String tenantId);

	@Query("select count(c) from GridColumns c where c.grids.activeFlag = :activeFlag and c.activeFlag = :activeFlag and c.tenantId = :tenantId")
	public String getTotalColumnCount(@Param("activeFlag") String flag, @Param("tenantId") String tenantId);

	@Query("select c from GridColumns c where  c.grids.gridName = :gridName and c.grids.activeFlag = :activeFlag and c.activeFlag = :activeFlag and c.tenantId = :tenantId order by c.columnSequenceNo asc")
	public List<GridColumns> getGridColumns(@Param("gridName") String name, @Param("activeFlag") String flag, @Param("tenantId") String tenantId);
}
