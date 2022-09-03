package com.yorosis.yoroflow.rendering.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.Page;

public interface PageRepository extends JpaRepository<Page, UUID> {

	@Query("select count(p) from Page p where upper(p.pageName)=:pageName and p.activeFlag=:activeFlag and p.tenantId=:tenantId")
	public int findByPageName(@Param("pageName") String pageName, @Param("activeFlag") String activeFlag,
			@Param("tenantId") String tenantId);

	@Query("select p from Page p where p.workspaceId =:workspaceId and p.activeFlag='Y' and p.tenantId=:tenantId order by p.id desc")
	public List<Page> getAllPageNames(@Param("tenantId") String tenantId, @Param("workspaceId") UUID workspaceId);

	@Query("select count(p) from Page p where p.workspaceId =:workspaceId and p.activeFlag=:activeFlag and p.tenantId=:tenantId")
	public String getTotalColumnCount(@Param("activeFlag") String activeFlag, @Param("tenantId") String tenantId, @Param("workspaceId") UUID workspaceId);

	@Query("select p from Page p where p.workspaceId =:workspaceId and p.activeFlag=:activeFlag and p.tenantId=:tenantId")
	public List<Page> getPageList(Pageable pageable, @Param("activeFlag") String activeFlag,
			@Param("tenantId") String tenantId, @Param("workspaceId") UUID workspaceId);

	public Page findByPageIdAndVersionAndTenantIdAndActiveFlag(String pageId, Long version, String tenantId,
			String activeFlag);

	public Page findByPageIdAndVersionAndLayoutTypeAndTenantIdAndActiveFlag(String pageId, Long version,
			String layoutType, String tenantId, String activeFlag);

	public Page findByIdAndTenantIdAndActiveFlag(UUID id, String tenantId, String activeFlag);

	public List<Page> findByPageIdInAndTenantIdAndActiveFlag(List<String> pageId, String tenantId, String activeFlag);

	@Query("select p from Page p where p.pageId=:pageId and p.activeFlag=:activeFlag and p.tenantId=:tenantId")
	public List<Page> getPageId(@Param("pageId") String pageId, @Param("activeFlag") String activeFlag,
			@Param("tenantId") String tenantId);

	@Query("select p from Page p where p.pageId=:pageId and p.layoutType=:layoutType and p.activeFlag=:activeFlag and p.tenantId=:tenantId order by p.version desc")
	public List<Page> getPageId(@Param("pageId") String pageId, @Param("layoutType") String layoutType,
			@Param("activeFlag") String activeFlag, @Param("tenantId") String tenantId);

	@Query("select p from Page p where p.pageId=:pageId and p.version=:version and p.activeFlag=:activeFlag and p.tenantId=:tenantId")
	public Page getPage(@Param("pageId") String pageId, @Param("version") Long version,
			@Param("activeFlag") String activeFlag, @Param("tenantId") String tenantId);
	
	@Query("select p from Page p where p.pageId IN :pageId and p.activeFlag=:activeFlag and p.tenantId=:tenantId")
	public List<Page> getPageListByPageId(@Param("pageId") List<String> pageId,
			@Param("activeFlag") String activeFlag, @Param("tenantId") String tenantId);
}
