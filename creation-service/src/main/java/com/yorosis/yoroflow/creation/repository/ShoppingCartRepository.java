package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.yorosis.yoroapps.entities.ShoppingCart;

@Repository
public interface ShoppingCartRepository extends JpaRepository<ShoppingCart, UUID> {

	@Query("select s from ShoppingCart s where s.cartName=:cartName and s.tenantId = :tenantId and s.activeFlag=:activeFlag")
	public ShoppingCart getShoppingCartByName(@Param("cartName") String cartName, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select s from ShoppingCart s where s.tenantId = :tenantId and s.activeFlag=:activeFlag")
	public List<ShoppingCart> getShoppingCartList(@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);
}
