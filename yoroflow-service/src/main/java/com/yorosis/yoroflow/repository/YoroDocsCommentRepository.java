package com.yorosis.yoroflow.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroflow.entities.YoroDocumentComment;

public interface YoroDocsCommentRepository extends JpaRepository<YoroDocumentComment, UUID> {

	@Query("select c from YoroDocumentComment c where  c.yoroDocuments.id = :id and c.yoroDocuments.activeFlag = :activeFlag and c.yoroDocuments.tenantId = :tenantId"
			+ " and c.activeFlag = :activeFlag and c.tenantId = :tenantId order by c.createdOn asc")
	public List<YoroDocumentComment> getDocsCommentsById(@Param("id") UUID id, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);
	
	@Query("select c from YoroDocumentComment c where c.id = :id "
			+ " and c.activeFlag = :activeFlag and c.tenantId = :tenantId")
	public YoroDocumentComment getDocsCommentsByCommentId(@Param("id") UUID id, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

}
