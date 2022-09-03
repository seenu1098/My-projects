package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.Page;

public interface PageRepository extends JpaRepository<Page, UUID> {

	@Query("select count(p) from Page p where upper(p.pageName)=:pageName and p.activeFlag=:activeFlag and p.tenantId=:tenantId")
	public int findByPageNameAndTenantId(@Param("pageName") String pageName, @Param("activeFlag") String activeFlag,
			@Param("tenantId") String tenantId);

	@Query("select p from Page p where p.workspaceId =:workspaceId and p.activeFlag=:activeFlag  and p.tenantId=:tenantId order by p.id desc")
	public List<Page> getAllPageNames(@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("workspaceId") UUID workspaceId);

	@Query("select p from Page p where p.activeFlag=:activeFlag  and p.tenantId=:tenantId order by p.id desc")
	public List<Page> getAllPageNames(@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select count(p) from Page p where p.workspaceId =:workspaceId and p.activeFlag=:activeFlag and p.tenantId=:tenantId")
	public String getTotalColumnCount(@Param("activeFlag") String activeFlag, @Param("tenantId") String tenantId,
			@Param("workspaceId") UUID workspaceId);

	@Query("select p from Page p where p.workspaceId =:workspaceId and p.activeFlag=:activeFlag and p.tenantId=:tenantId")
	public List<Page> getPageList(Pageable pageable, @Param("activeFlag") String activeFlag,
			@Param("tenantId") String tenantId, @Param("workspaceId") UUID workspaceId);

	public Page findByPageIdAndTenantIdAndActiveFlag(String pageId, String tenantId, String activeFlag);

	public Page findByPageNameAndTenantIdAndActiveFlag(String pageName, String tenantId, String activeFlag);

	public Page findByPageNameAndVersionAndTenantIdAndActiveFlag(String pageName, Long version, String tenantId,
			String activeFlag);

	public List<Page> findByPageIdAndVersionAndTenantIdAndActiveFlag(String pageId, Long version, String tenantId,
			String activeFlag);

	public Page findByIdAndTenantIdAndActiveFlag(UUID id, String tenantId, String activeFlag);

	public List<Page> findByApplicationIdAndTenantIdAndActiveFlag(UUID id, String tenantId, String activeFlag);

	@Query("select p from Page p where p.pageId=:pageId and p.activeFlag=:activeFlag and p.tenantId=:tenantId order by p.version desc")
	public List<Page> getPageId(@Param("pageId") String pageId, @Param("activeFlag") String activeFlag,
			@Param("tenantId") String tenantId);

	@Query("select p from Page p where p.pageId=:pageId and p.activeFlag=:activeFlag and p.tenantId=:tenantId and p.layoutType=:layoutType order by p.version desc")
	public List<Page> getPageId(@Param("pageId") String pageId, @Param("activeFlag") String activeFlag,
			@Param("tenantId") String tenantId, @Param("layoutType") String layoutType);

	@Query("select p from Page p where p.workspaceId =:workspaceId and p.activeFlag=:activeFlag and p.tenantId=:tenantId and p.layoutType=:layoutType and p.version='1' order by p.pageId asc")
	public List<Page> getPageName(@Param("activeFlag") String activeFlag, @Param("tenantId") String tenantId,
			@Param("layoutType") String layoutType, @Param("workspaceId") UUID workspaceId);

	@Query("select p from Page p where p.workspaceId =:workspaceId and p.activeFlag=:activeFlag and p.tenantId=:tenantId and p.layoutType=:layoutType order by p.pageId asc")
	public List<Page> getPageNameWithLayoutType(@Param("activeFlag") String activeFlag,
			@Param("tenantId") String tenantId, @Param("layoutType") String layoutType,
			@Param("workspaceId") UUID workspaceId);

	@Query("select pdp.page from PagePermissions pdp where pdp.page.workspaceId =:workspaceId and pdp.page.tenantId = :tenantId and pdp.yoroGroups.id IN :groupId and pdp.page.activeFlag=:activeFlag")
	public Set<Page> getpageNamesBasedOnUser(@Param("tenantId") String tenantId,
			@Param("groupId") List<UUID> listGroupId, @Param("activeFlag") String activeFlag,
			@Param("workspaceId") UUID workspaceId);

	@Query("select p from Page p where p.workspaceId =:workspaceId and p.activeFlag=:activeFlag and p.tenantId=:tenantId and p.version='1'")
	public List<Page> getPageNames(@Param("activeFlag") String activeFlag, @Param("tenantId") String tenantId,
			@Param("workspaceId") UUID workspaceId);

	@Query("select p.pageId from Page p where p.activeFlag=:activeFlag and p.tenantId=:tenantId and p.version='1'")
	public List<String> getPageId(@Param("activeFlag") String activeFlag, @Param("tenantId") String tenantId);

	@Query("select p.pageId from Page p where p.workspaceId =:workspaceId and p.activeFlag=:activeFlag and p.tenantId=:tenantId and p.version='1'")
	public List<String> getPageIdByWorkspaceId(@Param("activeFlag") String activeFlag,
			@Param("tenantId") String tenantId, @Param("workspaceId") UUID workspaceId);

	@Query("select p from Page p where p.id in :id and p.activeFlag=:activeFlag and p.tenantId=:tenantId order by p.version desc")
	public List<Page> getPageByIdList(@Param("id") List<UUID> id, @Param("activeFlag") String activeFlag,
			@Param("tenantId") String tenantId);
}
