package com.yorosis.livetester.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yorosis.livetester.entities.TestcaseCategories;

public interface ClaimsTestcaseGroupRepository extends JpaRepository<TestcaseCategories, Long> {

}
