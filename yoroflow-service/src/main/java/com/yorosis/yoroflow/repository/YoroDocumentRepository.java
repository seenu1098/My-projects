package com.yorosis.yoroflow.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.yorosis.yoroflow.entities.YoroDocuments;

@Repository
public interface YoroDocumentRepository extends JpaRepository<YoroDocuments, UUID> {

	@Query("select u from YoroDocuments u where u.id = :id and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public YoroDocuments getBasedonIdAndTenantIdAndActiveFlag(@Param("id") UUID id, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select u from YoroDocuments u where u.parentDocumentId = :id and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<YoroDocuments> getBasedonParentIdAndTenantIdAndActiveFlag(@Param("id") UUID id,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select u from YoroDocuments u where u.workspaceId =:workspaceId and u.parentDocumentId is null and u.tenantId = :tenantId and u.activeFlag=:activeFlag and "
			+ "exists (select s from YoroDocumentsSecurity s where s.yoroDocuments.id = u.id and (s.users.userId =:userId or s.yoroGroups.groupId in :groupIdList)) order by u.documentKey asc")
	public List<YoroDocuments> getListTenantIdAndActiveFlag(@Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("userId") UUID userId,
			@Param("groupIdList") List<UUID> groupIdList, @Param("workspaceId") UUID workspaceId);

	@Query("select u from YoroDocuments u where u.workspaceId =:workspaceId and u.tenantId = :tenantId and u.activeFlag=:activeFlag and "
			+ "exists (select s from YoroDocumentsSecurity s where s.yoroDocuments.id = u.id and (s.users.userId =:userId or s.yoroGroups.groupId in :groupIdList)) order by u.documentKey asc")
	public List<YoroDocuments> getListTenantIdAndActiveFlags(@Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("userId") UUID userId,
			@Param("groupIdList") List<UUID> groupIdList, @Param("workspaceId") UUID workspaceId);

	@Query("select u from YoroDocuments u where u.parentDocumentId = :parentDocsId and u.tenantId = :tenantId and u.activeFlag=:activeFlag and "
			+ "exists (select s from YoroDocumentsSecurity s where s.yoroDocuments.id = u.id and (s.users.userId =:userId or s.yoroGroups.groupId in :groupIdList)) order by u.documentKey asc")
	public List<YoroDocuments> getYoroDocsByParentComments(@Param("parentDocsId") UUID parentDocsId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag, @Param("userId") UUID userId,
			@Param("groupIdList") List<UUID> groupIdList);

	@Query("select u.workspaceId, count(u) from YoroDocuments u where u.tenantId = :tenantId and u.activeFlag=:activeFlag and "
			+ " exists (select s from YoroDocumentsSecurity s where s.yoroDocuments.id = u.id and (s.users.userId =:userId or s.yoroGroups.groupId in :groupIdList))"
			+ " GROUP BY u.workspaceId")
	public List<Object[]> getDocumentsCountByWorkspaceId(@Param("tenantId") String tenantId,
			@Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList,
			@Param("activeFlag") String activeFlag);

	@Query("select u.workspaceId, count(u) from YoroDocuments u where u.tenantId = :tenantId and u.activeFlag=:activeFlag "
			+ " GROUP BY u.workspaceId")
	public List<Object[]> getAllDocumentsCountByWorkspaceId(@Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select count(u) from YoroDocuments u where u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public Long getTotalDocumentsCount(@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select u from YoroDocuments u where u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<YoroDocuments> getAllDocumentsList(@Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query(value = "select cast(u.document_id as varchar), u.document_name, yw.workspace_name from yoro_documents as u left join yoro_workspace "
			+ "as yw on yw.workspace_id = u.workspace_id and yw.active_flag =:activeFlag and "
			+ "yw.tenant_id =:tenantId where u.active_flag =:activeFlag and u.tenant_id =:tenantId", nativeQuery = true)
	public List<Object[]> getDocumentAndWorkspaceNamesList(@Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select u from YoroDocuments u where u.id not in :docsIdList and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<YoroDocuments> docsToInactivate(@Param("docsIdList") List<UUID> docsIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);
}
