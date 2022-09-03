package com.yorosis.yoroflow.rendering.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.MenuDetails;

public interface MenuDetailsRepository extends JpaRepository<MenuDetails, UUID> {

	@Query("select c from MenuDetails c where c.id = :id and c.tenantId = :tenantId and c.activeFlag = :activeFlag")
	public MenuDetails getMenuInfo(@Param("id") UUID id, @Param("tenantId") String tenantId,
			@Param("activeFlag") String flag);

	@Query("select c from MenuDetails c where c.menu.menuId = :id and c.tenantId = :tenantId and c.activeFlag = :activeFlag and c.parentMenuId is null")
	public List<MenuDetails> getAllMenuDetailsList(@Param("id") UUID menuId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String flag);

	@Query("select c from MenuDetails c where c.parentMenuId = :menuId and c.tenantId = :tenantId and c.activeFlag = :activeFlag")
	public List<MenuDetails> getParentMenuList(@Param("menuId") UUID parentMenu, @Param("tenantId") String tenantId,
			@Param("activeFlag") String flag);

	@Query("select c from MenuDetails c where (c.menuName IN :menuName) and c.tenantId = :tenantId and c.activeFlag = :activeFlag order by c.menuName asc")
	public List<MenuDetails> getMenuList(@Param("menuName") List<String> menuName, @Param("tenantId") String tenantId,
			@Param("activeFlag") String flag);

	@Query(value = "select * from menu_details p where (p.menu_id=:menuId "
			+ "and p.active_flag = :activeFlag and p.tenant_id =:tenantId and p.parent_menu_id is null and "
			+ "exists (select * from menu_details_associate_roles x where (x.menu_details_id = p.id and "
			+ "(x.role_id in :roleIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))", nativeQuery = true)
	public List<MenuDetails> getMenuDetailsByRoles(@Param("menuId") UUID menuId,
			@Param("roleIdList") List<UUID> roleIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query(value = "select * from menu_details p where (p.menu_id=:menuId "
			+ "and p.active_flag = :activeFlag and p.tenant_id =:tenantId and p.parent_menu_id =:parentMenuId and "
			+ "exists (select * from menu_details_associate_roles x where (x.menu_details_id = p.id and "
			+ "(x.role_id in :roleIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))", nativeQuery = true)
	public List<MenuDetails> getParentMenuListByRoles(@Param("menuId") UUID menuId,
			@Param("parentMenuId") UUID parentMenuId, @Param("roleIdList") List<UUID> roleIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);
}
