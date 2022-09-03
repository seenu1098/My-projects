package com.yorosis.livetester.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.livetester.entities.LookupData;

public interface LookupDataRepository extends JpaRepository<LookupData, Long> {
	@Query("select l from LookupData l where l.type = :type")
	public List<LookupData> getLookUpdataByType(@Param("type") String type);

	public LookupData findByCodeAndType(@Param("code") String code, @Param("type") String type);

	public List<LookupData> findAllByOrderByIdDesc();
}
