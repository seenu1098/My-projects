package com.yorosis.yoroflow.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroflow.entities.YoroDocumentsSecurity;

public interface YoroDocumentsSecurityRepository extends JpaRepository<YoroDocumentsSecurity, UUID> {

	@Query("select u from YoroDocumentsSecurity u where u.yoroGroups.id in :groupId and u.yoroDocuments.id = :docId and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<YoroDocumentsSecurity> getListBasedonGroupIdAndWorkspaceIdTenantIdAndActiveFlag(
			@Param("groupId") List<UUID> groupId, @Param("docId") UUID docId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select u from YoroDocumentsSecurity u where u.users.userId in :userId and u.yoroDocuments.id = :docId and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<YoroDocumentsSecurity> getListBasedonUserIdAndTenantIdAndActiveFlagForDelete(
			@Param("userId") List<UUID> userId, @Param("docId") UUID docId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select u.users.userId from YoroDocumentsSecurity u where u.users.userId is not null and u.yoroDocuments.id = :docId and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<UUID> getListBasedonUserIdAndTenantIdAndActiveFlag(@Param("docId") UUID docId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);
	
	@Query("select u from YoroDocumentsSecurity u where u.yoroGroups.id is not null and u.yoroDocuments.id = :docId and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<YoroDocumentsSecurity> getListBasedonGroupIdAndTenantIdAndActiveFlag(@Param("docId") UUID docId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);
	
	@Query("select u from YoroDocumentsSecurity u where u.yoroGroups.id is not null and u.readAllowed =:activeFlag and u.editAllowed = 'N' and u.yoroDocuments.id = :docId and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<YoroDocumentsSecurity> getListBasedonGroupIdAndTenantIdAndActiveFlagForRead(@Param("docId") UUID docId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);
	
	@Query("select u from YoroDocumentsSecurity u where u.yoroGroups.id is not null and u.editAllowed =:activeFlag and u.yoroDocuments.id = :docId and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<YoroDocumentsSecurity> getListBasedonGroupIdAndTenantIdAndActiveFlagForUpdate(@Param("docId") UUID docId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);
	
	@Query("select u from YoroDocumentsSecurity u where u.users.userId in :userId and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<YoroDocumentsSecurity> getListBasedonUserIdAndTenantIdAndActiveFlag(
			@Param("userId") List<UUID> userId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);
}
