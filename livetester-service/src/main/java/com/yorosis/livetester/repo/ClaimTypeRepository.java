package com.yorosis.livetester.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yorosis.livetester.entities.ClaimType;

public interface ClaimTypeRepository extends JpaRepository<ClaimType, Integer> {

	public List<ClaimType> findAllByOrderByIdDesc();

}
