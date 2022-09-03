package com.yorosis.yoroflow.db.support.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yorosis.yoroflow.db.support.entities.Customers;

public interface CustomersRepository extends JpaRepository<Customers, UUID> {
	public List<Customers> findByActiveFlagIgnoreCase(String activeFlag);

	public Customers findByTenantIdAndActiveFlagIgnoreCase(String tenantId, String activeFlag);

}
